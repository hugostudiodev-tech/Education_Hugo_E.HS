/**
 * Sau build: dựng HTML tĩnh cho trang công khai (crawler không chạy JS, thẻ chia
 * sẻ Zalo/Facebook chỉ đọc HTML). Chữ lấy từ src/education/eduCopy.js và
 * packages/courses/catalog.js — cùng nguồn với trang thật. React thay #root khi chạy.
 * Ra: dist/seo-{vi,en,zh}.html, dist/seo-course-<id>.html, sitemap.xml, robots.txt
 * (middleware.js đổi "/", "/en", "/zh", "/courses/<id>" sang các file seo-*).
 */
import fs from "node:fs";
import path from "node:path";
import { EDU_COPY, EDU_LANGS } from "../src/education/eduCopy.js";
import { CATALOG } from "../packages/courses/catalog.js";
import { STAGES as CODER_STAGES } from "../packages/courses/coding/stages.js";
import { EDU_ORIGIN } from "../packages/shared/eduSite.js";

const DIST = path.resolve(import.meta.dirname, "../dist");
const ORIGIN = "https://www.hugowishpax.studio";
const OG_LOCALE = { vi: "vi_VN", en: "en_US", zh: "zh_CN" };
const sourceTemplate = fs.readFileSync(path.join(DIST, "index.html"), "utf8");
const escAttr = (v) => String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
function applyOgImage(html, img) {
  for (const [attr, name, value] of [
    ["property", "og:image", img.url],
    ["property", "og:image:secure_url", img.url],
    ["property", "og:image:type", img.type],
    ["name", "twitter:image", img.url],
  ]) {
    html = html.replace(new RegExp(`(<meta ${attr}="${name}" content=")[^"]*(" />)`), `$1${value}$2`);
  }
  for (const dim of ["width", "height"]) {
    const re = new RegExp(`(<meta property="og:image:${dim}" content=")[^"]*(" />)`);
    html = img[dim] ? html.replace(re, `$1${img[dim]}$2`) : html.replace(new RegExp(`\\s*${re.source}`), "");
  }
  return html;
}
  const eduUrl = (code) => `${EDU_ORIGIN}${code === "vi" ? "/" : `/${code}`}`;
  const image = { url: `${EDU_ORIGIN}/og/education.jpg`, type: "image/jpeg", width: 1200, height: 630 };
  const hreflang = [
    ...EDU_LANGS.map(({ code }) => `<link rel="alternate" hreflang="${code}" href="${eduUrl(code)}" />`),
    `<link rel="alternate" hreflang="x-default" href="${eduUrl("vi")}" />`,
  ].join("\n    ");
  for (const { code } of EDU_LANGS) {
    const copy = EDU_COPY[code];
    const { seo } = copy;
    const url = eduUrl(code);
    const stages = CODER_STAGES.map((stage) => ({ ...stage, ...(code === "vi" ? {} : { ...stage.intro, ...copy.curriculum.stages[stage.id] }), learn: code === "vi" ? stage.intro.learn : copy.curriculum.stages[stage.id].learn, title: code === "vi" ? stage.title.replace(/^CODE \d+ · /, "") : copy.curriculum.stages[stage.id].title }));
    let html = sourceTemplate
      .replace(/<html lang="[^"]*"/, `<html lang="${code}"`)
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escAttr(seo.title)}</title>`)
      .replace(/<meta\s+name="description"\s+content="[\s\S]*?"\s*\/>/, `<meta name="description" content="${escAttr(seo.description)}" />`)
      .replace(/<meta\s+name="keywords"\s+content="[\s\S]*?"\s*\/>/, `<meta name="keywords" content="${escAttr(seo.keywords)}" />`)
      .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />\n    ${hreflang}`)
      .replace('href="/favicon/favicon.svg"', 'href="/edu/buddy-learn.svg"')
      .replace('href="/favicon/apple-touch-icon.png"', 'href="/edu/apple-touch-icon.png"')
      .replace('href="/manifest.webmanifest"', 'href="/edu.webmanifest"')
      .replace(/<meta name="theme-color" content="#ffffff"/, '<meta name="theme-color" content="#29cdff"')
      // Khối JSON-LD của Hugo Studio (danh tính www) không thuộc trang này.
      .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
    for (const [attr, name, value] of [
      ["property", "og:title", seo.title], ["property", "og:description", seo.description],
      ["property", "og:url", url], ["property", "og:site_name", "Education Hugo"],
      ["property", "og:locale", OG_LOCALE[code]], ["property", "og:image:alt", seo.imageAlt],
      ["name", "twitter:title", seo.title], ["name", "twitter:description", seo.description],
      ["name", "twitter:image:alt", seo.imageAlt],
    ]) {
      html = html.replace(new RegExp(`<meta ${attr}="${name}" content="[\\s\\S]*?" />`), `<meta ${attr}="${name}" content="${escAttr(value)}" />`);
    }
    html = applyOgImage(html, image);
    const provider = { "@type": "Organization", name: "Hugo Studio", url: ORIGIN, nonprofitStatus: "Nonprofit" };
    const schema = [
      { "@context": "https://schema.org", "@type": "WebSite", name: "Education Hugo", url: eduUrl("vi"), inLanguage: EDU_LANGS.map((l) => l.code), publisher: provider },
      {
        "@context": "https://schema.org", "@type": "Course", "@id": `${url}#course`,
        name: seo.h1, description: seo.description, url, image: image.url, inLanguage: "vi",
        isAccessibleForFree: true, educationalLevel: "Beginner", provider,
        teaches: stages.flatMap((stage) => stage.learn),
        offers: { "@type": "Offer", category: "Free", price: 0, priceCurrency: "VND" },
        hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: "PT20H" },
        syllabusSections: stages.map((stage) => ({ "@type": "Syllabus", name: stage.title, description: stage.learn.join("; ") })),
      },
      // Trang chủ liệt kê mọi khoá (mỗi khoá có trang riêng /courses/:id).
      { "@context": "https://schema.org", "@type": "ItemList", name: "Education Hugo courses", itemListElement: CATALOG.map((c, i) => ({ "@type": "ListItem", position: i + 1, url: `${EDU_ORIGIN}/courses/${c.id}`, name: c.title[code] || c.title.vi })) },
      { "@context": "https://schema.org", "@type": "FAQPage", mainEntity: seo.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })) },
    ];
    html = html.replace("</head>", `${schema.map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join("\n")}\n</head>`);
    const body =
      `<div id="seo-static" style="max-width:52rem;margin:0 auto;padding:clamp(1.5rem,6vw,4rem) 1.25rem;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',system-ui,sans-serif;line-height:1.6">` +
      `<h1>${escAttr(seo.h1)}</h1><p>${escAttr(seo.lead)}</p>` +
      `<ul>${copy.landing.ways.map((way) => `<li><b>${escAttr(way.title)}</b> — ${escAttr(way.body)}</li>`).join("")}</ul>` +
      `<h2>${escAttr(seo.learnTitle)}</h2>` +
      stages.map((stage) => `<h3>${escAttr(stage.code)} · ${escAttr(stage.title)}</h3><ul>${stage.learn.map((item) => `<li>${escAttr(item)}</li>`).join("")}</ul>`).join("") +
      `<h2>${escAttr(seo.faqTitle)}</h2>` +
      seo.faq.map(([q, a]) => `<h3>${escAttr(q)}</h3><p>${escAttr(a)}</p>`).join("") +
      `<h2>${escAttr(copy.courses.title)}</h2><ul>${CATALOG.map((c) => `<li><a href="${EDU_ORIGIN}/courses/${c.id}">${escAttr(c.title[code] || c.title.vi)}</a> — ${escAttr(c.tagline[code] || c.tagline.vi)}</li>`).join("")}</ul>` +
      `<p><a href="${EDU_ORIGIN}/learn">${escAttr(copy.landing.startLearning)}</a> · ` +
      EDU_LANGS.map((l) => `<a href="${eduUrl(l.code)}" hreflang="${l.code}">${l.label}</a>`).join(" · ") +
      ` · <a href="${ORIGIN}/">Hugo Studio</a></p></div>`;
    html = html.replace(/<div id="root">[\s\S]*?<!-- Main Module script entry point -->/, `<div id="root">${body}</div>\n\n    <!-- Main Module script entry point -->`);
    fs.writeFileSync(path.join(DIST, code === "vi" ? "seo-vi.html" : `seo-${code}.html`), html);
  }
  // Trang giới thiệu từng khoá: /courses/<id> → edu-course-<id>.html (middleware.js đổi đường dẫn).
  for (const course of CATALOG) {
    const copy = EDU_COPY.vi;
    const url = `${EDU_ORIGIN}/courses/${course.id}`;
    const title = copy.courses.pageTitle.replace("{name}", course.title.vi);
    const description = course.tagline.vi;
    const image = { url: `${EDU_ORIGIN}/og/education.jpg`, type: "image/jpeg", width: 1200, height: 630 };
    let html = sourceTemplate
      .replace(/<html lang="[^"]*"/, '<html lang="vi"')
      .replace(/<title>[\s\S]*?<\/title>/, `<title>${escAttr(title)}</title>`)
      .replace(/<meta\s+name="description"\s+content="[\s\S]*?"\s*\/>/, `<meta name="description" content="${escAttr(description)}" />`)
      .replace(/<meta\s+name="keywords"\s+content="[\s\S]*?"\s*\/>/, `<meta name="keywords" content="${escAttr(course.keywords)}" />`)
      .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${url}" />`)
      .replace('href="/favicon/favicon.svg"', 'href="/edu/buddy-learn.svg"')
      .replace('href="/favicon/apple-touch-icon.png"', 'href="/edu/apple-touch-icon.png"')
      .replace('href="/manifest.webmanifest"', 'href="/edu.webmanifest"')
      .replace(/<meta name="theme-color" content="#ffffff"/, '<meta name="theme-color" content="#29cdff"')
      .replace(/\s*<script type="application\/ld\+json">[\s\S]*?<\/script>/g, "");
    for (const [attr, name, value] of [
      ["property", "og:title", title], ["property", "og:description", description], ["property", "og:url", url],
      ["property", "og:site_name", "Education Hugo"], ["property", "og:locale", OG_LOCALE.vi], ["property", "og:image:alt", course.title.vi],
      ["name", "twitter:title", title], ["name", "twitter:description", description], ["name", "twitter:image:alt", course.title.vi],
    ]) {
      html = html.replace(new RegExp(`<meta ${attr}="${name}" content="[\\s\\S]*?" />`), `<meta ${attr}="${name}" content="${escAttr(value)}" />`);
    }
    html = applyOgImage(html, image);
    const provider = { "@type": "Organization", name: "Hugo Studio", url: ORIGIN, nonprofitStatus: "Nonprofit" };
    const schema = [
      {
        "@context": "https://schema.org", "@type": "Course", "@id": `${url}#course`, name: course.title.vi, description, url, image: image.url,
        inLanguage: "vi", isAccessibleForFree: true, educationalLevel: "Beginner", provider, keywords: course.keywords,
        numberOfCredits: course.outline.length, timeRequired: `PT${course.hours}H`,
        teaches: course.stages.flatMap((s) => s.intro?.learn || []),
        offers: { "@type": "Offer", category: "Free", price: 0, priceCurrency: "VND", availability: "https://schema.org/InStock" },
        hasCourseInstance: { "@type": "CourseInstance", courseMode: "Online", courseWorkload: `PT${course.hours}H` },
        syllabusSections: course.stages.map((s) => ({ "@type": "Syllabus", name: s.title, description: (s.intro?.learn || []).join("; "), timeRequired: `PT${s.to - s.from}H` })),
      },
      { "@context": "https://schema.org", "@type": "BreadcrumbList", itemListElement: [
        { "@type": "ListItem", position: 1, name: "Education Hugo", item: `${EDU_ORIGIN}/` },
        { "@type": "ListItem", position: 2, name: copy.courses.title, item: `${EDU_ORIGIN}/learn` },
        { "@type": "ListItem", position: 3, name: course.title.vi, item: url },
      ] },
    ];
    html = html.replace("</head>", `${schema.map((item) => `<script type="application/ld+json">${JSON.stringify(item)}</script>`).join("\n")}\n</head>`);
    const body =
      `<div id="seo-static" style="max-width:52rem;margin:0 auto;padding:clamp(1.5rem,6vw,4rem) 1.25rem;font-family:-apple-system,BlinkMacSystemFont,'Helvetica Neue',system-ui,sans-serif;line-height:1.6">` +
      `<p><a href="${EDU_ORIGIN}/">Education Hugo</a> › ${escAttr(course.title.vi)}</p>` +
      `<h1>${escAttr(course.title.vi)}</h1><p>${escAttr(description)}</p>` +
      `<p>${course.outline.length} step · ${course.stages.length} chặng · ≈${course.hours} giờ · miễn phí</p>` +
      course.stages.map((s) => `<h2>${escAttr(s.title)}</h2>` + (s.intro?.tagline ? `<p>${escAttr(s.intro.tagline)}</p>` : "") +
        `<ul>${(s.intro?.learn || []).map((x) => `<li>${escAttr(x)}</li>`).join("")}</ul>` +
        `<ol start="${s.from + 1}">${course.outline.slice(s.from, s.to).map(([, t]) => `<li>${escAttr(t)}</li>`).join("")}</ol>`).join("") +
      `<p><a href="${EDU_ORIGIN}/learn">${escAttr(copy.courses.start)}</a> · ` +
      CATALOG.filter((c) => c.id !== course.id).map((c) => `<a href="${EDU_ORIGIN}/courses/${c.id}">${escAttr(c.title.vi)}</a>`).join(" · ") + `</p></div>`;
    html = html.replace(/<div id="root">[\s\S]*?<!-- Main Module script entry point -->/, `<div id="root">${body}</div>\n\n    <!-- Main Module script entry point -->`);
    fs.writeFileSync(path.join(DIST, `seo-course-${course.id}.html`), html);
  }

  fs.writeFileSync(path.join(DIST, "sitemap.xml"),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n` +
    EDU_LANGS.map(({ code }) =>
      `  <url>\n    <loc>${eduUrl(code)}</loc>\n` +
      EDU_LANGS.map((l) => `    <xhtml:link rel="alternate" hreflang="${l.code}" href="${eduUrl(l.code)}"/>\n`).join("") +
      `    <xhtml:link rel="alternate" hreflang="x-default" href="${eduUrl("vi")}"/>\n    <changefreq>weekly</changefreq>\n    <priority>${code === "vi" ? "1.0" : "0.9"}</priority>\n  </url>\n`).join("") +
    CATALOG.map((c) => `  <url>\n    <loc>${EDU_ORIGIN}/courses/${c.id}</loc>\n    <changefreq>weekly</changefreq>\n    <priority>0.9</priority>\n  </url>\n`).join("") +
    ["terms", "privacy", "guidelines"].map((p) => `  <url>\n    <loc>${EDU_ORIGIN}/${p}</loc>\n    <changefreq>yearly</changefreq>\n    <priority>0.3</priority>\n  </url>\n`).join("") +
    `</urlset>\n`);
  fs.writeFileSync(path.join(DIST, "robots.txt"),
    `User-agent: *\nAllow: /\nDisallow: /api\nDisallow: /progress\nDisallow: /store\nDisallow: /settings\nDisallow: /profile\n\nSitemap: ${EDU_ORIGIN}/sitemap.xml\n`);
