// Bản lưu trên máy (localStorage): mở app hiện ngay dữ liệu lần trước, mạng về thì cập nhật nền.
// Mọi lỗi (chế độ riêng tư, đầy bộ nhớ) đều bỏ qua — chỉ là tiện ích, không phải nguồn sự thật.
const PREFIX = "edu.cache:";

export function readCache(key) {
  if (!key) return null;
  try { return JSON.parse(localStorage.getItem(PREFIX + key)); } catch { return null; }
}

export function writeCache(key, value) {
  if (!key) return;
  try {
    if (value == null) localStorage.removeItem(PREFIX + key);
    else localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch { /* đầy bộ nhớ: bỏ qua */ }
}

/** Đăng xuất / xoá tài khoản: xoá hết bản lưu (không để người sau trên cùng máy thấy). */
export function clearCache() {
  try { Object.keys(localStorage).filter((k) => k.startsWith(PREFIX)).forEach((k) => localStorage.removeItem(k)); } catch { /* bỏ qua */ }
}
