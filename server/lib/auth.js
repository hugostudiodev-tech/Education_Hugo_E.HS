/**
 * Đăng nhập Education Hugo (Better Auth, collection user/session/account/passkey):
 *   - Google: nút Google Identity gửi ID token (sign-in/social + idToken)
 *   - Hugo Studio: OAuth 2 + PKCE với máy chủ Hugo Studio (www.hugowishpax.studio)
 *   - Passkey: Face ID / vân tay. rpID = tên miền gốc nên passkey tạo ở Hugo Studio vẫn dùng được.
 * Cùng email = cùng một tài khoản, đăng nhập đường nào cũng vào đúng người học đó.
 * Admin không có hệ đăng nhập riêng: là người học có email trong ADMIN_EMAILS.
 */
import mongoose from 'mongoose';
import { betterAuth, APIError } from 'better-auth';
import { mongodbAdapter } from 'better-auth/adapters/mongodb';
import { fromNodeHeaders } from 'better-auth/node';
import { bearer, genericOAuth } from 'better-auth/plugins';
import { passkey } from '@better-auth/passkey';
import { Learner } from '../models.js';
import { EDU_ORIGIN, isProd, ORIGINS } from './config.js';

const DAY = 24 * 60 * 60;
const HUGO = process.env.HUGO_STUDIO_ORIGIN || 'https://www.hugowishpax.studio';

export const ADMIN_EMAILS = new Set(String(process.env.ADMIN_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean));

let auth = null;

export function initAuth() {
  const db = mongoose.connection.db;
  const local = (origin) => !isProd && /^https?:\/\/((?:[a-z0-9-]+\.)?localhost|127\.0\.0\.1)(:\d+)?$/.test(origin || '');
  auth = betterAuth({
    appName: 'Education Hugo',
    basePath: '/api/auth',
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL || (isProd ? EDU_ORIGIN : 'http://localhost:3002'),
    database: mongodbAdapter(db, { client: mongoose.connection.getClient(), transaction: false }),
    trustedOrigins: (request) => {
      const origin = request?.headers?.get?.('origin') || '';
      return local(origin) ? [...ORIGINS, origin] : ORIGINS;
    },
    session: { expiresIn: 30 * DAY, updateAge: DAY, cookieCache: { enabled: true, maxAge: 5 * 60 } },
    rateLimit: { enabled: true, window: 60, max: 30, storage: 'memory' },
    advanced: {
      cookiePrefix: 'edu',
      ipAddress: { ipAddressHeaders: ['cf-connecting-ip', 'x-forwarded-for'] },
      defaultCookieAttributes: { sameSite: 'lax', secure: isProd, httpOnly: true },
    },
    socialProviders: {
      google: { clientId: process.env.GOOGLE_CLIENT_ID || '', clientSecret: process.env.GOOGLE_CLIENT_SECRET || '' },
    },
    account: { accountLinking: { enabled: true, trustedProviders: ['google', 'hugo-studio'] } },
    plugins: [
      passkey({
        rpID: process.env.PASSKEY_RP_ID || (isProd ? 'hugowishpax.studio' : 'localhost'),
        rpName: 'Education Hugo',
        origin: isProd ? ORIGINS : null,
        authenticatorSelection: { userVerification: 'required' },
      }),
      genericOAuth({
        config: [{
          providerId: 'hugo-studio',
          clientId: process.env.HUGO_OAUTH_CLIENT_ID || 'unset',
          clientSecret: process.env.HUGO_OAUTH_CLIENT_SECRET || 'unset',
          authorizationUrl: `${HUGO}/oauth/authorize`,
          tokenUrl: `${HUGO}/api/oauth/token`,
          userInfoUrl: `${HUGO}/api/oauth/userinfo`,
          scopes: ['profile', 'email'],
          pkce: true,
        }],
      }),
      bearer(),
    ],
    databaseHooks: {
      user: { create: { after: async (user) => {
        await Learner.updateOne({ email: user.email.toLowerCase() }, { $setOnInsert: { email: user.email.toLowerCase(), name: user.name || '', image: user.image || '' } }, { upsert: true })
          .catch((error) => console.error('[auth] tạo người học:', error.message));
      } } },
      session: { create: { before: async (session, ctx) => {
        const user = await ctx?.context?.internalAdapter?.findUserById(session.userId);
        if (user?.email && await Learner.exists({ email: user.email.toLowerCase(), bannedAt: { $ne: null } })) {
          throw new APIError('FORBIDDEN', { message: 'Tài khoản đang bị khoá do vi phạm quy tắc cộng đồng.', code: 'BANNED' });
        }
      } } },
    },
  });
  return auth;
}

export const getAuth = () => auth;

async function sessionOf(req) {
  const data = await auth.api.getSession({ headers: fromNodeHeaders(req.headers) }).catch(() => null);
  return data?.user?.email ? data : null;
}

/** Bắt buộc đăng nhập. Danh tính = req.email (từ phiên, không bao giờ từ client). */
export async function requireUser(req, res, next) {
  const data = await sessionOf(req);
  if (!data) return res.status(401).json({ code: 'LOGIN_REQUIRED', error: 'Đăng nhập để tiếp tục.' });
  req.email = data.user.email.toLowerCase();
  req.user = data.user;
  return next();
}

/** Đăng nhập nếu có — route công khai vẫn chạy cho khách. */
export async function optionalUser(req, _res, next) {
  const data = await sessionOf(req);
  if (data) { req.email = data.user.email.toLowerCase(); req.user = data.user; }
  return next();
}

export async function requireAdmin(req, res, next) {
  const data = await sessionOf(req);
  const email = data?.user?.email?.toLowerCase();
  if (!email) return res.status(401).json({ code: 'LOGIN_REQUIRED', error: 'Đăng nhập để tiếp tục.' });
  if (!ADMIN_EMAILS.has(email)) return res.status(403).json({ code: 'NOT_ADMIN', error: 'Tài khoản này không phải quản trị viên.' });
  req.email = email;
  req.admin = email;
  return next();
}
