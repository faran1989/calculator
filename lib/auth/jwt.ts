import { SignJWT, jwtVerify } from "jose";

export const AUTH_COOKIE_NAME = "takhmino_auth";

export type AuthTokenPayload = {
  userId: string;
  email: string;
};

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) throw new Error("SESSION_SECRET environment variable is not set.");
  return new TextEncoder().encode(secret);
}

export async function signAuthToken(payload: AuthTokenPayload) {
  const key = getSecretKey();

  // 7 روز اعتبار (قابل تغییر)
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function verifyAuthToken(token: string) {
  try {
    const key = getSecretKey();
    const { payload } = await jwtVerify(token, key);
    // payload 타입 کلیه؛ ما فقط همین فیلدها رو می‌خوایم
    if (!payload?.userId || !payload?.email) return null;

    return {
      userId: String(payload.userId),
      email: String(payload.email),
    } as AuthTokenPayload;
  } catch {
    return null;
  }
}
