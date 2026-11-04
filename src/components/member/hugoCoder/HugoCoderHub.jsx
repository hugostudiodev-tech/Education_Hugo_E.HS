import { useEffect, useMemo, useState } from "react";
import { Award, Braces, ChevronLeft, GraduationCap, X } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { notify } from "../../../lib/notify";
import { useCoderLessons } from "../../../hooks/useCoderLessons";
import { CODER_STORAGE_KEYS, GUEST_LESSONS, readGuestLessons } from "./workspaceUtils";
import CoderLearningJourney from "./CoderLearningJourney";
import { getMemberSession } from "../../../services/api/core/authSession";
import LessonPlayer from "./LessonPlayer";
import { gemText } from "../../../education/gems";
import { useEduText } from "../../../education/eduText";
import { nextLesson, stepLessons } from "../../../../packages/courses/coding/lessons.js";
import "../../../styles/hugoCoderLearning.css";
import "../study/study-course-ios17.css";


function percentage(part, total) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

// Thẻ skeleton — dùng khi đang tải HOẶC chưa có học liệu nào (giữ layout không trống trải)
export function ManageTab({ bio, courses, stages }) {
  const { t: edu } = useEduText();
  const completed = useMemo(
    () => (bio?.completedLessons || []).filter((id) => courses.some((c) => c.id === id)),
    [bio?.completedLessons, courses]
  );
  const stageEarned = (stage) => {
    const lastId = courses[stage.to - 1]?.id;
    if (stage.phaseNumber === 6) return completed.includes(lastId) || bio?.hugoCoderProjectStatus === "approved";
    return completed.includes(lastId);
  };

  const scores = bio?.scores || {};
  const scoredSteps = courses.filter((course) => scores[course.id]);
  const earnedCount = stages.filter(stageEarned).length;
  // Danh hiệu theo chặng đã đi qua (6 / 11 / 15 / 19 / 22 step).
  // Khoá SQL/Python: danh hiệu = chặng gần nhất đã hoàn thành (bảng danh hiệu kia viết cho khoá Coding).
  const otherCourse = courses[0]?.id && !courses[0].id.startsWith("step");
  const rank = otherCourse
    ? (stages.filter(stageEarned).at(-1) || stages[0])?.title
    : edu("hub.ranks")[[6, 11, 15, 19, 22].filter((need) => completed.length >= need).length];

  const pct = percentage(completed.length, courses.length);

  return (
    <div className="space-y-5">
      {/* HERO — danh hiệu + vòng tiến độ */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-primary to-primary/70 p-5 text-white shadow-lg">
        <div className="absolute -right-8 -top-10 w-32 h-32 rounded-full bg-white/10" />
        <div className="absolute -right-2 bottom-0 w-16 h-16 rounded-full bg-white/10" />
        <div className="relative flex items-center gap-4">
          {/* Vòng tiến độ SVG */}
          <div className="relative w-20 h-20 shrink-0">
            <svg viewBox="0 0 36 36" className="w-20 h-20 -rotate-90">
              <circle cx="18" cy="18" r="15.9" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="3.5" />
              <circle
                cx="18" cy="18" r="15.9" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round"
                strokeDasharray={`${pct} ${100 - pct}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-lg font-black leading-none">{pct}%</span>
            </div>
          </div>
          <div className="min-w-0">
            <p className="text-[13px] font-black uppercase tracking-widest text-white/70">{edu("hub.rankTitle")}</p>
            <h3 className="text-lg font-black leading-tight line-clamp-2">{rank}</h3>
            <p className="text-[13px] text-white/80 mt-0.5">{edu("hub.rankLine", { done: completed.length, total: courses.length, stages: earnedCount, allStages: stages.length })}</p>
          </div>
        </div>
      </section>

      {/* Điểm trắc nghiệm do máy chủ chấm — lần đầu và tốt nhất. */}
      {scoredSteps.length > 0 && (
        <section className="rounded-2xl border border-border bg-card p-4 space-y-3">
          <h3 className="text-[13px] font-black text-foreground flex items-center gap-2">
            <span className="w-6 h-6 rounded-lg bg-muted flex items-center justify-center"><GraduationCap className="w-3.5 h-3.5 text-foreground" /></span>
            {edu("hub.scores")}
          </h3>
          <div className="space-y-1.5">
            {scoredSteps.map((step) => {
              const entry = scores[step.id];
              return (
                <div key={step.id} className="flex items-center justify-between gap-2 text-[13px] py-2 border-b border-border/40 last:border-0">
                  <span className="text-foreground/80 truncate">{step.title}</span>
                  <span className="shrink-0 text-[13px] font-black text-muted-foreground">
                    {edu("hub.scoreLine", { first: entry.firstTry, best: entry.best })}
                  </span>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </div>
  );
}

// ====== Vỏ toàn màn hình của khoá Coding ======
// Hai màn: BẢN ĐỒ khoá học và TRÌNH PHÁT step; địa chỉ quyết định đang ở màn nào.
// `framed`: bản đồ nằm trong khung AppFrame của app Coding — chỉ vẽ nội dung,
// không dựng vỏ toàn màn và thanh đầu riêng. Bảng Tiến độ khi đó do khung điều
// khiển qua `progressOpen`/`onProgressChange`.
export default function HugoCoderHub({ onBack, bio, onBioUpdate, urlLessonId, basePath = "/member/utilities/study/coding", framed = false, progressOpen: controlledProgress, onProgressChange, program = "coding", programProgress = null, maxSteps = null, onProgramProgress, onLessonChange, course }) {
  const { t } = useTranslation();
  const { t: edu } = useEduText();
  const navigate = useNavigate();
  const [ownProgress, setOwnProgress] = useState(false);
  const progressOpen = controlledProgress ?? ownProgress;
  const setProgressOpen = onProgressChange ?? setOwnProgress;
  // Step đang mở đọc THẲNG từ địa chỉ (`basePath/stepN`): tải lại trang là ở
  // nguyên chỗ đang học.
  const selectedLessonId = urlLessonId || null;
  const { courses: allCourses, stages, loading, detailReady, detailError } = useCoderLessons(selectedLessonId, { program, course: selectedLessonId ? undefined : course });
  const courses = maxSteps ? allCourses.slice(0, maxSteps) : allCourses;
  const progressBio = program === "hugoteam" ? { ...bio, completedLessons: programProgress || [] } : bio;
  // `part` = bài nhỏ muốn mở (xem lại); bỏ trống thì vào bài chưa học.
  // Đi qua state của router: bản đồ và trình phát là hai route (hai instance) khác nhau.
  const openLesson = (lessonId, part) => onLessonChange ? onLessonChange(lessonId, part) : navigate(`${basePath}/${lessonId}`, { state: { part } });
  const askedPart = useLocation().state?.part;
  // Thoát step thì về BẢN ĐỒ khoá học, không văng ra ngoài app.
  const exitLesson = () => onLessonChange ? onLessonChange(null) : navigate(basePath);

  // Quyền đọc step do MÁY CHỦ quyết định; client không tự đoán.
  const lessonLocked = [401, 403].includes(detailError?.status);

  // Khoá học miễn phí: bị từ chối chỉ còn hai lẽ — chưa đăng nhập (401) hoặc
  // mở từ Hugo Team khi không còn ở giai đoạn Coding (403).
  const lockedNotice = (
    <div className="max-w-lg mx-auto mt-10 rounded-2xl border border-border bg-card p-6 text-center space-y-3">
      <p className="text-[15px] font-black text-foreground">
        {detailError?.status === 401 ? edu("hub.loginToContinue") : edu("hub.cannotOpen")}
      </p>
      <p className="text-[14px] text-muted-foreground">{detailError?.message || edu("hub.freeNote")}</p>
      <div className="flex justify-center gap-2">
        {detailError?.status === 401 && (
          <a href="/login" className="px-4 py-2.5 rounded-xl bg-primary text-primary-foreground text-[14px] font-black">{edu("common.login")}</a>
        )}
        <button type="button" onClick={exitLesson} className="px-4 py-2.5 rounded-xl bg-muted text-foreground text-[14px] font-black">{edu("hub.backToMap")}</button>
      </div>
    </div>
  );

  const apiBase = import.meta.env.VITE_API_URL || "/api";

  /**
   * Nộp trắc nghiệm cuối step. Thành viên nộp qua /learn/quiz: máy chủ chấm,
   * ghi điểm, kiểm thứ tự step và quyền, đạt thì ghi tiến độ. Khách học thử chỉ
   * được chấm (không lưu) ở 6 step đầu.
   */
  const submitQuiz = async (course, answers) => {
    const member = Boolean(getMemberSession()?.email);
    const response = await fetch(member ? `${apiBase}/learn/quiz` : `${apiBase}/lessons/${course.id}/grade`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(member ? { lessonId: course.id, answers } : { answers }),
    });
    const data = await response.json().catch(() => ({}));
    // Chưa đạt vẫn là kết quả hợp lệ kèm lời giải, không phải lỗi mạng.
    if (!response.ok && data.code !== "QUIZ_BELOW_PASS") {
      throw new Error(data.error || edu("player.submitFailed"));
    }
    if (member && data.passed && !data.alreadyCompleted) {
      try {
        const key = CODER_STORAGE_KEYS.progress;
        const done = JSON.parse(localStorage.getItem(key) || "[]");
        if (Array.isArray(done) && !done.includes(course.id)) {
          localStorage.setItem(key, JSON.stringify([...done, course.id]));
        }
      } catch {
        /* hết quota: bản đồ tự đúng lại ở lần tải sau */
      }
      onBioUpdate?.({
        ...bio,
        completedLessons: [...new Set([...(bio?.completedLessons || []), course.id])],
        ...(data.eduStreak ? { edu: { ...(bio?.edu || {}), streak: data.eduStreak.streak } } : {}),
        scores: { ...(bio?.scores || {}), [course.id]: (({ best, firstTry } = bio?.scores?.[course.id] || {}) => ({ best: Math.max(Number(best) || 0, data.score), firstTry: firstTry ?? data.score }))() },
        ...(Number.isFinite(data.balance) ? { gems: data.balance } : {}),
      });
      announceStreak(data.eduStreak);
      // Qua step lần đầu: +5 Ngọc mỗi câu đúng (máy chủ tính, server/services/learning.js).
      if (data.gemsEarned > 0) notify.success(edu("hub.earned", { joy: gemText(data.gemsEarned), correct: data.correct, total: data.total }));
      if (program === "hugoteam") onProgramProgress?.(data);
    }
    if (member && program === "hugoteam" && data.alreadyCompleted) onProgramProgress?.(data);
    // Học lại step đã qua cũng giữ lửa hôm nay (Education Hugo).
    if (member && data.alreadyCompleted && data.eduStreak) {
      onBioUpdate?.({ ...bio, edu: { ...(bio?.edu || {}), streak: data.eduStreak.streak } });
      announceStreak(data.eduStreak);
    }
    if (!member && data.passed) notify.info(edu("hub.guestSaved"));
    return data;
  };

  // Education Hugo: chạm mốc → màn chúc mừng; bài ĐẦU TIÊN trong ngày → hoạt cảnh thắp lửa.
  // Chỉ đọc kết quả máy chủ trả về (eduStreak), không tự tính gì ở client.
  function announceStreak(eduStreak) {
    if (!eduStreak?.streak) return;
    const { streak, milestone } = eduStreak;
    const firstToday = streak.studiedToday && !bio?.edu?.streak?.studiedToday;
    if (milestone) window.dispatchEvent(new CustomEvent("edu:streak-milestone", { detail: { count: milestone.day, joy: milestone.gems, stage: streak.stage } }));
    else if (firstToday) window.dispatchEvent(new CustomEvent("edu:streak-milestone", { detail: { count: streak.count, stage: streak.stage } }));
  }

  const currentCourse = courses.find((course) => course.id === selectedLessonId) || null;
  // Step chia bài nhỏ; mở step là vào bài đầu tiên chưa học (step đã qua thì từ bài 1).
  const plan = useMemo(() => (currentCourse?.slides?.length ? stepLessons(currentCourse.slides) : null), [currentCourse?.slides]);
  const lessonsDone = (id) => (getMemberSession()?.email ? bio?.edu?.lessons?.[id] : readGuestLessons()[id]) || [];
  const [picked, setPicked] = useState({});
  useEffect(() => setPicked({}), [selectedLessonId]);
  const lessonAt = plan ? picked[currentCourse.id] ?? (Number.isInteger(askedPart) && askedPart < plan.length ? askedPart : null) ?? (progressBio?.completedLessons?.includes(currentCourse.id) ? 0 : nextLesson(plan.length, lessonsDone(currentCourse.id))) : 0;

  const finishLesson = async (course, lesson) => {
    if (!getMemberSession()?.email) {
      const all = readGuestLessons();
      all[course.id] = [...new Set([...(all[course.id] || []), lesson])];
      try { localStorage.setItem(GUEST_LESSONS, JSON.stringify(all)); } catch { /* chỉ mất tiến độ bài trong máy */ }
      return;
    }
    const response = await fetch(`${apiBase}/learn/lesson`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lessonId: course.id, lesson, program }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(data.error || edu("player.submitFailed"));
    onBioUpdate?.({
      ...bio,
      edu: { ...(bio?.edu || {}), lessons: { ...(bio?.edu?.lessons || {}), [course.id]: data.lessons }, ...(data.eduStreak ? { streak: data.eduStreak.streak } : {}) },
      ...(Number.isFinite(data.balance) ? { gems: data.balance } : {}),
    });
    announceStreak(data.eduStreak);
  };
  // Step kế tiếp theo đúng thứ tự lộ trình; step cuối thì không có nút "Step tiếp".
  const nextLessonId = (() => {
    const at = courses.findIndex((course) => course.id === selectedLessonId);
    return at >= 0 ? courses[at + 1]?.id || null : null;
  })();
  const playable = currentCourse && !lessonLocked && (currentCourse.draft || detailReady);

  const progressSheet = progressOpen && (
    <div className="cmap-sheet-backdrop" role="presentation" onClick={() => setProgressOpen(false)}>
      <div className="cmap-sheet coder-progress-sheet" role="dialog" aria-modal="true" aria-label="Tiến độ" onClick={(event) => event.stopPropagation()}>
        <button type="button" className="cmap-sheet-close" onClick={() => setProgressOpen(false)} aria-label="Đóng"><X aria-hidden="true" /></button>
        <ManageTab bio={bio} courses={courses} stages={stages} />
      </div>
    </div>
  );

  if (framed) {
    return (
      <>
        <CoderLearningJourney bio={progressBio} courses={courses} stages={stages} loading={loading} onOpenLesson={openLesson} includeLocalProgress={program !== "hugoteam"} />
        {progressSheet}
      </>
    );
  }

  return (
    <div className="hugo-coder-shell fixed inset-0 z-50 flex flex-col text-foreground">
      {playable ? (
        <LessonPlayer
          key={`${currentCourse.id}@${lessonAt}`}
          course={currentCourse}
          plan={plan}
          lesson={lessonAt}
          // Ghim bài đang học TRƯỚC khi máy chủ ghi tiến độ: tiến độ đổi thì lessonAt tự nhảy sang bài
          // kế, trình phát dựng lại và mất màn chúc mừng. Chỉ nút "Học tiếp" (onNextPart) mới sang bài mới.
          onLessonDone={() => { setPicked((all) => ({ ...all, [currentCourse.id]: lessonAt })); return finishLesson(currentCourse, lessonAt); }}
          onNextPart={() => setPicked((all) => ({ ...all, [currentCourse.id]: lessonAt + 1 }))}
          onExit={() => { setPicked(({ [currentCourse.id]: _drop, ...rest }) => rest); exitLesson(); }}
          onSubmitQuiz={(answers) => submitQuiz(currentCourse, answers)}
          onNextLesson={nextLessonId ? () => openLesson(nextLessonId) : undefined}
        />
      ) : (
        <>
          <header className="coder-hub-header shrink-0">
            <div className="coder-hub-titlebar">
              <button onClick={currentCourse ? exitLesson : onBack} className="coder-hub-back" aria-label={t("hugoCoderLearning.back")}>
                <ChevronLeft />
                <span>{t("hugoCoderLearning.back")}</span>
              </button>
              <div className="coder-hub-brand">
                <span><Braces /></span>
                <h2>Coding</h2>
              </div>
              {/* Tiến độ, giấy chứng nhận và gói đã sở hữu — gom vào một nút. */}
              <button type="button" className="coder-hub-progress" onClick={() => setProgressOpen(true)} aria-label="Tiến độ và giấy chứng nhận">
                <Award aria-hidden="true" />
                <span>Tiến độ</span>
              </button>
            </div>
          </header>

          <div className="flex-1 min-h-0">
            {lessonLocked ? (
              <div className="h-full overflow-y-auto px-4">
                {lockedNotice}
              </div>
            ) : (
              <div className="h-full overflow-x-hidden overflow-y-auto overscroll-y-contain">
                <CoderLearningJourney
                  bio={progressBio}
                  courses={courses}
                  stages={stages}
                  loading={loading || Boolean(currentCourse && !detailError)}
                  onOpenLesson={openLesson}
                  includeLocalProgress={program !== "hugoteam"}
                />
              </div>
            )}
          </div>
        </>
      )}

      {progressSheet}
    </div>
  );
}
