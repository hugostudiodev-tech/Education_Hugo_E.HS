// Khoá Python: mọi ô `py` (ví dụ + lời giải bài tập) phải chạy được bằng python3 với `stdin` của nó,
// lời giải phải in ra gì đó và có gợi ý. Ô ví dụ "Cố ý sai" thì phải báo lỗi thật.
// ponytail: chạy bằng python3 của máy (CPython) thay vì Pyodide — cùng ngôn ngữ, khỏi tải 10 MB.
import { spawnSync } from "node:child_process";
import { WEB_COURSES } from "../../packages/courses/python/index.js";

const run = (code, stdin = "") => spawnSync("python3", ["-I", "-c", code], { input: stdin, encoding: "utf8", timeout: 5000 });
const issues = [];
let cells = 0;
for (const step of WEB_COURSES.filter((s) => !s.draft)) {
  step.slides.forEach((slide, i) => {
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
}
if (issues.length) {
  console.error(`check:python-course — ${issues.length} lỗi:\n- ${issues.join("\n- ")}`);
  process.exit(1);
}
console.log(`check:python-course OK — ${cells} ô Python chạy đúng.`);
