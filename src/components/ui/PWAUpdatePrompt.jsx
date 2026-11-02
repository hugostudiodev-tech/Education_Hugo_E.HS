import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useRegisterSW } from "virtual:pwa-register/react";
import HugoDrop from "../system/HugoDrop";
import StatusScreen from "../system/StatusScreen";
import { notify } from "../../lib/notify";

const POLL_MS = 60 * 1000;
const BOOT_REASON = "hugo:boot-reason";
const VERSION = import.meta.env.VITE_APP_VERSION || "";

/*
 * Luôn giữ thông báo bản mới cho đến khi người học chủ động cập nhật.
 * Khi xác nhận, kích hoạt service worker mới rồi tải lại ứng dụng.
 */
export default function PWAUpdatePrompt() {
  const { t } = useTranslation();
  const [updating, setUpdating] = useState(false);
  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    immediate: true,
    onRegisterError(error) {
      console.warn("PWA update registration failed:", error);
    },
  });

  useEffect(() => {
    let reason = "";
    try { reason = sessionStorage.getItem(BOOT_REASON) || ""; sessionStorage.removeItem(BOOT_REASON); } catch { /* ignore */ }
    if (reason === "update") {
      notify.success(t("system.update.done", { version: VERSION, defaultValue: "Đã cập nhật lên phiên bản {{version}}" }));
    }
  }, [t]);

  useEffect(() => {
    if (import.meta.env.DEV || !("serviceWorker" in navigator)) return undefined;
    let disposed = false;
    let interval;
    let lastCheck = 0;
    let check;
    let onVisible;

    navigator.serviceWorker.ready.then((registration) => {
      if (disposed) return;
      check = () => {
        if (document.hidden || !navigator.onLine || Date.now() - lastCheck < 60_000) return;
        lastCheck = Date.now();
        registration.update().catch((error) => {
          console.warn("PWA update check failed:", error);
        });
      };
      onVisible = () => check();
      document.addEventListener("visibilitychange", onVisible);
      window.addEventListener("focus", check);
      window.addEventListener("online", check);
      check();
      interval = window.setInterval(check, POLL_MS);
    }).catch(() => {});

    return () => {
      disposed = true;
      if (onVisible) document.removeEventListener("visibilitychange", onVisible);
      if (check) window.removeEventListener("focus", check);
      if (check) window.removeEventListener("online", check);
      window.clearInterval(interval);
    };
  }, []);

  const apply = async () => {
    try { sessionStorage.setItem(BOOT_REASON, "update"); } catch { /* ignore */ }
    setUpdating(true);
    try {
      await updateServiceWorker(true);
    } catch (error) {
      console.error("PWA update activation failed:", error);
      setUpdating(false);
      notify.error(t("system.update.failed", { defaultValue: "Không thể cập nhật lúc này. Hãy thử lại." }));
    }
  };

  if (updating) return <div className="fixed inset-0 z-[500]"><StatusScreen kind="updating" /></div>;
  if (!needRefresh) return null;

  return (
    <div className="hs-sheet" role="dialog" aria-live="polite" aria-label={t("system.update.title", { defaultValue: "Đã có phiên bản mới" })}>
      <HugoDrop mode="fill" className="h-9 w-9 shrink-0" label="" />
      <p className="hs-sheet__text">
        {t("system.update.title", { defaultValue: "Đã có phiên bản mới" })}
        <small>{t("system.update.body", { defaultValue: "Bản mới đã sẵn sàng. Bấm nút bên cạnh để tải phiên bản mới và làm mới ứng dụng." })}</small>
      </p>
      <button type="button" className="hs-btn hs-btn--primary" onClick={apply} disabled={updating}>
        {t("system.update.now", { defaultValue: "Tải bản mới và tải lại" })}
      </button>
    </div>
  );
}
