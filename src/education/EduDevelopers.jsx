import { lazy, Suspense, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api/core/apiClient";
import { THEME_RULES, themeVars } from "../sdk/theme";
import QuizQuestion from "../components/member/hugoCoder/QuizQuestion";
import { HAT_SEED } from "../../packages/courses/sql/seed.js";
import { CONTACT } from "./legalText";

const SqlPlayground = lazy(() => import("../components/member/hugoCoder/SqlPlayground"));

/**
 * /developers — trang riêng cho nhà phát triển, ai cũng xem được (không cần đăng nhập, không khung app).
 * Hai thư viện:
 *  - Education Hugo UI (/ui/edu-ui.css): thư viện giao diện MỞ, miễn phí, MIT — tuỳ biến và xem trực tiếp.
 *  - education-hugo-react + REST API: thư viện STEP, chỉ cho đối tác có key admin cấp (/partners).
 * Phần công khai: tổng quan, component, quy tắc tuỳ biến, bản quyền. Phần đối tác
 * (lệnh cài, mã khởi động, REST API) bị làm mờ tới khi nhập key admin cấp.
 * Làm mờ chỉ là lớp trình bày: thứ thật sự khoá là máy chủ — không có key thì
 * không tải được gói và không đọc được bài nào.
 */
const SITE = "https://education.hugowishpax.studio";
const API = "https://education.hugowishpax.studio/api";
const KEY_STORE = "edu.partner.key";

const COMPONENTS = [
  ["EducationHugo", "Cả khoá học: bản đồ chặng, trình học, chấm bài, tiến độ lưu trong máy học viên. Dùng cái này là đủ cho 95% trường hợp.", [
    ["apiKey", "string", "bắt buộc", "Key đối tác 32 ký tự do admin cấp."],
    ["course", '"coding" | "sql"', '"coding"', "Khoá hiển thị."],
    ["lang", '"vi" | "en" | "zh"', '"vi"', "Ngôn ngữ giao diện và nội dung bài."],
    ["theme", "object", "—", "Tuỳ biến theo quy tắc (mục Tuỳ biến)."],
    ["onProgress", "(p) => void", "—", "Gọi mỗi khi học viên xong một bài hoặc một step: { done: string[], lessons: {} }."],
    ["className", "string", '""', "Thêm class cho khung ngoài."],
    ["apiBase / assetBase", "string", "máy chủ Hugo Studio", "Chỉ đổi khi Hugo Studio hướng dẫn."],
  ]],
  ["CourseMap", "Bản đồ chặng kiểu đường đi, mascot clay từng chặng.", [
    ["courses, stages", "array", "bắt buộc", "Lấy từ useCoderLessons()."],
    ["completedSet", "Set<string>", "bắt buộc", "Id step đã qua."],
    ["currentIndex", "number", "bắt buộc", "Step đang học."],
    ["onOpenLesson", "(id) => void", "bắt buộc", "Bấm vào một step."],
    ["lessonsDone", "object", "{}", "Bài nhỏ đã xong theo step (vòng tiến độ)."],
  ]],
  ["LessonPlayer", "Trình học một step: slide, hình minh hoạ, ô SQL, trắc nghiệm, màn chúc mừng.", [
    ["course", "object", "bắt buộc", "Step đầy đủ (có slides)."],
    ["plan, lesson", "array, number", "null, 0", "Chia step thành bài nhỏ (stepLessons) và bài đang học."],
    ["onSubmitQuiz", "(answers) => Promise", "bắt buộc", "Gửi đáp án, trả kết quả chấm của máy chủ."],
    ["onExit, onLessonDone, onNextPart, onNextLesson", "() => void", "—", "Điều hướng."],
  ]],
  ["SqlPlayground", "Ô SQL chạy SQLite ngay trong trình duyệt, tự chấm bằng cách so kết quả.", [
    ["setup", "string", '""', "SQL dựng dữ liệu mẫu."],
    ["query", "string", '""', "Câu lệnh có sẵn."],
    ["solution", "string", "—", "Có thì bật chế độ bài tập tự chấm."],
    ["hints", "string[]", "[]", "Gợi ý mở dần khi làm sai."],
    ["ordered", "boolean", "false", "So cả thứ tự dòng."],
  ]],
  ["QuizQuestion", "Một câu trắc nghiệm: chọn một, nhiều, đúng/sai, điền chỗ trống, nối cặp.", [
    ["question", "object", "bắt buộc", "{ kind?, q, o?, code?, pairs? }"],
    ["value, onChange", "any, fn", "bắt buộc", "Câu trả lời đang chọn."],
    ["reviewed", "object", "—", "Kết quả chấm để tô đúng/sai."],
  ]],
  ["CodingVisual", "Hình minh hoạ động theo tên (sơ đồ, mind map).", [["name", "string", "bắt buộc", "Tên hình trong bài."]]],
  ["useCoderLessons(id, { course })", "Hook tải danh mục và chi tiết step (đã gắn key).", [["→", "{ courses, stages, selectedLesson, loading, error }", "", ""]]],
];

const REST = [
  ["GET", "/lessons?course=sql&page=1&limit=25", "Danh mục step + chặng (trang 1). Không cần key.", '{ items: [{ id, title, stage, lessons }], stages: [...], pagination }'],
  ["GET", "/lessons/:id?lang=en", "Toàn bộ một step: slides, trắc nghiệm (đã xáo, KHÔNG kèm đáp án).", '{ lesson: { id, title, slides, quiz } }'],
  ["POST", "/lessons/:id/grade", "Chấm trắc nghiệm. Body { answers: [...] }.", '{ score, correct, total, passed, review: [...] }'],
  ["POST", "/partner/verify", "Kiểm key còn hiệu lực.", '{ ok: true, email: "pa***@abc.edu.vn", expiresAt }'],
];

const ERRORS = [
  ["401 PARTNER_KEY_INVALID", "Key sai, hết hạn, bị thu hồi, hoặc gọi từ tên miền không đăng ký."],
  ["429", "Gọi quá nhanh (đọc 90/phút, chấm 20/phút, kiểm key 20/10 phút mỗi IP)."],
  ["404", "Không có step này."],
  ["409 STEP_NOT_READY", "Step đang soạn."],
];

const SAMPLE_Q = { kind: "single", q: "Mệnh đề nào lọc NHÓM sau GROUP BY?", o: ["WHERE", "HAVING", "ORDER BY", "LIMIT"] };

function Code({ children }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="dev-code">
      <pre><code>{children}</code></pre>
      <button type="button" onClick={() => navigator.clipboard?.writeText(children).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })}>{copied ? "Đã chép" : "Chép"}</button>
    </div>
  );
}

function Locked({ unlocked, children }) {
  return (
    <div className={`dev-locked${unlocked ? " is-open" : ""}`}>
      <div className="dev-locked-body" aria-hidden={!unlocked} inert={unlocked ? undefined : ""}>{children}</div>
      {!unlocked && <div className="dev-locked-veil"><span className="material-symbols-outlined">lock</span><b>Dành cho đối tác</b><span>Nhập key ở mục Đối tác để xem.</span></div>}
    </div>
  );
}

function ThemeLab() {
  const [theme, setTheme] = useState({ primary: "#29cdff", primaryStrong: "#0fb4ec", success: "#58cc02", danger: "#ff4b4b", font: "Plus Jakarta Sans" });
  const [answer, setAnswer] = useState(null);
  const errors = Object.entries(theme).filter(([k, v]) => !THEME_RULES[k].test(v)).map(([k]) => k);
  const code = `<EducationHugo\n  apiKey={KEY}\n  theme={${JSON.stringify(theme, null, 2).replace(/\n/g, "\n  ")}}\n/>`;
  return (
    <div className="dev-lab">
      <div className="dev-lab-form">
        {Object.entries(THEME_RULES).map(([name, rule]) => (
          <label key={name} className={errors.includes(name) ? "is-bad" : ""}>
            <span><code>{name}</code> · {rule.rule}</span>
            <span className="dev-lab-input">
              {name !== "font" && <input type="color" value={THEME_RULES[name].test(theme[name]) && theme[name].length === 7 ? theme[name] : "#000000"} onChange={(e) => setTheme({ ...theme, [name]: e.target.value })} aria-label={name} />}
              <input value={theme[name]} onChange={(e) => setTheme({ ...theme, [name]: e.target.value })} />
            </span>
          </label>
        ))}
        {errors.length > 0 && <p className="dev-bad">Sai quy tắc: {errors.join(", ")}. Thư viện sẽ bỏ qua các giá trị này và giữ mặc định.</p>}
      </div>
      <div className="dev-lab-preview" style={themeVars(Object.fromEntries(Object.entries(theme).filter(([k]) => !errors.includes(k))))}>
        <QuizQuestion question={SAMPLE_Q} value={answer} onChange={setAnswer} />
        <button type="button" className="edu-btn">Kiểm tra</button>
      </div>
      <Code>{code}</Code>
    </div>
  );
}

// ── Thư viện mở Education Hugo UI ───────────────────────────────────────────
const UI_CSS = "/ui/edu-ui.css";
const UI_VERSION = "1.0.0";
const FONTS = ["Nunito", "Plus Jakarta Sans", "Inter", "system-ui"];
const UI_DEFAULTS = { primary: "#1cb0f6", success: "#58cc02", danger: "#ff4b4b", warning: "#ff9600", radius: 14, font: "Nunito" };

const PRINCIPLES = [
  ["palette", "Một màu chính", "Đổi --eh-primary là cả bộ đổi theo: bóng đáy nút, viền chọn, nền nhạt đều tự suy bằng color-mix. Một trang chỉ nên có một màu nhấn."],
  ["touch_app", "Nút chạm được", "Nút và ô chọn cao ít nhất 48px, chữ đậm viết hoa, có đáy 3D lún xuống khi bấm — đủ to cho ngón tay trên điện thoại."],
  ["text_fields", "Chữ dễ đọc", "Chữ thân ≥ 15px, tương phản đủ ở cả nền sáng và tối. Chế độ tối tự bật theo máy, hoặc ép bằng data-eh-theme."],
  ["check_circle", "Trạng thái không chỉ bằng màu", "Đúng/sai/cảnh báo luôn đi kèm chữ hoặc biểu tượng, để người mù màu vẫn hiểu."],
  ["accessibility_new", "Tôn trọng người dùng", "Có viền focus khi dùng bàn phím, tắt chuyển động khi máy bật “giảm chuyển động”, dùng thẻ HTML đúng nghĩa (button, input, role=switch)."],
];

/* eslint-disable react/jsx-key -- demo nằm trong bộ [tên, class, demo, mã], không render thẳng thành danh sách */
const UI_COMPONENTS = [
  ["Nút", "eh-btn", (
    <div className="dev-ui-row">
      <button type="button" className="eh-btn">Tiếp tục</button>
      <button type="button" className="eh-btn eh-btn--success">Kiểm tra</button>
      <button type="button" className="eh-btn eh-btn--danger">Xoá</button>
      <button type="button" className="eh-btn eh-btn--secondary">Bỏ qua</button>
      <button type="button" className="eh-btn eh-btn--ghost">Để sau</button>
      <button type="button" className="eh-btn" disabled>Đã khoá</button>
    </div>
  ), `<button class="eh-btn">Tiếp tục</button>
<button class="eh-btn eh-btn--success">Kiểm tra</button>
<button class="eh-btn eh-btn--danger">Xoá</button>
<button class="eh-btn eh-btn--secondary">Bỏ qua</button>
<button class="eh-btn eh-btn--ghost">Để sau</button>
<button class="eh-btn" disabled>Đã khoá</button>
<!-- Thêm eh-btn--block để nút rộng hết khung -->`],
  ["Ô chọn đáp án", "eh-option", (
    <div className="dev-ui-col">
      <button type="button" className="eh-option">SELECT</button>
      <button type="button" className="eh-option" aria-pressed="true">WHERE (đang chọn)</button>
      <button type="button" className="eh-option is-correct">HAVING — đúng</button>
      <button type="button" className="eh-option is-wrong">LIMIT — sai</button>
    </div>
  ), `<button class="eh-option">SELECT</button>
<button class="eh-option" aria-pressed="true">WHERE</button>
<button class="eh-option is-correct">HAVING — đúng</button>
<button class="eh-option is-wrong">LIMIT — sai</button>`],
  ["Thanh tiến độ", "eh-progress", (
    <div className="dev-ui-col">
      <div className="eh-progress" style={{ "--value": 0.7 }} role="progressbar" aria-valuenow={70} aria-valuemin={0} aria-valuemax={100} />
      <div className="eh-progress eh-progress--primary" style={{ "--value": 0.4 }} role="progressbar" aria-valuenow={40} aria-valuemin={0} aria-valuemax={100} />
      <div className="eh-progress eh-progress--warning" style={{ "--value": 0.2 }} role="progressbar" aria-valuenow={20} aria-valuemin={0} aria-valuemax={100} />
    </div>
  ), `<!-- --value từ 0 đến 1 -->
<div class="eh-progress" style="--value: .7" role="progressbar" aria-valuenow="70" aria-valuemin="0" aria-valuemax="100"></div>
<div class="eh-progress eh-progress--primary" style="--value: .4" role="progressbar" aria-valuenow="40" aria-valuemin="0" aria-valuemax="100"></div>`],
  ["Thẻ", "eh-card", (
    <div className="eh-card"><b>Chặng 1 · Làm quen</b><p>5 bài nhỏ, mỗi bài khoảng 3 phút.</p><button type="button" className="eh-btn eh-btn--block">Bắt đầu</button></div>
  ), `<div class="eh-card">
  <b>Chặng 1 · Làm quen</b>
  <p>5 bài nhỏ, mỗi bài khoảng 3 phút.</p>
  <button class="eh-btn eh-btn--block">Bắt đầu</button>
</div>`],
  ["Nhãn", "eh-badge", (
    <div className="dev-ui-row"><span className="eh-badge">Mới</span><span className="eh-badge eh-badge--success">Đã xong</span><span className="eh-badge eh-badge--warning">Đang học</span><span className="eh-badge eh-badge--danger">Hết hạn</span></div>
  ), `<span class="eh-badge">Mới</span>
<span class="eh-badge eh-badge--success">Đã xong</span>
<span class="eh-badge eh-badge--warning">Đang học</span>
<span class="eh-badge eh-badge--danger">Hết hạn</span>`],
  ["Ô nhập và công tắc", "eh-input · eh-switch", (
    <div className="dev-ui-col">
      <input className="eh-input" placeholder="Biệt danh của bạn" aria-label="Biệt danh" />
      <input className="eh-input" defaultValue="ab" aria-invalid="true" aria-label="Biệt danh lỗi" />
      <label className="dev-ui-row"><input type="checkbox" role="switch" className="eh-switch" defaultChecked /> Nhắc học mỗi ngày</label>
    </div>
  ), `<input class="eh-input" placeholder="Biệt danh của bạn">
<input class="eh-input" aria-invalid="true" value="ab">
<label><input type="checkbox" role="switch" class="eh-switch" checked> Nhắc học mỗi ngày</label>`],
  ["Thông báo", "eh-alert", (
    <div className="dev-ui-col">
      <div className="eh-alert eh-alert--success" role="status">Chính xác! +10 XP</div>
      <div className="eh-alert eh-alert--danger" role="alert">Chưa đúng — đáp án là HAVING.</div>
      <div className="eh-alert">Mẹo: GROUP BY đi trước HAVING.</div>
    </div>
  ), `<div class="eh-alert eh-alert--success" role="status">Chính xác! +10 XP</div>
<div class="eh-alert eh-alert--danger" role="alert">Chưa đúng — đáp án là HAVING.</div>
<div class="eh-alert">Mẹo: GROUP BY đi trước HAVING.</div>`],
];

/* eslint-enable react/jsx-key */

/** Nạp edu-ui.css đúng bản người dùng tải về — trang này tự dùng chính thư viện mở của mình. */
function useUiCss() {
  useEffect(() => {
    if (document.querySelector(`link[href="${UI_CSS}"]`)) return undefined;
    const link = Object.assign(document.createElement("link"), { rel: "stylesheet", href: UI_CSS });
    document.head.appendChild(link);
    return () => link.remove();
  }, []);
}

const uiVars = (t) => ({ "--eh-primary": t.primary, "--eh-success": t.success, "--eh-danger": t.danger, "--eh-warning": t.warning, "--eh-radius": `${t.radius}px`, "--eh-font": `"${t.font}", system-ui, sans-serif` });
const uiCode = (t) => `:root {\n${Object.entries(uiVars(t)).map(([k, v]) => `  ${k}: ${v};`).join("\n")}\n}`;

/** Tuỳ biến trực tiếp: đổi token → toàn bộ bảng xem trước đổi theo, chép đoạn :root để dùng. */
function UiLab({ tokens, setTokens, dark, setDark }) {
  const set = (k, v) => setTokens({ ...tokens, [k]: v });
  return (
    <div className="dev-uilab">
      <div className="dev-uilab-form">
        {["primary", "success", "danger", "warning"].map((k) => (
          <label key={k}><span><code>--eh-{k}</code></span>
            <span className="dev-lab-input"><input type="color" value={tokens[k]} onChange={(e) => set(k, e.target.value)} aria-label={k} /><input value={tokens[k]} onChange={(e) => set(k, e.target.value)} /></span>
          </label>
        ))}
        <label><span><code>--eh-radius</code> · {tokens.radius}px</span><input type="range" min="0" max="28" value={tokens.radius} onChange={(e) => set("radius", Number(e.target.value))} /></label>
        <label><span><code>--eh-font</code></span>
          <select value={tokens.font} onChange={(e) => set("font", e.target.value)} className="eh-input">{FONTS.map((f) => <option key={f}>{f}</option>)}</select>
        </label>
        <label className="dev-ui-row"><input type="checkbox" role="switch" className="eh-switch" checked={dark} onChange={(e) => setDark(e.target.checked)} /> Nền tối</label>
        <button type="button" className="eh-btn eh-btn--secondary eh-btn--block" onClick={() => { setTokens(UI_DEFAULTS); setDark(false); }}>Về mặc định</button>
      </div>
      <div>
        <Code>{uiCode(tokens)}</Code>
        <p className="dev-note">Dán đoạn này vào CSS của bạn, sau dòng nạp edu-ui.css.</p>
      </div>
    </div>
  );
}

function OpenLibrary() {
  useUiCss();
  const [tokens, setTokens] = useState(UI_DEFAULTS);
  const [dark, setDark] = useState(false);
  const preview = { style: uiVars(tokens), "data-eh-theme": dark ? "dark" : "light", className: "dev-ui-stage" };
  return (
    <>
      <section id="ui" className="dev-card">
        <span className="eh-badge eh-badge--success">Miễn phí · MIT</span>
        <h2>Education Hugo UI</h2>
        <p>Thư viện giao diện mở mà Education Hugo đang dùng: nút 3D, ô chọn đáp án, thanh tiến độ, thẻ, nhãn, ô nhập, công tắc và thông báo. Thuần CSS, một tệp khoảng 7 KB, không cần cài gói, dùng được với HTML, React, Vue hay bất kỳ framework nào. Không cần đăng ký, không cần key, dùng cả cho dự án thương mại — chỉ cần giữ dòng ghi công trong tệp.</p>
        <div className="dev-ui-row">
          <a className="eh-btn" href={UI_CSS} download="edu-ui.css"><span className="material-symbols-outlined" aria-hidden="true">download</span>Tải edu-ui.css</a>
          <a className="eh-btn eh-btn--secondary" href="#ui-lab">Tuỳ biến trực tiếp</a>
        </div>
        <p className="dev-note">Phiên bản {UI_VERSION} · Giấy phép MIT · © Hugo Wishpax Le</p>
      </section>

      <section id="ui-rules" className="dev-card">
        <h2>Nguyên tắc</h2>
        <ul className="dev-rules">
          {PRINCIPLES.map(([icon, title, body]) => (
            <li key={icon}><span className="material-symbols-outlined" aria-hidden="true">{icon}</span><div><b>{title}</b><p>{body}</p></div></li>
          ))}
        </ul>
      </section>

      <section id="ui-lab" className="dev-card">
        <h2>Tuỳ biến và xem trực tiếp</h2>
        <p>Đổi màu, bo góc, phông chữ và nền tối — mọi component bên dưới đổi ngay theo.</p>
        <UiLab tokens={tokens} setTokens={setTokens} dark={dark} setDark={setDark} />
      </section>

      <section id="ui-components" className="dev-card">
        <h2>Component</h2>
        {UI_COMPONENTS.map(([name, cls, demo, code]) => (
          <div key={name} className="dev-comp">
            <h3>{name} <code>.{cls.split(" · ").join(" · .")}</code></h3>
            <div {...preview}>{demo}</div>
            <Code>{code}</Code>
          </div>
        ))}
      </section>

      <section id="ui-guide" className="dev-card">
        <h2>Hướng dẫn dùng</h2>
        <h3>1. Nạp thư viện</h3>
        <p>Tải tệp về đặt cạnh mã của bạn (khuyên dùng), hoặc nạp thẳng từ Education Hugo:</p>
        <Code>{`<link rel="stylesheet" href="${SITE}${UI_CSS}">`}</Code>
        <h3>2. Dùng class</h3>
        <Code>{`<div class="eh-card">
  <div class="eh-progress" style="--value: .6"></div>
  <button class="eh-btn eh-btn--block">Học tiếp</button>
</div>`}</Code>
        <h3>3. Trong React</h3>
        <Code>{`import "./edu-ui.css";

export function NutHoc({ done, onClick }) {
  return (
    <button className={\`eh-btn \${done ? "eh-btn--success" : ""}\`} onClick={onClick}>
      {done ? "Đã xong" : "Học tiếp"}
    </button>
  );
}`}</Code>
        <h3>4. Đổi giao diện</h3>
        <p>Ghi đè biến <code>--eh-*</code> ở <code>:root</code> (cả trang) hoặc trên một khối bất kỳ (chỉ khối đó). Chế độ tối tự theo máy; ép sáng/tối bằng <code>data-eh-theme="light"</code> hoặc <code>"dark"</code>.</p>
        <p>Cần trình duyệt hỗ trợ <code>color-mix()</code> (Chrome/Edge 111+, Safari 16.2+, Firefox 113+).</p>
      </section>
    </>
  );
}

export default function EduDevelopers() {
  const [key, setKey] = useState(() => { try { return sessionStorage.getItem(KEY_STORE) || ""; } catch { return ""; } });
  const [partner, setPartner] = useState(null);
  const [state, setState] = useState({ busy: false, error: "" });
  const unlocked = Boolean(partner);
  const shown = unlocked ? key : "••••••••••••••••••••••••••••••••";

  const unlock = async (event) => {
    event?.preventDefault();
    setState({ busy: true, error: "" });
    try {
      const data = await apiFetch("/partner/verify", { method: "POST", body: JSON.stringify({ key: key.trim() }) });
      setPartner(data);
      try { sessionStorage.setItem(KEY_STORE, key.trim()); } catch { /* chế độ riêng tư */ }
      setState({ busy: false, error: "" });
    } catch (error) {
      setState({ busy: false, error: error.message });
    }
  };

  return (
    <div className="dev-site">
      <header className="dev-top">
        <Link to="/" className="dev-brand"><img src="/edu/cast-1.svg" alt="" width="32" height="32" /><span>Education Hugo <small>Nhà phát triển</small></span></Link>
        <nav aria-label="Mục lục">
          <a href="#ui">Thư viện mở</a>
          <a href="#step">Thư viện step</a>
          <Link to="/partners">Quy định đối tác</Link>
        </nav>
        <Link to="/learn" className="eh-btn dev-top-cta">Vào học</Link>
      </header>
    <article className="edu-page dev">
      <header className="dev-hero">
        <p className="dev-eyebrow">Education Hugo · Nhà phát triển</p>
        <h1 className="edu-page-title">Xây cùng Education Hugo</h1>
        <p className="dev-lead">Hai thư viện cho người làm web: <b>Education Hugo UI</b> mở và miễn phí cho mọi người, và <b>thư viện step</b> đưa nguyên khoá học vào website của đối tác được duyệt.</p>
        <div className="dev-pick">
          <a href="#ui" className="dev-card"><span className="eh-badge eh-badge--success">Miễn phí · ai cũng dùng được</span><b>Education Hugo UI</b><span>Bộ component giao diện thuần CSS. Tải về, tuỳ biến, xem trực tiếp.</span></a>
          <a href="#step" className="dev-card"><span className="eh-badge">Dành cho đối tác · cần key</span><b>Thư viện step</b><span>Bản đồ chặng, bài học, ô SQL, chấm bài — giống hệt bản gốc.</span></a>
        </div>
      </header>

      <OpenLibrary />

      <section id="step" className="dev-card dev-step-intro">
        <span className="eh-badge">Dành cho đối tác</span>
        <h2>Thư viện step education-hugo-react</h2>
        <p>Đưa khoá học Education Hugo vào website của trường hoặc tổ chức bạn: bản đồ chặng, bài học, ô SQL và chấm bài giống hệt <Link to="/learn">bản gốc</Link>. Bài học tải từ máy chủ Hugo Studio và chỉ đọc được bằng <b>key đối tác</b> do admin cấp.</p>
        <p>Key được cấp miễn phí khi bạn đáp ứng đủ ba điều kiện:</p>
        <ol>
          <li>Từ đủ 18 tuổi và có đầy đủ năng lực hành vi dân sự.</li>
          <li>Đã có hệ thống dự án của tổ chức hoặc dự án cá nhân, đính kèm thông tin trong mail.</li>
          <li>Trong mail ghi rõ thời gian xin sử dụng (từ ngày … đến ngày …).</li>
        </ol>
        <div className="dev-ui-row">
          <a className="eh-btn" href={`mailto:${CONTACT}?subject=Xin%20key%20%C4%91%E1%BB%91i%20t%C3%A1c%20Education%20Hugo`}>Gửi mail xin key</a>
          <Link className="eh-btn eh-btn--secondary" to="/partners">Đọc quy định đối tác</Link>
        </div>
        <p className="dev-note">Liên hệ: {CONTACT}</p>
      </section>

      <nav className="dev-toc" aria-label="Mục lục thư viện step">
        {[["partner", "Nhập key"], ["start", "Cài đặt"], ["components", "Component"], ["theme", "Tuỳ biến"], ["api", "REST API"], ["demo", "Thử ô SQL"], ["license", "Bản quyền"]].map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>

      <section id="partner" className="dev-card">
        <h2>Nhập key đối tác</h2>
        {unlocked ? (
          <p className="dev-ok"><span className="material-symbols-outlined">verified</span> Key của {partner.email} còn hiệu lực tới {new Date(partner.expiresAt).toLocaleDateString("vi-VN")}. Các mục bên dưới đã mở.</p>
        ) : (
          <form onSubmit={unlock} className="dev-key">
            <p>Nhập key 32 ký tự Hugo Studio đã gửi vào email của bạn. Chưa có key? Gửi mail tới <a href={`mailto:${CONTACT}?subject=Xin%20key%20%C4%91%E1%BB%91i%20t%C3%A1c%20Education%20Hugo`}>{CONTACT}</a> theo <Link to="/partners">Quy định đối tác</Link>.</p>
            <input value={key} onChange={(e) => setKey(e.target.value)} placeholder="Key đối tác" autoComplete="off" spellCheck="false" maxLength={32} type="password" />
            <button className="edu-btn" disabled={state.busy || key.trim().length !== 32}>{state.busy ? "Đang kiểm…" : "Mở khoá"}</button>
            {state.error && <p className="dev-bad" role="alert">{state.error}</p>}
          </form>
        )}
      </section>

      <section id="start" className="dev-card">
        <h2>Cài đặt và chạy</h2>
        <Locked unlocked={unlocked}>
          <h3>1. Cài gói</h3>
          <p>Gói chỉ tải được bằng key còn hiệu lực. Lệnh dưới đã điền sẵn key của bạn.</p>
          <Code>{`npm i ${SITE}/sdk/${shown}/education-hugo-react.tgz`}</Code>
          <h3>2. Lưu key vào biến môi trường</h3>
          <Code>{`# .env (Vite)\nVITE_EDU_KEY=${shown}\n\n# .env (Next.js)\nNEXT_PUBLIC_EDU_KEY=${shown}`}</Code>
          <h3>3. Gắn vào trang</h3>
          <Code>{`import { EducationHugo } from "education-hugo-react";
import "education-hugo-react/style.css";

export default function HocSQL() {
  return (
    <EducationHugo
      apiKey={import.meta.env.VITE_EDU_KEY}
      course="sql"
      lang="vi"
      onProgress={(p) => console.log("đã xong", p.done.length, "step")}
    />
  );
}`}</Code>
          <h3>4. Đăng ký tên miền</h3>
          <p>Key nằm trong mã trang web nên ai xem nguồn cũng thấy. Vì vậy key được khoá theo <b>tên miền</b> đã đăng ký với admin: gọi từ tên miền khác sẽ bị từ chối. Thêm tên miền mới (kể cả <code>http://localhost:5173</code> khi phát triển) thì báo admin.</p>
          <h3>Yêu cầu</h3>
          <ul>
            <li>React 18 trở lên. Gói đã kèm sẵn mọi thứ khác (sql.js, framer-motion, react-markdown…).</li>
            <li>Trình duyệt hỗ trợ WebAssembly (mọi trình duyệt hiện đại) để chạy ô SQL.</li>
            <li>Next.js: dùng trong Client Component (<code>"use client"</code>).</li>
          </ul>
        </Locked>
      </section>

      <section id="components" className="dev-card">
        <h2>Component</h2>
        <p>Mọi component đều xuất ra từ <code>education-hugo-react</code>. <code>EducationHugo</code> đã ghép sẵn tất cả; các component lẻ dành cho bố cục tự dựng, và vẫn cần <code>configurePartner({"{ key }"})</code> trước khi gọi API.</p>
        {COMPONENTS.map(([name, desc, props]) => (
          <div key={name} className="dev-comp">
            <h3><code>{name}</code></h3>
            <p>{desc}</p>
            <div className="dev-table-wrap"><table className="dev-table">
              <thead><tr><th>Prop</th><th>Kiểu</th><th>Mặc định</th><th>Ý nghĩa</th></tr></thead>
              <tbody>{props.map(([p, type, def, note]) => <tr key={p}><td><code>{p}</code></td><td><code>{type}</code></td><td>{def}</td><td>{note}</td></tr>)}</tbody>
            </table></div>
          </div>
        ))}
      </section>

      <section id="theme" className="dev-card">
        <h2>Tuỳ biến theo quy tắc</h2>
        <p>Thư viện giữ giao diện Education Hugo nguyên vẹn. Chỉ các token dưới đây được đổi, và mỗi token có luật kiểm riêng. Giá trị sai luật bị <b>bỏ qua</b> (giữ mặc định, in cảnh báo ra console), nên bố cục không bao giờ vỡ. Không đổi được: bố cục, mascot, chữ bài học, ghi công Education Hugo.</p>
        <ThemeLab />
      </section>

      <section id="api" className="dev-card">
        <h2>REST API</h2>
        <Locked unlocked={unlocked}>
          <p>Gốc: <code>{API}</code>. Gửi key qua header <code>X-Edu-Partner-Key</code>. Không cookie, CORS mở cho tên miền đã đăng ký.</p>
          <Code>{`curl -H "X-Edu-Partner-Key: ${shown}" \\\n  "${API}/lessons/sql12?lang=en"`}</Code>
          <div className="dev-table-wrap"><table className="dev-table">
            <thead><tr><th></th><th>Đường dẫn</th><th>Làm gì</th><th>Trả về</th></tr></thead>
            <tbody>{REST.map(([m, p, d, r]) => <tr key={p}><td><b>{m}</b></td><td><code>{p}</code></td><td>{d}</td><td><code>{r}</code></td></tr>)}</tbody>
          </table></div>
          <h3>Lỗi</h3>
          <div className="dev-table-wrap"><table className="dev-table">
            <tbody>{ERRORS.map(([c, d]) => <tr key={c}><td><code>{c}</code></td><td>{d}</td></tr>)}</tbody>
          </table></div>
          <p>Đáp án trắc nghiệm không bao giờ nằm trong bài tải về. Chỉ <code>/grade</code> trả lời giải, sau khi học viên đã nộp.</p>
        </Locked>
      </section>

      <section id="demo" className="dev-card">
        <h2>Thử ô SQL</h2>
        <p>Đây chính là component <code>SqlPlayground</code>, chạy SQLite ngay trong trình duyệt của bạn, không cần key.</p>
        <Suspense fallback={<p>…</p>}>
          <SqlPlayground id="dev-demo" setup={HAT_SEED} query={"SELECT name, price\nFROM menu_items\nORDER BY price DESC;"} />
        </Suspense>
      </section>

      <section id="license" className="dev-card">
        <h2>Bản quyền và bảo mật</h2>
        <ul>
          <li><b>Key</b> có 32 ký tự ngẫu nhiên, gửi thẳng vào email đối tác. Máy chủ chỉ lưu bản băm, admin cũng không xem lại được key gốc.</li>
          <li><b>Có hạn dùng</b> (tối đa 365 ngày) và có thể bị thu hồi bất cứ lúc nào. Hết hạn thì thư viện ngừng tải bài và báo lỗi trong khung.</li>
          <li><b>Khoá theo tên miền</b>, và mỗi lượt dùng đều được ghi nhận (số lượt, lần dùng gần nhất).</li>
          <li><b>Nội dung bài học</b> do Education Hugo tự biên soạn. Không được sao chép, lưu trữ hay phân phối lại ngoài thư viện, và không được gỡ ghi công.</li>
          <li>Tiến độ học viên của đối tác nằm trong trình duyệt của học viên (localStorage). Education Hugo không thu thập dữ liệu cá nhân của họ.</li>
        </ul>
      </section>
    </article>
    </div>
  );
}
