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

const QUEST_ICON = { lessons: "menu_book", quiz: "target", review: "replay" };

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

      <div className="edu-card practice-card">
        <header className="practice-head">
          <h2 className="practice-h">{t("practice.questsTitle")}</h2>
          <span className="practice-chip"><GemIcon size={16} />{quests.gems}</span>
        </header>
        <ul className="practice-quests">
          {quests.list.map((q) => {
            const done = q.done >= q.goal;
            return (
              <li key={q.id} className={done ? "is-done" : ""}>
                <span className="practice-tick material-symbols-outlined" aria-hidden="true">{done ? "check" : QUEST_ICON[q.id]}</span>
                <div>
                  <span>{t(`practice.quest.${q.id}`)}</span>
                  <i className="practice-bar" style={{ "--v": q.done / q.goal }}><b>{q.done}/{q.goal}</b></i>
                </div>
              </li>
            );
          })}
        </ul>
        {quests.claimed
          ? <p className="practice-claimed"><span className="material-symbols-outlined" aria-hidden="true">check_circle</span>{t("practice.claimed")}</p>
          : quests.complete
            ? <button type="button" className="edu-btn practice-claim" disabled={busy} onClick={claim}><GemIcon size={20} />{t("practice.claim", { gems: quests.gems })}</button>
            : <p className="practice-muted">{t("practice.questsLeft", { n: quests.list.filter((q) => q.done < q.goal).length, gems: quests.gems })}</p>}
      </div>

      <div className="edu-card practice-card">
        <h2 className="practice-h">{t("practice.reviewTitle")}</h2>
        <p className="practice-muted">{t("practice.reviewHint")}</p>
        {reviews.length ? (
          <ul className="practice-list">
            {reviews.map((r) => (
              <li key={r.stepId}>
                {/* Cả hàng là một nút: chạm vào đâu cũng mở trắc nghiệm, không có nút nhỏ bị đẩy khỏi màn. */}
                <button type="button" className="practice-item" onClick={() => navigate(`/learn/${r.stepId}`, { state: { part: r.part } })}>
                  <span className={`practice-score ${r.best === null ? "" : r.best >= 80 ? "is-ok" : "is-low"}`}>{r.best === null ? "—" : `${r.best}%`}</span>
                  <span className="practice-item-text">
                    <b>{stepTitle(r)}</b>
                    {r.age !== null && <small>{t("practice.age", { n: r.age })}</small>}
                  </span>
                  <span className="material-symbols-outlined practice-go" aria-hidden="true">chevron_right</span>
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="practice-empty">{t("practice.reviewEmpty")}</p>}
      </div>

      <div className="edu-card practice-card">
        <h2 className="practice-h">{t("practice.mistakesTitle")}</h2>
        {mistakes > 0 ? (
          <>
            <p className="practice-big"><b>{mistakes}</b><span>{t("practice.mistakesBody", { n: mistakes })}</span></p>
            <button type="button" className="edu-btn" disabled={busy} onClick={startMistakes}>{t("practice.mistakesStart", { n: Math.min(10, mistakes) })}</button>
          </>
        ) : <p className="practice-empty">{t("practice.mistakesEmpty")}</p>}
      </div>

      <div className="edu-card practice-card">
        <h2 className="practice-h">{t("practice.challengeTitle")}</h2>
        <p className="practice-muted">{t("practice.challengeHint", { gems: 10 })}</p>
        {challenges.length > 0 && (
          <ul className="practice-list">
            {challenges.map((c) => (
              <li key={c.id} className="practice-person">
                <PersonaAvatar avatar={c.opponent.avatar} name={c.opponent.name} size={40} />
                <span className="practice-item-text">
                  <b>{t(c.sent ? "practice.to" : "practice.from", { name: c.opponent.name })}</b>
                  <small>{stepTitle(c)}</small>
                </span>
                {c.mine === null
                  ? <button type="button" className="edu-btn practice-small" disabled={busy} onClick={() => play(c)}>{t("practice.play")}</button>
                  : c.theirs === null
                    ? <small className="practice-wait">{t("practice.waitShort", { mine: c.mine })}</small>
                    : <b className={`practice-result ${c.mine > c.theirs ? "practice-win" : c.mine < c.theirs ? "practice-lose" : ""}`}>{c.mine}–{c.theirs}</b>}
              </li>
            ))}
          </ul>
        )}
        {friends.length ? (
          <ul className="practice-list">
            {friends.map((f) => (
              <li key={f.code} className="practice-person">
                <PersonaAvatar avatar={f.avatar} name={f.name} size={40} />
                <span className="practice-item-text"><b>{f.name}</b></span>
                <button type="button" className="edu-btn edu-btn--ghost practice-small" disabled={busy} onClick={() => challenge(f.code)}>{t("practice.challengeSend")}</button>
              </li>
            ))}
          </ul>
        ) : <p className="practice-empty">{t("practice.challengeNoFriends")}</p>}
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
