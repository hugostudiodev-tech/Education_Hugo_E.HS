// /api/social — bạn bè hai chiều có duyệt, thi đua tuần, hồ sơ công khai, báo cáo.
import express from 'express';
import { requireUser } from '../lib/auth.js';
import { handle, limit } from '../lib/limits.js';
import { learnerProfile, removeFriend, reportLearner, requestFriend, respondFriend, searchLearners, socialView } from '../services/social.js';

const router = express.Router();
router.use(requireUser);
const friends = limit(30);
const noStore = (res) => res.set('Cache-Control', 'private, no-store');

router.get('/', handle((req, res) => { noStore(res); return socialView(req.email); }));
router.post('/friends', friends, handle(async (req) => { await requestFriend(req.email, req.body?.code); return { success: true }; }));
router.post('/friends/:code/accept', friends, handle(async (req) => { await respondFriend(req.email, req.params.code, true); return { success: true }; }));
router.post('/friends/:code/decline', friends, handle(async (req) => { await respondFriend(req.email, req.params.code, false); return { success: true }; }));
router.delete('/friends/:code', friends, handle(async (req) => { await removeFriend(req.email, req.params.code); return { success: true }; }));
router.get('/search', limit(30), handle(async (req, res) => { noStore(res); return { results: await searchLearners(req.email, req.query.q) }; }));
router.get('/profile/:code', limit(60), handle((req, res) => { noStore(res); return learnerProfile(req.email, req.params.code); }));
router.post('/report', limit(5, 10 * 60_000), handle(async (req) => { await reportLearner(req.email, req.body?.code, { reason: req.body?.reason, note: req.body?.note }); return { success: true }; }));

export default router;
