// lib/auth/session.ts
import { cookies } from "next/headers";
import { getIronSession } from "iron-session";
import type { IronSession, SessionOptions } from "iron-session";

/**
 * IMPORTANT:
 * - Primary auth is JWT cookie: "takhmino_auth".
 * - This session helper is optional/legacy but MUST NOT break build.
 * - Next.js 16 types cookies() as Promise in some setups; we await it.
 */

export type AnySession = Record<string, unknown>;

/**
 * Must NOT collide with JWT cookie.
 */
export const SESSION_COOKIE_NAME = "takhmino_session";

function mustGetSessionPassword(): string {
  const pw =
    process.env.TAKHMINO_SESSION_PASSWORD ||
    process.env.IRON_SESSION_PASSWORD ||
    "";

  if (!pw || pw.length < 32) {
    throw new Error(
      "Session password is missing/too short. Set TAKHMINO_SESSION_PASSWORD (>= 32 chars) " +
        "or IRON_SESSION_PASSWORD. Note: This app primarily uses JWT auth; sessions are optional."
    );
  }
  return pw;
}

export const sessionOptions: SessionOptions = {
  cookieName: SESSION_COOKIE_NAME,
  password: mustGetSessionPassword(),
  cookieOptions: {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
  },
};

/**
 * App Router / Server-side usage: await cookies() + getIronSession(...)
 */
export async function getSession<T extends AnySession = AnySession>(): Promise<IronSession<T>> {
  const cookieStore = await cookies();
  // Some versions expect CookieStore sync type; runtime object is compatible.
  return getIronSession<T>(cookieStore as any, sessionOptions);
}