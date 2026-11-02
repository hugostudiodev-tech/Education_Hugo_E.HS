import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/apiBase";
import { GemIcon, gemText } from "./gems";
import { EDU_CAST, streakPush } from "../../packages/shared/eduStreak";
import { StreakChip } from "./EduStreak";
import { useEduText } from "./eduText";
import AnimIcon from "../components/icons/animated/AnimIcon";
import { playEduSound } from "./eduSound";
import { setEduCourse, useEduCourse } from "./useEduCourse";
import { courseOfStep } from "../../packages/courses/courseOfStep.js";

/**
 * Thanh trên Education Hugo — 4 ô kiểu Duolingo: khoá học · chuỗi lửa · Ngọc · thông báo.
 * Mỗi ô (trừ chuỗi lửa) mở một bảng nhỏ ngay dưới thanh; bấm ra ngoài là đóng.
 */
const COURSES = [
  { id: "coding", cast: 1, ready: true, total: 26 },
  { id: "sql", cast: 6, ready: true, total: 40 }, // packages/courses/sql
  { id: "python", cast: 5, ready: true, total: 40 }, // packages/courses/python — số step đã mở
  { id: "python-advanced", cast: 5, ready: true, total: 40 },
  { id: "quan", cast: 3, ready: false }, // khoá 2 "Quán" — docs/khoa-2-quan.md
];

function usePopover() {
  const [open, setOpen] = useState(null);
  const ref = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (event) => !ref.current?.contains(event.target) && setOpen(null);
    const esc = (event) => event.key === "Escape" && setOpen(null);
    document.addEventListener("pointerdown", close);
    document.addEventListener("keydown", esc);
    return () => { document.removeEventListener("pointerdown", close); document.removeEventListener("keydown", esc); };
  }, [open]);
  return { open, setOpen, ref, toggle: (id) => setOpen((cur) => (cur === id ? null : id)) };
}


function CoursePanel({ learner, onPick }) {
  const { t } = useEduText();
  const current = useEduCourse();
  const done = learner?.completedLessons || [];
  // Step khoá SQL mang id "sqlN", Python "pyN", Coding "stepN".
  const doneIn = (id) => done.filter((s) => courseOfStep(s) === id).length;
  return (
    <div className="edu-pop" role="dialog" aria-label={t("topbar.courses")}>
      <h3>{t("topbar.courses")}</h3>
      {COURSES.map((course) => (
        <button key={course.id} type="button" disabled={!course.ready} onClick={() => onPick(course.id)}
          className={`edu-pop-course${course.id === current ? " is-on" : ""}`} aria-pressed={course.id === current}>
          <img src={`/edu/cast-${course.cast}.svg`} alt="" width="44" height="44" />
          <span>
            <b>{t(`topbar.course.${course.id}`)}</b>
            <small>{course.ready ? t("topbar.courseProgress", { done: doneIn(course.id), total: course.total }) : t("map.soon")}</small>
          </span>
          {course.id === current && <AnimIcon name="check" className="edu-pop-check" />}
        </button>
      ))}
      <button type="button" className="edu-pop-add" disabled>
        <AnimIcon name="add" />{t("topbar.addCourse")}
      </button>
    </div>
  );
}

function JoyPanel({ learner }) {
  const { t } = useEduText();
  return (
    <div className="edu-pop" role="dialog" aria-label={gemText(0).replace(/^0 /, "")}>
      <div className="edu-pop-joy"><GemIcon size={48} /><b>{gemText(learner?.gems || 0)}</b></div>
      <p>{t("topbar.joyBody")}</p>
      <Link className="edu-btn" to="/store">{t("topbar.toStore")}</Link>
    </div>
  );
}

/** Chữ một thông báo theo ngôn ngữ người đọc (khoá STREAK_PUSH), hoặc chữ admin viết sẵn. */
function textOf(item, lang) {
  const text = item.key && streakPush(lang, item.key, item.params || {});
  return text ? { title: text.title, message: text.body } : { title: item.title, message: item.message };
}

// Mỗi loại thông báo một ô 3D màu riêng + icon động.
// Thông báo của Edu: mỗi loại một nhân vật (giống thư Duolingo luôn có Duo), loại khác giữ ô icon.
const castOf = (item) => EDU_CAST[item.key];

const ICON = { gems: ["gift", "gold"], security: ["shield", "red"], system: ["sparkles", "blue"], verification: ["check", "green"], general: ["bell", "orange"], wellness: ["heart", "pink"] };

function BellPanel({ items, onOpenItem, onReadAll }) {
  const { t, lang } = useEduText();
  return (
    <div className="edu-pop edu-pop-bell" role="dialog" aria-label={t("topbar.notifications")}>
      <header>
        <h3>{t("topbar.notifications")}</h3>
        {items?.some((item) => !item.read) && <button type="button" onClick={onReadAll}>{t("topbar.readAll")}</button>}
      </header>
      {!items ? <p className="edu-pop-empty">{t("common.loading")}…</p>
        : !items.length ? (
          <div className="edu-pop-empty"><img src="/edu/buddy-learn.svg" alt="" width="72" height="72" /><p>{t("topbar.empty")}</p></div>
        ) : (
          <ul>
            {items.map((item) => {
              const text = textOf(item, lang);
              return (
                <li key={item._id}>
                  <button type="button" className={item.read ? "" : "is-unread"} onClick={() => onOpenItem(item)}>
                    {castOf(item)
                      ? <img className="edu-note-cast" src={`/edu/${castOf(item)}.svg`} alt="" width="46" height="46" />
                      : <span className={`edu-note-tile is-${(ICON[item.category] || ICON.general)[1]}`}><AnimIcon name={(ICON[item.category] || ICON.general)[0]} size={22} /></span>}
                    <span><b>{text.title}</b>{text.message && <small>{text.message}</small>}<time>{new Date(item.createdAt).toLocaleString(lang, { dateStyle: "short", timeStyle: "short" })}</time></span>
                  </button>
                </li>
              );
            })}
          </ul>
        )}
    </div>
  );
}

/** Hộp thông báo dùng chung cho mọi thanh 4 ô (điện thoại + cột phải) — tải một lần. */
export function useEduInbox(signedIn) {
  const navigate = useNavigate();
  const [items, setItems] = useState(null);
  const [unread, setUnread] = useState(0);
  const load = useCallback(() => {
    if (!signedIn) return;
    fetch(`${API_BASE}/inbox?limit=30`, { credentials: "include" })
      .then((r) => (r.ok ? r.json() : Promise.reject()))
      .then((data) => { setItems(data.notifications || []); setUnread(data.unreadCount || 0); })
      .catch(() => setItems((cur) => cur || []));
  }, [signedIn]);
  useEffect(() => { load(); }, [load]);
  const patch = (path) => fetch(`${API_BASE}/inbox/${path}`, { method: "PATCH", credentials: "include" }).catch(() => {});
  const openItem = (item) => {
    if (!item.read) { patch(`${item._id}/read`); setUnread((n) => Math.max(0, n - 1)); setItems((all) => all.map((x) => (x._id === item._id ? { ...x, read: true } : x))); }
    const url = item.actionUrl || "";
    if (url.startsWith("/") && !url.startsWith("/member")) navigate(url);
    else if (url) window.open(url.startsWith("/") ? `https://www.hugowishpax.studio${url}` : url, "_blank", "noopener");
  };
  const readAll = () => { patch("read-all"); setUnread(0); setItems((all) => (all || []).map((x) => ({ ...x, read: true }))); };
  return { items, unread, load, openItem, readAll };
}

export default function EduTopBar({ learner, signedIn, inbox }) {
  const { t } = useEduText();
  const navigate = useNavigate();
  const pop = usePopover();
  const { items, unread } = inbox;
  const streak = learner?.edu?.streak;
  // Có thông báo chưa đọc: chuông tự rung vài giây một lần (không hiện con số).
  const bell = useRef(null);
  useEffect(() => {
    if (!unread) return undefined;
    bell.current?.startAnimation();
    const timer = setInterval(() => bell.current?.startAnimation(), 4000);
    return () => clearInterval(timer);
  }, [unread]);
  const openItem = (item) => { pop.setOpen(null); inbox.openItem(item); };
  // Nhấn ô Ngọc: viên ngọc xoay một vòng và nảy lên (Web Animations, không thư viện).
  const flipCoin = (event) => event.currentTarget.querySelector(".edu-gem")?.animate(
    [{ transform: "rotateY(0) translateY(0)" }, { transform: "rotateY(180deg) translateY(-6px)" }, { transform: "rotateY(360deg) translateY(0)" }],
    { duration: 600, easing: "cubic-bezier(.3,1.4,.5,1)" },
  );
  const course = useEduCourse();
  const readAll = inbox.readAll;
  const loadInbox = inbox.load;

  return (
    <div className="edu-topbar" ref={pop.ref}>
      <button type="button" className="edu-chip" onClick={() => pop.toggle("course")} aria-expanded={pop.open === "course"} aria-label={t("topbar.courses")}>
        <img className="edu-chip-course" src={`/edu/cast-${COURSES.find((c) => c.id === course)?.cast || 1}.svg`} alt="" width="30" height="30" />
      </button>
      {signedIn && streak
        ? <StreakChip streak={streak} onOpen={() => navigate("/streak")} />
        : <Link className="edu-chip" to="/login" aria-label={t("streak.title")}><span className="material-symbols-outlined edu-chip-icon edu-tone-orange" aria-hidden="true">local_fire_department</span><b>0</b></Link>}
      <button type="button" className="edu-chip edu-joy" onPointerDown={flipCoin} onClick={() => (signedIn ? pop.toggle("joy") : navigate("/login"))} aria-expanded={pop.open === "joy"} aria-label={t("shell.balance", { joy: gemText(learner?.gems || 0) })}>
        <GemIcon /><b>{gemText(learner?.gems || 0, { unit: false })}</b>
      </button>
      <button type="button" className="edu-chip edu-bell" onClick={() => (signedIn ? (pop.toggle("bell"), pop.open !== "bell" && loadInbox()) : navigate("/login"))} aria-expanded={pop.open === "bell"} aria-label={unread > 0 ? `${t("topbar.notifications")} (${unread})` : t("topbar.notifications")}>
        <AnimIcon ref={bell} name="bell" size={30} className={unread > 0 ? "has-new" : ""} />
        {unread > 0 && <span className="edu-bell-count" aria-hidden="true">{unread > 99 ? "99+" : unread}</span>}
      </button>
      {pop.open === "course" && <CoursePanel learner={learner} onPick={(id) => { pop.setOpen(null); playEduSound("whoosh"); setEduCourse(id); navigate("/learn"); }} />}
      {pop.open === "joy" && <JoyPanel learner={learner} />}
      {pop.open === "bell" && <BellPanel items={items} onOpenItem={openItem} onReadAll={readAll} />}
    </div>
  );
}
