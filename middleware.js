/* global process */
// Vercel Routing Middleware.
// 1. Vercel trả file tĩnh TRƯỚC rewrite, nên "/" luôn ra index.html (bản SPA chung).
//    Đổi các đường dẫn công khai sang bản dựng sẵn cho SEO (scripts/generate-seo.mjs).
// 2. Gói thư viện đối tác: /sdk/<key>/education-hugo-react.tgz → kiểm key ở API Hugo
//    Studio → trả gói ở đường dẫn bí mật dist/_sdk/<SDK_SECRET>.tgz (scripts/publish-sdk.mjs).
export const config = { matcher: ["/", "/en", "/zh", "/courses/:id", "/sdk/:path*", "/_sdk/:path*"] };

const API = "https://education.hugowishpax.studio/api";
const deny = (status, message) => new Response(message, { status, headers: { "content-type": "text/plain; charset=utf-8", "cache-control": "no-store" } });
const rewrite = (path, url, extra = {}) => new Response(null, { headers: { "x-middleware-rewrite": new URL(path, url).href, ...extra } });

export default async function middleware(request) {
  const url = new URL(request.url);
  const p = url.pathname;
  if (p.startsWith("/_sdk/")) return deny(404, "Not found");
  if (p.startsWith("/sdk/")) {
    const key = p.split("/")[2] || "";
    if (!process.env.SDK_SECRET) return deny(503, "Gói chưa phát hành.");
    const res = await fetch(`${API}/partner/verify`, { method: "POST", headers: { "x-edu-partner-key": key, "content-type": "application/json" }, body: "{}" }).catch(() => null);
    if (!res?.ok) return deny(res?.status === 401 ? 401 : 503, "Key đối tác không hợp lệ hoặc đã hết hạn. Liên hệ Hugo Studio để được cấp key.");
    return rewrite(`/_sdk/${process.env.SDK_SECRET}.tgz`, url, { "cache-control": "no-store" });
  }
  const file = p === "/" ? "/seo-vi.html" : p === "/en" || p === "/zh" ? `/seo-${p.slice(1)}.html` : `/seo-course-${p.split("/")[2]}.html`;
  return rewrite(file, url);
}
