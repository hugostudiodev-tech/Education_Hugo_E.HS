import { useEffect, useRef, useState } from "react";
import { quizKind } from "../../packages/shared/quizKinds";
import QuizQuestion from "../components/member/hugoCoder/QuizQuestion";
import { PersonaAvatar } from "./EduPersona";
import { playEduSound, startEduBeat } from "./eduSound";
import { useEduText } from "./eduText";

const reduced = () => window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
// Một chạm là chọn xong → tự sang câu kế. Dạng khác (nhiều đáp án, điền, sắp xếp…) cần nút Tiếp.
const ONE_TAP = new Set(["mcq", "truefalse"]);

function Side({ who, tone, label }) {
  return (
    <div className={`vs-side is-${tone}`}>
      <span className="vs-avatar"><PersonaAvatar avatar={who.avatar} name={who.name} size={112} /></span>
      <b className="vs-name nick-font">{who.name}</b>
      {label != null && <span className="vs-score">{label}</span>}
    </div>
  );
}

/**
 * Trận thách đấu toàn màn hình: màn VS (hai nhân vật hai bên, chữ VS đập xuống) → từng câu một
 * với nhịp trống nền → bảng kết quả. Chạm màn VS để vào ngay. `submit(answers)` → { mine, theirs, reward, review, summary }.
 */
export default function EduVersus({ me, opponent, title, questions, submit, onClose }) {
  const { t } = useEduText();
  const [phase, setPhase] = useState("intro");
  const [k, setK] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [result, setResult] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const beat = useRef(null);
  const auto = useRef(0);

  // Màn VS: kéo hai bên vào, đập chữ VS, "Bắt đầu!" rồi vào bài — tổng ~2,4 giây.
  useEffect(() => {
    if (phase !== "intro") return undefined;
    const fast = reduced();
    const timers = fast ? [setTimeout(() => setPhase("quiz"), 900)] : [
      setTimeout(() => playEduSound("whooshIn"), 60),
      setTimeout(() => { playEduSound("vs"); navigator.vibrate?.(60); }, 520),
      setTimeout(() => playEduSound("go"), 1750),
      setTimeout(() => setPhase("quiz"), 2400),
    ];
    return () => timers.forEach(clearTimeout);
  }, [phase]);

  useEffect(() => {
    if (phase !== "quiz") return undefined;
    beat.current = startEduBeat();
    return () => beat.current?.stop();
  }, [phase]);
  useEffect(() => () => clearTimeout(auto.current), []);

  const send = async (all) => {
    beat.current?.stop();
    setPhase("sending");
    try {
      const r = await submit(all);
      setResult(r);
      setPhase("result");
      playEduSound(r.theirs == null ? "success" : r.mine > r.theirs ? "win" : r.mine < r.theirs ? "lose" : "success");
    } catch {
      setPhase("quiz");
    }
  };
  const next = (all = answers) => {
    if (k + 1 >= questions.length) return send(all);
    setK(k + 1);
    if (k + 2 === questions.length) beat.current?.faster();
    playEduSound("whoosh");
    return undefined;
  };
  const pick = (v) => {
    const all = [...answers];
    all[k] = v;
    setAnswers(all);
    if (ONE_TAP.has(quizKind(questions[k]))) {
      clearTimeout(auto.current);
      auto.current = setTimeout(() => next(all), 380);
    }
  };

  if (phase === "intro") {
    return (
      <div className="vs-screen is-intro" role="dialog" aria-label={`${me.name} vs ${opponent.name}`} onClick={() => setPhase("quiz")}>
        <Side who={me} tone="blue" />
        <Side who={opponent} tone="red" />
        <span className="vs-mark" aria-hidden="true"><i>V</i><i>S</i></span>
        <p className="vs-topic">{title}</p>
        <p className="vs-go">{t("practice.vsGo")}</p>
      </div>
    );
  }

  if (phase === "result" && result) {
    const outcome = result.theirs == null ? "wait" : result.mine > result.theirs ? "win" : result.mine < result.theirs ? "lose" : "tie";
    return (
      <div className={`vs-screen is-result is-${outcome}`} role="dialog" aria-label={t(`practice.vs.${outcome}`)}>
        <Side who={me} tone="blue" label={`${result.mine}%`} />
        <Side who={opponent} tone="red" label={result.theirs == null ? "?" : `${result.theirs}%`} />
        <div className="vs-result">
          <b className="vs-verdict">{t(`practice.vs.${outcome}`)}</b>
          <p>{result.summary}</p>
          {showReview && (
            <ol className="vs-review">
              {result.review?.map((r, i) => (
                <li key={i} className={r.correct ? "is-ok" : "is-bad"}>
                  <span className="material-symbols-outlined" aria-hidden="true">{r.correct ? "check_circle" : "cancel"}</span>
                  <span>{r.correct ? t("player.right") : t("player.answer", { a: r.answer })}{r.why ? ` — ${r.why}` : ""}</span>
                </li>
              ))}
            </ol>
          )}
          <div className="vs-actions">
            {result.review?.length > 0 && <button type="button" className="edu-btn edu-btn--ghost" onClick={() => setShowReview((v) => !v)}>{t(showReview ? "practice.vsHide" : "practice.vsReview")}</button>}
            <button type="button" className="edu-btn" onClick={onClose}>{t("practice.vsDone")}</button>
          </div>
        </div>
      </div>
    );
  }

  const q = questions[k];
  const answered = answers[k] !== undefined && answers[k] !== "" && !(Array.isArray(answers[k]) && !answers[k].length);
  return (
    <div className="vs-screen is-quiz" role="dialog" aria-label={title}>
      <header className="vs-bar">
        <button type="button" className="vs-x" onClick={onClose} aria-label={t("practice.close")}><span className="material-symbols-outlined" aria-hidden="true">close</span></button>
        <span className="vs-mini is-blue"><PersonaAvatar avatar={me.avatar} name={me.name} size={36} /></span>
        <span className="vs-track" role="progressbar" aria-valuenow={k + 1} aria-valuemin={1} aria-valuemax={questions.length}><i style={{ width: `${((k + (answered ? 1 : 0)) / questions.length) * 100}%` }} /></span>
        <span className="vs-mini is-red"><PersonaAvatar avatar={opponent.avatar} name={opponent.name} size={36} /></span>
      </header>
      <p className="vs-count">{t("practice.vsCount", { n: k + 1, total: questions.length })}</p>
      <div key={k} className="vs-card practice">
        <QuizQuestion question={q} value={answers[k]} onChange={phase === "quiz" ? pick : () => {}} reviewed={false} />
      </div>
      {!ONE_TAP.has(quizKind(q)) && (
        <button type="button" className="edu-btn vs-next" disabled={!answered || phase !== "quiz"} onClick={() => next()}>
          {k + 1 >= questions.length ? t("practice.submit") : t("practice.vsNext")}
        </button>
      )}
      {phase === "sending" && <p className="vs-count" role="status">{t("practice.vsGrading")}</p>}
    </div>
  );
}
