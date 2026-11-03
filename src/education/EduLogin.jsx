import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { loginMemberWithGoogle, loginMemberWithPasskey, loginMemberWithRedirect } from "../services/api/core/authSession";
import { loadGoogleIdentity } from "../utils/loadGoogleIdentity";
import { EduBrand } from "./EduShell";
import { useEduText } from "./eduText";

/**
 * Đăng nhập = đăng ký: lần đầu đăng nhập là máy chủ Education Hugo tạo tài khoản.
 * Google và passkey (Face ID) cùng email là cùng một người học.
 */
/** Nút Google + passkey dùng chung cho /login và luồng PWA. `hint`: email gợi ý cho tài khoản đã lưu trên máy. */
export function SignInPanel({ onSignedIn, hint = "" }) {
  const { t } = useEduText();
  const buttonRef = useRef(null);
  const handlerRef = useRef(() => {});
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  // Nút Google hỏng ÂM THẦM khi tên miền chưa nằm trong "Authorized JavaScript
  // origins" của client ID (hoặc bị chặn quảng cáo) — đo chiều cao khung để biết.
  const [blocked, setBlocked] = useState(false);

  const finish = ({ session, error: failure }) => {
    if (session) return onSignedIn(session);
    setError(failure || t("login.failed"));
    setBusy(false);
  };

  handlerRef.current = async (response) => {
    if (!response?.credential || busy) return;
    setBusy(true);
    setError("");
    finish(await loginMemberWithGoogle(response.credential));
  };

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setBlocked(true);
      return undefined;
    }
    let cancelled = false;
    let timer;
    loadGoogleIdentity()
      .then((googleId) => {
        if (cancelled || !buttonRef.current) return;
        googleId.initialize({ client_id: clientId, ...(hint ? { login_hint: hint } : {}), callback: (response) => handlerRef.current(response), use_fedcm_for_prompt: false });
        buttonRef.current.innerHTML = "";
        googleId.renderButton(buttonRef.current, { theme: "outline", size: "large", shape: "pill", width: 200, text: "signin_with" });
        timer = setTimeout(() => !cancelled && setBlocked((buttonRef.current?.offsetHeight || 0) < 20), 2500);
      })
      .catch(() => !cancelled && setBlocked(true));
    return () => { cancelled = true; clearTimeout(timer); };
  }, [hint]);

  const passkey = async () => {
    setBusy(true);
    setError("");
    const result = await loginMemberWithPasskey();
    // Lỗi gốc của trình duyệt/Better Auth là tiếng Anh kỹ thuật — thay bằng câu dễ hiểu.
    finish(result.session ? result : { error: t("login.passkeyFailed") });
  };

  const redirect = async (provider) => {
    setBusy(true);
    setError("");
    const next = new URLSearchParams(window.location.search).get("next") || "/learn";
    const { error: failure } = await loginMemberWithRedirect(provider, next.startsWith("/") ? next : "/learn");
    if (failure) { setError(failure === "network" ? t("login.failed") : failure); setBusy(false); }
  };

  return (
    <>
      <div className="edu-signin-row">
        <div ref={buttonRef} className="edu-google" aria-busy={busy} />
        <button type="button" className="edu-btn edu-btn--ghost edu-faceid" onClick={passkey} disabled={busy} aria-label={t("login.passkey")}>
          <span className="material-symbols-outlined" aria-hidden="true">face</span> Face ID
        </button>
      </div>
      <details className="edu-signin-more">
        <summary>{t("login.more")}</summary>
        <div className="edu-signin-row">
          <button type="button" className="edu-btn edu-btn--ghost edu-faceid" onClick={() => redirect("discord")} disabled={busy}>
            <img src="/edu/logo-discord.svg" alt="" width="20" height="20" /> Discord
          </button>
          {/* ponytail: Facebook ẩn tới khi Meta xác minh doanh nghiệp — server đã sẵn (FACEBOOK_CLIENT_ID) */}
        </div>
      </details>
      {blocked && <p className="edu-alert" role="alert">{t("login.blocked", { origin: window.location.origin })}</p>}
      {busy && <p className="edu-note">{t("login.verifying")}</p>}
      {error && <p className="edu-alert" role="alert">{error}</p>}
    </>
  );
}

export default function EduLogin({ onSignedIn }) {
  const { t } = useEduText();
  return (
    <div className="edu-login">
      <header className="edu-login-top"><EduBrand to="/" /></header>
      <main className="edu-login-card">
        <img src="/edu/buddy-correct.svg" alt="" width="120" height="120" />
        <h1>{t("login.title")}</h1>
        <p>{t("login.body")}</p>

        <SignInPanel onSignedIn={onSignedIn} />

        <p className="edu-note">
          {t("login.age")}
        </p>
        <p className="edu-legal">
          {t("login.agreeA")} <a href="/terms">{t("common.terms")}</a> {t("login.agreeAnd")}{" "}
          <a href="/privacy">{t("login.policy")}</a>{t("login.agreeB")}
        </p>
        <Link className="edu-link" to="/learn">{t("login.tryFirst")}</Link>
      </main>
    </div>
  );
}
