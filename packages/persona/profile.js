// Thông tin hồ sơ riêng tư (KHÔNG công khai): ngày sinh + tỉnh/thành bắt buộc; sở thích + giới tính tuỳ chọn.
// Tối thiểu hoá (Luật BVDLCN 2025): chỉ tỉnh/thành, không lấy số nhà/đường.
export const PROVINCES = ['ha-noi', 'hue', 'lai-chau', 'dien-bien', 'son-la', 'lang-son', 'quang-ninh', 'thanh-hoa', 'nghe-an', 'ha-tinh', 'cao-bang', 'tuyen-quang', 'lao-cai', 'thai-nguyen', 'phu-tho', 'bac-ninh', 'hung-yen', 'hai-phong', 'ninh-binh', 'quang-tri', 'da-nang', 'quang-ngai', 'gia-lai', 'khanh-hoa', 'lam-dong', 'dak-lak', 'ho-chi-minh', 'dong-nai', 'tay-ninh', 'can-tho', 'vinh-long', 'dong-thap', 'ca-mau', 'an-giang', 'abroad'];
// 30 sở thích phổ biến tuổi 14+ (thẻ nhỏ, chọn tối đa MAX_HOBBIES).
export const HOBBIES = ['games', 'esports', 'anime', 'manga', 'kpop', 'music', 'singing', 'instrument', 'dance', 'football', 'basketball', 'badminton', 'gym', 'swimming', 'cycling', 'drawing', 'photo', 'video', 'design', 'reading', 'writing', 'movies', 'travel', 'cooking', 'coding', 'robotics', 'science', 'pets', 'chess', 'languages'];
export const MAX_HOBBIES = 8;
export const GENDERS = ['male', 'female', 'other', 'private', 'skip'];
export const MIN_AGE = 14;

export function ageOn(birthDate, today = new Date()) {
  const [y, m, d] = birthDate.split('-').map(Number);
  let age = today.getUTCFullYear() - y;
  if (today.getUTCMonth() + 1 < m || (today.getUTCMonth() + 1 === m && today.getUTCDate() < d)) age -= 1;
  return age;
}

/** Nhận một phần hồ sơ; trả các trường hợp lệ (để $set từng trường) hoặc mã lỗi. */
export function checkProfile(raw, today = new Date()) {
  if (!raw || typeof raw !== 'object') return { ok: false, code: 'PROFILE_BAD' };
  const value = {};
  if (raw.birthDate !== undefined) {
    const s = String(raw.birthDate);
    const date = new Date(`${s}T00:00:00Z`);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== s) return { ok: false, code: 'BIRTH_BAD' };
    const age = ageOn(s, today);
    if (age < MIN_AGE) return { ok: false, code: 'TOO_YOUNG' };
    if (age > 100) return { ok: false, code: 'BIRTH_BAD' };
    value.birthDate = s;
  }
  if (raw.province !== undefined) {
    if (!PROVINCES.includes(raw.province)) return { ok: false, code: 'PROVINCE_BAD' };
    value.province = raw.province;
  }
  if (raw.hobbies !== undefined) {
    if (!Array.isArray(raw.hobbies) || raw.hobbies.length > MAX_HOBBIES || raw.hobbies.some((h) => !HOBBIES.includes(h))) return { ok: false, code: 'HOBBIES_BAD' };
    value.hobbies = [...new Set(raw.hobbies)];
  }
  if (raw.gender !== undefined) {
    if (!GENDERS.includes(raw.gender)) return { ok: false, code: 'GENDER_BAD' };
    value.gender = raw.gender;
  }
  return Object.keys(value).length ? { ok: true, value } : { ok: false, code: 'PROFILE_BAD' };
}

/** Đủ chưa: bắt buộc có giá trị; tuỳ chọn chỉ cần đã trả lời hoặc bấm "Bỏ qua". */
export const profileDone = (p) => Boolean(p?.birthDate && p?.province && Array.isArray(p?.hobbies) && p?.gender);
