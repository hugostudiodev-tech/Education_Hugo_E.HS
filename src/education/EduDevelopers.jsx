import { lazy, Suspense, useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { apiFetch } from "../services/api/core/apiClient";
import { THEME_RULES, themeVars } from "../sdk/theme";
import QuizQuestion from "../components/member/hugoCoder/QuizQuestion";
import { CONTACT } from "./legalText";
import EduStatus from "./EduStatus";
import DevSite from "./DevTop";

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

/** Vẽ tài liệu đối tác nhận từ máy chủ — chỉ chữ thuần qua React (không HTML thô), nên không chèn được script. */
function DocBlocks({ blocks }) {
  return blocks.map((b, i) => {
    if (b.h) return <h3 key={i}>{b.h}</h3>;
    if (b.p) return <p key={i}>{b.p}</p>;
    if (b.code) return <Code key={i}>{b.code}</Code>;
    if (b.list) return <ul key={i}>{b.list.map((item) => <li key={item}>{item}</li>)}</ul>;
    if (b.table) return (
      <div key={i} className="dev-table-wrap"><table className="dev-table">
        {b.table.head && <thead><tr>{b.table.head.map((c, j) => <th key={j}>{c}</th>)}</tr></thead>}
        <tbody>{b.table.rows.map((row, r) => <tr key={r}>{row.map((c, j) => <td key={j}>{j === 0 ? <b>{c}</b> : <code>{c}</code>}</td>)}</tr>)}</tbody>
      </table></div>
    );
    return null;
  });
}

// Khung giả khi chưa có key: chỉ là thanh xám + khối tối, KHÔNG có chữ nào của tài liệu thật
// (tài liệu thật chưa từng được tải xuống), nên xoá lớp mờ cũng chỉ thấy khung trống.
const FAKE = ["h", "p", "code", "h", "code", "h", "p", "p"];
function Locked({ blocks }) {
  if (blocks) return <DocBlocks blocks={blocks} />;
  return (
    <div className="dev-locked">
      <div className="dev-locked-body" aria-hidden="true">
        {FAKE.map((kind, i) => <i key={i} className={`dev-fake is-${kind}`} style={{ "--w": `${55 + ((i * 37) % 40)}%` }} />)}
      </div>
      <div className="dev-locked-veil"><span className="material-symbols-outlined">lock</span><b>Dành cho đối tác</b><span>Nhập key ở mục "Nhập key đối tác" để xem.</span></div>
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
// Chờ tệp nạp xong mới vẽ phần demo: không nháy giao diện "trần" lúc mới vào.
function useUiCss() {
  const [ready, setReady] = useState(() => Boolean(document.querySelector(`link[data-eh-ready][href="${UI_CSS}"]`)));
  useEffect(() => {
    if (ready) return undefined;
    let link = document.querySelector(`link[href="${UI_CSS}"]`);
    if (!link) link = document.head.appendChild(Object.assign(document.createElement("link"), { rel: "stylesheet", href: UI_CSS }));
    const done = () => { link.dataset.ehReady = "1"; setReady(true); };
    if (link.sheet) done();
    link.addEventListener("load", done);
    link.addEventListener("error", done); // lỗi mạng: vẫn hiện trang (mất style demo) thay vì quay mãi
    return () => { link.removeEventListener("load", done); link.removeEventListener("error", done); };
  }, [ready]);
  return ready;
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
  const ready = useUiCss();
  const [tokens, setTokens] = useState(UI_DEFAULTS);
  const [dark, setDark] = useState(false);
  const preview = { style: uiVars(tokens), "data-eh-theme": dark ? "dark" : "light", className: "dev-ui-stage" };
  if (!ready) return <section className="dev-card"><EduStatus kind="loading" compact /></section>;
  return (
    <>
      <section id="ui" className="dev-card">
        <span className="eh-badge eh-badge--success">Miễn phí · MIT</span>
        <h2>Education Hugo UI</h2>
        <ul className="dev-facts" aria-label="Đặc điểm">
          <li><span className="material-symbols-outlined" aria-hidden="true">css</span>Thuần CSS</li>
          <li><span className="material-symbols-outlined" aria-hidden="true">compress</span>2 KB nén</li>
          <li><span className="material-symbols-outlined" aria-hidden="true">key_off</span>Không cần key</li>
          <li><span className="material-symbols-outlined" aria-hidden="true">dark_mode</span>Sáng/tối</li>
        </ul>
        <div className="dev-ui-row">
          <a className="eh-btn" href={UI_CSS} download="edu-ui.css"><span className="material-symbols-outlined" aria-hidden="true">download</span>Tải edu-ui.css</a>
        </div>
        <UiLab tokens={tokens} setTokens={setTokens} dark={dark} setDark={setDark} />
        <p className="dev-note">Phiên bản {UI_VERSION} · <a href="/ui/LICENSE.txt">Giấy phép MIT</a> · © Hugo Wishpax Le · giữ dòng ghi công trong tệp</p>
        <details className="dev-more">
          <summary>Nguyên tắc · Component · Hướng dẫn</summary>
        <h3>Nguyên tắc</h3>
        <ul className="dev-rules">
          {PRINCIPLES.map(([icon, title, body]) => (
            <li key={icon}><span className="material-symbols-outlined" aria-hidden="true">{icon}</span><div><b>{title}</b><p>{body}</p></div></li>
          ))}
        </ul>
        <h3>Component</h3>
        {UI_COMPONENTS.map(([name, cls, demo, code]) => (
          <div key={name} className="dev-comp">
            <h3>{name} <code>.{cls.split(" · ").join(" · .")}</code></h3>
            <div {...preview}>{demo}</div>
            <Code>{code}</Code>
          </div>
        ))}
        <h3>Hướng dẫn dùng</h3>
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
        </details>
      </section>
    </>
  );
}

// ── Tab: framework, ngôn ngữ, kỹ thuật khuyên dùng khi tích hợp Education Hugo ──
// 12 mascot của gói education-hugo-zodiac (ảnh xem trước công khai ở public/edu/zodiac).
const ZODIAC_IDS = ["aries", "taurus", "geminus", "cancer", "leo", "virgo", "libra", "scorpius", "sagittarius", "capricornus", "aquarius", "pisces"];

const DEV_TABS = [
  ["challenge", "Thử thách", "timer", "#ff9600"],
  ["ui", "UI mở", "palette", "#1cb0f6"],
  ["step", "Thư viện step", "key", "#a560f0"],
  ["stack", "Khuyên dùng", "recommend", "#58a700"],
  ["license", "Bản quyền", "copyright", "#3c3c3c"],
];
const STACK = [
  ["Framework", "web", [["React 18+", "Bắt buộc cho thư viện step (peer dependency)"], ["Vite", "Dựng nhanh, tách gói tự động"], ["Next.js", "Đặt component trong \"use client\""], ["HTML thuần", "Đủ cho Education Hugo UI"]]],
  ["Ngôn ngữ", "code", [["TypeScript / JavaScript ES2020+", "Thư viện xuất ES module"], ["CSS biến --eh-*", "Đổi giao diện không sửa mã"], ["SQL (SQLite)", "Ô SQL chạy ngay trong trình duyệt"]]],
  ["Kỹ thuật", "tune", [["React.lazy + Suspense", "Chỉ tải khoá học khi người dùng mở"], ["CSP: 'wasm-unsafe-eval'", "Cần cho ô SQL (WebAssembly)"], ["Key qua biến môi trường", "Không ghi cứng key vào mã nguồn"], ["Đăng ký tên miền", "Key chỉ chạy trên tên miền đã đăng ký"]]],
  ["Trải nghiệm", "accessibility_new", [["prefers-reduced-motion", "Tôn trọng cài đặt giảm chuyển động"], ["Màu + dấu ✓ ✕", "Không chỉ dựa vào màu (người mù màu)"], ["Vùng chạm ≥ 44px", "Theo Apple HIG"]]],
];

function DevStack() {
  return (
    <section className="dev-card">
      <h2>Khuyên dùng</h2>
      <div className="dev-stack">
        {STACK.map(([group, icon, items]) => (
          <div key={group} className="dev-stack-group">
            <h3><span className="material-symbols-outlined" aria-hidden="true">{icon}</span>{group}</h3>
            <ul>{items.map(([name, why]) => <li key={name}><b>{name}</b><small>{why}</small></li>)}</ul>
          </div>
        ))}
      </div>
      <Code>{`import { lazy, Suspense } from "react";
import "education-hugo-react/style.css";
const EducationHugo = lazy(() => import("education-hugo-react").then((m) => ({ default: m.EducationHugo })));

<Suspense fallback={null}>
  <EducationHugo apiKey={import.meta.env.VITE_EDU_KEY} course="sql" />
</Suspense>`}</Code>
    </section>
  );
}

// ── Thử thách SQL bấm giờ: "hơn thua" với chính mình — kỷ lục lưu trên máy, hạng có CHỮ (không chỉ màu). ──
const BEST_KEY = "edu.dev.sqlBest";
const TIERS = [[60, "Vàng", "#ffd43b"], [180, "Bạc", "#dee2e6"], [Infinity, "Đồng", "#f0b27a"]];
const CHALLENGE = { solution: "SELECT name, price FROM menu_items ORDER BY price DESC LIMIT 3;", query: "SELECT name, price\nFROM menu_items\n" };

function DevChallenge() {
  const [start, setStart] = useState(0);
  const [now, setNow] = useState(0);
  const [time, setTime] = useState(null);
  const [best, setBest] = useState(() => { try { return Number(localStorage.getItem(BEST_KEY)) || null; } catch { return null; } });
  useEffect(() => {
    if (!start || time !== null) return undefined;
    const id = setInterval(() => setNow(Date.now()), 200);
    return () => clearInterval(id);
  }, [start, time]);
  const [round, setRound] = useState(0); // >0: đã mở ô SQL; đồng hồ chỉ chạy khi SQLite sẵn sàng (công bằng)
  const go = () => { setRound((r) => r + 1); setStart(0); setTime(null); };
  const ready = () => { const t = Date.now(); setStart(t); setNow(t); };
  const solved = () => {
    const sec = Math.round((Date.now() - start) / 100) / 10;
    setTime(sec);
    if (!best || sec < best) { setBest(sec); try { localStorage.setItem(BEST_KEY, String(sec)); } catch { /* riêng tư */ } }
  };
  const elapsed = start ? (time ?? (now - start) / 1000) : 0;
  const tier = time !== null ? TIERS.find(([max]) => time <= max) : null;
  return (
    <section id="demo" className="dev-card dev-ch">
      <div className="dev-ch-head">
        <span className="material-symbols-outlined" aria-hidden="true">timer</span>
        <h2>Thử thách SQL</h2>
        <b className="dev-ch-clock">{elapsed.toFixed(1)}s</b>
        {best && <small title="Kỷ lục của bạn"><span className="material-symbols-outlined" aria-hidden="true">emoji_events</span>{best}s</small>}
      </div>
      <p className="dev-ch-task"><b>Top 3</b> món đắt nhất · <code>name</code>, <code>price</code> · giá giảm dần</p>
      <ol className="dev-ch-tiers" aria-label="Hạng">
        {TIERS.map(([max, name, color]) => <li key={name}><i style={{ background: color }}>{name}</i>{max === Infinity ? "trên 180s" : `tới ${max}s`}</li>)}
      </ol>
      {round ? (
        <Suspense fallback={<EduStatus kind="loading" compact />}>
          {/* Không truyền setup: SqlPlayground đã tự nạp HAT_SEED (truyền lại sẽ tạo bảng hai lần → lỗi). */}
          <SqlPlayground key={round} query={CHALLENGE.query} solution={CHALLENGE.solution} ordered onReady={ready} onSolved={solved} />
        </Suspense>
      ) : (
        <button type="button" className="eh-btn dev-ch-go" onClick={go}><span className="material-symbols-outlined" aria-hidden="true">play_arrow</span>Bắt đầu bấm giờ</button>
      )}
      {tier && (
        <p className="dev-ch-result" role="status">
          <i style={{ background: tier[2] }}>{tier[1]}</i><b>{time}s</b>{time === best && <span>· Kỷ lục mới</span>}
          <button type="button" className="eh-btn eh-btn--secondary" onClick={go}>Chơi lại</button>
        </p>
      )}
      <p className="dev-note">Chạy SQLite ngay trong trình duyệt bằng component <code>SqlPlayground</code>, không cần key.</p>
    </section>
  );
}

export default function EduDevelopers() {
  // Tab theo ?tab= (chia sẻ được, không dùng link #). Link cũ dạng #step/#ui vẫn mở đúng tab.
  const [params, setParams] = useSearchParams();
  const asked = params.get("tab") || { "#step": "step", "#partner": "step", "#ui": "ui", "#demo": "challenge", "#license": "license" }[location.hash];
  const tab = DEV_TABS.some(([id]) => id === asked) ? asked : "challenge";
  const openTab = (id) => setParams({ tab: id }, { replace: true });
  const [key, setKey] = useState(() => { try { return sessionStorage.getItem(KEY_STORE) || ""; } catch { return ""; } });
  const [partner, setPartner] = useState(null);
  const [state, setState] = useState({ busy: false, error: "" });
  const unlocked = Boolean(partner);

  const unlock = async (event) => {
    event?.preventDefault();
    setState({ busy: true, error: "" });
    try {
      const data = await apiFetch("/partner/verify", { method: "POST", body: JSON.stringify({ key: key.trim(), docs: true }) });
      setPartner(data);
      try { sessionStorage.setItem(KEY_STORE, key.trim()); } catch { /* chế độ riêng tư */ }
      setState({ busy: false, error: "" });
    } catch (error) {
      try { sessionStorage.removeItem(KEY_STORE); } catch { /* chế độ riêng tư */ }
      setState({ busy: false, error: error.message });
    }
  };
  // Đã mở khoá trong phiên này (tải lại trang): tự kiểm lại key, không bắt nhập lại.
  useEffect(() => { if (key.length === 32) unlock(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <DevSite>
    <article className="edu-page dev">
      <header className="dev-hero">
        <p className="dev-eyebrow">Education Hugo · Nhà phát triển</p>
        <h1 className="edu-page-title">Xây cùng Education Hugo</h1>
        <p className="dev-lead">Hai thư viện · một dòng là chạy.</p>
        <Code>{`<link rel="stylesheet" href="${SITE}${UI_CSS}">\n<button class="eh-btn">Bắt đầu</button>`}</Code>
        <div className="dev-tabs" role="tablist" aria-label="Khu nhà phát triển">
          {DEV_TABS.map(([id, label, icon, color]) => (
            <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => openTab(id)}>
              <span className="material-symbols-outlined" aria-hidden="true" style={{ background: color }}>{icon}</span>{label}
            </button>
          ))}
        </div>
      </header>

      {tab === "challenge" && <DevChallenge />}
      {tab === "ui" && <OpenLibrary />}
      {tab === "step" && <>
      <section id="step" className="dev-card dev-step-intro">
        <span className="eh-badge">Dành cho đối tác</span>
        <h2>Thư viện step education-hugo-react</h2>
        <p>Đưa khoá học Education Hugo vào website của trường hoặc tổ chức bạn: bản đồ chặng, bài học, ô SQL và chấm bài giống hệt <Link to="/learn">bản gốc</Link>. Bài học tải từ máy chủ Hugo Studio và chỉ đọc được bằng <b>key đối tác</b> do admin cấp.</p>
        <ol className="dev-steps" aria-label="Điều kiện cấp key">
          <li><span className="material-symbols-outlined" aria-hidden="true">badge</span><b>18+</b><small>Đủ năng lực hành vi dân sự</small></li>
          <li><span className="material-symbols-outlined" aria-hidden="true">work</span><b>Có dự án</b><small>Tổ chức hoặc cá nhân, đính kèm trong mail</small></li>
          <li><span className="material-symbols-outlined" aria-hidden="true">date_range</span><b>Thời hạn</b><small>Ghi rõ từ ngày … đến ngày …</small></li>
        </ol>
        <div className="dev-ui-row">
          <a className="eh-btn" href={`mailto:${CONTACT}?subject=Xin%20key%20%C4%91%E1%BB%91i%20t%C3%A1c%20Education%20Hugo`}>Gửi mail xin key</a>
          <Link className="eh-btn eh-btn--secondary" to="/partners">Đọc quy định đối tác</Link>
        </div>
        <p className="dev-note">Liên hệ: {CONTACT}</p>
      </section>

      <section id="partner" className="dev-card">
        <h2><span className="material-symbols-outlined" aria-hidden="true">key</span> Key đối tác</h2>
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
        <h3>Cài đặt và chạy</h3>
        <Locked blocks={partner?.docs?.start} />
        <h3>REST API</h3>
        <Locked blocks={partner?.docs?.api} />
        <h3>Mascot 12 cung hoàng đạo</h3>
        <ul className="dev-zodiac" aria-label="12 mascot trong gói education-hugo-zodiac">
          {ZODIAC_IDS.map((id) => <li key={id}><img src={`/edu/zodiac/${id}.svg`} alt="" width="64" height="64" loading="lazy" /><code>{id}</code></li>)}
        </ul>
        <p>Gói <code>education-hugo-zodiac</code>: SVG tự chuyển động, không phụ thuộc thư viện nào. Bản quyền Hugo Studio, chỉ dùng với key còn hiệu lực.</p>
        <Locked blocks={partner?.docs?.zodiac} />
        <details className="dev-more">
          <summary>Component · Tuỳ biến</summary>
        <p>Mọi component đều xuất ra từ <code>education-hugo-react</code>. <code>EducationHugo</code> đã ghép sẵn tất cả; các component lẻ dành cho bố cục tự dựng, và vẫn cần <code>configurePartner({"{ key }"})</code> trước khi gọi API.</p>
        {COMPONENTS.map(([name, desc, props]) => (
          <details key={name} className="dev-comp">
            <summary><code>{name}</code><span>{desc}</span></summary>
            <div className="dev-table-wrap"><table className="dev-table">
              <thead><tr><th>Prop</th><th>Kiểu</th><th>Mặc định</th><th>Ý nghĩa</th></tr></thead>
              <tbody>{props.map(([p, type, def, note]) => <tr key={p}><td><code>{p}</code></td><td><code>{type}</code></td><td>{def}</td><td>{note}</td></tr>)}</tbody>
            </table></div>
          </details>
        ))}
        <h3>Tuỳ biến theo quy tắc</h3>
        <p>Thư viện giữ giao diện Education Hugo nguyên vẹn. Chỉ các token dưới đây được đổi, và mỗi token có luật kiểm riêng. Giá trị sai luật bị <b>bỏ qua</b> (giữ mặc định, in cảnh báo ra console), nên bố cục không bao giờ vỡ. Không đổi được: bố cục, mascot, chữ bài học, ghi công Education Hugo.</p>
        <ThemeLab />
        </details>
      </section>


      </>}
      {tab === "stack" && <DevStack />}
      {tab === "license" && <>
      <section id="license" className="dev-card">
        <h2>Bản quyền và bảo mật</h2>
        <ul className="dev-guard">
          {[
            ["key", "Key 32 ký tự", "Máy chủ chỉ lưu bản băm SHA-256"],
            ["event_busy", "Có hạn dùng", "Tối đa 365 ngày · thu hồi có hiệu lực ngay"],
            ["language", "Khoá theo tên miền", "Mỗi lượt dùng đều được ghi nhận"],
            ["speed", "Giới hạn tốc độ", "Đọc 90 · chấm 20 lượt/phút mỗi IP"],
            ["copyright", "Nội dung có bản quyền", "Không sao chép · luôn ghi công Education Hugo"],
            ["shield_person", "Không thu dữ liệu học viên", "Tiến độ nằm trên máy học viên"],
          ].map(([icon, title, note]) => <li key={icon}><span className="material-symbols-outlined" aria-hidden="true">{icon}</span><b>{title}</b><small>{note}</small></li>)}
        </ul>
        <p className="dev-note">© Hugo Studio · <Link to="/partners">Quy định đối tác</Link> · Giấy phép gói: chỉ dùng với key còn hiệu lực, không phân phối lại, không gỡ ghi công.</p>
      </section>
      </>}
    </article>
    </DevSite>
  );
}
