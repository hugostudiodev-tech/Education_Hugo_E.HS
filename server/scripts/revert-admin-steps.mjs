/**
 * Hoàn tác các step bị "admin hoàn tất" ngoài ý muốn (lỗi 7/11/2026: mở chi tiết member là tự bấm Hoàn tất).
 *
 *   MONGODB_URI="mongodb+srv://…/education_hugo" node server/scripts/revert-admin-steps.mjs            # chỉ in, không ghi
 *   MONGODB_URI=… node server/scripts/revert-admin-steps.mjs --apply                                     # chạy thật
 *   … --since=2026-11-07T14:00:00Z                                                                       # mốc bắt đầu (mặc định lúc deploy)
 *
 * Với mỗi step có dòng admin_done sau mốc:
 *  - bỏ khỏi `completed`, trừ khi member tự làm trắc nghiệm qua step đó sau mốc;
 *  - lessonsDone[step] = các bài member thật sự học (Activity kind=lesson), không có thì xoá;
 *  - xoá các dòng admin_done đó. Điểm trắc nghiệm không bị đụng (lúc hoàn tất cũng không ghi điểm).
 */
import mongoose from 'mongoose';

const APPLY = process.argv.includes('--apply');
const since = new Date(process.argv.find((a) => a.startsWith('--since='))?.slice(8) || '2026-11-07T14:00:00Z');
if (!process.env.MONGODB_URI) { console.error('Cần MONGODB_URI.'); process.exit(1); }
const db = (await mongoose.connect(process.env.MONGODB_URI)).connection.db;
const activity = db.collection('activities');
const learners = db.collection('learners');

const rows = await activity.find({ kind: 'admin_done', createdAt: { $gte: since } }).toArray();
const byEmail = new Map(); // ponytail: không dùng Map.groupBy (Node 21+), Render có thể chạy Node 20
for (const r of rows) byEmail.set(r.email, [...(byEmail.get(r.email) || []), r]);
console.log(`${rows.length} dòng admin_done từ ${since.toISOString()}, ${byEmail.size} member.`);

for (const [email, list] of byEmail) {
  const ids = [...new Set(list.map((r) => r.stepId))];
  const real = await activity.find({ email, stepId: { $in: ids }, kind: { $in: ['lesson', 'quiz'] } }).toArray();
  const passed = new Set(real.filter((r) => r.kind === 'quiz' && r.passed && r.createdAt >= since).map((r) => r.stepId));
  const revert = ids.filter((id) => !passed.has(id));
  const set = {};
  const unset = {};
  for (const id of revert) {
    const lessons = [...new Set(real.filter((r) => r.kind === 'lesson' && r.stepId === id).map((r) => r.lesson))].sort((a, b) => a - b);
    if (lessons.length) set[`lessonsDone.${id}`] = lessons; else unset[`lessonsDone.${id}`] = 1;
  }
  console.log(`${email}: gỡ ${revert.length} step (${revert.join(', ')})${passed.size ? ` · giữ ${[...passed].join(', ')} (tự qua)` : ''}`);
  if (!APPLY) continue;
  const update = { $pull: { completed: { $in: revert } } };
  if (Object.keys(set).length) update.$set = set;
  if (Object.keys(unset).length) update.$unset = unset;
  await learners.updateOne({ email }, update);
  await activity.deleteMany({ _id: { $in: list.map((r) => r._id) } });
}
console.log(APPLY ? 'Đã hoàn tác.' : 'Chạy thử xong. Thêm --apply để ghi.');
await mongoose.disconnect();
