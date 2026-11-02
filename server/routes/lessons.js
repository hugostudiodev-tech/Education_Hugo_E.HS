// /api/lessons — nội dung bài. Step học thử mở cho khách (cache CDN được); còn lại
// cần đăng nhập HOẶC key đối tác (X-Edu-Partner-Key). Trắc nghiệm gửi xuống đã xáo, không kèm đáp án.
import express from 'express';
import { COURSES, findStep } from '../../packages/courses/index.js';
import { publicQuiz } from '../../packages/shared/stepQuiz.js';
import { localizeCourse } from '../../packages/courses/coding/localize.js';
import { stepLessons } from '../../packages/courses/coding/lessons.js';
import { gradeStepQuiz, PASS_PERCENT } from '../services/grading.js';
import { partnerKeyOf, verifyPartnerKey } from '../services/partner.js';
import { optionalUser, requireUser } from '../lib/auth.js';
import { fail, handle, limit } from '../lib/limits.js';
import { LessonFeedback } from '../models.js';

const router = express.Router();
const SUMMARY = ['id', 'title', 'lang', 'file', 'practiceType', 'duration', 'stage', 'draft'];
const summary = (step) => ({
  ...Object.fromEntries(SUMMARY.filter((k) => step[k] !== undefined).map((k) => [k, step[k]])),
  ...(step.draft ? {} : { lessons: stepLessons(step.slides).length }),
});
const present = (step, lang) => {
  const text = (findStep(step.id)?.course.localize || localizeCourse)(step, lang);
  return { ...text, quiz: publicQuiz(text.quiz) };
};
const langOf = (q) => (['en', 'zh'].includes(q) ? q : 'vi');
const partnerOk = async (req) => Boolean(partnerKeyOf(req)) && Boolean(await verifyPartnerKey(partnerKeyOf(req), req.get('origin')));

router.get('/', limit(90), handle((req, res) => {
  const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
  const size = Math.min(50, Math.max(5, Number.parseInt(req.query.limit, 10) || 25));
  const { STAGES, WEB_COURSES, getStageBenefits } = Object.hasOwn(COURSES, req.query.course) ? COURSES[req.query.course] : COURSES.coding;
  const stage = STAGES.find((s) => s.id === String(req.query.stage || ''));
  const source = stage ? WEB_COURSES.slice(stage.from, stage.to) : WEB_COURSES;
  const start = (page - 1) * size;
  const items = source.slice(start, start + size).map(summary);
  res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600');
  return {
    items,
    stages: page === 1 ? STAGES.map((s) => ({ ...s, benefits: getStageBenefits ? getStageBenefits(s.id) : [] })) : undefined,
    pagination: { page, limit: size, total: source.length, pages: Math.ceil(source.length / size), hasNextPage: start + items.length < source.length },
  };
}));

router.get('/:id', limit(90), optionalUser, handle(async (req, res) => {
  const found = findStep(req.params.id);
  if (!found) throw fail(404, 'NOT_FOUND', 'Không có step này.');
  const lang = langOf(req.query.lang);
  if (found.index < found.course.preview) {
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=300, stale-while-revalidate=3600');
    return { lesson: present(found.step, lang) };
  }
  res.setHeader('Cache-Control', 'private, no-store');
  if (partnerKeyOf(req)) {
    if (!(await partnerOk(req))) throw fail(401, 'PARTNER_KEY_INVALID', 'Key đối tác không hợp lệ hoặc đã hết hạn.');
    return { lesson: present(found.step, lang) };
  }
  if (!req.email) throw fail(401, 'LOGIN_REQUIRED', 'Đăng nhập để học bài này.');
  return { lesson: present(found.step, lang) };
}));

// Khách học thử / đối tác chấm ở đây (không ghi tiến độ). Người học đăng nhập nộp qua /api/learn/quiz.
router.post('/:id/grade', limit(20), handle(async (req) => {
  const found = findStep(req.params.id);
  if (!found) throw fail(404, 'NOT_FOUND', 'Không có step này.');
  if (found.index >= found.course.preview && !(await partnerOk(req))) throw fail(403, 'COURSE_ACCESS_REQUIRED', 'Step này cần đăng nhập.');
  const graded = gradeStepQuiz(found.step.id, req.body?.answers);
  if (!graded) throw fail(409, 'STEP_NOT_READY', 'Step này đang được soạn.');
  return { ...graded, passPercent: PASS_PERCENT };
}));

router.post('/:id/feedback', limit(5, 10 * 60_000), requireUser, handle(async (req) => {
  if (!findStep(req.params.id)) throw fail(404, 'NOT_FOUND', 'Không có step này.');
  const message = String(req.body?.message || '').trim().slice(0, 2000);
  if (message.length < 5) throw fail(400, 'TOO_SHORT', 'Viết rõ hơn một chút nhé.');
  await LessonFeedback.create({ email: req.email, lessonId: req.params.id, stepIndex: Number(req.body?.stepIndex) || 0, message });
  return { success: true };
}));

export default router;
