// /api/admin — trang quản trị riêng của Education Hugo. Chỉ email trong ADMIN_EMAILS.
// Mọi thao tác ghi đều để lại một dòng AdminLog.
import express from 'express';
import mongoose from 'mongoose';
import { ADMIN_EMAILS, requireAdmin } from '../lib/auth.js';
import { fail, handle, limit } from '../lib/limits.js';
import { Activity, AdminLog, DevSignup, Promo, Feedback, GemTxn, Learner, LessonFeedback, Post, Product, Receipt, Report } from '../models.js';
import { addGems } from '../services/gems.js';
import { eraseLearner } from '../services/erase.js';
import { subscribe } from '../services/live.js';
import { COURSES, findStep } from '../../packages/courses/index.js';
import { CATALOG } from '../../packages/courses/catalog.js';
import { stepLessons } from '../../packages/courses/coding/lessons.js';
import { streakView } from '../../packages/shared/eduStreak.js';
import { checkNickname } from '../../packages/persona/nickname.js';
import { issuePartnerKey, listPartnerKeys, revokePartnerKey, updatePartnerKey } from '../services/partner.js';
import { vnClock } from '../../packages/shared/eduPrefs.js';
import { fingerprintOf } from '../services/zodiac.js';

const router = express.Router();
router.use(requireAdmin, limit(120));
const log = (req, action, target, detail) => AdminLog.create({ admin: req.admin, action, target: String(target || ''), detail, ip: req.ip, ua: String(req.get('user-agent') || '').slice(0, 200) }).catch(() => {});
// Thao tác tối mật (xoá, khoá, Ngọc, key đối tác, xem dữ liệu riêng tư, đăng xuất máy khác) cần vừa xác thực
// trong 10 phút. Quá hạn → 403 REAUTH_REQUIRED, trang quản trị hỏi Face ID / mã email rồi tự làm lại.
const FRESH_MS = 10 * 60_000;
const fresh = (req, res, next) => (Date.now() - new Date(req.adminSession?.createdAt || 0) < FRESH_MS ? next()
  : res.status(403).json({ code: 'REAUTH_REQUIRED', error: 'Thao tác tối mật: xác thực lại để tiếp tục.' }));
// Dữ liệu cá nhân nhạy cảm: ẩn mặc định, chỉ trả qua /learners/:email/private (fresh + ghi nhật ký).
const PRIVATE = [['profile', 'birthDate'], ['profile', 'province'], ['profile', 'gender'], ['consent', 'ageGroup']];
const maskIp = (ip) => String(ip || '').replace(/(\d+)\.(\d+)$/, 'x.x').replace(/(:[0-9a-f]*){2}$/i, ':x:x');
const oid = (v) => { if (!mongoose.isValidObjectId(v)) throw fail(400, 'BAD_ID', 'id không hợp lệ.'); return v; };
const esc = (s) => String(s || '').replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

router.get('/me', (req, res) => res.json({ email: req.admin }));

router.get('/overview', handle(async () => {
  const now = Date.now();
  const since = (days) => new Date(now - days * 86_400_000);
  const { day } = vnClock();
  const [learners, active7, active1, newToday, posts7, pendingReports, newLessonFb, feedback, gemsOut, sold] = await Promise.all([
    Learner.estimatedDocumentCount(),
    Learner.countDocuments({ lastActiveAt: { $gte: since(7) } }),
    Learner.countDocuments({ lastActiveAt: { $gte: since(1) } }),
    Learner.countDocuments({ createdAt: { $gte: new Date(`${day}T00:00:00+07:00`) } }),
    Post.countDocuments({ createdAt: { $gte: since(7) } }),
    Report.countDocuments({ status: 'pending' }),
    LessonFeedback.countDocuments({ status: 'new' }),
    Feedback.countDocuments(),
    Learner.aggregate([{ $group: { _id: null, gems: { $sum: '$gems' } } }]).then((r) => r[0]?.gems || 0),
    Receipt.countDocuments({ createdAt: { $gte: since(30) } }),
  ]);
  return { learners, active7, active1, newToday, posts7, pendingReports, newLessonFb, feedback, gemsOut, sold30: sold };
}));

// ── Người học ─────────────────────────────────────────────────────────────────
const COURSE_TITLE = Object.fromEntries(CATALOG.map((c) => [c.id, c.title.vi]));
const lessonCount = (step) => (step.draft ? 0 : stepLessons(step.slides).length - 1); // bài nhỏ, không tính trắc nghiệm
const stepLabel = (id) => { const f = findStep(id); return f ? `${COURSE_TITLE[f.key] || f.key} · ${f.step.title}` : id; };
/** Step học gần nhất (lastStep); dữ liệu cũ chưa có thì lấy step dở cuối hoặc step vừa qua. */
function nowLearning(l) {
  const done = new Set(l.completed || []);
  const id = l.lastStep || Object.keys(l.lessonsDone || {}).findLast((k) => !done.has(k) && l.lessonsDone[k]?.length) || l.completed?.at(-1);
  if (!id) return null;
  if (done.has(id)) return { stepId: id, label: stepLabel(id), passed: true };
  const f = findStep(id);
  return { stepId: id, label: stepLabel(id), lessons: (l.lessonsDone?.[id] || []).length, total: f ? lessonCount(f.step) : 0 };
}
/** Tiến độ từng khoá: mọi step, bài nhỏ đã học, điểm trắc nghiệm. */
function progressOf(l) {
  const done = new Set(l.completed || []);
  return Object.entries(COURSES).map(([key, c]) => {
    const steps = c.WEB_COURSES.map((s) => ({
      id: s.id, title: s.title, stage: s.stage, draft: Boolean(s.draft), done: done.has(s.id),
      lessons: (l.lessonsDone?.[s.id] || []).length, total: lessonCount(s), score: l.scores?.[s.id] || null,
    }));
    return { key, title: COURSE_TITLE[key] || key, done: steps.filter((s) => s.done).length, total: steps.filter((s) => !s.draft).length, steps };
  });
}
const emailOf = (req) => String(req.params.email).toLowerCase();
const mustExist = async (email) => { if (!(await Learner.exists({ email }))) throw fail(404, 'NOT_FOUND', 'Không có người học này.'); };

router.get('/learners', handle(async (req) => {
  const q = String(req.query.q || '').trim().slice(0, 80);
  const filter = q ? { $or: [{ email: { $regex: esc(q), $options: 'i' } }, { nickname: { $regex: esc(q), $options: 'i' } }, { friendCode: q.toUpperCase() }] } : {};
  if (req.query.online === '1') filter.lastActiveAt = { $gte: new Date(Date.now() - 10 * 60_000) };
  const { day } = vnClock();
  const items = await Learner.find(filter).select('email name nickname gems completed lessonsDone lastStep streak lastActiveAt createdAt bannedAt friendCode').sort({ lastActiveAt: -1 }).limit(200).lean();
  return { items: items.map(({ completed, lessonsDone, lastStep, streak, ...d }) => ({
    ...d, steps: completed?.length || 0, streak: streakView(streak, day).count, learning: nowLearning({ completed, lessonsDone, lastStep }),
  })) };
}));
router.post('/learners', handle(async (req) => {
  const email = String(req.body?.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw fail(400, 'BAD_EMAIL', 'Email không hợp lệ.');
  const set = { email, name: String(req.body?.name || '').trim().slice(0, 80) };
  if (req.body?.nickname) { const n = checkNickname(req.body.nickname); if (!n.ok) throw fail(400, n.code, 'Biệt danh 2–20 ký tự, chỉ chữ và emoji.'); set.nickname = n.value; }
  try { await Learner.create(set); } catch (error) { if (error.code === 11000) throw fail(409, 'DUPLICATE', 'Email này đã có.'); throw error; }
  await log(req, 'learner_create', email);
  return { success: true };
}));
router.patch('/learners/:email', handle(async (req) => {
  const email = emailOf(req);
  const b = req.body || {};
  const set = {};
  if (b.name !== undefined) set.name = String(b.name).trim().slice(0, 80);
  if (b.nickname !== undefined) {
    if (b.nickname === '') set.nickname = '';
    else { const n = checkNickname(b.nickname); if (!n.ok) throw fail(400, n.code, 'Biệt danh 2–20 ký tự, chỉ chữ và emoji.'); set.nickname = n.value; }
  }
  if (b.intro !== undefined) set.intro = String(b.intro).trim().slice(0, 300);
  if (b.shields !== undefined) set.shields = Math.max(0, Math.min(99, Math.trunc(Number(b.shields)) || 0));
  if (!Object.keys(set).length) throw fail(400, 'EMPTY', 'Không có gì để sửa.');
  const r = await Learner.updateOne({ email }, { $set: set });
  if (!r.matchedCount) throw fail(404, 'NOT_FOUND');
  await log(req, 'learner_update', email, set);
  return { success: true };
}));
// Xoá hẳn: mọi dữ liệu học (services/erase.js) + đăng xuất mọi máy. Tài khoản đăng nhập giữ — vào lại là bắt đầu từ đầu.
router.delete('/learners/:email', fresh, handle(async (req) => {
  const email = emailOf(req);
  if (req.body?.confirm !== email) throw fail(400, 'CONFIRM_REQUIRED', 'Gõ đúng email để xác nhận xoá.');
  await mustExist(email);
  await eraseLearner(email);
  await Activity.deleteMany({ email });
  const user = await mongoose.connection.db.collection('user').findOne({ email });
  if (user) await mongoose.connection.db.collection('session').deleteMany({ userId: user._id });
  await log(req, 'learner_delete', '(đã xoá)');
  return { success: true };
}));
// Hoàn tất / gỡ một step thay member. Không cộng Ngọc, XP hay thưởng chặng — chỉ sửa tiến độ.
router.post('/learners/:email/steps', fresh, handle(async (req) => {
  const email = emailOf(req);
  const ids = [].concat(req.body?.stepIds ?? req.body?.stepId ?? []).map(String).slice(0, 200);
  const done = Boolean(req.body?.done);
  const steps = ids.map((id) => findStep(id));
  if (!ids.length || steps.some((f) => !f || f.step.draft)) throw fail(400, 'BAD_STEP', 'Step không hợp lệ.');
  await mustExist(email);
  const update = done
    ? { $addToSet: { completed: { $each: ids } }, $set: Object.fromEntries(steps.map((f) => [`lessonsDone.${f.step.id}`, Array.from({ length: lessonCount(f.step) }, (_, i) => i)])) }
    : { $pull: { completed: { $in: ids } }, $unset: Object.fromEntries(ids.flatMap((id) => [[`lessonsDone.${id}`, 1], [`scores.${id}`, 1]])) };
  await Learner.updateOne({ email }, update);
  await Activity.insertMany(ids.map((stepId) => ({ email, kind: done ? 'admin_done' : 'admin_undo', stepId, by: req.admin })));
  await log(req, done ? 'step_done' : 'step_undo', email, { steps: ids });
  return { success: true };
}));
// Kênh đẩy trực tiếp (SSE). no-transform: compression không gom bộ đệm; ping giữ kết nối qua proxy.
router.get('/live', (req, res) => {
  res.set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache, no-transform', 'X-Accel-Buffering': 'no' });
  res.flushHeaders();
  res.write('retry: 3000\n\n');
  const stop = subscribe(res, (a) => ({ ...a, label: stepLabel(a.stepId) }));
  const ping = setInterval(() => res.write(': ping\n\n'), 20_000);
  req.on('close', () => { clearInterval(ping); stop(); });
});
// Nhật ký học trực tiếp: toàn hệ thống hoặc một người. `after` = chỉ lấy dòng mới hơn.
router.get('/activity', handle(async (req) => {
  const filter = {};
  if (req.query.email) filter.email = String(req.query.email).toLowerCase();
  const items = await Activity.find(filter).sort({ createdAt: -1 }).limit(Math.min(200, Number(req.query.limit) || 100)).lean();
  return { items: items.map((a) => ({ ...a, label: stepLabel(a.stepId) })) };
}));
// Nghi một người nhiều tài khoản: nhóm phiên Better Auth theo IP + trình duyệt.
// Thông báo từ tài khoản chính thức tới người theo dõi.
router.post('/announce', fresh, handle(async (req) => {
  const { announce } = await import('../services/social.js');
  const out = await announce(req.body || {});
  await log(req, 'announce', req.body?.title, { sent: out?.sent });
  return out;
}));
router.get('/duplicates', handle(async () => {
  const groups = await mongoose.connection.db.collection('session').aggregate([
    { $match: { ipAddress: { $nin: [null, ''] } } },
    { $group: { _id: { ip: '$ipAddress', ua: '$userAgent' }, users: { $addToSet: '$userId' }, lastAt: { $max: '$updatedAt' } } },
    { $match: { 'users.1': { $exists: true } } },
    { $sort: { lastAt: -1 } }, { $limit: 200 },
    { $lookup: { from: 'user', localField: 'users', foreignField: '_id', as: 'u' } },
  ]).toArray();
  return { items: groups.map((g) => ({ ip: maskIp(g._id.ip), emails: g.u.map((u) => u.email), lastAt: g.lastAt })).filter((g) => g.emails.length > 1) };
}));
router.get('/learners/:email', handle(async (req) => {
  const email = emailOf(req);
  const learner = await Learner.findOne({ email }).lean();
  if (!learner) throw fail(404, 'NOT_FOUND', 'Không có người học này.');
  const { day } = vnClock();
  const [gems, receipts, reports, activity] = await Promise.all([
    GemTxn.find({ email }).sort({ createdAt: -1 }).limit(50).lean(),
    Receipt.find({ email }).sort({ createdAt: -1 }).limit(50).lean(),
    Report.find({ targetEmail: email }).sort({ createdAt: -1 }).limit(50).lean(),
    Activity.find({ email }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);
  const rest = { ...learner, streak: streakView(learner.streak, day), profile: { ...learner.profile }, consent: { ...learner.consent } };
  for (const k of ['completed', 'lessonsDone', 'lastStep', 'scores', 'reviewedOn']) delete rest[k];
  rest.hasPrivate = PRIVATE.some(([a, b]) => rest[a]?.[b]);
  for (const [a, b] of PRIVATE) delete rest[a][b];
  return {
    learner: rest,
    learning: nowLearning(learner),
    progress: progressOf(learner),
    activity: activity.map((a) => ({ ...a, label: stepLabel(a.stepId) })),
    gems, receipts, reports,
  };
}));
router.get('/learners/:email/private', fresh, handle(async (req) => {
  const email = emailOf(req);
  const l = await Learner.findOne({ email }).select('profile consent').lean();
  if (!l) throw fail(404, 'NOT_FOUND', 'Không có người học này.');
  await log(req, 'private_view', email);
  return Object.fromEntries(PRIVATE.map(([a, b]) => [b, l[a]?.[b] || null]));
}));
router.post('/learners/:email/gems', fresh, handle(async (req) => {
  const email = String(req.params.email).toLowerCase();
  const amount = Math.trunc(Number(req.body?.amount));
  const note = String(req.body?.note || '').trim().slice(0, 200);
  if (!amount || Math.abs(amount) > 100000) throw fail(400, 'BAD_AMOUNT', 'Số Ngọc không hợp lệ.');
  if (!note) throw fail(400, 'NOTE_REQUIRED', 'Ghi lý do điều chỉnh.');
  if (!(await Learner.exists({ email }))) throw fail(404, 'NOT_FOUND');
  const out = await addGems(email, amount, 'admin', { note: `${note} (${req.admin})` });
  await log(req, 'gems', email, { amount, note });
  return { success: true, ...out };
}));
router.post('/learners/:email/ban', fresh, handle(async (req) => {
  const email = String(req.params.email).toLowerCase();
  const ban = Boolean(req.body?.ban);
  const r = await Learner.updateOne({ email }, ban ? { $set: { bannedAt: new Date() } } : { $unset: { bannedAt: 1 } });
  if (!r.matchedCount) throw fail(404, 'NOT_FOUND');
  // Khoá thì đăng xuất ngay mọi máy.
  if (ban) {
    const user = await mongoose.connection.db.collection('user').findOne({ email });
    if (user) await mongoose.connection.db.collection('session').deleteMany({ userId: user._id });
  }
  await log(req, ban ? 'ban' : 'unban', email, { reason: req.body?.reason });
  return { success: true };
}));
router.post('/learners/:email/reset-persona', handle(async (req) => {
  const email = String(req.params.email).toLowerCase();
  await Learner.updateOne({ email }, { $set: { nickname: '', intro: '', avatar: null }, $unset: { links: 1 } });
  await log(req, 'reset_persona', email);
  return { success: true };
}));

// ── Link mạng xã hội của member: xem tất cả, gỡ từng link hoặc cả bộ (chặn link quảng cáo/độc hại) ──
const LINK_KEYS = ['facebook', 'instagram', 'tiktok', 'github', 'youtube'];
router.get('/links', handle(async () => ({
  items: await Learner.find({ $or: LINK_KEYS.map((k) => ({ [`links.${k}`]: { $type: 'string' } })) })
    .select('email nickname friendCode links updatedAt -_id').sort({ updatedAt: -1 }).limit(500).lean(),
})));
router.post('/learners/:email/links', handle(async (req) => {
  const email = String(req.params.email).toLowerCase();
  const key = req.body?.key;
  if (key && !LINK_KEYS.includes(key)) throw fail(400, 'BAD_KEY', 'Không có loại link này.');
  await Learner.updateOne({ email }, { $unset: key ? { [`links.${key}`]: 1 } : { links: 1 } });
  await log(req, 'remove_links', email, key || 'all');
  return { success: true };
}));

// ── Cửa hàng ──────────────────────────────────────────────────────────────────
const KINDS = ['badge', 'xp_boost', 'streak_shield'];
function productBody(b = {}) {
  const set = {};
  const text = (v) => ({ vi: String(v?.vi || '').slice(0, 300), en: String(v?.en || '').slice(0, 300), zh: String(v?.zh || '').slice(0, 300) });
  if (b.name) set.name = text(b.name);
  if (b.description) set.description = text(b.description);
  if (b.image !== undefined) set.image = String(b.image).slice(0, 300);
  if (b.price !== undefined) { const n = Math.trunc(Number(b.price)); if (!(n >= 1)) throw fail(400, 'BAD_PRICE', 'Giá phải từ 1 Ngọc.'); set.price = n; }
  if (b.stock !== undefined) set.stock = b.stock === '' || b.stock === null ? null : Math.max(0, Math.trunc(Number(b.stock)) || 0);
  if (b.kind !== undefined) { if (!KINDS.includes(b.kind)) throw fail(400, 'BAD_KIND', 'Loại vật phẩm không hợp lệ.'); set.kind = b.kind; }
  if (b.value !== undefined) set.value = Math.max(1, Math.trunc(Number(b.value)) || 1);
  if (b.active !== undefined) set.active = Boolean(b.active);
  if (b.sort !== undefined) set.sort = Math.trunc(Number(b.sort)) || 0;
  return set;
}
router.get('/products', handle(async () => ({ items: await Product.find().sort({ sort: 1, createdAt: 1 }).lean() })));
router.post('/products', handle(async (req) => {
  const slug = String(req.body?.slug || '').toLowerCase().replace(/[^a-z0-9-]/g, '').slice(0, 40);
  const set = productBody(req.body);
  if (!slug || !set.name?.vi || !set.price) throw fail(400, 'MISSING', 'Cần slug, tên tiếng Việt và giá.');
  try { await Product.create({ slug, ...set }); } catch (error) { if (error.code === 11000) throw fail(409, 'DUPLICATE', 'Slug đã tồn tại.'); throw error; }
  await log(req, 'product_create', slug, set);
  return { success: true };
}));
router.patch('/products/:id', handle(async (req) => {
  const set = productBody(req.body);
  const r = await Product.updateOne({ _id: oid(req.params.id) }, { $set: set }, { runValidators: true });
  if (!r.matchedCount) throw fail(404, 'NOT_FOUND');
  await log(req, 'product_update', req.params.id, set);
  return { success: true };
}));
router.get('/receipts', handle(async () => ({ items: await Receipt.find().sort({ createdAt: -1 }).limit(200).lean() })));

// ── Đối tác ───────────────────────────────────────────────────────────────────
router.get('/partners', handle(async () => ({ items: (await listPartnerKeys()).map((k) => ({ ...k, fingerprint: fingerprintOf(k) })) })));
router.post('/partners', fresh, handle(async (req) => {
  try {
    const issued = await issuePartnerKey({ ...req.body, admin: req.admin });
    await log(req, 'partner_issue', issued.email, { last4: issued.last4, expiresAt: issued.expiresAt });
    return { success: true, ...issued };
  } catch (error) {
    if (error.status) throw error;
    throw fail(400, 'ISSUE_FAILED', error.message);
  }
}));
router.post('/partners/:id', fresh, handle(async (req) => {
  const out = await updatePartnerKey(oid(req.params.id), { days: req.body?.days, origins: req.body?.origins });
  await log(req, 'partner_update', req.params.id, { expiresAt: out.expiresAt, origins: out.origins });
  return out;
}));
router.post('/partners/:id/revoke', fresh, handle(async (req) => {
  const r = await revokePartnerKey(oid(req.params.id));
  if (!r.matchedCount) throw fail(404, 'NOT_FOUND', 'Không có key đang hoạt động này.');
  await log(req, 'partner_revoke', req.params.id);
  return { success: true };
}));

// ── Kiểm duyệt ────────────────────────────────────────────────────────────────
router.get('/reports', handle(async (req) => {
  const status = ['pending', 'dismissed', 'actioned'].includes(req.query.status) ? req.query.status : 'pending';
  return { items: await Report.find({ status }).sort({ createdAt: -1 }).limit(200).lean() };
}));
router.post('/reports/:id', handle(async (req) => {
  const status = req.body?.status === 'actioned' ? 'actioned' : 'dismissed';
  const r = await Report.updateOne({ _id: oid(req.params.id) }, { $set: { status } });
  if (!r.matchedCount) throw fail(404, 'NOT_FOUND');
  await log(req, `report_${status}`, req.params.id);
  return { success: true };
}));
router.get('/posts', handle(async (req) => {
  const filter = req.query.removed === '1' ? { removed: { $ne: null } } : {};
  const posts = await Post.find(filter).select('authorEmail text parentKey likeCount replyCount removed createdAt').sort({ createdAt: -1 }).limit(200).lean();
  return { items: posts };
}));
router.post('/posts/:id/hide', handle(async (req) => {
  const hide = req.body?.hide !== false;
  const r = await Post.updateOne({ _id: oid(req.params.id) }, hide ? { $set: { removed: { category: String(req.body?.category || 'guidelines').slice(0, 40), at: new Date(), by: req.admin } } } : { $unset: { removed: 1 } });
  if (!r.matchedCount) throw fail(404, 'NOT_FOUND');
  await log(req, hide ? 'post_hide' : 'post_restore', req.params.id);
  return { success: true };
}));

// ── Góp ý ─────────────────────────────────────────────────────────────────────
router.get('/feedback', handle(async () => ({ items: await Feedback.find().sort({ createdAt: -1 }).limit(200).lean() })));
router.get('/lesson-feedback', handle(async () => ({ items: await LessonFeedback.find().sort({ createdAt: -1 }).limit(300).lean() })));
router.post('/lesson-feedback/:id', handle(async (req) => {
  const status = ['new', 'seen', 'fixed'].includes(req.body?.status) ? req.body.status : 'seen';
  await LessonFeedback.updateOne({ _id: oid(req.params.id) }, { $set: { status } });
  return { success: true };
}));
// ── Hugo Developer ───────────────────────────────────────────────────────────
router.get('/developers', handle(async () => ({ items: await DevSignup.find().sort({ createdAt: -1 }).limit(500).lean() })));
router.post('/developers/:id', handle(async (req) => {
  const status = ['new', 'contacted', 'accepted', 'declined'].includes(req.body?.status) ? req.body.status : 'contacted';
  const r = await DevSignup.updateOne({ _id: oid(req.params.id) }, { $set: { status } });
  if (!r.matchedCount) throw fail(404, 'NOT_FOUND');
  await log(req, `developer_${status}`, req.params.id);
  return { success: true };
}));
// ── Quảng cáo ────────────────────────────────────────────────────────────────
const PROMO_KEYS = ['developer'];
const PROMO_FIELDS = { badge: 30, title: 80, body: 240, cta: 30 };
const clip = (v, n) => String(v || '').trim().slice(0, n);
// Ảnh: đường dẫn trong site, https, hoặc ảnh tải lên dạng data URL (≤ ~150 KB, vừa giới hạn body 200 KB).
const okImage = (v) => !v || /^\/[\w./-]+$/.test(v) || /^https:\/\/\S+$/.test(v) || (/^data:image\/(png|jpeg|webp|gif);base64,[A-Za-z0-9+/=]+$/.test(v) && v.length <= 200000);
const okHref = (v) => /^\/[\w./?=&-]*$/.test(v) || /^https:\/\/\S+$/.test(v);
const promoKey = (k) => { if (!PROMO_KEYS.includes(k)) throw fail(404, 'NOT_FOUND'); return k; };
router.get('/promo/:key', handle(async (req) => ({ promo: await Promo.findOne({ key: promoKey(req.params.key) }).lean() })));
router.put('/promo/:key', handle(async (req) => {
  const key = promoKey(req.params.key);
  const b = req.body || {};
  const image = String(b.image || '');
  const href = String(b.href || '/developer-team');
  if (!okImage(image)) throw fail(400, 'BAD_IMAGE', 'Ảnh phải là đường dẫn /…, https://… hoặc ảnh tải lên ≤ 150 KB.');
  if (!okHref(href)) throw fail(400, 'BAD_HREF', 'Link phải bắt đầu bằng / hoặc https://');
  const text = Object.fromEntries(['vi', 'en', 'zh'].map((lang) => [lang,
    Object.fromEntries(Object.entries(PROMO_FIELDS).map(([f, n]) => [f, clip(b.text?.[lang]?.[f], n)]))]));
  const promo = await Promo.findOneAndUpdate({ key }, { $set: { enabled: b.enabled !== false, image, href, text } }, { upsert: true, new: true }).lean();
  await log(req, 'promo_update', key, { enabled: promo.enabled });
  return { promo };
}));
// ── Ads (chỉ admin đăng) ────────────────────────────────────────────────────
const MASCOTS = ['cast-1', 'cast-2', 'cast-3', 'cast-4', 'cast-5', 'cast-6', 'cast-7', 'cast-8', 'buddy-learn', 'buddy-done', 'buddy-exam', 'buddy-practice', 'buddy-correct', 'buddy-wrong'];
function cleanArticle(b = {}) {
  const title = String(b.title || '').trim().slice(0, 120);
  const text = String(b.text || '').replace(/\r\n/g, '\n').trim();
  if (!text) throw fail(400, 'EMPTY', 'Bài cần có nội dung.');
  if (text.length > 20000) throw fail(400, 'TOO_LONG', 'Bài tối đa 20.000 ký tự.');
  return { title: title || undefined, text, mascot: MASCOTS.includes(b.mascot) ? b.mascot : 'cast-1' };
}
router.get('/articles', handle(async () => ({
  items: await Post.find({ byAdmin: true, parentKey: null }).select('title text mascot likeCount replyCount createdAt editedAt authorEmail').sort({ createdAt: -1 }).limit(200).lean(),
  mascots: MASCOTS,
})));
router.post('/articles', handle(async (req) => {
  const post = await Post.create({ ...cleanArticle(req.body), byAdmin: true, authorEmail: `admin:${req.admin}` });
  await log(req, 'article_create', post._id, { title: post.title });
  return { item: post.toObject() };
}));
router.put('/articles/:id', handle(async (req) => {
  const post = await Post.findOneAndUpdate({ _id: oid(req.params.id), byAdmin: true }, { $set: { ...cleanArticle(req.body), editedAt: new Date() }, $unset: { translations: 1 } }, { new: true }).lean();
  if (!post) throw fail(404, 'NOT_FOUND');
  await log(req, 'article_update', req.params.id);
  return { item: post };
}));
router.delete('/articles/:id', handle(async (req) => {
  const post = await Post.findOneAndDelete({ _id: oid(req.params.id), byAdmin: true });
  if (!post) throw fail(404, 'NOT_FOUND');
  await Post.deleteMany({ ancestors: String(post._id) });
  await log(req, 'article_delete', req.params.id, { title: post.title });
  return { success: true };
}));
router.get('/log', handle(async (req) => {
  const q = String(req.query.q || '').trim().slice(0, 80);
  const filter = q ? { $or: ['admin', 'action', 'target'].map((k) => ({ [k]: { $regex: esc(q), $options: 'i' } })) } : {};
  return { items: (await AdminLog.find(filter).sort({ createdAt: -1 }).limit(300).lean()).map((l) => ({ ...l, ip: maskIp(l.ip) })) };
}));

// ── Bảo mật: phiên đăng nhập của mọi admin. Admin nào cũng toàn quyền, kể cả đăng xuất admin khác. ──
const sessions = () => mongoose.connection.db.collection('admin_session');
router.get('/security', handle(async (req) => {
  const [rows, users] = await Promise.all([
    sessions().find({ expiresAt: { $gt: new Date() } }).sort({ updatedAt: -1 }).limit(100).toArray(),
    mongoose.connection.db.collection('admin_user').find({}, { projection: { email: 1 } }).toArray(),
  ]);
  const emailOfUser = new Map(users.map((u) => [String(u._id), u.email]));
  return {
    admins: [...ADMIN_EMAILS],
    freshUntil: new Date(new Date(req.adminSession.createdAt).getTime() + FRESH_MS),
    sessions: rows.map((r) => ({ id: String(r._id), email: emailOfUser.get(String(r.userId)) || '—', ip: maskIp(r.ipAddress), ua: r.userAgent || '', createdAt: r.createdAt, updatedAt: r.updatedAt, expiresAt: r.expiresAt, current: String(r._id) === String(req.adminSession.id) })),
  };
}));
router.post('/sessions/:id/revoke', fresh, handle(async (req) => {
  if (String(req.params.id) === String(req.adminSession.id)) throw fail(400, 'CURRENT', 'Đây là phiên đang dùng — bấm Đăng xuất.');
  const r = await sessions().deleteOne({ _id: new mongoose.Types.ObjectId(oid(req.params.id)) });
  if (!r.deletedCount) throw fail(404, 'NOT_FOUND', 'Phiên này đã hết.');
  await log(req, 'session_revoke', req.params.id);
  return { success: true };
}));
router.post('/sessions/revoke-others', fresh, handle(async (req) => {
  const r = await sessions().deleteMany({ _id: { $ne: new mongoose.Types.ObjectId(String(req.adminSession.id)) } });
  await log(req, 'session_revoke_all', `${r.deletedCount} phiên`);
  return { success: true, count: r.deletedCount };
}));

export default router;
