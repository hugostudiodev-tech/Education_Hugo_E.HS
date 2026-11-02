import { lazy, Suspense, useState } from "react";
import { Link } from "react-router-dom";
import { apiFetch } from "../services/api/core/apiClient";
import { THEME_RULES, themeVars } from "../sdk/theme";
import QuizQuestion from "../components/member/hugoCoder/QuizQuestion";
import { HAT_SEED } from "../../packages/courses/sql/seed.js";

const SqlPlayground = lazy(() => import("../components/member/hugoCoder/SqlPlayground"));

/**
 * /developers — tài liệu thư viện @education-hugo/react và REST API cho đối tác.
 * Phần công khai: tổng quan, component, quy tắc tuỳ biến, bản quyền. Phần đối tác
 * (lệnh cài, mã khởi động, REST API) bị làm mờ tới khi nhập key admin cấp.
 * Làm mờ chỉ là lớp trình bày: thứ thật sự khoá là máy chủ — không có key thì
 * không tải được gói và không đọc được bài nào.
 */
const SITE = "https://education.hugowishpax.studio";
const API = "https://api.hugowishpax.studio/api";
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
    <article className="edu-page dev">
      <header>
        <p className="dev-eyebrow">Education Hugo · Nhà phát triển</p>
        <h1 className="edu-page-title">Thư viện @education-hugo/react</h1>
        <p className="dev-lead">Đưa khoá học Education Hugo vào website của trường hoặc tổ chức bạn: bản đồ chặng, bài học, ô SQL và chấm bài giống hệt <Link to="/learn">bản gốc</Link>. Bài học tải từ máy chủ Hugo Studio, chỉ đọc được bằng <b>key đối tác</b> do admin cấp.</p>
      </header>

      <nav className="dev-toc" aria-label="Mục lục">
        {[["partner", "Đối tác"], ["start", "Cài đặt"], ["components", "Component"], ["theme", "Tuỳ biến"], ["api", "REST API"], ["demo", "Thử ô SQL"], ["license", "Bản quyền"]].map(([id, label]) => <a key={id} href={`#${id}`}>{label}</a>)}
      </nav>

      <section id="partner" className="dev-card">
        <h2>Đối tác</h2>
        {unlocked ? (
          <p className="dev-ok"><span className="material-symbols-outlined">verified</span> Key của {partner.email} còn hiệu lực tới {new Date(partner.expiresAt).toLocaleDateString("vi-VN")}. Các mục bên dưới đã mở.</p>
        ) : (
          <form onSubmit={unlock} className="dev-key">
            <p>Nhập key 32 ký tự Hugo Studio đã gửi vào email của bạn. Chưa có key? Liên hệ <a href="mailto:hugowishpax@gmail.com?subject=Xin%20key%20%C4%91%E1%BB%91i%20t%C3%A1c%20Education%20Hugo">Hugo Studio</a> kèm tên đơn vị và tên miền website.</p>
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
          <Code>{`import { EducationHugo } from "@education-hugo/react";
import "@education-hugo/react/style.css";

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
        <p>Mọi component đều xuất ra từ <code>@education-hugo/react</code>. <code>EducationHugo</code> đã ghép sẵn tất cả; các component lẻ dành cho bố cục tự dựng, và vẫn cần <code>configurePartner({"{ key }"})</code> trước khi gọi API.</p>
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
  );
}
