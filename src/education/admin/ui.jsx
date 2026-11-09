// Bộ thành phần của trang quản trị — theo Apple HIG: vùng bấm ≥ 44pt, danh sách nhóm (inset grouped),
// hộp thoại native <dialog> (tự bẫy focus, Esc để đóng), nút huỷ luôn có, thao tác phá huỷ màu đỏ và
// không bao giờ là nút mặc định, trạng thái luôn có chữ (không chỉ dựa vào màu).
import { useEffect, useRef, useState } from "react";
import { API_BASE } from "../../config/apiBase";

// ── Gọi API. Thao tác tối mật mà phiên đã quá 10 phút → máy chủ trả REAUTH_REQUIRED:
//    hỏi xác thực lại (Face ID / mã email) rồi tự làm lại đúng một lần.
let reauthHandler = null;
export const onReauth = (fn) => { reauthHandler = fn; };
export async function call(path, { method = "GET", body } = {}, retried = false) {
  const res = await fetch(`${API_BASE}${path}`, {
    method, credentials: "include",
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (res.status === 403 && data.code === "REAUTH_REQUIRED" && !retried && reauthHandler) {
    if (await reauthHandler()) return call(path, { method, body }, true);
    throw Object.assign(new Error("Đã huỷ xác thực — thao tác chưa được thực hiện."), { status: 403, cancelled: true });
  }
  if (!res.ok) throw Object.assign(new Error(data.error || data.message || `Lỗi ${res.status}`), { status: res.status, code: data.code });
  return data;
}

export const fmt = (d) => (d ? new Date(d).toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh", dateStyle: "short", timeStyle: "short" }) : "—");
export const ago = (d) => {
  if (!d) return "—";
  const s = (Date.now() - new Date(d)) / 1000;
  return s < 60 ? "vừa xong" : s < 3600 ? `${Math.floor(s / 60)} phút trước` : s < 86400 ? `${Math.floor(s / 3600)} giờ trước` : fmt(d);
};
export const num = (v) => (v ?? 0).toLocaleString("vi-VN");

export function Icon({ name, className = "" }) {
  return <span className={`material-symbols-outlined text-[20px] leading-none ${className}`} aria-hidden="true">{name}</span>;
}

const TONES = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  plain: "bg-muted text-foreground hover:bg-border/60",
  ghost: "text-primary hover:bg-primary-muted",
  danger: "bg-destructive text-destructive-foreground hover:opacity-90",
  "danger-plain": "bg-destructive/10 text-destructive hover:bg-destructive/15",
};
export function Btn({ tone = "plain", icon, small, className = "", children, ...p }) {
  return (
    <button type="button" {...p}
      className={`inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[10px] font-semibold transition focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-40 ${small ? "min-h-[36px] px-3 text-[14px]" : "min-h-[44px] px-4 text-[15px]"} ${TONES[tone]} ${className}`}>
      {icon && <Icon name={icon} className={small ? "text-[18px]" : ""} />}{children}
    </button>
  );
}

const field = "w-full min-h-[44px] rounded-[10px] border border-border bg-card px-3 text-[16px] text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25";
export const Input = ({ className = "", ...p }) => <input {...p} className={`${field} ${className}`} />;
export const Textarea = ({ className = "", ...p }) => <textarea {...p} className={`${field} py-2.5 ${className}`} />;
export const Select = ({ className = "", children, ...p }) => <select {...p} className={`${field} pr-8 ${className}`}>{children}</select>;
export function Field({ label, hint, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[13px] font-medium text-muted-foreground">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[12px] text-muted-foreground">{hint}</span>}
    </label>
  );
}

/** Ô tìm kiếm: gõ xong dừng 300ms mới gọi onSearch. */
export function Search({ placeholder, onSearch, className = "" }) {
  const [v, setV] = useState("");
  const t = useRef(0);
  useEffect(() => () => clearTimeout(t.current), []);
  return (
    <label className={`relative block min-w-[220px] flex-1 ${className}`}>
      <Icon name="search" className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
      <input type="search" value={v} placeholder={placeholder} aria-label={placeholder}
        onChange={(e) => { const x = e.target.value; setV(x); clearTimeout(t.current); t.current = setTimeout(() => onSearch(x.trim()), 300); }}
        className={`${field} bg-muted pl-10 border-transparent`} />
    </label>
  );
}

/** Segmented control (HIG): 2–5 lựa chọn loại trừ nhau. */
export function Segmented({ value, onChange, options, label }) {
  return (
    <div role="radiogroup" aria-label={label} className="inline-flex rounded-[10px] bg-muted p-0.5">
      {options.map(([id, text]) => (
        <button key={id} type="button" role="radio" aria-checked={value === id} onClick={() => onChange(id)}
          className={`min-h-[36px] rounded-[8px] px-3 text-[14px] font-semibold transition ${value === id ? "bg-card text-foreground shadow-sm" : "text-muted-foreground"}`}>{text}</button>
      ))}
    </div>
  );
}

const BADGE = { green: "bg-success/10 text-success", red: "bg-destructive/10 text-destructive", amber: "bg-warning/15 text-[hsl(30_90%_35%)] dark:text-warning", blue: "bg-info/10 text-info", gray: "bg-muted text-muted-foreground" };
export const Badge = ({ tone = "gray", children }) => <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2 py-0.5 text-[12px] font-semibold ${BADGE[tone]}`}>{children}</span>;
export const Dot = ({ on, label }) => <span title={label ?? (on ? "Đang online" : "Offline")} className={`inline-block h-2.5 w-2.5 shrink-0 rounded-full ${on ? "bg-success" : "bg-border"}`} />;

/** Khối nội dung có tiêu đề nhỏ phía trên (kiểu nhóm trong Cài đặt iOS). */
export function Group({ title, action, footer, children, className = "" }) {
  return (
    <section className={className}>
      {(title || action) && (
        <div className="mb-2 flex min-h-[32px] items-end justify-between gap-2 px-1">
          {title && <h2 className="text-[13px] font-semibold uppercase tracking-wide text-muted-foreground">{title}</h2>}
          {action}
        </div>
      )}
      <div className="rounded-2xl border border-border bg-card">{children}</div>
      {footer && <p className="mt-2 px-1 text-[13px] text-muted-foreground">{footer}</p>}
    </section>
  );
}

export const Loading = () => <p className="p-4 text-[15px] text-muted-foreground" role="status">Đang tải…</p>;
export function Empty({ icon = "inbox", children }) {
  return <div className="grid place-items-center gap-2 p-8 text-center text-[15px] text-muted-foreground"><Icon name={icon} className="text-[32px]" />{children}</div>;
}

/** Bảng dữ liệu. Trên điện thoại cuộn ngang trong khung, cột đầu dính để không lạc dòng. */
export function Table({ list, head, row, onRow, empty = "Chưa có dữ liệu." }) {
  if (list.error) return <p role="alert" className="p-4 text-destructive">{list.error}</p>;
  if (!list.items) return <Loading />;
  if (!list.items.length) return <Empty>{empty}</Empty>;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left text-[14px] text-foreground">
        <thead className="text-[12px] uppercase tracking-wide text-muted-foreground">
          <tr>{head.map((h, i) => <th key={i} scope="col" className="whitespace-nowrap px-4 py-2.5 font-semibold">{h}</th>)}</tr>
        </thead>
        <tbody>{list.items.map((item, i) => (
          <tr key={item._id || item.id || i} onClick={onRow && (() => onRow(item))}
            onKeyDown={onRow && ((e) => { if (e.key === "Enter") onRow(item); })} tabIndex={onRow ? 0 : undefined}
            className={`border-t border-border align-top ${onRow ? "cursor-pointer hover:bg-muted/60 focus-visible:bg-muted focus-visible:outline-none" : ""}`}>
            {row(item).map((c, j) => <td key={j} className="px-4 py-3">{c}</td>)}
          </tr>
        ))}</tbody>
      </table>
    </div>
  );
}

// ── Hộp thoại: ask({ title, message, fields, confirm, tone }) → Promise<giá trị | null>.
//    fields: [{ name, label, type, value, required, placeholder, min, max, maxLength, match, hint, options }]
//    match: phải gõ đúng chuỗi này mới bấm được (xác nhận thao tác không hoàn tác được).
let openDialog = null;
export const ask = (opts) => new Promise((resolve) => (openDialog ? openDialog({ ...opts, resolve }) : resolve(null)));
export const confirmAction = (title, message, confirm = "Xác nhận", tone = "danger") => ask({ title, message, confirm, tone }).then(Boolean);

export function DialogHost() {
  const ref = useRef(null);
  const [d, setD] = useState(null);
  const [vals, setVals] = useState({});
  useEffect(() => {
    openDialog = (opts) => { setVals(Object.fromEntries((opts.fields || []).map((f) => [f.name, f.value ?? ""]))); setD(opts); };
    return () => { openDialog = null; };
  }, []);
  useEffect(() => { if (d && !ref.current.open) ref.current.showModal(); }, [d]);
  const close = (out) => { d?.resolve(out); setD(null); ref.current?.close(); };
  const ok = (d?.fields || []).every((f) => (!f.required || String(vals[f.name]).trim()) && (!f.match || String(vals[f.name]).trim().toLowerCase() === f.match.toLowerCase()));
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); close(null); }} aria-labelledby="adm-dlg-t"
      className="w-[min(440px,calc(100vw-32px))] rounded-2xl border border-border bg-card p-0 text-foreground shadow-2xl backdrop:bg-black/40 backdrop:backdrop-blur-sm">
      {d && (
        <form method="dialog" onSubmit={(e) => { e.preventDefault(); if (ok) close(d.fields ? vals : true); }} className="space-y-4 p-5">
          <div>
            <h2 id="adm-dlg-t" className="text-[18px] font-bold">{d.title}</h2>
            {d.message && <p className="mt-1.5 whitespace-pre-line text-[15px] text-muted-foreground">{d.message}</p>}
          </div>
          {(d.fields || []).map((f, i) => (
            <Field key={f.name} label={f.label} hint={f.hint}>
              {f.type === "textarea" ? <Textarea rows={3} autoFocus={i === 0} required={f.required} maxLength={f.maxLength} placeholder={f.placeholder} value={vals[f.name]} onChange={(e) => setVals({ ...vals, [f.name]: e.target.value })} />
                : f.type === "select" ? <Select value={vals[f.name]} onChange={(e) => setVals({ ...vals, [f.name]: e.target.value })}>{f.options.map(([v, t]) => <option key={v} value={v}>{t}</option>)}</Select>
                  : <Input autoFocus={i === 0} type={f.type || "text"} required={f.required} min={f.min} max={f.max} maxLength={f.maxLength} placeholder={f.placeholder} inputMode={f.type === "number" ? "numeric" : undefined}
                    value={vals[f.name]} onChange={(e) => setVals({ ...vals, [f.name]: e.target.value })} autoComplete="off" spellCheck={false} />}
            </Field>
          ))}
          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:justify-end">
            <Btn onClick={() => close(null)} autoFocus={!d.fields}>Huỷ</Btn>
            <Btn type="submit" tone={d.tone || "primary"} disabled={!ok}>{d.confirm || "Xong"}</Btn>
          </div>
        </form>
      )}
    </dialog>
  );
}

// ── Thông báo nhanh (toast) ở cuối màn hình, tự ẩn sau 4 giây. Lỗi thì đọc ngay cho trình đọc màn hình.
let pushToast = null;
export const toast = (text, tone = "ok") => pushToast?.({ text, tone, id: Math.random() });
export function ToastHost() {
  const [items, setItems] = useState([]);
  useEffect(() => {
    pushToast = (t) => { setItems((x) => [...x, t]); setTimeout(() => setItems((x) => x.filter((y) => y.id !== t.id)), 4000); };
    return () => { pushToast = null; };
  }, []);
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-4 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
      {items.map((t) => (
        <div key={t.id} role={t.tone === "error" ? "alert" : "status"}
          className={`pointer-events-auto flex max-w-md items-center gap-2 rounded-full px-4 py-2.5 text-[15px] font-medium shadow-lg ${t.tone === "error" ? "bg-destructive text-destructive-foreground" : "bg-foreground text-background"}`}>
          <Icon name={t.tone === "error" ? "error" : "check_circle"} />{t.text}
        </div>
      ))}
    </div>
  );
}

/** Bọc thao tác: lỗi → toast đỏ (trừ khi người dùng tự huỷ xác thực), xong → toast + reload. */
export function act(fn, reload, done) {
  return async (...args) => {
    try {
      const r = await fn(...args);
      if (r === false) return;
      if (done) toast(typeof done === "function" ? done(r) : done);
      reload?.();
    } catch (e) { if (!e.cancelled) toast(e.message, "error"); }
  };
}

/** Bảng chi tiết trượt từ cạnh phải (sheet) — native <dialog>: Esc đóng, focus giữ trong bảng. */
export function Sheet({ title, onClose, toolbar, children }) {
  const ref = useRef(null);
  useEffect(() => { ref.current.showModal(); }, []);
  return (
    <dialog ref={ref} onCancel={(e) => { e.preventDefault(); onClose(); }} onClick={(e) => { if (e.target === ref.current) onClose(); }} aria-label={typeof title === "string" ? title : undefined}
      className="m-0 ml-auto h-dvh max-h-dvh w-full max-w-3xl border-l border-border bg-background p-0 text-foreground shadow-2xl backdrop:bg-black/40">
      <div className="sticky top-0 z-10 flex min-h-[56px] items-center gap-2 border-b border-border bg-background/90 px-4 backdrop-blur md:px-6">
        <Btn tone="ghost" small icon="close" onClick={onClose} aria-label="Đóng" className="-ml-2 px-2" />
        <h2 className="min-w-0 flex-1 truncate text-[17px] font-bold">{title}</h2>
        {toolbar}
      </div>
      <div className="space-y-6 p-4 md:p-6">{children}</div>
    </dialog>
  );
}
