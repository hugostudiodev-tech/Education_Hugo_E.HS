// /api/partner — thư viện đối tác kiểm key khi khởi động; trang /developers mở khoá mục Đối tác.
import express from 'express';
import { handle, limit, fail } from '../lib/limits.js';
import { partnerKeyOf, verifyPartnerKey } from '../services/partner.js';
import { partnerDocs } from '../services/partnerDocs.js';
import { ORIGINS } from '../lib/config.js';
import { stampedZodiac } from '../services/zodiac.js';

const router = express.Router();
router.post('/verify', limit(20, 10 * 60_000), handle(async (req) => {
  // Trang /developers nằm trên tên miền Education Hugo, không phải tên miền của đối tác: bỏ qua kiểm tên miền ở đây.
  // Bài học (routes/lessons.js) vẫn kiểm tên miền như cũ.
  const origin = ORIGINS.includes(req.get('origin')) ? null : req.get('origin');
  const doc = await verifyPartnerKey(partnerKeyOf(req) || req.body?.key, origin);
  if (!doc) throw fail(401, 'PARTNER_KEY_INVALID', 'Key không đúng, đã hết hạn hoặc không dùng được trên tên miền này.');
  const [name, host] = doc.email.split('@');
  const key = partnerKeyOf(req) || req.body?.key;
  // Trang /developers xin kèm tài liệu đối tác; thư viện (SDK) thì không cần.
  return { ok: true, email: `${name.slice(0, 2)}***@${host}`, expiresAt: doc.expiresAt, ...(req.body?.docs === true ? { docs: partnerDocs(key) } : {}) };
}));

// Hình mascot cho gói education-hugo-zodiac: kiểm key + tên miền MỖI lượt, không cho trình duyệt/CDN lưu đệm.
router.get('/zodiac/:id', limit(240), handle(async (req, res) => {
  const doc = await verifyPartnerKey(partnerKeyOf(req), req.get('origin'));
  if (!doc) throw fail(401, 'PARTNER_KEY_INVALID', 'Key không đúng, đã hết hạn, bị thu hồi hoặc không dùng được trên tên miền này.');
  const svg = stampedZodiac(req.params.id, doc);
  if (!svg) throw fail(404, 'NOT_FOUND', 'Không có mascot này.');
  res.set({ 'content-type': 'image/svg+xml; charset=utf-8', 'cache-control': 'no-store, private', 'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'" }).send(svg);
}));
export default router;
