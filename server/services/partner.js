// Key đối tác Education Hugo: admin cấp (32 ký tự ngẫu nhiên, gửi thẳng vào mail đối
// tác, có hạn), thư viện education-hugo-react gửi kèm mỗi yêu cầu qua header
// X-Edu-Partner-Key. Key hợp lệ = mở toàn bộ nội dung bài, không cần tài khoản.
import crypto from 'crypto';
import { PartnerKey as EduPartnerKey } from '../models.js';
import { sendMail } from '../lib/notify.js';
import { EDU_ORIGIN } from '../lib/config.js';

const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
export const KEY_LENGTH = 32;
export const MAX_DAYS = 365;

const hash = (key) => crypto.createHash('sha256').update(key).digest('hex');

// Lấy mẫu loại bỏ (rejection sampling) để mọi ký tự đều xác suất như nhau.
export function randomKey(length = KEY_LENGTH) {
  let out = '';
  while (out.length < length) {
    for (const byte of crypto.randomBytes(length * 2)) {
      if (byte < 256 - (256 % ALPHABET.length)) out += ALPHABET[byte % ALPHABET.length];
      if (out.length === length) break;
    }
  }
  return out;
}

const cleanOrigins = (list) => [...new Set((Array.isArray(list) ? list : String(list || '').split(/[\s,]+/))
  .map((o) => String(o).trim().replace(/\/+$/, '').toLowerCase())
  .filter((o) => /^https?:\/\/[a-z0-9.-]+(:\d+)?$/.test(o)))].slice(0, 10);

export async function issuePartnerKey({ email, days = 30, origins, note = '', admin }) {
  const to = String(email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) throw Object.assign(new Error('Email không hợp lệ.'), { status: 400 });
  // Quy định đối tác: key luôn khoá theo tên miền đã đăng ký — không cấp key "mọi nơi".
  const allowed = cleanOrigins(origins);
  if (!allowed.length) throw Object.assign(new Error('Cần ít nhất một tên miền hợp lệ (vd. https://truong.edu.vn).'), { status: 400 });
  const span = Math.min(MAX_DAYS, Math.max(1, Number.parseInt(days, 10) || 30));
  const key = randomKey();
  const expiresAt = new Date(Date.now() + span * 86400_000);
  const doc = await EduPartnerKey.create({
    email: to, keyHash: hash(key), last4: key.slice(-4), origins: allowed,
    note: String(note).slice(0, 200), expiresAt, createdBy: admin,
  });
  const until = expiresAt.toLocaleDateString('vi-VN', { timeZone: 'Asia/Ho_Chi_Minh' });
  const body = [
    'Chào bạn,',
    `Education Hugo cấp cho bạn một key đối tác để dùng thư viện Education Hugo. Key có hiệu lực ${span} ngày, tới hết ngày ${until}.`,
    `<div style="font:700 18px/1.4 ui-monospace,Menlo,monospace;letter-spacing:.06em;padding:14px 16px;border-radius:12px;background:#f1f5f9;word-break:break-all;">${key}</div>`,
    `Mở ${EDU_ORIGIN}/developers, nhập key ở mục "Nhập key đối tác" để xem lệnh cài đặt và hướng dẫn. Không chia sẻ key này: mỗi lượt dùng đều được ghi nhận, và key có thể bị thu hồi bất cứ lúc nào.`,
    `Key chỉ chạy trên: ${doc.origins.join(', ')}. Quy định đối tác: ${EDU_ORIGIN}/partners`,
  ].filter(Boolean).join('<br><br>');
  // Key chỉ tồn tại trong thư: gửi không được (hoặc chỉ mô phỏng vì thiếu RESEND_API_KEY) thì huỷ key, báo admin.
  const sent = await sendMail(to, 'Key đối tác Education Hugo', `<div style="font:16px/1.6 -apple-system,Segoe UI,Roboto,sans-serif;color:#3c3c3c;max-width:520px;margin:0 auto;padding:24px"><p style="font-size:22px;font-weight:800;color:#afafaf;margin:0 0 18px">Education Hugo</p>${body}<p style="margin-top:28px;color:#afafaf;font-size:13px">Education Hugo · Hugo Studio</p></div>`).catch(() => null);
  if (!sent || sent.simulated) {
    await EduPartnerKey.deleteOne({ _id: doc._id });
    throw Object.assign(new Error('Chưa gửi được mail (kiểm RESEND_API_KEY trên Render). Key chưa được cấp.'), { status: 503 });
  }
  return { id: String(doc._id), email: to, last4: doc.last4, expiresAt, origins: doc.origins };
}

// Bộ nhớ đệm kiểm key: mỗi lượt đọc bài không phải hỏi Mongo. Thu hồi / gia hạn / đổi tên miền xoá đệm
// ngay, nên hiệu lực tức thì. ponytail: đệm trong RAM một tiến trình (Render free chạy một process).
const CACHE_MS = 60_000;
const cache = new Map(); // keyHash → { doc, at }
const forget = () => cache.clear();
let pending = new Map(); // _id → số lượt chưa ghi
setInterval(() => {
  if (!pending.size) return;
  const batch = pending; pending = new Map();
  const at = new Date();
  EduPartnerKey.bulkWrite([...batch].map(([id, n]) => ({ updateOne: { filter: { _id: id }, update: { $set: { lastUsedAt: at }, $inc: { uses: n } } } }))).catch(() => {});
}, 10_000).unref();

/** Key hợp lệ (chưa thu hồi, chưa hết hạn, đúng tên miền) → bản ghi; ngược lại null. */
export async function verifyPartnerKey(key, origin) {
  if (typeof key !== 'string' || key.length !== KEY_LENGTH) return null;
  const h = hash(key);
  let hit = cache.get(h);
  if (!hit || Date.now() - hit.at > CACHE_MS) {
    hit = { doc: await EduPartnerKey.findOne({ keyHash: h, revokedAt: null }).lean(), at: Date.now() };
    cache.set(h, hit);
  }
  const doc = hit.doc;
  if (!doc || doc.revokedAt || new Date(doc.expiresAt) <= new Date()) return null;
  // Trình duyệt luôn gửi Origin: gọi từ tên miền chưa đăng ký bị từ chối. Gọi từ máy chủ (không có Origin) thì
  // chỉ key bảo vệ — key là bí mật của đối tác (Quy định đối tác mục 3).
  // Key cấp trước khi bắt buộc tên miền (origins rỗng) vẫn chạy mọi nơi tới khi admin thêm tên miền.
  if (origin && doc.origins.length && !doc.origins.includes(String(origin).toLowerCase())) return null;
  pending.set(String(doc._id), (pending.get(String(doc._id)) || 0) + 1); // đếm lượt, ghi gộp 10 giây/lần
  return doc;
}

export const partnerKeyOf = (req) => req.get('x-edu-partner-key') || '';

export const listPartnerKeys = () => EduPartnerKey.find().sort({ createdAt: -1 }).limit(200).select('-keyHash').lean();

export async function revokePartnerKey(id) {
  const r = await EduPartnerKey.updateOne({ _id: id, revokedAt: null }, { $set: { revokedAt: new Date() } });
  forget();
  return r;
}

/** Gia hạn (cộng ngày, còn lại không quá 365 ngày) và/hoặc thay danh sách tên miền. */
export async function updatePartnerKey(id, { days, origins }) {
  const doc = await EduPartnerKey.findOne({ _id: id, revokedAt: null });
  if (!doc) throw Object.assign(new Error('Không có key đang hoạt động này.'), { status: 404 });
  if (days !== undefined) {
    const add = Math.max(1, Number.parseInt(days, 10) || 0);
    const from = Math.max(Date.now(), doc.expiresAt.getTime());
    doc.expiresAt = new Date(Math.min(from + add * 86400_000, Date.now() + MAX_DAYS * 86400_000));
  }
  if (origins !== undefined) {
    const allowed = cleanOrigins(origins);
    if (!allowed.length) throw Object.assign(new Error('Cần ít nhất một tên miền hợp lệ.'), { status: 400 });
    doc.origins = allowed;
  }
  await doc.save();
  forget();
  return { id: String(doc._id), expiresAt: doc.expiresAt, origins: doc.origins };
}
