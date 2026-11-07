// Học tập: ảnh chụp người học khi mở app, bài nhỏ, trắc nghiệm cuối step, chuỗi lửa,
// mục tiêu ngày, nhắc học theo giờ. Logic chuỗi thuần nằm ở packages/shared/eduStreak.js.
import { Activity, GemTxn, Learner } from '../models.js';
import { addGems, GEMS_PER_CORRECT } from './gems.js';
import { addXp, XP_PER_CORRECT, XP_PER_LESSON, XP_REVIEW } from './social.js';
import { notify } from '../lib/notify.js';
import { fail } from '../lib/limits.js';
import { cleanEduPrefs, vnClock } from '../../packages/shared/eduPrefs.js';
import { THAW_PRICE, addDays, nextMilestone, streakView, studyToday, thawDay } from '../../packages/shared/eduStreak.js';
import { findStep } from '../../packages/courses/index.js';
import { stepLessons } from '../../packages/courses/coding/lessons.js';
import { STAGE_REWARDS } from '../../packages/courses/coding/index.js';
import { getCoderLessonGate } from '../../packages/shared/coderProgression.js';
import { gradeStepQuiz, PASS_PERCENT } from './grading.js';

const DAY_MS = 86_400_000;
const REVIEW_COOLDOWN_DAYS = 7;

const learnerOf = (email) => Learner.findOneAndUpdate({ email }, { $setOnInsert: { email } }, { upsert: true, new: true, setDefaultsOnInsert: true }).lean();

/** Mở app: ghi lần hoạt động, trả hồ sơ học + cài đặt + mục tiêu hôm nay. */
export async function snapshot(email, user) {
  const doc = await Learner.findOneAndUpdate(
    { email },
    { $set: { lastActiveAt: new Date(), ...(user?.name ? { name: user.name } : {}), ...(user?.image ? { image: user.image } : {}) }, $setOnInsert: { email } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  ).lean();
  if (!doc.welcomedAt) {
    Learner.updateOne({ email, welcomedAt: { $exists: false } }, { $set: { welcomedAt: new Date() } })
      .then((r) => r.modifiedCount && notify(email, { key: 'welcome', url: '/learn', tag: 'edu-welcome' }))
      .catch(() => {});
  }
  const { day } = vnClock();
  return {
    edu: {
      prefs: cleanEduPrefs(doc.prefs),
      today: { done: doc.day === day ? doc.dayDone : 0, goal: cleanEduPrefs(doc.prefs).dailyGoal },
      streak: streakView(doc.streak, day),
      lessons: doc.lessonsDone || {},
    },
    learner: {
      email,
      displayName: doc.name || email.split('@')[0],
      avatarUrl: doc.image || '',
      completedLessons: doc.completed || [],
      scores: doc.scores || {},
      gems: doc.gems || 0,
      consentV: doc.consent?.v || 0,
      communityJoined: Boolean(doc.communityRewardAt),
    },
  };
}

/** Ghi chuỗi có điều kiện theo streakRev: hai máy nộp cùng lúc không cộng đôi ngày hay thưởng đôi mốc. */
async function writeStreak(email, change) {
  for (let attempt = 0; attempt < 4; attempt += 1) {
    const doc = await learnerOf(email);
    const result = change(doc.streak);
    const rev = doc.streakRev || 0;
    const saved = await Learner.updateOne({ email, streakRev: rev }, { $set: { streak: result.state, streakRev: rev + 1, lastActiveAt: new Date() } });
    if (saved.modifiedCount === 1) return result;
  }
  throw new Error('STREAK_BUSY');
}

async function payMilestone(email, milestone) {
  if (!milestone) return null;
  const { balance } = await addGems(email, milestone.gems, 'streak_milestone', { note: `Chuỗi lửa: mốc ${milestone.day} ngày`, refId: `streak-${milestone.day}` });
  notify(email, { key: 'milestone', vars: { n: milestone.day, gems: milestone.gems }, url: '/streak', tag: 'edu-streak' });
  return { ...milestone, balance };
}

/** Học đạt: giữ lửa hôm nay. Ôn lại một step/bài chỉ giữ lửa 1 lần mỗi 7 ngày (chống nộp script). */
export async function noteStudy(email, { reviewOf } = {}) {
  const { day } = vnClock();
  if (reviewOf) {
    const key = `reviewedOn.${reviewOf}`;
    const claimed = await Learner.updateOne(
      { email, $or: [{ [key]: { $exists: false } }, { [key]: { $lte: addDays(day, -REVIEW_COOLDOWN_DAYS) } }] },
      { $set: { [key]: day } },
    );
    if (claimed.modifiedCount !== 1) return null;
  }
  const { state, milestone } = await writeStreak(email, (raw) => studyToday(raw, day));
  const paid = await payMilestone(email, milestone).catch((error) => { console.error('[streak milestone]', error.message); return null; });
  return { streak: streakView(state, day), milestone: paid };
}

/** Phá băng một ngày bằng Ngọc: trừ trước, ghi chuỗi hỏng thì hoàn lại. */
export async function thaw(email, frozenDay) {
  const { day } = vnClock();
  const doc = await learnerOf(email);
  try { thawDay(doc.streak, frozenDay, day); } catch (error) { throw fail(400, error.code || 'BAD_DAY', error.message); }
  const { balance } = await addGems(email, -THAW_PRICE, 'streak_thaw', { note: `Phá băng ngày ${frozenDay}` });
  let result;
  try {
    result = await writeStreak(email, (raw) => thawDay(raw, frozenDay, day));
  } catch (error) {
    await addGems(email, THAW_PRICE, 'refund', { note: `Hoàn: chưa phá băng được ${frozenDay}` });
    throw error;
  }
  const paid = await payMilestone(email, result.milestone).catch(() => null);
  return { streak: streakView(result.state, day), milestone: paid, balance: paid?.balance ?? balance };
}

/** Khiên lửa: giữ một khiên có điều kiện rồi phá băng miễn phí; hỏng thì trả khiên. */
export async function spendShield(email, frozenDay) {
  const { day } = vnClock();
  const held = await Learner.updateOne({ email, shields: { $gt: 0 } }, { $inc: { shields: -1 } });
  if (!held.modifiedCount) return null;
  try {
    const { state } = await writeStreak(email, (raw) => thawDay(raw, frozenDay, day));
    return streakView(state, day);
  } catch {
    await Learner.updateOne({ email }, { $inc: { shields: 1 } });
    return null;
  }
}

export async function savePrefs(email, input) {
  const doc = await learnerOf(email);
  const prefs = cleanEduPrefs(input, cleanEduPrefs(doc.prefs));
  await Learner.updateOne({ email }, { $set: { prefs } });
  return prefs;
}

async function noteStepDone(email) {
  const { day } = vnClock();
  const reset = await Learner.updateOne({ email, day: { $ne: day } }, { $set: { day, dayDone: 1 } });
  if (!reset.matchedCount) await Learner.updateOne({ email }, { $inc: { dayDone: 1 } });
}

/** Xong một bài nhỏ trong step (bài cuối là trắc nghiệm, nộp qua submitQuiz). */
export async function finishLesson(email, lessonId, lesson) {
  const step = findStep(lessonId)?.step;
  if (!step || step.draft) throw fail(400, 'BAD_STEP', 'Step không hợp lệ.');
  const total = stepLessons(step.slides).length;
  if (!Number.isInteger(lesson) || lesson < 0 || lesson >= total - 1) throw fail(400, 'BAD_LESSON', 'Bài không hợp lệ.');
  const doc = await learnerOf(email);
  const stepDone = (doc.completed || []).includes(lessonId);
  if (!stepDone && !getCoderLessonGate(doc.completed || [], lessonId).unlocked) throw fail(409, 'STEP_LOCKED', 'Step này chưa mở.');
  const have = doc.lessonsDone?.[lessonId] || [];
  if (!stepDone && lesson > 0 && !have.includes(lesson - 1)) throw fail(409, 'LESSON_ORDER', 'Học bài trước trước đã.');
  const added = await Learner.updateOne({ email }, { $addToSet: { [`lessonsDone.${lessonId}`]: lesson } });
  const fresh = added.modifiedCount === 1 && !stepDone;
  Activity.create({ email, kind: 'lesson', stepId: lessonId, lesson }).catch(() => {});
  Learner.updateOne({ email }, { $set: { lastStep: lessonId } }).catch(() => {}); // riêng: giữ modifiedCount ở trên chỉ đo bài mới
  const eduStreak = await noteStudy(email, fresh ? {} : { reviewOf: `${lessonId}_l${lesson}` }).catch(() => null);
  if (fresh) addXp(email, XP_PER_LESSON).catch(() => {});
  return { success: true, lessons: [...new Set([...have, lesson])].sort((a, b) => a - b), eduStreak, balance: eduStreak?.milestone?.balance };
}

/** Nộp trắc nghiệm cuối step: máy chủ chấm lại, ghi điểm, mở step kế, thưởng Ngọc + XP lần đầu. */
export async function submitQuiz(email, lessonId, answers) {
  const found = findStep(lessonId);
  if (!found) throw fail(400, 'BAD_STEP', 'Step không hợp lệ.');
  const doc = await learnerOf(email);
  const completed = doc.completed || [];

  if (completed.includes(lessonId)) {
    const review = gradeStepQuiz(lessonId, answers);
    const eduStreak = review?.passed ? await noteStudy(email, { reviewOf: lessonId }).catch(() => null) : null;
    if (eduStreak) addXp(email, XP_REVIEW).catch(() => {});
    return { success: true, alreadyCompleted: true, eduStreak, balance: eduStreak?.milestone?.balance ?? doc.gems, ...review, passPercent: PASS_PERCENT };
  }
  const gate = getCoderLessonGate(completed, lessonId);
  if (!gate.unlocked) throw fail(409, gate.code, `Hoàn thành các step trước theo thứ tự. Step đầu tiên còn thiếu: ${gate.missingLessons[0]}.`);
  const need = stepLessons(found.step.slides).length - 1;
  if ((doc.lessonsDone?.[lessonId] || []).length < need) throw fail(409, 'LESSONS_FIRST', 'Học xong các bài trong step rồi mới làm trắc nghiệm.');

  const graded = gradeStepQuiz(lessonId, answers);
  if (!graded) throw fail(409, 'STEP_NOT_READY', 'Step này đang được soạn.');
  const prev = doc.scores?.[lessonId] || {};
  await Learner.updateOne({ email }, { $set: { [`scores.${lessonId}`]: {
    best: Math.max(Number(prev.best || 0), graded.score), firstTry: prev.firstTry ?? graded.score,
    last: graded.score, attempts: Number(prev.attempts || 0) + 1, at: new Date().toISOString(),
  } } });
  Activity.create({ email, kind: 'quiz', stepId: lessonId, score: graded.score, passed: graded.passed }).catch(() => {});
  if (!graded.passed) {
    return { code: 'QUIZ_BELOW_PASS', ...graded, passPercent: PASS_PERCENT, error: `Đạt ${graded.score}%, cần từ ${PASS_PERCENT}%. Ôn lại phần chưa vững rồi làm lại.` };
  }
  const eduStreak = await noteStudy(email).catch(() => null);
  // $addToSet chỉ thêm một lần: hai máy nộp cùng lúc không nhận thưởng đôi.
  const added = await Learner.updateOne({ email }, { $addToSet: { completed: lessonId } });
  let balance = doc.gems || 0;
  let gemsEarned = 0;
  if (added.modifiedCount === 1) {
    noteStepDone(email).catch(() => {});
    addXp(email, graded.correct * XP_PER_CORRECT).catch(() => {});
    if (graded.correct > 0) {
      ({ balance } = await addGems(email, graded.correct * GEMS_PER_CORRECT, 'quiz', { note: `Qua ${lessonId}: ${graded.correct}/${graded.total}`, refId: lessonId }));
      gemsEarned = graded.correct * GEMS_PER_CORRECT;
    }
  }
  // Qua đủ mọi step của một chặng có thưởng → trả một lần (refId chặn trả đôi).
  let stageReward = null;
  const stage = found.course.STAGES?.find((s) => found.index >= s.from && found.index < s.to);
  if (added.modifiedCount === 1 && STAGE_REWARDS[stage?.id] && found.course.WEB_COURSES.slice(stage.from, stage.to).every((s) => s.id === lessonId || completed.includes(s.id))) {
    const refId = `stage-${stage.id}`;
    if (!(await GemTxn.exists({ email, refId }))) {
      ({ balance } = await addGems(email, STAGE_REWARDS[stage.id], 'stage', { note: `Hoàn thành chặng ${stage.code || stage.id}`, refId }));
      stageReward = { stage: stage.id, gems: STAGE_REWARDS[stage.id] };
    }
  }
  if (eduStreak?.milestone?.balance) balance = Math.max(balance, eduStreak.milestone.balance);
  return { success: true, balance, gemsEarned, stageReward, ...graded, passPercent: PASS_PERCENT, eduStreak };
}

/**
 * Chạy mỗi giờ: nhắc theo chuỗi lửa đúng giờ người học chọn; 21h gọi lần cuối;
 * 8h dùng Khiên lửa rồi báo lửa vừa đóng băng.
 * ponytail: limit 500–2000/lượt, đủ cho quy mô hiện tại; đông hơn thì chia lô theo _id.
 */
export async function runReminders(now = new Date()) {
  const { day, hour } = vnClock(now);
  const active = { $gte: new Date(now - 30 * DAY_MS) };
  let sent = 0;
  const due = await Learner.find({ 'prefs.reminder': { $ne: false }, 'prefs.reminderHour': hour, remindedDay: { $ne: day }, lastActiveAt: active }).limit(500).lean();
  for (const doc of due) {
    const streak = streakView(doc.streak, day);
    if (streak.studiedToday) continue;
    const next = nextMilestone(streak.count);
    const key = !streak.count ? 'remindNew' : next.day === streak.count + 1 ? 'nearMilestone' : 'remind';
    await notify(doc.email, { key, vars: { n: streak.count, m: next.day, gems: next.gems, v: Number(day.replaceAll('-', '')) }, url: '/learn', tag: 'edu-reminder' });
    await Learner.updateOne({ _id: doc._id }, { $set: { remindedDay: day } });
    sent += 1;
  }
  if (hour === 8) {
    const holders = await Learner.find({ shields: { $gt: 0 }, frozenNoticeDay: { $ne: day }, 'streak.count': { $gte: 1 } }).select('email streak shields prefs').limit(2000).lean();
    for (const doc of holders) {
      if (!streakView(doc.streak, day).frozen.includes(addDays(day, -1))) continue;
      const saved = await spendShield(doc.email, addDays(day, -1));
      if (!saved) continue;
      await Learner.updateOne({ _id: doc._id }, { $set: { frozenNoticeDay: day } });
      if (cleanEduPrefs(doc.prefs).reminder) await notify(doc.email, { key: 'shield', vars: { n: saved.count, s: doc.shields - 1 }, url: '/streak', tag: 'edu-streak' });
      sent += 1;
    }
  }
  if (hour === 21 || hour === 8) {
    const field = hour === 21 ? 'lastCallDay' : 'frozenNoticeDay';
    const list = await Learner.find({ 'prefs.reminder': { $ne: false }, [field]: { $ne: day }, 'streak.count': { $gte: hour === 21 ? 3 : 1 }, lastActiveAt: active }).select('email streak').limit(1000).lean();
    for (const doc of list) {
      const streak = streakView(doc.streak, day);
      const send = hour === 21 ? !streak.studiedToday && streak.count >= 3 : streak.count > 0 && streak.frozen.includes(addDays(day, -1));
      if (!send) continue;
      await notify(doc.email, { key: hour === 21 ? 'lastCall' : 'frozen', vars: { n: streak.count, f: streak.freezesThisMonth, v: Number(day.replaceAll('-', '')) }, url: '/streak', tag: 'edu-streak' });
      await Learner.updateOne({ _id: doc._id }, { $set: { [field]: day } });
      sent += 1;
    }
  }
  return { sent };
}
