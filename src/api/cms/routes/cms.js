'use strict';

/**
 * Zuse CMS API — the only backend surface the Next.js admin (./zuse-cms) uses.
 *
 * Auth: users-permissions JWT. The CMS roles (Editor < Admin < Super Admin,
 * src/api/cms/utils/roles.js) are granted these actions at bootstrap
 * (src/api/cms/services/setup.js); the `global::cms-role` policy sets the
 * lowest role each route needs and rejects everything else, including API
 * tokens. Finer rules (site-settings types, whom an Admin may manage) are in
 * the controller.
 *
 * Single types use the routes without :documentId.
 */

const role = (min) => ({ policies: [{ name: 'global::cms-role', config: { min } }] });
const config = role('editor');
const admin = role('admin');

/** Same, plus a per-user limit for actions that cost money or storage (src/middlewares/cms-rate-limit.js). */
const limited = (bucket, max, windowMs) => ({
  ...config,
  middlewares: [{ name: 'global::cms-rate-limit', config: { bucket, max, windowMs } }],
});
const HOUR = 60 * 60 * 1000;

const MINUTE = 60 * 1000;

module.exports = {
  routes: [
    {
      method: 'POST',
      path: '/cms/login',
      handler: 'cms.login',
      config: {
        auth: false,
        middlewares: [
          // Per visitor (brute force from one place) and per account (spread-out guessing).
          { name: 'global::cms-rate-limit', config: { bucket: 'login-ip', keyBy: 'ip', max: 20, windowMs: 15 * MINUTE } },
          { name: 'global::cms-rate-limit', config: { bucket: 'login-account', keyBy: 'identifier', max: 10, windowMs: 15 * MINUTE } },
        ],
      },
    },
    { method: 'GET', path: '/cms/me', handler: 'cms.me', config },
    { method: 'PUT', path: '/cms/me', handler: 'cms.updateMe', config },
    { method: 'GET', path: '/cms/schema', handler: 'cms.schema', config },
    { method: 'GET', path: '/cms/dashboard', handler: 'cms.dashboard', config },
    // Header & footer for page previews (read-only, every CMS role).
    { method: 'GET', path: '/cms/site-chrome', handler: 'cms.siteChrome', config },
    // The full log needs Admin; editors may read one entry's history (?documentId=).
    { method: 'GET', path: '/cms/activity', handler: 'cms.activity', config },

    { method: 'GET', path: '/cms/users', handler: 'cms.usersFind', config: admin },
    { method: 'POST', path: '/cms/users', handler: 'cms.usersCreate', config: admin },
    { method: 'PUT', path: '/cms/users/:id', handler: 'cms.usersUpdate', config: admin },

    { method: 'GET', path: '/cms/blogs/:documentId/tools', handler: 'cms.blogTools', config },
    // provider: openai | elevenlabs
    { method: 'POST', path: '/cms/blogs/:documentId/audio/:provider', handler: 'cms.blogGenerateAudio', config: limited('tts', 10, HOUR) },
    { method: 'POST', path: '/cms/blogs/:documentId/summary', handler: 'cms.blogGenerateSummary', config: limited('summary', 30, HOUR) },

    { method: 'GET', path: '/cms/media', handler: 'cms.mediaFind', config },
    { method: 'POST', path: '/cms/media', handler: 'cms.mediaUpload', config: limited('upload', 200, HOUR) },
    { method: 'GET', path: '/cms/media/:id', handler: 'cms.mediaFindOne', config },
    { method: 'PUT', path: '/cms/media/:id', handler: 'cms.mediaUpdate', config },
    { method: 'DELETE', path: '/cms/media/:id', handler: 'cms.mediaDelete', config: admin },

    // Core Web Vitals from visitors' browsers: public, limited per visitor IP.
    {
      method: 'POST',
      path: '/cms/vitals',
      handler: 'cms.vitalsRecord',
      config: { auth: false, middlewares: [{ name: 'global::cms-rate-limit', config: { bucket: 'vitals', keyBy: 'ip', max: 120, windowMs: 10 * MINUTE } }] },
    },
    { method: 'GET', path: '/cms/vitals', handler: 'cms.vitalsPage', config },
    { method: 'GET', path: '/cms/vitals/overview', handler: 'cms.vitalsOverview', config },

    // AI page drafts: each call costs money, so a per-user limit.
    { method: 'GET', path: '/cms/ai/status', handler: 'cms.aiStatus', config },
    { method: 'POST', path: '/cms/ai/page-draft', handler: 'cms.aiPageDraft', config: limited('page-draft', 20, HOUR) },

    // Leads (personal data): Admins only. kind: submissions | subscribers | tracking
    { method: 'GET', path: '/cms/leads/:kind', handler: 'cms.leadsFind', config: admin },
    { method: 'GET', path: '/cms/leads/:kind/:id', handler: 'cms.leadsFindOne', config: admin },
    { method: 'DELETE', path: '/cms/leads/:kind/:id', handler: 'cms.leadsDelete', config: admin },

    { method: 'GET', path: '/cms/types/:type', handler: 'cms.find', config },
    { method: 'POST', path: '/cms/types/:type', handler: 'cms.create', config },
    { method: 'GET', path: '/cms/types/:type/single', handler: 'cms.findOne', config },
    { method: 'PUT', path: '/cms/types/:type/single', handler: 'cms.update', config },
    { method: 'POST', path: '/cms/types/:type/single/:action', handler: 'cms.transition', config },

    { method: 'GET', path: '/cms/types/:type/:documentId', handler: 'cms.findOne', config },
    { method: 'PUT', path: '/cms/types/:type/:documentId', handler: 'cms.update', config },
    { method: 'DELETE', path: '/cms/types/:type/:documentId', handler: 'cms.delete', config: admin },
    // action: publish | unpublish | discard
    { method: 'POST', path: '/cms/types/:type/:documentId/:action', handler: 'cms.transition', config },
  ],
};
