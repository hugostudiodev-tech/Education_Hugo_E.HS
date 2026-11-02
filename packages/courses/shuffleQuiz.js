// Xáo thứ tự đáp án trắc nghiệm một lần lúc nạp khoá: cố định theo id step + vị trí câu
// (mọi lần chạy cho cùng kết quả, chấm điểm phía server vẫn khớp). Tránh việc đáp án đúng
// luôn là A khi soạn bài.
function seeded(seed) {
  let h = 2166136261;
  for (const ch of seed) h = Math.imul(h ^ ch.charCodeAt(0), 16777619);
  return () => ((h = Math.imul(h ^ (h >>> 15), 2246822507) >>> 0) / 2 ** 32);
}

function shuffleQuestion(question, seed) {
  if (!Array.isArray(question.o) || question.o.length < 2 || question.a === undefined) return question;
  const rand = seeded(seed);
  const order = question.o.map((_, i) => i);
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  const to = (oldIndex) => order.indexOf(oldIndex);
  return {
    ...question,
    o: order.map((i) => question.o[i]),
    a: Array.isArray(question.a) ? question.a.map(to).sort((x, y) => x - y) : to(question.a),
  };
}

export const shuffleQuiz = (step) =>
  step.quiz ? { ...step, quiz: step.quiz.map((question, i) => shuffleQuestion(question, `${step.id}:${i}`)) } : step;
