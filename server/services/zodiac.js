// 12 mascot cung hoàng đạo cho gói education-hugo-zodiac. Gói KHÔNG chứa hình: mỗi lần trang của đối tác
// mở, gói xin hình ở đây bằng key → admin thu hồi key là lượt tải sau mất hình ngay, kể cả bản đã cài.
// Mỗi bản trả về đóng dấu riêng theo key (ghi chú + metadata + thuộc tính + toạ độ vi chỉnh) để lần ra nguồn rò rỉ.
import fs from 'fs';
import crypto from 'crypto';

export const ZODIAC_IDS = ['aries', 'taurus', 'geminus', 'cancer', 'leo', 'virgo', 'libra', 'scorpius', 'sagittarius', 'capricornus', 'aquarius', 'pisces'];
const dir = new URL('../../public/edu/zodiac/', import.meta.url);
const SRC = Object.fromEntries(ZODIAC_IDS.map((id) => [id, fs.readFileSync(new URL(`${id}.svg`, dir), 'utf8')
  .replace(/<!--[\s\S]*?-->/g, '').replace(/>\s+</g, '><').trim()]));

/** Mã dấu 12 ký tự hex, cố định theo key (admin tra ngược bằng `fingerprintOf(doc)`). */
export const fingerprintOf = (doc) => crypto.createHash('sha256').update(`zodiac:${doc._id}`).digest('hex').slice(0, 12);

/** SVG đã đóng dấu cho một key, hoặc null nếu id sai. */
export function stampedZodiac(id, doc) {
  const src = SRC[id];
  if (!src) return null;
  const fp = fingerprintOf(doc);
  const notice = `<!-- © 2026 Hugo Wishpax Le (Hugo Studio). Bảo lưu mọi quyền. Cấp phép riêng cho key …${doc.last4} (mã ${fp}), hết hạn ${new Date(doc.expiresAt).toISOString().slice(0, 10)}. Sao chép, sửa hoặc dùng ngoài tên miền đã đăng ký là vi phạm bản quyền. -->`;
  const meta = `<metadata>education-hugo-zodiac;lic=${fp};owner=Hugo Studio</metadata>`;
  // Dấu ẩn: dịch toàn hình một lượng nhỏ hơn 1/1000 điểm ảnh, khác nhau theo key — không thấy được, gỡ ghi chú vẫn còn.
  const n = parseInt(fp.slice(0, 6), 16);
  const shift = `translate(${(n % 997) / 1e6} ${((n >> 10) % 991) / 1e6})`;
  return src
    .replace(/^<svg([^>]*)>/, `<svg$1 data-lic="${fp}">${notice}${meta}<g transform="${shift}">`)
    .replace(/<\/svg>$/, '</g></svg>');
}
