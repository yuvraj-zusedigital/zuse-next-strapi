import "server-only";

import { EncryptJWT, jwtDecrypt } from "jose";
import { cookies } from "next/headers";
import { env } from "@/lib/env";

/**
 * The session is an encrypted cookie holding the editor's Strapi JWT. It is
 * httpOnly, so the Strapi token never reaches client-side JavaScript.
 */

export const SESSION_COOKIE = "zuse_cms_session";
const MAX_AGE_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: number;
  email: string;
  username: string;
  role: { name: string; type: string };
  accent?: string | null;
};

export type Session = { token: string; user: SessionUser };

function key() {
  const bytes = Buffer.from(env.sessionSecret, "base64");
  if (bytes.length !== 32) throw new Error("SESSION_SECRET must be 32 bytes, base64 encoded");
  return bytes;
}

export async function encrypt(session: Session) {
  return new EncryptJWT({ ...session })
    .setProtectedHeader({ alg: "dir", enc: "A256GCM" })
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE_SECONDS}s`)
    .encrypt(key());
}

export async function decrypt(value: string | undefined): Promise<Session | null> {
  if (!value) return null;
  try {
    const { payload } = await jwtDecrypt(value, key());
    return { token: payload.token as string, user: payload.user as SessionUser };
  } catch {
    return null;
  }
}

export async function createSession(session: Session) {
  (await cookies()).set(SESSION_COOKIE, await encrypt(session), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function deleteSession() {
  (await cookies()).delete(SESSION_COOKIE);
}
