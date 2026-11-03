// Gửi một mail HTML tới toàn bộ người dùng Hugo Studio (bảng user) + người học Education Hugo.
// Bỏ qua: tài khoản bị khoá, người đã tắt "Nhận thông báo qua email" trong Cài đặt.
//
//   Xem trước (không gửi):  MONGODB_URI=... node server/scripts/send-campaign.mjs mail.html "Tiêu đề"
//   Gửi thử 1 địa chỉ:      ... TEST=ban@gmail.com RESEND_API_KEY=re_... node server/scripts/send-campaign.mjs mail.html "Tiêu đề"
//   Gửi thật:               ... SEND=1 RESEND_API_KEY=re_... node server/scripts/send-campaign.mjs mail.html "Tiêu đề"
import fs from 'fs';
import mongoose from 'mongoose';

const [file, subject] = process.argv.slice(2);
if (!file || !subject) { console.error('Cần: <tệp html> "<tiêu đề>"'); process.exit(1); }
const FROM = process.env.EMAIL_FROM || 'Education Hugo <edu@hugowishpax.studio>';
const footer = '<p style="font:12px/1.5 sans-serif;color:#8a8fa3;text-align:center;margin:16px 0">Bạn nhận thư này vì có tài khoản Hugo Studio / Education Hugo. Không muốn nhận nữa: tắt "Nhận thông báo qua email" trong Cài đặt của Education Hugo hoặc trả lời thư này với chữ "Huỷ".</p>';
const html = fs.readFileSync(file, 'utf8') + footer;

let to;
if (process.env.TEST) to = [process.env.TEST];
else {
  await mongoose.connect(process.env.MONGODB_URI);
  const db = mongoose.connection.db;
  const off = new Set((await db.collection('learners').find(
    { $or: [{ 'prefs.notifyEmail': false }, { bannedAt: { $ne: null } }] }, { projection: { email: 1 } },
  ).toArray()).map((l) => l.email));
  const all = [
    ...(await db.collection('user').distinct('email')),
    ...(await db.collection('learners').distinct('email')),
  ].map((e) => String(e).trim().toLowerCase()).filter((e) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));
  to = [...new Set(all)].filter((e) => !off.has(e));
  await mongoose.disconnect();
}
console.log(`${to.length} người nhận. Ví dụ: ${to.slice(0, 5).join(', ')}`);
if (!process.env.SEND && !process.env.TEST) { console.log('Chỉ xem trước. Thêm SEND=1 để gửi thật.'); process.exit(0); }

// Resend batch: tối đa 100 thư mỗi lần gọi; mỗi người một thư riêng (không lộ địa chỉ của nhau).
let ok = 0;
for (let i = 0; i < to.length; i += 100) {
  const batch = to.slice(i, i + 100).map((email) => ({ from: FROM, to: [email], subject, html }));
  const res = await fetch('https://api.resend.com/emails/batch', {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.RESEND_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(batch),
  });
  if (!res.ok) { console.error(`Dừng ở thư ${i}: ${res.status} ${await res.text()}`); process.exit(1); }
  ok += batch.length;
  console.log(`Đã gửi ${ok}/${to.length}`);
  await new Promise((r) => setTimeout(r, 600)); // giới hạn 2 yêu cầu/giây của Resend
}
