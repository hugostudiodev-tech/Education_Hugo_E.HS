// Dựng gói education-hugo-zodiac từ public/edu/zodiac/*.svg (nguồn duy nhất của 12 mascot).
// Ghi zodiac/svg/*.svg + zodiac/index.js (đều là file sinh ra, không commit). Không phụ thuộc gì.
// Chạy: node scripts/build-zodiac.mjs — npm run build:sdk tự gọi rồi npm pack.
import fs from "node:fs";
import path from "node:path";
import assert from "node:assert/strict";

const root = path.resolve(import.meta.dirname, "..");
const out = path.join(root, "zodiac");
const NOTICE = "<!-- © 2026 Hugo Wishpax Le (Hugo Studio). Bảo lưu mọi quyền. Chỉ dùng với key đối tác Education Hugo còn hiệu lực — xem LICENSE.md của gói education-hugo-zodiac. -->";

// [id = tên file, tên Latin, ký hiệu, tiếng Việt, ngày bắt đầu MMDD]
const SIGNS = [
  ["aries", "Aries", "♈", "Bạch Dương", 321], ["taurus", "Taurus", "♉", "Kim Ngưu", 420],
  ["geminus", "Geminus", "♊", "Song Tử", 521], ["cancer", "Cancer", "♋", "Cự Giải", 621],
  ["leo", "Leo", "♌", "Sư Tử", 723], ["virgo", "Virgo", "♍", "Xử Nữ", 823],
  ["libra", "Libra", "♎", "Thiên Bình", 923], ["scorpius", "Scorpius", "♏", "Bọ Cạp", 1023],
  ["sagittarius", "Sagittarius", "♐", "Nhân Mã", 1122], ["capricornus", "Capricornus", "♑", "Ma Kết", 1222],
  ["aquarius", "Aquarius", "♒", "Bảo Bình", 120], ["pisces", "Pisces", "♓", "Song Ngư", 219],
];

fs.rmSync(path.join(out, "svg"), { recursive: true, force: true });
fs.mkdirSync(path.join(out, "svg"));
const svgs = {};
for (const [id] of SIGNS) {
  const src = fs.readFileSync(path.join(root, "public/edu/zodiac", `${id}.svg`), "utf8");
  // Bỏ ghi chú nội bộ, gắn dòng bản quyền ngay sau thẻ <svg>, thu gọn khoảng trắng.
  const svg = src.replace(/<!--[\s\S]*?-->/g, "").replace(/>\s+</g, "><").replace(/(<svg[^>]*>)/, `$1${NOTICE}`).trim();
  fs.writeFileSync(path.join(out, "svg", `${id}.svg`), svg + "\n");
  svgs[id] = svg;
}

const meta = SIGNS.map(([id, latin, symbol, vi, start]) => ({ id, latin, symbol, vi, start }));
fs.writeFileSync(path.join(out, "index.js"), `/*! education-hugo-zodiac · © 2026 Hugo Wishpax Le (Hugo Studio) · Bảo lưu mọi quyền · Chỉ dùng với key đối tác còn hiệu lực (LICENSE.md) */
const SVG = ${JSON.stringify(svgs)};

/** 12 cung: id (tên file), tên Latin, ký hiệu, tên tiếng Việt, ngày bắt đầu dạng MMDD. */
export const ZODIAC = ${JSON.stringify(meta)};

/** Chuỗi SVG của một cung (null nếu id sai). Dùng cho innerHTML / dangerouslySetInnerHTML. */
export const zodiacSvg = (id) => SVG[id] ?? null;

/** data: URI để gán thẳng vào <img src>. Chuyển động CSS bên trong SVG vẫn chạy. */
export const zodiacUrl = (id) => (SVG[id] ? "data:image/svg+xml;charset=utf-8," + encodeURIComponent(SVG[id]) : null);

/** Cung theo ngày sinh: nhận Date hoặc chuỗi "YYYY-MM-DD" (đọc theo lịch, không lệch múi giờ). */
export function zodiacOf(date) {
  const [m, d] = typeof date === "string" ? [+date.slice(5, 7), +date.slice(8, 10)] : [date.getMonth() + 1, date.getDate()];
  const md = m * 100 + d;
  let id = "capricornus";
  for (const s of [...ZODIAC].sort((a, b) => a.start - b.start)) if (md >= s.start) id = s.id;
  return id;
}
`);

// Tự kiểm: đủ 12 hình, có dòng bản quyền, ranh giới ngày đúng.
const lib = await import(`${path.join(out, "index.js")}?t=${Date.now()}`);
assert.equal(lib.ZODIAC.length, 12);
for (const { id } of lib.ZODIAC) assert.ok(lib.zodiacSvg(id).includes("Hugo Studio"), id);
assert.equal(lib.zodiacOf("2000-01-19"), "capricornus");
assert.equal(lib.zodiacOf("2000-01-20"), "aquarius");
assert.equal(lib.zodiacOf("2000-05-21"), "geminus");
assert.equal(lib.zodiacOf("2000-12-21"), "sagittarius");
assert.equal(lib.zodiacOf("2000-12-22"), "capricornus");
assert.equal(lib.zodiacOf(new Date(2000, 9, 1)), "libra");
console.log(`education-hugo-zodiac: ${Object.keys(svgs).length} mascot, ${Math.round(fs.statSync(path.join(out, "index.js")).size / 1024)} KB.`);
