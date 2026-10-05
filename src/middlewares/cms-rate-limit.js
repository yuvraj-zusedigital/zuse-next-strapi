'use strict';

const { errors } = require('@strapi/utils');
const { trustedClientIp } = require('../api/cms/utils/client-ip');

/**
 * Rate limit for Zuse CMS routes: logins, and actions that cost money or
 * storage (AI summary, text-to-speech, uploads).
 *
 * Route config: { name: 'global::cms-rate-limit', config: { bucket, max, windowMs, keyBy } }
 *   keyBy: 'user' (signed-in user, else visitor IP) · 'ip' (visitor IP) ·
 *          'identifier' (the login email/username in the body)
 *
 * In-memory: limits are per Strapi process. That's fine for the single
 * instance we run; with several instances, move this to Redis.
 */

const hits = new Map(); // `${bucket}:${who}` → timestamps (ms)

const keyFor = (ctx, keyBy) => {
  if (keyBy === 'identifier') {
    const identifier = ctx.request.body && ctx.request.body.identifier;
    return `id:${String(identifier || '').trim().toLowerCase()}`;
  }
  if (keyBy === 'user' && ctx.state.user) return `user:${ctx.state.user.id}`;
  return `ip:${trustedClientIp(ctx)}`;
};

module.exports = (config) => {
  const { bucket = 'default', max = 30, windowMs = 60 * 60 * 1000, keyBy = 'user' } = config || {};

  return async (ctx, next) => {
    const key = `${bucket}:${keyFor(ctx, keyBy)}`;
    const now = Date.now();
    const recent = (hits.get(key) || []).filter((time) => now - time < windowMs);

    if (recent.length >= max) {
      const waitMs = windowMs - (now - recent[0]);
      const minutes = Math.ceil(waitMs / 60000);
      ctx.set('Retry-After', String(Math.ceil(waitMs / 1000)));
      throw new errors.RateLimitError(`Too many requests. Try again in about ${minutes} minute${minutes === 1 ? '' : 's'}.`);
    }

    recent.push(now);
    hits.set(key, recent);
    await next();
  };
};
