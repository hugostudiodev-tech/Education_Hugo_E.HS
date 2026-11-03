// /api/community — bảng Ads một chiều: admin đăng, thành viên chỉ xem, dịch và thả tim.
import express from 'express';
import mongoose from 'mongoose';
import { requireUser } from '../lib/auth.js';
import { fail, handle, limit } from '../lib/limits.js';
import { Post } from '../models.js';
import { translate } from '../lib/ai.js';

const router = express.Router();
router.use(requireUser);
const PAGE = 20;
const isId = (key) => mongoose.isValidObjectId(key) && String(key).length === 24;
const visibleAd = { byAdmin: true, parentKey: null, removed: null, audience: { $ne: 'private' } };
const view = (me) => ({ title: 1, mascot: 1, text: 1, likeCount: 1, createdAt: 1, likes: { $elemMatch: { $eq: me } } });
const present = (posts, me) => posts.map((post) => ({
  key: String(post._id),
  author: { name: 'Education Hugo', mascot: post.mascot || 'cast-1', admin: true },
  title: post.title || undefined,
  text: post.text,
  likeCount: post.likeCount,
  liked: (post.likes || []).includes(me),
  createdAt: post.createdAt,
}));

router.get('/posts', limit(60), handle(async (req) => {
  const filter = { ...visibleAd };
  const before = new Date(req.query.before);
  if (!Number.isNaN(before.getTime())) filter.createdAt = { $lt: before };
  const posts = await Post.find(filter, view(req.email)).sort({ createdAt: -1 }).limit(PAGE).lean();
  return { posts: present(posts, req.email), more: posts.length === PAGE };
}));

router.post('/posts/:key/like', limit(60), handle(async (req) => {
  const me = req.email;
  if (!isId(req.params.key)) throw fail(404, 'NOT_FOUND');
  const where = { _id: req.params.key, ...visibleAd };
  const opts = { new: true, projection: { likeCount: 1 } };
  const added = await Post.findOneAndUpdate({ ...where, likes: { $ne: me } }, { $push: { likes: me }, $inc: { likeCount: 1 } }, opts).lean();
  const result = added || await Post.findOneAndUpdate({ ...where, likes: me }, { $pull: { likes: me }, $inc: { likeCount: -1 } }, opts).lean();
  if (!result) throw fail(404, 'NOT_FOUND');
  return { liked: Boolean(added), likeCount: result.likeCount };
}));

const LANGS = { vi: 'Vietnamese', en: 'English', zh: 'Simplified Chinese' };
router.post('/posts/:id/translate', limit(30), handle(async (req) => {
  const to = String(req.body?.to || req.query.to || '');
  if (!LANGS[to] || !isId(req.params.id)) throw fail(400, 'BAD_REQUEST');
  const post = await Post.findOne({ _id: req.params.id, ...visibleAd }, { text: 1, translations: 1 }).lean();
  if (!post) throw fail(404, 'NOT_FOUND');
  if (post.translations?.[to]) return { text: post.translations[to] };
  const text = await translate(post.text, LANGS[to]);
  if (!text) throw fail(503, 'AI_BUSY', 'Chưa dịch được lúc này.');
  await Post.updateOne({ _id: post._id }, { $set: { [`translations.${to}`]: text } });
  return { text };
}));

export default router;
