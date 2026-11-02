// Quy tắc tuỳ biến giao diện: chỉ đổi được các token dưới đây, mỗi token có luật
// kiểm riêng. Giá trị sai luật bị BỎ QUA (giữ mặc định) và in cảnh báo, để giao
// diện luôn giống Education Hugo và không vỡ bố cục.
const HEX = /^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i;
const FONT = /^[\w\s"',-]{1,120}$/;

export const THEME_RULES = {
  primary: { css: "--edu-primary", test: (v) => HEX.test(v), rule: "mã màu hex (#29cdff)" },
  primaryStrong: { css: "--edu-primary-strong", test: (v) => HEX.test(v), rule: "mã màu hex, đậm hơn primary để chữ trắng đọc được" },
  success: { css: "--edu-green", test: (v) => HEX.test(v), rule: "mã màu hex" },
  danger: { css: "--edu-red", test: (v) => HEX.test(v), rule: "mã màu hex" },
  font: { css: "--edu-font", test: (v) => FONT.test(v), rule: "tên font CSS, không chứa ; { } ( )" },
};

/** theme → style object chứa biến CSS hợp lệ. */
export function themeVars(theme = {}) {
  const style = {};
  for (const [name, value] of Object.entries(theme || {})) {
    const rule = THEME_RULES[name];
    if (!rule) { console.warn(`[education-hugo] theme.${name}: không có trong quy tắc, bỏ qua.`); continue; }
    if (!rule.test(value)) { console.warn(`[education-hugo] theme.${name} phải là ${rule.rule}, bỏ qua.`); continue; }
    style[rule.css] = value;
  }
  return style;
}
