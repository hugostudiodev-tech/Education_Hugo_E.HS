import { useState } from "react";
import { changeAppLanguage } from "../i18n/config";
import { EDU_LANGS } from "./eduCopy";
import { useEduText } from "./eduText";
import { playEduSound } from "./eduSound";

/**
 * Lần đầu bấm vào học/đăng nhập: MỘT màn gồm ngôn ngữ, cam kết riêng tư, nhóm tuổi và điều khoản (trang công khai không bị chặn).
 *
 * Làm theo luật, không theo thói quen "bấm Đồng ý hết":
 *  - Cookie: site chỉ dùng loại THIẾT YẾU (phiên đăng nhập, lưu cài đặt) — không quảng
 *    cáo, không theo dõi bên thứ ba — nên chỉ cần thông báo, không có ô bật/tắt giả.
 *    Thêm công cụ phân tích/quảng cáo sau này thì PHẢI thêm lựa chọn riêng, mặc định tắt.
 *  - Người 14–15 tuổi phải khai số điện thoại và xác nhận đã được người giám hộ cho phép.
 *  - Vị trí: KHÔNG xin. Education Hugo không dùng vị trí; xin quyền không có mục đích là
 *    trái nguyên tắc tối thiểu hoá dữ liệu. Màn này nói rõ điều đó.
 * Ghi lại phiên bản + thời điểm đồng ý trên máy; đổi điều khoản thì tăng VERSION để hỏi lại.
 */
import { KEY, VERSION } from "./eduAccounts";
export { needsWelcome } from "./eduAccounts";


export default function EduWelcome({ onDone }) {
  const { t, lang } = useEduText();
  const [step, setStep] = useState(0);
  const [terms, setTerms] = useState(false);
  const [ageGroup, setAgeGroup] = useState("");
  const [guardianPhone, setGuardianPhone] = useState("");
  const [guardianConsent, setGuardianConsent] = useState(false);
  const guardianValid = /^\+?[0-9][0-9 .()-]{7,20}$/.test(guardianPhone.trim());
  const canAccept = terms && (ageGroup === "16+" || (ageGroup === "14-15" && guardianValid && guardianConsent));

  const pickLanguage = (code) => changeAppLanguage(code);
  const accept = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: VERSION, at: new Date().toISOString(), lang, terms: true, age: true, ageGroup, guardianPhone: ageGroup === "14-15" ? guardianPhone.trim() : undefined, guardianConsent: ageGroup === "14-15" || undefined, cookies: "essential" }));
    } catch { /* không lưu được thì lần sau hỏi lại */ }
    playEduSound("success", { unlock: true });
    onDone();
  };

  // Một màn duy nhất (bớt thao tác trước bài đầu): ngôn ngữ dạng chip, cam kết an toàn, nhóm tuổi, điều khoản.
  // "cookies" là màn phụ xem từng mục, bấm Quay lại về màn chính.
  const cookies = step === "cookies";
  return (
    <div className="edu-welcome" role="dialog" aria-modal="true" aria-labelledby="edu-welcome-title">
      <div className="edu-welcome-card is-small">
        <img src="/edu/buddy-learn.svg" alt="" className="edu-welcome-buddy" />
        <h2 id="edu-welcome-title">{cookies ? t("welcome.cookieMore") : t("welcome.title")}</h2>
        <div className="edu-welcome-body" key={String(step)}>
          {cookies ? (
            /* Danh sách đúng những gì site đặt — thêm cookie/khoá lưu mới thì phải thêm vào welcome.cookieList. */
            <dl className="edu-welcome-list">
              {t("welcome.cookieList").map(([name, kind, why]) => (
                <div key={name}><dt>{name} <small>· {kind}</small></dt><dd>{why}</dd></div>
              ))}
            </dl>
          ) : <>
            <div className="edu-welcome-chips" role="group" aria-label={t("welcome.langTitle")}>
              {EDU_LANGS.map(({ code, label }) => (
                <button key={code} type="button" lang={code} aria-pressed={code === lang} className={`edu-welcome-chip${code === lang ? " is-on" : ""}`} onClick={() => pickLanguage(code)}>{label}</button>
              ))}
            </div>
            <button type="button" className="edu-welcome-more" onClick={() => setStep("cookies")}>
              <span><span className="material-symbols-outlined" aria-hidden="true">verified_user</span> {t("welcome.safe")}</span>
              <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
            </button>
            <label className="edu-welcome-field">
              <span>{t("welcome.ageLabel")}</span>
              <select value={ageGroup} onChange={(event) => setAgeGroup(event.target.value)}>
                <option value="">{t("welcome.agePick")}</option>
                <option value="16+">{t("welcome.age16")}</option>
                <option value="14-15">{t("welcome.age1415")}</option>
                <option value="under14">{t("welcome.ageUnder14")}</option>
              </select>
            </label>
            {ageGroup === "14-15" && <>
              <label className="edu-welcome-field">
                <span>{t("welcome.guardianPhone")}</span>
                <input type="tel" inputMode="tel" autoComplete="tel" value={guardianPhone} onChange={(event) => setGuardianPhone(event.target.value)} placeholder={t("welcome.guardianPhoneHint")} />
              </label>
              <label className="edu-welcome-check">
                <input type="checkbox" checked={guardianConsent} onChange={(event) => setGuardianConsent(event.target.checked)} />
                <span>{t("welcome.guardianConsent")}</span>
              </label>
            </>}
            {ageGroup === "under14" && <small className="edu-welcome-warning">{t("welcome.under14Blocked")}</small>}
          </>}
        </div>
        <div className="edu-welcome-foot">
          {cookies ? (
            <button type="button" className="edu-btn edu-btn--ghost edu-btn--wide" onClick={() => setStep(0)}>{t("welcome.prev")}</button>
          ) : <>
            <label className="edu-welcome-check">
              <input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} />
              <span>
                {t("welcome.termsA")} <a href="/terms">{t("common.terms")}</a> {t("login.agreeAnd")}{" "}
                <a href="/privacy">{t("login.policy")}</a>{t("welcome.termsB")}
              </span>
            </label>
            <button type="button" className="edu-btn edu-btn--wide" disabled={!canAccept} onClick={accept}>{t("welcome.accept")}</button>
          </>}
        </div>
      </div>
    </div>
  );
}
