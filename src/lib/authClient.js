import { createAuthClient } from "better-auth/client";
import { passkeyClient } from "@better-auth/passkey/client";
import { API_BASE } from "../config/apiBase";

// Client Better Auth của Education Hugo (server/lib/auth.js). Nạp bằng import động — trang chủ không cần nó.
const api = new URL(API_BASE, window.location.origin);
export const memberAuthClient = createAuthClient({
  baseURL: api.origin,
  basePath: `${api.pathname.replace(/\/$/, "")}/auth`,
  fetchOptions: { credentials: "include" },
  plugins: [passkeyClient()],
});
