// Một cửa cho mọi thông báo Education Hugo: hộp thông báo (lưu khoá + tham số để dựng
// đúng ngôn ngữ người đọc), web push theo ngôn ngữ từng máy, và thư cho tin đáng giữ.
// Chữ nằm ở packages/shared/eduStreak.js (STREAK_PUSH) — viết một lần cho cả ba kênh.
import webpush from 'web-push';
import { Learner, Notification, PushSub } from '../models.js';
import { cleanEduPrefs } from '../../packages/shared/eduPrefs.js';
import { EDU_CAST, streakPush } from '../../packages/shared/eduStreak.js';
import { EDU_ORIGIN } from './config.js';

const VAPID = { publicKey: process.env.VAPID_PUBLIC_KEY || '', privateKey: process.env.VAPID_PRIVATE_KEY || '' };
if (VAPID.publicKey && VAPID.privateKey) webpush.setVapidDetails(process.env.VAPID_SUBJECT || 'mailto:contact@hugowishpax.studio', VAPID.publicKey, VAPID.privateKey);
export const vapidPublicKey = () => VAPID.publicKey;

const CATEGORY = { security: 'security', milestone: 'gems', purchase: 'gems' };
const ESSENTIAL = new Set(['security']);
const MAIL_KEYS = new Set(['welcome', 'security', 'frozen', 'milestone', 'friendRequest']);
const DEAD = new Set([403, 404, 410]);
const e = (text) => String(text ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const langOf = (locale) => { const c = String(locale || '').toLowerCase().slice(0, 2); return c === 'en' || c === 'zh' ? c : 'vi'; };

const COPY = {
  vi: {
    cta: { welcome: 'HỌC NGAY', security: 'KIỂM TRA TÀI KHOẢN', frozen: 'SƯỞI ẤM LỬA NHỎ', milestone: 'XEM LỊCH LỬA', friendRequest: 'XEM LỜI MỜI' },
    tagline: 'Khoá học miễn phí cho học sinh – sinh viên · nhận ủng hộ tự nguyện để duy trì dự án',
    reason: 'Bạn nhận thư này vì có tài khoản Education Hugo. Tắt thư email trong Hồ sơ > Thông báo.',
    terms: 'Điều khoản', privacy: 'Quyền riêng tư', profile: 'Hồ sơ',
  },
  en: {
    cta: { welcome: 'LEARN NOW', security: 'REVIEW MY ACCOUNT', frozen: 'WARM UP LITTLE FLAME', milestone: 'SEE MY STREAK', friendRequest: 'SEE THE REQUEST' },
    tagline: 'Free courses for students · supported by voluntary donations',
    reason: 'You are receiving this because you have an Education Hugo account. Turn emails off in Profile > Notifications.',
    terms: 'Terms', privacy: 'Privacy', profile: 'Profile',
  },
  zh: {
    cta: { welcome: '立即学习', security: '检查账户', frozen: '温暖小火苗', milestone: '查看火苗日历', friendRequest: '查看邀请' },
    tagline: '面向学生的免费课程 · 由自愿捐助支持',
    reason: '你收到此邮件是因为你拥有 Education Hugo 账户。可在 个人资料 > 通知 中关闭邮件。',
    terms: '条款', privacy: '隐私', profile: '个人资料',
  },
};

export function eduEmail({ lang = 'vi', cast = 'cast-1', title, body, cta }) {
  const c = COPY[lang] || COPY.vi;
  const button = cta ? `<tr><td align="center" style="padding:28px 24px 8px;">
    <a href="${cta.href}" style="display:inline-block;background:#1cb0f6;color:#ffffff;padding:15px 34px;border-radius:14px;border-bottom:4px solid #1899d6;text-decoration:none;font-size:15px;font-weight:800;letter-spacing:.06em;">${e(cta.label)}</a>
  </td></tr>` : '';
  const link = (path, label) => `<a href="${EDU_ORIGIN}${path}" style="color:#1cb0f6;text-decoration:none;font-weight:700;">${label}</a>`;
  return `<!doctype html><html lang="${lang}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body data-hugo-mail style="margin:0;padding:0;background:#ffffff;font-family:'Nunito','Segoe UI',-apple-system,BlinkMacSystemFont,Roboto,Arial,sans-serif;color:#3c3c3c;">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${e(body)}</div>
<table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:28px 16px;">
<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:480px;">
  <tr><td align="center" style="font-size:26px;font-weight:800;letter-spacing:-.6px;color:#afafaf;">Education Hugo</td></tr>
  <tr><td align="center" style="padding:26px 0 0;"><img src="${EDU_ORIGIN}/edu/mail/${cast}.png" width="160" height="160" alt="" style="display:block;border:0;"></td></tr>
  <tr><td align="center" style="padding:26px 24px 0;font-size:26px;line-height:1.25;font-weight:800;color:#3c3c3c;">${e(title)}</td></tr>
  <tr><td align="center" style="padding:14px 28px 0;font-size:16px;line-height:1.6;color:#777777;">${e(body)}</td></tr>
  ${button}
  <tr><td style="padding:34px 24px 0;"><div style="border-top:2px solid #e5e5e5;font-size:0;line-height:0;">&nbsp;</div></td></tr>
  <tr><td align="center" style="padding:18px 24px 0;font-size:13px;line-height:1.7;color:#afafaf;">
    ${e(c.tagline)}<br>
    ${link('/terms', e(c.terms))} · ${link('/privacy', e(c.privacy))} · ${link('/profile', e(c.profile))}<br>
    <span style="display:inline-block;margin-top:8px;">${e(c.reason)}</span><br>
    <span style="display:inline-block;margin-top:8px;">© ${new Date().getFullYear()} Hugo Studio · contact@hugowishpax.studio</span>
  </td></tr>
</table>
</td></tr></table></body></html>`;
}

/** Gửi thư qua Resend (gói miễn phí 3.000 thư/tháng). Chưa cấu hình thì chỉ ghi log. */
// Lỗi gửi thư gần nhất (không kèm địa chỉ người nhận) — /api/health hiện ra để chẩn đoán nhanh.
export const mailStatus = { lastError: null, lastOkAt: null };

export async function sendMail(to, subject, html) {
  if (!process.env.RESEND_API_KEY) { console.log(`[mail mô phỏng] ${to} · ${subject}`); return { simulated: true }; }
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ from: process.env.EMAIL_FROM || 'Education Hugo <no-reply@education.hugowishpax.studio>', to, subject: String(subject).replace(/[\r\n]+/g, ' '), html }),
  });
  if (!res.ok) {
    const error = new Error(`Resend ${res.status}: ${(await res.text()).slice(0, 200)}`);
    mailStatus.lastError = { at: new Date().toISOString(), message: error.message.replaceAll(to, '<người nhận>') };
    throw error;
  }
  mailStatus.lastOkAt = new Date().toISOString();
  return res.json();
}

async function pushAll(email, textFor, url, tag) {
  const subs = await PushSub.find({ email }).lean();
  await Promise.all(subs.map((sub) => {
    const text = textFor(langOf(sub.device?.locale));
    if (!text?.title || !VAPID.privateKey) return null;
    const payload = JSON.stringify({ title: text.title, body: text.body || '', icon: '/edu/icon-192.png', url, ...(tag ? { tag } : {}) });
    return webpush.sendNotification(sub.subscription, payload, { TTL: 24 * 3600 }).catch((error) => {
      if (DEAD.has(error.statusCode)) return PushSub.deleteOne({ _id: sub._id });
      console.error('[push]', error.statusCode || error.message);
      return null;
    });
  }));
}

/** Thông báo soạn tay (admin) tới nhiều người: hộp thư + đẩy. Không gửi thư email. */
export async function announceTo(emails, { title, body, url }) {
  if (!emails.length) return;
  await Notification.insertMany(emails.map((email) => ({ email, key: 'announce', category: 'general', title, message: body, actionUrl: url })));
  // ponytail: đẩy tuần tự từng người; chia lô/hàng đợi khi người theo dõi lên hàng chục nghìn.
  for (const email of emails) await pushAll(email, () => ({ title, body }), url, 'edu-announce').catch(() => {});
}

/** Gửi một thông báo theo khoá STREAK_PUSH tới người học. Không bao giờ ném lỗi ra ngoài. */
export async function notify(email, { key, vars = {}, url = '/learn', tag } = {}) {
  try {
    const vi = streakPush('vi', key, vars);
    if (!vi) return;
    await Notification.create({ email, key, params: vars, category: CATEGORY[key] || 'general', title: vi.title, message: vi.body, actionUrl: url });
    await pushAll(email, (lang) => streakPush(lang, key, vars), url, tag);
    if (!MAIL_KEYS.has(key)) return;
    const doc = await Learner.findOne({ email }).select('prefs').lean();
    if (doc && !cleanEduPrefs(doc.prefs).notifyEmail && !ESSENTIAL.has(key)) return;
    const sub = await PushSub.findOne({ email }).sort({ _id: -1 }).select('device').lean();
    const lang = langOf(sub?.device?.locale);
    const text = streakPush(lang, key, vars);
    await sendMail(email, text.title, eduEmail({ lang, cast: EDU_CAST[key], title: text.title, body: text.body, cta: { href: `${EDU_ORIGIN}${url}`, label: COPY[lang].cta[key] } }));
  } catch (error) {
    console.error('[notify]', key, error.message);
  }
}
