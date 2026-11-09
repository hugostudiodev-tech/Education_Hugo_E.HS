import { useCallback, useEffect, useRef, useState } from "react";
import { API_BASE } from "../../config/apiBase";
import { OUTLINE } from "../../../packages/courses/python/stages.js";
import {
  act, ago, ask, Badge, Btn, call, confirmAction, DialogHost, Dot, Empty, Field, fmt, Group, Icon, Input, Loading, num,
  onReauth, Search, Segmented, Select, Sheet, Table, Textarea, toast, ToastHost,
} from "./ui.jsx";

/**
 * /admin — quản trị Education Hugo. Đăng nhập: Face ID / vân tay (passkey) hoặc mã 6 số qua email
 * (Better Auth ở /api/admin-auth, cookie edu-admin.*). Chỉ email trong ADMIN_EMAILS. Phiên 12 giờ.
 * Thao tác tối mật cần vừa xác thực trong 10 phút — ui.jsx tự hỏi lại khi máy chủ báo REAUTH_REQUIRED.
 * Bố cục: thanh bên nhóm theo chủ đề (iPad/Mac), trên điện thoại là danh sách kiểu Cài đặt iOS → trang con.
 * ponytail: chỉ tiếng Việt — trang nội bộ.
 */

// ── Kênh trực tiếp: một EventSource cho cả trang (/admin/live, SSE từ change stream MongoDB) ──
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
      es.onerror = () => { setState("connecting"); if (es.readyState === EventSource.CLOSED) timer = setTimeout(connect, 5000); };
    };
    connect();
    return () => { clearTimeout(timer); es.close(); };
  }, [enabled]);
  return state;
}
function useLive(types, fn) {
  const ref = useRef(fn);
  ref.current = fn;
  const key = types.join();
  useEffect(() => {
    const h = (e) => ref.current(e.type, e.detail);
    const list = key.split(",").filter(Boolean);
    list.forEach((t) => live.addEventListener(t, h));
    return () => list.forEach((t) => live.removeEventListener(t, h));
  }, [key]);
}
function useDebounced(fn, ms) {
  const ref = useRef(fn);
  ref.current = fn;
  const timer = useRef(0);
  useEffect(() => () => clearTimeout(timer.current), []);
  return useCallback(() => { clearTimeout(timer.current); timer.current = setTimeout(() => ref.current(), ms); }, [ms]);
}
function useTick() {
  const [, set] = useState(0);
  useEffect(() => { const t = setInterval(() => set((n) => n + 1), 30_000); return () => clearInterval(t); }, []);
}

// ponytail: cache RAM theo path — đổi trang hiện ngay dữ liệu lần trước, rồi tải lại nền.
const listCache = new Map();
function useList(path, follow) {
  const [state, setState] = useState(() => ({ items: listCache.get(path) ?? null, error: "" }));
  const reload = useCallback(() => {
    if (listCache.has(path)) setState({ items: listCache.get(path), error: "" });
    call(path).then((d) => { const items = d.items ?? d; listCache.set(path, items); setState({ items, error: "" }); })
      .catch((e) => setState((s) => ({ items: s.items ?? [], error: e.message })));
  }, [path]);
  useEffect(reload, [reload]);
  const later = useDebounced(reload, 3000);
  useLive(follow ? ["learner", "activity", "resync"] : [], (type, detail) => {
    if (type === "resync" || follow(type, detail, listCache.get(path) || [])) later();
  });
  const setItems = useCallback((fn) => setState((st) => { const items = fn(st.items || []); listCache.set(path, items); return { ...st, items }; }), [path]);
  return { ...state, reload, setItems };
}

// ── Đăng nhập / xác thực lại ──────────────────────────────────────────────────
let adminClient;
async function adminAuthClient() {
  if (adminClient) return adminClient;
  const [{ createAuthClient }, { passkeyClient }] = await Promise.all([import("better-auth/client"), import("@better-auth/passkey/client")]);
  const api = new URL(API_BASE, window.location.origin);
  adminClient = createAuthClient({ baseURL: api.origin, basePath: `${api.pathname.replace(/\/$/, "")}/admin-auth`, fetchOptions: { credentials: "include" }, plugins: [passkeyClient()] });
  return adminClient;
}
const hasPasskeyApi = () => typeof window !== "undefined" && Boolean(window.PublicKeyCredential);

/** Hai cách vào: passkey (một chạm) hoặc mã email. Dùng cho cả màn đăng nhập lẫn hộp xác thực lại. */
function AuthForm({ email: fixedEmail, onDone, compact }) {
  const [email, setEmail] = useState(fixedEmail || "");
  const [otp, setOtp] = useState("");
  const [step, setStep] = useState("start");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const run = (fn) => async (e) => {
    e?.preventDefault(); setBusy(true); setError("");
    try { await fn(); } catch (err) { setError(err.message); } finally { setBusy(false); }
  };
  const withPasskey = run(async () => {
    const r = await (await adminAuthClient()).signIn.passkey();
    if (r?.error) throw new Error("Không xác thực được bằng Face ID / vân tay. Máy này chưa bật passkey thì dùng mã email.");
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
    <div className="space-y-3">
      {step === "start" ? (<>
        {hasPasskeyApi() && <Btn tone="primary" icon="fingerprint" onClick={withPasskey} disabled={busy} className="w-full">Dùng Face ID / vân tay</Btn>}
        <form onSubmit={send} className="space-y-3">
          {!fixedEmail && <Field label="Email quản trị"><Input type="email" required autoFocus={!compact} autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} /></Field>}
          <Btn type="submit" tone={hasPasskeyApi() ? "plain" : "primary"} icon="mail" disabled={busy || !email.trim()} className="w-full">{fixedEmail ? `Gửi mã tới ${fixedEmail}` : "Gửi mã đăng nhập"}</Btn>
        </form>
      </>) : (
        <form onSubmit={verify} className="space-y-3">
          <p className="text-[15px] text-muted-foreground">Nếu {email} là quản trị viên, mã 6 số vừa được gửi tới hộp thư. Mã hết hạn sau 5 phút.</p>
          <Field label="Mã 6 số"><Input inputMode="numeric" autoComplete="one-time-code" maxLength={6} required autoFocus value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))} className="text-center text-[22px] tracking-[.4em] tabular-nums" /></Field>
          <Btn type="submit" tone="primary" disabled={busy || otp.length !== 6} className="w-full">Xác nhận</Btn>
          <Btn tone="ghost" className="w-full" onClick={() => { setStep("start"); setOtp(""); }}>Quay lại</Btn>
        </form>
      )}
      {error && <p role="alert" className="text-[14px] text-destructive">{error}</p>}
    </div>
  );
}

function Login({ onDone }) {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-4">
      <div className="w-full max-w-sm space-y-6">
        <div className="text-center">
          <span className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-foreground text-background"><Icon name="admin_panel_settings" className="text-[30px]" /></span>
          <h1 className="text-[24px] font-bold text-foreground">Quản trị Education Hugo</h1>
          <p className="mt-1 text-[15px] text-muted-foreground">Chỉ dành cho quản trị viên.</p>
        </div>
        <div className="rounded-2xl border border-border bg-card p-5"><AuthForm onDone={onDone} /></div>
      </div>
    </main>
  );
}

/** Hộp xác thực lại cho thao tác tối mật. Mở bằng onReauth (ui.jsx), trả true khi xác thực xong. */
function ReauthHost({ email }) {
  const ref = useRef(null);
  const [pending, setPending] = useState(null);
  useEffect(() => {
    onReauth(() => new Promise((resolve) => setPending({ resolve })));
    return () => onReauth(null);
  }, []);
  useEffect(() => { if (pending && !ref.current.open) ref.current.showModal(); }, [pending]);
  const finish = (ok) => { pending?.resolve(ok); setPending(null); ref.current?.close(); };
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); finish(false); }} aria-labelledby="adm-reauth"
      className="w-[min(400px,calc(100vw-32px))] rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/50 backdrop:backdrop-blur-sm">
      {pending && (
        <div className="space-y-4 p-5">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-warning/15 text-[hsl(30_90%_35%)] dark:text-warning"><Icon name="lock" /></span>
            <div>
              <h2 id="adm-reauth" className="text-[18px] font-bold">Xác thực lại</h2>
              <p className="mt-1 text-[15px] text-muted-foreground">Đây là thao tác tối mật. Xác nhận bạn vẫn là {email} — hiệu lực 10 phút.</p>
            </div>
          </div>
          <AuthForm email={email} compact onDone={() => finish(true)} />
          <Btn className="w-full" onClick={() => finish(false)}>Huỷ</Btn>
        </div>
      )}
    </dialog>
  );
}

// ── Dùng chung ────────────────────────────────────────────────────────────────
const isOnline = (d) => Boolean(d) && Date.now() - new Date(d) < 10 * 60_000;
const touches = (type, d, items) => type === "learner" && (d.op !== "update" || d.fields.includes("lastActiveAt") || items.some((l) => l._id === d.id));

function activityText(a) {
  if (a.kind === "lesson") return `học xong bài ${a.lesson + 1}`;
  if (a.kind === "quiz") return `trắc nghiệm ${a.score}% · ${a.passed ? "qua step" : "chưa đạt"}`;
  if (a.kind === "review") return `ôn lại trắc nghiệm ${a.score}%`;
  if (a.kind === "practice") return `ôn sổ câu sai ${a.score}%`;
  if (a.kind === "challenge") return `thách đấu ${a.score}%`;
  if (a.kind === "admin_done") return `được admin hoàn tất (${a.by})`;
  if (a.kind === "admin_undo") return `bị admin gỡ (${a.by})`;
  return a.kind;
}
function ActivityList({ items, onOpen }) {
  if (!items) return <Loading />;
  if (!items.length) return <Empty icon="history">Chưa có hoạt động.</Empty>;
  return (
    <ul className="divide-y divide-border text-[14px] text-foreground">
      {items.map((a) => (
        <li key={a._id} className="flex gap-3 px-4 py-2.5">
          <span className="w-24 shrink-0 pt-px text-[13px] text-muted-foreground">{ago(a.createdAt)}</span>
          <span className="min-w-0 flex-1">
            {onOpen && <button type="button" onClick={() => onOpen(a.email)} className="mr-1.5 font-semibold hover:underline">{a.email}</button>}
            <span className={a.kind === "quiz" && !a.passed ? "text-[hsl(30_90%_35%)] dark:text-warning" : a.kind.startsWith("admin") ? "text-info" : ""}>{activityText(a)}</span>
            {a.label && <span className="block truncate text-[13px] text-muted-foreground">{a.label}</span>}
          </span>
        </li>
      ))}
    </ul>
  );
}
function LearningLine({ learning: n }) {
  if (!n) return <span className="block text-[13px] text-muted-foreground">Chưa học step nào</span>;
  return <span className="block text-[13px] text-muted-foreground">{n.passed ? "Vừa qua: " : `Đang học (bài ${n.lessons}/${n.total}): `}<span className="text-foreground">{n.label}</span></span>;
}
const Toolbar = ({ children }) => <div className="flex flex-wrap items-center gap-2">{children}</div>;

// ── Trang: Bảng điều khiển ────────────────────────────────────────────────────
function Overview({ stats, openLearner, go }) {
  useTick();
  const online = useList("/admin/learners?online=1", touches);
  const feed = useList("/admin/activity");
  useLive(["activity", "resync"], (type, d) => {
    if (type === "activity") feed.setItems((items) => [d, ...items.filter((x) => x._id !== d._id)].slice(0, 100));
    if (type === "resync") feed.reload();
  });
  const d = stats || {};
  const tiles = [
    ["Người học", d.learners, "group"], ["Hoạt động 24 giờ", d.active1, "bolt"], ["Hoạt động 7 ngày", d.active7, "calendar_month"],
    ["Mới hôm nay", d.newToday, "person_add"], ["Bài đăng 7 ngày", d.posts7, "forum"], ["Ngọc đang lưu hành", d.gemsOut, "diamond"],
    ["Đơn cửa hàng 30 ngày", d.sold30, "shopping_bag"], ["Phiếu đánh giá", d.feedback, "reviews"],
  ];
  const todo = [
    [d.pendingReports, "báo cáo chờ xử lý", "moderation", "flag"],
    [d.newLessonFb, "góp ý bài học mới", "feedback", "rate_review"],
  ].filter(([n]) => n > 0);
  return (
    <div className="space-y-6">
      {todo.length > 0 && (
        <Group title="Cần xử lý">
          <ul className="divide-y divide-border">
            {todo.map(([n, text, page, icon]) => (
              <li key={page}><button type="button" onClick={() => go(page)} className="flex min-h-[52px] w-full items-center gap-3 px-4 text-left text-[15px] hover:bg-muted/60">
                <Icon name={icon} className="text-destructive" /><span className="flex-1"><b className="tabular-nums">{num(n)}</b> {text}</span><Icon name="chevron_right" className="text-muted-foreground" />
              </button></li>
            ))}
          </ul>
        </Group>
      )}
      {!stats ? <Loading /> : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {tiles.map(([k, v, icon]) => (
            <div key={k} className="rounded-2xl border border-border bg-card p-4">
              <p className="flex items-center gap-1.5 text-[13px] text-muted-foreground"><Icon name={icon} className="text-[18px]" />{k}</p>
              <p className="mt-1 text-[26px] font-bold tabular-nums text-foreground">{num(v)}</p>
            </div>
          ))}
        </div>
      )}
      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <Group title={`Đang online · ${online.items?.length ?? 0}`} footer="Hoạt động trong 10 phút qua.">
          {!online.items ? <Loading /> : !online.items.length ? <Empty icon="bedtime">Không ai online.</Empty> : (
            <ul className="divide-y divide-border text-[14px]">
              {online.items.map((l) => (
                <li key={l._id}><button type="button" onClick={() => openLearner(l.email)} className="flex w-full items-start gap-3 px-4 py-2.5 text-left hover:bg-muted/60">
                  <span className="pt-1.5"><Dot on /></span>
                  <span className="min-w-0 flex-1"><b className="text-foreground">{l.nickname || l.email}</b> <span className="text-[13px] text-muted-foreground">· {ago(l.lastActiveAt)}</span><LearningLine learning={l.learning} /></span>
                </button></li>
              ))}
            </ul>
          )}
        </Group>
        <Group title="Hoạt động học trực tiếp">
          {feed.error && <p role="alert" className="p-4 text-destructive">{feed.error}</p>}
          <ActivityList items={feed.items} onOpen={openLearner} />
        </Group>
      </div>
    </div>
  );
}

// ── Trang: Người học ──────────────────────────────────────────────────────────
function Learners({ openLearner }) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("all");
  useTick();
  const list = useList(`/admin/learners?q=${encodeURIComponent(query)}${filter === "online" ? "&online=1" : ""}`, touches);
  const add = act(async () => {
    const v = await ask({ title: "Thêm người học", confirm: "Tạo", fields: [
      { name: "email", label: "Email", type: "email", required: true },
      { name: "name", label: "Tên" }, { name: "nickname", label: "Biệt danh", hint: "2–20 ký tự, chỉ chữ và emoji." },
    ] });
    if (!v) return false;
    await call("/admin/learners", { method: "POST", body: v });
    openLearner(v.email.trim().toLowerCase());
  }, list.reload, "Đã tạo người học.");
  return (
    <div className="space-y-4">
      <Toolbar>
        <Search placeholder="Email, biệt danh hoặc mã bạn" onSearch={setQuery} />
        <Segmented label="Lọc" value={filter} onChange={setFilter} options={[["all", "Tất cả"], ["online", "Đang online"]]} />
        <Btn tone="primary" icon="person_add" onClick={add}>Thêm</Btn>
      </Toolbar>
      <Group footer={list.items ? `${num(list.items.length)} người${list.items.length >= 200 ? " · 200 người hoạt động gần nhất" : ""}` : null}>
        <Table list={list} onRow={(l) => openLearner(l.email)} empty="Không tìm thấy ai." head={["Người học", "Đang học", "Step qua", "Ngọc", "Chuỗi", "Hoạt động"]} row={(l) => [
          <span key="n" className="flex items-start gap-2.5"><span className="pt-1.5"><Dot on={isOnline(l.lastActiveAt)} /></span><span className="min-w-0">
            <b>{l.nickname || l.name || "—"}</b> {l.bannedAt && <Badge tone="red">Đã khoá</Badge>}
            <br /><small className="text-muted-foreground">{l.email}</small></span></span>,
          <span key="l" className="block max-w-[320px]"><LearningLine learning={l.learning} /></span>,
          <span key="s" className="tabular-nums">{l.steps}</span>, <span key="g" className="tabular-nums">{num(l.gems)}</span>,
          l.streak ? `${l.streak} ngày` : "—",
          <span key="t" className="whitespace-nowrap text-muted-foreground">{ago(l.lastActiveAt)}</span>,
        ]} />
      </Group>
    </div>
  );
}

const PRIVATE_LABELS = { birthDate: "Ngày sinh", province: "Tỉnh/thành", gender: "Giới tính", ageGroup: "Nhóm tuổi" };

function LearnerDetail({ email, onClose }) {
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [priv, setPriv] = useState(null);
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

  const l = d?.learner;
  const edit = act(async () => {
    const v = await ask({ title: "Sửa thông tin", confirm: "Lưu", fields: [
      { name: "name", label: "Tên", value: l.name || "" }, { name: "nickname", label: "Biệt danh", value: l.nickname || "" },
      { name: "shields", label: "Khiên lửa", type: "number", min: 0, max: 99, value: String(l.shields ?? 0) },
      { name: "intro", label: "Giới thiệu", type: "textarea", maxLength: 300, value: l.intro || "" },
    ] });
    if (!v) return false;
    await call(path, { method: "PATCH", body: v });
  }, load, "Đã lưu.");
  const gems = act(async () => {
    const v = await ask({ title: "Điều chỉnh Ngọc", message: `Hiện có ${num(l.gems)} Ngọc. Số âm để trừ.`, confirm: "Điều chỉnh", fields: [
      { name: "amount", label: "Số Ngọc", type: "number", required: true, placeholder: "vd. 50 hoặc -20" },
      { name: "note", label: "Lý do", required: true, maxLength: 200, hint: "Ghi vào sổ Ngọc và nhật ký quản trị." },
    ] });
    if (!v) return false;
    await call(`${path}/gems`, { method: "POST", body: { amount: Number(v.amount), note: v.note } });
  }, load, "Đã điều chỉnh Ngọc.");
  const reset = act(async () => {
    if (!(await confirmAction("Xoá hồ sơ công khai?", "Xoá biệt danh, giới thiệu, nhân vật và link mạng xã hội của người này.", "Xoá hồ sơ"))) return false;
    await call(`${path}/reset-persona`, { method: "POST" });
  }, load, "Đã xoá hồ sơ công khai.");
  const ban = act(async (on) => {
    if (on) {
      const v = await ask({ title: "Khoá tài khoản?", message: "Người này bị đăng xuất khỏi mọi máy ngay và không học được nữa.", confirm: "Khoá", tone: "danger", fields: [{ name: "reason", label: "Lý do", required: true, maxLength: 200 }] });
      if (!v) return false;
      await call(`${path}/ban`, { method: "POST", body: { ban: true, reason: v.reason } });
    } else await call(`${path}/ban`, { method: "POST", body: { ban: false } });
  }, load, "Đã cập nhật.");
  const erase = async () => {
    const v = await ask({ title: "Xoá vĩnh viễn?", tone: "danger", confirm: "Xoá vĩnh viễn",
      message: `Mọi dữ liệu học của ${email} bị xoá và không khôi phục được.`,
      fields: [{ name: "confirm", label: "Gõ lại email để xác nhận", match: email, placeholder: email }] });
    if (!v) return;
    try { await call(path, { method: "DELETE", body: { confirm: email } }); toast("Đã xoá tài khoản."); onClose(); } catch (e) { if (!e.cancelled) toast(e.message, "error"); }
  };
  const showPrivate = act(async () => { setPriv(await call(`${path}/private`)); });
  const steps = act(async (ids, done) => {
    if (!done && !(await confirmAction(`Gỡ ${ids.length} step?`, "Xoá cả bài đã học và điểm của các step này.", "Gỡ"))) return false;
    if (done && ids.length > 1 && !(await confirmAction(`Hoàn tất ${ids.length} step?`, "Không cộng Ngọc, XP hay thưởng chặng — chỉ sửa tiến độ.", "Hoàn tất", "primary"))) return false;
    await call(`${path}/steps`, { method: "POST", body: { stepIds: ids, done } });
  }, load, "Đã cập nhật tiến độ.");
  const removeLink = act(async (key) => {
    if (!(await confirmAction(`Gỡ link ${key}?`, null, "Gỡ"))) return false;
    await call(`${path}/links`, { method: "POST", body: { key } });
  }, load, "Đã gỡ link.");

  return (
    <Sheet onClose={onClose} title={<span className="flex items-center gap-2"><Dot on={isOnline(l?.lastActiveAt)} />{l?.nickname || email}</span>}
      toolbar={l && <Btn small tone="ghost" icon="edit" onClick={edit}>Sửa</Btn>}>
      {err && <p role="alert" className="text-destructive">{err}</p>}
      {!d ? <Loading /> : (<>
        {(l.bannedAt || l.ageMismatch) && (
          <div className="space-y-1 rounded-2xl bg-destructive/10 p-4 text-[15px] font-semibold text-destructive">
            {l.bannedAt && <p>Đã khoá từ {fmt(l.bannedAt)}</p>}
            {l.ageMismatch && <p>Ngày sinh dưới 16 nhưng đã chọn 16+ (thiếu xác nhận phụ huynh)</p>}
          </div>
        )}
        <Group title="Thông tin">
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 text-[14px] sm:grid-cols-3">
            {[["Email", l.email], ["Tên", l.name || "—"], ["Biệt danh", l.nickname || "—"], ["Mã bạn", l.friendCode || "—"],
              ["Ngọc", num(l.gems)], ["Khiên lửa", l.shields ?? 0],
              ["Chuỗi lửa", `${l.streak?.count ?? 0} ngày${l.streak?.studiedToday ? " · đã học hôm nay" : ""}`],
              ["Hoạt động", ago(l.lastActiveAt)], ["Tạo lúc", fmt(l.createdAt)],
            ].map(([k, v]) => <div key={k} className="min-w-0"><dt className="text-[12px] text-muted-foreground">{k}</dt><dd className="break-words text-foreground">{v}</dd></div>)}
          </dl>
          {l.intro && <p className="border-t border-border px-4 py-3 text-[14px] text-muted-foreground">“{l.intro}”</p>}
          <div className="border-t border-border px-4 py-3"><LearningLine learning={d.learning} /></div>
        </Group>

        <Group title="Dữ liệu riêng tư" footer="Ẩn mặc định. Mỗi lần xem cần xác thực lại và được ghi vào nhật ký quản trị.">
          {priv ? (
            <dl className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 text-[14px] sm:grid-cols-4">
              {Object.entries(PRIVATE_LABELS).map(([k, label]) => <div key={k}><dt className="text-[12px] text-muted-foreground">{label}</dt><dd className="text-foreground">{priv[k] || "—"}</dd></div>)}
            </dl>
          ) : (
            <div className="flex items-center justify-between gap-3 p-4">
              <span className="text-[15px] text-muted-foreground">{l.hasPrivate ? "Ngày sinh, tỉnh/thành, giới tính, nhóm tuổi" : "Người này chưa khai báo."}</span>
              {l.hasPrivate && <Btn small icon="visibility" onClick={showPrivate}>Hiện</Btn>}
            </div>
          )}
        </Group>

        {Object.values(l.links || {}).some(Boolean) && (
          <Group title="Link mạng xã hội">
            <ul className="divide-y divide-border text-[14px]">
              {Object.entries(l.links).filter(([, v]) => v).map(([k, v]) => (
                <li key={k} className="flex items-center gap-3 px-4 py-2"><b className="w-20 shrink-0 capitalize">{k}</b>
                  <a className="min-w-0 flex-1 break-all text-primary hover:underline" href={v} target="_blank" rel="noopener noreferrer nofollow">{v}</a>
                  <Btn small tone="danger-plain" onClick={() => removeLink(k)}>Gỡ</Btn></li>
              ))}
            </ul>
          </Group>
        )}

        <Group title="Tiến độ học">
          <div className="divide-y divide-border">{d.progress.map((c) => <CourseProgress key={c.key} course={c} current={d.learning?.stepId} onSteps={steps} />)}</div>
        </Group>
        <Group title="Hoạt động học · 30 ngày"><ActivityList items={d.activity} /></Group>
        <Group title="Sổ Ngọc">
          {!d.gems.length ? <Empty icon="diamond">Chưa có giao dịch.</Empty> : (
            <ul className="max-h-72 divide-y divide-border overflow-auto text-[14px]">
              {d.gems.map((g) => <li key={g._id} className="flex gap-3 px-4 py-2"><span className="w-28 shrink-0 text-muted-foreground">{fmt(g.createdAt)}</span>
                <b className={`w-16 shrink-0 text-right tabular-nums ${g.amount > 0 ? "text-success" : "text-destructive"}`}>{g.amount > 0 ? "+" : ""}{g.amount}</b>
                <span className="min-w-0 flex-1">{g.reason}{g.note ? ` · ${g.note}` : ""}</span></li>)}
            </ul>
          )}
        </Group>
        {d.receipts.length > 0 && (
          <Group title="Đơn cửa hàng">
            <ul className="divide-y divide-border text-[14px]">{d.receipts.map((r) => <li key={r._id} className="px-4 py-2">{fmt(r.createdAt)} · {r.slug || r.productId} · {r.price} Ngọc</li>)}</ul>
          </Group>
        )}
        {d.reports.length > 0 && (
          <Group title={`${d.reports.length} báo cáo về người này`}>
            <ul className="divide-y divide-border text-[14px]">{d.reports.map((r) => <li key={r._id} className="px-4 py-2">{fmt(r.createdAt)} · {r.reason}{r.note ? ` · ${r.note}` : ""} · {REPORT_STATUS[r.status] || r.status}</li>)}</ul>
          </Group>
        )}

        <Group title="Quản lý tài khoản">
          <div className="flex flex-wrap gap-2 p-4">
            <Btn icon="diamond" onClick={gems}>Điều chỉnh Ngọc</Btn>
            <Btn icon="person_off" onClick={reset}>Xoá hồ sơ công khai</Btn>
            {l.bannedAt ? <Btn icon="lock_open" onClick={() => ban(false)}>Mở khoá</Btn> : <Btn tone="danger-plain" icon="block" onClick={() => ban(true)}>Khoá tài khoản</Btn>}
            <Btn tone="danger" icon="delete_forever" onClick={erase}>Xoá vĩnh viễn</Btn>
          </div>
        </Group>
      </>)}
    </Sheet>
  );
}

function CourseProgress({ course: c, current, onSteps }) {
  const started = c.done > 0 || c.steps.some((s) => s.lessons);
  const ready = c.steps.filter((s) => !s.draft);
  return (
    <details open={started}>
      <summary className="flex min-h-[52px] cursor-pointer list-none flex-wrap items-center gap-3 px-4 py-2">
        <b className="text-[15px] text-foreground">{c.title}</b>
        <span className="text-[13px] tabular-nums text-muted-foreground">{c.done}/{c.total} step</span>
        <span className="h-2 min-w-[80px] flex-1 overflow-hidden rounded-full bg-muted" role="progressbar" aria-valuenow={c.done} aria-valuemax={c.total} aria-label={c.title}>
          <span className="block h-full rounded-full bg-success" style={{ width: `${c.total ? (c.done / c.total) * 100 : 0}%` }} />
        </span>
      </summary>
      <div className="flex flex-wrap gap-2 px-4 pb-2">
        <Btn small onClick={() => onSteps(ready.filter((s) => !s.done).map((s) => s.id), true)} disabled={c.done === c.total}>Hoàn tất cả khoá</Btn>
        <Btn small tone="danger-plain" onClick={() => onSteps(ready.filter((s) => s.done || s.lessons).map((s) => s.id), false)} disabled={!started}>Gỡ cả khoá</Btn>
      </div>
      <ul className="divide-y divide-border border-t border-border">
        {c.steps.map((s, i) => {
          const state = s.done ? "done" : s.lessons ? "doing" : "todo";
          return (
            <li key={s.id} className={`flex flex-wrap items-center gap-x-3 gap-y-1 px-4 py-2 text-[14px] ${s.id === current ? "bg-info/10" : ""} ${s.draft ? "opacity-50" : ""}`}>
              <Badge tone={state === "done" ? "green" : state === "doing" ? "amber" : "gray"}>{state === "done" ? "Đã qua" : state === "doing" ? "Đang học" : "Chưa"}</Badge>
              <span className="min-w-0 flex-1 text-foreground">{s.title}</span>
              <span className="text-[13px] tabular-nums text-muted-foreground">{s.total ? `bài ${s.lessons}/${s.total}` : ""}{s.score ? ` · điểm ${s.score.best}% (${s.score.attempts} lần)` : ""}</span>
              {!s.draft && (
                <span className="flex gap-1">
                  {!s.done && <Btn small tone="ghost" onClick={() => onSteps([s.id], true)}>Hoàn tất</Btn>}
                  {!s.done && !s.lessons && i > 0 && <Btn small tone="ghost" title="Hoàn tất mọi step từ đầu khoá tới step này" onClick={() => onSteps(ready.slice(0, ready.indexOf(s) + 1).filter((x) => !x.done).map((x) => x.id), true)}>Tới đây</Btn>}
                  {(s.done || s.lessons) && <Btn small tone="danger-plain" onClick={() => onSteps([s.id], false)}>Gỡ</Btn>}
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </details>
  );
}

function Duplicates() {
  const list = useList("/admin/duplicates");
  return (
    <Group footer="Nhiều email đăng nhập từ cùng IP và trình duyệt. Chỉ là gợi ý — trường học, gia đình dùng chung máy là bình thường. IP đã được che bớt.">
      <Table list={list} empty="Không có nhóm nào." head={["Email", "Số tài khoản", "IP", "Lần cuối"]} row={(g) => [
        <span key="e" className="whitespace-pre-line">{g.emails.join("\n")}</span>, g.emails.length, <code key="i">{g.ip}</code>, fmt(g.lastAt),
      ]} />
    </Group>
  );
}

function MemberLinks() {
  const list = useList("/admin/links");
  const remove = (email, key) => act(async () => {
    if (!(await confirmAction(key ? `Gỡ link ${key}?` : "Gỡ mọi link?", `Của ${email}.`, "Gỡ"))) return false;
    await call(`/admin/learners/${encodeURIComponent(email)}/links`, { method: "POST", body: { key } });
  }, list.reload, "Đã gỡ link.");
  return (
    <Group footer="Link member tự gắn vào hồ sơ, mới sửa lên trước. Gỡ link quảng cáo hoặc độc hại.">
      <Table list={list} empty="Chưa ai gắn link." head={["Người học", "Link", "Sửa lúc", ""]} row={(l) => [
        <span key="n">{l.nickname || "—"}<br /><small className="text-muted-foreground">{l.email}</small></span>,
        <ul key="l" className="space-y-1">{Object.entries(l.links || {}).filter(([, v]) => v).map(([k, v]) => (
          <li key={k} className="flex items-center gap-2"><b className="w-20 shrink-0 capitalize">{k}</b><a className="break-all text-primary hover:underline" href={v} target="_blank" rel="noopener noreferrer nofollow">{v}</a><Btn small tone="danger-plain" onClick={remove(l.email, k)}>Gỡ</Btn></li>
        ))}</ul>,
        <span key="t" className="whitespace-nowrap">{fmt(l.updatedAt)}</span>,
        <Btn key="x" small tone="danger-plain" onClick={remove(l.email)}>Gỡ hết</Btn>,
      ]} />
    </Group>
  );
}

// ── Nội dung ──────────────────────────────────────────────────────────────────
function Announce() {
  const empty = { title: "", body: "", url: "/learn" };
  const [f, setF] = useState(empty);
  const [busy, setBusy] = useState(false);
  const send = async (e) => {
    e.preventDefault();
    if (!(await confirmAction("Gửi thông báo?", `“${f.title}” sẽ tới hộp thư và máy của mọi người theo dõi Education Hugo. Không thu hồi được.`, "Gửi", "primary"))) return;
    setBusy(true);
    try { const r = await call("/admin/announce", { method: "POST", body: f }); toast(`Đã gửi tới ${num(r.sent)} người.`); setF(empty); }
    catch (err) { if (!err.cancelled) toast(err.message, "error"); } finally { setBusy(false); }
  };
  return (
    <form onSubmit={send} className="max-w-xl space-y-4">
      <Group footer="Gửi từ tài khoản chính thức Education Hugo.">
        <div className="space-y-3 p-4">
          <Field label={`Tiêu đề · ${f.title.length}/120`}><Input maxLength={120} value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} required /></Field>
          <Field label={`Nội dung · ${f.body.length}/500`}><Textarea rows={4} maxLength={500} value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} required /></Field>
          <Field label="Mở trang khi bấm" hint="Đường dẫn trong app, vd. /store"><Input value={f.url} onChange={(e) => setF({ ...f, url: e.target.value })} /></Field>
        </div>
      </Group>
      <Btn type="submit" tone="primary" icon="send" disabled={busy || !f.title.trim() || !f.body.trim()}>{busy ? "Đang gửi…" : "Gửi thông báo"}</Btn>
    </form>
  );
}

function Articles() {
  const list = useList("/admin/articles");
  const [mascots, setMascots] = useState([]);
  const empty = { _id: null, title: "", text: "", mascot: "cast-1" };
  const [form, setForm] = useState(empty);
  useEffect(() => { call("/admin/articles").then((d) => setMascots(d.mascots || [])).catch(() => {}); }, []);
  const save = act(async () => {
    await call(form._id ? `/admin/articles/${form._id}` : "/admin/articles", { method: form._id ? "PUT" : "POST", body: form });
    setForm(empty);
  }, list.reload, form._id ? "Đã lưu bài." : "Đã đăng bài.");
  const remove = (a) => act(async () => {
    if (!(await confirmAction("Xoá bài này?", `“${a.title || a.text.slice(0, 40)}” và mọi bình luận sẽ bị xoá.`, "Xoá"))) return false;
    await call(`/admin/articles/${a._id}`, { method: "DELETE" });
  }, list.reload, "Đã xoá bài.");
  return (
    <div className="space-y-6">
      <Group title={form._id ? "Sửa bài" : "Viết bài mới"}>
        <div className="space-y-4 p-4">
          <div>
            <p className="mb-2 text-[13px] font-medium text-muted-foreground">Mascot đại diện</p>
            <div className="flex flex-wrap gap-2" role="radiogroup" aria-label="Mascot đại diện">
              {mascots.map((m) => (
                <button key={m} type="button" role="radio" aria-checked={form.mascot === m} aria-label={m} onClick={() => setForm({ ...form, mascot: m })}
                  className={`grid h-[60px] w-[60px] place-items-center rounded-xl border-2 ${form.mascot === m ? "border-primary bg-primary-muted" : "border-border"}`}>
                  <img src={`/edu/${m}.svg`} alt="" className="h-11 w-11 object-contain" />
                </button>
              ))}
            </div>
          </div>
          <Field label="Tiêu đề (không bắt buộc)"><Input maxLength={120} value={form.title || ""} onChange={(e) => setForm({ ...form, title: e.target.value })} /></Field>
          <Field label="Nội dung" hint="Dán link YouTube, GitHub hoặc ảnh sẽ tự có xem trước."><Textarea rows={8} value={form.text} onChange={(e) => setForm({ ...form, text: e.target.value })} /></Field>
          <div className="flex flex-wrap gap-2">
            <Btn tone="primary" onClick={save} disabled={!form.text.trim()}>{form._id ? "Lưu thay đổi" : "Đăng bài"}</Btn>
            {form._id && <Btn onClick={() => setForm(empty)}>Huỷ sửa</Btn>}
          </div>
        </div>
      </Group>
      <Group title="Đã đăng">
        <Table list={list} empty="Chưa có bài." head={["", "Bài", "Tim", "Bình luận", "Lúc đăng", ""]} row={(a) => [
          <img key="m" src={`/edu/${a.mascot || "cast-1"}.svg`} alt="" className="h-9 w-9" />,
          <span key="t"><b>{a.title || "(không tiêu đề)"}</b><br /><span className="text-muted-foreground">{a.text.slice(0, 90)}{a.text.length > 90 ? "…" : ""}</span></span>,
          a.likeCount || 0, a.replyCount || 0, <span key="d" className="whitespace-nowrap">{fmt(a.createdAt)}</span>,
          <div key="a" className="flex gap-2"><Btn small onClick={() => { setForm({ _id: a._id, title: a.title || "", text: a.text, mascot: a.mascot || "cast-1" }); window.scrollTo(0, 0); }}>Sửa</Btn><Btn small tone="danger-plain" onClick={remove(a)}>Xoá</Btn></div>,
        ]} />
      </Group>
    </div>
  );
}

const LANGS = [["vi", "Tiếng Việt"], ["en", "English"], ["zh", "中文"]];
const PROMO_FIELDS = [["badge", "Nhãn", 30], ["title", "Tiêu đề", 80], ["body", "Nội dung", 240], ["cta", "Nút", 30]];
function Promos() {
  const [form, setForm] = useState(null);
  const [lang, setLang] = useState("vi");
  const [err, setErr] = useState("");
  useEffect(() => {
    call("/admin/promo/developer").then((d) => setForm({ enabled: true, image: "", href: "/developer-team", text: {}, ...d.promo })).catch((e) => setErr(e.message));
  }, []);
  if (!form) return err ? <p role="alert" className="text-destructive">{err}</p> : <Loading />;
  const setText = (k, value) => setForm({ ...form, text: { ...form.text, [lang]: { ...form.text?.[lang], [k]: value } } });
  const upload = (file) => {
    if (!file) return;
    if (file.size > 150_000) return toast("Ảnh quá 150 KB — nén lại (WebP) rồi tải lên.", "error");
    const reader = new FileReader();
    reader.onload = () => setForm((f) => ({ ...f, image: reader.result }));
    reader.readAsDataURL(file);
  };
  const save = act(async () => { const d = await call("/admin/promo/developer", { method: "PUT", body: form }); setForm({ ...form, ...d.promo }); }, null, "Đã lưu. App cập nhật trong khoảng 1 phút.");
  const t = form.text?.[lang] || {};
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_360px]">
      <Group footer="Ô để trống thì app dùng chữ mặc định.">
        <div className="space-y-4 p-4">
          <label className="flex min-h-[44px] items-center justify-between gap-3 text-[15px] text-foreground">Hiện quảng cáo ở Hồ sơ
            <input type="checkbox" role="switch" className="h-6 w-6 accent-[hsl(var(--success))]" checked={form.enabled !== false} onChange={(e) => setForm({ ...form, enabled: e.target.checked })} /></label>
          <Segmented label="Ngôn ngữ" value={lang} onChange={setLang} options={LANGS} />
          {PROMO_FIELDS.map(([k, label, max]) => (
            <Field key={k} label={`${label} · ${(t[k] || "").length}/${max}`}>
              {k === "body" ? <Textarea value={t[k] || ""} maxLength={max} rows={3} onChange={(e) => setText(k, e.target.value)} /> : <Input value={t[k] || ""} maxLength={max} onChange={(e) => setText(k, e.target.value)} />}
            </Field>
          ))}
          <Field label="Ảnh" hint="Đường dẫn /…, https://… hoặc tải lên (tối đa 150 KB).">
            <Input value={form.image?.startsWith("data:") ? "(ảnh đã tải lên)" : form.image || ""} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="/edu/dev-rocket.webp" />
          </Field>
          <div className="flex flex-wrap gap-2">
            <label className="inline-flex min-h-[44px] cursor-pointer items-center gap-1.5 rounded-[10px] bg-muted px-4 text-[15px] font-semibold text-foreground"><Icon name="upload" />Tải ảnh lên<input type="file" accept="image/png,image/jpeg,image/webp,image/gif" hidden onChange={(e) => upload(e.target.files?.[0])} /></label>
            <Btn tone="ghost" onClick={() => setForm({ ...form, image: "" })}>Dùng ảnh mặc định</Btn>
          </div>
          <Field label="Link khi bấm"><Input value={form.href || ""} onChange={(e) => setForm({ ...form, href: e.target.value })} placeholder="/developer-team" /></Field>
          <Btn tone="primary" onClick={save}>Lưu</Btn>
        </div>
      </Group>
      <Group title="Xem trước">
        <div className={`flex items-center gap-3 p-4 ${form.enabled === false ? "opacity-40" : ""}`}>
          <div className="min-w-0 flex-1 space-y-1">
            <span className="inline-block rounded-md bg-yellow-400 px-2 py-0.5 text-[12px] font-black italic text-blue-900">{t.badge || "HUGO DEVELOPER"}</span>
            <b className="block text-[17px] text-foreground">{t.title || "(tiêu đề mặc định)"}</b>
            <p className="text-[14px] text-muted-foreground">{t.body || "(nội dung mặc định)"}</p>
            <span className="text-[13px] font-black uppercase text-primary">{t.cta || "Tìm hiểu"}</span>
          </div>
          <img src={form.image || "/edu/dev-rocket.webp"} alt="" className="h-[112px] w-[112px] flex-none rounded-2xl object-cover" />
        </div>
      </Group>
    </div>
  );
}

function Slides() {
  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {Array.from({ length: 10 }, (_, i) => (
        <a key={i} href={`/slides/buoi${i + 1}.html`} target="_blank" rel="noreferrer" className="block rounded-2xl border border-border bg-card p-4 text-[14px] text-foreground transition hover:border-primary">
          <h2 className="flex items-center justify-between text-[16px] font-bold">Buổi {i + 1} · step {i * 4 + 1}–{i * 4 + 4}<Icon name="open_in_new" className="text-muted-foreground" /></h2>
          <ol className="mt-1 list-decimal pl-5 text-muted-foreground" start={i * 4 + 1}>{OUTLINE.slice(i * 4, i * 4 + 4).map(([, title]) => <li key={title}>{title}</li>)}</ol>
        </a>
      ))}
    </div>
  );
}

// ── Kinh doanh ────────────────────────────────────────────────────────────────
const KINDS = [["badge", "Huy hiệu"], ["xp_boost", "Tăng XP"], ["streak_shield", "Khiên lửa"]];
function Store() {
  const list = useList("/admin/products");
  const receipts = useList("/admin/receipts");
  const create = act(async () => {
    const v = await ask({ title: "Thêm sản phẩm", confirm: "Thêm", fields: [
      { name: "slug", label: "Slug", required: true, hint: "Chữ thường a-z, số, dấu gạch ngang." },
      { name: "name", label: "Tên tiếng Việt", required: true },
      { name: "price", label: "Giá (Ngọc)", type: "number", min: 0, required: true },
      { name: "kind", label: "Loại", type: "select", value: "badge", options: KINDS },
    ] });
    if (!v) return false;
    await call("/admin/products", { method: "POST", body: { slug: v.slug, name: { vi: v.name }, price: Number(v.price), kind: v.kind } });
  }, list.reload, "Đã thêm sản phẩm.");
  const edit = (p, k, label, hint) => act(async () => {
    const v = await ask({ title: `${label} · ${p.name?.vi || p.slug}`, confirm: "Lưu", fields: [{ name: k, label, type: "number", min: 0, value: String(p[k] ?? ""), hint }] });
    if (!v) return false;
    await call(`/admin/products/${p._id}`, { method: "PATCH", body: v });
  }, list.reload, "Đã lưu.");
  const toggle = (p) => act(() => call(`/admin/products/${p._id}`, { method: "PATCH", body: { active: !p.active } }), list.reload, p.active ? "Đã ẩn." : "Đang bán.");
  return (
    <div className="space-y-6">
      <Group title="Sản phẩm" action={<Btn small tone="primary" icon="add" onClick={create}>Thêm</Btn>}>
        <Table list={list} empty="Chưa có sản phẩm." head={["Sản phẩm", "Loại", "Giá", "Kho", "Trạng thái", ""]} row={(p) => [
          <span key="n"><b>{p.name?.vi}</b><br /><code className="text-[12px] text-muted-foreground">{p.slug}</code></span>,
          KINDS.find(([k]) => k === p.kind)?.[1] || p.kind, <span key="p" className="tabular-nums">{num(p.price)}</span>, p.stock ?? "Không giới hạn",
          <Badge key="s" tone={p.active ? "green" : "gray"}>{p.active ? "Đang bán" : "Đã ẩn"}</Badge>,
          <span key="a" className="flex flex-wrap gap-1.5">
            <Btn small onClick={edit(p, "price", "Giá (Ngọc)")}>Giá</Btn>
            <Btn small onClick={edit(p, "stock", "Kho", "Để trống = không giới hạn.")}>Kho</Btn>
            <Btn small tone="ghost" onClick={toggle(p)}>{p.active ? "Ẩn" : "Bán"}</Btn>
          </span>,
        ]} />
      </Group>
      <Group title="Đơn gần đây">
        <Table list={receipts} empty="Chưa có đơn." head={["Lúc", "Email", "Sản phẩm", "Giá"]} row={(r) => [fmt(r.createdAt), r.email, r.slug || r.productId, num(r.price)]} />
      </Group>
    </div>
  );
}

const keyStatus = (k) => (k.revokedAt ? ["red", "Đã thu hồi"] : new Date(k.expiresAt) < new Date() ? ["gray", "Hết hạn"] : ["green", "Hoạt động"]);
function Partners() {
  const list = useList("/admin/partners");
  const blank = { email: "", days: 30, origins: "", note: "" };
  const [form, setForm] = useState(blank);
  const [q, setQ] = useState("");
  const issue = act(async (e) => {
    e.preventDefault();
    const out = await call("/admin/partners", { method: "POST", body: { ...form, origins: form.origins.split(/[\s,]+/).filter(Boolean) } });
    setForm(blank);
    return out;
  }, list.reload, (o) => `Đã gửi key …${o.last4} tới ${o.email}.`);
  const revoke = (k) => act(async () => {
    if (!(await confirmAction(`Thu hồi key …${k.last4}?`, `Của ${k.email}. Có hiệu lực ngay lập tức: thư viện, REST API và 12 mascot trên trang của đối tác ngừng hoạt động từ yêu cầu kế tiếp. Không hoàn tác được — muốn dùng lại phải cấp key mới.`, "Thu hồi"))) return false;
    await call(`/admin/partners/${k._id}/revoke`, { method: "POST" });
  }, list.reload, "Đã thu hồi key.");
  const extend = (k) => act(async () => {
    const v = await ask({ title: `Gia hạn key …${k.last4}`, message: `Hết hạn hiện tại: ${fmt(k.expiresAt)}. Còn lại tối đa 365 ngày.`, confirm: "Gia hạn", fields: [{ name: "days", label: "Thêm số ngày", type: "number", min: 1, max: 365, value: "30", required: true }] });
    if (!v) return false;
    await call(`/admin/partners/${k._id}`, { method: "POST", body: v });
  }, list.reload, "Đã gia hạn.");
  const domains = (k) => act(async () => {
    const v = await ask({ title: `Tên miền của key …${k.last4}`, confirm: "Lưu", fields: [{ name: "origins", label: "Tên miền được phép", type: "textarea", value: (k.origins || []).join("\n"), required: true, hint: "Mỗi dòng một tên miền, vd. https://truong.edu.vn" }] });
    if (!v) return false;
    await call(`/admin/partners/${k._id}`, { method: "POST", body: { origins: v.origins.split(/[\s,]+/).filter(Boolean) } });
  }, list.reload, "Đã lưu tên miền.");
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });
  const needle = q.toLowerCase();
  const shown = { ...list, items: list.items && (needle ? list.items.filter((k) => [k.email, k.last4, k.fingerprint, k.note, ...(k.origins || [])].some((x) => String(x || "").toLowerCase().includes(needle))) : list.items) };
  return (
    <div className="space-y-6">
      <form onSubmit={issue}>
        <Group title="Cấp key mới" footer="Key chỉ nằm trong thư gửi đối tác — máy chủ không lưu bản rõ. Key luôn khoá theo tên miền.">
          <div className="grid gap-3 p-4 sm:grid-cols-2">
            <Field label="Email đối tác"><Input type="email" required value={form.email} onChange={set("email")} /></Field>
            <Field label="Số ngày hiệu lực"><Input type="number" min={1} max={365} value={form.days} onChange={set("days")} /></Field>
            <Field label="Tên miền được phép" hint="Cách nhau dấu phẩy, vd. https://truong.edu.vn, http://localhost:5173"><Input required value={form.origins} onChange={set("origins")} /></Field>
            <Field label="Ghi chú"><Input value={form.note} onChange={set("note")} maxLength={200} /></Field>
            <Btn type="submit" tone="primary" icon="key" className="sm:col-span-2">Cấp key và gửi thư</Btn>
          </div>
        </Group>
      </form>
      <div className="space-y-2">
        <Search placeholder="Tìm email, 4 ký tự cuối, tên miền hoặc mã dấu mascot" onSearch={setQ} />
        <p className="px-1 text-[13px] text-muted-foreground">Gặp mascot bị sao chép? Mở file SVG, tìm <code>data-lic="…"</code> rồi dán mã đó vào ô tìm để biết key nào làm rò rỉ.</p>
      </div>
      <Group title="Key đã cấp">
        <Table list={shown} empty="Không có key nào khớp." head={["Đối tác", "Tên miền", "Hết hạn", "Lượt dùng", "Trạng thái", ""]} row={(k) => {
          const [tone, text] = keyStatus(k);
          return [
            <span key="e"><b>{k.email}</b><br /><small className="text-muted-foreground">key …{k.last4} · dấu <code>{k.fingerprint}</code>{k.note ? ` · ${k.note}` : ""}</small></span>,
            <span key="o" className="whitespace-pre-line text-[13px]">{k.origins?.join("\n") || "Mọi nơi (key cũ)"}</span>,
            <span key="x" className="whitespace-nowrap">{fmt(k.expiresAt)}</span>,
            <span key="u" className="tabular-nums">{num(k.uses)}<br /><small className="text-muted-foreground">{ago(k.lastUsedAt)}</small></span>,
            <Badge key="s" tone={tone}>{text}</Badge>,
            !k.revokedAt && <span key="a" className="flex flex-wrap gap-1.5"><Btn small onClick={extend(k)}>Gia hạn</Btn><Btn small onClick={domains(k)}>Tên miền</Btn><Btn small tone="danger" onClick={revoke(k)}>Thu hồi</Btn></span>,
          ];
        }} />
      </Group>
    </div>
  );
}

const DEV_STATUS = { new: "Mới đăng ký", contacted: "Đã liên hệ", accepted: "Nhận vào", declined: "Chưa phù hợp" };
function Developers() {
  const list = useList("/admin/developers");
  const set = (d, status) => act(() => call(`/admin/developers/${d._id}`, { method: "POST", body: { status } }), list.reload, "Đã cập nhật.");
  return (
    <Group footer={list.items ? `${num(list.items.length)} người đăng ký` : null}>
      <Table list={list} empty="Chưa ai đăng ký." head={["Lúc đăng ký", "Người đăng ký", "Trạng thái"]} row={(d) => [
        <span key="t" className="whitespace-nowrap">{fmt(d.createdAt)}</span>,
        <span key="n"><b>{d.name || "—"}</b><br /><small className="text-muted-foreground">{d.email}</small></span>,
        <Select key="s" aria-label={`Trạng thái của ${d.email}`} value={d.status} onChange={(e) => set(d, e.target.value)()} className="min-w-[160px]">
          {Object.entries(DEV_STATUS).map(([id, label]) => <option key={id} value={id}>{label}</option>)}
        </Select>,
      ]} />
    </Group>
  );
}

// ── An toàn ───────────────────────────────────────────────────────────────────
const REPORT_STATUS = { pending: "Chờ xử lý", actioned: "Đã xử lý", dismissed: "Bỏ qua" };
function Moderation() {
  const [status, setStatus] = useState("pending");
  const reports = useList(`/admin/reports?status=${status}`);
  const posts = useList("/admin/posts");
  const decide = (r, s) => act(() => call(`/admin/reports/${r._id}`, { method: "POST", body: { status: s } }), reports.reload, s === "actioned" ? "Đã đánh dấu xử lý." : "Đã bỏ qua.");
  const hide = (p) => act(async () => {
    if (!p.removed && !(await confirmAction("Ẩn bài đăng?", "Bài biến mất khỏi cộng đồng. Có thể hiện lại sau.", "Ẩn"))) return false;
    await call(`/admin/posts/${p._id}/hide`, { method: "POST", body: { hide: !p.removed } });
  }, posts.reload, p.removed ? "Đã hiện lại." : "Đã ẩn bài.");
  return (
    <div className="space-y-6">
      <Group title="Báo cáo" action={<Segmented label="Trạng thái báo cáo" value={status} onChange={setStatus} options={Object.entries(REPORT_STATUS)} />}>
        <Table list={reports} empty="Không có báo cáo." head={["Lúc", "Người báo → Bị báo", "Lý do", ""]} row={(r) => [
          <span key="t" className="whitespace-nowrap">{fmt(r.createdAt)}</span>,
          <span key="w">{r.reporterEmail}<br /><small className="text-muted-foreground">→ {r.targetEmail}</small></span>,
          [r.reason, r.note].filter(Boolean).join(" · "),
          status === "pending" && <span key="a" className="flex gap-1.5"><Btn small tone="primary" onClick={decide(r, "actioned")}>Đã xử lý</Btn><Btn small onClick={decide(r, "dismissed")}>Bỏ qua</Btn></span>,
        ]} />
      </Group>
      <Group title="Bài đăng cộng đồng">
        <Table list={posts} empty="Chưa có bài." head={["Lúc", "Tác giả", "Nội dung", "Thích", ""]} row={(p) => [
          <span key="t" className="whitespace-nowrap">{fmt(p.createdAt)}</span>, p.authorEmail,
          <span key="x" className="line-clamp-2 max-w-[420px]">{p.removed && <Badge tone="red">Đã ẩn</Badge>} {p.text}</span>, p.likeCount ?? 0,
          <Btn key="a" small tone={p.removed ? "plain" : "danger-plain"} onClick={hide(p)}>{p.removed ? "Hiện lại" : "Ẩn"}</Btn>,
        ]} />
      </Group>
    </div>
  );
}

const FB_STATUS = { new: ["blue", "Mới"], seen: ["gray", "Đã xem"], fixed: ["green", "Đã sửa"] };
function Feedback() {
  const lesson = useList("/admin/lesson-feedback");
  const survey = useList("/admin/feedback");
  const mark = (f, status) => act(() => call(`/admin/lesson-feedback/${f._id}`, { method: "POST", body: { status } }), lesson.reload, "Đã cập nhật.");
  return (
    <div className="space-y-6">
      <Group title="Góp ý bài học">
        <Table list={lesson} empty="Chưa có góp ý." head={["Lúc", "Bài", "Nội dung", "Trạng thái", ""]} row={(f) => {
          const [tone, text] = FB_STATUS[f.status] || ["gray", f.status];
          return [
            <span key="t" className="whitespace-nowrap">{fmt(f.createdAt)}<br /><small className="text-muted-foreground">{f.email}</small></span>,
            <code key="l">{f.lessonId}</code>, <span key="m" className="block max-w-[420px]">{f.message}</span>, <Badge key="s" tone={tone}>{text}</Badge>,
            <span key="a" className="flex gap-1.5">{f.status !== "seen" && f.status !== "fixed" && <Btn small onClick={mark(f, "seen")}>Đã xem</Btn>}{f.status !== "fixed" && <Btn small tone="primary" onClick={mark(f, "fixed")}>Đã sửa</Btn>}</span>,
          ];
        }} />
      </Group>
      <Group title="Phiếu đánh giá">
        <Table list={survey} empty="Chưa có phiếu." head={["Lúc", "Email", "Điểm", "Góp ý"]} row={(f) => [
          <span key="t" className="whitespace-nowrap">{fmt(f.createdAt)}</span>, f.email, Object.values(f.ratings || {}).join(" · "), f.comment || "—",
        ]} />
      </Group>
    </div>
  );
}

// ── Bảo mật ───────────────────────────────────────────────────────────────────
const PASSKEY_SET = "edu.admin.passkey";
const device = (ua) => {
  const os = /iPhone|iPad/.test(ua) ? "iOS" : /Mac OS/.test(ua) ? "macOS" : /Android/.test(ua) ? "Android" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "Thiết bị lạ";
  const br = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "";
  return [br, os].filter(Boolean).join(" trên ");
};
function Security({ me, signOut }) {
  const [d, setD] = useState(null);
  const [err, setErr] = useState("");
  const [passkey, setPasskey] = useState(() => { try { return localStorage.getItem(PASSKEY_SET) === "1"; } catch { return false; } });
  const load = useCallback(() => { call("/admin/security").then(setD).catch((e) => setErr(e.message)); }, []);
  useEffect(load, [load]);
  useTick();
  const revoke = (s) => act(async () => {
    if (!(await confirmAction("Đăng xuất phiên này?", `${s.email} · ${device(s.ua)} · IP ${s.ip}. Có hiệu lực ngay.`, "Đăng xuất"))) return false;
    await call(`/admin/sessions/${s.id}/revoke`, { method: "POST" });
  }, load, "Đã đăng xuất phiên.");
  const revokeOthers = act(async () => {
    if (!(await confirmAction("Đăng xuất mọi phiên khác?", "Mọi máy khác — của bạn và của các admin khác — bị đăng xuất ngay. Dùng khi nghi lộ phiên hoặc mất máy.", "Đăng xuất tất cả"))) return false;
    return call("/admin/sessions/revoke-others", { method: "POST" });
  }, load, (r) => `Đã đăng xuất ${r.count} phiên.`);
  const addPasskey = act(async () => {
    const r = await (await adminAuthClient()).passkey.addPasskey({ name: device(navigator.userAgent) || "Admin" });
    if (r?.error) throw new Error("Chưa bật được: " + (r.error.message || "bị huỷ"));
    try { localStorage.setItem(PASSKEY_SET, "1"); } catch { /* riêng tư */ }
    setPasskey(true);
  }, null, "Đã bật Face ID / vân tay cho máy này.");
  if (err) return <p role="alert" className="text-destructive">{err}</p>;
  if (!d) return <Loading />;
  const freshLeft = Math.max(0, Math.round((new Date(d.freshUntil) - Date.now()) / 60_000));
  return (
    <div className="space-y-6">
      <Group title="Tài khoản" footer="Phiên quản trị tự hết sau 12 giờ không dùng. Thao tác tối mật (xoá, khoá, Ngọc, key đối tác, xem dữ liệu riêng tư, đăng xuất máy khác) cần xác thực lại nếu đã quá 10 phút.">
        <ul className="divide-y divide-border text-[15px]">
          <li className="flex min-h-[52px] items-center justify-between gap-3 px-4"><span className="text-muted-foreground">Email</span><b className="truncate">{me.email}</b></li>
          <li className="flex min-h-[52px] items-center justify-between gap-3 px-4"><span className="text-muted-foreground">Xác thực tối mật</span>
            {freshLeft > 0 ? <Badge tone="green">Còn {freshLeft} phút</Badge> : <Badge tone="amber">Sẽ hỏi lại</Badge>}</li>
          {hasPasskeyApi() && (
            <li className="flex min-h-[52px] items-center justify-between gap-3 px-4"><span className="text-muted-foreground">Face ID / vân tay trên máy này</span>
              {passkey ? <Badge tone="green">Đã bật</Badge> : <Btn small tone="primary" icon="fingerprint" onClick={addPasskey}>Bật</Btn>}</li>
          )}
          <li><button type="button" onClick={signOut} className="flex min-h-[52px] w-full items-center gap-2 px-4 text-left font-semibold text-destructive hover:bg-muted/60"><Icon name="logout" />Đăng xuất</button></li>
        </ul>
      </Group>

      <Group title={`Phiên đang mở · ${d.sessions.length}`} action={d.sessions.length > 1 && <Btn small tone="danger-plain" onClick={revokeOthers}>Đăng xuất mọi phiên khác</Btn>}
        footer="Mọi admin đều có toàn quyền, kể cả đăng xuất admin khác. IP đã được che bớt.">
        <ul className="divide-y divide-border text-[14px]">
          {d.sessions.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center gap-3 px-4 py-3">
              <Icon name={/iPhone|Android/.test(s.ua) ? "smartphone" : "computer"} className="text-muted-foreground" />
              <span className="min-w-0 flex-1"><b className="text-foreground">{device(s.ua)}</b> {s.current && <Badge tone="blue">Máy này</Badge>}
                <span className="block text-[13px] text-muted-foreground">{s.email} · IP {s.ip || "—"} · đăng nhập {fmt(s.createdAt)} · dùng {ago(s.updatedAt)}</span></span>
              {!s.current && <Btn small tone="danger-plain" onClick={revoke(s)}>Đăng xuất</Btn>}
            </li>
          ))}
        </ul>
      </Group>

      <Group title="Quản trị viên" footer="Danh sách lấy từ biến ADMIN_EMAILS trên Render. Thêm hoặc gỡ admin: sửa biến đó rồi deploy lại — người bị gỡ mất quyền ngay ở yêu cầu kế tiếp.">
        <ul className="divide-y divide-border text-[15px]">
          {d.admins.map((e) => <li key={e} className="flex min-h-[48px] items-center gap-2 px-4"><Icon name="shield_person" className="text-muted-foreground" />{e}{e === me.email && <Badge tone="blue">Bạn</Badge>}</li>)}
        </ul>
      </Group>
    </div>
  );
}

const LOG_LABEL = {
  learner_create: "Tạo người học", learner_update: "Sửa người học", learner_delete: "Xoá người học", step_done: "Hoàn tất step", step_undo: "Gỡ step",
  gems: "Điều chỉnh Ngọc", ban: "Khoá tài khoản", unban: "Mở khoá", reset_persona: "Xoá hồ sơ công khai", private_view: "Xem dữ liệu riêng tư",
  partner_issue: "Cấp key đối tác", partner_update: "Sửa key đối tác", partner_revoke: "Thu hồi key đối tác", announce: "Gửi thông báo",
  session_revoke: "Đăng xuất một phiên", session_revoke_all: "Đăng xuất mọi phiên khác", article_delete: "Xoá bài viết",
};
const SENSITIVE = new Set(["learner_delete", "gems", "ban", "private_view", "partner_issue", "partner_revoke", "session_revoke", "session_revoke_all", "announce"]);
function Log() {
  const [q, setQ] = useState("");
  const list = useList(`/admin/log?q=${encodeURIComponent(q)}`);
  return (
    <div className="space-y-4">
      <Search placeholder="Tìm admin, thao tác hoặc đối tượng" onSearch={setQ} />
      <Group footer="300 thao tác gần nhất. Mọi thao tác ghi đều được lưu kèm IP (đã che bớt) và trình duyệt.">
        <Table list={list} empty="Không có thao tác nào khớp." head={["Lúc", "Admin", "Thao tác", "Đối tượng"]} row={(l) => [
          <span key="t" className="whitespace-nowrap">{fmt(l.createdAt)}</span>,
          <span key="a">{l.admin}<br /><small className="text-muted-foreground">{l.ip ? `IP ${l.ip}` : ""}{l.ua ? ` · ${device(l.ua)}` : ""}</small></span>,
          <span key="x" className="flex flex-wrap items-center gap-1.5">{SENSITIVE.has(l.action) && <Badge tone="amber">Tối mật</Badge>}{LOG_LABEL[l.action] || l.action}</span>,
          <span key="g" className="break-all">{l.target}</span>,
        ]} />
      </Group>
    </div>
  );
}

// ── Khung trang ───────────────────────────────────────────────────────────────
// [tiêu đề nhóm, [[id, nhãn, icon, View, mô tả ngắn]]]
const NAV = [
  ["", [["home", "Bảng điều khiển", "space_dashboard", Overview, "Số liệu, việc cần xử lý, ai đang học."]]],
  ["Người học", [
    ["learners", "Người học", "group", Learners, "Tìm, xem tiến độ, sửa, khoá hoặc xoá tài khoản."],
    ["duplicates", "Nghi trùng tài khoản", "content_copy", Duplicates],
    ["links", "Link mạng xã hội", "link", MemberLinks],
  ]],
  ["Nội dung", [
    ["articles", "Bài viết", "article", Articles], ["promo", "Quảng cáo trong app", "campaign", Promos],
    ["announce", "Gửi thông báo", "notifications", Announce], ["slides", "Slide dạy", "slideshow", Slides, "10 buổi Python cơ bản, mở tab mới để trình chiếu."],
  ]],
  ["Kinh doanh", [
    ["store", "Cửa hàng", "storefront", Store], ["partners", "Đối tác & key", "key", Partners, "Cấp, gia hạn, thu hồi key và tra mascot rò rỉ."],
    ["developers", "Hugo Developer", "code", Developers],
  ]],
  ["An toàn", [["moderation", "Kiểm duyệt", "flag", Moderation], ["feedback", "Góp ý", "rate_review", Feedback]]],
  ["Bảo mật", [["security", "Phiên & quyền", "lock", Security, "Phiên đăng nhập, Face ID, danh sách quản trị viên."], ["log", "Nhật ký quản trị", "history", Log]]],
];
const PAGES = NAV.flatMap(([, items]) => items);
const OLD = { content: "articles", business: "store", safety: "moderation" };
const pageFromPath = () => {
  const id = window.location.pathname.replace(/^\/admin\/?/, "").split("/")[0];
  return PAGES.some(([p]) => p === OLD[id] || p === id) ? OLD[id] || id : "";
};

export default function EduAdmin() {
  const [me, setMe] = useState(undefined);
  const [page, setPage] = useState(pageFromPath);
  const [learner, setLearner] = useState(null);
  const [stats, setStats] = useState(null);
  const check = useCallback(() => { call("/admin/me").then(setMe).catch(() => setMe(null)); }, []);
  useEffect(() => {
    document.title = "Quản trị · Education Hugo";
    // Sáng/tối theo máy (HIG). Trang học có cài đặt riêng — ở đây chỉ nghe hệ thống.
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => { document.documentElement.classList.toggle("dark", mq.matches); document.documentElement.dataset.theme = mq.matches ? "dark" : "light"; };
    apply();
    mq.addEventListener("change", apply);
    check();
    const onPop = () => setPage(pageFromPath());
    window.addEventListener("popstate", onPop);
    return () => { mq.removeEventListener("change", apply); window.removeEventListener("popstate", onPop); };
  }, [check]);

  const liveState = useLiveConnection(Boolean(me));
  const loadStats = useCallback(() => { call("/admin/overview").then(setStats).catch(() => {}); }, []);
  useEffect(() => { if (me) loadStats(); }, [me, loadStats]);
  const statsLater = useDebounced(loadStats, 10_000);
  useLive(me ? ["learner", "activity", "resync"] : [], statsLater);

  if (me === undefined) return <div className="min-h-dvh bg-background"><Loading /></div>;
  if (!me) return <><Login onDone={check} /><ToastHost /></>;

  const go = (id) => { window.history.pushState(null, "", id ? `/admin/${id}` : "/admin"); setPage(id); window.scrollTo(0, 0); };
  const signOut = async () => { await call("/admin-auth/sign-out", { method: "POST", body: {} }).catch(() => {}); setMe(null); };
  const current = page || "home";
  const [, label, , View, desc] = PAGES.find(([id]) => id === current);
  const badges = { moderation: stats?.pendingReports, feedback: stats?.newLessonFb };

  return (
    <div className="min-h-dvh bg-background text-foreground md:flex">
      {/* Thanh bên (≥ md). Trên điện thoại: chỉ hiện ở /admin, giống màn chính của Cài đặt iOS. */}
      <nav aria-label="Quản trị" className={`${page ? "hidden md:flex" : "flex"} flex-col gap-5 px-4 pb-8 pt-6 md:sticky md:top-0 md:h-dvh md:w-[264px] md:shrink-0 md:overflow-y-auto md:border-r md:border-border md:bg-card md:px-3 md:pt-5`}>
        <div className="flex items-center gap-2.5 px-2">
          <span className="grid h-9 w-9 place-items-center rounded-[10px] bg-foreground text-background"><Icon name="admin_panel_settings" /></span>
          <div className="min-w-0 flex-1"><p className="text-[16px] font-bold leading-tight">Quản trị</p>
            <p className="flex items-center gap-1.5 text-[12px] text-muted-foreground"><Dot on={liveState === "on"} label={liveState === "on" ? "Đang nhận dữ liệu trực tiếp" : "Mất kết nối"} />{liveState === "on" ? "Trực tiếp" : "Đang nối lại…"}</p></div>
        </div>
        {NAV.map(([group, items]) => (
          <div key={group || "top"}>
            {group && <p className="mb-1 px-3 text-[12px] font-semibold uppercase tracking-wide text-muted-foreground">{group}</p>}
            <ul className="overflow-hidden rounded-2xl border border-border bg-card md:rounded-none md:border-0 md:bg-transparent">
              {items.map(([id, text, icon]) => {
                const on = id === current && Boolean(page || window.matchMedia("(min-width: 768px)").matches);
                return (
                  <li key={id} className="border-t border-border first:border-t-0 md:border-0">
                    <button type="button" onClick={() => go(id)} aria-current={on ? "page" : undefined}
                      className={`flex min-h-[48px] w-full items-center gap-3 px-3 text-left text-[15px] md:min-h-[40px] md:rounded-[10px] ${on ? "md:bg-primary md:text-primary-foreground md:font-semibold" : "hover:bg-muted/60"}`}>
                      <Icon name={icon} className={on ? "" : "text-primary"} />
                      <span className="flex-1">{text}</span>
                      {badges[id] > 0 && <span className="min-w-[22px] rounded-full bg-destructive px-1.5 text-center text-[12px] font-bold leading-[22px] text-destructive-foreground" aria-label={`${badges[id]} mục cần xử lý`}>{badges[id]}</span>}
                      <Icon name="chevron_right" className="text-muted-foreground md:hidden" />
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
        <p className="mt-auto truncate px-3 text-[13px] text-muted-foreground">{me.email}</p>
      </nav>

      <main className={`${page ? "block" : "hidden md:block"} min-w-0 flex-1`}>
        <header className="sticky top-0 z-20 border-b border-border bg-background/85 backdrop-blur md:static md:border-0 md:bg-transparent">
          <div className="flex min-h-[48px] items-center px-2 md:hidden">
            <Btn tone="ghost" small icon="chevron_left" onClick={() => go("")} className="px-2">Quản trị</Btn>
          </div>
        </header>
        <div className="mx-auto max-w-6xl px-4 pb-16 pt-2 md:px-8 md:pt-8">
          <h1 className="text-[28px] font-bold leading-tight md:text-[32px]">{label}</h1>
          {desc && <p className="mt-1 text-[15px] text-muted-foreground">{desc}</p>}
          <div key={current} className="mt-6"><View stats={stats} me={me} go={go} openLearner={setLearner} signOut={signOut} /></div>
        </div>
      </main>

      {learner && <LearnerDetail email={learner} onClose={() => setLearner(null)} />}
      <DialogHost />
      <ReauthHost email={me.email} />
      <ToastHost />
    </div>
  );
}
