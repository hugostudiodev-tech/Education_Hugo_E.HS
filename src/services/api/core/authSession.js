// Phiên người học Education Hugo. Phiên thật là cookie HttpOnly của Better Auth (máy chủ
// riêng, server/lib/auth.js); localStorage chỉ giữ tên + email để vẽ giao diện ngay.
// Ba cách đăng nhập: Google (ID token), tài khoản Hugo Studio (OAuth), passkey.
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
export const isMemberAuthenticated = () => Boolean(getMemberSession());

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

/** Hugo Studio: chuyển sang trang đồng ý của Hugo Studio, quay về `next` với ?signedin=hugo. */
export async function loginMemberWithHugoStudio(next = "/learn") {
  const back = new URL(next, window.location.origin);
  back.searchParams.set("signedin", "hugo");
  try {
    const res = await fetch(`${API_BASE}/auth/sign-in/social`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ provider: "hugo-studio", callbackURL: back.href, errorCallbackURL: `${window.location.origin}/login?error=hugo` }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.url) return { error: data.message || "Chưa mở được trang đăng nhập Hugo Studio." };
    window.location.assign(data.url);
    return { error: null };
  } catch {
    return { error: "network" };
  }
}

/** Sau khi quay về từ Hugo Studio: đọc phiên cookie vừa tạo, ghi vào máy. */
export async function restoreMemberSession() {
  const client = await authClient();
  const user = (await client.getSession()).data?.user;
  return user ? loginMember(user, "hugo-studio") : null;
}

export async function logoutAuth() {
  localStorage.removeItem(KEY);
  await fetch(`${API_BASE}/auth/sign-out`, { method: "POST", credentials: "include", headers: { "Content-Type": "application/json" }, body: "{}" }).catch(() => {});
}
