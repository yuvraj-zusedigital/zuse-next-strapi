import { cookies } from "next/headers";
import { NextResponse, type NextRequest } from "next/server";
import { env } from "@/lib/env";
import { decrypt, SESSION_COOKIE } from "@/lib/session";

/**
 * Streams a multipart upload to Strapi's /api/cms/media without buffering it.
 * Excluded from proxy.ts (which buffers bodies and cuts them at 10 MB), so it
 * checks the session itself.
 */

const MAX_BYTES = 100 * 1024 * 1024;

export async function POST(request: NextRequest) {
  const session = await decrypt((await cookies()).get(SESSION_COOKIE)?.value);
  if (!session) return NextResponse.json({ error: { message: "Your session ended. Sign in again." } }, { status: 401 });

  const contentType = request.headers.get("content-type") ?? "";
  if (!contentType.startsWith("multipart/form-data")) {
    return NextResponse.json({ error: { message: "Expected a file upload." } }, { status: 400 });
  }
  const length = Number(request.headers.get("content-length") ?? 0);
  if (length > MAX_BYTES) {
    return NextResponse.json({ error: { message: "Files can be up to 100 MB." } }, { status: 413 });
  }

  const upstream = await fetch(`${env.strapiUrl}/api/cms/media`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${session.token}`,
      "Content-Type": contentType,
      ...(length ? { "Content-Length": String(length) } : {}),
    },
    body: request.body,
    // Required by Node's fetch to send a streamed body.
    duplex: "half",
  } as RequestInit & { duplex: "half" });

  const body = await upstream.json().catch(() => ({ error: { message: `Upload failed (${upstream.status})` } }));
  return NextResponse.json(body, { status: upstream.status });
}
