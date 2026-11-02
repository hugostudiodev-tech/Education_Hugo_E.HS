import rateLimit, { ipKeyGenerator } from 'express-rate-limit';

// Đếm theo người học khi đã đăng nhập (sau proxy nhiều người chung IP), còn lại theo IP.
const key = (req) => req.email || ipKeyGenerator(req.ip);
// ponytail: đếm trong RAM — một process trên Render free là đủ.
export const limit = (max, windowMs = 60_000) => rateLimit({ windowMs, max, keyGenerator: key, standardHeaders: true, legacyHeaders: false, message: { code: 'RATE_LIMITED', error: 'Bạn thao tác nhanh quá, thử lại sau ít phút.' } });

/** Bọc handler async: lỗi có .status là lỗi nghiệp vụ (trả nguyên câu), còn lại 500 không lộ nội bộ. */
export const handle = (fn) => async (req, res) => {
  try {
    const out = await fn(req, res);
    if (out !== undefined && !res.headersSent) res.json(out);
  } catch (error) {
    if (error.status) return res.status(error.status).json({ code: error.code, error: error.message });
    console.error(`[${req.method} ${req.path}]`, error);
    return res.status(500).json({ code: 'SERVER_ERROR', error: 'Có lỗi phía máy chủ, thử lại sau.' });
  }
};

export const fail = (status, code, message) => Object.assign(new Error(message || code), { status, code });
