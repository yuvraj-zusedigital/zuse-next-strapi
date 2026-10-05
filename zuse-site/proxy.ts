import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { IS_INDEXABLE } from "@/lib/config/site";

/**
 * Proxy (Next.js 16's renamed Middleware).
 *
 * Keeps non-production deployments (staging, preview, local) out of search
 * engines — with no effect on the production site:
 *
 *  1. Sends `X-Robots-Tag: noindex, nofollow` on every response off-production.
 *     This is an HTTP-level directive Google treats as authoritative, and it
 *     covers non-HTML responses too. On production (origin === zusedigital.com)
 *     nothing is added.
 *  2. Optional HTTP Basic Auth: if SITE_ACCESS_USER and SITE_ACCESS_PASS are set
 *     (recommended for staging), every request off-production must authenticate.
 *     Crawlers receive 401 and can index nothing at all — the strongest guard.
 *
 * On production this proxy is effectively a no-op.
 */
const BASIC_AUTH_USER = process.env.SITE_ACCESS_USER;
const BASIC_AUTH_PASS = process.env.SITE_ACCESS_PASS;
const BASIC_AUTH_ENABLED =
  !IS_INDEXABLE && Boolean(BASIC_AUTH_USER) && Boolean(BASIC_AUTH_PASS);

function unauthorized(): NextResponse {
  return new NextResponse("Authentication required.", {
    status: 401,
    headers: {
      "WWW-Authenticate": 'Basic realm="Restricted", charset="UTF-8"',
      "X-Robots-Tag": "noindex, nofollow",
    },
  });
}

export function proxy(request: NextRequest): NextResponse {
  // Strapi's cache refresh has its own secret (app/api/revalidate).
  if (BASIC_AUTH_ENABLED && request.nextUrl.pathname !== "/api/revalidate") {
    const header = request.headers.get("authorization");
    if (!header?.startsWith("Basic ")) return unauthorized();
    let user = "";
    let pass = "";
    try {
      [user = "", pass = ""] = atob(header.slice(6)).split(":");
    } catch {
      return unauthorized();
    }
    if (user !== BASIC_AUTH_USER || pass !== BASIC_AUTH_PASS) {
      return unauthorized();
    }
  }

  const response = NextResponse.next();
  if (!IS_INDEXABLE) {
    response.headers.set("X-Robots-Tag", "noindex, nofollow");
  }
  return response;
}

export const config = {
  // Run on everything except Next's internal assets and the favicon.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|icon.png|apple-icon.png).*)"],
};
