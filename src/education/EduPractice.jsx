import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/apiBase";
import { notify } from "../lib/notify";
import { playEduSound } from "./eduSound";
import { GemIcon } from "./gems";
import { localizeStepTitle, useEduText } from "./eduText";
import { PersonaAvatar } from "./EduPersona";
import QuizQuestion from "../components/member/hugoCoder/QuizQuestion";
import "../styles/hugoCoderLearning.css";
import EduSpotlight from "./EduSpotlight";
import EduVersus from "./EduVersus";

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
export default function EduPractice({ learner, onLearnerUpdate }) {
  const { t, lang } = useEduText();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [failed, setFailed] = useState(false);
  const [friends, setFriends] = useState([]);
  const [me, setMe] = useState(null);
  const [versus, setVersus] = useState(null);
  const [run, setRun] = useState(null);
  const [busy, setBusy] = useState(false);
  const stepTitle = (item) => localizeStepTitle(item.title, item.index, lang, item.course);

  const load = useCallback(() => api("/practice").then((next) => { setData(next); setFailed(false); }).catch(() => setFailed(true)), []);
  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    api("/social").then((s) => { setFriends((s.friends || []).filter((f) => !f.me)); setMe((s.friends || []).find((f) => f.me) || null); }).catch(() => {});
  }, []);

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

  // Thách đấu một chạm: vào thẳng màn VS rồi làm bài, không qua bước "gửi lời thách" riêng.
  const versusFor = async (id, opponent) => {
    const quiz = await api(`/practice/challenges/${id}/quiz?lang=${lang}`);
    setVersus({
      opponent,
      title: stepTitle(quiz),
      questions: quiz.questions,
      submit: async (answers) => {
        try {
          const r = await api(`/practice/challenges/${id}`, { answers });
          if (Number.isFinite(r.balance)) onLearnerUpdate?.({ gems: r.balance });
          const vars = { mine: r.mine, theirs: r.theirs, name: opponent.name };
          const line = r.theirs === null ? t("practice.resultWait", { score: r.mine })
            : t(r.mine > r.theirs ? "practice.resultWon" : r.mine < r.theirs ? "practice.resultLost" : "practice.resultTie", vars);
          return { ...r, summary: r.reward ? `${line} ${t("practice.gemsLine", { gems: r.reward })}` : line };
        } catch (error) { notify.error(error.message || t("practice.failed")); throw error; }
      },
    });
  };
  const fight = (friend) => { playEduSound("pop", { unlock: true }); return act(async () => {
    const { id } = await api("/practice/challenges", { code: friend.code });
    await versusFor(id, { name: friend.name, avatar: friend.avatar });
  }); };
  const play = (c) => { playEduSound("pop", { unlock: true }); return act(() => versusFor(c.id, c.opponent)); };
  // Nút lớn "Đấu ngay": ưu tiên lời thách đang chờ, không có thì tự chọn một bạn có step chung.
  const quickFight = () => {
    playEduSound("pop", { unlock: true });
    const waiting = data?.challenges.find((c) => c.mine === null);
    if (waiting) return play(waiting);
    if (!friends.length) return navigate("/friends");
    return act(async () => {
      for (const f of [...friends].sort(() => Math.random() - 0.5)) {
        try {
          const { id } = await api("/practice/challenges", { code: f.code });
          return await versusFor(id, { name: f.name, avatar: f.avatar });
        } catch (error) { if (!/step/i.test(error.message)) throw error; }
      }
      throw new Error(t("practice.noCommon"));
    });
  };

  if (versus) {
    return <EduVersus {...versus} me={{ name: me?.name || learner?.nickname || t("friends.social.you"), avatar: me?.avatar }} onClose={() => { setVersus(null); load(); }} />;
  }
  if (run) return <QuizRun {...run} onClose={() => { setRun(null); load(); }} />;
  if (failed) return <section className="edu-page"><p>{t("practice.failed")}</p></section>;
  if (!data) return <section className="edu-page"><p className="practice-muted">…</p></section>;

  const { quests, reviews, mistakes, challenges } = data;
  const pending = challenges.filter((c) => c.mine === null).length;
  return (
    <section className="edu-page practice">
      <h1 className="edu-page-title">{t("practice.title")}</h1>

      {/* Thách đấu đứng đầu và nổi nhất; Thi đua tuần nằm kế bên (thẻ cố định, không có nút ẩn). */}
      <div className="arena-row">
        <button type="button" className="arena-tile" disabled={busy} onClick={quickFight}>
          <span className="arena-vs" aria-hidden="true"><i>V</i><i>S</i></span>
          <b className="arena-title">{t("practice.arenaTitle")}</b>
          <small>{pending ? t("practice.arenaPending", { n: pending }) : t("practice.arenaBody", { gems: 10 })}</small>
          <span className="arena-cta">{t("practice.arenaCta")}<span className="material-symbols-outlined" aria-hidden="true">bolt</span></span>
          {pending > 0 && <span className="arena-badge" aria-hidden="true">{pending}</span>}
        </button>
        <Link to="/friends?tab=league" className="league-tile">
          <span className="league-icon material-symbols-outlined" aria-hidden="true">trophy</span>
          <b>{t("practice.leagueTile")}</b>
          <small>{t("practice.leagueBody")}</small>
          <span className="material-symbols-outlined league-go" aria-hidden="true">chevron_right</span>
        </Link>
      </div>

      <div className="edu-card practice-card arena-card">
        <h2 className="practice-h">{t("practice.rivals")}</h2>
        {friends.length ? (
          <ul className="arena-rivals">
            {friends.map((f) => (
              <li key={f.code}>
                <button type="button" disabled={busy} onClick={() => fight(f)} aria-label={`${t("practice.challengeSend")} ${f.name}`}>
                  <span className="arena-rival-av"><PersonaAvatar avatar={f.avatar} name={f.name} size={56} /><i className="material-symbols-outlined" aria-hidden="true">swords</i></span>
                  <span className="nick-font">{f.name}</span>
                </button>
              </li>
            ))}
          </ul>
        ) : <p className="practice-empty">{t("practice.challengeNoFriends")} <Link to="/friends">→</Link></p>}
        {challenges.length > 0 && (<>
          <h3 className="practice-sub">{t("practice.history")}</h3>
          <ul className="practice-list">
            {challenges.map((c) => (
              <li key={c.id}>
                <button type="button" className={`practice-item practice-person ${c.mine === null ? "is-live" : ""}`} disabled={busy || c.mine !== null} onClick={() => play(c)}>
                  <PersonaAvatar avatar={c.opponent.avatar} name={c.opponent.name} size={40} />
                  <span className="practice-item-text">
                    <b>{t(c.sent ? "practice.to" : "practice.from", { name: c.opponent.name })}</b>
                    <small>{stepTitle(c)}</small>
                  </span>
                  {c.mine === null
                    ? <span className="edu-btn practice-small">{t("practice.arenaCta")}</span>
                    : c.theirs === null
                      ? <small className="practice-wait">{t("practice.waitShort", { mine: c.mine })}</small>
                      : <b className={`practice-result ${c.mine > c.theirs ? "practice-win" : c.mine < c.theirs ? "practice-lose" : ""}`}>{c.mine}–{c.theirs}</b>}
                </button>
              </li>
            ))}
          </ul>
        </>)}
      </div>

      {/* Điện thoại không có cột phải: gợi ý tính năng hiện ở đây. Máy tính đã có trong Rail. */}
      <div className="edu-spot-mobile"><EduSpotlight learner={learner} /></div>

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
