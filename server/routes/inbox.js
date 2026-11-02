// /api/inbox — hộp thông báo, /api/push — đăng ký web push của máy này.
import express from 'express';
import mongoose from 'mongoose';
import { requireUser } from '../lib/auth.js';
import { fail, handle, limit } from '../lib/limits.js';
import { Notification, PushSub } from '../models.js';
import { vapidPublicKey } from '../lib/notify.js';

export const inbox = express.Router();
inbox.use(requireUser);
inbox.get('/', handle(async (req) => {
  const size = Math.min(100, Math.max(1, Number(req.query.limit) || 20));
  const [notifications, unreadCount] = await Promise.all([
    Notification.find({ email: req.email }).sort({ createdAt: -1 }).limit(size).lean(),
    Notification.countDocuments({ email: req.email, read: false }),
  ]);
  return { notifications, unreadCount };
}));
inbox.patch('/read-all', handle(async (req) => {
  const r = await Notification.updateMany({ email: req.email, read: false }, { $set: { read: true } });
  return { success: true, modifiedCount: r.modifiedCount, unreadCount: 0 };
}));
inbox.patch('/:id/read', handle(async (req) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw fail(400, 'BAD_ID');
  await Notification.updateOne({ _id: req.params.id, email: req.email }, { $set: { read: true } });
  return { success: true };
}));
inbox.delete('/:id', handle(async (req) => {
  if (!mongoose.isValidObjectId(req.params.id)) throw fail(400, 'BAD_ID');
  await Notification.deleteOne({ _id: req.params.id, email: req.email });
  return { success: true };
}));

export const push = express.Router();
push.get('/vapid-public-key', (_req, res) => res.json({ publicKey: vapidPublicKey() }));
push.post('/subscribe', limit(20), requireUser, handle(async (req) => {
  const sub = req.body?.subscription;
  if (!sub?.endpoint || !/^https:\/\//.test(sub.endpoint) || !sub.keys?.p256dh || !sub.keys?.auth) throw fail(400, 'BAD_SUBSCRIPTION', 'Đăng ký thông báo không hợp lệ.');
  const d = req.body?.device || {};
  const device = { locale: String(d.locale || '').slice(0, 20), timezone: String(d.timezone || '').slice(0, 60), platform: String(d.platform || '').slice(0, 60), standalone: Boolean(d.standalone) };
  await PushSub.updateOne({ endpoint: sub.endpoint }, { $set: { email: req.email, subscription: sub, device } }, { upsert: true });
  return { success: true };
}));
push.post('/unsubscribe', requireUser, handle(async (req) => {
  await PushSub.deleteOne({ endpoint: String(req.body?.endpoint || ''), email: req.email });
  return { success: true };
}));
