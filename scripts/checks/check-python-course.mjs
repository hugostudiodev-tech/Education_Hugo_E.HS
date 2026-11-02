// Khoá Python: mọi ô `py` (ví dụ + lời giải bài tập) phải chạy được bằng python3 với `stdin` của nó,
// lời giải phải in ra gì đó và có gợi ý. Ô ví dụ "Cố ý sai" thì phải báo lỗi thật.
// ponytail: chạy bằng python3 của máy (CPython) thay vì Pyodide — cùng ngôn ngữ, khỏi tải 10 MB.
import { spawnSync } from "node:child_process";
import { WEB_COURSES, MAX_SLIDES } from "../../packages/courses/python/index.js";
import { validateQuizQuestion } from "../../packages/shared/quizKinds.js";

const run = (code, stdin = "") => spawnSync("python3", ["-I", "-c", code], { input: stdin, encoding: "utf8", timeout: 5000 });
const issues = [];
const sections = ["intro", "visual", "research", "ideate", "core", "apply"];
const questions = new Map();
let cells = 0;
for (const [stepIndex, step] of WEB_COURSES.filter((s) => !s.draft).entries()) {
  if (step.id !== `py${stepIndex + 1}`) issues.push(`${step.id}: id hoặc thứ tự step không liên tục.`);
  if (step.slides.length + step.quiz.length > MAX_SLIDES) issues.push(`${step.id}: slide + quiz vượt ${MAX_SLIDES}.`);
  let lastSection = -1;
  step.slides.forEach((slide, i) => {
    const section = sections.indexOf(slide.section);
    if (section < lastSection) issues.push(`${step.id}.slides[${i}]: section sai thứ tự.`);
    lastSection = Math.max(lastSection, section);
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
