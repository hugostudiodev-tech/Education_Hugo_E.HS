// /api/me, /api/learn, /api/persona, /api/feedback — dữ liệu của CHÍNH người đang đăng nhập (req.email).
import express from 'express';
import { requireUser } from '../lib/auth.js';
import { fail, handle, limit } from '../lib/limits.js';
import { finishLesson, savePrefs, snapshot, submitQuiz, thaw } from '../services/learning.js';
import { DevSignup, Feedback, Promo, GemTxn, Learner, LessonFeedback, Receipt, Report } from '../models.js';
import { checkNickname } from '../../packages/persona/nickname.js';
import { checkAvatar } from '../../packages/persona/avatar.js';
import { checkIntro } from '../../packages/persona/intro.js';
import { checkLinks } from '../../packages/persona/links.js';
import { cleanFeedback } from '../../packages/shared/eduFeedback.js';
import { eraseLearner } from '../services/erase.js';
import { addGems } from '../services/gems.js';

export const COMMUNITY_REWARD = 50;

const router = express.Router();
router.use(['/me', '/learn', '/persona', '/feedback', '/developer'], requireUser);

// Hugo Developer: đăng ký một lần (upsert theo email — bấm lại không tạo bản ghi mới).
// Quảng cáo: công khai.
router.get('/promo/:key', handle(async (req, res) => {
  res.set('Cache-Control', 'public, max-age=60');
  // Tắt → { enabled: false } để app ẩn thẻ; chưa từng soạn → null để app dùng chữ mặc định.
  return { promo: await Promo.findOne({ key: String(req.params.key) }).select('enabled image href text -_id').lean() };
}));
router.get('/developer', handle(async (req) => ({ signedUp: Boolean(await DevSignup.exists({ email: req.email })) })));
router.post('/developer/signup', limit(5), handle(async (req) => {
  await DevSignup.updateOne({ email: req.email }, { $setOnInsert: { email: req.email, name: req.user?.name || '' } }, { upsert: true });
  return { success: true, signedUp: true };
}));

router.get('/me', handle((req, res) => { res.set('Cache-Control', 'private, no-store'); return snapshot(req.email, req.user); }));
router.put('/me/settings', limit(30), handle(async (req) => ({ success: true, prefs: await savePrefs(req.email, req.body?.prefs) })));
router.post('/me/streak/thaw', limit(10), handle(async (req) => {
  const day = String(req.body?.day || '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(day)) throw fail(400, 'BAD_DAY', 'Ngày không hợp lệ.');
  return { success: true, ...(await thaw(req.email, day)) };
}));
// Bằng chứng đồng ý (NĐ 13/2023): phiên bản điều khoản + thời điểm, ghi một lần cho mỗi phiên bản.
router.post('/me/consent', limit(10), handle(async (req) => {
  const v = Number.parseInt(req.body?.v, 10);
  const ageGroup = req.body?.ageGroup;
  const guardianPhone = String(req.body?.guardianPhone || '').trim();
  const needsGuardian = ageGroup === '14-15';
  if (!(v > 0) || req.body?.terms !== true || req.body?.age !== true || !['14-15', '16+'].includes(ageGroup)
    || (needsGuardian && (req.body?.guardianConsent !== true || !/^\+?[0-9][0-9 .()-]{7,20}$/.test(guardianPhone)))) {
    throw fail(400, 'BAD_CONSENT', 'Lời đồng ý hoặc thông tin người giám hộ không hợp lệ.');
  }
  const at = new Date(req.body?.at);
  await Learner.updateOne({ email: req.email }, { $set: { consent: { v, at: Number.isNaN(at.getTime()) ? new Date() : at, savedAt: new Date(), terms: true, age: true, ageGroup, guardianConsent: needsGuardian || undefined, guardianPhone: needsGuardian ? guardianPhone : undefined } } });
  return { success: true };
}));
// Thưởng một lần khi bấm tham gia cộng đồng. Cờ đặt nguyên tử trước khi cộng → bấm nhiều lần/nhiều máy cũng chỉ một lần.
router.post('/me/community/claim', limit(10), handle(async (req) => {
  const first = await Learner.updateOne({ email: req.email, communityRewardAt: null }, { $set: { communityRewardAt: new Date() } });
  if (!first.modifiedCount) return { success: true, claimed: false };
  const { balance } = await addGems(req.email, COMMUNITY_REWARD, 'community_join', { note: 'Tham gia cộng đồng', refId: 'community-join' });
  return { success: true, claimed: true, amount: COMMUNITY_REWARD, balance };
}));
// Xoá tài khoản Education Hugo: xoá hết dữ liệu học, không khôi phục được.
router.delete('/me', limit(3), handle(async (req) => {
  if (req.body?.confirm !== 'DELETE') throw fail(400, 'CONFIRM_REQUIRED', 'Thiếu xác nhận xoá.');
  await eraseLearner(req.email);
  return { success: true };
}));
router.get('/me/history', handle(async (req, res) => {
  res.set('Cache-Control', 'private, no-store');
  const email = req.email;
  const [feedback, reports, lessons, gems, receipts] = await Promise.all([
    Feedback.find({ email }).sort({ createdAt: -1 }).limit(100).lean(),
    Report.find({ reporterEmail: email }).select('targetCode reason note status createdAt').sort({ createdAt: -1 }).limit(100).lean(),
    LessonFeedback.find({ email }).select('lessonId stepIndex message status createdAt').sort({ createdAt: -1 }).limit(100).lean(),
    GemTxn.find({ email }).select('amount balance reason note createdAt').sort({ createdAt: -1 }).limit(200).lean(),
    Receipt.find({ email }).sort({ createdAt: -1 }).limit(100).lean(),
  ]);
  return { feedback, reports, lessons, gems, receipts };
}));

router.post('/learn/lesson', limit(60), handle((req) => finishLesson(req.email, String(req.body?.lessonId || ''), Number(req.body?.lesson))));
router.post('/learn/quiz', limit(20), handle(async (req, res) => {
  const out = await submitQuiz(req.email, String(req.body?.lessonId || ''), req.body?.answers ?? req.body?.evidence?.answers);
  // Chưa đạt vẫn là kết quả hợp lệ kèm lời giải — client đọc code QUIZ_BELOW_PASS.
  if (out.code === 'QUIZ_BELOW_PASS') return res.status(200).json(out);
  return out;
}));

// Persona công khai: biệt danh + nhân vật pixel + lời giới thiệu (packages/persona kiểm luật).
const personaView = (d) => ({ nickname: d?.nickname || '', avatar: d?.avatar || null, intro: d?.intro || '', links: d?.links || {}, complete: Boolean(d?.nickname && d?.avatar) });
router.get('/persona', handle(async (req) => personaView(await Learner.findOne({ email: req.email }).select('nickname avatar intro links').lean())));
router.put('/persona', limit(10), handle(async (req) => {
  const set = {};
  for (const [field, check] of [['nickname', checkNickname], ['avatar', checkAvatar], ['intro', checkIntro], ['links', checkLinks]]) {
    if (req.body?.[field] === undefined) continue;
    const checked = check(req.body[field]);
    if (!checked.ok) throw fail(400, checked.code, checked.code);
    set[field] = checked.value;
  }
  if (!Object.keys(set).length) throw fail(400, 'PERSONA_EMPTY');
  return personaView(await Learner.findOneAndUpdate({ email: req.email }, { $set: set }, { upsert: true, new: true }).lean());
}));

router.post('/feedback', limit(5, 10 * 60_000), handle(async (req) => {
  const clean = cleanFeedback(req.body);
  if (!clean) throw fail(400, 'INVALID', 'Hãy chấm đủ 5 câu (1–5 sao).');
  if (await Feedback.exists({ email: req.email, createdAt: { $gte: new Date(Date.now() - 86_400_000) } })) throw fail(429, 'TOO_SOON', 'Bạn đã gửi đánh giá trong 24 giờ qua.');
  const doc = await Feedback.create({ email: req.email, ...clean, lang: ['vi', 'en', 'zh'].includes(req.body?.lang) ? req.body.lang : 'vi', source: req.body?.source === 'mail' ? 'mail' : 'app' });
  return { success: true, id: doc._id };
}));

export default router;
