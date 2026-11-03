// /api/admin — trang quản trị riêng của Education Hugo. Chỉ email trong ADMIN_EMAILS.
// Mọi thao tác ghi đều để lại một dòng AdminLog.
import express from 'express';
import mongoose from 'mongoose';
import { requireAdmin } from '../lib/auth.js';
import { fail, handle, limit } from '../lib/limits.js';
import { AdminLog, DevSignup, Promo, Feedback, GemTxn, Learner, LessonFeedback, Post, Product, Receipt, Report } from '../models.js';
import { addGems } from '../services/gems.js';
import { issuePartnerKey, listPartnerKeys, revokePartnerKey, updatePartnerKey } from '../services/partner.js';
import { vnClock } from '../../packages/shared/eduPrefs.js';

const router = express.Router();
router.use(requireAdmin, limit(120));
const log = (req, action, target, detail) => AdminLog.create({ admin: req.admin, action, target: String(target || ''), detail }).catch(() => {});
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
router.get('/learners', handle(async (req) => {
  const q = String(req.query.q || '').trim().slice(0, 80);
  const filter = q ? { $or: [{ email: { $regex: esc(q), $options: 'i' } }, { nickname: { $regex: esc(q), $options: 'i' } }, { friendCode: q.toUpperCase() }] } : {};
  const items = await Learner.find(filter).select('email name nickname gems completed streak lastActiveAt createdAt bannedAt friendCode').sort({ lastActiveAt: -1 }).limit(100).lean();
  return { items: items.map(({ completed, streak, ...d }) => ({ ...d, steps: completed?.length || 0, streak: streak?.count || 0 })) };
}));
router.get('/learners/:email', handle(async (req) => {
  const email = String(req.params.email).toLowerCase();
  const learner = await Learner.findOne({ email }).lean();
  if (!learner) throw fail(404, 'NOT_FOUND', 'Không có người học này.');
  const [gems, receipts, reports] = await Promise.all([
    GemTxn.find({ email }).sort({ createdAt: -1 }).limit(50).lean(),
    Receipt.find({ email }).sort({ createdAt: -1 }).limit(50).lean(),
    Report.find({ targetEmail: email }).sort({ createdAt: -1 }).limit(50).lean(),
  ]);
  return { learner, gems, receipts, reports };
}));
router.post('/learners/:email/gems', handle(async (req) => {
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
router.post('/learners/:email/ban', handle(async (req) => {
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
  await Learner.updateOne({ email }, { $set: { nickname: '', intro: '', avatar: null } });
  await log(req, 'reset_persona', email);
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
router.get('/partners', handle(async () => ({ items: await listPartnerKeys() })));
router.post('/partners', handle(async (req) => {
  try {
    const issued = await issuePartnerKey({ ...req.body, admin: req.admin });
    await log(req, 'partner_issue', issued.email, { last4: issued.last4, expiresAt: issued.expiresAt });
    return { success: true, ...issued };
  } catch (error) {
    if (error.status) throw error;
    throw fail(400, 'ISSUE_FAILED', error.message);
  }
}));
router.post('/partners/:id', handle(async (req) => {
  const out = await updatePartnerKey(oid(req.params.id), { days: req.body?.days, origins: req.body?.origins });
  await log(req, 'partner_update', req.params.id, { expiresAt: out.expiresAt, origins: out.origins });
  return out;
}));
router.post('/partners/:id/revoke', handle(async (req) => {
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
router.get('/log', handle(async () => ({ items: await AdminLog.find().sort({ createdAt: -1 }).limit(300).lean() })));

export default router;
