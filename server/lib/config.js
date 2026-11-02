export const isProd = process.env.NODE_ENV === 'production';
export const EDU_ORIGIN = process.env.EDU_ORIGIN || 'https://education.hugowishpax.studio';
// Origin được gọi API kèm cookie. Thư viện đối tác đi đường riêng (CORS không cookie, xem index.js).
export const ORIGINS = [EDU_ORIGIN, ...String(process.env.EXTRA_ORIGINS || '').split(',').map((o) => o.trim()).filter(Boolean)];
