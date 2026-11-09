// Đặt gói thư viện vào dist/_sdk/<SDK_SECRET>.tgz (React) và <SDK_SECRET>-zodiac.tgz (mascot). Đường dẫn bí mật chỉ middleware
// biết (đọc cùng biến môi trường); người ngoài tải qua /sdk/<key>/… và phải có key hợp lệ.
import fs from "node:fs";
import path from "node:path";

const root = path.resolve(import.meta.dirname, "..");
const secret = process.env.SDK_SECRET;
if (!secret) { console.log("SDK_SECRET chưa đặt — bỏ qua phát hành gói (dev)."); process.exit(0); }
if (!/^[A-Za-z0-9]{24,}$/.test(secret)) throw new Error("SDK_SECRET phải là chuỗi chữ số ≥ 24 ký tự.");
fs.mkdirSync(path.join(root, "dist/_sdk"), { recursive: true });
// [thư mục gói, hậu tố file bí mật] — middleware.js đọc đúng hậu tố này.
for (const [dir, suffix] of [["sdk", ""], ["zodiac", "-zodiac"]]) {
  const { name, version } = JSON.parse(fs.readFileSync(path.join(root, dir, "package.json"), "utf8"));
  fs.copyFileSync(path.join(root, `dist-sdk/${name}-${version}.tgz`), path.join(root, `dist/_sdk/${secret}${suffix}.tgz`));
  console.log(`Gói ${name} ${version} đã đặt vào dist/_sdk.`);
}
