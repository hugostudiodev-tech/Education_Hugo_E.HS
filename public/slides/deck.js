// Engine chung cho public/slides/buoiN.html: điều hướng, đồng hồ, đáp án ẩn, khung code chạy Python (Pyodide).
// File để ngoài (không inline) vì CSP của site chỉ cho script-src 'self' + jsdelivr.
const slides = [...document.querySelectorAll(".slide")];
const nav = document.createElement("nav");
nav.className = "nav";
nav.innerHTML = `<a class="ghost" href="/admin" title="Về trang quản trị" style="color:inherit;text-decoration:none">✕</a>
  <button class="ghost" id="prev" aria-label="Slide trước">←</button><span id="count"></span>
  <span class="phase" id="phase"></span><span class="grow"><i id="prog"></i></span>
  <button class="ghost clock" id="clock" title="Bấm để chạy / dừng đồng hồ buổi học">00:00</button>
  <button class="ghost" id="next" aria-label="Slide sau">→</button>`;
document.body.append(nav);
const $ = (id) => document.getElementById(id);
const key = "slide:" + location.pathname;
let cur = 0;
function show(i) {
  cur = Math.max(0, Math.min(slides.length - 1, i));
  slides.forEach((s, k) => s.classList.toggle("on", k === cur));
  $("count").textContent = cur + 1 + "/" + slides.length;
  $("phase").textContent = slides[cur].dataset.phase || "";
  $("prog").style.width = ((cur + 1) / slides.length) * 100 + "%";
  try { sessionStorage.setItem(key, cur); } catch {}
}
$("prev").onclick = () => show(cur - 1);
$("next").onclick = () => show(cur + 1);
document.addEventListener("keydown", (e) => {
  if (e.target.matches("textarea,input")) return;
  if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); show(cur + 1); }
  if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); show(cur - 1); }
});

let t0 = 0, acc = 0, tick = null;
$("clock").onclick = () => {
  if (tick) { acc += Date.now() - t0; clearInterval(tick); tick = null; return; }
  t0 = Date.now();
  tick = setInterval(() => {
    const s = Math.floor((acc + Date.now() - t0) / 1000);
    $("clock").textContent = String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  }, 500);
};

document.querySelectorAll("[data-reveal]").forEach((b) => (b.onclick = () => b.closest(".slide").querySelector(".reveal").classList.toggle("on")));

// Pyodide tải một lần (~10MB, trình duyệt cache lại), chỉ khi bấm Chạy lần đầu.
let py = null;
function pyodide() {
  return (py ??= new Promise((ok, fail) => {
    const s = document.createElement("script");
    s.src = "https://cdn.jsdelivr.net/npm/pyodide@0.26.4/pyodide.js";
    s.onload = () => loadPyodide().then(ok, fail);
    s.onerror = () => { py = null; fail(new Error("Không tải được Python. Kiểm tra mạng rồi bấm Chạy lại.")); };
    document.head.append(s);
  }));
}

// <pre class="lab" data-input="Lan\n16">code</pre> → khung sửa code + ô "dữ liệu nhập" (mỗi dòng cho một lần input()) + kết quả.
document.querySelectorAll("pre.lab").forEach((pre, n) => {
  const src = pre.textContent.replace(/^\n/, "").replace(/\s+$/, "");
  const stdin = (pre.dataset.input || "").replace(/\\n/g, "\n");
  const lab = document.createElement("div");
  lab.className = "lab";
  lab.innerHTML = `<div class="ed"><div class="bar"><span>main.py · Ctrl+Enter để chạy</span>
    <button class="ghost" data-act="reset">Gốc</button><button class="run" data-act="run">▶ Chạy</button></div>
    <textarea id="code${n}" spellcheck="false" aria-label="Code Python"></textarea>
    ${pre.hasAttribute("data-input") ? `<textarea class="stdin" id="in${n}" rows="2" spellcheck="false" aria-label="Dữ liệu nhập" placeholder="Dữ liệu cho input(), mỗi dòng một lần"></textarea>` : ""}</div>
    <div class="out"><div class="bar"><span>Kết quả</span></div><pre aria-live="polite"></pre></div>`;
  pre.replaceWith(lab);
  const ta = lab.querySelector("textarea"), inp = lab.querySelector(".stdin"), out = lab.querySelector(".out pre");
  const reset = () => { ta.value = src; if (inp) inp.value = stdin; out.textContent = ""; };
  reset();
  ta.rows = Math.max(4, src.split("\n").length + 1);
  const put = (txt, cls) => { const s = document.createElement("span"); if (cls) s.className = cls; s.textContent = txt; out.append(s); };
  async function run() {
    out.textContent = "";
    put("Đang chạy…", "i");
    let p;
    try { p = await pyodide(); } catch (e) { out.textContent = ""; put(e.message, "e"); return; }
    out.textContent = "";
    p.setStdout({ batched: (t) => put(t + "\n") });
    p.globals.set("__stdin", (inp?.value || "").split("\n"));
    try {
      // input() lấy lần lượt từng dòng trong ô dữ liệu nhập và in lại như khi gõ tay.
      p.runPython(`import builtins
_q = list(__stdin)
def _input(prompt=""):
    if not _q or (_q == [""]):
        raise EOFError("hết dữ liệu nhập: thêm một dòng vào ô dữ liệu nhập")
    v = _q.pop(0)
    print(str(prompt) + v)
    return v
builtins.input = _input`);
      p.runPython(ta.value, { globals: p.toPy({}) });
      if (!out.textContent) put("(chương trình không in gì)", "i");
    } catch (e) {
      // Chỉ giữ phần traceback của code học sinh, bỏ các dòng nội bộ của Pyodide.
      const lines = String(e.message).split("\n");
      const at = lines.findIndex((l) => l.includes('File "<exec>"'));
      put((at >= 0 ? lines.slice(at).join("\n") : lines.slice(-2).join("\n")).trim(), "e");
    }
  }
  lab.querySelector("[data-act=run]").onclick = run;
  lab.querySelector("[data-act=reset]").onclick = reset;
  ta.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) { e.preventDefault(); run(); }
    if (e.key === "Tab") { e.preventDefault(); ta.setRangeText("    ", ta.selectionStart, ta.selectionEnd, "end"); }
  });
});

let saved = 0;
try { saved = +sessionStorage.getItem(key) || 0; } catch {}
show(saved);
