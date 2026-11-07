import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../config/apiBase";
import { notify } from "../lib/notify";
import { playEduSound } from "./eduSound";
import { GemIcon } from "./gems";
import { localizeStepTitle, useEduText } from "./eduText";
import { PersonaAvatar } from "./EduPersona";
import QuizQuestion from "../components/member/hugoCoder/QuizQuestion";
import "../styles/hugoCoderLearning.css";

async function api(path, body) {
  const res = await fetch(`${API_BASE}${path}`, {
    method: body ? "POST" : "GET",
    credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || res.statusText);
  return data;
}

/**
 * Luyện tập: nhiệm vụ hôm nay, nên ôn hôm nay, sổ câu sai, thách đấu bạn bè.
 * Máy chủ tính hết (server/services/practice.js); trang này chỉ vẽ và gửi câu trả lời.
 */
export default function EduPractice({ onLearnerUpdate }) {
  const { t, lang } = useEduText();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [friends, setFriends] = useState([]);
  const [run, setRun] = useState(null);
  const [busy, setBusy] = useState(false);
  const stepTitle = (item) => localizeStepTitle(item.title, item.index, lang, item.course);

  const load = useCallback(() => api("/practice").then((next) => { setData(next); setFailed(false); }).catch(() => setFailed(true)), []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => { api("/social").then((s) => setFriends((s.friends || []).filter((f) => !f.me))).catch(() => {}); }, []);

  const act = async (fn) => {
    setBusy(true);
    try { await fn(); } catch (error) { notify.error(error.message || t("practice.failed")); } finally { setBusy(false); }
  };

  const claim = () => act(async () => {
    const r = await api("/practice/quests/claim", {});
    onLearnerUpdate?.({ gems: r.balance });
    playEduSound("coin");
    notify.success(t("practice.claimedToast", { gems: r.gems }));
    await load();
  });

  const startMistakes = () => act(async () => {
    const { items } = await api(`/practice/mistakes?lang=${lang}`);
    if (!items.length) return;
    setRun({
      title: t("practice.mistakesTitle"),
      items: items.map((item) => ({ ...item, label: stepTitle(item) })),
      submit: async (answers) => {
        const r = await api("/practice/mistakes", { answers: items.map((item, k) => ({ stepId: item.stepId, i: item.i, answer: answers[k] })) });
        return { ...r, summary: t("practice.mistakesDone", { correct: r.correct, total: r.total, left: r.left }) };
      },
    });
  });

  const challenge = (code) => act(async () => {
    await api("/practice/challenges", { code });
    notify.success(t("practice.challengeSent"));
    await load();
  });

  const play = (c) => act(async () => {
    const quiz = await api(`/practice/challenges/${c.id}/quiz?lang=${lang}`);
    setRun({
      title: `${t("practice.challengeTitle")} · ${stepTitle(c)}`,
      items: quiz.questions.map((question) => ({ question })),
      submit: async (answers) => {
        const r = await api(`/practice/challenges/${c.id}`, { answers });
        if (Number.isFinite(r.balance)) onLearnerUpdate?.({ gems: r.balance });
        const vars = { mine: r.mine, theirs: r.theirs, name: c.opponent.name };
        const line = r.theirs === null ? t("practice.resultWait", { score: r.mine })
          : t(r.mine > r.theirs ? "practice.resultWon" : r.mine < r.theirs ? "practice.resultLost" : "practice.resultTie", vars);
        return { ...r, summary: r.reward ? `${line} ${t("practice.gemsLine", { gems: r.reward })}` : line };
      },
    });
  });

  if (run) return <QuizRun {...run} onClose={() => { setRun(null); load(); }} />;
  if (failed) return <section className="edu-page"><p>{t("practice.failed")}</p></section>;
  if (!data) return <section className="edu-page"><p className="practice-muted">…</p></section>;

  const { quests, reviews, mistakes, challenges } = data;
  return (
    <section className="edu-page practice">
      <h1 className="edu-page-title">{t("practice.title")}</h1>

      <div className="edu-card">
        <h2 className="practice-h">{t("practice.questsTitle")}</h2>
        <ul className="practice-quests">
          {quests.list.map((q) => (
            <li key={q.id} className={q.done >= q.goal ? "is-done" : ""}>
              <span>{t(`practice.quest.${q.id}`)}</span>
              <b>{q.done}/{q.goal}</b>
              <i style={{ "--v": q.done / q.goal }} />
            </li>
          ))}
        </ul>
        <button type="button" className="edu-btn" disabled={busy || !quests.complete || quests.claimed} onClick={claim}>
          {quests.claimed ? t("practice.claimed") : <><GemIcon size={20} /> {t("practice.claim", { gems: quests.gems })}</>}
        </button>
      </div>

      <div className="edu-card">
        <h2 className="practice-h">{t("practice.reviewTitle")}</h2>
        <p className="practice-muted">{t("practice.reviewHint")}</p>
        {reviews.length ? (
          <ul className="practice-rows">
            {reviews.map((r) => (
              <li key={r.stepId}>
                <div>
                  <b>{stepTitle(r)}</b>
                  <small>{[r.best !== null && t("practice.best", { n: r.best }), r.age !== null && t("practice.age", { n: r.age })].filter(Boolean).join(" · ")}</small>
                </div>
                <button type="button" className="edu-btn edu-btn--ghost" onClick={() => navigate(`/learn/${r.stepId}`, { state: { part: r.part } })}>{t("practice.review")}</button>
              </li>
            ))}
          </ul>
        ) : <p>{t("practice.reviewEmpty")}</p>}
      </div>

      <div className="edu-card">
        <h2 className="practice-h">{t("practice.mistakesTitle")}</h2>
        <p>{mistakes ? t("practice.mistakesBody", { n: mistakes }) : t("practice.mistakesEmpty")}</p>
        {mistakes > 0 && (
          <button type="button" className="edu-btn" disabled={busy} onClick={startMistakes}>{t("practice.mistakesStart", { n: Math.min(10, mistakes) })}</button>
        )}
      </div>

      <div className="edu-card">
        <h2 className="practice-h">{t("practice.challengeTitle")}</h2>
        <p className="practice-muted">{t("practice.challengeHint", { gems: 10 })}</p>
        {challenges.length > 0 && (
          <ul className="practice-rows">
            {challenges.map((c) => (
              <li key={c.id}>
                <PersonaAvatar avatar={c.opponent.avatar} size={36} />
                <div>
                  <b>{t(c.sent ? "practice.to" : "practice.from", { name: c.opponent.name })}</b>
                  <small>{stepTitle(c)}</small>
                </div>
                {c.mine === null
                  ? <button type="button" className="edu-btn" disabled={busy} onClick={() => play(c)}>{t("practice.play")}</button>
                  : c.theirs === null
                    ? <small>{t("practice.waiting", { name: c.opponent.name, mine: c.mine })}</small>
                    : <b className={c.mine > c.theirs ? "practice-win" : c.mine < c.theirs ? "practice-lose" : ""}>{c.mine}% – {c.theirs}%</b>}
              </li>
            ))}
          </ul>
        )}
        {friends.length ? (
          <ul className="practice-rows">
            {friends.map((f) => (
              <li key={f.code}>
                <PersonaAvatar avatar={f.avatar} size={36} />
                <div><b>{f.name}</b></div>
                <button type="button" className="edu-btn edu-btn--ghost" disabled={busy} onClick={() => challenge(f.code)}>{t("practice.challengeSend")}</button>
              </li>
            ))}
          </ul>
        ) : <p>{t("practice.challengeNoFriends")}</p>}
      </div>
    </section>
  );
}

/** Làm một lượt câu hỏi (sổ câu sai hoặc thách đấu): trả lời hết rồi nộp, máy chủ chấm và trả lời giải. */
function QuizRun({ title, items, submit, onClose }) {
  const { t } = useEduText();
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [busy, setBusy] = useState(false);
  const send = async () => {
    setBusy(true);
    try {
      const r = await submit(items.map((_, k) => answers[k]));
      setResult(r);
      playEduSound(r.review?.every((x) => x.correct) ? "success" : "pop");
    } catch (error) {
      notify.error(error.message || t("practice.failed"));
    } finally {
      setBusy(false);
    }
  };
  return (
    <section className="edu-page practice">
      <h1 className="edu-page-title">{title}</h1>
      {items.map((item, k) => (
        <div key={k} className="edu-card">
          {item.label && <small className="practice-muted">{item.label}</small>}
          <QuizQuestion question={item.question} value={answers[k]} onChange={(v) => !result && setAnswers((a) => ({ ...a, [k]: v }))} reviewed={false} />
          {result?.review?.[k] && (
            <p className={result.review[k].correct ? "practice-win" : "practice-lose"}>
              {result.review[k].correct ? t("player.right") : t("player.answer", { a: result.review[k].answer })}
              {result.review[k].why ? ` — ${result.review[k].why}` : ""}
            </p>
          )}
        </div>
      ))}
      {result ? (
        <div className="edu-card">
          <b>{result.summary}</b>
          <button type="button" className="edu-btn" onClick={onClose}>{t("practice.close")}</button>
        </div>
      ) : (
        <div className="practice-actions">
          <button type="button" className="edu-btn edu-btn--ghost" onClick={onClose}>{t("practice.close")}</button>
          <button type="button" className="edu-btn" disabled={busy || Object.keys(answers).length < items.length} onClick={send}>{t("practice.submit")}</button>
        </div>
      )}
    </section>
  );
}
