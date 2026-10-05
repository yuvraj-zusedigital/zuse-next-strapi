'use strict';

/**
 * Tells the Next.js site to drop its cached Strapi data when content changes,
 * so published edits show on the next page load (zuse-site app/api/revalidate).
 * Registered as a document-service middleware, so it covers the Zuse CMS, the
 * Strapi admin and scripts alike.
 *
 * Env: SITE_REVALIDATE_URL (comma-separated for several sites, e.g.
 * https://staging.zusedigital.com/api/revalidate) and SITE_REVALIDATE_SECRET.
 * Without them it does nothing (local development doesn't cache).
 */

// Actions that change what the live site shows. Plain draft saves don't.
const ACTIONS = new Set(['publish', 'unpublish', 'delete', 'discardDraft']);
// Content types without draft & publish change the site on every write.
const WRITES = new Set(['create', 'update', 'delete']);
const DEBOUNCE_MS = 1500;

let timer = null;

function notify(strapi) {
  const urls = (process.env.SITE_REVALIDATE_URL || '').split(',').map((url) => url.trim()).filter(Boolean);
  const secret = process.env.SITE_REVALIDATE_SECRET;
  if (!urls.length || !secret) return;

  // Many changes at once (a publish touching several entries, a seed) → one refresh.
  clearTimeout(timer);
  timer = setTimeout(() => {
    for (const url of urls) {
      fetch(url, { method: 'POST', headers: { 'x-revalidate-secret': secret } })
        .then((response) => {
          if (!response.ok) strapi.log.warn(`[site-refresh] ${url} answered ${response.status}`);
        })
        .catch((error) => strapi.log.warn(`[site-refresh] ${url}: ${error.message}`));
    }
  }, DEBOUNCE_MS);
}

function registerSiteRefresh(strapi) {
  strapi.documents.use(async (context, next) => {
    const result = await next();
    const { uid, action } = context;
    if (!uid.startsWith('api::') || uid === 'api::cms-activity.cms-activity') return result;

    const draftAndPublish = Boolean(strapi.getModel(uid)?.options?.draftAndPublish);
    if (ACTIONS.has(action) || (!draftAndPublish && WRITES.has(action))) notify(strapi);
    return result;
  });

  // Media library changes (alt text, replaced or deleted files) show on the site too.
  strapi.db.lifecycles.subscribe({
    models: ['plugin::upload.file'],
    afterUpdate: () => notify(strapi),
    afterDelete: () => notify(strapi),
  });
}

module.exports = { registerSiteRefresh };
