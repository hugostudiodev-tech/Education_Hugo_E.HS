import { useCallback, useEffect, useState } from "react";
import { API_BASE } from "../../config/apiBase";

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

/** Tải một danh sách; reload() sau mỗi thao tác ghi. */
function useList(path) {
  const [state, setState] = useState({ items: null, error: "" });
  const reload = useCallback(() => {
    call(path).then((d) => setState({ items: d.items ?? d, error: "" })).catch((e) => setState({ items: [], error: e.message }));
  }, [path]);
  useEffect(reload, [reload]);
  return { ...state, reload };
}

function act(fn, reload) {
  return async (...args) => {
    try { await fn(...args); reload?.(); } catch (e) { window.alert(e.message); }
  };
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
        {step === "email" ? (
          <form onSubmit={send} className="mt-4 space-y-3">
            <Input type="email" required autoFocus autoComplete="email" placeholder="Email quản trị" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Btn type="submit" disabled={busy} className="w-full">Gửi mã đăng nhập</Btn>
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

function Overview() {
  const [d, setD] = useState(null);
  useEffect(() => { call("/admin/overview").then(setD).catch(() => setD({})); }, []);
  if (!d) return <p className="text-muted-foreground">Đang tải…</p>;
  const rows = [
    ["Người học", d.learners], ["Hoạt động 24h", d.active1], ["Hoạt động 7 ngày", d.active7], ["Mới hôm nay", d.newToday],
    ["Bài đăng 7 ngày", d.posts7], ["Báo cáo chờ xử lý", d.pendingReports], ["Góp ý bài học mới", d.newLessonFb],
    ["Phiếu đánh giá", d.feedback], ["Ngọc đang lưu hành", d.gemsOut], ["Đơn cửa hàng 30 ngày", d.sold30],
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
      {rows.map(([k, v]) => <Card key={k}><p className="text-[13px] text-muted-foreground">{k}</p><p className="mt-1 text-[24px] font-bold tabular-nums text-foreground">{(v ?? 0).toLocaleString("vi-VN")}</p></Card>)}
    </div>
  );
}

function Learners() {
  const [q, setQ] = useState("");
  const [query, setQuery] = useState("");
  const list = useList(`/admin/learners?q=${encodeURIComponent(query)}`);
  const [open, setOpen] = useState(null);
  return (
    <div className="space-y-3">
      <form onSubmit={(e) => { e.preventDefault(); setQuery(q); }} className="flex gap-2">
        <Input placeholder="Email, biệt danh hoặc mã bạn" value={q} onChange={(e) => setQ(e.target.value)} />
        <Btn type="submit">Tìm</Btn>
      </form>
      {open && <LearnerDetail email={open} onClose={() => { setOpen(null); list.reload(); }} />}
      <Table list={list} head={["Email", "Biệt danh", "Ngọc", "Bước", "Chuỗi", "Hoạt động", ""]} row={(l) => [
        l.email, l.nickname || l.name || "—", l.gems ?? 0, l.steps, l.streak, fmt(l.lastActiveAt),
        <span key="a" className="flex gap-2">{l.bannedAt && <span className="text-red-600">Đã khoá</span>}<Btn tone="ghost" onClick={() => setOpen(l.email)}>Mở</Btn></span>,
      ]} />
    </div>
  );
}

function LearnerDetail({ email, onClose }) {
  const [d, setD] = useState(null);
  const load = useCallback(() => { call(`/admin/learners/${encodeURIComponent(email)}`).then(setD).catch((e) => window.alert(e.message)); }, [email]);
  useEffect(load, [load]);
  const path = `/admin/learners/${encodeURIComponent(email)}`;
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
  const reset = act(async () => { if (window.confirm("Xoá biệt danh, giới thiệu và nhân vật của người này?")) await call(`${path}/reset-persona`, { method: "POST" }); }, load);
  if (!d) return <Card>Đang tải…</Card>;
  const l = d.learner;
  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-[17px] font-bold text-foreground">{l.email}</h2>
        <Btn tone="ghost" onClick={onClose}>Đóng</Btn>
      </div>
      <p className="text-[14px] text-muted-foreground">Biệt danh: {l.nickname || "—"} · Ngọc: {l.gems ?? 0} · Mã bạn: {l.friendCode || "—"} · Tạo: {fmt(l.createdAt)}{l.bannedAt ? ` · Khoá từ ${fmt(l.bannedAt)}` : ""}</p>
      <div className="flex flex-wrap gap-2">
        <Btn onClick={gems}>Điều chỉnh Ngọc</Btn>
        <Btn tone="ghost" onClick={reset}>Xoá hồ sơ công khai</Btn>
        {l.bannedAt ? <Btn tone="ghost" onClick={() => ban(false)}>Mở khoá</Btn> : <Btn tone="danger" onClick={() => ban(true)}>Khoá tài khoản</Btn>}
      </div>
      <h3 className="font-semibold text-foreground">Sổ Ngọc gần đây</h3>
      <ul className="max-h-60 space-y-1 overflow-auto text-[14px] text-foreground">
        {d.gems.map((g) => <li key={g._id}>{fmt(g.createdAt)} · <b className="tabular-nums">{g.amount > 0 ? "+" : ""}{g.amount}</b> · {g.reason} {g.note ? `· ${g.note}` : ""}</li>)}
        {!d.gems.length && <li className="text-muted-foreground">Chưa có giao dịch.</li>}
      </ul>
      {d.reports.length > 0 && <p className="text-[14px] text-red-600">{d.reports.length} báo cáo về người này.</p>}
    </Card>
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
      <p className="text-[14px] text-muted-foreground">{list.items ? `${list.items.length} người đăng ký` : ""} · Danh sách để hội đồng xét và xây chương trình.</p>
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

function Table({ list, head, row }) {
  if (list.error) return <p className="text-red-600">{list.error}</p>;
  if (!list.items) return <p className="text-muted-foreground">Đang tải…</p>;
  if (!list.items.length) return <p className="text-muted-foreground">Chưa có dữ liệu.</p>;
  return (
    <div className="overflow-x-auto rounded-xl border border-border bg-card">
      <table className="w-full text-left text-[14px] text-foreground">
        <thead className="bg-muted text-muted-foreground"><tr>{head.map((h) => <th key={h} className="whitespace-nowrap px-3 py-2 font-semibold">{h}</th>)}</tr></thead>
        <tbody>{list.items.map((item, i) => (
          <tr key={item._id || i} className="border-t border-border align-top">{row(item).map((c, j) => <td key={j} className="px-3 py-2">{c}</td>)}</tr>
        ))}</tbody>
      </table>
    </div>
  );
}

/** Bài chia sẻ kinh nghiệm ở Cộng đồng: chỉ admin đăng, chọn mascot đại diện cho từng bài. */
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
  const remove = (a) => act(async () => { if (window.confirm(`Xoá bài "${a.title || a.text.slice(0, 40)}" và mọi bình luận?`)) await call(`/admin/articles/${a._id}`, { method: "DELETE" }); }, list.reload);
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
        <p className="mb-2 text-[14px] text-muted-foreground">Xem trước ({LANGS.find(([id]) => id === lang)[1]}) — ô trống sẽ hiện chữ mặc định trong app</p>
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

const TABS = [
  ["overview", "Tổng quan", "space_dashboard", Overview],
  ["learners", "Người học", "group", Learners],
  ["store", "Cửa hàng", "storefront", Store],
  ["partners", "Đối tác", "key", Partners],
  ["developers", "Hugo Developer", "code", Developers],
  ["promos", "Quảng cáo", "campaign", Promos],
  ["articles", "Bài viết", "article", Articles],
  ["moderation", "Kiểm duyệt", "shield", Moderation],
  ["feedback", "Góp ý", "rate_review", Feedback],
  ["log", "Nhật ký", "history", Log],
];

export default function EduAdmin() {
  const [me, setMe] = useState(undefined);
  const tabFromPath = () => TABS.find(([id]) => window.location.pathname === `/admin/${id}`)?.[0] || "overview";
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

  if (me === undefined) return <p className="p-6 text-muted-foreground">Đang tải…</p>;
  if (!me) return <Login onDone={check} />;

  const go = (id) => { window.history.pushState(null, "", `/admin/${id}`); setTab(id); };
  const signOut = async () => { await call("/admin-auth/sign-out", { method: "POST", body: {} }).catch(() => {}); setMe(null); };
  const [, label, , View] = TABS.find(([id]) => id === tab);
  return (
    <div className="min-h-dvh bg-background md:flex">
      <nav className="flex gap-1 overflow-x-auto border-b border-border bg-card p-2 md:sticky md:top-0 md:h-dvh md:w-56 md:flex-col md:border-b-0 md:border-r">
        <p className="hidden px-3 py-2 text-[15px] font-bold text-foreground md:block">Education Hugo</p>
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
        <h1 className="mb-4 text-[22px] font-bold text-foreground">{label}</h1>
        <View />
      </main>
    </div>
  );
}
