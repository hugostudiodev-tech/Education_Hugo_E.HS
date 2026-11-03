import { apiFetch } from "../core/apiClient";

export function fetchLessonPage(page = 1, signal, course = "coding") {
  return apiFetch(`/lessons?page=${page}&limit=50${course === "coding" ? "" : `&course=${course}`}`, { signal });
}

export function fetchLesson(lessonId, signal, program = "coding", lang = "vi") {
  const params = new URLSearchParams();
  if (program === "hugoteam") params.set("program", "hugoteam");
  if (lang !== "vi") params.set("lang", lang);
  const query = params.size ? `?${params}` : "";
  return apiFetch(`/lessons/${encodeURIComponent(lessonId)}${query}`, { signal });
}
