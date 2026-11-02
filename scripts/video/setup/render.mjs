// Dựng video "Khởi đầu" của Education Hugo bằng code: Chrome vẽ scene.html, chụp từng khung
// (30 fps), ffmpeg ghép thành MP4 1280×720. Hai video × ba ngôn ngữ:
//   vscode — khoá Coding: cài Visual Studio Code    sql — khoá SQL: công cụ dùng trong khoá
//
//   node scripts/video/setup/render.mjs                    # cả hai video, vi/en/zh
//   node scripts/video/setup/render.mjs vscode vi          # một video, một ngôn ngữ
//   node scripts/video/setup/render.mjs --script vscode    # in lời thoại có thẻ biểu cảm cho ElevenLabs
//
// Lồng tiếng (ElevenLabs v3+): dán NGUYÊN đoạn của `--script` (đã có thẻ biểu cảm [warmly]…),
// xuất MỘT tệp, đặt tên voice/<video>-<lang>.mp3 (vd. voice/vscode-vi.mp3). Script tự cắt tệp
// thành từng cảnh: chỗ cắt dự kiến theo tỉ lệ số chữ mỗi cảnh, bám vào khoảng lặng gần nhất
// (giữa hai cảnh có "…" nên giọng ngừng lâu hơn). Cắt lệch thì ghi mốc tay vào copy.json →
// voiceCuts["<video>-<lang>"] = [giây, …] (số cảnh − 1 mốc). Chưa có tệp giọng → video không tiếng.
// Có giọng thì góc video tự ghi công "Giọng đọc: ElevenLabs" (gói Free bắt buộc).
//
// Cần: Google Chrome đã cài, ffmpeg trong PATH. Ra: public/edu/video/setup-<video>-<lang>.mp4 + .jpg
import fs from "node:fs";
import path from "node:path";
import { spawn, spawnSync, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, "../../..");
const EDU = path.join(ROOT, "public/edu");
const OUT = path.join(EDU, "video");
const FPS = 30;
const COPY = JSON.parse(fs.readFileSync(path.join(HERE, "copy.json"), "utf8"));
const VIDEOS = ["vscode", "sql"];
const LANGS = ["vi", "en", "zh"];

// Thẻ biểu cảm ElevenLabs v3 cho từng cảnh (theo id cảnh) — chỉ thêm vào lời đọc, không vào phụ đề.
const TONE = {
  intro: "[cheerfully]", site: "[calm]", pick: "[friendly]", win: "[clearly, step by step]", mac: "[clearly, step by step]",
  folder: "[helpful]", file: "[encouraging]", done: "[excited]",
  editor: "[enthusiastic]", data: "[warmly]", mistake: "[reassuring]", path: "[motivating]",
};
const SCENE_GAP = " … ";
const scriptOf = (video, lang) => COPY[video][lang].scenes.map((s) => `${TONE[s.id] || ""} ${s.say}`.trim()).join(SCENE_GAP);

const args = process.argv.slice(2);
if (args[0] === "--script") {
  for (const video of args[1] ? [args[1]] : VIDEOS) for (const lang of LANGS) console.log(`── ${video}-${lang} → voice/${video}-${lang}.mp3 ──\n${scriptOf(video, lang)}\n`);
  process.exit(0);
}
const videos = args.filter((a) => VIDEOS.includes(a));
const langs = args.filter((a) => LANGS.includes(a));

const seconds = (file) => Number(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file]).toString().trim());

/** Cắt tệp giọng chung thành từng cảnh → [[bắt đầu, kết thúc], …] giây, đã bỏ lặng hai đầu. */
function splitScenes(file, scenes, manual) {
  const total = seconds(file);
  const log = spawnSync("ffmpeg", ["-hide_banner", "-i", file, "-af", "silencedetect=noise=-38dB:d=0.3", "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const silences = [...log.matchAll(/silence_start: ([\d.]+)[\s\S]*?silence_end: ([\d.]+)/g)].map(([, a, b]) => [Number(a), Number(b)]);
  const head = silences[0]?.[0] < 0.05 ? silences[0][1] : 0;
  const tail = silences.at(-1)?.[1] > total - 0.05 ? silences.at(-1)[0] : total;
  const mid = ([a, b]) => (a + b) / 2;
  const cuts = [];
  if (manual?.length === scenes.length - 1) {
    for (const at of manual) {
      const near = [...silences].sort((x, y) => Math.abs(mid(x) - at) - Math.abs(mid(y) - at))[0];
      cuts.push(near && Math.abs(mid(near) - at) < 0.8 ? near : [at, at]);
    }
  } else {
    const lengths = scenes.map((s) => [...s.say].length);
    const sum = lengths.reduce((a, b) => a + b, 0);
    let used = 0;
    for (let i = 0; i < scenes.length - 1; i++) {
      used += lengths[i];
      const expected = head + (tail - head) * (used / sum);
      // Ưu tiên khoảng lặng gần chỗ dự kiến VÀ dài (dấu "…" giữa cảnh tạo khoảng ngừng dài nhất).
      const inner = silences.filter(([a, b]) => a > head + 0.1 && b < tail - 0.1 && !cuts.some((c) => c[0] === a));
      const score = (x) => Math.abs(mid(x) - expected) - (x[1] - x[0]) * 3;
      const best = inner.sort((x, y) => score(x) - score(y))[0];
      if (!best) throw new Error(`${file}: không thấy khoảng lặng giữa cảnh ${i + 1} và ${i + 2} — ghi mốc tay vào copy.json voiceCuts.`);
      cuts.push(best);
    }
    cuts.sort((a, b) => a[0] - b[0]);
  }
  return scenes.map((_, i) => [i ? cuts[i - 1][1] : head, i < cuts.length ? cuts[i][0] : tail]);
}

const FILES = { "/scene.html": path.join(HERE, "scene.html"), "/gsap.min.js": path.join(ROOT, "node_modules/gsap/dist/gsap.min.js") };
const TYPES = { ".html": "text/html", ".js": "text/javascript", ".svg": "image/svg+xml", ".png": "image/png" };

fs.mkdirSync(OUT, { recursive: true });
const browser = await chromium.launch({ channel: "chrome" });

for (const video of videos.length ? videos : VIDEOS) {
  for (const lang of langs.length ? langs : LANGS) {
    const name = `${video}-${lang}`;
    const scenes = COPY[video][lang].scenes;
    const voice = ["mp3", "wav", "m4a"].map((ext) => path.join(HERE, "voice", `${name}.${ext}`)).find((f) => fs.existsSync(f));
    const segments = voice ? splitScenes(voice, scenes, COPY.voiceCuts?.[name]) : null;
    // Cảnh dài bằng đoạn lời của nó + 0,6 giây thở (scene.html giữ thời lượng mặc định nếu lời ngắn hơn).
    const durations = segments ? segments.map(([from, to]) => to - from + 0.6) : [];

    const page = await browser.newPage({ viewport: { width: 1280, height: 720 } });
    await page.route("http://video.local/**", (route) => {
      const p = new URL(route.request().url()).pathname;
      const file = FILES[p] || path.join(EDU, path.basename(p));
      route.fulfill({ path: file, contentType: TYPES[path.extname(file)] || "application/octet-stream" });
    });
    await page.addInitScript(`window.VIDEO_COPY = ${JSON.stringify(COPY)};`);
    await page.goto("http://video.local/scene.html", { waitUntil: "networkidle" });
    await page.evaluate(() => window.ready());
    const total = await page.evaluate(([v, l, d, voiced]) => window.build(v, l, d, voiced), [video, lang, durations, Boolean(voice)]);
    const frames = Math.ceil(total * FPS);
    const sceneStarts = await page.evaluate(() => window.sceneStarts);

    const out = path.join(OUT, `setup-${name}.mp4`);
    const ff = ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-i", "-"];
    if (segments) {
      ff.push("-i", voice);
      const parts = segments.map(([from, to], i) => {
        const ms = Math.round((sceneStarts[i] + 0.2) * 1000);
        return `[1:a]atrim=start=${from.toFixed(3)}:end=${to.toFixed(3)},asetpts=PTS-STARTPTS,adelay=${ms}|${ms}[a${i}]`;
      });
      ff.push("-filter_complex", `${parts.join(";")};${segments.map((_, i) => `[a${i}]`).join("")}amix=inputs=${segments.length}:normalize=0[a]`, "-map", "0:v", "-map", "[a]", "-c:a", "aac", "-b:a", "96k");
    }
    ff.push("-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "28", "-preset", "slow", "-movflags", "+faststart", "-t", total.toFixed(2), out);
    const ffmpeg = spawn("ffmpeg", ff, { stdio: ["pipe", "ignore", "inherit"] });
    const done = new Promise((resolve, reject) => ffmpeg.on("close", (code) => (code ? reject(new Error(`ffmpeg ${code}`)) : resolve())));

    for (let f = 0; f < frames; f++) {
      await page.evaluate((t) => window.seek(t), f / FPS);
      const shot = await page.screenshot({ type: "jpeg", quality: 88 });
      if (!ffmpeg.stdin.write(shot)) await new Promise((r) => ffmpeg.stdin.once("drain", r));
      if (f === Math.round(2.5 * FPS)) fs.writeFileSync(path.join(OUT, `setup-${name}.jpg`), shot); // ảnh bìa
      if (f % 150 === 0) process.stdout.write(`\r${name}: ${f}/${frames}`);
    }
    ffmpeg.stdin.end();
    await done;
    await page.close();
    console.log(`\r${name}: ${(fs.statSync(out).size / 1e6).toFixed(2)} MB, ${total.toFixed(1)} s${segments ? `, giọng: ${segments.map(([a, b]) => `${a.toFixed(1)}–${b.toFixed(1)}`).join(" | ")}` : ", chưa lồng tiếng"} → ${path.relative(ROOT, out)}`);
  }
}
await browser.close();
