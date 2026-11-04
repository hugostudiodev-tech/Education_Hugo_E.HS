import { useCallback, useEffect, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { QRCodeSVG } from "qrcode.react";
import { notify } from "../lib/notify";
import { API_BASE } from "../config/apiBase";
import { readCache, writeCache } from "../lib/offlineCache";
import { PersonaAvatar } from "./EduPersona";
import { useEduText } from "./eduText";
import { playEduSound } from "./eduSound";
import { EduSkeleton } from "./EduStatus";

/**
 * Bạn bè kiểu Duolingo (API /api/social, services/social.js — kết bạn hai chiều có duyệt):
 *  /friends       danh sách Bạn bè | Lời mời
 *  /friends/find  Tìm bạn bè: tìm theo biệt danh/mã/email, chia sẻ liên kết, gợi ý
 *  /u/:code       hồ sơ công khai
 * ProfileSocial gắn vào trang Hồ sơ của chính mình: nút Thêm bạn + QR, Tổng quan, Streak bạn bè, Thành tích.
 */
const PROFILE_URL = (code) => `${window.location.origin}/u/${code}`;
const CACHE = "social";

async function call(path, init) {
  const response = await fetch(`${API_BASE}/social${path ? `/${path}` : ""}`, { credentials: "include", ...init, headers: { "Content-Type": "application/json" } });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw Object.assign(new Error(body.error || body.code || "FAILED"), { code: body.code, status: response.status });
  return body;
}

/** Dữ liệu bạn bè: hiện ngay bản lưu máy (không giật), rồi làm mới từ máy chủ. */
export function useSocial() {
  const [data, setData] = useState(() => readCache(CACHE));
  const load = useCallback(() => call("").then((d) => { setData(d); writeCache(CACHE, d); }).catch(() => setData((cur) => cur || { failed: true })), []);
  useEffect(() => { load(); }, [load]);
  const act = async (path, init) => {
    try { await call(path, init); await load(); return true; } catch (error) { notify.error(error.message); return false; }
  };
  return { data, act, load };
}

async function shareLink(code, t) {
  const url = PROFILE_URL(code);
  try {
    if (navigator.share) await navigator.share({ title: "Education Hugo", url });
    else { await navigator.clipboard.writeText(url); notify.success(t("friends.copied")); }
  } catch { /* người dùng huỷ */ }
}

/** Thẻ QR (mở từ nút QR ở Hồ sơ): tên, @mã, QR có nhân vật ở giữa, Chia sẻ / Sao chép. */
export function QrSheet({ name, code, onClose }) {
  const { t } = useEduText();
  const copy = () => navigator.clipboard?.writeText(PROFILE_URL(code)).then(() => notify.success(t("friends.copied"))).catch(() => {});
  return (
    <div className="fr-sheet-backdrop" role="presentation" onClick={onClose}>
      <div className="fr-qr" role="dialog" aria-modal="true" aria-label={t("friends.myQr")} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="fr-x" onClick={onClose} aria-label={t("common.close")}><span className="material-symbols-outlined" aria-hidden="true">close</span></button>
        <b className="nick-font">{name}</b>
        <small translate="no">@{code}</small>
        <QRCodeSVG value={PROFILE_URL(code)} size={220} level="H" bgColor="transparent" fgColor="#3c3c3c"
          imageSettings={{ src: "/edu/buddy-learn.svg", height: 52, width: 52, excavate: true }} />
        <span className="fr-qr-brand">education hugo</span>
        <div className="fr-qr-actions">
          <button type="button" onClick={() => shareLink(code, t)}><span className="material-symbols-outlined" aria-hidden="true">ios_share</span>{t("friends.shareShort")}</button>
          <button type="button" onClick={copy}><span className="material-symbols-outlined" aria-hidden="true">link</span>{t("friends.copyLink")}</button>
        </div>
      </div>
    </div>
  );
}

// Thành tích: cấp = số mốc đã vượt. Ảnh là nhân vật của Education Hugo.
const ACHIEVEMENTS = [
  { key: "streak", art: "/edu/cast-3.svg", goals: [3, 7, 14, 30, 60, 100, 365] },
  { key: "steps", art: "/edu/buddy-practice.svg", goals: [1, 5, 10, 20, 40, 80] },
  { key: "friends", art: "/edu/cast-5.svg", goals: [1, 3, 5, 10, 25, 50] },
  { key: "gems", art: "/edu/cast-7.svg", goals: [100, 500, 1000, 2000, 5000, 10000] },
];

export function Achievements({ values }) {
  const { t } = useEduText();
  const items = ACHIEVEMENTS.filter((a) => values[a.key] !== undefined);
  return (
    <>
      <h2 className="fr-h">{t("friends.achievements")}</h2>
      <ul className="fr-ach">
        {items.map((a) => {
          const cur = values[a.key] || 0;
          const level = a.goals.filter((g) => cur >= g).length;
          const goal = a.goals[Math.min(level, a.goals.length - 1)];
          return (
            <li key={a.key} className={level ? "" : "is-locked"} title={t(`friends.achHint.${a.key}`, { cur, goal })}>
              <span className="fr-ach-art"><img src={a.art} alt="" width="72" height="72" loading="lazy" /><b>{level ? a.goals[level - 1] : 0}</b></span>
              <strong>{t(`friends.ach.${a.key}`)}</strong>
              <i className="fr-bar"><i style={{ width: `${Math.min(100, (cur / goal) * 100)}%` }} /></i>
              <small>{t(`friends.achHint.${a.key}`, { cur, goal })}</small>
            </li>
          );
        })}
      </ul>
    </>
  );
}

function Overview({ streak, xp, rank, steps }) {
  const { t } = useEduText();
  return (
    <>
      <h2 className="fr-h">{t("friends.overview")}</h2>
      <div className="fr-overview">
        <span><i className="material-symbols-outlined is-fire" aria-hidden="true">local_fire_department</i>{t("friends.days", { n: streak })}</span>
        <span><i className="material-symbols-outlined is-xp" aria-hidden="true">bolt</i>{xp} XP</span>
        <span><i className="material-symbols-outlined is-rank" aria-hidden="true">trophy</i>{rank ? t("friends.rank", { n: rank }) : t("friends.noRank")}</span>
        <span><i className="material-symbols-outlined is-step" aria-hidden="true">task_alt</i>{t("friends.stepsN", { n: steps })}</span>
      </div>
    </>
  );
}

/** Phần mạng xã hội trong Hồ sơ của chính mình (gắn dưới ảnh nhân vật). */
export function ProfileSocial({ learner, name, steps }) {
  const { t } = useEduText();
  const { data } = useSocial();
  const [qr, setQr] = useState(false);
  if (!data) return <div className="fr-skel"><span className="edu-skel is-line" /><span className="edu-skel is-card" /><span className="edu-skel is-card" /></div>;
  const friends = (data.friends || []).filter((r) => !r.me);
  const rankIndex = (data.league || []).findIndex((r) => r.me);
  const slots = [...friends].sort((a, b) => b.streak - a.streak).slice(0, 5);
  return (
    <>
      {data.code && <small className="fr-handle" translate="no">@{data.code}</small>}
      <Link to="/friends" className="fr-count">{t("friends.friendCount", { n: friends.length })}{data.requestsIn?.length > 0 && <i>{data.requestsIn.length}</i>}</Link>
      <div className="fr-cta">
        <Link to="/friends/find" className="edu-btn"><span className="material-symbols-outlined" aria-hidden="true">person_add</span>{t("friends.addFriends")}</Link>
        {data.code && <button type="button" className="edu-btn edu-btn--ghost fr-qr-btn" onClick={() => setQr(true)} aria-label={t("friends.myQr")}><span className="material-symbols-outlined" aria-hidden="true">qr_code_2</span></button>}
      </div>
      {qr && <QrSheet name={name} code={data.code} onClose={() => setQr(false)} />}
      <Overview streak={learner?.edu?.streak?.count ?? data.me?.streak ?? 0} xp={data.me?.xp || 0} rank={rankIndex >= 0 ? rankIndex + 1 : 0} steps={steps} />
      <h2 className="fr-h">{t("friends.friendStreak")}</h2>
      <div className="fr-slots">
        {Array.from({ length: 5 }, (_, i) => (slots[i]
          ? <Link key={slots[i].code} to={`/u/${slots[i].code}`} className="fr-slot" title={slots[i].name}><PersonaAvatar avatar={slots[i].avatar} name={slots[i].name} size={56} /><small><i className="material-symbols-outlined" aria-hidden="true">local_fire_department</i>{slots[i].streak}</small></Link>
          : <Link key={`empty-${i}`} to="/friends/find" className="fr-slot is-empty" aria-label={t("friends.addFriends")}><span className="material-symbols-outlined" aria-hidden="true">add</span></Link>))}
      </div>
      <Achievements values={{ streak: learner?.edu?.streak?.best ?? learner?.edu?.streak?.count ?? 0, steps: (learner?.completedLessons || []).length, friends: friends.length, gems: learner?.gems || 0 }} />
    </>
  );
}

function PersonRow({ row, children }) {
  return (
    <li className="fr-row">
      <Link to={`/u/${row.code}`} className="fr-row-main">
        <PersonaAvatar avatar={row.avatar} name={row.name} size={56} />
        <span><b className="nick-font">{row.name}</b><small><i className="material-symbols-outlined" aria-hidden="true">local_fire_department</i>{row.streak} · {row.xp} XP</small></span>
      </Link>
      {children || <span className="material-symbols-outlined fr-chev" aria-hidden="true">chevron_right</span>}
    </li>
  );
}

function PageHead({ title, close }) {
  const navigate = useNavigate();
  const back = () => (window.history.state?.idx > 0 ? navigate(-1) : navigate("/profile", { replace: true }));
  const { t } = useEduText();
  return (
    <header className="fr-top">
      <button type="button" className="fr-x" onClick={back} aria-label={t("common.close")}><span className="material-symbols-outlined" aria-hidden="true">{close ? "close" : "arrow_back"}</span></button>
      <h1>{title}</h1>
    </header>
  );
}

/** /friends — Bạn bè | Lời mời. */
export default function EduFriends() {
  const { t } = useEduText();
  const { data, act } = useSocial();
  const [tab, setTab] = useState("friends");
  if (!data) return <EduSkeleton rows={6} />;
  if (data.failed) return <section className="edu-page"><p className="fr-empty">{t("friends.failed")}</p></section>;
  const friends = (data.friends || []).filter((r) => !r.me);
  const ins = data.requestsIn || [];
  const outs = data.requestsOut || [];
  const accept = (code) => act(`friends/${code}/accept`, { method: "POST" }).then((ok) => ok && playEduSound("success"));
  return (
    <section className="edu-page fr">
      <PageHead title={t("friends.title")} />
      <div className="fr-tabs" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "friends"} onClick={() => setTab("friends")}>{t("friends.title")}</button>
        <button type="button" role="tab" aria-selected={tab === "requests"} onClick={() => setTab("requests")}>{t("friends.tabRequests")}{ins.length > 0 && <i>{ins.length}</i>}</button>
      </div>
      {tab === "friends" ? (
        friends.length ? <ul className="fr-list">{friends.map((row) => <PersonRow key={row.code} row={row} />)}</ul>
          : <div className="fr-empty"><p>{t("friends.friendsEmpty")}</p><Link className="edu-btn" to="/friends/find">{t("friends.addFriends")}</Link></div>
      ) : (
        <ul className="fr-list">
          {ins.map((row) => (
            <PersonRow key={row.code} row={row}>
              <span className="fr-actions">
                <button type="button" className="edu-btn fr-sq" onClick={() => accept(row.code)} aria-label={t("friends.accept")}><span className="material-symbols-outlined" aria-hidden="true">check</span></button>
                <button type="button" className="edu-btn edu-btn--ghost fr-sq" onClick={() => act(`friends/${row.code}/decline`, { method: "POST" })} aria-label={t("friends.decline")}><span className="material-symbols-outlined" aria-hidden="true">close</span></button>
              </span>
            </PersonRow>
          ))}
          {outs.map((row) => (
            <PersonRow key={row.code} row={row}>
              <button type="button" className="edu-btn edu-btn--ghost" onClick={() => act(`friends/${row.code}`, { method: "DELETE" })}>{t("friends.cancel")}</button>
            </PersonRow>
          ))}
          {!ins.length && !outs.length && <p className="fr-empty">—</p>}
        </ul>
      )}
    </section>
  );
}

/**
 * Quét QR ngay trong app (camera hệ thống luôn mở trình duyệt, không mở PWA).
 * BarcodeDetector nếu có (Android), không thì jsQR (iOS) — chỉ tải khi mở máy quét.
 */
function Scanner({ onCode, onClose }) {
  const { t } = useEduText();
  const video = useRef(null);
  useEffect(() => {
    let stream; let stop = false;
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d", { willReadFrequently: true });
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
        video.current.srcObject = stream;
        await video.current.play();
        const native = "BarcodeDetector" in window ? new window.BarcodeDetector({ formats: ["qr_code"] }) : null;
        const jsQR = native ? null : (await import("jsqr")).default;
        while (!stop) {
          let raw = "";
          const v = video.current;
          if (native) raw = (await native.detect(v).catch(() => []))[0]?.rawValue || "";
          else if (v.videoWidth) {
            canvas.width = v.videoWidth; canvas.height = v.videoHeight;
            ctx.drawImage(v, 0, 0);
            raw = jsQR(ctx.getImageData(0, 0, canvas.width, canvas.height).data, canvas.width, canvas.height)?.data || "";
          }
          const code = raw.match(/\/u\/([A-Z0-9]{6})/i)?.[1] || (/^[A-Z0-9]{6}$/i.test(raw) ? raw : null);
          if (code) { playEduSound("success"); onCode(code.toUpperCase()); return; }
          await new Promise((r) => setTimeout(r, 250));
        }
      } catch { notify.error(t("friends.scanFailed")); onClose(); }
    })();
    return () => { stop = true; stream?.getTracks().forEach((track) => track.stop()); };
  }, [onCode, onClose, t]);
  return (
    <div className="fr-scan" role="dialog" aria-modal="true" aria-label={t("friends.scan")}>
      <video ref={video} playsInline muted />
      <span className="fr-scan-frame" aria-hidden="true" />
      <button type="button" className="edu-btn" onClick={onClose}>{t("common.close")}</button>
    </div>
  );
}

const HIDDEN = "edu.suggestHidden";
const readHidden = () => { try { return JSON.parse(localStorage.getItem(HIDDEN) || "[]"); } catch { return []; } };

/** /friends/find — tìm, chia sẻ liên kết, gợi ý kết bạn. */
export function EduFindFriends() {
  const { t } = useEduText();
  const { data, act } = useSocial();
  const [q, setQ] = useState("");
  const [results, setResults] = useState(null);
  const [hidden, setHidden] = useState(readHidden);
  const [scanning, setScanning] = useState(false);
  const navigate = useNavigate();
  const onScanned = useCallback((code) => { setScanning(false); navigate(`/u/${code}`); }, [navigate]);
  const closeScan = useCallback(() => setScanning(false), []);
  useEffect(() => {
    const query = q.trim();
    if (query.length < 2) { setResults(null); return undefined; }
    const timer = setTimeout(() => call(`search?q=${encodeURIComponent(query)}`).then((d) => setResults(d.results || [])).catch(() => setResults([])), 300);
    return () => clearTimeout(timer);
  }, [q]);
  const add = (code) => act("friends", { method: "POST", body: JSON.stringify({ code }) }).then((ok) => ok && notify.success(t("friends.sent")));
  const hide = (code) => { const next = [...hidden, code]; setHidden(next); try { localStorage.setItem(HIDDEN, JSON.stringify(next)); } catch { /* bỏ qua */ } };
  const known = new Set([...(data?.friends || []), ...(data?.requestsOut || []), ...(data?.requestsIn || [])].map((r) => r.code));
  const seen = new Set();
  const suggestions = [...(data?.league || []), ...(data?.classmates || [])]
    .filter((r) => r.code && !r.me && !known.has(r.code) && !hidden.includes(r.code) && r.name !== "Hugo learner" && !seen.has(r.code) && seen.add(r.code))
    .slice(0, 12);
  return (
    <section className="edu-page fr">
      <PageHead title={t("friends.findTitle")} close />
      <label className="fr-option fr-search">
        <span className="material-symbols-outlined is-search" aria-hidden="true">search</span>
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={t("friends.searchPlaceholder")} aria-label={t("friends.searchPlaceholder")} autoComplete="off" spellCheck={false} />
      </label>
      {results && (results.length ? (
        <ul className="fr-list">
          {results.map((row) => (
            <PersonRow key={row.code} row={row}>
              {known.has(row.code) ? <span className="material-symbols-outlined fr-chev" aria-hidden="true">check</span>
                : <button type="button" className="edu-btn fr-sq" onClick={() => add(row.code)} aria-label={t("friends.add")}><span className="material-symbols-outlined" aria-hidden="true">person_add</span></button>}
            </PersonRow>
          ))}
        </ul>
      ) : <p className="fr-empty">{t("friends.noResults")}</p>)}
      {navigator.mediaDevices?.getUserMedia && (
        <button type="button" className="fr-option" onClick={() => setScanning(true)}>
          <span className="material-symbols-outlined is-search" aria-hidden="true">qr_code_scanner</span>
          <b>{t("friends.scan")}</b>
        </button>
      )}
      {scanning && <Scanner onCode={onScanned} onClose={closeScan} />}
      {data?.code && (
        <button type="button" className="fr-option" onClick={() => shareLink(data.code, t)}>
          <span className="fr-option-art"><PersonaAvatar avatar={data.me?.avatar} name={data.me?.name} size={48} /><i className="material-symbols-outlined" aria-hidden="true">ios_share</i></span>
          <b>{t("friends.shareLink")}</b>
        </button>
      )}
      {!data ? <div className="fr-skel"><span className="edu-skel is-card" /></div> : suggestions.length > 0 && (
        <>
          <h2 className="fr-h">{t("friends.suggest")}</h2>
          <ul className="fr-suggest">
            {suggestions.map((row) => (
              <li key={row.code}>
                <button type="button" className="fr-suggest-x" onClick={() => hide(row.code)} aria-label={t("common.close")}><span className="material-symbols-outlined" aria-hidden="true">close</span></button>
                <Link to={`/u/${row.code}`}><PersonaAvatar avatar={row.avatar} name={row.name} size={64} /><b className="nick-font">{row.name}</b><small>{row.xp} XP</small></Link>
                <button type="button" className="edu-btn" onClick={() => add(row.code)}>{t("friends.add")}</button>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}

const REPORT_REASONS = ["nickname", "avatar", "intro", "harassment", "cheating", "other"];

function ReportSheet({ code, name, onClose }) {
  const { t } = useEduText();
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const send = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await call("report", { method: "POST", body: JSON.stringify({ code, reason, note }) });
      notify.success(t("friends.reportSent"));
      onClose();
    } catch (error) { notify.error(error.message); } finally { setBusy(false); }
  };
  return (
    <div className="fr-sheet-backdrop" role="presentation" onClick={onClose}>
      <form className="fr-sheet" role="dialog" aria-modal="true" aria-labelledby="fr-report-title" onSubmit={send} onClick={(e) => e.stopPropagation()}>
        <h2 id="fr-report-title">{t("friends.reportTitle", { name })}</h2>
        <p>{t("friends.reportBody")}</p>
        <div className="fr-reasons" role="radiogroup">
          {REPORT_REASONS.map((key) => (
            <label key={key} className={reason === key ? "is-on" : ""}>
              <input type="radio" name="reason" value={key} checked={reason === key} onChange={() => setReason(key)} />
              {t(`friends.reasons.${key}`)}
            </label>
          ))}
        </div>
        <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={500} rows={3} placeholder={t("friends.reportNote")} />
        <div className="fr-cta">
          <button type="button" className="edu-btn edu-btn--ghost" onClick={onClose}>{t("common.close")}</button>
          <button type="submit" className="edu-btn" disabled={busy || !reason}>{t("friends.reportSend")}</button>
        </div>
      </form>
    </div>
  );
}

/** /u/:code — hồ sơ công khai, cùng bố cục với Hồ sơ của mình. */
export function EduPublicProfile() {
  const { t, lang } = useEduText();
  const { code } = useParams();
  const [p, setP] = useState(null);
  const [reporting, setReporting] = useState(false);
  const load = useCallback(() => call(`profile/${encodeURIComponent(code)}`).then(setP).catch((e) => setP({ missing: e.status === 404, failed: true })), [code]);
  useEffect(() => { setP(null); load(); }, [load]);
  const act = async (path, init) => { try { await call(path, init); playEduSound("success"); load(); } catch (error) { notify.error(error.message); } };
  if (!p) return <EduSkeleton rows={4} avatar />;
  if (p.failed) return <section className="edu-page fr"><PageHead title="" /><p className="fr-empty">{t(p.missing ? "friends.notFound" : "friends.failed")}</p></section>;
  const button = {
    self: <Link className="edu-btn edu-btn--ghost" to="/profile">{t("friends.editMine")}</Link>,
    friend: <button type="button" className="edu-btn edu-btn--ghost" onClick={async () => { if (await notify.confirm({ title: t("friends.removeAsk") })) act(`friends/${p.code}`, { method: "DELETE" }); }}><span className="material-symbols-outlined" aria-hidden="true">how_to_reg</span>{t("friends.isFriend")}</button>,
    out: <button type="button" className="edu-btn edu-btn--ghost" onClick={() => act(`friends/${p.code}`, { method: "DELETE" })}>{t("friends.cancel")}</button>,
    in: <button type="button" className="edu-btn" onClick={() => act(`friends/${p.code}/accept`, { method: "POST" })}>{t("friends.accept")}</button>,
    none: <button type="button" className="edu-btn" onClick={() => act("friends", { method: "POST", body: JSON.stringify({ code: p.code }) })}><span className="material-symbols-outlined" aria-hidden="true">person_add</span>{t("friends.add")}</button>,
    guest: <Link className="edu-btn" to={`/login?next=${encodeURIComponent(`/u/${p.code}`)}`}><span className="material-symbols-outlined" aria-hidden="true">person_add</span>{t("friends.add")}</Link>,
  }[p.relation];
  return (
    <section className="edu-page edu-me fr">
      <PageHead title={p.name} />
      <div className="edu-me-hero">
        <span className="edu-me-avatar"><PersonaAvatar avatar={p.avatar} name={p.name} size={112} /></span>
        <b className="nick-font">{p.name}</b>
        <small className="fr-handle" translate="no">@{p.code}</small>
        {p.joined && <small>{t("friends.joined", { date: new Date(p.joined).toLocaleDateString(lang, { month: "long", year: "numeric" }) })} · {t("friends.friendCount", { n: p.friends })}</small>}
        {p.intro && <p>{p.intro}</p>}
      </div>
      <div className="fr-cta">{button}</div>
      <Overview streak={p.streak} xp={p.xp} rank={0} steps={p.steps} />
      <Achievements values={{ streak: p.streak, steps: p.steps, friends: p.friends }} />
      {!["self", "guest"].includes(p.relation) && (
        <button type="button" className="fr-report" onClick={() => setReporting(true)}>
          <span className="material-symbols-outlined" aria-hidden="true">flag</span>{t("friends.report")}
        </button>
      )}
      {reporting && <ReportSheet code={p.code} name={p.name} onClose={() => setReporting(false)} />}
    </section>
  );
}
