import "server-only";

import { headers } from "next/headers";

/** The visitor's IP. Behind a proxy/load balancer the first x-forwarded-for entry is the visitor. */
export async function clientIp() {
  const list = await headers();
  return list.get("x-forwarded-for")?.split(",")[0]?.trim() || list.get("x-real-ip") || "";
}

/**
 * Headers that let Strapi rate-limit by the visitor rather than by this
 * server (see src/api/cms/utils/client-ip.js in the Strapi repo). Sent only
 * when CMS_PROXY_SECRET is configured.
 */
export async function forwardedClientHeaders(): Promise<Record<string, string>> {
  const secret = process.env.CMS_PROXY_SECRET;
  const ip = await clientIp();
  return secret && ip ? { "x-cms-proxy-secret": secret, "x-cms-client-ip": ip } : {};
}
