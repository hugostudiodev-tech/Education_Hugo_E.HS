// Khoá Python: mọi ô `py` (ví dụ + lời giải bài tập) phải chạy được bằng python3 với `stdin` của nó,
// lời giải phải in ra gì đó và có gợi ý. Ô ví dụ "Cố ý sai" thì phải báo lỗi thật.
// ponytail: chạy bằng python3 của máy (CPython) thay vì Pyodide — cùng ngôn ngữ, khỏi tải 10 MB.
import { spawnSync } from "node:child_process";
import { WEB_COURSES, STEP_IDS, MAX_SLIDES } from "../../packages/courses/python/index.js";
import { findStep } from "../../packages/courses/index.js";
import { validateQuizQuestion } from "../../packages/shared/quizKinds.js";

const run = (code, stdin = "") => spawnSync("python3", ["-I", "-c", code], { input: stdin, encoding: "utf8", timeout: 5000 });
const issues = [];
const sections = ["intro", "visual", "research", "ideate", "core", "apply"];
const questions = new Map();
let cells = 0;
const inquirySlides = WEB_COURSES
  .filter((step) => ["py35", "py40"].includes(step.id))
  .flatMap((step) => step.slides.filter((slide) => slide.section === "research"));
const inquiryText = inquirySlides.map((slide) => slide.body || "").join("\n").toLocaleLowerCase("vi");
if (STEP_IDS.length !== 40 || WEB_COURSES.length !== 40) {
  issues.push(`Cần kết nối đủ 40 bài Python; đề cương có ${STEP_IDS.length}, registry có ${WEB_COURSES.length}.`);
}
for (const [label, pattern] of [
  ["câu hỏi nghiên cứu", /câu hỏi/],
  ["dự đoán trước khi chạy", /dự đoán/],
  ["dữ liệu mẫu", /mẫu/],
  ["dữ liệu giả lập", /giả lập/],
  ["bảo vệ tên người học", /ẩn danh|thay cho tên|thay tên/],
  ["giới hạn kết luận", /không chứng minh|chưa biết.*làm/],
  ["khả năng chạy lại", /tái lập|chạy lại/],
]) {
  if (!pattern.test(inquiryText)) issues.push(`Thiếu nội dung Science & Research: ${label}.`);
}
for (const [index, id] of STEP_IDS.entries()) {
  const found = findStep(id);
  if (!found || found.key !== "python" || found.index !== index) {
    issues.push(`${id}: chưa được kết nối đúng thứ tự trong registry khoá học.`);
  }
}
for (const [stepIndex, step] of WEB_COURSES.filter((s) => !s.draft).entries()) {
  if (step.id !== `py${stepIndex + 1}`) issues.push(`${step.id}: id hoặc thứ tự step không liên tục.`);
  if (step.slides.length + step.quiz.length > MAX_SLIDES) issues.push(`${step.id}: slide + quiz vượt ${MAX_SLIDES}.`);
  let lastSection = -1;
  step.slides.forEach((slide, i) => {
    const section = sections.indexOf(slide.section);
    if (section < lastSection) issues.push(`${step.id}.slides[${i}]: section sai thứ tự.`);
    lastSection = Math.max(lastSection, section);
    if (slide.section === "research" && !/^>\s*.+\((?:\d{4}|n\.d\.)\)/m.test(slide.body || "")) {
      issues.push(`${step.id}.slides[${i}]: phần Research cần trích dẫn nguồn có tác giả và năm.`);
    }
    if (!slide.py) return;
    const where = `${step.id}.slides[${i}]`;
    const broken = /cố ý sai/i.test(slide.body);
    if (slide.py.code?.trim() && !slide.py.solution) {
      cells += 1;
      const r = run(slide.py.code, slide.py.stdin);
      if (broken && r.status === 0) issues.push(`${where}: ghi "cố ý sai" nhưng code chạy không lỗi.`);
      if (!broken && r.status !== 0) issues.push(`${where}.code: ${(r.stderr || r.error?.message || "").trim().split("\n").at(-1)}`);
    }
    if (slide.py.solution) {
      cells += 1;
      const r = run(slide.py.solution, slide.py.stdin);
      if (r.status !== 0) issues.push(`${where}.solution: ${(r.stderr || "").trim().split("\n").at(-1)}`);
      else if (!r.stdout.trim()) issues.push(`${where}: lời giải không in gì.`);
      if (!slide.py.hints?.length) issues.push(`${where}: bài tập thiếu gợi ý.`);
      if (run(slide.py.code || "", slide.py.stdin).stdout === r.stdout) issues.push(`${where}: code khởi đầu đã cho ra đúng đáp án.`);
    }
  });
  for (const section of sections) if (!step.slides.some((slide) => slide.section === section)) issues.push(`${step.id}: thiếu section ${section}.`);
  if (step.quiz.length < 8) issues.push(`${step.id}: cần ít nhất 8 câu quiz.`);
  step.quiz.forEach((question, i) => {
    issues.push(...validateQuizQuestion(question, `${step.id}.quiz[${i}]`));
    const key = question.q?.toLocaleLowerCase("vi").replace(/\s+/g, " ").trim();
    if (key && questions.has(key)) issues.push(`${step.id}.quiz[${i}]: trùng câu hỏi ${questions.get(key)}.`);
    else if (key) questions.set(key, `${step.id}.quiz[${i}]`);
  });
}
if (issues.length) {
  console.error(`check:python-course — ${issues.length} lỗi:\n- ${issues.join("\n- ")}`);
  process.exit(1);
}
console.log(`check:python-course OK — ${cells} ô Python chạy đúng.`);
