import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/session";

const PUBLIC_PATHS = ["/login", "/session-expired"];

/**
 * Optimistic check only: no cookie → login page. The session itself is
 * verified in lib/dal.ts on every page and action.
 */
export default function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  if (PUBLIC_PATHS.includes(pathname) || request.cookies.has(SESSION_COOKIE)) {
    return NextResponse.next();
  }

  const login = new URL("/login", request.url);
  if (pathname !== "/") login.searchParams.set("next", pathname + search);
  return NextResponse.redirect(login);
}

export const config = {
  // api/media/upload streams large bodies (proxy would buffer and truncate them
  // at 10 MB) and checks the session itself.
  // Static files in public/ (e.g. the login logo) are open.
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|api/media/upload|.*\\.(?:png|svg|jpg|webp|ico)$).*)"],
};
