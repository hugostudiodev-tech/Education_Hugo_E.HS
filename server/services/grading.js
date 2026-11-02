// Chấm trắc nghiệm cuối step trên máy chủ — điểm client tự khai không bao giờ được tin.
import { STEP_PASS_PERCENT } from '../../packages/courses/coding/index.js';
import { ALL_STEPS } from '../../packages/courses/index.js';
import { isQuizAnswerCorrect, quizAnswerText } from '../../packages/shared/quizKinds.js';
import { presentQuiz } from '../../packages/shared/stepQuiz.js';

export const PASS_PERCENT = STEP_PASS_PERCENT;
const STEPS = new Map(ALL_STEPS.map((step) => [step.id, step]));

/** `answers[i]` trả lời câu thứ i của đề ĐÃ XÁO (publicQuiz). `review` chỉ trả về SAU khi nộp. */
export function gradeStepQuiz(stepId, answers) {
  const quiz = presentQuiz(STEPS.get(stepId)?.quiz || []);
  if (!quiz.length) return null;
  const given = Array.isArray(answers) && answers.length === quiz.length ? answers : [];
  const review = quiz.map((question, index) => ({ correct: isQuizAnswerCorrect(question, given[index]), answer: quizAnswerText(question), why: question.why || '' }));
  const correct = review.filter((item) => item.correct).length;
  const score = Math.round((correct / quiz.length) * 100);
  return { score, correct, total: quiz.length, passed: score >= PASS_PERCENT, review };
}
