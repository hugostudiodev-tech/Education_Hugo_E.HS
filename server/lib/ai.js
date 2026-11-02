// Dịch bài cộng đồng bằng Gemini (gói miễn phí). Trần lượt/ngày giữ trong RAM: hết lượt
// thì trả null và client hiện bản gốc — không bao giờ phát sinh phí.
const DAILY_CAP = Number(process.env.AI_DAILY_CAP || 300);
const MODEL = process.env.GEMINI_MODEL || 'gemini-2.5-flash-lite';
let day = '';
let used = 0;

export async function translate(text, language) {
  const key = process.env.GEMINI_API_KEY;
  if (!key || !text) return null;
  const today = new Date().toISOString().slice(0, 10);
  if (today !== day) { day = today; used = 0; }
  if (used >= DAILY_CAP) return null;
  used += 1;
  // Liên kết và đoạn mã che thành [[N]] trước khi dịch rồi trả lại nguyên vẹn.
  const tokens = [];
  const masked = String(text).slice(0, 5000).replace(/```[\s\S]*?```|`[^`\n]+`|https?:\/\/[^\s<>"')\]]+/g, (m) => `[[${tokens.push(m) - 1}]]`);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Translate this community post into ${language}. Keep the tone, line breaks and emoji. Copy every [[N]] marker exactly. Reply with the translation only.\n\n${masked}` }] }],
        generationConfig: { temperature: 0.2 },
      }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) return null;
    const out = (await res.json())?.candidates?.[0]?.content?.parts?.map((p) => p.text).join('') || '';
    return out.trim().replace(/\[\[(\d+)\]\]/g, (m, i) => tokens[Number(i)] ?? m) || null;
  } catch {
    return null;
  }
}
