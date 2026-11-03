import { useState } from "react";
import { changeAppLanguage } from "../i18n/config";
import { EDU_LANGS } from "./eduCopy";
import { useEduText } from "./eduText";
import { playEduSound } from "./eduSound";

/**
 * Lần đầu mở Education Hugo: (1) chọn ngôn ngữ, (2) quyền riêng tư & điều khoản.
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

  const pickLanguage = async (code) => {
    await changeAppLanguage(code);
    setStep(1);
  };
  const accept = () => {
    try {
      localStorage.setItem(KEY, JSON.stringify({ v: VERSION, at: new Date().toISOString(), lang, terms: true, age: true, ageGroup, guardianPhone: ageGroup === "14-15" ? guardianPhone.trim() : undefined, guardianConsent: ageGroup === "14-15" || undefined, cookies: "essential" }));
    } catch { /* không lưu được thì lần sau hỏi lại */ }
    playEduSound("success", { unlock: true });
    onDone();
  };

  return (
    <div className="edu-welcome" role="dialog" aria-modal="true" aria-labelledby="edu-welcome-title">
      <div className="edu-welcome-card">
        <img src={step ? "/edu/buddy-correct.svg" : "/edu/buddy-learn.svg"} alt="" className="edu-welcome-buddy" />
        {step === 0 ? (
          <>
            <h2 id="edu-welcome-title">{t("welcome.langTitle")}</h2>
            <p>{t("welcome.langBody")}</p>
            <div className="edu-welcome-langs">
              {EDU_LANGS.map(({ code, label }) => (
                <button key={code} type="button" lang={code} className={`edu-welcome-lang${code === lang ? " is-on" : ""}`} onClick={() => pickLanguage(code)}>
                  {label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <>
            <h2 id="edu-welcome-title">{t("welcome.privacyTitle")}</h2>
            <ul className="edu-welcome-facts">
              <li><span className="material-symbols-outlined" aria-hidden="true">cookie</span><div><b>{t("welcome.cookiesTitle")}</b><small>{t("welcome.cookiesBody")}</small></div></li>
              <li><span className="material-symbols-outlined" aria-hidden="true">location_off</span><div><b>{t("welcome.locationTitle")}</b><small>{t("welcome.locationBody")}</small></div></li>
            </ul>
            {/* Danh sách đúng những gì site đặt — thêm cookie/khoá lưu mới thì phải thêm vào welcome.cookieList. */}
            <details className="edu-welcome-more">
              <summary>{t("welcome.cookieMore")}</summary>
              <dl>
                {t("welcome.cookieList").map(([name, kind, why]) => (
                  <div key={name}><dt>{name} <small>· {kind}</small></dt><dd>{why}</dd></div>
                ))}
              </dl>
            </details>
            <label className="edu-welcome-check">
              <input type="checkbox" checked={terms} onChange={(event) => setTerms(event.target.checked)} />
              <span>
                {t("welcome.termsA")} <a href="/terms">{t("common.terms")}</a> {t("login.agreeAnd")}{" "}
                <a href="/privacy">{t("login.policy")}</a>{t("welcome.termsB")}
              </span>
            </label>
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
            <button type="button" className="edu-btn edu-btn--wide" disabled={!canAccept} onClick={accept}>{t("welcome.accept")}</button>
            <button type="button" className="edu-link" onClick={() => setStep(0)}>{t("welcome.back")}</button>
          </>
        )}
        <span className="edu-welcome-dots" aria-hidden="true"><i className={step === 0 ? "is-on" : ""} /><i className={step === 1 ? "is-on" : ""} /></span>
      </div>
    </div>
  );
}
