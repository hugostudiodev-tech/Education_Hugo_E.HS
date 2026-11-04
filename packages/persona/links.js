// Link mạng xã hội trên hồ sơ (tuỳ chọn, công khai). Chỉ nhận https và đúng tên miền từng nền tảng.
export const LINK_HOSTS = {
  facebook: ['facebook.com', 'fb.com'],
  instagram: ['instagram.com'],
  tiktok: ['tiktok.com'],
  github: ['github.com'],
  youtube: ['youtube.com', 'youtu.be'],
};

export function checkLinks(raw) {
  if (!raw || typeof raw !== 'object') return { ok: false, code: 'LINK_BAD' };
  const value = {};
  for (const [key, hosts] of Object.entries(LINK_HOSTS)) {
    const text = String(raw[key] || '').trim();
    if (!text) continue;
    let url;
    try { url = new URL(/^https?:\/\//i.test(text) ? text : `https://${text}`); } catch { return { ok: false, code: 'LINK_BAD' }; }
    const host = url.hostname.toLowerCase().replace(/^(www|m)\./, '');
    if (!hosts.some((h) => host === h || host.endsWith(`.${h}`)) || text.length > 200) return { ok: false, code: 'LINK_BAD' };
    url.protocol = 'https:';
    value[key] = url.toString();
  }
  return { ok: true, value };
}
