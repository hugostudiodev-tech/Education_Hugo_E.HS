import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useStandalone } from "../hooks/usePWA";
import { detectInstallTarget } from "../config/platform";
import { notify } from "../lib/notify";
import { promptInstall } from "./eduHead";
import { useEduText } from "./eduText";

const HIDDEN = "edu.spotlightHidden";
const readHidden = () => { try { return JSON.parse(localStorage.getItem(HIDDEN)) || []; } catch { return []; } };

/**
 * Gợi ý MỘT tính năng người học chưa dùng, tự chọn theo thứ tự giá trị:
 *   1. Bật thông báo (một chạm, xin quyền ngay tại chỗ) — thông báo đẩy giữ người học quay lại.
 *   2. Cài app (máy tính chưa cài).
 * (Thi đua tuần là thẻ cố định cạnh Thách đấu ở trang Luyện tập — không gợi ý ở đây.)
 * Chỉ hiện sau bài học đầu tiên (đừng phân tâm trước khi người học thấy giá trị). Ẩn được từng gợi ý.
 */
export default function EduSpotlight({ learner }) {
  const { t } = useEduText();
  const navigate = useNavigate();
  const standalone = useStandalone();
  const [hidden, setHidden] = useState(readHidden);
  const [permission, setPermission] = useState(() => (typeof Notification === "undefined" ? "unsupported" : Notification.permission));
  if (!learner?.completedLessons?.length) return null;

  const device = detectInstallTarget();
  const pushReady = "serviceWorker" in navigator && "PushManager" in window && !(device.iOS && !standalone); // iOS chỉ đẩy cho app đã cài
  const enablePush = async () => {
    const { webPushHelper } = await import("../utils/webPushHelper");
    const result = await webPushHelper.requestPermission();
    setPermission(result);
    if (result !== "granted") return notify.warning(t("settings.pushDenied"));
    try { await webPushHelper.registerAndSubscribe(learner.email); notify.success(t("settings.pushDone")); }
    catch { notify.error(t("settings.pushFailed")); }
  };
  const install = async () => { if (!(device.iOS || device.android) && (await promptInstall())) return; navigate("/install"); };

  const tips = [
    pushReady && permission === "default" && { key: "notify", icon: "notifications_active", tone: "#ff9600", onClick: enablePush },
    !standalone && { key: "install", icon: "install_mobile", tone: "#1cb0f6", onClick: install },
  ].filter((tip) => tip && !hidden.includes(tip.key));
  const tip = tips[0];
  if (!tip) return null;

  const [title, body] = t(`friends.spotlight.${tip.key}`);
  const hide = () => {
    const next = [...hidden, tip.key];
    setHidden(next);
    try { localStorage.setItem(HIDDEN, JSON.stringify(next)); } catch { /* chế độ riêng tư: chỉ ẩn trong phiên */ }
  };
  const inner = <>
    <span className="edu-spot-icon material-symbols-outlined" aria-hidden="true" style={{ background: tip.tone }}>{tip.icon}</span>
    <span className="edu-spot-text"><b>{title}</b><small>{body}</small></span>
    <span className="material-symbols-outlined" aria-hidden="true">chevron_right</span>
  </>;
  return (
    <aside className="edu-spot">
      {tip.to ? <Link to={tip.to} className="edu-spot-main">{inner}</Link> : <button type="button" className="edu-spot-main" onClick={tip.onClick}>{inner}</button>}
      <button type="button" className="edu-spot-x" onClick={hide} aria-label={t("friends.spotlight.close")}><span className="material-symbols-outlined" aria-hidden="true">close</span></button>
    </aside>
  );
}
