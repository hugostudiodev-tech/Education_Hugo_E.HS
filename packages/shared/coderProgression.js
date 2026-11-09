import { STAGES } from "../courses/coding/stages.js";
import { STEP_IDS as SQL_STEP_IDS } from "../courses/sql/stages.js";
import { STEP_IDS as PYTHON_ADVANCED_STEP_IDS } from "../courses/python-advanced/stages.js";

// Ranh giới chặng (đánh số step từ 1) suy từ đề cương khoá Coding.
export const CODER_STAGE_SEQUENCE = Object.freeze(
  STAGES.map(({ id, from, to }) => Object.freeze({ id, from: from + 1, to })),
);

const lessonIdFor = (number) => `step${number}`;

// ── HugoTeam dùng CHÍNH chương trình Coding ──────────────────────────────────
// Trước đây HugoTeam tự đếm "16 step" riêng (cắt ngang chặng CODE 202) và lưu
// tiến độ ở chỗ riêng, nên hai bên lệch số, lệch kết quả. Giờ cả hai đọc cùng
// `bio.completedLessons`; HugoTeam chỉ cần biết tổng số step và thời hạn.
export const CODER_TOTAL_STEPS = CODER_STAGE_SEQUENCE.at(-1)?.to || 0;
/** Qua một step LẦN ĐẦU: mỗi câu trắc nghiệm đúng được ngần này Ngọc (học lại không cộng). */
export const GEMS_PER_CORRECT = 5;

function getCoderStage(stageId) {
  return CODER_STAGE_SEQUENCE.find((stage) => stage.id === stageId) || null;
}

function getCoderStageForLesson(lessonId) {
  const match = /^step(\d{1,3})$/.exec(String(lessonId || ""));
  if (!match) return null;
  const lessonNumber = Number(match[1]);
  return CODER_STAGE_SEQUENCE.find(
    (stage) => lessonNumber >= stage.from && lessonNumber <= stage.to,
  ) || null;
}

export function getCoderStageCompletion(completedLessons, stageId) {
  const stage = getCoderStage(stageId);
  if (!stage) return { stage: null, completed: 0, total: 0, missingLessons: [] };

  const completed = new Set(Array.isArray(completedLessons) ? completedLessons : []);
  const requiredLessons = Array.from(
    { length: stage.to - stage.from + 1 },
    (_, index) => lessonIdFor(stage.from + index),
  );
  const missingLessons = requiredLessons.filter((lessonId) => !completed.has(lessonId));

  return {
    stage,
    completed: requiredLessons.length - missingLessons.length,
    total: requiredLessons.length,
    missingLessons,
  };
}

export function getCoderLessonGate(completedLessons, lessonId) {
  // Khoá Python cơ bản (py1–py40) mở hết, không bắt học theo thứ tự.
  if (/^py\d+$/.test(String(lessonId))) return { unlocked: true, code: null, stage: null, missingLessons: [] };
  const advancedIndex = PYTHON_ADVANCED_STEP_IDS.indexOf(lessonId);
  if (advancedIndex >= 0) {
    const completed = new Set(Array.isArray(completedLessons) ? completedLessons : []);
    const missingLessons = PYTHON_ADVANCED_STEP_IDS.slice(0, advancedIndex)
      .filter((id) => !completed.has(id));
    return {
      unlocked: !missingLessons.length,
      code: missingLessons.length ? "PREVIOUS_LESSONS_INCOMPLETE" : null,
      stage: null,
      missingLessons,
    };
  }
  // Khoá SQL: cùng luật "học đúng thứ tự", chỉ tính các step sql trước nó.
  const sqlIndex = SQL_STEP_IDS.indexOf(lessonId);
  if (sqlIndex >= 0) {
    const completed = new Set(Array.isArray(completedLessons) ? completedLessons : []);
    const missingLessons = SQL_STEP_IDS.slice(0, sqlIndex).filter((id) => !completed.has(id));
    return { unlocked: !missingLessons.length, code: missingLessons.length ? "PREVIOUS_LESSONS_INCOMPLETE" : null, stage: null, missingLessons };
  }
  const stage = getCoderStageForLesson(lessonId);
  if (!stage) return { unlocked: false, code: "INVALID_LESSON", missingLessons: [] };

  const lessonNumber = Number(String(lessonId).replace("step", ""));
  const completed = new Set(Array.isArray(completedLessons) ? completedLessons : []);
  const missingLessons = Array.from(
    { length: Math.max(0, lessonNumber - 1) },
    (_, index) => lessonIdFor(index + 1),
  ).filter((requiredLessonId) => !completed.has(requiredLessonId));

  return {
    unlocked: missingLessons.length === 0,
    code: missingLessons.length ? "PREVIOUS_LESSONS_INCOMPLETE" : null,
    stage,
    missingLessons,
  };
}

