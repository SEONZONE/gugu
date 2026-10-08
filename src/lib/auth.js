import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "node:crypto";

const SESSION_COOKIE = "gugu_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30일

function digest(value) {
  return createHmac("sha256", "gugu").update(value).digest();
}

// 쿠키에는 비밀번호에서 파생한 토큰만 저장한다. 비밀번호를 바꾸면 기존 세션은 모두 풀린다.
function sessionToken() {
  const password = process.env.GUGU_PASSWORD;
  if (!password) return null;
  return createHmac("sha256", password).update("gugu-session-v1").digest("hex");
}

function safeEqual(a, b) {
  return timingSafeEqual(digest(a), digest(b));
}

export function isPasswordConfigured() {
  return Boolean(process.env.GUGU_PASSWORD);
}

export function checkPassword(input) {
  const password = process.env.GUGU_PASSWORD;
  if (!password || !input) return false;
  return safeEqual(input, password);
}

export async function isUnlocked() {
  // 쿠키를 먼저 읽어야 이 함수를 쓰는 화면이 빌드 때 정적으로 굳지 않고 요청마다 렌더링된다.
  const value = (await cookies()).get(SESSION_COOKIE)?.value;
  const token = sessionToken();
  return Boolean(value && token) && safeEqual(value, token);
}

export async function startSession() {
  (await cookies()).set(SESSION_COOKIE, sessionToken(), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE,
  });
}

export async function endSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
