// Education Hugo — điểm vào. API là máy chủ riêng (server/), gọi cùng origin qua rewrite /api trong vercel.json.
import React, { Suspense, lazy } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { LazyMotion, MotionConfig } from "framer-motion";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "react-hot-toast";
import "./index.css";
import "./i18n/config.js";
import { installApiAuthInterceptor } from "./services/api/core/authInterceptor";
import { liquidPress } from "./lib/liquidGlass/LiquidPressEngine";
import { queryClient } from "./lib/queryClient";
import ErrorBoundary from "./components/ErrorBoundary";
import StatusScreen from "./components/system/StatusScreen";
import ServerStatusBanner from "./components/system/ServerStatusBanner";
import PWAUpdatePrompt from "./components/ui/PWAUpdatePrompt";

const EducationApp = lazy(() => import("./education/EducationApp"));
// /admin: trang quản trị riêng, không đi qua vỏ người học (cổng cài app, hồ sơ, chuỗi ngày).
const EduAdmin = lazy(() => import("./education/admin/EduAdmin"));
const IS_ADMIN = window.location.pathname === "/admin" || window.location.pathname.startsWith("/admin/");
const loadMotionFeatures = () => import("./config/motionFeatures").then((mod) => mod.default);
const IOS_SPRING = { type: "spring", visualDuration: 0.42, bounce: 0.18 };

window.addEventListener("vite:preload-error", (event) => {
  event.preventDefault();
  const last = Number(sessionStorage.getItem("edu_chunk_reload") || 0);
  if (Date.now() - last > 8000) {
    sessionStorage.setItem("edu_chunk_reload", String(Date.now()));
    window.location.reload();
  }
});

installApiAuthInterceptor();
liquidPress.start();

// Sáng/Tối: useEduPrefs đặt data-theme; "auto" thì theo máy.
const root = document.documentElement;
const media = window.matchMedia("(prefers-color-scheme: dark)");
const syncTheme = () => {
  const forced = root.dataset.theme;
  root.classList.toggle("dark", forced === "dark" || (forced !== "light" && media.matches));
};
syncTheme();
media.addEventListener("change", syncTheme);
new MutationObserver(syncTheme).observe(root, { attributes: true, attributeFilter: ["data-theme"] });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <LazyMotion features={loadMotionFeatures}>
          <MotionConfig reducedMotion="user" transition={IOS_SPRING}>
            <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <Suspense fallback={<StatusScreen kind="loading" />}>{IS_ADMIN ? <EduAdmin /> : <EducationApp />}</Suspense>
              <PWAUpdatePrompt />
              <ServerStatusBanner />
              <Toaster
                position="top-center"
                containerStyle={{ top: "calc(env(safe-area-inset-top, 24px) + 24px)" }}
                toastOptions={{
                  duration: 4000,
                  className: "hugo-hot-toast",
                  style: { maxWidth: "min(420px, calc(100vw - 24px))", borderRadius: "20px", background: "rgba(255,255,255,.96)", color: "#0f172a", boxShadow: "0 22px 58px rgba(15,23,42,.20)", padding: "13px 16px", fontSize: "13px", fontWeight: 850 },
                }}
              />
            </BrowserRouter>
          </MotionConfig>
        </LazyMotion>
      </ErrorBoundary>
    </QueryClientProvider>
  </React.StrictMode>,
);
