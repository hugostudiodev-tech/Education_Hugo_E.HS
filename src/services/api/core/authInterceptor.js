// Bọc fetch() một lần cho mọi lời gọi /api: luôn gửi cookie phiên (HttpOnly, cùng origin),
// ghi tình trạng máy chủ cho ServerStatusBanner, và phiên chết (401 ở /api/me) thì về
// trạng thái khách. Thư viện đối tác gọi API tuyệt đối bằng key nên không đi qua nhánh này.
import { clearMemberSession } from "./authSession";
import { noteServer } from "../../../lib/serverHealth";

const isApi = (url) => {
  try {
    const parsed = new URL(url, window.location.origin);
    return parsed.origin === window.location.origin && parsed.pathname.startsWith("/api/");
  } catch {
    return false;
  }
};

export function installApiAuthInterceptor() {
  if (window.__eduFetch) return;
  const original = window.fetch.bind(window);
  window.__eduFetch = true;
  window.fetch = async (input, init = {}) => {
    const url = typeof input === "string" ? input : input?.url || "";
    if (!isApi(url)) return original(input, init);
    try {
      const res = await original(input, { credentials: "include", ...init });
      noteServer(![502, 503, 504].includes(res.status), res.status);
      if (res.status === 401 && new URL(url, window.location.origin).pathname === "/api/me") clearMemberSession();
      return res;
    } catch (error) {
      noteServer(false, 0);
      throw error;
    }
  };
}
