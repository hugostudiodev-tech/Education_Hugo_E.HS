// Vercel Routing Middleware: Vercel trả file tĩnh TRƯỚC rewrite, nên "/" luôn ra
// index.html (bản SPA chung). Đổi các đường dẫn công khai sang bản dựng sẵn cho
// SEO do scripts/generate-seo.mjs viết ra (seo-*.html, robots, sitemap).
export const config = { matcher: ["/", "/en", "/zh", "/courses/:id"] };

export default function middleware(request) {
  const url = new URL(request.url);
  const p = url.pathname;
  const file = p === "/" ? "/seo-vi.html" : p === "/en" || p === "/zh" ? `/seo-${p.slice(1)}.html` : `/seo-course-${p.split("/")[2]}.html`;
  return new Response(null, { headers: { "x-middleware-rewrite": new URL(file, url).href } });
}
