// /api/practice — Luyện tập của người đang đăng nhập: nhiệm vụ ngày, ôn tập, sổ câu sai, thách đấu.
import express from 'express';
import { requireUser } from '../lib/auth.js';
import { handle, limit } from '../lib/limits.js';
import {
  challengeQuiz, claimQuests, createChallenge, gradeMistakes, mistakeRound, playChallenge, practiceView,
} from '../services/practice.js';

const router = express.Router();
const langOf = (q) => (['en', 'zh'].includes(q) ? q : 'vi');
router.use(requireUser, (_req, res, next) => { res.set('Cache-Control', 'private, no-store'); next(); });

router.get('/', limit(60), handle((req) => practiceView(req.email)));
router.post('/quests/claim', limit(10), handle((req) => claimQuests(req.email)));
router.get('/mistakes', limit(30), handle((req) => mistakeRound(req.email, langOf(req.query.lang))));
router.post('/mistakes', limit(20), handle((req) => gradeMistakes(req.email, req.body?.answers)));
router.post('/challenges', limit(10), handle((req) => createChallenge(req.email, req.body?.code)));
router.get('/challenges/:id/quiz', limit(30), handle((req) => challengeQuiz(req.email, req.params.id, langOf(req.query.lang))));
router.post('/challenges/:id', limit(20), handle((req) => playChallenge(req.email, req.params.id, req.body?.answers)));

export default router;
