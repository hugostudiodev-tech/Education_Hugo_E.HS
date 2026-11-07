import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE } from "../../config/apiBase";
import { OUTLINE } from "../../../packages/courses/python/stages.js";

/**
 * /admin — quản trị Education Hugo. Đăng nhập kiểu Hugo Studio: nhập email, nhận mã 6 số
 * (Better Auth emailOTP ở /api/admin-auth, cookie edu-admin.*). Chỉ email trong ADMIN_EMAILS
 * nhận được mã. Phiên học (cookie edu.*) không mở được trang này.
 * ponytail: chỉ tiếng Việt — trang nội bộ.
 */
async function call(path, { method = "GET", body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method, credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data.error || data.message || `Lỗi ${res.status}`), { status: res.status });
  return data;
}

const fmt = (d) => (d ? new Date(d).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" }) : "—");
const Btn = ({ tone, ...p }) => (
  <button type="button" {...p} className={`min-h-[40px] rounded-lg px-3 text-[14px] font-semibold disabled:opacity-50 ${tone === "danger" ? "bg-red-600 text-white" : tone === "ghost" ? "border border-border text-foreground" : "bg-foreground text-background"} ${p.className || ""}`} />
);
const Input = (p) => <input {...p} className={`min-h-[40px] w-full rounded-lg border border-border bg-card px-3 text-[15px] text-foreground ${p.className || ""}`} />;
const Card = ({ children, className = "" }) => <div className={`rounded-xl border border-border bg-card p-4 ${className}`}>{children}</div>;

// ── Kênh trực tiếp: một EventSource cho cả trang (/admin/live, SSE từ change stream MongoDB) ──
// Sự kiện: learner {id, op, fields} · activity {dòng nhật ký học} · resync (vừa nối lại → tải lại hết).
const live = new EventTarget();
function useLiveConnection(enabled) {
  const [state, setState] = useState("connecting");
  useEffect(() => {
    if (!enabled) return undefined;
    let es, timer, opened = false;
    const fire = (type, detail) => live.dispatchEvent(new CustomEvent(type, { detail }));
    const connect = () => {
      es = new EventSource(`${API_BASE}/admin/live`, { withCredentials: true });
      for (const type of ["learner", "activity", "resync"]) es.addEventListener(type, (e) => fire(type, JSON.parse(e.data || "{}")));
      es.onopen = () => { setState("on"); if (opened) fire("resync", {}); opened = true; };
      // Mất mạng → EventSource tự nối lại. Server trả lỗi (502 khi Render deploy, 401) → nó bỏ hẳn, nên tự mở lại.
      es.onerror = () => { setState("connecting"); if (es.readyState === EventSource.CLOSED) timer = setTimeout(connect, 5000); };
    };
    connect();
    return () => { clearTimeout(timer); es.close(); };
  }, [enabled]);
  return state;
}
/** Nghe sự kiện trực tiếp; fn(type, detail). */
function useLive(types, fn) {
  const ref = useRef(fn);
  ref.current = fn;
  const key = types.join();
  useEffect(() => {
    const h = (e) => ref.current(e.type, e.detail);
    const list = key.split(",");
    list.forEach((t) => live.addEventListener(t, h));
    return () => list.forEach((t) => live.removeEventListener(t, h));
  }, [key]);
}
/** Gộp nhiều lần gọi dồn dập thành một (sự kiện tới liên tục khi người học đang làm bài). */
function useDebounced(fn, ms) {
  const ref = useRef(fn);
  ref.current = fn;
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  return useCallback(() => { clearTimeout(timer.current); timer.current = setTimeout(() => ref.current(), ms); }, [ms]);
}

// ponytail: cache RAM theo path — đổi tab hiện ngay dữ liệu lần trước, rồi tải lại nền.
const listCache = new Map();
/**
 * Tải một danh sách; reload() sau mỗi thao tác ghi.
 * `follow(type, detail, items)` → true thì tải lại (gộp trong 3 giây, giữ dưới giới hạn 120 lần/phút). Có follow thì tự tải lại khi nối lại kênh.
 */
function useList(path, follow) {
  const [state, setState] = useState(() => ({ items: listCache.get(path) ?? null, error: "" }));
  const reload = useCallback(() => {
    if (listCache.has(path)) setState({ items: listCache.get(path), error: "" });
    call(path).then((d) => { const items = d.items ?? d; listCache.set(path, items); setState({ items, error: "" }); }).catch((e) => setState((s) => ({ items: s.items ?? [], error: e.message })));
  }, [path]);
  useEffect(reload, [reload]);
  const later = useDebounced(reload, 3000);
  useLive(follow ? ["learner", "activity", "resync"] : [], (type, detail) => {
    if (type === "resync" || follow(type, detail, listCache.get(path) || [])) later();
  });
  const setItems = useCallback((fn) => setState((st) => { const items = fn(st.items || []); listCache.set(path, items); return { ...st, items }; }), [path]);
  return { ...state, reload, setItems };
}

function act(fn, reload) {
  return async (...args) => {
    try { await fn(...args); reload?.(); } catch (e) { window.alert(e.message); }
  };
}

// Client Better Auth của admin (/api/admin-auth) — chỉ để dùng passkey. Nạp động: trang học không cần.
let adminClient;
async function adminAuthClient() {
  if (adminClient) return adminClient;
  const [{ createAuthClient }, { passkeyClient }] = await Promise.all([import("better-auth/client"), import("@better-auth/passkey/client")]);
  const api = new URL(API_BASE, window.location.origin);
  adminClient = createAuthClient({ baseURL: api.origin, basePath: `${api.pathname.replace(/\/$/, "")}/admin-auth`, fetchOptions: { credentials: "include" }, plugins: [passkeyClient()] });
  return adminClient;
}
const PASSKEY_SET = "edu.admin.passkey";

/** Gợi ý bật passkey sau khi đăng nhập bằng mã: lần sau vào bằng Face ID, không tốn thư. */
function PasskeyOffer() {
  const [state, setState] = useState(() => { try { return localStorage.getItem(PASSKEY_SET) ? "done" : "offer"; } catch { return "offer"; } });
  if (state === "done" || !window.PublicKeyCredential) return null;
  const add = async () => {
    setState("busy");
    const client = await adminAuthClient();
    const r = await client.passkey.addPasskey({ name: navigator.platform || "Admin" });
    if (r?.error) { setState("offer"); window.alert("Chưa bật được passkey: " + (r.error.message || "bị huỷ")); return; }
    try { localStorage.setItem(PASSKEY_SET, "1"); } catch { /* riêng tư */ }
    setState("done");
  };
  return (
    <Card className="mb-4 flex flex-wrap items-center justify-between gap-3">
      <span className="text-[14px] text-foreground">Bật đăng nhập bằng Face ID / vân tay cho máy này — lần sau vào không cần mã email.</span>
      <div className="flex gap-2">
        <Btn onClick={add} disabled={state === "busy"}>Bật passkey</Btn>
        <Btn tone="ghost" onClick={() => { try { localStorage.setItem(PASSKEY_SET, "skip"); } catch { /* riêng tư */ } setState("done"); }}>Để sau</Btn>
      </div>
    </Card>
  );
}

function Login({ onDone }) {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("email");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = (fn) => async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try { await fn(); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const withPasskey = run(async () => {
    const client = await adminAuthClient();
    const r = await client.signIn.passkey();
    if (r?.error) throw new Error("Không đăng nhập được bằng passkey. Máy này chưa bật passkey thì dùng mã email bên dưới.");
    onDone();
  });
  const send = run(async () => {
    await call("/admin-auth/email-otp/send-verification-otp", { method: "POST", body: { email: email.trim(), type: "sign-in" } });
    setStep("otp");
  });
  const verify = run(async () => {
    await call("/admin-auth/sign-in/email-otp", { method: "POST", body: { email: email.trim(), otp: otp.trim() } });
    onDone();
  });
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <Card className="w-full max-w-sm">
        <h1 className="text-[20px] font-bold text-foreground">Quản trị Education Hugo</h1>
        {step === "email" && window.PublicKeyCredential && (
          <form onSubmit={withPasskey} className="mt-4">
            <Btn type="submit" disabled={busy} className="w-full">Đăng nhập bằng Face ID / vân tay</Btn>
            <p className="mt-3 text-center text-[13px] text-muted-foreground">hoặc nhận mã qua email</p>
          </form>
        )}
        {step === "email" ? (
          <form onSubmit={send} className="mt-4 space-y-3">
            <Input type="email" required autoFocus autoComplete="email" placeholder="Email quản trị" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Btn type="submit" tone="ghost" disabled={busy} className="w-full">Gửi mã đăng nhập</Btn>
          </form>
        ) : (
          <form onSubmit={verify} className="mt-4 space-y-3">
            <p className="text-[14px] text-muted-foreground">Nếu {email} là quản trị viên, mã 6 số đã được gửi tới hộp thư (hiệu lực 5 phút).</p>
            <Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} required autoFocus placeholder="Mã 6 số" value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} />
            <Btn type="submit" disabled={busy || otp.length !== 6} className="w-full">Đăng nhập</Btn>
            <Btn tone="ghost" className="w-full" onClick={() => { setStep("email"); setOtp(""); }}>Đổi email</Btn>
          </form>
        )}
        {error && <p role="alert" className="mt-3 text-[14px] text-red-600">{error}</p>}
      </Card>
    </main>
  );
}

const ago = (d) => {
  if (!d) return "—";
  const s = (Date.now() - new Date(d)) / 1000;
  return s < 60 ? "vừa xong" : s < 3600 ? `${Math.floor(s / 60)} phút trước` : s < 86400 ? `${Math.floor(s / 3600)} giờ trước` : fmt(d);
};
const isOnline = (d) => Boolean(d) && Date.now() - new Date(d) < 10 * 60_000;
const Dot = ({ on }) => <span title={on ? "Đang online" : "Offline"} className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${on ? "bg-green-500" : "bg-border"}`} />;
/** Vẽ lại mỗi 30 giây để "x phút trước" và chấm online tự đúng mà không gọi API. */
function useTick() {
  const [, set] = useState(0);
  useEffect(() => { const t = setInterval(() => set((n) => n + 1), 30_000); return () => clearInterval(t); }, []);
}
// Một learner trong danh sách vừa đổi, hoặc có người mới/bị xoá → cần tải lại.
// Danh sách xếp theo lần hoạt động: ai vừa hoạt động (kể cả ngoài danh sách) cũng làm đổi thứ tự.
const touches = (type, d, items) => type === "learner" && (d.op !== "update" || d.fields.includes("lastActiveAt") || items.some((l) => l._id === d.id));

function activityText(a) {
  if (a.kind === "lesson") return `học xong bài ${a.lesson + 1}`;
  if (a.kind === "quiz") return `làm trắc nghiệm ${a.score}% · ${a.passed ? "qua step ✓" : "chưa đạt"}`;
  if (a.kind === "review") return `ôn lại trắc nghiệm ${a.score}%`;
  if (a.kind === "practice") return `ôn sổ câu sai ${a.score}%`;
  if (a.kind === "challenge") return `làm thách đấu ${a.score}%`;
  if (a.kind === "admin_done") return `được admin hoàn tất (${a.by})`;
  if (a.kind === "admin_undo") return `bị admin gỡ (${a.by})`;
  return a.kind;
}
function ActivityList({ items, onOpen }) {
  if (!items) return <p className="text-muted-foreground">Đang tải…</p>;
  if (!items.length) return <p className="text-[14px] text-muted-foreground">Chưa có hoạt động.</p>;
  return (
    <ul className="divide-y divide-border text-[14px] text-foreground">
      {items.map((a) => (
        <li key={a._id} className="flex flex-wrap items-baseline gap-x-2 py-2">
          <span className="w-24 shrink-0 text-[13px] text-muted-foreground">{ago(a.createdAt)}</span>
          {onOpen && <button type="button" onClick={() => onOpen(a.email)} className="font-semibold underline-offset-2 hover:underline">{a.email}</button>}
          <span className={a.kind === "quiz" && !a.passed ? "text-amber-600" : a.kind.startsWith("admin") ? "text-sky-600" : ""}>{activityText(a)}</span>
          <span className="min-w-0 basis-full truncate pl-[6.5rem] text-[13px] text-muted-foreground">{a.label}</span>
        </li>
      ))}
    </ul>
  );
}

function Overview() {
  const [d, setD] = useState(null);
  const [open, setOpen] = useState(null);
  const loadStats = useCallback(() => { call("/admin/overview").then(setD).catch(() => setD((x) => x || {})); }, []);
  useEffect(loadStats, [loadStats]);
  const statsLater = useDebounced(loadStats, 10_000);
  useTick();
  // Online: ai đổi lastActiveAt là có thể vừa vào/ra danh sách.
  const online = useList("/admin/learners?online=1", touches);
  const feed = useList("/admin/activity");
  // Dòng hoạt động mới đẩy thẳng vào đầu luồng, không gọi API.
  useLive(["activity", "learner", "resync"], (type, d) => {
    if (type === "activity") feed.setItems((items) => [d, ...items.filter((x) => x._id !== d._id)].slice(0, 100));
    if (type === "resync") feed.reload();
    statsLater();
  });
  const rows = d ? [
    ["Người học", d.learners], ["Hoạt động 24h", d.active1], ["Hoạt động 7 ngày", d.active7], ["Mới hôm nay", d.newToday],
    ["Bài đăng 7 ngày", d.posts7], ["Báo cáo chờ xử lý", d.pendingReports], ["Góp ý bài học mới", d.newLessonFb],
    ["Phiếu đánh giá", d.feedback], ["Ngọc đang lưu hành", d.gemsOut], ["Đơn cửa hàng 30 ngày", d.sold30],
  ] : [];
  return (
    <div className="space-y-4">
      {open && <LearnerDetail email={open} onClose={() => setOpen(null)} />}
      {!d ? <p className="text-muted-foreground">Đang tải…</p> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {rows.map(([k, v]) => <Card key={k}><p className="text-[13px] text-muted-foreground">{k}</p><p className="mt-1 text-[24px] font-bold tabular-nums text-foreground">{(v ?? 0).toLocaleString("vi-VN")}</p></Card>)}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Card>
          <h2 className="mb-2 flex items-center gap-2 font-semibold text-foreground"><Dot on />Đang online ({online.items?.length ?? 0}) <small className="font-normal text-muted-foreground">· 10 phút qua</small></h2>
          {!online.items ? <p className="text-muted-foreground">Đang tải…</p> : !online.items.length ? <p className="text-[14px] text-muted-foreground">Không ai online.</p> : (
            <ul className="divide-y divide-border text-[14px]">
              {online.items.map((l) => (
                <li key={l._id}><button type="button" onClick={() => setOpen(l.email)} className="w-full py-2 text-left hover:bg-muted">
                  <b className="text-foreground">{l.nickname || l.email}</b> <span className="text-[13px] text-muted-foreground">{ago(l.lastActiveAt)}</span>
                  <LearningLine learning={l.learning} />
                </button></li>
              ))}
            </ul>
          )}
        </Card>
        <Card>
          <h2 className="mb-2 font-semibold text-foreground">Hoạt động học trực tiếp <small className="font-normal text-muted-foreground">· trực tiếp</small></h2>
          {feed.error && <p className="text-red-600">{feed.error}</p>}
          <ActivityList items={feed.items} onOpen={setOpen} />
        </Card>
      </div>
    </div>
  );
}

function LearningLine({ learning: n }) {
  if (!n) return <span className="block text-[13px] text-muted-foreground">Chưa học step nào</span>;
  return (
    <span className="block text-[13px] text-muted-foreground">
      {n.passed ? "Vừa qua: " : `Đang học (bài ${n.lessons}/${n.total}): `}<span className="text-foreground">{n.label}</span>
    </span>
  );
}

function Learners() {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const [onlineOnly, setOnlineOnly] = useState(false);
  useTick();
  const list = useList(`/admin/learners?q=${encodeURIComponent(query)}${onlineOnly ? "&online=1" : ""}`, touches);
  const [open, setOpen] = useState(null);
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <form onSubmit={(e) => { e.preventDefault(); setQuery(q); }} className="flex min-w-[260px] flex-1 gap-2">
          <Input placeholder="Email, biệt danh hoặc mã bạn" value={q} onChange={(e) => setQ(e.target.value)} />
          <Btn type="submit">Tìm</Btn>
        </form>
        <label className="flex min-h-[40px] items-center gap-2 text-[14px] text-foreground"><input type="checkbox" checked={onlineOnly} onChange={(e) => setOnlineOnly(e.target.checked)} />Chỉ đang online</label>
        <Btn tone="ghost" onClick={() => setAdding((v) => !v)}>+ Thêm member</Btn>
      </div>
      {adding && <AddLearner onDone={(email) => { setAdding(false); list.reload(); if (email) setOpen(email); }} />}
      {open && <LearnerDetail email={open} onClose={() => { setOpen(null); list.reload(); }} />}
      {list.items && <p className="text-[13px] text-muted-foreground">{list.items.length} người{list.items.length >= 200 ? " (200 hoạt động gần nhất)" : ""}</p>}
      <Table list={list} onRow={(l) => setOpen(l.email)} head={["Người học", "Đang học", "Step qua", "Ngọc", "Chuỗi", "Hoạt động"]} row={(l) => [
        <span key="n" className="flex items-start gap-2"><span className="pt-1.5"><Dot on={isOnline(l.lastActiveAt)} /></span><span className="min-w-0">
          <b>{l.nickname || l.name || "—"}</b>{l.bannedAt && <span className="ml-2 rounded bg-red-100 px-1.5 text-[12px] text-red-700">Đã khoá</span>}
          <br /><small className="text-muted-foreground">{l.email}</small></span></span>,
        <span key="l" className="block max-w-[340px]"><LearningLine learning={l.learning} /></span>,
        l.steps, (l.gems ?? 0).toLocaleString("vi-VN"), l.streak ? `🔥 ${l.streak}` : "—",
        <span key="t" className="whitespace-nowrap">{ago(l.lastActiveAt)}</span>,
      ]} />
    </div>
  );
}

function AddLearner({ onDone }) {
  const [f, setF] = useState({ email: "", name: "", nickname: "" });
  const [err, setErr] = useState("");
  const submit = async (e) => {
    e.preventDefault(); setErr("");
    try { await call("/admin/learners", { method: "POST", body: f }); onDone(f.email.trim().toLowerCase()); } catch (x) { setErr(x.message); }
  };
  return (
    <Card>
      <form onSubmit={submit} className="grid gap-2 sm:grid-cols-[2fr_1fr_1fr_auto]">
        <Input type="email" required placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <Input placeholder="Tên" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
        <Input placeholder="Biệt danh" value={f.nickname} onChange={(e) => setF({ ...f, nickname: e.target.value })} />
        <Btn type="submit">Tạo</Btn>
      </form>
      {err && <p className="mt-2 text-[14px] text-red-600">{err}</p>}
    </Card>
  );
}

function LearnerDetail({ email, onClose }) {
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [edit, setEdit] = useState(null);
  const path = `/admin/learners/${encodeURIComponent(email)}`;
  const load = useCallback(() => { call(path).then((x) => { setD(x); setErr(""); }).catch((e) => setErr(e.message)); }, [path]);
  useEffect(load, [load]);
  useTick();
  const loadLater = useDebounced(load, 500);
  const idRef = useRef(null);
  idRef.current = d?.learner?._id;
  useLive(["learner", "activity", "resync"], (type, x) => {
    if (type === "resync" || (type === "learner" && x.id === idRef.current) || (type === "activity" && x.email === email)) loadLater();
  });
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);
  const gems = act(async () => {
    const amount = window.prompt("Cộng/trừ bao nhiêu Ngọc? (số âm để trừ)");
    if (!amount) return;
    const note = window.prompt("Lý do điều chỉnh:");
    if (!note) return;
    await call(`${path}/gems`, { method: "POST", body: { amount: Number(amount), note } });
  }, load);
  const ban = act(async (on) => {
    const reason = on ? window.prompt("Lý do khoá tài khoản:") : "";
    if (on && !reason) return;
    await call(`${path}/ban`, { method: "POST", body: { ban: on, reason } });
  }, load);
  const removeLink = act(async (key) => { if (window.confirm(`Gỡ link ${key}?`)) await call(`${path}/links`, { method: "POST", body: { key } }); }, load);
  const reset = act(async () => { if (window.confirm("Xoá biệt danh, giới thiệu và nhân vật của người này?")) await call(`${path}/reset-persona`, { method: "POST" }); }, load);
  const erase = async () => {
    const typed = window.prompt(`XOÁ VĨNH VIỄN mọi dữ liệu của ${email}. Gõ lại email để xác nhận:`);
    if (typed?.trim().toLowerCase() !== email) return;
    try { await call(path, { method: "DELETE", body: { confirm: email } }); onClose(); } catch (e) { window.alert(e.message); }
  };
  const steps = act(async (ids, done) => {
    if (!done && !window.confirm(`Gỡ ${ids.length} step (xoá cả bài đã học và điểm)?`)) return;
    if (done && ids.length > 1 && !window.confirm(`Hoàn tất ${ids.length} step?`)) return;
    await call(`${path}/steps`, { method: "POST", body: { stepIds: ids, done } });
  }, load);
  const saveEdit = async (e) => {
    e.preventDefault();
    try { await call(path, { method: "PATCH", body: edit }); setEdit(null); load(); } catch (x) { window.alert(x.message); }
  };

  const l = d?.learner;
  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40" onClick={onClose}>
      <aside role="dialog" aria-label={email} onClick={(e) => e.stopPropagation()} className="h-full w-full max-w-3xl space-y-4 overflow-y-auto bg-background p-4 shadow-xl md:p-6">
        <div className="sticky -top-4 z-10 -mx-4 -mt-4 flex items-center justify-between gap-2 border-b border-border bg-background px-4 py-3 md:-top-6 md:-mx-6 md:-mt-6 md:px-6">
          <h2 className="flex min-w-0 items-center gap-2 text-[17px] font-bold text-foreground"><Dot on={isOnline(l?.lastActiveAt)} /><span className="truncate">{l?.nickname || email}</span></h2>
          <Btn tone="ghost" onClick={onClose}>Đóng</Btn>
        </div>
        {err && <p className="text-red-600">{err}</p>}
        {!d ? <p className="text-muted-foreground">Đang tải…</p> : (<>
          <Card>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-[14px] sm:grid-cols-3">
              {[["Email", l.email], ["Tên", l.name || "—"], ["Biệt danh", l.nickname || "—"], ["Mã bạn", l.friendCode || "—"],
                ["Ngọc", (l.gems ?? 0).toLocaleString("vi-VN")], ["Khiên lửa", l.shields ?? 0],
                ["Chuỗi lửa", `${l.streak?.count ?? 0} ngày${l.streak?.studiedToday ? " · đã học hôm nay" : ""}`],
                ["Hoạt động", ago(l.lastActiveAt)], ["Tạo lúc", fmt(l.createdAt)], ["Nhóm tuổi", l.consent?.ageGroup || "—"],
                ["Ngày sinh", l.profile?.birthDate || "—"], ["Tỉnh/thành", l.profile?.province || "—"], ["Giới tính", l.profile?.gender || "—"],
              ].map(([k, v]) => <div key={k} className="min-w-0"><dt className="text-[12px] text-muted-foreground">{k}</dt><dd className="break-words text-foreground">{v}</dd></div>)}
            </dl>
            {l.bannedAt && <p className="mt-2 text-[14px] font-semibold text-red-600">Đã khoá từ {fmt(l.bannedAt)}</p>}
            {l.ageMismatch && <p className="mt-2 text-[14px] font-semibold text-red-600">Ngày sinh dưới 16 nhưng đã chọn 16+ (thiếu xác nhận phụ huynh)</p>}
            {l.intro && <p className="mt-2 text-[14px] text-muted-foreground">“{l.intro}”</p>}
            <div className="mt-3"><LearningLine learning={d.learning} /></div>
          </Card>

          {edit ? (
            <Card>
              <form onSubmit={saveEdit} className="grid gap-2 sm:grid-cols-2">
                {[["name", "Tên"], ["nickname", "Biệt danh"], ["shields", "Khiên lửa"]].map(([k, label]) => (
                  <label key={k} className="text-[13px] text-muted-foreground">{label}<Input className="mt-1" value={edit[k]} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} /></label>
                ))}
                <label className="text-[13px] text-muted-foreground sm:col-span-2">Giới thiệu
                  <textarea rows={2} maxLength={300} value={edit.intro} onChange={(e) => setEdit({ ...edit, intro: e.target.value })} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-[15px] text-foreground" /></label>
                <div className="flex gap-2 sm:col-span-2"><Btn type="submit">Lưu</Btn><Btn tone="ghost" onClick={() => setEdit(null)}>Huỷ</Btn></div>
              </form>
            </Card>
          ) : (
            <div className="flex flex-wrap gap-2">
              <Btn onClick={() => setEdit({ name: l.name || "", nickname: l.nickname || "", intro: l.intro || "", shields: l.shields ?? 0 })}>Sửa thông tin</Btn>
              <Btn tone="ghost" onClick={gems}>Điều chỉnh Ngọc</Btn>
              <Btn tone="ghost" onClick={reset}>Xoá hồ sơ công khai</Btn>
              {l.bannedAt ? <Btn tone="ghost" onClick={() => ban(false)}>Mở khoá</Btn> : <Btn tone="danger" onClick={() => ban(true)}>Khoá tài khoản</Btn>}
              <Btn tone="danger" onClick={erase}>Xoá tài khoản</Btn>
            </div>
          )}

          {Object.values(l.links || {}).some(Boolean) && (
            <ul className="space-y-1 text-[14px]">
              {Object.entries(l.links).filter(([, v]) => v).map(([k, v]) => (
                <li key={k} className="flex items-center gap-2"><b className="w-20 shrink-0">{k}</b><a className="min-w-0 break-all text-blue-600 underline" href={v} target="_blank" rel="noopener noreferrer nofollow">{v}</a>
                  <Btn tone="ghost" onClick={() => removeLink(k)}>Gỡ</Btn></li>
              ))}
            </ul>
          )}

          <section className="space-y-2">
            <h3 className="font-semibold text-foreground">Tiến độ học</h3>
            {d.progress.map((c) => <CourseProgress key={c.key} course={c} current={d.learning?.stepId} onSteps={steps} />)}
          </section>

          <section>
            <h3 className="mb-1 font-semibold text-foreground">Hoạt động học (30 ngày)</h3>
            <ActivityList items={d.activity} />
          </section>

          <section>
            <h3 className="mb-1 font-semibold text-foreground">Sổ Ngọc</h3>
            <ul className="max-h-60 space-y-1 overflow-auto text-[14px] text-foreground">
              {d.gems.map((g) => <li key={g._id}>{fmt(g.createdAt)} · <b className="tabular-nums">{g.amount > 0 ? "+" : ""}{g.amount}</b> · {g.reason} {g.note ? `· ${g.note}` : ""}</li>)}
              {!d.gems.length && <li className="text-muted-foreground">Chưa có giao dịch.</li>}
            </ul>
          </section>
          {d.receipts.length > 0 && (
            <section>
              <h3 className="mb-1 font-semibold text-foreground">Đơn cửa hàng</h3>
              <ul className="space-y-1 text-[14px] text-foreground">{d.receipts.map((r) => <li key={r._id}>{fmt(r.createdAt)} · {r.slug || r.productId} · {r.price} Ngọc</li>)}</ul>
            </section>
          )}
          {d.reports.length > 0 && (
            <section>
              <h3 className="mb-1 font-semibold text-red-600">{d.reports.length} báo cáo về người này</h3>
              <ul className="space-y-1 text-[14px] text-foreground">{d.reports.map((r) => <li key={r._id}>{fmt(r.createdAt)} · {r.reason}{r.note ? ` · ${r.note}` : ""} · {r.status}</li>)}</ul>
            </section>
          )}
        </>)}
      </aside>
    </div>
  );
}

/** Một khoá: thanh tiến độ + từng step (đã qua / đang học / chưa), nút hoàn tất, gỡ, hoàn tất tới đây. */
function CourseProgress({ course: c, current, onSteps }) {
  const started = c.done > 0 || c.steps.some((s) => s.lessons);
  const ready = c.steps.filter((s) => !s.draft);
  return (
    <details open={started} className="rounded-xl border border-border bg-card">
      <summary className="flex cursor-pointer list-none flex-wrap items-center gap-3 p-3">
        <b className="text-[15px] text-foreground">{c.title}</b>
        <span className="text-[13px] tabular-nums text-muted-foreground">{c.done}/{c.total} step</span>
        <span className="h-2 min-w-[80px] flex-1 overflow-hidden rounded-full bg-muted"><span className="block h-full rounded-full bg-green-500" style={{ width: `${c.total ? (c.done / c.total) * 100 : 0}%` }} /></span>
      </summary>
      <div className="flex flex-wrap gap-2 border-t border-border px-3 py-2">
        <Btn tone="ghost" onClick={() => onSteps(ready.filter((s) => !s.done).map((s) => s.id), true)} disabled={c.done === c.total}>Hoàn tất cả khoá</Btn>
        <Btn tone="ghost" onClick={() => onSteps(ready.filter((s) => s.done || s.lessons).map((s) => s.id), false)} disabled={!started}>Gỡ cả khoá</Btn>
      </div>
      <ul className="divide-y divide-border border-t border-border">
        {c.steps.map((s, i) => {
          const state = s.done ? "done" : s.lessons ? "doing" : "todo";
          return (
            <li key={s.id} className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-3 py-2 text-[14px] ${s.id === current ? "bg-sky-50" : ""} ${s.draft ? "opacity-50" : ""}`}>
              <span className={`w-5 text-center ${state === "done" ? "text-green-600" : state === "doing" ? "text-amber-500" : "text-muted-foreground"}`}>{state === "done" ? "✓" : state === "doing" ? "◐" : "○"}</span>
              <span className="min-w-0 flex-1 text-foreground">{s.title}</span>
              <span className="text-[13px] tabular-nums text-muted-foreground">
                {s.total ? `bài ${s.lessons}/${s.total}` : ""}{s.score ? ` · điểm ${s.score.best}% (${s.score.attempts} lần)` : ""}
              </span>
              {!s.draft && (s.done || s.lessons
                ? <span className="flex gap-1">{!s.done && <Btn tone="ghost" className="min-h-[32px] px-2 text-[13px]" onClick={() => onSteps([s.id], true)}>Hoàn tất</Btn>}<Btn tone="ghost" className="min-h-[32px] px-2 text-[13px]" onClick={() => onSteps([s.id], false)}>Gỡ</Btn></span>
                : <span className="flex gap-1">
                  <Btn tone="ghost" className="min-h-[32px] px-2 text-[13px]" onClick={() => onSteps([s.id], true)}>Hoàn tất</Btn>
                  {i > 0 && <Btn tone="ghost" className="min-h-[32px] px-2 text-[13px]" title="Hoàn tất mọi step từ đầu khoá tới step này" onClick={() => onSteps(ready.slice(0, ready.indexOf(s) + 1).filter((x) => !x.done).map((x) => x.id), true)}>Tới đây</Btn>}
                </span>)}
            </li>
          );
        })}
      </ul>
    </details>
  );
}


/** Nhiều email đăng nhập từ cùng một máy (cùng IP + trình duyệt). Gợi ý thôi — trường học/gia đình dùng chung máy là bình thường. */
function Duplicates() {
  const list = useList("/admin/duplicates");
  return (
    <div className="space-y-3">
      <Table list={list} head={["Email", "Số tài khoản", "IP", "Lần cuối"]} row={(g) => [
        <span key="e" className="whitespace-pre-line">{g.emails.join("\n")}</span>, g.emails.length, g.ip, fmt(g.lastAt),
      ]} />
    </div>
  );
}

/** Link MXH member tự gắn: admin xem hết (mới sửa lên trước), gỡ từng link hoặc cả bộ. */
function MemberLinks() {
  const list = useList("/admin/links");
  const remove = async (email, key) => {
    if (!window.confirm(key ? `Gỡ link ${key} của ${email}?` : `Gỡ TẤT CẢ link của ${email}?`)) return;
    try { await call(`/admin/learners/${encodeURIComponent(email)}/links`, { method: "POST", body: { key } }); list.reload(); }
    catch (e) { window.alert(e.message); }
  };
  return (
    <div className="space-y-3">
      <Table list={list} head={["Người học", "Link", "Sửa lúc", ""]} row={(l) => [
        <span key="n">{l.nickname || "—"}<br /><small className="text-muted-foreground">{l.email}</small></span>,
        <ul key="l" className="space-y-1">{Object.entries(l.links || {}).filter(([, v]) => v).map(([k, v]) => (
          <li key={k} className="flex items-center gap-2"><b className="w-20 shrink-0">{k}</b><a className="break-all text-blue-600 underline" href={v} target="_blank" rel="noopener noreferrer nofollow">{v}</a><Btn tone="ghost" onClick={() => remove(l.email, k)}>Gỡ</Btn></li>
        ))}</ul>,
        fmt(l.updatedAt),
        <Btn key="x" tone="danger" onClick={() => remove(l.email)}>Gỡ hết</Btn>,
      ]} />
    </div>
  );
}

/** Gửi thông báo từ tài khoản chính thức Education Hugo tới mọi người đang theo dõi (hộp thư + đẩy). */
function Announce() {
  const [f, setF] = useState({ title: "", body: "", url: "/learn" });
  const [busy, setBusy] = useState(false);
  const send = async (e) => {
    e.preventDefault();
    if (!window.confirm("Gửi thông báo này tới mọi người theo dõi Education Hugo?")) return;
    setBusy(true);
    try { const r = await call("/admin/announce", { method: "POST", body: f }); window.alert(`Đã gửi tới ${r.sent} người.`); setF({ title: "", body: "", url: "/learn" }); }
    catch (err) { window.alert(err.message); } finally { setBusy(false); }
  };
  const input = "w-full rounded-lg border border-border bg-background px-3 py-2 text-[15px]";
  return (
    <form onSubmit={send} className="max-w-xl space-y-3">
      <input className={input} placeholder="Tiêu đề" maxLength={120} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required />
      <textarea className={input} rows={4} placeholder="Nội dung" maxLength={500} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} required />
      <input className={input} placeholder="Đường dẫn khi bấm (vd. /store)" value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} />
      <Btn type="submit" disabled={busy}>{busy ? "Đang gửi…" : "Gửi thông báo"}</Btn>
    </form>
  );
}

function Store() {
  const list = useList("/admin/products");
  const receipts = useList("/admin/receipts");
  const create = act(async () => {
    const slug = window.prompt("Slug (a-z, 0-9, -):");
    const name = slug && window.prompt("Tên tiếng Việt:");
    const price = name && window.prompt("Giá (Ngọc):");
    const kind = price && window.prompt("Loại: badge · xp_boost · streak_shield", "badge");
    if (!kind) return;
    await call("/admin/products", { method: "POST", body: { slug, name: { vi: name }, price: Number(price), kind } });
  }, list.reload);
  const edit = (p, field, label) => act(async () => {
    const v = window.prompt(label, String(p[field] ?? ""));
    if (v === null) return;
    await call(`/admin/products/${p._id}`, { method: "PATCH", body: { [field]: v } });
  }, list.reload);
  const toggle = (p) => act(() => call(`/admin/products/${p._id}`, { method: "PATCH", body: { active: !p.active } }), list.reload);
  return (
    <div className="space-y-4">
      <Btn onClick={create}>Thêm sản phẩm</Btn>
      <Table list={list} head={["Slug", "Tên", "Loại", "Giá", "Kho", "Trạng thái", ""]} row={(p) => [
        p.slug, p.name?.vi, p.kind, p.price, p.stock ?? "∞", p.active ? "Đang bán" : "Ẩn",
        <span key="a" className="flex flex-wrap gap-2">
          <Btn tone="ghost" onClick={edit(p, "price", "Giá mới (Ngọc):")}>Giá</Btn>
          <Btn tone="ghost" onClick={edit(p, "stock", "Số lượng kho (để trống = không giới hạn):")}>Kho</Btn>
          <Btn tone="ghost" onClick={toggle(p)}>{p.active ? "Ẩn" : "Bán"}</Btn>
        </span>,
      ]} />
      <h3 className="font-semibold text-foreground">Đơn gần đây</h3>
      <Table list={receipts} head={["Lúc", "Email", "Sản phẩm", "Giá"]} row={(r) => [fmt(r.createdAt), r.email, r.slug || r.productId, r.price]} />
    </div>
  );
}

function Partners() {
  const list = useList("/admin/partners");
  const [form, setForm] = useState({ email: "", days: 30, origins: "", note: "" });
  const [issued, setIssued] = useState(null);
  const issue = act(async (e) => {
    e.preventDefault();
    const out = await call("/admin/partners", { method: "POST", body: { ...form, origins: form.origins.split(/[\s,]+/).filter(Boolean) } });
    setIssued(out);
    setForm({ email: "", days: 30, origins: "", note: "" });
  }, list.reload);
  const revoke = (k) => act(async () => { if (window.confirm(`Thu hồi key …${k.last4} của ${k.email}?`)) await call(`/admin/partners/${k._id}/revoke`, { method: "POST" }); }, list.reload);
  const extend = (k) => act(async () => {
    const days = window.prompt(`Gia hạn key …${k.last4} thêm bao nhiêu ngày? (còn lại tối đa 365 ngày)`, "30");
    if (days) await call(`/admin/partners/${k._id}`, { method: "POST", body: { days } });
  }, list.reload);
  const domains = (k) => act(async () => {
    const origins = window.prompt(`Tên miền cho key …${k.last4} (cách nhau dấu phẩy):`, (k.origins || []).join(", "));
    if (origins !== null) await call(`/admin/partners/${k._id}`, { method: "POST", body: { origins: origins.split(/[\s,]+/).filter(Boolean) } });
  }, list.reload);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  return (
    <div className="space-y-4">
      <Card>
        <form onSubmit={issue} className="grid gap-2 sm:grid-cols-2">
          <Input type="email" required placeholder="Email đối tác" value={form.email} onChange={set("email")} />
          <Input type="number" min={1} max={365} placeholder="Số ngày hiệu lực" value={form.days} onChange={set("days")} />
          <Input required placeholder="Tên miền được phép, bắt buộc (vd. https://truong.edu.vn, http://localhost:5173)" value={form.origins} onChange={set("origins")} />
          <Input placeholder="Ghi chú" value={form.note} onChange={set("note")} />
          <Btn type="submit" className="sm:col-span-2">Cấp key và gửi mail</Btn>
        </form>
        {issued && <p className="mt-3 text-[14px] text-foreground">Đã gửi key …{issued.last4} tới {issued.email}, hết hạn {fmt(issued.expiresAt)}. Key chỉ hiện trong thư, máy chủ không lưu bản rõ.</p>}
      </Card>
      <Table list={list} head={["Email", "Key", "Tên miền", "Hết hạn", "Lượt dùng", "Dùng gần nhất", "Trạng thái", ""]} row={(k) => [
        k.email, `…${k.last4}`, k.origins?.join(", ") || "Mọi nơi (key cũ)", fmt(k.expiresAt), k.uses ?? 0, fmt(k.lastUsedAt),
        k.revokedAt ? "Đã thu hồi" : new Date(k.expiresAt) < new Date() ? "Hết hạn" : "Hoạt động",
        !k.revokedAt && <div key="a" className="flex flex-wrap gap-2"><Btn tone="ghost" onClick={extend(k)}>Gia hạn</Btn><Btn tone="ghost" onClick={domains(k)}>Tên miền</Btn><Btn tone="danger" onClick={revoke(k)}>Thu hồi</Btn></div>,
      ]} />
    </div>
  );
}

function Moderation() {
  const [status, setStatus] = useState("pending");
  const reports = useList(`/admin/reports?status=${status}`);
  const posts = useList("/admin/posts");
  const decide = (r, s) => act(() => call(`/admin/reports/${r._id}`, { method: "POST", body: { status: s } }), reports.reload);
  const hide = (p) => act(() => call(`/admin/posts/${p._id}/hide`, { method: "POST", body: { hide: !p.removed } }), posts.reload);
  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        {[["pending", "Chờ xử lý"], ["actioned", "Đã xử lý"], ["dismissed", "Bỏ qua"]].map(([id, label]) => (
          <Btn key={id} tone={status === id ? undefined : "ghost"} onClick={() => setStatus(id)}>{label}</Btn>
        ))}
      </div>
      <Table list={reports} head={["Lúc", "Người báo", "Bị báo", "Lý do", ""]} row={(r) => [
        fmt(r.createdAt), r.reporterEmail, r.targetEmail, [r.reason, r.note].filter(Boolean).join(" · "),
        status === "pending" && <span key="a" className="flex gap-2"><Btn onClick={decide(r, "actioned")}>Đã xử lý</Btn><Btn tone="ghost" onClick={decide(r, "dismissed")}>Bỏ qua</Btn></span>,
      ]} />
      <h3 className="font-semibold text-foreground">Bài đăng cộng đồng</h3>
      <Table list={posts} head={["Lúc", "Tác giả", "Nội dung", "Thích", ""]} row={(p) => [
        fmt(p.createdAt), p.authorEmail, <span key="t" className="line-clamp-2">{p.text}</span>, p.likeCount ?? 0,
        <Btn key="a" tone={p.removed ? "ghost" : "danger"} onClick={hide(p)}>{p.removed ? "Hiện lại" : "Ẩn"}</Btn>,
      ]} />
    </div>
  );
}

function Feedback() {
  const lesson = useList("/admin/lesson-feedback");
  const survey = useList("/admin/feedback");
  const mark = (f, status) => act(() => call(`/admin/lesson-feedback/${f._id}`, { method: "POST", body: { status } }), lesson.reload);
  return (
    <div className="space-y-4">
      <h3 className="font-semibold text-foreground">Góp ý bài học</h3>
      <Table list={lesson} head={["Lúc", "Email", "Bài", "Nội dung", "Trạng thái", ""]} row={(f) => [
        fmt(f.createdAt), f.email, f.lessonId, f.message, f.status,
        <span key="a" className="flex gap-2"><Btn tone="ghost" onClick={mark(f, "seen")}>Đã xem</Btn><Btn tone="ghost" onClick={mark(f, "fixed")}>Đã sửa</Btn></span>,
      ]} />
      <h3 className="font-semibold text-foreground">Phiếu đánh giá</h3>
      <Table list={survey} head={["Lúc", "Email", "Điểm", "Góp ý"]} row={(f) => [
        fmt(f.createdAt), f.email, Object.values(f.ratings || {}).join(" · "), f.comment || "—",
      ]} />
    </div>
  );
}

function Developers() {
  const list = useList("/admin/developers");
  const STATUS = { new: "Mới đăng ký", contacted: "Đã liên hệ", accepted: "Nhận vào", declined: "Chưa phù hợp" };
  const set = (d, status) => act(() => call(`/admin/developers/${d._id}`, { method: "POST", body: { status } }), list.reload);
  return (
    <div className="space-y-3">
      <p className="text-[14px] text-muted-foreground">{list.items ? `${list.items.length} người đăng ký` : ""}</p>
      <Table list={list} head={["Lúc đăng ký", "Email", "Tên", "Trạng thái", ""]} row={(d) => [
        fmt(d.createdAt), d.email, d.name || "—", STATUS[d.status] || d.status,
        <select key="s" value={d.status} onChange={(e) => set(d, e.target.value)()} className="min-h-[40px] rounded-lg border border-border bg-card px-2 text-[14px] text-foreground">
          {Object.entries(STATUS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </select>,
      ]} />
    </div>
  );
}

function Log() {
  const list = useList("/admin/log");
  return <Table list={list} head={["Lúc", "Admin", "Thao tác", "Đối tượng"]} row={(l) => [fmt(l.createdAt), l.admin, l.action, l.target]} />;
}

function Table({ list, head, row, onRow }) {
  if (list.error) return <p className="text-red-600">{list.error}</p>;
  if (!list.items) return <p className="text-muted-foreground">Đang tải…</p>;
  if (!list.items.length) return <p className="text-muted-foreground">Chưa có dữ liệu.</p>;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-left text-[14px] text-foreground">
        <thead className="bg-muted text-muted-foreground"><tr>{head.map((h) => <th key={h} className="whitespace-nowrap px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{list.items.map((item, i) => (
          <tr key={item._id || i} onClick={onRow && (() => onRow(item))} className={`border-t border-border align-top ${onRow ? "cursor-pointer hover:bg-muted" : ""}`}>{row(item).map((c, j) => <td key={j} className="px-3 py-2">{c}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

/** Ads: chỉ admin đăng, chọn mascot đại diện cho từng bài. */
function Articles() {
  const list = useList("/admin/articles");
  const [mascots, setMascots] = useState([]);
  const empty = { _id: null, title: "", text: "", mascot: "cast-1" };
  const [form, setForm] = useState(empty);
  const [msg, setMsg] = useState("");
  useEffect(() => { call("/admin/articles").then((d) => setMascots(d.mascots || [])).catch(() => {}); }, []);
  const save = async () => {
    try {
      await call(form._id ? `/admin/articles/${form._id}` : "/admin/articles", { method: form._id ? "PUT" : "POST", body: form });
      setForm(empty); setMsg(form._id ? "Đã sửa bài." : "Đã đăng bài."); list.reload();
    } catch (e) { setMsg(e.message); }
  };
  const remove = (a) => act(async () => { if (window.confirm(`Xoá Ads "${a.title || a.text.slice(0, 40)}"?`)) await call(`/admin/articles/${a._id}`, { method: "DELETE" }); }, list.reload);
  return (
    <div className="space-y-4">
      <Card className="space-y-3">
        <b className="block text-[16px]">{form._id ? "Sửa bài" : "Viết bài mới"}</b>
        <div>
          <p className="mb-2 text-[14px] text-muted-foreground">Mascot đại diện</p>
          <div className="flex flex-wrap gap-2">
            {mascots.map((m) => (
              <button key={m} type="button" onClick={() => setForm({ ...form, mascot: m })} aria-pressed={form.mascot === m}
                className={`grid h-[60px] w-[60px] place-items-center rounded-xl border-2 ${form.mascot === m ? "border-sky-500 bg-sky-50" : "border-border"}`}>
                <img src={`/edu/${m}.svg`} alt={m} className="h-11 w-11 object-contain" />
              </button>
            ))}
          </div>
        </div>
        <Input placeholder="Tiêu đề (không bắt buộc)" maxLength={120} value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} />
        <textarea placeholder="Nội dung chia sẻ… (dán link YouTube/GitHub/ảnh sẽ tự có xem trước)" rows={8} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })}
          className="w-full rounded-lg border border-border bg-card px-3 py-2 text-[15px] text-foreground" />
        <div className="flex flex-wrap items-center gap-2">
          <Btn onClick={save} disabled={!form.text.trim()}>{form._id ? "Lưu thay đổi" : "Đăng bài"}</Btn>
          {form._id && <Btn tone="ghost" onClick={() => setForm(empty)}>Huỷ sửa</Btn>}
          {msg && <span className="text-[14px] text-muted-foreground">{msg}</span>}
        </div>
      </Card>
      <Table list={list} head={["", "Bài", "Tim", "Bình luận", "Lúc đăng", ""]} row={(a) => [
        <img key="m" src={`/edu/${a.mascot || "cast-1"}.svg`} alt="" className="h-9 w-9" />,
        <span key="t"><b>{a.title || "(không tiêu đề)"}</b><br /><span className="text-muted-foreground">{a.text.slice(0, 90)}{a.text.length > 90 ? "…" : ""}</span></span>,
        a.likeCount || 0, a.replyCount || 0, fmt(a.createdAt),
        <div key="a" className="flex gap-2"><Btn tone="ghost" onClick={() => { setForm({ _id: a._id, title: a.title || "", text: a.text, mascot: a.mascot || "cast-1" }); window.scrollTo(0, 0); }}>Sửa</Btn><Btn tone="danger" onClick={remove(a)}>Xoá</Btn></div>,
      ]} />
    </div>
  );
}

const LANGS = [["vi", "Tiếng Việt"], ["en", "English"], ["zh", "中文"]];
const PROMO_FIELDS = [["badge", "Nhãn", 30], ["title", "Tiêu đề", 80], ["body", "Nội dung", 240], ["cta", "Nút", 30]];

/** Quảng cáo Hugo Developer ở Hồ sơ: chữ theo ngôn ngữ, ảnh, link, bật/tắt. Ô trống → app dùng chữ mặc định. */
function Promos() {
  const [form, setForm] = useState(null);
  const [lang, setLang] = useState("vi");
  const [msg, setMsg] = useState("");
  useEffect(() => {
    call("/admin/promo/developer").then((d) => setForm({ enabled: true, image: "", href: "/developer-team", text: {}, ...d.promo }))
      .catch((e) => setMsg(e.message));
  }, []);
  if (!form) return <p className="text-muted-foreground">{msg || "Đang tải…"}</p>;
  const setText = (field, value) => setForm({ ...form, text: { ...form.text, [lang]: { ...form.text?.[lang], [field]: value } } });
  const upload = (file) => {
    if (!file) return;
    if (file.size > 150_000) return setMsg("Ảnh quá 150 KB — nén lại (WebP) rồi tải lên.");
    const reader = new FileReader();
    reader.onload = () => { setForm((f) => ({ ...f, image: reader.result })); setMsg(""); };
    reader.readAsDataURL(file);
  };
  const save = async () => {
    try { const d = await call("/admin/promo/developer", { method: "PUT", body: form }); setForm({ ...form, ...d.promo }); setMsg("Đã lưu. App cập nhật trong khoảng 1 phút."); } catch (e) { setMsg(e.message); }
  };
  const t = form.text?.[lang] || {};
  const image = form.image || "/edu/dev-rocket.webp";
  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
      <Card className="space-y-3">
        <label className="flex items-center gap-2 text-[15px]"><input type="checkbox" checked={form.enabled !== false} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /> Hiện quảng cáo ở Hồ sơ</label>
        <div className="flex gap-2">{LANGS.map(([id, label]) => <Btn key={id} tone={lang === id ? undefined : "ghost"} onClick={() => setLang(id)}>{label}</Btn>)}</div>
        {PROMO_FIELDS.map(([field, label, max]) => (
          <label key={field} className="block text-[14px] text-muted-foreground">{label} ({(t[field] || "").length}/{max})
            {field === "body"
              ? <textarea value={t[field] || ""} maxLength={max} rows={3} onChange={(e) => setText(field, e.target.value)} className="mt-1 w-full rounded-lg border border-border bg-card px-3 py-2 text-[15px] text-foreground" />
              : <Input value={t[field] || ""} maxLength={max} onChange={(e) => setText(field, e.target.value)} className="mt-1" />}
          </label>
        ))}
        <label className="block text-[14px] text-muted-foreground">Ảnh (đường dẫn /…, https://… hoặc tải lên ≤ 150 KB)
          <Input value={form.image?.startsWith("data:") ? "(ảnh đã tải lên)" : form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/edu/dev-rocket.webp" className="mt-1" />
        </label>
        <div className="flex flex-wrap gap-2">
          <label className="inline-flex min-h-[40px] cursor-pointer items-center rounded-lg border border-border px-3 text-[14px] font-semibold">Tải ảnh lên<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => upload(e.target.files?.[0])} /></label>
          <Btn tone="ghost" onClick={() => setForm({ ...form, image: "" })}>Dùng ảnh mặc định</Btn>
        </div>
        <label className="block text-[14px] text-muted-foreground">Link khi bấm
          <Input value={form.href || ""} onChange={(e) => setForm({ ...form, href: e.target.value })} placeholder="/developer-team" className="mt-1" />
        </label>
        <div className="flex items-center gap-3"><Btn onClick={save}>Lưu</Btn>{msg && <span className="text-[14px] text-muted-foreground">{msg}</span>}</div>
      </Card>
      <div>
        <Card className={`flex items-center gap-3 ${form.enabled === false ? "opacity-40" : ""}`}>
          <div className="min-w-0 flex-1 space-y-1">
            <span className="inline-block rounded-md bg-yellow-400 px-2 py-0.5 text-[12px] font-black italic text-blue-900">{t.badge || "HUGO DEVELOPER"}</span>
            <b className="block text-[17px]">{t.title || "(tiêu đề mặc định)"}</b>
            <p className="text-[14px] text-muted-foreground">{t.body || "(nội dung mặc định)"}</p>
            <span className="text-[13px] font-black uppercase text-sky-500">{t.cta || "Tìm hiểu"}</span>
          </div>
          <img src={image} alt="" className="h-[112px] w-[112px] flex-none rounded-2xl object-cover" />
        </Card>
      </div>
    </div>
  );
}

/** Slide dạy 10 buổi Python cơ bản (public/slides): mở tab mới để chia sẻ màn hình, code chạy ngay trên slide. */
function Slides() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 10 }, (_, i) => (
        <a key={i} href={`/slides/buoi${i + 1}.html`} target="_blank" rel="noreferrer">
          <Card className="space-y-1 text-[14px] text-foreground hover:border-primary">
            <h2 className="text-[16px] font-bold">Buổi {i + 1} · step {i * 4 + 1}–{i * 4 + 4}</h2>
            <ol className="list-decimal pl-5 text-muted-foreground" start={i * 4 + 1}>{OUTLINE.slice(i * 4, i * 4 + 4).map(([, title]) => <li key={title}>{title}</li>)}</ol>
          </Card>
        </a>
      ))}
    </div>
  );
}

/** Một mục trong tab: bấm tiêu đề để mở/đóng. Đóng thì không gắn (không tải API). */
function Section({ title, open: initial, children }) {
  const [open, setOpen] = useState(initial);
  return (
    <details open={open} onToggle={(e) => setOpen(e.currentTarget.open)} className="rounded-xl border border-border bg-card">
      <summary className="flex min-h-[48px] cursor-pointer items-center px-4 text-[16px] font-semibold text-foreground">{title}</summary>
      {open && <div className="border-t border-border p-3 md:p-4">{children}</div>}
    </details>
  );
}

// [id, nhãn, icon, [[tiêu đề mục, View, mở sẵn?]]]
const TABS = [
  ["home", "Trung tâm", "space_dashboard", [["Tổng quan trực tiếp", Overview, true], ["Người học", Learners, true]]],
  ["content", "Nội dung", "slideshow", [["Slide dạy", Slides, true], ["Ads (bài viết)", Articles], ["Quảng cáo trong app", Promos], ["Gửi thông báo", Announce]]],
  ["business", "Cửa hàng & đối tác", "storefront", [["Cửa hàng", Store, true], ["Đối tác (API key)", Partners], ["Hugo Developer", Developers]]],
  ["safety", "Kiểm duyệt", "shield", [["Báo cáo & bài đăng", Moderation, true], ["Góp ý", Feedback], ["Nghi trùng tài khoản", Duplicates], ["Link MXH", MemberLinks], ["Nhật ký admin", Log]]],
];

export default function EduAdmin() {
  const [me, setMe] = useState(undefined);
  const tabFromPath = () => TABS.find(([id]) => window.location.pathname === `/admin/${id}`)?.[0] || "home";
  const [tab, setTab] = useState(tabFromPath);
  const check = useCallback(() => { call("/admin/me").then(setMe).catch(() => setMe(null)); }, []);
  useEffect(() => {
    document.title = "Quản trị · Education Hugo";
    document.documentElement.dataset.theme = "light";
    check();
    const onPop = () => setTab(tabFromPath());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [check]);

  const liveState = useLiveConnection(Boolean(me));
  if (me === undefined) return <p className="p-6 text-muted-foreground">Đang tải…</p>;
  if (!me) return <Login onDone={check} />;

  const go = (id) => { window.history.pushState(null, "", `/admin/${id}`); setTab(id); };
  const signOut = async () => { await call("/admin-auth/sign-out", { method: "POST", body: {} }).catch(() => {}); setMe(null); };
  const [, label, , sections] = TABS.find(([id]) => id === tab);
  return (
    <div className="min-h-dvh bg-background md:flex">
      <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card p-2 md:sticky md:top-0 md:h-dvh md:w-56 md:flex-col md:border-b-0 md:border-r">
        <p className="hidden px-3 py-2 text-[15px] font-bold text-foreground md:block">Education Hugo</p>
        <p className="flex shrink-0 items-center gap-2 px-3 text-[13px] text-muted-foreground"><Dot on={liveState === "on"} />{liveState === "on" ? "Trực tiếp" : "Đang nối lại…"}</p>
        {TABS.map(([id, text, icon]) => (
          <button key={id} type="button" onClick={() => go(id)} aria-current={tab === id ? "page" : undefined}
            className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg px-3 text-[15px] ${tab === id ? "bg-muted font-semibold text-foreground" : "text-muted-foreground"}`}>
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">{icon}</span>{text}
          </button>
        ))}
        <div className="md:mt-auto">
          <p className="hidden truncate px-3 text-[13px] text-muted-foreground md:block">{me.email}</p>
          <button type="button" onClick={signOut} className="flex min-h-[44px] shrink-0 items-center gap-2 rounded-lg px-3 text-[15px] text-muted-foreground">
            <span className="material-symbols-outlined text-[20px]" aria-hidden="true">logout</span>Đăng xuất
          </button>
        </div>
      </nav>
      <main className="min-w-0 flex-1 p-4 md:p-6">
        <PasskeyOffer />
        <h1 className="mb-4 text-[22px] font-bold text-foreground">{label}</h1>
        <div key={tab} className="space-y-3">
          {sections.map(([title, View, open]) => <Section key={title} title={title} open={Boolean(open)}><View /></Section>)}
        </div>
      </main>
    </div>
  );
}
