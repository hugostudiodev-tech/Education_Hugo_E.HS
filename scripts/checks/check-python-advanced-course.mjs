import { existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { WEB_COURSES, STEP_IDS, MAX_SLIDES, STEP_PASS_PERCENT, STAGES } from "../../packages/courses/python-advanced/index.js";
import { COURSES, findStep } from "../../packages/courses/index.js";
import { getCoderLessonGate } from "../../packages/shared/coderProgression.js";
import { validateQuizQuestion } from "../../packages/shared/quizKinds.js";
import { presentQuiz } from "../../packages/shared/stepQuiz.js";
import { gradeStepQuiz } from "../../server/services/grading.js";

const issues = [];
const stepDirectory = resolve(dirname(fileURLToPath(import.meta.url)), "../../packages/courses/python-advanced/steps");
const runPython = (code) => spawnSync("python3", ["-I", "-c", code], {
  encoding: "utf8",
  timeout: 5000,
});
const sections = ["intro", "visual", "research", "ideate", "core", "apply"];
const questionKeys = new Map();
let pythonCells = 0;
let sqlCells = 0;

if (STEP_IDS.length !== 40 || WEB_COURSES.length !== 40) {
  issues.push(`Khoá phải kết nối đủ 40 bài; IDs=${STEP_IDS.length}, registry=${WEB_COURSES.length}.`);
}
if (STEP_PASS_PERCENT !== 60 || COURSES["python-advanced"]?.preview !== 0) {
  issues.push("Khoá nâng cao phải yêu cầu 60% và không được mở bài công khai trước khi đăng nhập.");
}
if (STAGES.length !== 8 || STAGES.some((stage) => stage.to - stage.from !== 5)) {
  issues.push("Cần đúng 8 chặng, mỗi chặng 5 bài.");
}

for (const [index, id] of STEP_IDS.entries()) {
  const found = findStep(id);
  if (!existsSync(resolve(stepDirectory, `step${index + 1}.js`))) {
    issues.push(`${id}: thiếu file nội dung steps/step${index + 1}.js.`);
  }
  if (id !== `pa${index + 1}` || !found || found.key !== "python-advanced" || found.index !== index) {
    issues.push(`${id}: ID hoặc vị trí trong registry không đúng.`);
  }
}

for (const [stepIndex, step] of WEB_COURSES.entries()) {
  if (step.id !== `pa${stepIndex + 1}`) issues.push(`${step.id}: thứ tự step không liên tục.`);
  if (step.slides.length + step.quiz.length > MAX_SLIDES) {
    issues.push(`${step.id}: slide + quiz vượt giới hạn ${MAX_SLIDES}.`);
  }
  const codeSlides = step.slides.filter((slide) => slide.py?.code);
  const guidedCodeSlides = step.slides.filter((slide) => slide.section === "core" && slide.py?.code);
  if (stepIndex > 0 && (codeSlides.length < 3 || guidedCodeSlides.length < 2)) {
    issues.push(`${step.id}: cần ít nhất 2 bước code có thể chạy và 1 bài thực hành có giao diện code.`);
  }
  if (step.id === "pa1" && !codeSlides.length) {
    issues.push("pa1: phần giới thiệu dự án cần có ô code chạy thử.");
  }
  if (step.id === "pa36" && (
    guidedCodeSlides.length !== 3
    || !step.slides.some((slide) => slide.body?.includes("python -m lablog.cli import-data --file data/sample.csv --study sleep-focus"))
  )) {
    issues.push("pa36: cần 3 bước code tăng dần và hướng dẫn chạy CLI LabLog trên máy.");
  }
  const seenSections = new Set(step.slides.map((slide) => slide.section));
  for (const section of sections) {
    if (!seenSections.has(section) && step.id !== "pa1") issues.push(`${step.id}: thiếu section ${section}.`);
  }
  let lastSection = -1;
  for (const [slideIndex, slide] of step.slides.entries()) {
    const sectionIndex = sections.indexOf(slide.section);
    if (sectionIndex < lastSection) issues.push(`${step.id}.slides[${slideIndex}]: section sai thứ tự.`);
    lastSection = Math.max(lastSection, sectionIndex);
    if (slide.section === "research" && !/^>\s*.+\((?:\d{4}|n\.d\.)\).+https:\/\/\S+/m.test(slide.body || "")) {
      issues.push(`${step.id}.slides[${slideIndex}]: thiếu trích dẫn học thuật có URL.`);
    }
    if (slide.py?.code) {
      pythonCells += 1;
      const result = runPython(slide.py.code);
      if (result.status !== 0) issues.push(`${step.id}.slides[${slideIndex}].py.code: ${(result.stderr || result.error?.message || "").trim().split("\n").at(-1)}`);
    }
    if (slide.py?.solution) {
      pythonCells += 1;
      const result = runPython(slide.py.solution);
      if (result.status !== 0) issues.push(`${step.id}.slides[${slideIndex}].py.solution: ${(result.stderr || result.error?.message || "").trim().split("\n").at(-1)}`);
      else if (!result.stdout.trim()) issues.push(`${step.id}.slides[${slideIndex}]: lời giải không in kết quả.`);
      else if (runPython(slide.py.code || "").stdout === result.stdout) {
        issues.push(`${step.id}.slides[${slideIndex}]: mã khởi đầu đã cho đúng đầu ra lời giải.`);
      }
      if (!slide.py.hints?.length) issues.push(`${step.id}.slides[${slideIndex}]: bài tập thiếu gợi ý.`);
    }
    if (slide.sql) {
      sqlCells += 1;
      const result = runPython(
        `import sqlite3\nconnection = sqlite3.connect(':memory:')\nconnection.executescript(${JSON.stringify(slide.sql.setup || "")})\nconnection.executescript(${JSON.stringify(slide.sql.query || "")})`,
      );
      if (result.status !== 0) issues.push(`${step.id}.slides[${slideIndex}].sql: ${(result.stderr || result.error?.message || "").trim().split("\n").at(-1)}`);
    }
  }
  const expectedQuizCount = step.id === "pa1" ? 30 : 8;
  if (step.quiz.length !== expectedQuizCount) {
    issues.push(`${step.id}: cần đúng ${expectedQuizCount} câu quiz, hiện có ${step.quiz.length}.`);
  }
  for (const [questionIndex, question] of step.quiz.entries()) {
    issues.push(...validateQuizQuestion(question, `${step.id}.quiz[${questionIndex}]`));
    if (!question.why?.trim()) issues.push(`${step.id}.quiz[${questionIndex}]: thiếu giải thích đáp án.`);
    const key = question.q?.toLocaleLowerCase("vi").replace(/\s+/g, " ").trim();
    if (key && questionKeys.has(key)) issues.push(`${step.id}.quiz[${questionIndex}]: trùng câu hỏi ${questionKeys.get(key)}.`);
    else if (key) questionKeys.set(key, `${step.id}.quiz[${questionIndex}]`);
  }
}

if (STEP_IDS.length === 40) {
  const admissionGate = getCoderLessonGate([], "pa1");
  const nextBeforePass = getCoderLessonGate([], "pa2");
  const nextAfterPass = getCoderLessonGate(["pa1"], "pa2");
  const laterOutOfOrder = getCoderLessonGate(["pa1"], "pa3");
  if (!admissionGate.unlocked || nextBeforePass.unlocked || !nextAfterPass.unlocked || laterOutOfOrder.unlocked) {
    issues.push("Gate phải mở pa1, khóa pa2 trước khi qua pa1 và bắt buộc hoàn thành tuần tự.");
  }
}

const admissionQuiz = WEB_COURSES.find((step) => step.id === "pa1")?.quiz || [];
const shuffledAdmissionQuiz = presentQuiz(admissionQuiz);
const passing = shuffledAdmissionQuiz.map((question, index) => (
  index < 18 ? question.a : (question.a + 1) % question.o.length
));
const failing = shuffledAdmissionQuiz.map((question, index) => (
  index < 17 ? question.a : (question.a + 1) % question.o.length
));
const passingGrade = gradeStepQuiz("pa1", passing);
const failingGrade = gradeStepQuiz("pa1", failing);
if (passingGrade?.total !== 30 || passingGrade.score !== 60 || !passingGrade.passed) {
  issues.push("18/30 câu phải đạt chính xác 60% và mở được khoá.");
}
if (failingGrade?.score !== 57 || failingGrade.passed) {
  issues.push("17/30 câu không được đạt ngưỡng 60%.");
}
if (pythonCells < 100 || sqlCells < 5) {
  issues.push(`Thiếu ví dụ chạy được: Python=${pythonCells}, SQL=${sqlCells}.`);
}

if (issues.length) {
  console.error(`check:python-advanced-course — ${issues.length} lỗi:\n- ${issues.join("\n- ")}`);
  process.exit(1);
}
console.log(`check:python-advanced-course OK — 40 bài, bài đầu 30 câu / ngưỡng 60%, ${pythonCells} ô Python và ${sqlCells} ô SQL chạy đúng.`);
