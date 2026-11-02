import { useState } from "react";
import { asset } from "../../../config/partner";
import { playEduSound } from "../../../education/eduSound";
import { useEduText } from "../../../education/eduText";
import "./sqlPlayground.css";

/**
 * Ô chạy Python thật ngay trong trình duyệt — anh em của SqlPlayground, dùng chung CSS.
 * Pyodide chạy trong Web Worker (public/edu/py/worker.js): chạy quá TIMEOUT là huỷ worker
 * và tạo lại, nên `while True:` quên điều kiện dừng không treo trang.
 *
 * Bài tập (slide có `solution`): chạy bài làm và lời giải với cùng `stdin`, input() không in lời
 * nhắc, rồi so phần in ra màn hình (bỏ khoảng trắng cuối dòng) — không bắt chép đúng từng chữ. Gợi ý mở dần theo số lần sai.
 * ponytail: chấm ở máy học viên chỉ để luyện tập — không cộng Ngọc, nên không chấm lại ở máy chủ.
 */
const TIMEOUT = 8000; // lần đầu còn phải tải Pyodide (~10 MB, trình duyệt giữ cache sau đó)
const DRAFT = "edu.py.";
let worker;
let seq = 0;

const read = (key) => { try { return localStorage.getItem(key); } catch { return null; } };
const write = (key, value) => { try { value == null ? localStorage.removeItem(key) : localStorage.setItem(key, value); } catch { /* riêng tư */ } };

function runPython(code, stdin, timeout, quiet = false) {
  worker ||= new Worker(asset("/edu/py/worker.js"));
  const id = ++seq;
  return new Promise((resolve) => {
    const timer = setTimeout(() => {
      worker.terminate();
      worker = null; // lần sau tạo worker mới
      resolve({ timeout: true });
    }, timeout);
    const listen = ({ data }) => {
      if (data.id !== id) return;
      clearTimeout(timer);
      worker?.removeEventListener("message", listen);
      resolve(data);
    };
    worker.addEventListener("message", listen);
    worker.postMessage({ id, code, stdin, quiet });
  });
}

const norm = (text = "") => text.split("\n").map((line) => line.trimEnd()).join("\n").trim();

export default function PyPlayground({ id = "", code = "", stdin = "", solution, hints = [] }) {
  const { t } = useEduText();
  const draftKey = id ? `${DRAFT}${id}` : null;
  const [text, setText] = useState(() => (draftKey && read(draftKey)) || code);
  const [input, setInput] = useState(stdin);
  const [out, setOut] = useState(null);
  const [busy, setBusy] = useState(false);
  const [warm, setWarm] = useState(false);
  const [misses, setMisses] = useState(0);
  const [solved, setSolved] = useState(() => Boolean(draftKey && read(`${draftKey}.ok`)));

  const edit = (value) => {
    setText(value);
    if (draftKey) write(draftKey, value === code ? null : value);
  };

  const run = async () => {
    setBusy(true);
    const got = await runPython(text, input, warm ? 3000 : TIMEOUT);
    setWarm(!got.timeout && !got.loadFail);
    setOut(got);
    if (solution && !got.loadFail) {
      // Chấm với dữ liệu nhập GỐC của bài (dù học viên đã sửa ô nhập để thử), bỏ lời nhắc input().
      const mine = await runPython(text, stdin, 3000, true);
      const want = await runPython(solution, stdin, 3000, true);
      if (!mine.error && !mine.timeout && norm(mine.out) === norm(want.out)) {
        setSolved(true);
        if (draftKey) write(`${draftKey}.ok`, "1");
        playEduSound("success");
      } else {
        setMisses((n) => n + 1);
        playEduSound("thud");
      }
    } else if (got.error || got.timeout) playEduSound("thud");
    setBusy(false);
  };

  const reset = () => { edit(code); setInput(stdin); setOut(null); };

  const shownHints = solution ? hints.slice(0, Math.min(hints.length, misses)) : [];
  const verdict = solution && out && !busy && (solved ? "ok" : misses ? "miss" : null);
  return (
    <div className={`sql-play${solved ? " is-solved" : ""}`}>
      {solution && <p className="sql-play-task"><b>{t("pyPlay.task")}</b>{t(solved ? "pyPlay.solved" : "pyPlay.todo")}</p>}
      <textarea value={text} spellCheck={false} autoCapitalize="off" autoCorrect="off"
        rows={Math.min(14, Math.max(3, text.split("\n").length + 1))}
        onChange={(event) => edit(event.target.value)}
        onKeyDown={(event) => {
          if ((event.metaKey || event.ctrlKey) && event.key === "Enter") { event.preventDefault(); if (!busy) run(); }
          // Tab chèn 4 dấu cách — thụt lề là cú pháp của Python.
          else if (event.key === "Tab" && !event.shiftKey) {
            event.preventDefault();
            const { selectionStart: a, selectionEnd: b } = event.target;
            edit(`${text.slice(0, a)}    ${text.slice(b)}`);
            requestAnimationFrame(() => event.target.setSelectionRange(a + 4, a + 4));
          }
        }}
        aria-label="Python" />
      {stdin !== "" && (
        <label className="py-play-input">
          <small>{t("pyPlay.input")}</small>
          <textarea value={input} rows={Math.max(1, input.split("\n").length)} spellCheck={false} onChange={(event) => setInput(event.target.value)} />
        </label>
      )}
      <div className="sql-play-bar">
        <button type="button" className="edu-btn" disabled={busy} onClick={run}>{busy ? t(warm ? "pyPlay.running" : "pyPlay.loading") : t(solution ? "pyPlay.grade" : "pyPlay.run")}</button>
        <button type="button" className="edu-btn edu-btn--ghost" onClick={reset}>{t("pyPlay.reset")}</button>
        {solution && misses >= hints.length + 2 && !solved && (
          <button type="button" className="edu-btn edu-btn--ghost" onClick={() => edit(solution)}>{t("pyPlay.reveal")}</button>
        )}
      </div>
      {verdict === "ok" && <p className="sql-play-verdict is-ok" role="status">{t("pyPlay.ok")}</p>}
      {verdict === "miss" && !solved && <p className="sql-play-verdict is-miss" role="status">{t("pyPlay.miss")}</p>}
      {shownHints.map((hint, i) => <p key={hint} className="sql-play-hint"><b>{t("pyPlay.hint", { n: i + 1 })}:</b> {hint}</p>)}
      {out?.loadFail && <p className="sql-play-error" role="alert">{t("pyPlay.loadFail")}</p>}
      {out?.timeout && <p className="sql-play-error" role="alert">{t("pyPlay.timeout")}</p>}
      {out && !out.loadFail && !out.timeout && (
        <pre className="py-play-out" aria-live="polite">{out.out || (!out.error && t("pyPlay.empty"))}{out.error && <span className="sql-play-error">{out.error}</span>}</pre>
      )}
    </div>
  );
}
