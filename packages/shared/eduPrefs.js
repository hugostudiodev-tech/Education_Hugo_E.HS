// Cài đặt cá nhân của Education Hugo — lưu trên máy chủ (EduLearner) để mọi
// máy cùng tài khoản dùng chung; client và máy chủ cùng làm sạch bằng hàm này.

export const EDU_GOALS = [1, 2, 3, 5];
export const EDU_REMINDER_HOURS = Array.from({ length: 17 }, (_, i) => i + 6); // 6h–22h
export const EDU_THEMES = ['system', 'light', 'dark'];
export const EDU_TEXT_SIZES = ['md', 'lg'];

export const EDU_DEFAULT_PREFS = Object.freeze({
  dailyGoal: 1,
  reminder: true,
  reminderHour: 20,
  notifyAccount: true,
  notifySecurity: true,
  notifyEmail: true,
  theme: 'system',
  textSize: 'md',
  sound: true,
  colorSafe: false, // bảng màu cho người mù màu (Okabe-Ito): đúng/sai = xanh dương/cam thay xanh lá/đỏ
  timeZone: 'Asia/Ho_Chi_Minh', // múi giờ thiết bị, app tự đồng bộ
});

const pick = (value, allowed, fallback) => (allowed.includes(value) ? value : fallback);
const bool = (value, fallback) => (typeof value === 'boolean' ? value : fallback);

/** Ghép `input` lên `base`, bỏ mọi khoá lạ và giá trị ngoài danh sách cho phép. */
export function cleanEduPrefs(input = {}, base = EDU_DEFAULT_PREFS) {
  const src = input && typeof input === 'object' ? input : {};
  return {
    dailyGoal: pick(Number(src.dailyGoal), EDU_GOALS, base.dailyGoal),
    reminder: bool(src.reminder, base.reminder),
    reminderHour: pick(Number(src.reminderHour), EDU_REMINDER_HOURS, base.reminderHour),
    notifyAccount: bool(src.notifyAccount, base.notifyAccount),
    notifySecurity: bool(src.notifySecurity, base.notifySecurity),
    notifyEmail: bool(src.notifyEmail, base.notifyEmail),
    theme: pick(src.theme, EDU_THEMES, base.theme),
    textSize: pick(src.textSize, EDU_TEXT_SIZES, base.textSize),
    sound: bool(src.sound, base.sound),
    colorSafe: bool(src.colorSafe, base.colorSafe),
    timeZone: isTimeZone(src.timeZone) ? src.timeZone : base.timeZone,
  };
}

/** Múi giờ mặc định (máy chưa gửi múi giờ). Bảng thi đua tuần dùng MỘT mốc chung theo múi này cho công bằng. */
export const DEFAULT_TIME_ZONE = 'Asia/Ho_Chi_Minh';

/** Múi giờ IANA hợp lệ (vd "Europe/Paris")? Intl ném RangeError với tên sai. */
export function isTimeZone(value) {
  if (typeof value !== 'string' || !value || value.length > 64) return false;
  try { new Intl.DateTimeFormat('en-US', { timeZone: value }); return true; } catch { return false; }
}

const partsIn = (date, timeZone) => Object.fromEntries(new Intl.DateTimeFormat('en-CA', {
  timeZone, year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23',
}).formatToParts(date).map((part) => [part.type, part.value]));

/**
 * "YYYY-MM-DD" và giờ theo múi giờ của NGƯỜI HỌC (lấy từ thiết bị, lưu trong prefs.timeZone):
 * chuỗi lửa, mục tiêu ngày, nhiệm vụ và giờ nhắc đều theo ngày/giờ nơi người học đang sống.
 */
export function clockIn(date = new Date(), timeZone = DEFAULT_TIME_ZONE) {
  const p = partsIn(date, isTimeZone(timeZone) ? timeZone : DEFAULT_TIME_ZONE);
  return { day: `${p.year}-${p.month}-${p.day}`, hour: Number(p.hour) };
}

/** Giờ Việt Nam — giữ cho các phép đếm chung của máy chủ (thi đua tuần, giới hạn chống lạm dụng). */
export const vnClock = (date = new Date()) => clockIn(date, DEFAULT_TIME_ZONE);

/** Thời điểm 00:00 của ngày `day` tại múi giờ đó (tính cả giờ mùa hè). */
export function dayStartIn(day, timeZone = DEFAULT_TIME_ZONE) {
  const zone = isTimeZone(timeZone) ? timeZone : DEFAULT_TIME_ZONE;
  const offsetAt = (ms) => {
    const p = partsIn(new Date(ms), zone);
    return Date.UTC(+p.year, +p.month - 1, +p.day, +p.hour, +p.minute, +p.second) - Math.floor(ms / 1000) * 1000;
  };
  const guess = Date.parse(`${day}T00:00:00Z`);
  let start = guess - offsetAt(guess);
  start = guess - offsetAt(start); // lần hai: đúng cả khi 00:00 nằm cạnh lúc đổi giờ mùa hè
  return new Date(start);
}
