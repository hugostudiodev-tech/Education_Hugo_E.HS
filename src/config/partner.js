// Cấu hình thư viện đối tác (education-hugo-react). App Education Hugo không đặt gì
// ở đây; thư viện gọi configurePartner() để trỏ API và gắn key do admin cấp.
export const partner = { apiBase: null, key: null, lang: null, assetBase: "" };

/** Ảnh, mascot, wasm của khoá học: trên site đối tác phải lấy từ tên miền Education Hugo. */
export const asset = (path) => (partner.assetBase && typeof path === "string" && path.startsWith("/") ? partner.assetBase + path : path);

export function configurePartner({ apiBase, key, lang, assetBase } = {}) {
  if (assetBase) partner.assetBase = String(assetBase).replace(/\/+$/, "");
  if (apiBase) partner.apiBase = String(apiBase).replace(/\/+$/, "");
  if (key !== undefined) partner.key = key || null;
  if (lang) partner.lang = lang;
}
