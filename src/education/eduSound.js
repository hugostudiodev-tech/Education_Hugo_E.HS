/**
 * Âm thanh của Education Hugo — tổng hợp bằng Web Audio, không tải tệp nào.
 *
 * Trình duyệt chỉ cho phát tiếng sau khi người dùng chạm/bấm lần đầu, nên âm thanh
 * tự động (nhân vật rơi xuống trang giới thiệu) chỉ kêu khi bối cảnh đã được mở
 * bằng một lần chạm. Tắt theo công tắc "Âm thanh trong bài" (khoá coding.sound).
 */
let ctx = null;

const enabled = () => {
  try { return localStorage.getItem("coding.sound") !== "off"; } catch { return true; }
};

function audio(unlock) {
  if (!ctx) {
    if (!unlock) return null;
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  if (ctx.state === "suspended") {
    if (!unlock) return null;
    ctx.resume();
  }
  return ctx;
}

function tone(ac, { freq, to = freq, type = "sine", at = 0, dur = 0.12, vol = 0.12 }) {
  const t = ac.currentTime + at;
  const osc = ac.createOscillator();
  const gain = ac.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t);
  if (to !== freq) osc.frequency.exponentialRampToValueAtTime(to, t + dur);
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(vol, t + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  osc.connect(gain).connect(ac.destination);
  osc.start(t);
  osc.stop(t + dur + 0.02);
}

const SOUNDS = {
  // Nút step trên bản đồ: tiếng "bụp" mềm hai nhịp như nút Duolingo.
  node: (ac) => { tone(ac, { freq: 392, to: 330, dur: 0.07, vol: 0.14 }); tone(ac, { freq: 784, to: 1046, type: "triangle", at: 0.05, dur: 0.12, vol: 0.08 }); },
  // Chuông thông báo: hai tiếng "đinh" ngân, như chuông nhỏ.
  ding: (ac) => { tone(ac, { freq: 1568, type: "sine", dur: 0.35, vol: 0.09 }); tone(ac, { freq: 2093, type: "sine", at: 0.12, dur: 0.45, vol: 0.06 }); },
  pop: (ac) => tone(ac, { freq: 520, to: 880, dur: 0.09, vol: 0.1 }),                       // bấm nút
  tick: (ac) => tone(ac, { freq: 1200, type: "triangle", dur: 0.05, vol: 0.06 }),            // đổi tab
  thud: (ac) => tone(ac, { freq: 180, to: 60, type: "sine", dur: 0.18, vol: 0.16 }),         // chạm đất
  boing: (ac) => tone(ac, { freq: 220, to: 520, type: "triangle", dur: 0.22, vol: 0.08 }),   // bật nhảy
  coin: (ac) => { tone(ac, { freq: 988, type: "square", dur: 0.08, vol: 0.05 }); tone(ac, { freq: 1319, type: "square", at: 0.08, dur: 0.22, vol: 0.05 }); },
  success: (ac) => [523, 659, 784, 1047].forEach((freq, i) => tone(ac, { freq, type: "triangle", at: i * 0.08, dur: 0.18, vol: 0.08 })),
  whoosh: (ac) => tone(ac, { freq: 300, to: 1400, type: "sawtooth", dur: 0.18, vol: 0.025 }),
  // ── Thách đấu: tiếng đập VS, đếm ngược, đúng/sai, thắng/thua ──
  vs: (ac) => {
    tone(ac, { freq: 140, to: 38, dur: 0.6, vol: 0.32 });                                         // trống trầm
    tone(ac, { freq: 90, to: 50, type: "sawtooth", dur: 0.25, vol: 0.06 });                       // rền
    [220, 277, 330, 440].forEach((freq) => tone(ac, { freq, type: "sawtooth", at: 0.04, dur: 0.55, vol: 0.035 })); // hợp âm kèn
  },
  whooshIn: (ac) => tone(ac, { freq: 200, to: 1800, type: "sawtooth", dur: 0.28, vol: 0.03 }),
  count: (ac) => tone(ac, { freq: 880, type: "square", dur: 0.09, vol: 0.06 }),
  go: (ac) => { tone(ac, { freq: 1320, type: "square", dur: 0.22, vol: 0.06 }); tone(ac, { freq: 660, to: 1320, type: "sawtooth", dur: 0.2, vol: 0.03 }); },
  right: (ac) => { tone(ac, { freq: 784, type: "triangle", dur: 0.08, vol: 0.1 }); tone(ac, { freq: 1175, type: "triangle", at: 0.07, dur: 0.16, vol: 0.1 }); },
  wrong: (ac) => tone(ac, { freq: 200, to: 140, type: "square", dur: 0.22, vol: 0.05 }),
  win: (ac) => [523, 659, 784, 1047, 1319].forEach((freq, i) => tone(ac, { freq, type: i === 4 ? "square" : "triangle", at: i * 0.1, dur: i === 4 ? 0.5 : 0.16, vol: 0.08 })),
  lose: (ac) => [392, 349, 311, 262].forEach((freq, i) => tone(ac, { freq, type: "triangle", at: i * 0.16, dur: 0.24, vol: 0.08 })),
};

/** Nhịp trống "đang thi đấu" chạy nền trong trận; trả hàm dừng. `faster()` dồn nhịp ở câu cuối. */
export function startEduBeat() {
  if (!enabled()) return { stop() {}, faster() {} };
  let step = 0, ms = 460, timer = 0;
  const hit = () => {
    const ac = audio(false);
    if (ac) {
      try {
        if (step % 2 === 0) tone(ac, { freq: 150, to: 48, dur: 0.14, vol: 0.18 });               // trống bass
        else tone(ac, { freq: 5200, type: "square", dur: 0.025, vol: 0.012 });                   // hi-hat
        if (step % 8 === 6) tone(ac, { freq: 330, to: 300, type: "sawtooth", dur: 0.12, vol: 0.02 }); // điểm nhấn
      } catch { /* im lặng */ }
    }
    step += 1;
    timer = setTimeout(hit, ms);
  };
  timer = setTimeout(hit, ms);
  return { stop: () => clearTimeout(timer), faster: () => { ms = 320; } };
}

/** `unlock`: gọi từ một lần chạm của người dùng (được phép mở âm thanh). */
export function playEduSound(name, { unlock = false } = {}) {
  if (!enabled()) return;
  try {
    const ac = audio(unlock);
    if (ac) SOUNDS[name]?.(ac);
  } catch { /* âm thanh hỏng thì im lặng, không ảnh hưởng thao tác */ }
}

// Chạm vào đâu kêu gì: nút → pop, mục điều hướng → tick, đáp án → pop.
const TAP = [
  [".edu-tabs a, .edu-nav, .edu-seg button, .edu-footer-langs a", "tick"],
  [".cmap-hex", "node"],
  [".edu-bell", "ding"],
  [".edu-joy", "coin"],
  [".edu-topbar .edu-chip, .edu-pop button, .comm-post footer > *, .comm-back, .comm-media, .cmap-pop button, .edu-switch, .edu-set .edu-btn", "pop"],
  [".edu-btn, .cmap-info, .quiz-option, .edu-quiz-options button, .lesson-player-foot button, .edu-welcome-lang", "pop"],
];

/** Gắn một lần cho cả site Edu; trả hàm gỡ. */
export function installEduTapSounds() {
  const onDown = (event) => {
    const hit = TAP.find(([selector]) => event.target.closest?.(selector));
    if (hit && !event.target.closest("[disabled]")) playEduSound(hit[1], { unlock: true });
  };
  document.addEventListener("pointerdown", onDown, { passive: true });
  return () => document.removeEventListener("pointerdown", onDown);
}
