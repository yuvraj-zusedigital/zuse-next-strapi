'use strict';

const crypto = require('crypto');

/**
 * The visitor's IP for requests made by the Zuse CMS server.
 *
 * All CMS traffic reaches Strapi from the CMS server, so ctx.request.ip is
 * that server for every editor. The CMS forwards the visitor's IP in
 * `x-cms-client-ip`, signed by the shared `CMS_PROXY_SECRET` in
 * `x-cms-proxy-secret`. Without a matching secret the header is ignored, so
 * it can't be spoofed by calling Strapi directly.
 */
function trustedClientIp(ctx) {
  const secret = process.env.CMS_PROXY_SECRET;
  const given = ctx.get('x-cms-proxy-secret');
  const forwarded = ctx.get('x-cms-client-ip');

  if (secret && given && forwarded) {
    const a = Buffer.from(secret);
    const b = Buffer.from(given);
    if (a.length === b.length && crypto.timingSafeEqual(a, b)) return forwarded.slice(0, 64);
  }
  return ctx.request.ip;
}

module.exports = { trustedClientIp };
