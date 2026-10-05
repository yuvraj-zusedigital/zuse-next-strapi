import "server-only";

import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

/**
 * Data access layer: the real auth check. proxy.ts only redirects visitors
 * without a cookie; every page and action goes through verifySession().
 */
export const verifySession = cache(async () => {
  const session = await decrypt((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) redirect("/session-expired");
  return session;
});
