import { Link, useNavigate } from "react-router-dom";
import { useStandalone } from "../hooks/usePWA";
import { detectInstallTarget } from "../config/platform";
import { promptInstall } from "./eduHead";
import { useEduText } from "./eduText";

/** "EDUCATION HUGO", dưới là dòng nhỏ "Developed by Hugo Studio" (giữ nguyên tiếng Anh ở mọi ngôn ngữ). */
export function EduBrand({ to = "/learn" }) {
  return (
    <Link to={to} className="edu-brand">
      <img src="/edu/buddy-learn.svg" alt="" className="edu-brand-mark" />
      <span className="edu-brand-text">
        <b>EDUCATION HUGO</b>
        <small>Developed by Hugo Studio</small>
      </span>
    </Link>
  );
}

/**
 * Nút cài app: máy tính có hộp cài thật thì mở luôn, còn lại sang trang /install
 * (video mascot + từng bước). Video dựng bằng scripts/video/edu-install/render.mjs.
 */
export function EduInstall({ className = "edu-btn edu-btn--ghost" }) {
  const { t } = useEduText();
  const standalone = useStandalone();
  const navigate = useNavigate();
  if (standalone) return null;
  const target = detectInstallTarget();
  const onClick = async () => {
    if (!(target.iOS || target.android) && (await promptInstall())) return;
    navigate("/install");
  };
  return (
    <button type="button" className={className} onClick={onClick}>
      <span className="material-symbols-outlined" aria-hidden="true">install_mobile</span> {t("install.button")}
    </button>
  );
}
