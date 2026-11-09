/*! education-hugo-zodiac · © 2026 Hugo Wishpax Le (Hugo Studio) · Bảo lưu mọi quyền · Chỉ dùng với key đối tác còn hiệu lực (LICENSE.md) */
// Gói không chứa hình. Mỗi lần trang mở, hình được tải từ máy chủ Education Hugo bằng key của bạn
// (kiểm key + tên miền mỗi lượt). Key hết hạn hoặc bị thu hồi thì hình không tải được nữa.
const API = "https://education.hugowishpax.studio/api/partner/zodiac/";

/** 12 cung: id, tên Latin, ký hiệu, tên tiếng Việt, ngày bắt đầu dạng MMDD. */
export const ZODIAC = [
  { id: "aries", latin: "Aries", symbol: "♈", vi: "Bạch Dương", start: 321 },
  { id: "taurus", latin: "Taurus", symbol: "♉", vi: "Kim Ngưu", start: 420 },
  { id: "geminus", latin: "Geminus", symbol: "♊", vi: "Song Tử", start: 521 },
  { id: "cancer", latin: "Cancer", symbol: "♋", vi: "Cự Giải", start: 621 },
  { id: "leo", latin: "Leo", symbol: "♌", vi: "Sư Tử", start: 723 },
  { id: "virgo", latin: "Virgo", symbol: "♍", vi: "Xử Nữ", start: 823 },
  { id: "libra", latin: "Libra", symbol: "♎", vi: "Thiên Bình", start: 923 },
  { id: "scorpius", latin: "Scorpius", symbol: "♏", vi: "Bọ Cạp", start: 1023 },
  { id: "sagittarius", latin: "Sagittarius", symbol: "♐", vi: "Nhân Mã", start: 1122 },
  { id: "capricornus", latin: "Capricornus", symbol: "♑", vi: "Ma Kết", start: 1222 },
  { id: "aquarius", latin: "Aquarius", symbol: "♒", vi: "Bảo Bình", start: 120 },
  { id: "pisces", latin: "Pisces", symbol: "♓", vi: "Song Ngư", start: 219 },
];

// ponytail: đệm trong trang (một lượt mở) — tải lại trang là hỏi lại máy chủ, nên thu hồi có hiệu lực ngay lượt sau.
const memo = new Map();

/** Promise<string> SVG của một cung. Lỗi (key sai/thu hồi/sai tên miền) → reject với err.status. */
export function zodiacSvg(id, apiKey) {
  const k = `${apiKey}:${id}`;
  if (!memo.has(k)) {
    memo.set(k, fetch(API + encodeURIComponent(id), { headers: { "X-Edu-Partner-Key": apiKey || "" }, cache: "no-store" })
      .then(async (r) => {
        if (!r.ok) throw Object.assign(new Error(r.status === 401 ? "Key đối tác không hợp lệ, đã hết hạn hoặc bị thu hồi." : `Không tải được mascot (${r.status}).`), { status: r.status });
        return r.text();
      })
      .catch((e) => { memo.delete(k); throw e; }));
  }
  return memo.get(k);
}

/** Promise<string> data: URI để gán vào <img src>. Chuyển động CSS trong SVG vẫn chạy. */
export const zodiacUrl = (id, apiKey) => zodiacSvg(id, apiKey).then((svg) => "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg));

/** Cung theo ngày sinh: Date hoặc chuỗi "YYYY-MM-DD" (đọc theo lịch, không lệch múi giờ). */
export function zodiacOf(date) {
  const [m, d] = typeof date === "string" ? [+date.slice(5, 7), +date.slice(8, 10)] : [date.getMonth() + 1, date.getDate()];
  const md = m * 100 + d;
  let id = "capricornus";
  for (const s of [...ZODIAC].sort((a, b) => a.start - b.start)) if (md >= s.start) id = s.id;
  return id;
}
