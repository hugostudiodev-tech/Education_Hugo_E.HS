// Ô Python của khoá Python: Pyodide (CPython biên dịch sang WebAssembly, MPL 2.0) chạy trong
// Web Worker để vòng lặp vô hạn không treo trang — PyPlayground.jsx hết giờ thì terminate().
// Mỗi lần chạy một không gian tên mới; input() đọc lần lượt từng dòng của `stdin`.
// `quiet` (lúc chấm bài): input() không in lời nhắc, để lời nhắc khác nhau không bị chấm sai.
/* global importScripts, loadPyodide */
const VERSION = "314.0.7";
importScripts(`https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/pyodide.js`);
const ready = loadPyodide({ indexURL: `https://cdn.jsdelivr.net/pyodide/v${VERSION}/full/` });

// Traceback của Pyodide kèm vài khung nội bộ — chỉ giữ phần từ mã của học viên trở đi.
const tidy = (message) => {
  const lines = String(message).split("\n");
  const from = lines.findIndex((line) => line.includes('"<exec>"'));
  return (from < 0 ? lines.slice(-1) : ["Traceback (most recent call last):", ...lines.slice(from)]).join("\n").trim();
};

self.onmessage = async ({ data: { id, code, stdin = "", quiet = false } }) => {
  let py;
  try { py = await ready; } catch { return self.postMessage({ id, loadFail: true }); }
  let out = "";
  const write = (text) => { out += text + "\n"; };
  const lines = stdin.split("\n");
  py.setStdout({ batched: write });
  py.setStderr({ batched: write });
  py.setStdin({ stdin: () => (lines.length ? lines.shift() : undefined) });
  py.runPython(`import builtins
if not hasattr(builtins, "_edu_input"): builtins._edu_input = builtins.input
builtins.input = (lambda prompt="": builtins._edu_input()) if ${quiet ? "True" : "False"} else builtins._edu_input`);
  const globals = py.globals.get("dict")();
  try {
    await py.runPythonAsync(code, { globals });
    self.postMessage({ id, out });
  } catch (error) {
    self.postMessage({ id, out, error: tidy(error.message) });
  } finally {
    globals.destroy();
  }
};
