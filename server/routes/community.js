// /api/community — Cộng đồng Education Hugo kiểu Threads: bài + hồi đáp cùng một model,
// tác giả hiện bằng persona (không tên thật), thăm dò ý kiến, thích, dịch bài.
import express from 'express';
import mongoose from 'mongoose';
import { requireUser } from '../lib/auth.js';
import { fail, handle, limit } from '../lib/limits.js';
import { Learner, Post } from '../models.js';
import { translate } from '../lib/ai.js';

const router = express.Router();
router.use(requireUser);
const MAX_TEXT = 20000;
const POLL_HOURS = [1, 6, 24, 72, 168];
const PAGE = 20;
const isId = (key) => mongoose.isValidObjectId(key) && String(key).length === 24;
const cleanText = (v) => String(v || '').replace(/\r\n/g, '\n').trim();
const cleanAudience = (v) => (v === 'private' ? 'private' : undefined);

function cleanPoll(poll) {
  if (!poll) return undefined;
  const options = (Array.isArray(poll.options) ? poll.options : []).map((o) => String(o || '').trim().slice(0, 80)).filter(Boolean);
  if (options.length < 2 || options.length > 4) return null;
  const hours = POLL_HOURS.includes(Number(poll.hours)) ? Number(poll.hours) : 24;
  return { options: options.map((text) => ({ text, votes: [] })), endsAt: new Date(Date.now() + hours * 3600000) };
}

const view = (me) => ({ authorEmail: 1, audience: 1, text: 1, poll: 1, parentKey: 1, ancestors: 1, likeCount: 1, replyCount: 1, editedAt: 1, createdAt: 1, removed: 1, likes: { $elemMatch: { $eq: me } } });

/** Gửi xuống client: không lộ email của ai, kể cả người bỏ phiếu. */
async function present(posts, me) {
  const emails = [...new Set(posts.map((p) => p.authorEmail))];
  const people = new Map((await Learner.find({ email: { $in: emails } }).select('email nickname avatar badge').lean()).map((d) => [d.email, d]));
  return posts.map((p) => {
    const author = people.get(p.authorEmail);
    return {
      key: String(p._id),
      author: { name: author?.nickname || 'Hugo learner', persona: author?.avatar || null, badge: author?.badge || null },
      text: p.text,
      poll: p.poll && {
        options: p.poll.options.map((o) => ({ text: o.text, count: o.votes.length })),
        total: p.poll.options.reduce((sum, o) => sum + o.votes.length, 0),
        myVote: p.poll.options.findIndex((o) => o.votes.includes(me)),
        endsAt: p.poll.endsAt,
        closed: new Date(p.poll.endsAt) < new Date(),
      },
      parentKey: p.parentKey,
      likeCount: p.likeCount,
      liked: (p.likes || []).includes(me),
      replyCount: p.replyCount,
      createdAt: p.createdAt,
      editedAt: p.editedAt,
      private: p.audience === 'private' || undefined,
      removed: (p.removed && p.authorEmail === me && p.removed.category) || undefined,
      mine: p.authorEmail === me,
    };
  });
}

// Bài riêng tư / bị ẩn và cả nhánh bên dưới: người khác coi như không có; tác giả vẫn thấy.
async function canSee(node, me) {
  if (!node) return false;
  const ids = (node.ancestors || []).filter(isId);
  const chain = ids.length ? [node, ...await Post.find({ _id: { $in: ids } }, { audience: 1, authorEmail: 1, removed: 1 }).lean()] : [node];
  return chain.every((p) => p.authorEmail === me || (!p.removed && p.audience !== 'private'));
}
const visibleTo = (me) => ({ $or: [{ removed: null }, { authorEmail: me }] });

router.get('/posts', limit(60), handle(async (req) => {
  const me = req.email;
  const filter = { parentKey: null, $or: [{ audience: { $ne: 'private' }, removed: null }, { authorEmail: me }] };
  const before = new Date(req.query.before);
  if (!Number.isNaN(before.getTime())) filter.createdAt = { $lt: before };
  const posts = await Post.find(filter, view(me)).sort({ createdAt: -1 }).limit(PAGE).lean();
  return { posts: await present(posts, me), more: posts.length === PAGE };
}));

router.get('/posts/:key', limit(60), handle(async (req) => {
  const me = req.email;
  if (!isId(req.params.key)) throw fail(404, 'NOT_FOUND', 'Không có bài này.');
  const node = await Post.findById(req.params.key, view(me)).lean();
  if (!(await canSee(node, me))) throw fail(404, 'NOT_FOUND', 'Bài này đã bị xoá.');
  const [replies, parent] = await Promise.all([
    Post.find({ parentKey: req.params.key, ...visibleTo(me) }, view(me)).sort({ createdAt: 1 }).limit(200).lean(),
    node.parentKey && isId(node.parentKey) ? Post.findById(node.parentKey, view(me)).lean() : null,
  ]);
  const [post] = await present([node], me);
  const [parentView] = parent ? await present([parent], me) : [null];
  return { post, parent: parentView, replies: await present(replies, me) };
}));

router.post('/posts', limit(10), handle(async (req, res) => {
  const me = req.email;
  const text = cleanText(req.body?.text);
  const poll = cleanPoll(req.body?.poll);
  const parentKey = req.body?.parentKey ? String(req.body.parentKey) : null;
  if (poll === null) throw fail(400, 'BAD_POLL', 'Thăm dò cần 2 đến 4 lựa chọn.');
  if (!text && !poll) throw fail(400, 'EMPTY', 'Viết gì đó trước đã.');
  if (text.length > MAX_TEXT) throw fail(400, 'TOO_LONG', `Bài tối đa ${MAX_TEXT} ký tự.`);
  let ancestors = [];
  if (parentKey) {
    const parent = isId(parentKey) ? await Post.findById(parentKey, { ancestors: 1, audience: 1, authorEmail: 1, removed: 1 }).lean() : null;
    if (!(await canSee(parent, me))) throw fail(404, 'NOT_FOUND', 'Bài bạn trả lời không còn nữa.');
    ancestors = [...(parent.ancestors || []), parentKey];
  }
  // Mạng chập chờn gửi lại: cùng người, cùng nội dung, cùng chỗ trong 30 giây → trả bài vừa đăng.
  const twin = text && await Post.findOne({ authorEmail: me, parentKey, text, createdAt: { $gt: new Date(Date.now() - 30_000) } }).lean();
  if (twin) return { post: (await present([twin], me))[0] };
  const post = await Post.create({ authorEmail: me, text, poll, audience: parentKey ? undefined : cleanAudience(req.body?.audience), parentKey, ancestors: ancestors.length ? ancestors : undefined });
  if (parentKey) await Post.updateOne({ _id: parentKey }, { $inc: { replyCount: 1 } });
  res.status(201);
  return { post: (await present([post.toObject()], me))[0] };
}));

router.patch('/posts/:id', limit(30), handle(async (req) => {
  const text = cleanText(req.body?.text);
  if (!isId(req.params.id)) throw fail(404, 'NOT_FOUND');
  if (text.length > MAX_TEXT) throw fail(400, 'TOO_LONG', `Bài tối đa ${MAX_TEXT} ký tự.`);
  const post = await Post.findOne({ _id: req.params.id, authorEmail: req.email });
  if (!post) throw fail(404, 'NOT_FOUND');
  if (!text && !post.poll) throw fail(400, 'EMPTY', 'Viết gì đó trước đã.');
  post.text = text;
  post.translations = undefined;
  if (!post.parentKey && 'audience' in (req.body || {})) post.audience = cleanAudience(req.body.audience);
  post.editedAt = new Date();
  await post.save();
  return { post: (await present([post.toObject()], req.email))[0] };
}));

router.delete('/posts/:id', limit(30), handle(async (req) => {
  if (!isId(req.params.id)) throw fail(404, 'NOT_FOUND');
  const post = await Post.findOneAndDelete({ _id: req.params.id, authorEmail: req.email });
  if (!post) throw fail(404, 'NOT_FOUND');
  await Post.deleteMany({ ancestors: String(post._id) });
  if (post.parentKey) await Post.updateOne({ _id: post.parentKey }, { $inc: { replyCount: -1 } });
  return { ok: true };
}));

router.post('/posts/:key/like', limit(60), handle(async (req) => {
  const me = req.email;
  if (!isId(req.params.key) || !(await canSee(await Post.findById(req.params.key, { ancestors: 1, audience: 1, authorEmail: 1, removed: 1 }).lean(), me))) throw fail(404, 'NOT_FOUND');
  const where = { _id: req.params.key };
  const opts = { new: true, projection: { likeCount: 1 } };
  const added = await Post.findOneAndUpdate({ ...where, likes: { $ne: me } }, { $push: { likes: me }, $inc: { likeCount: 1 } }, opts).lean();
  const result = added || await Post.findOneAndUpdate({ ...where, likes: me }, { $pull: { likes: me }, $inc: { likeCount: -1 } }, opts).lean();
  if (!result) throw fail(404, 'NOT_FOUND');
  return { liked: Boolean(added), likeCount: result.likeCount };
}));

router.post('/posts/:id/vote', limit(30), handle(async (req) => {
  const me = req.email;
  const option = Number(req.body?.option);
  if (!isId(req.params.id) || !Number.isInteger(option) || option < 0 || option > 3) throw fail(400, 'BAD_VOTE', 'Phiếu không hợp lệ.');
  if (!(await canSee(await Post.findById(req.params.id, { audience: 1, authorEmail: 1, removed: 1 }).lean(), me))) throw fail(404, 'NOT_FOUND');
  const post = await Post.findOneAndUpdate(
    { _id: req.params.id, [`poll.options.${option}`]: { $exists: true }, 'poll.endsAt': { $gt: new Date() }, 'poll.options.votes': { $ne: me } },
    { $push: { [`poll.options.${option}.votes`]: me } }, { new: true },
  ).lean();
  const current = post || await Post.findById(req.params.id).lean();
  if (!current?.poll) throw fail(404, 'NOT_FOUND');
  return { poll: (await present([current], me))[0].poll };
}));

// Dịch khi trình duyệt không có Translator API: mỗi bài dịch MỘT lần mỗi ngôn ngữ rồi lưu lại.
const LANGS = { vi: 'Vietnamese', en: 'English', zh: 'Simplified Chinese' };
router.post('/posts/:id/translate', limit(30), handle(async (req) => {
  const to = String(req.body?.to || req.query.to || '');
  if (!LANGS[to] || !isId(req.params.id)) throw fail(400, 'BAD_REQUEST');
  const post = await Post.findById(req.params.id, { text: 1, translations: 1, removed: 1, audience: 1, authorEmail: 1, ancestors: 1 }).lean();
  if (!(await canSee(post, req.email))) throw fail(404, 'NOT_FOUND');
  if (post.translations?.[to]) return { text: post.translations[to] };
  const text = await translate(post.text, LANGS[to]);
  if (!text) throw fail(503, 'AI_BUSY', 'Chưa dịch được lúc này.');
  await Post.updateOne({ _id: post._id }, { $set: { [`translations.${to}`]: text } });
  return { text };
}));

export default router;
