// Luyện tập: nhiệm vụ ngày, gợi ý ôn (ôn ngắt quãng), sổ câu sai, thách đấu bạn bè.
// Mọi thứ đọc từ dữ liệu sẵn có: nhật ký học (Activity), điểm (scores), ngày ôn (reviewedOn).
import mongoose from 'mongoose';
import { Activity, Challenge, GemTxn, Learner } from '../models.js';
import { addGems } from './gems.js';
import { addXp, XP_REVIEW } from './social.js';
import { gradeStepQuiz, PASS_PERCENT } from './grading.js';
import { notify } from '../lib/notify.js';
import { fail } from '../lib/limits.js';
import { cleanEduPrefs, clockIn, dayStartIn, vnClock } from '../../packages/shared/eduPrefs.js';
import { findStep } from '../../packages/courses/index.js';
import { localizeCourse } from '../../packages/courses/coding/localize.js';
import { stepLessons } from '../../packages/courses/coding/lessons.js';
import { presentQuiz, publicQuiz } from '../../packages/shared/stepQuiz.js';
import { isQuizAnswerCorrect, quizAnswerText } from '../../packages/shared/quizKinds.js';

export const QUEST_GEMS = 30;
export const CHALLENGE_GEMS = 10;
const CHALLENGES_PER_DAY = 5; // mỗi người tạo tối đa mỗi ngày
const PAID_CHALLENGES_PER_DAY = 3; // ponytail: chặn hai tài khoản đấu nhau cày Ngọc bằng hạn mức ngày; cần chặt hơn thì chỉ thưởng khi hai bên khác thiết bị/IP
const MISTAKES_PER_ROUND = 10;
const DAY_MS = 86_400_000;

const dayStart = (day) => new Date(`${day}T00:00:00+07:00`);
const quizOf = (found, lang) => publicQuiz((found.course.localize || localizeCourse)(found.step, lang).quiz);
const playable = (id) => { const f = findStep(id); return f && !f.step.draft && f.step.quiz?.length ? f : null; };

/** 3 nhiệm vụ hôm nay, đếm từ nhật ký học — "hôm nay" theo múi giờ thiết bị của người học. */
export async function questsOf(email, doc) {
  const me = doc?.prefs ? doc : await Learner.findOne({ email }).select('prefs questDay').lean();
  const zone = cleanEduPrefs(me?.prefs).timeZone;
  const { day } = clockIn(new Date(), zone);
  const rows = await Activity.find({ email, createdAt: { $gte: dayStartIn(day, zone) } }).select('kind stepId lesson score').lean();
  const lessons = new Set(rows.filter((r) => r.kind === 'lesson').map((r) => `${r.stepId}:${r.lesson}`)).size;
  const list = [
    { id: 'lessons', goal: 2, done: Math.min(2, lessons) },
    { id: 'quiz', goal: 1, done: rows.some((r) => ['quiz', 'review', 'challenge'].includes(r.kind) && r.score >= 80) ? 1 : 0 },
    { id: 'review', goal: 1, done: rows.some((r) => ['review', 'practice', 'challenge'].includes(r.kind)) ? 1 : 0 },
  ];
  return { day, list, complete: list.every((q) => q.done >= q.goal), claimed: me?.questDay === day, gems: QUEST_GEMS };
}

export async function claimQuests(email) {
  const quests = await questsOf(email);
  if (!quests.complete) throw fail(409, 'QUESTS_OPEN', 'Chưa xong đủ 3 nhiệm vụ hôm nay.');
  const first = await Learner.updateOne({ email, questDay: { $ne: quests.day } }, { $set: { questDay: quests.day } });
  if (!first.modifiedCount) throw fail(409, 'QUESTS_CLAIMED', 'Hôm nay bạn đã nhận thưởng rồi.');
  const { balance } = await addGems(email, QUEST_GEMS, 'quests', { note: `Nhiệm vụ ngày ${quests.day}`, refId: `quests-${quests.day}` });
  return { success: true, gems: QUEST_GEMS, balance };
}

/** Ôn ngắt quãng: điểm tốt nhất ≥90% ôn sau 7 ngày, ≥80% sau 3 ngày, thấp hơn thì mỗi ngày. */
const intervalOf = (best) => (best >= 90 ? 7 : best >= 80 ? 3 : 1);
export function dueReviews(doc, day) {
  const today = dayStart(day).getTime();
  return (doc.completed || []).map((id) => {
    const found = playable(id);
    if (!found) return null;
    const score = doc.scores?.[id] || {};
    const best = Number(score.best ?? 100);
    const last = doc.reviewedOn?.[id] ? dayStart(doc.reviewedOn[id]).getTime() : Date.parse(score.at) || 0;
    const age = last ? Math.floor((today - last) / DAY_MS) : null;
    if (age !== null && age < intervalOf(best)) return null;
    return {
      stepId: id, course: found.key, index: found.index, title: found.step.title, best: score.best ?? null, age,
      part: stepLessons(found.step.slides).length - 1, rank: 100 - best + Math.min(age ?? 60, 60),
    };
  }).filter(Boolean).sort((a, b) => b.rank - a.rank).slice(0, 5);
}

const countMistakes = (mistakes) => Object.values(mistakes || {}).reduce((n, list) => n + (Array.isArray(list) ? list.length : 0), 0);

export async function mistakeRound(email, lang) {
  const doc = await Learner.findOne({ email }).select('mistakes').lean();
  const items = [];
  for (const [stepId, list] of Object.entries(doc?.mistakes || {})) {
    const found = playable(stepId);
    if (!found || !Array.isArray(list)) continue;
    const quiz = quizOf(found, lang);
    for (const i of list) if (quiz[i] && items.length < MISTAKES_PER_ROUND) items.push({ stepId, i, course: found.key, index: found.index, title: found.step.title, question: quiz[i] });
  }
  return { items };
}

/** Chấm lượt ôn câu sai: câu đúng rời sổ và được XP; chỉ chấm câu đang có trong sổ (không cày XP câu lạ). */
export async function gradeMistakes(email, answers) {
  if (!Array.isArray(answers) || !answers.length || answers.length > MISTAKES_PER_ROUND) throw fail(400, 'BAD_ANSWERS', 'Câu trả lời không hợp lệ.');
  const book = (await Learner.findOne({ email }).select('mistakes').lean())?.mistakes || {};
  const fixed = new Map();
  const review = answers.map(({ stepId, i, answer } = {}) => {
    const list = Object.hasOwn(book, stepId) && Array.isArray(book[stepId]) ? book[stepId] : [];
    const question = list.includes(i) ? presentQuiz(findStep(stepId)?.step.quiz)[i] : null;
    if (!question) return { correct: false, answer: '', why: '' };
    const correct = isQuizAnswerCorrect(question, answer);
    if (correct) fixed.set(stepId, new Set([...(fixed.get(stepId) || []), i]));
    return { correct, answer: quizAnswerText(question), why: question.why || '' };
  });
  const correct = [...fixed.values()].reduce((n, set) => n + set.size, 0);
  if (correct) {
    await Learner.updateOne({ email }, { $pull: Object.fromEntries([...fixed].map(([id, set]) => [`mistakes.${id}`, { $in: [...set] }])) });
    // ponytail: hai lượt nộp cùng lúc có thể cộng XP đôi cho cùng câu — chỉ là XP tuần, chấp nhận.
    addXp(email, correct * XP_REVIEW).catch(() => {});
  }
  Activity.create({ email, kind: 'practice', score: Math.round((review.filter((r) => r.correct).length / answers.length) * 100) }).catch(() => {});
  return { review, correct, total: answers.length, left: Math.max(0, countMistakes(book) - correct) };
}

// —— Thách đấu ——
const nameOf = (doc) => doc?.nickname || 'Hugo learner';

function challengeView(c, email, other) {
  const sent = c.from === email;
  const mine = (sent ? c.fromScore : c.toScore) ?? null;
  const theirs = (sent ? c.toScore : c.fromScore) ?? null;
  const found = findStep(c.stepId);
  return {
    id: String(c._id), sent, stepId: c.stepId, course: found?.key, index: found?.index, title: found?.step.title || c.stepId,
    opponent: { name: nameOf(other), avatar: other?.avatar || null, code: other?.friendCode || '' },
    // Điểm đối thủ chỉ lộ sau khi mình làm xong — không làm bài với áp lực một con số.
    mine, theirsPlayed: theirs !== null, theirs: mine === null ? null : theirs, at: c.createdAt,
  };
}

export async function challengesOf(email) {
  const list = await Challenge.find({ $or: [{ from: email }, { to: email }] }).sort({ createdAt: -1 }).limit(20).lean();
  const others = await Learner.find({ email: { $in: [...new Set(list.map((c) => (c.from === email ? c.to : c.from)))] } }).select('email nickname avatar friendCode').lean();
  const byEmail = new Map(others.map((d) => [d.email, d]));
  return list.map((c) => challengeView(c, email, byEmail.get(c.from === email ? c.to : c.from)));
}

export async function createChallenge(email, rawCode) {
  const code = String(rawCode || '').toUpperCase();
  const me = await Learner.findOne({ email }).select('friends completed nickname').lean();
  if (!code || !me?.friends?.includes(code)) throw fail(404, 'NOT_FRIEND', 'Chỉ thách đấu được bạn bè.');
  const friend = await Learner.findOne({ friendCode: code }).select('email completed').lean();
  if (!friend) throw fail(404, 'NOT_FRIEND', 'Chỉ thách đấu được bạn bè.');
  const theirs = new Set(friend.completed || []);
  const common = (me.completed || []).filter((id) => theirs.has(id) && playable(id));
  if (!common.length) throw fail(409, 'NO_COMMON_STEP', 'Hai bạn chưa cùng qua step nào. Học thêm rồi thách đấu nhé!');
  const { day } = vnClock();
  if (await Challenge.countDocuments({ from: email, createdAt: { $gte: dayStart(day) } }) >= CHALLENGES_PER_DAY) {
    throw fail(429, 'CHALLENGE_LIMIT', `Mỗi ngày tạo tối đa ${CHALLENGES_PER_DAY} thách đấu.`);
  }
  const stepId = common[Math.floor(Math.random() * common.length)];
  const doc = await Challenge.create({ from: email, to: friend.email, stepId });
  notify(friend.email, { key: 'challenge', vars: { name: nameOf(me), step: findStep(stepId).step.title }, url: '/practice', tag: 'edu-challenge' });
  return { success: true, id: String(doc._id) };
}

async function challengeFor(email, id) {
  const c = mongoose.isValidObjectId(id) && await Challenge.findOne({ _id: id, $or: [{ from: email }, { to: email }] }).lean();
  if (!c) throw fail(404, 'NOT_FOUND', 'Không có thách đấu này (có thể đã quá 7 ngày).');
  if ((c.from === email ? c.fromScore : c.toScore) != null) throw fail(409, 'PLAYED', 'Bạn đã làm bài này rồi.');
  return c;
}

export async function challengeQuiz(email, id, lang) {
  const c = await challengeFor(email, id);
  const found = playable(c.stepId);
  if (!found) throw fail(409, 'STEP_NOT_READY', 'Step này đang được soạn.');
  return { title: found.step.title, course: found.key, index: found.index, questions: quizOf(found, lang) };
}

/** Thưởng khi cả hai đã làm: thắng nhận cả phần, hoà chia đôi. Cờ `settled` đặt nguyên tử nên chỉ trả một lần. */
async function settle(c) {
  const winners = c.fromScore === c.toScore ? [c.from, c.to] : [c.fromScore > c.toScore ? c.from : c.to];
  const gems = CHALLENGE_GEMS / winners.length;
  const since = dayStart(vnClock().day);
  const paid = new Map();
  for (const email of winners) {
    if (await GemTxn.countDocuments({ email, reason: 'challenge', createdAt: { $gte: since } }) >= PAID_CHALLENGES_PER_DAY) continue;
    const { balance } = await addGems(email, gems, 'challenge', { note: `Thách đấu ${c.stepId}: ${c.fromScore}% – ${c.toScore}%`, refId: `challenge-${c._id}` });
    paid.set(email, { gems, balance });
  }
  return paid;
}

export async function playChallenge(email, id, answers) {
  const c = await challengeFor(email, id);
  const graded = gradeStepQuiz(c.stepId, answers);
  if (!graded) throw fail(409, 'STEP_NOT_READY', 'Step này đang được soạn.');
  const field = c.from === email ? 'fromScore' : 'toScore';
  const saved = await Challenge.updateOne({ _id: c._id, [field]: null }, { $set: { [field]: graded.score } });
  if (!saved.modifiedCount) throw fail(409, 'PLAYED', 'Bạn đã làm bài này rồi.');
  Activity.create({ email, kind: 'challenge', stepId: c.stepId, score: graded.score, passed: graded.passed }).catch(() => {});
  const other = c.from === email ? c.to : c.from;
  const done = await Challenge.findOneAndUpdate(
    { _id: c._id, fromScore: { $ne: null }, toScore: { $ne: null }, settled: { $ne: true } },
    { $set: { settled: true } },
    { new: true },
  ).lean();
  const paid = done ? await settle(done) : new Map();
  if (done) {
    const me = await Learner.findOne({ email }).select('nickname').lean();
    notify(other, { key: 'challengeDone', vars: { name: nameOf(me) }, url: '/practice', tag: 'edu-challenge' });
  }
  const theirs = done ? (field === 'fromScore' ? done.toScore : done.fromScore) : null;
  return { ...graded, passPercent: PASS_PERCENT, mine: graded.score, theirs, reward: paid.get(email)?.gems || 0, balance: paid.get(email)?.balance };
}

export async function practiceView(email) {
  const doc = (await Learner.findOne({ email }).select('completed scores reviewedOn mistakes questDay prefs').lean()) || {};
  const [quests, challenges] = await Promise.all([questsOf(email, doc), challengesOf(email)]);
  return { quests, reviews: dueReviews(doc, quests.day), mistakes: countMistakes(doc.mistakes), challenges };
}
