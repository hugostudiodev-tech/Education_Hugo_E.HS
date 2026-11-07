import assert from 'node:assert';
const root = new URL("../..", import.meta.url).pathname.replace(/\/$/, "");
const { dueReviews } = await import(`${root}/server/services/practice.js`);
const { gradeStepQuiz } = await import(`${root}/server/services/grading.js`);
const { findStep } = await import(`${root}/packages/courses/index.js`);
const { presentQuiz } = await import(`${root}/packages/shared/stepQuiz.js`);
const { isQuizAnswerCorrect } = await import(`${root}/packages/shared/quizKinds.js`);

// Ôn ngắt quãng: 70% hôm qua → đến hạn; 95% hôm qua → chưa; chưa có ngày → đến hạn.
const doc = { completed: ['step1', 'step2', 'step3'], scores: { step1: { best: 70 }, step2: { best: 95 } }, reviewedOn: { step1: '2026-11-06', step2: '2026-11-06' } };
const due = dueReviews(doc, '2026-11-07').map((r) => r.stepId);
assert.deepEqual(due.sort(), ['step1', 'step3']);
assert.ok(dueReviews(doc, '2026-11-07').every((r) => r.part > 0));

// Chỉ số câu trong sổ câu sai khớp với đề máy chủ chấm.
const quiz = presentQuiz(findStep('step1').step.quiz);
const graded = gradeStepQuiz('step1', quiz.map((q) => q.a));
assert.equal(graded.score, 100);
assert.ok(quiz.every((q) => isQuizAnswerCorrect(q, q.a)));
const wrong = gradeStepQuiz('step1', quiz.map((q, i) => (i === 1 ? null : q.a)));
assert.deepEqual(wrong.review.flatMap((r, i) => (r.correct ? [] : [i])), [1]);
console.log('ok');
process.exit(0);
