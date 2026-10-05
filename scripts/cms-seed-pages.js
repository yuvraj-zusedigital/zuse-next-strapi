'use strict';

/**
 * Copies the site's page content (scripts/seed-data/pages.json, exported from
 * zuse-site/content/pages) into Strapi page-builder sections: the service
 * pages, About, Awards, Privacy Policy and Terms of Use.
 *
 *   npm run cms:seed-pages
 *
 * Pages are matched by slug. A new page is created with its name, path and
 * sections; an existing page only gets what it's missing (sections when it has
 * none, path when empty and not used by another page). Safe to re-run; see
 * scripts/lib/seed-helpers.js for the publish rules.
 */

const { withStrapi, mediaResolver, upsert } = require('./lib/seed-helpers');

const pages = require('./seed-data/pages.json');

/** { url, alt } objects from the site's section data are media; rich-text links have a `type`. */
const isMedia = (value) => value && typeof value === 'object' && typeof value.url === 'string' && !('type' in value) && 'alt' in value;

/** Replaces media with uploaded file ids; drops nulls so Strapi applies defaults. */
async function toStrapi(value, media) {
  if (Array.isArray(value)) return Promise.all(value.map((item) => toStrapi(item, media)));
  if (!value || typeof value !== 'object') return value;
  if (isMedia(value)) return media(value.url, value.alt);
  const out = {};
  for (const [key, item] of Object.entries(value)) {
    if (item === null || item === undefined) continue;
    out[key] = await toStrapi(item, media);
  }
  return out;
}

withStrapi(async (app) => {
  const media = mediaResolver(app);
  const counts = { created: 0, filled: 0, unchanged: 0 };

  for (const page of pages) {
    // Don't take a path another page already uses (e.g. a test page).
    const pathOwner = await app.documents('api::page.page').findFirst({ status: 'draft', filters: { path: page.path, slug: { $ne: page.slug } } });
    if (pathOwner) console.warn(`  ! ${page.slug}: path ${page.path} is used by "${pathOwner.Name}", leaving it empty`);

    const result = await upsert(app, 'api::page.page', {
      filters: { slug: page.slug },
      populate: { sections: true },
      data: {
        Name: page.name,
        slug: page.slug,
        ...(pathOwner ? {} : { path: page.path }),
        sections: await toStrapi(page.sections, media),
      },
    });
    counts[result] += 1;
    console.log(`  ${page.slug}: ${result}`);
  }

  console.log(`Pages: ${counts.created} created, ${counts.filled} filled, ${counts.unchanged} unchanged.`);
  console.log(`Media: ${media.stats.uploaded} uploaded, ${media.stats.reused} reused.`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
