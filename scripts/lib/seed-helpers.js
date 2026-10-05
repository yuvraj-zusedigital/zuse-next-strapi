'use strict';

/**
 * Shared helpers for the content seed scripts (scripts/cms-seed-*.js), which
 * copy the site's current, hard-coded content into Strapi so it becomes
 * editable in the CMS without the site changing.
 *
 * Rules the seeds follow, so they're safe to re-run on any environment:
 * - Images are uploaded once and reused (matched by a name derived from their source).
 * - Existing entries are matched (by name/slug/path) and only their EMPTY fields are
 *   filled — nothing an editor has changed is overwritten.
 * - An entry is published when it's new, or when it was already published with no
 *   unpublished draft changes (so an editor's pending draft is never pushed live).
 */

const fs = require('fs');
const os = require('os');
const path = require('path');
const { createStrapi, compileStrapi } = require('@strapi/strapi');

const SITE_ASSETS = path.join(__dirname, '..', 'seed-assets', 'site');

const MIME = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.avif': 'image/avif', '.svg': 'image/svg+xml', '.mp4': 'video/mp4' };

async function withStrapi(run) {
  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'error';
  try {
    return await run(app);
  } finally {
    await app.destroy();
  }
}

/** Stable media-library name for a source: "seed-images-testimonial-logos-avion.png". */
const seedName = (source) => {
  const pathname = source.startsWith('http') ? new URL(source).pathname : source;
  return `seed-${pathname.replace(/^\/+/, '').replace(/[^a-zA-Z0-9.]+/g, '-')}`;
};

/**
 * Returns media(source, alt) → file id. `source` is a URL (downloaded) or a
 * site path like "/images/x.png" (read from scripts/seed-assets/site).
 * Returns null (with a warning) when the file can't be read, so one missing
 * image doesn't stop the seed.
 */
function mediaResolver(app, stats = { uploaded: 0, reused: 0 }) {
  const uploads = app.plugin('upload').service('upload');
  const cache = new Map();

  const media = async (source, alt = '') => {
    if (!source) return null;
    if (cache.has(source)) return cache.get(source);
    const name = seedName(source);

    const existing = await app.db.query('plugin::upload.file').findOne({ where: { name } });
    if (existing) {
      stats.reused += 1;
      cache.set(source, existing.id);
      return existing.id;
    }

    let buffer;
    try {
      if (source.startsWith('http')) {
        const response = await fetch(source);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        buffer = Buffer.from(await response.arrayBuffer());
      } else {
        buffer = fs.readFileSync(path.join(SITE_ASSETS, source));
      }
    } catch (error) {
      console.warn(`  ! couldn't read ${source}: ${error.message}`);
      cache.set(source, null);
      return null;
    }

    const ext = path.extname(name).toLowerCase();
    const tmp = path.join(os.tmpdir(), `${Date.now()}-${name}`);
    fs.writeFileSync(tmp, buffer);
    const [file] = await uploads.upload({
      data: { fileInfo: { name, alternativeText: alt || null } },
      files: { filepath: tmp, originalFilename: name, mimetype: MIME[ext] || 'application/octet-stream', size: buffer.length },
    });
    stats.uploaded += 1;
    cache.set(source, file.id);
    return file.id;
  };
  media.stats = stats;
  return media;
}

const isEmpty = (value) =>
  value === null || value === undefined || value === '' || (Array.isArray(value) && value.length === 0);

/**
 * Creates or fills one document.
 * @param uid        content type uid
 * @param filters    how to find the existing entry (e.g. { name: 'Paul Gannon' })
 * @param data       full data for a new entry
 * @param populate   relations/media/components to load so emptiness can be checked
 * @returns 'created' | 'filled' | 'unchanged'
 */
async function upsert(app, uid, { filters, data, populate = {} }) {
  const documents = app.documents(uid);
  const draft = await documents.findFirst({ status: 'draft', filters, populate });

  if (!draft) {
    const created = await documents.create({ data });
    await documents.publish({ documentId: created.documentId });
    return 'created';
  }

  const missing = Object.fromEntries(Object.entries(data).filter(([key]) => isEmpty(draft[key])));
  if (!Object.keys(missing).length) return 'unchanged';

  const published = await documents.findFirst({ status: 'published', filters: { documentId: draft.documentId }, fields: ['updatedAt'] });
  const hadPendingDraft = published && new Date(draft.updatedAt) > new Date(published.updatedAt);

  await documents.update({ documentId: draft.documentId, data: missing });
  if (published && !hadPendingDraft) await documents.publish({ documentId: draft.documentId });
  return 'filled';
}

module.exports = { withStrapi, mediaResolver, upsert, isEmpty, seedName };
