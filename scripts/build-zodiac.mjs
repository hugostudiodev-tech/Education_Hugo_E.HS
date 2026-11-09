// Kiểm gói education-hugo-zodiac trước khi npm pack: gói không được chứa hình, máy chủ phải có đủ 12 hình
// và đóng dấu theo key. Chạy: node scripts/build-zodiac.mjs (npm run build:sdk tự gọi).
import fs from "node:fs";
import assert from "node:assert/strict";

const src = fs.readFileSync(new URL("../zodiac/index.js", import.meta.url), "utf8");
assert.ok(!/<svg|<path/.test(src), "zodiac/index.js không được chứa hình SVG");
const lib = await import("../zodiac/index.js");
const { ZODIAC_IDS, stampedZodiac, fingerprintOf } = await import("../server/services/zodiac.js");
assert.deepEqual(lib.ZODIAC.map((z) => z.id).sort(), [...ZODIAC_IDS].sort());
const a = { _id: "a1", last4: "AAAA", expiresAt: "2027-01-01" }, b = { _id: "b2", last4: "BBBB", expiresAt: "2027-01-01" };
for (const id of ZODIAC_IDS) {
  const s = stampedZodiac(id, a);
  assert.ok(s.startsWith("<svg") && s.endsWith("</svg>") && s.includes(`data-lic="${fingerprintOf(a)}"`) && s.includes("Hugo Studio"), id);
  assert.notEqual(s.replace(/<!--[\s\S]*?-->|<metadata>.*?<\/metadata>| data-lic="\w+"/g, ""), stampedZodiac(id, b).replace(/<!--[\s\S]*?-->|<metadata>.*?<\/metadata>| data-lic="\w+"/g, ""), `${id}: dấu ẩn phải khác nhau theo key`);
}
assert.equal(stampedZodiac("../x", a), null);
assert.equal(lib.zodiacOf("2000-01-19"), "capricornus");
assert.equal(lib.zodiacOf("2000-01-20"), "aquarius");
assert.equal(lib.zodiacOf("2000-12-22"), "capricornus");
assert.equal(lib.zodiacOf(new Date(2000, 9, 1)), "libra");
console.log("education-hugo-zodiac: gói không chứa hình, 12 mascot đóng dấu theo key — OK.");
