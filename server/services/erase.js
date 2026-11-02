// Xoá tài khoản Education Hugo (Chính sách quyền riêng tư mục 6–7, Luật BVDLCN 2025): xoá mọi dữ liệu gắn email,
// gỡ email khỏi dữ liệu của người khác (bạn bè, tim, bình chọn), ẩn danh nhật ký admin.
// Tài khoản đăng nhập Hugo Studio (bảng user/session) là dịch vụ riêng, không xoá ở đây.
import {
  AdminLog, DevSignup, Feedback, GemTxn, Learner, LessonFeedback, Notification, Post, Purchase, PushSub, Receipt, Report,
} from '../models.js';

export async function eraseLearner(email) {
  const [me, posts] = await Promise.all([
    Learner.findOne({ email }).select('friendCode').lean(),
    Post.find({ authorEmail: email }).select('_id').lean(),
  ]);
  const code = me?.friendCode;
  const mine = posts.map((p) => String(p._id));
  const byEmail = { email };
  await Promise.all([
    // Chỉ chạm các learner có giữ mã của người này (không quét cả bảng).
    code && Learner.updateMany({ $or: [{ friends: code }, { requestsIn: code }, { requestsOut: code }] },
      { $pull: { friends: code, requestsIn: code, requestsOut: code } }),
    // Bình luận của người này và mọi trả lời nằm dưới chúng. ponytail: replyCount của bài cha không trừ lại.
    mine.length && Post.deleteMany({ $or: [{ authorEmail: email }, { ancestors: { $in: mine } }] }),
    Post.updateMany({ likes: email }, { $pull: { likes: email }, $inc: { likeCount: -1 } }),
    Post.updateMany({ 'poll.options.votes': email }, { $pull: { 'poll.options.$[].votes': email } }),
    ...[GemTxn, Purchase, Receipt, Notification, PushSub, Feedback, LessonFeedback, DevSignup].map((m) => m.deleteMany(byEmail)),
    Report.deleteMany({ $or: [{ reporterEmail: email }, { targetEmail: email }] }),
    AdminLog.updateMany({ target: email }, { $set: { target: '(đã xoá)' } }),
    Learner.deleteOne(byEmail),
  ]);
}
