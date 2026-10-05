"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { ACCENT_COOKIE, ACCENT_COOKIE_MAX_AGE, isAccent } from "@/lib/accents";
import { forwardedClientHeaders } from "@/lib/client-ip";
import { env } from "@/lib/env";
import { createSession, deleteSession, type SessionUser } from "@/lib/session";

export type LoginState = { error?: string; email?: string } | undefined;

/** Only same-app paths, so ?next= can't redirect off-site. */
function safeNext(value: FormDataEntryValue | null) {
  const next = typeof value === "string" ? value : "";
  return next.startsWith("/") && !next.startsWith("//") && !next.startsWith("/\\") ? next : "/";
}

export async function login(_state: LoginState, formData: FormData): Promise<LoginState> {
  const email = String(formData.get("email") || "").trim();
  const password = String(formData.get("password") || "");
  if (!email || !password) return { error: "Enter your email and password.", email };

  let token: string;
  let user: SessionUser;
  try {
    // The CMS login endpoint checks for a CMS role and rate-limits per visitor
    // (Strapi's /api/auth/local would count every editor as this one server).
    const response = await fetch(`${env.strapiUrl}/api/cms/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json", ...(await forwardedClientHeaders()) },
      body: JSON.stringify({ identifier: email, password }),
      cache: "no-store",
    });
    const body = await response.json().catch(() => null);
    if (response.status === 429) return { error: body?.error?.message ?? "Too many attempts. Try again later.", email };
    if (response.status === 403) return { error: "This account doesn't have access to the CMS.", email };
    if (response.status === 400) return { error: "Incorrect email or password.", email };
    if (!response.ok) throw new Error(`/api/cms/login responded ${response.status}`);
    ({ jwt: token, user } = body);
  } catch (error) {
    console.error("[login]", error);
    return { error: "Can't reach the content server. Try again shortly.", email };
  }

  await createSession({ token, user });
  // The colour theme saved on the account, for the first page after sign-in.
  if (isAccent(user.accent)) {
    (await cookies()).set(ACCENT_COOKIE, user.accent, { path: "/", maxAge: ACCENT_COOKIE_MAX_AGE, sameSite: "lax" });
  }
  redirect(safeNext(formData.get("next")));
}

export async function logout() {
  await deleteSession();
  redirect("/login");
}
