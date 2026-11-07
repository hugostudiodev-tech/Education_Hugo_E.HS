// Máy chủ Education Hugo — Express + MongoDB + Better Auth. Một process (Render free).
import express from 'express';
import { mailStatus } from './lib/notify.js';
import mongoose from 'mongoose';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cron from 'node-cron';
import { toNodeHandler } from 'better-auth/node';
import { ADMIN_EMAILS, getAdminAuth, initAuth } from './lib/auth.js';
import { isProd, ORIGINS } from './lib/config.js';
import lessons from './routes/lessons.js';
import me from './routes/me.js';
import social from './routes/social.js';
import store from './routes/store.js';
import community from './routes/community.js';
import partner from './routes/partner.js';
import admin from './routes/admin.js';
import practice from './routes/practice.js';
import { inbox, push } from './routes/inbox.js';
import { runReminders } from './services/learning.js';
import { seedProducts } from './services/store.js';
import { seedOfficial } from './services/social.js';

for (const name of ['MONGODB_URI', 'BETTER_AUTH_SECRET']) {
  if (!process.env[name]) { console.error(`Thiếu biến môi trường ${name}.`); process.exit(1); }
}

await mongoose.connect(process.env.MONGODB_URI, { maxPoolSize: Number(process.env.MAX_DB_POOL || 10) });
const auth = initAuth();

const app = express();
app.set('trust proxy', 1);
app.disable('x-powered-by');
app.use(helmet({ contentSecurityPolicy: false, crossOriginResourcePolicy: false }));
app.use(compression());

// Thư viện đối tác gọi từ tên miền của đối tác: không cookie, danh tính là key trong header.
const partnerCors = cors({ origin: true, credentials: false, allowedHeaders: ['Content-Type', 'X-Edu-Partner-Key'], maxAge: 86400 });
const wantsPartner = (req) => Boolean(req.get('x-edu-partner-key')) || (req.method === 'OPTIONS' && /x-edu-partner-key/i.test(req.get('access-control-request-headers') || ''));
app.use(['/api/lessons', '/api/partner'], (req, res, next) => (wantsPartner(req) ? partnerCors(req, res, next) : next()));
const local = /^https?:\/\/((?:[a-z0-9-]+\.)?localhost|127\.0\.0\.1)(:\d+)?$/;
app.use(cors({ origin: (origin, cb) => cb(null, !origin || ORIGINS.includes(origin) || (!isProd && local.test(origin))), credentials: true, exposedHeaders: ['set-auth-token'] }));

// Better Auth đọc body thô — gắn TRƯỚC express.json.
app.all('/api/auth/*', toNodeHandler(auth));
// Thiếu cấu hình mail thì mã admin không bao giờ tới: báo ngay thay vì để admin chờ thư.
app.post('/api/admin-auth/email-otp/send-verification-otp', (req, res, next) => {
  if (process.env.RESEND_API_KEY) return next();
  return res.status(503).json({ code: 'MAIL_NOT_CONFIGURED', message: 'Máy chủ chưa cấu hình gửi mail (RESEND_API_KEY trên Render), nên chưa gửi được mã. Dùng Face ID / vân tay nếu đã bật.' });
});
app.all('/api/admin-auth/*', toNodeHandler(getAdminAuth()));
app.use(express.json({ limit: '200kb' }));

app.get('/api/health', (_req, res) => res.json({ status: 'ok', db: mongoose.connection.readyState === 1 ? 'up' : 'down', uptime: Math.round(process.uptime()), mail: Boolean(process.env.RESEND_API_KEY), mailFrom: (process.env.EMAIL_FROM || 'no-reply@education.hugowishpax.studio').replace(/.*</, '').replace('>', ''), mailLastError: mailStatus.lastError, mailLastOkAt: mailStatus.lastOkAt, admins: ADMIN_EMAILS.size }));
app.use('/api/lessons', lessons);
app.use('/api/partner', partner);
app.use('/api/push', push);
app.use('/api/inbox', inbox);
app.use('/api/social', social);
app.use('/api/store', store);
app.use('/api/community', community);
app.use('/api/admin', admin);
app.use('/api/practice', practice);
app.use('/api', me);
app.use('/api', (_req, res) => res.status(404).json({ code: 'NOT_FOUND', error: 'Không có API này.' }));

// Nhắc học theo giờ Việt Nam, phút 0 mỗi giờ.
cron.schedule('0 * * * *', () => runReminders().catch((error) => console.error('[cron nhắc học]', error.message)), { timezone: 'Asia/Ho_Chi_Minh' });
seedProducts().catch((error) => console.error('[seed cửa hàng]', error.message));
seedOfficial().catch((error) => console.error('[seed tài khoản chính thức]', error.message));

const PORT = Number(process.env.PORT || 8100);
app.listen(PORT, () => console.log(`Education Hugo API chạy ở cổng ${PORT}`));
