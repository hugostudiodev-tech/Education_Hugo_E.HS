// Vẽ ảnh minh hoạ cho thư (nhân vật buddy CC0 của DiceBear). Chạy: node scripts/mail-art/draw.mjs "$PWD" — cần Google Chrome.
import { chromium } from "playwright-core";
import fs from "fs";
const root = process.argv[2];
const b64 = (n) => "data:image/svg+xml;base64," + fs.readFileSync(`${root}/public/edu/${n}.svg`).toString("base64");
const confetti = (n, w, h, seed = 7) => {
  let r = seed; const rnd = () => ((r = (r * 9301 + 49297) % 233280) / 233280);
  const cols = ["#1cb0f6", "#ff86d0", "#ffc800", "#58cc02", "#ce82ff", "#ff9600"];
  return Array.from({ length: n }, (_, i) => `<rect x="${rnd() * w}" y="${rnd() * h}" width="${10 + rnd() * 14}" height="${8 + rnd() * 10}" rx="2" fill="${cols[i % cols.length]}" transform="rotate(${rnd() * 90} ${rnd() * w} ${rnd() * h})" opacity=".9"/>`).join("");
};
const font = `font-family="'Arial Rounded MT Bold','Nunito',Arial,sans-serif" font-weight="900"`;
// 1. Hero: chữ bóng bay "CODE" + buddy treo dưới, đội mũ tiệc, pháo giấy.
const balloon = (ch, x, c) => `<g><line x1="${x + 42}" y1="235" x2="300" y2="352" stroke="#9fb4c7" stroke-width="2"/>
  <text x="${x}" y="230" ${font} font-size="190" fill="${c}" stroke="#2b8a3e" stroke-width="6" paint-order="stroke">${ch}</text>
  <ellipse cx="${x + 34}" cy="110" rx="14" ry="26" fill="#fff" opacity=".45" transform="rotate(25 ${x + 34} 110)"/></g>`;
const hero = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="520" viewBox="0 0 600 520"><rect width="600" height="520" fill="#fff"/>
  ${confetti(34, 600, 520)}
  ${balloon("C", 30, "#7ee03c")}${balloon("O", 165, "#58cc02")}${balloon("D", 300, "#7ee03c")}${balloon("E", 430, "#58cc02")}
  <image href="${b64("buddy-done")}" x="200" y="300" width="200" height="200"/>
  <path d="M278 368 L300 318 L322 368 Z" fill="#ff86d0" stroke="#d63384" stroke-width="3"/><circle cx="300" cy="316" r="9" fill="#ffc800"/>
</svg>`;
// 2. Buddy mùa lạnh: khăn, mũ len, cầm điện thoại + ly cà phê, tuyết.
const flakes = Array.from({ length: 14 }, (_, i) => `<text x="${(i * 97) % 580 + 10}" y="${(i * 61) % 300 + 40}" font-size="${22 + (i % 3) * 8}" fill="#c5e8fb">✻</text>`).join("");
const cozy = `<svg xmlns="http://www.w3.org/2000/svg" width="600" height="420" viewBox="0 0 600 420"><rect width="600" height="420" fill="#fff"/>
  ${flakes}<ellipse cx="300" cy="385" rx="250" ry="28" fill="#e3f4fd"/>
  <image href="${b64("buddy-learn")}" x="170" y="90" width="260" height="260"/>
  <path d="M240 196 Q300 120 360 196 L362 212 L238 212 Z" fill="#ce82ff" stroke="#9c4fd6" stroke-width="4"/><rect x="236" y="198" width="128" height="18" rx="9" fill="#a560e8"/><circle cx="300" cy="152" r="15" fill="#a560e8"/>
  <path d="M200 268 Q300 300 400 268 L392 296 Q300 324 208 296 Z" fill="#ff86d0"/><rect x="340" y="290" width="34" height="70" rx="8" fill="#ff86d0"/>
  <g transform="rotate(-10 120 230)"><rect x="80" y="160" width="86" height="148" rx="14" fill="#3c3c3c"/><rect x="88" y="172" width="70" height="120" rx="6" fill="#ddf4ff"/><rect x="96" y="186" width="54" height="10" rx="5" fill="#1cb0f6"/><rect x="96" y="204" width="40" height="8" rx="4" fill="#58cc02"/><rect x="96" y="220" width="48" height="8" rx="4" fill="#afafaf"/><rect x="96" y="262" width="54" height="20" rx="8" fill="#58cc02"/></g>
  <g><path d="M440 220 L520 220 L510 330 L450 330 Z" fill="#ff9600"/><rect x="434" y="206" width="92" height="18" rx="6" fill="#fff" stroke="#d9822b" stroke-width="3"/><rect x="446" y="258" width="68" height="30" fill="#fff3bf"/><path d="M470 196 q-10 -20 0 -40 M490 196 q10 -20 0 -40" stroke="#c4c4c4" stroke-width="5" fill="none" stroke-linecap="round"/></g>
</svg>`;
// 3. Icon nhỏ: điện thoại + đồng hồ = "chỉ vài phút".
const quick = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="220" viewBox="0 0 320 220"><rect width="320" height="220" fill="#fff"/>
  <g transform="rotate(-12 100 110)"><rect x="50" y="30" width="100" height="170" rx="16" fill="#3c3c3c"/><rect x="60" y="44" width="80" height="140" rx="8" fill="#ddf4ff"/><rect x="70" y="60" width="60" height="12" rx="6" fill="#1cb0f6"/><rect x="70" y="82" width="44" height="9" rx="4" fill="#58cc02"/><rect x="70" y="100" width="54" height="9" rx="4" fill="#afafaf"/><rect x="70" y="150" width="60" height="22" rx="8" fill="#58cc02"/></g>
  <rect x="196" y="20" width="44" height="40" rx="8" fill="#a0522d"/><rect x="196" y="160" width="44" height="40" rx="8" fill="#a0522d"/>
  <circle cx="218" cy="110" r="66" fill="#ffc800" stroke="#e5a400" stroke-width="8"/><circle cx="218" cy="110" r="50" fill="#fff"/>
  <path d="M218 110 L218 76 M218 110 L244 122" stroke="#3c3c3c" stroke-width="7" stroke-linecap="round"/><circle cx="218" cy="110" r="6" fill="#ff4b4b"/>
  <text x="270" y="40" font-size="26" fill="#ffc800">✦</text><text x="160" y="30" font-size="18" fill="#ffc800">✦</text>
</svg>`;
const browser = await chromium.launch({ executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" });
const page = await browser.newPage({ deviceScaleFactor: 2 });
for (const [name, svg, w, h] of [["hero-code", hero, 600, 520], ["buddy-cozy", cozy, 600, 420], ["quick-minutes", quick, 320, 220]]) {
  await page.setViewportSize({ width: 800, height: 800 });
  await page.setContent(`<body style="margin:0">${svg}</body>`);
  await page.locator("svg").first().screenshot({ path: `${root}/public/edu/mail/${name}.png` });
}
await browser.close();
