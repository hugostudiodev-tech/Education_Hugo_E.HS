import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { CATALOG } from "../../packages/courses/catalog";
import { Link } from "react-router-dom";
import { useReducedMotion } from "framer-motion";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import HugoLogo from "../components/HugoLogo";
import { GEMS_PER_CORRECT } from "../../packages/shared/coderProgression";
import { gemText } from "./gems";
import { STUDIO_SOCIAL_LINKS } from "../config/studioSocialLinks";
import { detectInstallTarget } from "../config/platform";
import { useStandalone } from "../hooks/usePWA";
import { EduBrand, EduInstall } from "./EduBrand";
import { rich, useEduText } from "./eduText";
import { playEduSound } from "./eduSound";
import { EDU_LANGS } from "./eduCopy";
import { changeAppLanguage } from "../i18n/config";

gsap.registerPlugin(ScrollTrigger);

/**
 * Trang giới thiệu Education Hugo — bố cục kiểu trang chủ Duolingo.
 *
 *   hero     tranh nhân vật bên trái, tiêu đề + 2 nút bên phải, dải chủ đề ở đáy màn
 *   4 khối   chữ và tranh so le trái/phải; mỗi khối là một cảnh scrollytelling (xem useScene)
 *   dải      học mọi lúc, mọi nơi (cài app)
 *   cuối     lời mời trên nền tối + chân trang
 *
 * Nhân vật: SVG clay của mình (scripts/generate-mascots.mjs), không dùng hình hay chữ của
 * Duolingo. Mỗi tranh là một GSAP timeline gắn với thanh cuộn (ScrollTrigger scrub,
 * trang cuộn bằng window — #root không phải khung cuộn), chuyển động theo một trọng lực chung (xem "Vật lý hoạt hình");
 * đứng yên thì thở bằng CSS và thỉnh thoảng tự nhảy. Bật "Giảm chuyển động" thì
 * bỏ qua timeline — tranh đứng ở tư thế cuối. Nền màu đặc, không gradient.
 */

// Chữ của ba thẻ nằm ở eduCopy (landing.ways), theo đúng thứ tự này.
const WAYS = [{ icon: "bolt", tone: "yellow" }, { icon: "construction", tone: "blue" }, { icon: "quiz", tone: "pink" }];
const CARD_TILT = [-4, 3, -2];

// Ô ngôn ngữ / khái niệm lập trình. Chữ, không dùng logo thương hiệu.
const TILES = [
  ["HTML", "orange", 16, 26], ["CSS", "blue", 82, 20], ["JS", "yellow", 28, 74], ["PHP", "purple", 72, 72],
  ["SQL", "green", 50, 12], ["</>", "pink", 8, 52], ["{ }", "teal", 92, 46], ["Py", "blue", 38, 34],
  ["Git", "red", 64, 30], ["API", "green", 22, 14], ["JSON", "orange", 86, 84], ["CLI", "purple", 54, 88],
];

// Bạn bè đứng trên sân quanh bạn xanh: [x, y] là chỗ đặt CHÂN (% khung tranh); y lớn = đứng gần, vẽ đè lên.
// [x%, y%, ảnh] — mascot 12 cung (public/edu/zodiac/). Hero chỉ đứng vài bạn, còn lại rải khắp web.
const CROWD = [[22, 64, "taurus"], [80, 58, "pisces"], [14, 84, "leo"], [90, 90, "aquarius"], [28, 99, "libra"], [72, 99, "sagittarius"]];

/**
 * Scrollytelling: mỗi khối cao đúng một màn hình (cả điện thoại) và là một cảnh chạy THEO
 * thanh cuộn (scrub) — cuộn xuống truyện tiến, cuộn lên tua lại.
 *   1. Chữ hiện dần lúc khối đang trồi lên (không bao giờ cuộn vào một màn trống).
 *   2. Khối vừa một màn thì ghim lại giữa màn trong lúc tranh diễn; khối cao hơn màn
 *      (chữ phóng to, màn quá thấp) thì không ghim — ghim sẽ che mất phần dưới — chỉ scrub.
 * `story: false` (hero) chạy một lần ngay khi tải. Giảm chuyển động thì không dựng.
 * Cảnh scrub không được chứa tween lặp vô hạn (idleHops) — nhân vật đứng yên đã tự thở bằng CSS/SVG.
 */
function useScene(build, { story = true } = {}) {
  const scope = useRef(null);
  const buildRef = useRef(build);
  buildRef.current = build;
  const still = useReducedMotion();
  useLayoutEffect(() => {
    if (still) return undefined;
    const el = scope.current;
    const ctx = gsap.context(() => {
      if (!story) {
        buildRef.current(gsap.timeline({ scrollTrigger: { trigger: el, start: "top 75%", toggleActions: "play none none none" } }));
        return;
      }
      gsap.from(":scope > .edu-feature-copy > *, :scope > h2, :scope > p", {
        y: 40, opacity: 0, stagger: 0.15, ease: "power2.out",
        scrollTrigger: { trigger: el, start: "top 92%", end: "top 30%", scrub: 0.6 },
      });
      const fits = el.offsetHeight <= window.innerHeight + 2;
      buildRef.current(gsap.timeline({ scrollTrigger: fits
        ? { trigger: el, start: "center center", end: "+=100%", pin: true, scrub: 0.6, anticipatePin: 1 }
        : { trigger: el, start: "top 60%", end: "bottom 70%", scrub: 0.6 } }));
    }, scope);
    return () => ctx.revert();
  }, [still, story]);
  return scope;
}

// ── Vật lý hoạt hình ────────────────────────────────────────────────────────
// Một gia tốc trọng trường cho cả trang. Chuyển động ném có y(t) bậc hai, nên
// power1.out (lên, chậm dần) / power1.in (rơi, nhanh dần) là đúng đường parabol;
// thời gian bay suy từ độ cao chứ không đặt tay. x trong lúc bay đi đều (ease none).
const G = 2600; // px/s²
const airTime = (h) => Math.sqrt((2 * h) / G);
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));

/** Va chạm: nén theo vận tốc chạm đất (giữ thể tích: dẹt xuống thì bè ra), rồi đàn hồi về. */
function impact(tl, el, h, soft = 1) {
  const k = clamp(Math.sqrt(2 * G * h) / 6000, 0.04, 0.3) * soft;
  return tl
    .to(el, { scaleY: 1 - k, scaleX: 1 + k * 0.8, duration: 0.07, ease: "power2.out" })
    .to(el, { scaleY: 1, scaleX: 1, duration: 0.45, ease: "elastic.out(1, 0.35)" });
}

/**
 * Rơi tự do từ độ cao h, kéo dài người khi rơi nhanh, chạm đất nảy tắt dần (hồi phục e).
 * Trước lúc rơi vật ẩn ở trên cao. `soft` < 1 cho vật cứng (thẻ, ô chữ) ít bẹp hơn.
 */
function drop(tl, el, h, at, { e = 0.4, soft = 1 } = {}) {
  const t = airTime(h);
  gsap.set(el, { y: -h, opacity: 0 });
  const d = gsap.timeline()
    .set(el, { opacity: 1 })
    .call(() => playEduSound("thud"), null, t)                // chạm đất: tiếng "bịch" (khi đã mở âm thanh)
    .to(el, { y: 0, duration: t, ease: "power1.in" }, 0)
    .to(el, { scaleY: 1 + 0.12 * soft, scaleX: 1 - 0.08 * soft, duration: t, ease: "power2.in" }, 0);
  impact(d, el, h, soft);
  for (let b = h * e * e; b > 8; b *= e * e) {           // mỗi lần nảy cao bằng e² lần trước
    const tb = airTime(b);
    d.to(el, { y: -b, duration: tb, ease: "power1.out" }, "<0.04")
      .to(el, { y: 0, duration: tb, ease: "power1.in" });
    impact(d, el, b, soft);
  }
  return tl.add(d, at);
}

/** Nhảy: nhún lấy đà → bật lên (duỗi người) → parabol → chạm đất nén. `move` là phần đi ngang. */
function jump(tl, el, h, at, move = null) {
  const t = airTime(h), go = 0.14;
  const j = gsap.timeline()
    .to(el, { scaleY: 0.8, scaleX: 1.14, duration: go, ease: "power2.out" })   // lấy đà
    .to(el, { y: -h, duration: t, ease: "power1.out" }, go)
    .to(el, { scaleY: 1.12, scaleX: 0.92, duration: 0.08 }, go)              // bật lên: duỗi người
    .to(el, { scaleY: 1, scaleX: 1, duration: t * 0.8 }, go + 0.08)
    .to(el, { y: 0, duration: t, ease: "power1.in" }, go + t);
  if (move) j.to(el, { ...move, duration: 2 * t, ease: "none" }, go);
  impact(j, el, h);
  return tl.add(j, at);
}

/** Đứng chơi: thỉnh thoảng tự nhảy một cái, nhịp ngẫu nhiên để cả nhóm không nhảy đều nhau. */
function idleHops(el, h) {
  const tl = gsap.timeline({ repeat: -1, repeatDelay: 2 + Math.random() * 3 });
  jump(tl, el, h * (0.7 + Math.random() * 0.6), 0);
  if (Math.random() < 0.4) jump(tl, el, h * 0.5, ">0.05");             // đôi khi nhảy liền hai cái
  return tl;
}

const Way = ({ way, text, className = "" }) => (
  <li className={`edu-way edu-way--${way.tone} ${className}`}>
    <span className="material-symbols-outlined" aria-hidden="true">{way.icon}</span>
    <div><b>{text.title}</b><span>{text.body}</span></div>
  </li>
);

/** Khối chữ + tranh, so le trái/phải như trang Duolingo. */
const Feature = ({ scope, flip, title, children, art }) => (
  <section ref={scope} className={`edu-feature${flip ? " is-flip" : ""}`}>
    <div className="edu-feature-copy"><h2>{title}</h2>{children}</div>
    <div className="edu-art">{art}</div>
  </section>
);

// ── Hero ───────────────────────────────────────────────────────────────────
function Hero() {
  const { t } = useEduText();
  const target = detectInstallTarget();
  const standalone = useStandalone();
  const phone = (target.iOS || target.android) && !standalone;
  const scope = useScene((tl) => {
    tl.from(".h-pad", { scaleX: 0, duration: 0.45, ease: "power2.out" });
    drop(tl, ".h-buddy", 460, 0.2);                                   // bạn xanh rơi xuống giữa sân
    gsap.utils.toArray(".h-friend").forEach((el, i) => drop(tl, el, 300 + (i % 3) * 60, 0.75 + i * 0.13, { e: 0.35 }));
    // clearProps: .edu-btn có transition transform nên GSAP có thể đọc giá trị dở dang và kẹt lệch; xong thì trả về CSS (giữ cả hiệu ứng nhấn :active).
    tl.from(".edu-hero-copy > *", { y: 24, opacity: 0, duration: 0.5, stagger: 0.1, ease: "power2.out", clearProps: "transform,opacity" }, 0.1);
    const end = tl.duration();
    tl.add(idleHops(".h-buddy", 70), end + 0.4);
    gsap.utils.toArray(".h-friend").forEach((el, i) => tl.add(idleHops(el, 46), end + 1 + i * 0.55));
  }, { story: false });
  return (
    <section ref={scope} className="edu-hero">
      <div className="edu-hero-main">
        <div className="edu-art edu-art--hero" aria-hidden="true">
          <span className="edu-pad h-pad" />
          {CROWD.map(([x, y, src], i) => (
            <span key={i} className="edu-friend h-friend" style={{ left: `${x}%`, bottom: `${100 - y}%`, zIndex: y }}>
              <img src={`/edu/zodiac/${src}.svg`} alt="" style={{ animationDelay: `${-i * 0.37}s` }} />
            </span>
          ))}
          <span className="edu-hero-buddy h-buddy">
            <img src="/edu/zodiac/geminus.svg" alt="" />
          </span>
        </div>
        <div className="edu-hero-copy">
          <h1>{t("landing.hero")}</h1>
          {/* Điện thoại (chưa cài): học chỉ trong app, nên nút chính là Cài ứng dụng; "Khám phá" là phụ. */}
          {phone ? (
            <>
              <EduInstall className="edu-btn edu-btn--wide" />
              <button type="button" className="edu-btn edu-btn--ghost edu-btn--wide" onClick={(event) => event.currentTarget.closest(".edu-hero").nextElementSibling?.scrollIntoView({ behavior: "smooth" })}>
                {t("landing.explore")} <span className="material-symbols-outlined" aria-hidden="true">expand_more</span>
              </button>
            </>
          ) : (
            <>
              <Link className="edu-btn edu-btn--wide" to="/learn">{t("landing.startLearning")}</Link>
              {/* Ba cam kết dạng biểu tượng + nhãn ngắn (ít chữ, nhìn là hiểu). Chữ tách theo " · " trong landing.noAccount. */}
              <ul className="edu-hero-note">
                {t("landing.noAccount").split(" · ").map((label, i) => (
                  <li key={label}><span className="material-symbols-outlined" aria-hidden="true">{["person_off", "block", "visibility_off"][i] || "check"}</span>{label}</li>
                ))}
              </ul>
              <Link className="edu-btn edu-btn--ghost edu-btn--wide" to="/login">{t("landing.haveAccount")}</Link>
            </>
          )}
        </div>
      </div>
      {/* ponytail: dải chủ đề chỉ để xem, chưa có khoá riêng cho từng chủ đề nên không gắn link */}
      <div className="edu-strip" aria-label={t("landing.topics")}>
        <div className="edu-strip-track">
          {[...TILES, ...TILES].map(([label, tone], i) => (
            <span key={i} className="edu-strip-item" aria-hidden={i >= TILES.length || undefined}><i className={`edu-tile-dot edu-tile--${tone}`} />{label}</span>
          ))}
        </div>
      </div>
    </section>
  );
}

// ── Khối 1: miễn phí ────────────────────────────────────────────────────────
// Đồng xu bắn ra từ đầu bạn xanh lúc bật nhảy: x đi đều, y chậm dần tới đỉnh (đúng đường ném).
const fromHeadX = (i, el) => el.parentElement.offsetWidth / 2 - el.offsetLeft;
const fromHeadY = (i, el) => el.parentElement.offsetHeight * 0.5 - el.offsetTop;

function FeatureFree() {
  const { t } = useEduText();
  const scope = useScene((tl) => {
    tl.from(".f1-pad", { scaleX: 0, duration: 0.4, ease: "power2.out" });
    drop(tl, ".f1-buddy", 420, 0.1);
    const at = tl.duration();
    jump(tl, ".f1-buddy", 110, at);
    tl.call(() => playEduSound("coin"), null, at + 0.3)
      .from(".f1-coin", { x: fromHeadX, duration: 0.5, ease: "none", stagger: 0.08 }, at + 0.16)
      .from(".f1-coin", { y: fromHeadY, scale: 0.3, opacity: 0, duration: 0.5, ease: "power1.out", stagger: 0.08 }, at + 0.16);
  });
  return (
    <Feature scope={scope} title={t("landing.freeTitle")} art={
      <div aria-hidden="true">
        <span className="edu-pad f1-pad" />
        {[[18, 22], [80, 14], [86, 52]].map(([x, y], i) => (
          <span key={i} className="edu-coin f1-coin" style={{ left: `${x}%`, top: `${y}%` }}>+{gemText(GEMS_PER_CORRECT)}</span>
        ))}
        <span className="edu-art-actor f1-buddy"><img src="/edu/buddy-learn.svg" alt="" /></span>
      </div>
    }>
      <p>{rich(t("landing.freeBody", { joy: GEMS_PER_CORRECT }))}</p>
    </Feature>
  );
}

// ── Khối 2: học bằng cách làm ───────────────────────────────────────────────
function FeatureDo() {
  const { t } = useEduText();
  const scope = useScene((tl) => {
    // Thẻ dưới cùng rơi trước, thẻ sau đáp lên trên; thẻ cứng nên ít bẹp, xoay đều trong lúc rơi.
    WAYS.forEach((_, k) => {
      const i = 2 - k, h = 380 + k * 40, at = k * 0.35, el = `.f2-card-${i}`;
      drop(tl, el, h, at, { e: 0.3, soft: 0.3 });
      tl.fromTo(el, { rotate: [-22, 16, -12][i] }, { rotate: CARD_TILT[i], duration: airTime(h), ease: "none" }, at);
    });
    gsap.set(".f2-orange", { x: 240 });                                // bạn cam nhảy vào từ bên phải
    jump(tl, ".f2-orange", 80, 0.6, { x: 110 });
    jump(tl, ".f2-orange", 60, ">0.02", { x: 0 });
    tl.to(".f2-orange", { rotate: -10, duration: 0.25, ease: "power2.out" }, ">0.2")   // ngó lên đống thẻ
      .to(".f2-orange", { rotate: 0, duration: 0.4, ease: "power2.inOut" }, ">0.5");
  });
  return (
    <Feature scope={scope} flip title={t("landing.doTitle")} art={
      <div aria-hidden="true">
        <ul className="edu-drop">
          {WAYS.map((way, i) => <Way key={way.icon} way={way} text={t("landing.ways")[i]} className={`f2-card-${i}`} />)}
        </ul>
        <span className="edu-art-actor edu-art-actor--corner f2-orange"><img src="/edu/zodiac/cancer.svg" alt="" className="edu-idle" /></span>
      </div>
    }>
      <p>{t("landing.doBody")}</p>
    </Feature>
  );
}

// ── Khối 4: nhiều khoá ──────────────────────────────────────────────────────
function FeatureCourses() {
  const { t, lang } = useEduText();
  const scope = useScene((tl) => {
    // Ô chữ rơi từ nhiều độ cao theo thứ tự ngẫu nhiên, cứng nên nảy thấp.
    gsap.utils.shuffle(gsap.utils.toArray(".f4-tile")).forEach((el, k) =>
      drop(tl, el, 220 + Math.random() * 200, k * 0.08, { e: 0.3, soft: 0.25 }));
    drop(tl, ".f4-buddy", 360, 0.9);
    jump(tl, ".f4-buddy", 90, ">0.05");
  });
  return (
    <Feature scope={scope} flip title={t("landing.coursesTitle")} art={
      <div aria-hidden="true">
        <div className="edu-tile-grid">
          {TILES.map(([label, tone]) => <span key={label} className={`edu-tile f4-tile edu-tile--${tone}`}>{label}</span>)}
        </div>
        <span className="edu-art-actor f4-buddy"><img src="/edu/buddy-practice.svg" alt="" /></span>
      </div>
    }>
      <p>{t("landing.coursesBody")}</p>
      {/* Lối vào trang giới thiệu từng khoá (/courses/:id) — cũng là liên kết nội bộ cho Google. */}
      <div className="edu-landing-courses">
        {CATALOG.map((c) => (
          <Link key={c.id} to={`/courses/${c.id}`} className="cintro-other">
            <img src={`/edu/cast-${c.cast}.svg`} alt="" width="44" height="44" />
            <span><b>{c.title[lang] || c.title.vi}</b><small>{c.outline.length} step · {t("courses.free")}</small></span>
          </Link>
        ))}
      </div>
    </Feature>
  );
}

// ── Dải học mọi lúc, mọi nơi ────────────────────────────────────────────────
function Anywhere() {
  const { t } = useEduText();
  const scope = useScene((tl) => {
    tl.from(".a-phone", { y: 120, opacity: 0, duration: 0.6, stagger: 0.15, ease: "back.out(1.4)" });
    [0, 1, 2].forEach((k) => {                       // rơi xuống máy đầu, rồi nhảy qua từng máy
      const el = `.a-run-${k}`;
      drop(tl, el, 320, 0.6 + k * 0.25);
      jump(tl, el, 130, 1.9 + k * 0.25, { left: "50%" });
      jump(tl, el, 130, 2.9 + k * 0.25, { left: "80%" });
    });
  });
  return (
    <section ref={scope} className="edu-anywhere">
      <h2>{t("landing.anywhereTitle")}</h2>
      <p>{t("landing.anywhereBody")}</p>
      <EduInstall className="edu-btn" />
      <div className="edu-phones" aria-hidden="true">
        {[20, 50, 80].map((left) => (
          <div key={left} className="edu-phone edu-phone--mini a-phone" style={{ left: `${left}%` }}>
            <span className="edu-phone-bar" /><span className="edu-phone-line" /><span className="edu-phone-line is-short" />
          </div>
        ))}
        {["/edu/buddy-correct.svg", "/edu/zodiac/scorpius.svg", "/edu/prof.svg"].map((src, k) => (
          <span key={src} className={`edu-runner a-run-${k}`} style={{ "--k": k }}><img src={src} alt="" /></span>
        ))}
      </div>
    </section>
  );
}

// ── Lời mời cuối ────────────────────────────────────────────────────────────
function Final() {
  const { t } = useEduText();
  const scope = useScene((tl) => {
    tl.from(".edu-final > *", { y: 24, opacity: 0, duration: 0.5, stagger: 0.1 }, 0);
    // Nhân vật bật lên từ mép dưới: lên chậm dần qua đỉnh rồi rơi về chỗ đứng.
    gsap.utils.toArray(".z-peek").forEach((el, i) => {
      const rise = 240, over = 50, at = 0.3 + i * 0.15;
      tl.fromTo(el, { y: rise }, { y: -over, duration: airTime(rise + over), ease: "power1.out" }, at)
        .to(el, { y: 0, duration: airTime(over), ease: "power1.in" });
      impact(tl, el, over);
    });
  });
  return (
    <section ref={scope} className="edu-end">
      <div className="edu-warp" aria-hidden="true">
        {TILES.map(([label, tone, x, y], i) => (
          <span key={label} className={`edu-tile edu-tile--fly edu-tile--${tone}`} style={{ left: `${x}%`, top: `${y}%`, animationDelay: `${-i * 0.5}s` }}>{label}</span>
        ))}
      </div>
      <div className="edu-final">
        <h2>{t("landing.finalTitle")}</h2>
        <Link className="edu-btn edu-btn--light edu-btn--wide" to="/learn">{t("landing.startLearning")}</Link>
      </div>
      <div className="edu-peek" aria-hidden="true">
        {["/edu/zodiac/pisces.svg", "/edu/buddy-done.svg", "/edu/cast-6.svg"].map((src) => (
          <span key={src} className="z-peek"><img src={src} alt="" /></span>
        ))}
      </div>
    </section>
  );
}

// ── Chân trang kiểu Duolingo: cột tiêu đề + liên kết, chỉ những trang Hugo Studio đang có ──
const WWW = "https://www.hugowishpax.studio";
// [khoá tiêu đề, [[khoá chữ, đường dẫn]]] — chữ ở eduCopy (footer.*); "/…" là trang trong Edu.
const FOOTER = [
  [["learn", [["start", "/learn"], ["common.login", "/login"], ["store", "/store"]]]],
  [["about", [["member", `${WWW}/member`], ["web", `${WWW}/`], ["portfolio", "https://portfolio.hugowishpax.studio"], ["student", `${WWW}/student-pricing`]]]],
  [["help", [["faq", `${WWW}/faq`], ["request", `${WWW}/support-request`], ["guide", `${WWW}/terms-and-guide`]]]],
  [
    ["legal", [["common.terms", "/terms"], ["common.privacy", "/privacy"]]],
    ["social", STUDIO_SOCIAL_LINKS.map((s) => [s.labelKey === "socialGroupChat" ? "groupChat" : `=${s.fallbackLabel}`, s.href])],
  ],
];
// Khoá có dấu chấm là khoá đầy đủ; "=Tên" là tên riêng giữ nguyên (TikTok, Instagram…).
const footerLabel = (t, key) => (key.startsWith("=") ? key.slice(1) : t(key.includes(".") ? key : `footer.${key}`));

function EduFooter() {
  const { t, lang } = useEduText();
  return (
    <footer className="edu-footer">
      <div className="edu-footer-cols">
        {FOOTER.map((column, i) => (
          <div key={i}>
            {column.map(([title, links]) => (
              <section key={title}>
                <h3>{t(`footer.${title}`)}</h3>
                {links.map(([label, href]) => href.startsWith("/")
                  ? <Link key={label} to={href}>{footerLabel(t, label)}</Link>
                  : <a key={label} href={href} target="_blank" rel="noopener">{footerLabel(t, label)}</a>)}
              </section>
            ))}
          </div>
        ))}
      </div>
      {/* Như Duolingo: hàng ngôn ngữ hiển thị — mỗi ngôn ngữ một địa chỉ riêng (/, /en, /zh) để chia sẻ và Google đọc được. */}
      <div className="edu-footer-langs">
        <b>{t("footer.language")}</b>
        <nav>
          {EDU_LANGS.map(({ code, label, path }) => (
            <Link key={code} to={path} lang={code} aria-current={code === lang ? "true" : undefined} onClick={() => changeAppLanguage(code)}>{label}</Link>
          ))}
        </nav>
      </div>
      <div className="edu-footer-bottom">
        <b>EDUCATION HUGO</b>
        <span>{t("footer.of")} <HugoLogo className="h-4 w-4" aria-hidden="true" /> Hugo Studio · {t("footer.nonprofit")} · © {new Date().getFullYear()}</span>
        <small className="edu-footer-note">{t("footer.disclaimer")}</small>
      </div>
    </footer>
  );
}

export default function EduLanding() {
  const { t } = useEduText();
  const sentinel = useRef(null);
  const [pastHero, setPastHero] = useState(false);
  const root = useRef(null);
  const still = useReducedMotion();
  // Nền chuyển màu mượt giữa các khối (trắng → xanh trời → xanh đêm) thay vì cắt ngang:
  // đọc màu nền thật của từng khối (đúng cả chế độ tối), làm khối trong suốt, rồi khối
  // nào đang chiếm giữa màn hình thì nền chung chuyển sang màu đó.
  useLayoutEffect(() => {
    const landing = root.current;
    if (still || !landing) return undefined;
    const sections = [...landing.querySelectorAll(":scope > section")];
    const colors = sections.map((el) => getComputedStyle(el).backgroundColor);
    const base = getComputedStyle(landing.closest(".edu") || document.body).backgroundColor;
    const ctx = gsap.context(() => {
      landing.classList.add("is-tinted");
      gsap.set(landing, { backgroundColor: base });
      sections.forEach((el, i) => {
        const color = colors[i] === "rgba(0, 0, 0, 0)" ? base : colors[i];
        ScrollTrigger.create({
          trigger: el,
          start: "top 55%",
          end: "bottom 55%",
          onToggle: (self) => self.isActive && gsap.to(landing, { backgroundColor: color, duration: 0.7, ease: "power1.inOut", overwrite: true }),
        });
      });
    });
    return () => { ctx.revert(); landing.classList.remove("is-tinted"); landing.style.backgroundColor = ""; };
  }, [still]);
  // Như Duolingo: qua khỏi màn đầu thì thanh trên mọc nút "Bắt đầu".
  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => setPastHero(!entry.isIntersecting),
      { threshold: 0 });
    if (sentinel.current) observer.observe(sentinel.current);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={root} className="edu-landing">
      <header className="edu-landing-top">
        <EduBrand to="/" />
        {pastHero
          ? <Link className="edu-btn" to="/learn">{t("landing.start")}</Link>
          : <Link className="edu-btn edu-btn--ghost" to="/login">{t("common.login")}</Link>}
      </header>
      <span ref={sentinel} className="edu-sentinel" aria-hidden="true" />

      <main>
        <Hero />
        <FeatureFree />
        <FeatureDo />
        <FeatureCourses />
        <Anywhere />
        <Final />
      </main>

      <EduFooter />
    </div>
  );
}
