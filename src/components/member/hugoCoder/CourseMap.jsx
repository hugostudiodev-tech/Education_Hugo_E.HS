import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BookOpen, Check, Code2, Database, Flag, GraduationCap, Lightbulb, Lock, NotebookPen, PenLine, Rocket, ShieldCheck, Sparkles, Star, Trophy, Users, X } from "lucide-react";

// Biểu tượng học tập xoay vòng trên các nút step (sách, bút, mũ tốt nghiệp…).
const STEP_ICONS = [BookOpen, PenLine, Lightbulb, NotebookPen, GraduationCap, Star];
import { gradeStage } from "../../../../packages/shared/stageGrading";
import { CATALOG } from "../../../../packages/courses/catalog";
import { useEduText } from "../../../education/eduText";

/**
 * Bản đồ khoá Coding — một con đường lục giác đi qua sáu vùng phong cảnh.
 *
 * Mỗi chặng một vùng đất riêng (đồng cỏ, hồ, rừng tím, hoàng hôn, đêm sao, sa
 * mạc) để người học thấy mình đã đi xa tới đâu. Chi tiết của chặng giấu trong
 * nút tròn "!" — bản đồ chỉ còn đường đi, không đổ chữ ra màn.
 *
 * ponytail: phong cảnh vẽ bằng gradient CSS + vài SVG nội tuyến, nhân vật là ảnh
 * WebP ~15 KB — không WebGL, không thư viện hoạt hình.
 */
// Mỗi chặng một nhân vật clay riêng (public/edu/cast-N.svg) — số lấy từ CATALOG.stageCast.
const STAGE_ICON = {
  basic: Code2, intermediate: Database, advanced: Users, security: ShieldCheck, project: Sparkles, devops: Rocket,
  "sql-basic": Database, "sql-filter": Code2, "sql-group": Users, "sql-design": Sparkles,
  "sql-write": ShieldCheck, "sql-window": Code2, "sql-perf": Rocket, "sql-capstone": Sparkles,
};
const STAGE_LOOK = Object.fromEntries(CATALOG.flatMap((c) => Object.entries(c.stageCast)).map(([id, cast]) => [id, { icon: STAGE_ICON[id] || Code2, mascot: `/edu/cast-${cast}.svg` }]));

// Màu đất cuối mỗi vùng — vùng sau bắt đầu từ đúng màu này để hai vùng hoà
// vào nhau thay vì cắt ngang một đường thẳng. Khớp --ground trong CSS.
const GROUND = {
  blue: "#58c13d", green: "#2fb5c9", purple: "#a3d977", pink: "#ffc861", indigo: "#262a63", orange: "#ffa94d",
  teal: "#20a39e", lime: "#8cc63f", rose: "#f783ac", midnight: "#14173a", sand: "#e0b872", aurora: "#123d3a",
};
// Mỗi chặng một nền. Chặng không ghi `tone` (khoá sau, nhiều chặng hơn) tự lấy
// theo số chặng, vòng lại khi hết — khoá bao nhiêu chặng cũng có nền riêng.
const TONES = Object.keys(GROUND);
// Màu trời (= màu nền MỘT màu của chặng ở Edu) — chặng sau chuyển màu từ màu này.
const SKY = {
  blue: "#9be15d", green: "#7fd8ee", purple: "#d9f99d", pink: "#ffe8a3", indigo: "#3b3f8f", orange: "#ffd8a8",
  teal: "#b2f2e8", lime: "#fff9db", rose: "#ffe3ec", midnight: "#1e2257", sand: "#fff4e0", aurora: "#0c2b3a",
};
const NIGHT_TONES = new Set(["indigo", "midnight", "aurora"]); // nền đêm sao
const toneOf = (stage) => (GROUND[stage?.tone] ? stage.tone : TONES[((stage?.phaseNumber || 1) - 1) % TONES.length]);

// Đường lượn: lệch trái–phải theo hình sin, mỗi chặng lượn ngược chiều chặng trước.
const offsetOf = (index, flip) => Math.round(Math.sin(index * 0.9) * 70) * (flip ? -1 : 1);


/** Cây, bụi, hoa trang trí — đặt hai bên đường, không bấm được. */
function Scenery({ seed }) {
  const items = [
    ["tree", 6, 8], ["bush", 84, 22], ["flower", 12, 46], ["tree", 88, 58], ["flower", 80, 84], ["bush", 4, 80],
  ];
  return (
    <div className="cmap-scenery" aria-hidden="true">
      {items.map(([kind, left, top], i) => (
        <svg key={i} className={`cmap-deco is-${kind}`} style={{ left: `${left}%`, top: `${(top + seed * 7) % 92}%` }} viewBox="0 0 40 40">
          {kind === "tree" && (<><rect x="18" y="24" width="4" height="12" rx="2" fill="#7a4b2a" /><circle cx="20" cy="18" r="13" fill="var(--deco-a)" /><circle cx="14" cy="14" r="5" fill="#fff" opacity=".18" /></>)}
          {kind === "bush" && (<><circle cx="13" cy="26" r="9" fill="var(--deco-a)" /><circle cx="25" cy="24" r="11" fill="var(--deco-b)" /></>)}
          {kind === "flower" && (<><rect x="19" y="20" width="2" height="14" fill="#2f7a3a" />{[0, 72, 144, 216, 288].map((r) => <circle key={r} cx="20" cy="13" r="5" fill="var(--deco-c)" transform={`rotate(${r} 20 18)`} />)}<circle cx="20" cy="18" r="3.5" fill="#ffd23f" /></>)}
        </svg>
      ))}
    </div>
  );
}

/** Bảng chi tiết chặng — mở từ nút tròn "!". */
function StageSheet({ unit, assessment, onClose }) {
  const { t } = useEduText();
  // Đóng = chạy hoạt cảnh trượt xuống (CSS .is-closing) rồi mới gỡ bảng.
  const [closing, setClosing] = useState(false);
  const close = useCallback(() => setClosing(true), []);
  useEffect(() => {
    if (!closing) return undefined;
    const reduce = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const timer = window.setTimeout(onClose, reduce ? 0 : 220);
    return () => window.clearTimeout(timer);
  }, [closing, onClose]);
  useEffect(() => {
    const onKey = (event) => event.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [close]);
  const step = (i) => ({ style: { "--i": i } });

  return (
    <div className={`cmap-sheet-backdrop${closing ? " is-closing" : ""}`} role="presentation" onClick={close}>
      <div className={`cmap-sheet cmap-tone-${toneOf(unit)}`} role="dialog" aria-modal="true" aria-labelledby="cmap-sheet-title" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="cmap-sheet-close" onClick={close} aria-label={t("common.close")}><X aria-hidden="true" /></button>
        <small {...step(0)}>{t("common.stage", { n: unit.phaseNumber })} · {unit.rangeText}</small>
        <h2 id="cmap-sheet-title" {...step(1)}>{unit.title.replace(/^CODE \d+ · /, "")}</h2>
        <p className="cmap-sheet-tagline" {...step(2)}>{unit.intro?.tagline}</p>
        <h3 {...step(3)}>{t("map.youLearn")}</h3>
        <ul {...step(3)}>{(unit.intro?.learn || []).map((item, i) => <li key={item} {...step(i)}>{item}</li>)}</ul>
        {unit.intro?.challenge && (<><h3 {...step(5)}>{t("map.challenge")}</h3><p {...step(6)}>{unit.intro.challenge}</p></>)}
        {unit.intro?.promise && <p className="cmap-sheet-promise" {...step(7)}>{unit.intro.promise}</p>}
        {assessment.breakdown.attempts > 0 && (
          <p className="cmap-sheet-grade" {...step(8)}>{t("map.grade")} <b>{assessment.score}/100 · {assessment.gradeLabel}</b></p>
        )}
      </div>
    </div>
  );
}

function Unit({ unit, lessons, currentIndex, completedSet, onOpenLesson, focusId, focusRef, examScores, serverCompleted, lessonsDone, flip, prevTone }) {
  const { t } = useEduText();
  const [sheetOpen, setSheetOpen] = useState(false);
  // Thẻ "Bắt đầu" bật ra dưới nút step khi bấm (kiểu Duolingo); bấm ra ngoài thì đóng.
  const [popId, setPopId] = useState(null);
  useEffect(() => {
    if (!popId) return undefined;
    const close = (event) => !event.target.closest?.(".cmap-node.is-pop") && setPopId(null);
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, [popId]);
  const look = STAGE_LOOK[unit.id] || STAGE_LOOK.basic;
  const doneCount = lessons.filter(({ course }) => completedSet.has(course.id)).length;
  const percent = lessons.length ? Math.round((doneCount / lessons.length) * 100) : 0;
  const assessment = useMemo(() => gradeStage({
    lessonIds: lessons.map(({ course }) => course.id),
    examIds: lessons.map(({ course }) => course.id),
    completedLessons: serverCompleted,
    examScores,
  }), [lessons, serverCompleted, examScores]);
  // Nhân vật đứng chờ cạnh step giữa chặng, ở phía đường không lượn tới.
  const mascotAt = Math.floor(lessons.length / 2);

  return (
    <section
      className={`cmap-zone cmap-tone-${toneOf(unit)}${NIGHT_TONES.has(toneOf(unit)) ? " is-night" : ""}`}
      aria-labelledby={`cmap-${unit.id}`}
      style={prevTone ? { "--prev": GROUND[prevTone], "--prev-sky": SKY[prevTone] } : undefined}
    >
      <Scenery seed={unit.phaseNumber} />

      <header className="cmap-banner">
        <div>
          <small>{t("map.stageSteps", { n: unit.phaseNumber, done: doneCount, total: lessons.length })}</small>
          <h2 id={`cmap-${unit.id}`}>{unit.title.replace(/^CODE \d+ · /, "")}</h2>
        </div>
        <button type="button" className="cmap-info" onClick={() => setSheetOpen(true)} aria-label={t("map.stageAbout", { n: unit.phaseNumber })}>!</button>
        <span className="cmap-ring" style={{ "--p": `${percent * 3.6}deg` }} aria-label={t("map.percent", { p: percent })}>
          <b>{percent}%</b>
        </span>
      </header>

      {/* data-lg-off: nút step tự lún kiểu Duolingo, không chồng thêm hiệu ứng co giãn chung của app. */}
      <ol className="cmap-path" data-lg-off>
        {lessons.map(({ course, globalIndex }, index) => {
          const done = completedSet.has(course.id);
          const current = globalIndex === currentIndex;
          const locked = !done && globalIndex > currentIndex;
          const last = index === lessons.length - 1;
          const Icon = locked ? Lock : done ? Check : last ? Flag : index === 0 ? look.icon : STEP_ICONS[(globalIndex + index) % STEP_ICONS.length];
          const offset = offsetOf(index, flip);
          const name = course.title.replace(/^\d+\.\s*/, "");
          // Step đang học: vòng tiến độ theo bài nhỏ đã xong (kiểu Duolingo).
          const partsDone = current && course.lessons ? Math.min(lessonsDone[course.id]?.length || 0, course.lessons - 1) : 0;
          return (
            <li
              key={course.id}
              ref={course.id === focusId ? focusRef : undefined}
              className={`cmap-node ${done ? "is-done" : current ? "is-current" : locked ? "is-locked" : "is-open"}${popId === course.id ? " is-pop" : ""}`}
              style={{ "--x": `${offset}px`, ...(partsDone ? { "--lp": `${(partsDone / course.lessons) * 360}deg` } : {}) }}
            >
              {current && <span className="cmap-bubble">{course.draft ? t("map.soon") : t("map.start")} · {course.lessons ? t("player.lessonOf", { n: partsDone + 1, total: course.lessons }) : `Step ${globalIndex + 1}`}</span>}
              <button
                type="button"
                className="cmap-hex"
                onClick={() => !locked && setPopId(popId === course.id ? null : course.id)}
                disabled={locked}
                aria-label={`Step ${globalIndex + 1}: ${name}${done ? t("map.done") : locked ? t("map.locked") : ""}`}
                title={name}
              >
                <span className="cmap-hex-face"><Icon aria-hidden="true" /></span>
              </button>
              {popId === course.id && (
                <div className={`cmap-pop${last ? " is-up" : ""}`} role="dialog" aria-label={name}>
                  <b>{name}</b>
                  {course.lessons && !done && <span>{t("player.lessonOf", { n: partsDone + 1, total: course.lessons })}</span>}
                  <button type="button" onClick={() => onOpenLesson(course.id)} disabled={course.draft}>
                    {course.draft ? t("map.soon") : done ? t("map.review") : `${t("map.start")} ${t("map.xp", { n: 10 })}`}
                  </button>
                </div>
              )}
              {index === mascotAt && (
                <img
                  className="cmap-mascot"
                  src={look.mascot}
                  alt=""
                  width="96"
                  height="110"
                  loading="lazy"
                  decoding="async"
                  style={{ "--side": offset > 0 ? -1 : 1 }}
                />
              )}
            </li>
          );
        })}
      </ol>

      {sheetOpen && <StageSheet unit={unit} assessment={assessment} onClose={() => setSheetOpen(false)} />}
    </section>
  );
}

export default function CourseMap({ courses, stages, completedSet, currentIndex, focusId, onOpenLesson, examScores = {}, serverCompleted = [], lessonsDone = {} }) {
  const { t } = useEduText();
  const focusRef = useRef(null);
  const units = useMemo(
    () => stages.map((stage) => ({
      stage,
      lessons: courses.slice(stage.from, stage.to).map((course, index) => ({ course, globalIndex: stage.from + index })),
    })),
    [courses, stages],
  );
  const allDone = courses.length > 0 && courses.every((course) => completedSet.has(course.id));

  // Mở bản đồ là thấy ngay step đang học, không phải cuộn đi tìm.
  useEffect(() => {
    const node = focusRef.current;
    if (!node) return undefined;
    const frame = requestAnimationFrame(() => node.scrollIntoView({ block: "center", behavior: "auto" }));
    return () => cancelAnimationFrame(frame);
  }, [focusId]);

  return (
    <div className="cmap">
      {units.map(({ stage, lessons }, index) => (
        <Unit
          key={stage.id}
          unit={stage}
          lessons={lessons}
          currentIndex={currentIndex}
          completedSet={completedSet}
          onOpenLesson={onOpenLesson}
          focusId={focusId}
          focusRef={focusRef}
          examScores={examScores}
          serverCompleted={serverCompleted}
          lessonsDone={lessonsDone}
          flip={index % 2 === 1}
          prevTone={index ? toneOf(units[index - 1].stage) : undefined}
        />
      ))}

      <footer
        className={`cmap-finish${allDone ? " is-done" : ""}${units.length && NIGHT_TONES.has(toneOf(units.at(-1).stage)) ? " is-night" : ""}`}
        style={units.length ? { "--end-sky": SKY[toneOf(units.at(-1).stage)] } : undefined}
      >
        <span className="cmap-trophy-wrap"><span className="cmap-trophy"><Trophy aria-hidden="true" /></span></span>
        <strong>{allDone ? t("map.finishDone") : t("map.finishGoal")}</strong>
        <small>{t("map.exclusive")}</small>
      </footer>
    </div>
  );
}
