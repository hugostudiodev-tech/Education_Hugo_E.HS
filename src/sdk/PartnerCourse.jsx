import { useEffect, useMemo, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import CourseMap from "../components/member/hugoCoder/CourseMap";
import LessonPlayer from "../components/member/hugoCoder/LessonPlayer";
import { useCoderLessons } from "../hooks/useCoderLessons";
import { apiFetch } from "../services/api/core/apiClient";
import { configurePartner } from "../config/partner";
import { nextLesson, stepLessons } from "../../packages/courses/coding/lessons.js";
import { themeVars } from "./theme";
import "../education/education.css";

export const DEFAULT_API = "https://api.hugowishpax.studio/api";
export const ASSET_ORIGIN = "https://education.hugowishpax.studio";

// Tiến độ của học viên bên đối tác nằm trong máy của họ (localStorage), tách theo khoá.
const store = (course) => `edu.partner.${course}`;
const readProgress = (course) => {
  try { return JSON.parse(localStorage.getItem(store(course))) || { done: [], lessons: {} }; } catch { return { done: [], lessons: {} }; }
};
const writeProgress = (course, value) => { try { localStorage.setItem(store(course), JSON.stringify(value)); } catch { /* hết quota */ } };

function Course({ course, onProgress }) {
  const [openId, setOpenId] = useState(null);
  const [progress, setProgress] = useState(() => readProgress(course));
  const [picked, setPicked] = useState(null);
  const { courses, stages, loading, detailReady, error } = useCoderLessons(openId, { course });
  const save = (next) => { setProgress(next); writeProgress(course, next); onProgress?.(next); };

  const completedSet = useMemo(() => new Set(progress.done), [progress.done]);
  const currentIndex = Math.max(0, courses.findIndex((c) => !completedSet.has(c.id) && !c.draft));
  const current = openId ? courses.find((c) => c.id === openId) : null;
  const plan = useMemo(() => (current?.slides?.length ? stepLessons(current.slides) : null), [current?.slides]);
  const lessonAt = plan ? picked ?? (completedSet.has(current.id) ? 0 : nextLesson(plan.length, progress.lessons[current.id] || [])) : 0;
  useEffect(() => setPicked(null), [openId]);

  if (error && !courses.length) return <p className="edu-partner-note">{error.message}</p>;
  if (loading && !courses.length) return <p className="edu-partner-note">…</p>;

  if (current && detailReady) {
    const at = courses.findIndex((c) => c.id === current.id);
    const next = courses[at + 1];
    return (
      <LessonPlayer
        key={`${current.id}@${lessonAt}`}
        course={current}
        plan={plan}
        lesson={lessonAt}
        onLessonDone={async () => {
          setPicked(lessonAt);
          const lessons = { ...progress.lessons, [current.id]: [...new Set([...(progress.lessons[current.id] || []), lessonAt])] };
          save({ ...progress, lessons });
        }}
        onNextPart={() => setPicked(lessonAt + 1)}
        onExit={() => setOpenId(null)}
        onSubmitQuiz={async (answers) => {
          const data = await apiFetch(`/coder-lessons/${encodeURIComponent(current.id)}/grade`, { method: "POST", body: JSON.stringify({ answers }) });
          if (data.passed && !completedSet.has(current.id)) save({ ...progress, done: [...progress.done, current.id] });
          return data;
        }}
        onNextLesson={next && !next.draft ? () => setOpenId(next.id) : undefined}
      />
    );
  }
  return (
    <CourseMap
      courses={courses}
      stages={stages}
      completedSet={completedSet}
      currentIndex={currentIndex}
      focusId={courses[currentIndex]?.id}
      lessonsDone={progress.lessons}
      serverCompleted={progress.done}
      onOpenLesson={setOpenId}
    />
  );
}

/**
 * Khoá học Education Hugo hoàn chỉnh (bản đồ chặng + trình học + chấm bài), giao diện
 * y hệt education.hugowishpax.studio. Cần key đối tác do admin Hugo Studio cấp.
 */
export function EducationHugo({ apiKey, course = "coding", lang = "vi", theme, apiBase = DEFAULT_API, assetBase = ASSET_ORIGIN, onProgress, className = "" }) {
  // Đặt cấu hình TRƯỚC lần vẽ đầu: các hook con gọi API ngay khi mount.
  useState(() => configurePartner({ apiBase, key: apiKey, lang, assetBase }));
  useEffect(() => { configurePartner({ apiBase, key: apiKey, lang, assetBase }); }, [apiBase, apiKey, lang, assetBase]);
  const [client] = useState(() => new QueryClient({ defaultOptions: { queries: { refetchOnWindowFocus: false } } }));
  const [state, setState] = useState({ status: "checking" });

  useEffect(() => {
    let alive = true;
    setState({ status: "checking" });
    apiFetch("/edu-partner/verify", { method: "POST", body: "{}" })
      .then((data) => alive && setState({ status: "ok", ...data }))
      .catch((error) => alive && setState({ status: "invalid", message: error.message }));
    return () => { alive = false; };
  }, [apiKey, apiBase]);

  return (
    <div className={`edu edu-partner ${className}`.trim()} style={themeVars(theme)} lang={lang}>
      {state.status === "checking" && <p className="edu-partner-note">…</p>}
      {state.status === "invalid" && <p className="edu-partner-note" role="alert">Education Hugo: {state.message}</p>}
      {state.status === "ok" && (
        <QueryClientProvider client={client}>
          <Course course={course} onProgress={onProgress} />
        </QueryClientProvider>
      )}
      <Toaster position="top-center" />
    </div>
  );
}
