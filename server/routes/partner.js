// /api/partner — thư viện đối tác kiểm key khi khởi động; trang /developers mở khoá mục Đối tác.
import express from 'express';
import { handle, limit, fail } from '../lib/limits.js';
import { partnerKeyOf, verifyPartnerKey } from '../services/partner.js';

const router = express.Router();
router.post('/verify', limit(20, 10 * 60_000), handle(async (req) => {
  const doc = await verifyPartnerKey(partnerKeyOf(req) || req.body?.key, req.get('origin'));
  if (!doc) throw fail(401, 'PARTNER_KEY_INVALID', 'Key không đúng, đã hết hạn hoặc không dùng được trên tên miền này.');
  const [name, host] = doc.email.split('@');
  return { ok: true, email: `${name.slice(0, 2)}***@${host}`, expiresAt: doc.expiresAt };
}));
export default router;
