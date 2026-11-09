// Phiên người học Education Hugo. Phiên thật là cookie HttpOnly của Better Auth (máy chủ
// riêng, server/lib/auth.js); localStorage chỉ giữ tên + email để vẽ giao diện ngay.
// Cách đăng nhập: Google (ID token), passkey, và OAuth chuyển trang (Discord, Facebook, Hugo Studio).
import { API_BASE } from "../../../config/apiBase";

const KEY = "price-doc-member-session";
const DAYS = 30;

export function getMemberSession() {
  try {
    const session = JSON.parse(localStorage.getItem(KEY) || "null");
    if (session?.expiresAt && Date.now() > new Date(session.expiresAt).getTime()) { localStorage.removeItem(KEY); return null; }
    return session;
  } catch {
    return null;
  }
}

export function clearMemberSession() {
  localStorage.removeItem(KEY);
  window.dispatchEvent(new CustomEvent("hugo:member-session-expired"));
}

// Web cùng origin dùng cookie HttpOnly — không có token nào trong JavaScript.
export const getMemberToken = () => null;

export function loginMember(user, provider) {
  const session = {
    role: "member",
    email: user.email,
    displayName: user.name || user.email,
    avatarUrl: user.image || "",
    provider,
    loginAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + DAYS * 86_400_000).toISOString(),
  };
  localStorage.setItem(KEY, JSON.stringify(session));
  return session;
}

const authClient = () => import("../../../lib/authClient").then((m) => m.memberAuthClient);
const failText = (error, fallback) => error?.message || error?.statusText || fallback;

/** Google: máy chủ tự xác minh ID token với Google, không tin dữ liệu giải mã ở client. */
export async function loginMemberWithGoogle(credential) {
  try {
    const res = await fetch(`${API_BASE}/auth/sign-in/social`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "google", idToken: { token: credential } }),
      signal: AbortSignal.timeout(30_000),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.user) return { session: null, error: data.message || "invalid_credential" };
    return { session: loginMember(data.user, "google"), error: null };
  } catch {
    return { session: null, error: "network" };
  }
}

export async function loginMemberWithPasskey() {
  const client = await authClient();
  const { data, error } = await client.signIn.passkey();
  const user = data?.user || (await client.getSession()).data?.user;
  if (error || !user) return { session: null, error: failText(error, "Không đăng nhập được bằng passkey.") };
  return { session: loginMember(user, "passkey"), error: null };
}

/** OAuth chuyển trang (discord, facebook, hugo-studio): sang trang đồng ý của nhà cung cấp, quay về `next` với ?signedin=<provider>. */
export async function loginMemberWithRedirect(provider, next = "/learn") {
  const back = new URL(next, window.location.origin);
  back.searchParams.set("signedin", provider);
  try {
    const res = await fetch(`${API_BASE}/auth/sign-in/social`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider, callbackURL: back.href, errorCallbackURL: `${window.location.origin}/login?error=${provider}` }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) return { error: data.message || "Chưa mở được trang đăng nhập." };
    window.location.assign(data.url);
    return { error: null };
  } catch {
    return { error: "network" };
  }
}

/** Sau khi quay về từ trang đồng ý: đọc phiên cookie vừa tạo, ghi vào máy. */
export async function restoreMemberSession(provider = "hugo-studio") {
  const client = await authClient();
  const user = (await client.getSession()).data?.user;
  return user ? loginMember(user, provider) : null;
}

export async function logoutAuth() {
  localStorage.removeItem(KEY);
  await fetch(`${API_BASE}/auth/sign-out`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
}
