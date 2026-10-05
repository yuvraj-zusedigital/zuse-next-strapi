'use strict';

/**
 * Local development only: copies media-library files that live on the
 * production CDN (CloudFront/S3, e.g. from a copied database) into
 * public/uploads and points their records at the local copies, so the local
 * setup works offline.
 *
 *   npm run cms:localize-cdn-media
 *
 * Refuses to run unless Strapi uses the local upload provider (development
 * without AWS_BUCKET). Files already copied are skipped, so it's safe to
 * re-run. SEO structured data keeps its production URLs on purpose.
 */

const fs = require('fs');
const path = require('path');
const { withStrapi } = require('./lib/seed-helpers');

const UPLOADS = path.join(__dirname, '..', 'public', 'uploads');
const isRemote = (url) => typeof url === 'string' && /^https?:\/\//.test(url);

/** "https://cdn/audio/x.mp3" → "audio/x.mp3" */
const relativePath = (url) => decodeURIComponent(new URL(url).pathname.replace(/^\/+/, ''));

async function download(url) {
  const target = path.join(UPLOADS, relativePath(url));
  if (!target.startsWith(UPLOADS + path.sep)) throw new Error(`unsafe path in ${url}`);
  if (!fs.existsSync(target)) {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, Buffer.from(await response.arrayBuffer()));
  }
  return `/uploads/${relativePath(url)}`;
}

withStrapi(async (app) => {
  const provider = (app.config.get('plugin::upload') || {}).provider;
  if (provider !== 'local') {
    console.error(`Upload provider is "${provider}", not local — this script is for local development only.`);
    process.exitCode = 1;
    return;
  }

  const files = app.db.query('plugin::upload.file');
  const remote = await files.findMany({ where: { url: { $startsWith: 'http' } } });
  const counts = { copied: 0, failed: 0 };

  for (const file of remote) {
    try {
      const url = await download(file.url);
      const formats = file.formats ? { ...file.formats } : null;
      for (const [key, format] of Object.entries(formats || {})) {
        if (format && isRemote(format.url)) formats[key] = { ...format, url: await download(format.url) };
      }
      await files.update({ where: { id: file.id }, data: { url, formats, provider: 'local', provider_metadata: null } });
      counts.copied += 1;
    } catch (error) {
      counts.failed += 1;
      console.warn(`  ! ${file.name} (${file.url}): ${error.message}`);
    }
  }

  console.log(`Media: ${counts.copied} copied to public/uploads, ${counts.failed} failed, ${remote.length} were on the CDN.`);
}).catch((error) => {
  console.error(error);
  process.exit(1);
});
