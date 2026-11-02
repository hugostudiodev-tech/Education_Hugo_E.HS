import { createElement } from "react";
import i18n from "../i18n/config";
import { eduLang } from "./eduText";
import { partner } from "../config/partner";

/** Ngọc — điểm tiêu được của Education Hugo . */
const UNIT = { vi: "Ngọc", en: "gems", zh: "宝石" };
const LOCALE = { vi: "vi-VN", en: "en-US", zh: "zh-CN" };

export function gemText(n, { unit = true } = {}) {
  const lang = eduLang(partner.lang || i18n.resolvedLanguage || i18n.language);
  const value = Math.round(Number(n) || 0).toLocaleString(LOCALE[lang]);
  return unit ? `${value} ${UNIT[lang]}` : value;
}

/** Viên ngọc vẽ bằng CSS (không ảnh, không emoji). */
export function GemIcon({ size = 26 }) {
  return createElement("span", { className: "edu-gem", style: { "--gem": `${size}px` }, "aria-hidden": "true" });
}
