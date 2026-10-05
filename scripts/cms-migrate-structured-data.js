'use strict';

/**
 * One-off, safe to re-run: copies SEO "structuredData" (JSON) into
 * "structuredDataText" wherever only the JSON one is filled. The CMS shows
 * just the text field ("Structured data (JSON-LD)"), and the site already
 * prefers it, so this keeps such entries' structured data visible and editable.
 *
 *   node scripts/cms-migrate-structured-data.js
 */

const { withStrapi } = require('./lib/seed-helpers');

withStrapi(async (app) => {
  const seos = app.db.query('shared.seo');
  const rows = await seos.findMany({ select: ['id', 'structuredData', 'structuredDataText'] });
  let copied = 0;
  for (const row of rows) {
    const hasJson = row.structuredData && !(typeof row.structuredData === 'object' && !Object.keys(row.structuredData).length);
    if (hasJson && !row.structuredDataText) {
      await seos.update({ where: { id: row.id }, data: { structuredDataText: JSON.stringify(row.structuredData, null, 2) } });
      copied += 1;
    }
  }
  console.log(`SEO blocks: ${rows.length} checked, ${copied} copied to "Structured data (JSON-LD)".`);
}).catch((error) => {
  if (/aborted|strapi is not defined/.test(String(error))) return;
  console.error(error);
  process.exit(1);
});
