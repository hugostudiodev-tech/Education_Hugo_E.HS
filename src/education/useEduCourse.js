import { useEffect, useState } from "react";

// Khoá đang học (coding | sql | python) — lưu trên máy, đồng bộ giữa thanh trên và bản đồ /learn qua một sự kiện.
const KEY = "edu.course";
const EVENT = "edu-course";
const KNOWN = ["coding", "sql", "python", "python-advanced"];
const read = () => { try { const v = localStorage.getItem(KEY); return KNOWN.includes(v) ? v : "coding"; } catch { return "coding"; } };

export function setEduCourse(course) {
  try { localStorage.setItem(KEY, course); } catch { /* chế độ riêng tư */ }
  window.dispatchEvent(new Event(EVENT));
}

export function useEduCourse() {
  const [course, setCourse] = useState(read);
  useEffect(() => {
    const sync = () => setCourse(read());
    window.addEventListener(EVENT, sync);
    return () => window.removeEventListener(EVENT, sync);
  }, []);
  return course;
}
