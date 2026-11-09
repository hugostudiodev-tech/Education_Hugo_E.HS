import { lazy, Suspense, useCallback, useEffect, useMemo, useState } from "react";
import { playEduSound } from "./eduSound";
import { useEduCourse } from "./useEduCourse";
import DevSite from "./DevTop";
import { Link, Navigate, Outlet, Route, Routes, useLocation, useNavigate, useParams } from "react-router-dom";
import { clearMemberSession, getMemberSession, logoutAuth, restoreMemberSession } from "../services/api/core/authSession";
import { clearCache, readCache, writeCache } from "../lib/offlineCache";
import { hugoCoderApi } from "../services/api/modules/hugoCoderApi";
import { useEduHead } from "./eduHead";
import { needsWelcome, readConsent, rememberAccount, takePendingGoal } from "./eduAccounts";
import { detectInstallTarget } from "../config/platform";
import { useStandalone } from "../hooks/usePWA";
import { useEduPrefs } from "./useEduPrefs";
import { useEduText } from "./eduText";
import { changeAppLanguage } from "../i18n/config";
import { installEduTapSounds } from "./eduSound";
import { PersonaGate, usePersona } from "./EduPersona";
import EduStatus, { EduErrorBoundary } from "./EduStatus";
import { API_BASE } from "../config/apiBase";
import "./education.css";

// Mọi màn ngoài khung chính đều tải lười; PWA chỉ tải màn người dùng thực sự mở.
const PAGES = {
  landing: () => import("./EduLanding"),
  login: () => import("./EduLogin"),
  onboard: () => import("./EduOnboard"),
  welcome: () => import("./EduWelcome"),
  streak: () => import("./EduStreak"),
  course: () => import("./EduCourseIntro"),
  hub: () => import("../components/member/hugoCoder/HugoCoderHub"),
  community: () => import("./EduCommunity"),
  feedback: () => import("./EduFeedback"),
  friends: () => import("./EduFriends"),
  legal: () => import("./EduLegal.jsx"),
  developers: () => import("./EduDevelopers.jsx"),
  devTeam: () => import("./EduDeveloperTeam.jsx"),
  practice: () => import("./EduPractice.jsx"),
};
const EduLanding = lazy(PAGES.landing);
// Vỏ app (thanh điều hướng, cửa hàng, cài đặt…) + màn mừng chuỗi lửa chỉ tải khi cần: khách ở trang chủ không phải tải chúng.
const shellPart = (name) => lazy(() => import("./EduShell").then((m) => ({ default: m[name] })));
const EduShell = shellPart("default");
const EduInstallGate = shellPart("EduInstallGate");
const EduProfile = shellPart("EduProfile");
const EduSettingsPage = shellPart("EduSettingsPage");
const EduStore = shellPart("EduStore");
const StreakCelebration = lazy(() => PAGES.streak().then((m) => ({ default: m.StreakCelebration })));

/** Nghe sự kiện mốc chuỗi lửa (EduStreak phát) — giữ ở đây để không kéo cả EduStreak vào gói đầu. */
function useStreakCelebration() {
  const [event, setEvent] = useState(null);
  useEffect(() => {
    const on = (e) => setEvent(e.detail);
    window.addEventListener("edu:streak-milestone", on);
    return () => window.removeEventListener("edu:streak-milestone", on);
  }, []);
  return useMemo(() => ({ event, close: () => setEvent(null) }), [event]);
}
const EduLogin = lazy(PAGES.login);
const EduOnboard = lazy(PAGES.onboard);
const EduWelcome = lazy(PAGES.welcome);
const StreakView = lazy(() => PAGES.streak().then((mod) => ({ default: mod.StreakView })));
const EduCourseIntro = lazy(PAGES.course);
const HugoCoderHub = lazy(PAGES.hub);
const EduCommunity = lazy(PAGES.community);
const EduFeedback = lazy(PAGES.feedback);
const EduFriends = lazy(PAGES.friends);
const EduFindFriends = lazy(() => PAGES.friends().then((m) => ({ default: m.EduFindFriends })));
const ProfileGate = lazy(() => import("./EduProfileGate"));
const CommunityInvite = lazy(() => PAGES.friends().then((m) => ({ default: m.CommunityInvite })));
const EduPublicProfile = lazy(() => PAGES.friends().then((m) => ({ default: m.EduPublicProfile })));
const EduLegal = lazy(PAGES.legal);
const EduDevelopers = lazy(PAGES.developers);
const EduDeveloperTeam = lazy(PAGES.devTeam);
const EduPractice = lazy(PAGES.practice);

const hasSavedAccounts = () => { try { return JSON.parse(localStorage.getItem("edu.accounts") || "[]").length > 0; } catch { return false; } };
/** Sau đăng nhập: về ?next= nếu là đường dẫn nội bộ, không thì /learn. */
const afterLogin = () => {
  const next = new URLSearchParams(window.location.search).get("next") || "";
  window.location.assign(/^\/(?!\/)/.test(next) ? next : "/learn");
};
const Loading = () => <EduStatus kind="loading" />;

// Khung chính (thanh trên, menu, cột phải, hộp thông báo) dựng MỘT lần cho mọi trang trong nó;
// chuyển trang chỉ đổi phần nội dung, chờ tải thì quay nhỏ ngay trong vùng nội dung.
const VIEW_OF = [[/^\/(learn|courses)/, "learn"], [/^\/practice/, "practice"], [/^\/(terms|privacy|guidelines)/, "legal"], [/^\/(feedback|profile|developer-team|friends|u\/)/, "profile"],
  [/^\/(ads|community)/, "community"], [/^\/store/, "store"]];
function ShellLayout({ learner, signedIn }) {
  const { pathname } = useLocation();
  const view = VIEW_OF.find(([re]) => re.test(pathname))?.[1] || "learn";
  return (
    <EduShell view={view} learner={learner} signedIn={signedIn}>
      <Suspense fallback={<EduStatus kind="loading" compact />}><Outlet /></Suspense>
    </EduShell>
  );
}

/** /en, /zh: trang giới thiệu theo ngôn ngữ đó (link chia sẻ + trang tĩnh SEO trỏ về đây). */
function LangLanding({ lang, signedIn }) {
  useEffect(() => { changeAppLanguage(lang); }, [lang]);
  return signedIn ? <Navigate to="/learn" replace /> : <EduLanding />;
}

/**
 * Education Hugo — education.hugowishpax.studio.
 *
 * Máy chủ riêng (server/), đăng nhập bằng Google, tài khoản Hugo Studio hoặc passkey.
 * Học miễn phí, tài khoản không hết hạn (6 step đầu học thử không cần đăng nhập).
 * Qua một step lần đầu được +5 Ngọc mỗi câu đúng; Ngọc đổi vật phẩm trong Cửa hàng.
 *
 *   /            khách: trang giới thiệu · đã đăng nhập: vào /learn
 *   /learn       bản đồ 26 step (khách vẫn xem và học thử được)
 *   /learn/:id   trình học toàn màn
 *   /store /profile /settings /community   cần đăng nhập
 */
export default function EducationApp() {
  useEduHead();
  const [session, setSession] = useState(() => getMemberSession());
  const signedIn = Boolean(session?.email);
  // Hồ sơ lần trước trên máy này: hiện ngay khi mở app, /me trả về thì thay.
  const meKey = signedIn ? `me:${session.email}` : null;
  const [learner, setLearner] = useState(() => readCache(meKey));
  useEffect(() => { if (meKey && learner) writeCache(meKey, learner); }, [meKey, learner]);

  const refresh = useCallback(() => {
    if (!getMemberSession()?.email) return Promise.resolve();
    return hugoCoderApi.getAccessSnapshot()
      .then(({ learner: next, edu }) => setLearner((current) => ({ ...next, edu: edu || current?.edu })))
      .catch((error) => {
        // Phiên ở máy đã chết phía máy chủ: về trạng thái khách cho khớp.
        if (error?.status === 401) { clearMemberSession(); setSession(null); }
      });
  }, []);

  useEffect(() => { if (signedIn) refresh(); }, [signedIn, refresh]);

  // Quay về từ trang đồng ý OAuth (?signedin=discord|facebook|hugo-studio): phiên đã nằm trong cookie, ghi vào máy.
  useEffect(() => {
    const url = new URL(window.location.href);
    const provider = url.searchParams.get("signedin");
    if (!provider) return;
    url.searchParams.delete("signedin");
    window.history.replaceState(null, "", url.pathname + url.search + url.hash);
    restoreMemberSession(provider === "hugo" ? "hugo-studio" : provider).then((next) => next && setSession(next)).catch(() => {});
  }, []);

  // Tự đồng bộ: cùng một tài khoản có thể đang học ở máy khác, hay đăng nhập/đăng
  // xuất ở tab khác — không bắt người học tải lại trang.
  useEffect(() => {
    if (!signedIn) return undefined;
    let last = Date.now();
    // ponytail: kéo lại khi quay về tab (tối đa 1 lần/30 giây), không thăm dò định kỳ — Render free tính băng thông.
    const onVisible = () => {
      if (document.visibilityState !== "visible" || Date.now() - last < 30_000) return;
      last = Date.now();
      refresh();
    };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("hugo:bio-update", refresh);
    return () => {
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("hugo:bio-update", refresh);
    };
  }, [signedIn, refresh]);

  // Đăng nhập/đăng xuất ở tab khác của Edu.
  useEffect(() => {
    const onStorage = (event) => {
      if (event.key !== null && event.key !== "price-doc-member-session") return;
      const next = getMemberSession();
      setSession(next);
      if (!next) setLearner(null);
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const mergeLearner = useCallback((next) => setLearner((current) => {
    const merged = { ...(current || {}), ...(next || {}) };
    // Vừa qua step mới: mục tiêu hôm nay nhích ngay, không chờ lần đồng bộ sau.
    const gained = (next?.completedLessons?.length || 0) - (current?.completedLessons?.length || 0);
    const today = merged.edu?.today;
    if (gained > 0 && next?.completedLessons && today) merged.edu = { ...merged.edu, today: { ...today, done: today.done + gained } };
    return merged;
  }), []);
  const signOut = async () => {
    await logoutAuth();
    clearCache();
    setSession(null);
    setLearner(null);
  };

  const me = learner || (signedIn ? { email: session.email, displayName: session.displayName, avatarUrl: session.avatarUrl } : null);
  const textSize = useEduPrefs(signedIn ? learner?.edu?.prefs : null);
  // Lần đầu vào: chọn ngôn ngữ → đồng ý điều khoản (xem EduWelcome). Âm thanh chạm cho cả site.
  const [welcome, setWelcome] = useState(needsWelcome);
  useEffect(() => installEduTapSounds(), []);
  const celebration = useStreakCelebration();
  // Biệt danh + nhân vật bắt buộc (sau bước chào/điều khoản): chưa xong thì không vào học được.
  const [persona, setPersona] = usePersona(signedIn ? session.email : null);

  // Điện thoại chưa cài app: chỉ trang giới thiệu, mọi trang học → video cài đặt.
  const standalone = useStandalone();
  // PWA: nhớ tài khoản trên máy (màn "Đăng nhập lại") + lưu mục tiêu đã chọn lúc onboarding.
  useEffect(() => {
    if (!signedIn || !persona) return;
    rememberAccount({ email: session.email, name: persona.nickname || session.displayName, avatar: persona.avatar });
    const goal = takePendingGoal();
    if (goal) {
      fetch(`${API_BASE}/me/settings`, { method: "PUT", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ prefs: { dailyGoal: goal } }) })
        .then(() => refresh()).catch(() => {});
    }
  }, [signedIn, persona, session, refresh]);
  // Đã cho phép thông báo: đăng ký lại push mỗi lần mở app (máy chủ dọn đăng ký chết; trước đây chỉ làm khi mở Cài đặt).
  useEffect(() => {
    if (!signedIn || typeof Notification === "undefined" || Notification.permission !== "granted") return;
    import("../utils/webPushHelper").then(({ webPushHelper }) => webPushHelper.registerAndSubscribe(session.email)).catch(() => {});
  }, [signedIn, session?.email]);
  // Lời đồng ý ở màn chào chỉ nằm trên máy: gửi lên máy chủ làm bằng chứng nếu máy chủ chưa có phiên bản này.
  const consentV = learner?.consentV;
  useEffect(() => {
    const consent = readConsent();
    if (welcome || !signedIn || consentV === undefined || !consent?.v || consentV >= consent.v) return;
    fetch(`${API_BASE}/me/consent`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: JSON.stringify(consent) })
      .then((r) => {
        if (!r.ok) { if (r.status === 400) setWelcome(true); return; }
        setLearner((current) => current && { ...current, consentV: consent.v });
        if (consent.guardianPhone) localStorage.setItem("edu.consent", JSON.stringify({ ...consent, guardianPhone: undefined }));
      }).catch(() => {});
  }, [signedIn, consentV, welcome]); // welcome: đăng nhập trước rồi mới đồng ý (trang công khai không hỏi) thì gửi sau khi đồng ý

  // Mời tham gia cộng đồng: một lần, sau bài học đầu tiên, không chen vào màn học/onboarding.
  const [inviteSeen, setInviteSeen] = useState(() => { try { return Boolean(localStorage.getItem("edu.communityInvite")); } catch { return true; } });
  const closeInvite = useCallback(() => { setInviteSeen(true); try { localStorage.setItem("edu.communityInvite", "1"); } catch { /* riêng tư */ } }, []);
  const location = useLocation();
  // Giữ trang đang mở (vd. /feedback từ thư) để đăng nhập xong quay lại đúng chỗ.
  const needsLogin = <Navigate to={`/login?next=${encodeURIComponent(location.pathname + location.search)}`} replace />;
  const device = detectInstallTarget();
  const phoneWeb = (device.iOS || device.android) && !standalone;
  // Trang công khai (chia sẻ, Google đọc) mở được cả trên trình duyệt điện thoại; còn lại mời cài app.
  const publicPage = ["/", "/en", "/zh", "/terms", "/privacy", "/guidelines", "/partners", "/developers"].includes(location.pathname) || location.pathname.startsWith("/courses/") || location.pathname.startsWith("/u/");
  const gated = phoneWeb && !publicPage;
  const showInvite = signedIn && !inviteSeen && !welcome && !gated && persona?.complete && persona.profileDone !== false && !celebration.event
    && (me?.completedLessons?.length || 0) >= 1 && !me?.communityJoined && !/^\/learn\/./.test(location.pathname);
  return (
    <div className={`edu${textSize === "lg" ? " edu-text-lg" : ""}`}>
      {gated && <Suspense fallback={null}><EduInstallGate /></Suspense>}
      {/* Trang công khai hiện ngay, không bị hộp đồng ý chặn: chỉ hỏi khi bấm vào học / đăng nhập (cookie chỉ loại thiết yếu nên không cần banner). */}
      {welcome && !publicPage && <Suspense fallback={null}><EduWelcome onDone={() => setWelcome(false)} /></Suspense>}
      {!welcome && !gated && persona && !persona.complete && <PersonaGate current={persona} onDone={setPersona} />}
      {/* Hồ sơ riêng tư (ngày sinh, tỉnh/thành, sở thích, giới tính): mới đăng ký thì hỏi ngay sau tạo nhân vật; thành viên cũ hỏi lần mở app tới. */}
      {!welcome && !gated && persona?.complete && persona.profileDone === false && <Suspense fallback={null}><ProfileGate current={persona} onDone={setPersona} /></Suspense>}
      {showInvite && <Suspense fallback={null}><CommunityInvite onLearnerUpdate={mergeLearner} onClose={closeInvite} /></Suspense>}
      {celebration.event && <Suspense fallback={null}><StreakCelebration key={`${celebration.event.count}-${celebration.event.joy || 0}`} {...celebration.event} onClose={celebration.close} /></Suspense>}
      {!gated && <EduErrorBoundary><Suspense fallback={<Loading />}><Routes>
        <Route path="/" element={signedIn ? <Navigate to="/learn" replace /> : standalone ? <EduOnboard /> : <EduLanding />} />
        {/* Tải lại cả trang sau đăng nhập: bộ nhớ đệm bài học (401 lúc còn là khách) và phiên mới cùng sạch. */}
        <Route path="/en" element={<LangLanding lang="en" signedIn={signedIn} />} />
        <Route path="/zh" element={<LangLanding lang="zh" signedIn={signedIn} />} />
        <Route path="/install" element={<EduInstallGate />} />
        {/* Trang nhà phát triển: trang riêng, công khai, không khung app. */}
        <Route path="/developers" element={<EduDevelopers />} />
        <Route path="/partners" element={<DevSite><div className="dev-legal"><EduLegal doc="partners" /></div></DevSite>} />
        <Route path="/login" element={signedIn ? <Navigate to="/learn" replace /> : (standalone ? <EduOnboard start={hasSavedAccounts() ? "signin" : "signinAs"} /> : <EduLogin onSignedIn={afterLogin} />)} />
        <Route path="/learn/:lessonId" element={<LessonView learner={me} onLearnerUpdate={mergeLearner} />} />
        <Route path="/streak" element={signedIn ? <StreakView learner={me} onLearnerUpdate={mergeLearner} /> : needsLogin} />
        {/* Cài đặt đã gộp vào Hồ sơ; giữ địa chỉ cũ cho push/link cũ. */}
        <Route path="/settings" element={signedIn ? <div className="edu-settings-screen"><EduSettingsPage learner={me} persona={persona} onPersona={setPersona} onSignOut={signOut} onLearnerUpdate={mergeLearner} /></div> : needsLogin} />
        <Route element={<ShellLayout learner={me} signedIn={signedIn} />}>
          <Route path="/learn" element={<LearnMap learner={me} onLearnerUpdate={mergeLearner} />} />
          <Route path="/courses/:id" element={<EduCourseIntro />} />
          {/* Văn bản pháp lý: công khai, không cần đăng nhập. */}
          <Route path="/developer-team" element={signedIn ? <EduDeveloperTeam /> : needsLogin} />
          {["terms", "privacy", "guidelines"].map((doc) => <Route key={doc} path={`/${doc}`} element={<EduLegal doc={doc} />} />)}
          <Route path="/feedback" element={signedIn ? <EduFeedback /> : needsLogin} />
          <Route path="/ads" element={signedIn ? <EduCommunity /> : needsLogin} />
          <Route path="/community/*" element={<Navigate to="/ads" replace />} />
          <Route path="/practice" element={signedIn ? <EduPractice learner={me} onLearnerUpdate={mergeLearner} /> : needsLogin} />
          <Route path="/store" element={signedIn ? <EduStore learner={me} onLearnerUpdate={mergeLearner} /> : needsLogin} />
          <Route path="/friends" element={signedIn ? <EduFriends /> : needsLogin} />
          <Route path="/friends/find" element={signedIn ? <EduFindFriends /> : needsLogin} />
          <Route path="/u/:code" element={<EduPublicProfile />} />
          <Route path="/profile" element={signedIn ? <EduProfile learner={me} persona={persona} onPersona={setPersona} /> : needsLogin} />
        </Route>
        {/* PWA cài lúc manifest của www còn hiệu lực sẽ mở /member/today — ở Edu không có trang đó.
            Đường dẫn kiểu www về /learn (giữ query, vd. ?source=pwa); trong app đã cài, đường lạ cũng về /learn thay vì 404. */}
        {["/member/*", "/study/*", "/today", "/utilities/*", "/progress"].map((path) => (
          <Route key={path} path={path} element={<Navigate to={`/learn${location.search}`} replace />} />
        ))}
        <Route path="*" element={standalone ? <Navigate to="/learn" replace /> : <EduStatus kind="notFound" />} />
      </Routes></Suspense></EduErrorBoundary>}
    </div>
  );
}

function LearnMap({ learner, onLearnerUpdate }) {
  const navigate = useNavigate();
  // Khoá chọn ở bảng "Khoá học của bạn" trên thanh trên (useEduCourse).
  const course = useEduCourse();
  return (
    <Suspense fallback={<EduStatus kind="loading" compact />}>
      <HugoCoderHub key={course} framed course={course} bio={learner} onBioUpdate={onLearnerUpdate} onLessonChange={(id, part) => navigate(id ? `/learn/${id}` : "/learn", { state: { part } })} />
    </Suspense>
  );
}

function LessonView({ learner, onLearnerUpdate }) {
  const navigate = useNavigate();
  const { lessonId } = useParams();
  return (
    <Suspense fallback={<Loading />}>
      <HugoCoderHub
        bio={learner}
        onBioUpdate={onLearnerUpdate}
        urlLessonId={lessonId}
        onBack={() => navigate("/learn")}
        onLessonChange={(id, part) => navigate(id ? `/learn/${id}` : "/learn", { state: { part } })}
      />
    </Suspense>
  );
}
