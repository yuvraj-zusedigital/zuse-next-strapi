'use strict';

const { errors, file: { bytesToKbytes } } = require('@strapi/utils');
const { ValidationError } = errors;

const META_IMAGE_MAX_KB = 300;
const META_IMAGE_MAX_BYTES = META_IMAGE_MAX_KB * 1000;

const SOCIAL_MEDIA_SIZES = {
  Facebook: { width: 1200, height: 630 },
  Twitter: { width: 1200, height: 600 },
};

function resolveMediaId(mediaRef) {
  if (!mediaRef) return null;
  if (typeof mediaRef === 'number' || typeof mediaRef === 'string') return mediaRef;

  if (Array.isArray(mediaRef)) {
    return resolveMediaId(mediaRef[0]);
  }

  if (typeof mediaRef === 'object') {
    if (mediaRef.id) return mediaRef.id;
    if (Array.isArray(mediaRef.connect) && mediaRef.connect.length > 0) {
      const firstConnect = mediaRef.connect[0];
      return typeof firstConnect === 'object' ? firstConnect.id : firstConnect;
    }
    if (Array.isArray(mediaRef.set) && mediaRef.set.length > 0) {
      const firstSet = mediaRef.set[0];
      return typeof firstSet === 'object' ? firstSet.id : firstSet;
    }
  }

  return null;
}

function resolvePrimaryImageRef(data, existing = null) {
  return data?.image ?? data?.Image ?? existing?.image ?? existing?.Image ?? null;
}

function getResizedOutputSpec(file) {
  const mime = String(file?.mime || '').toLowerCase();
  const ext = String(file?.ext || '').toLowerCase();
  const name = String(file?.name || '').toLowerCase();
  const isPng = mime === 'image/png' || ext === '.png' || name.endsWith('.png');
  if (isPng) return { mime: 'image/png', ext: '.png', format: 'png' };
  return { mime: 'image/jpeg', ext: '.jpg', format: 'jpeg' };
}

function tryRequireSharp(strapi, contextLabel) {
  try {
    return require('sharp');
  } catch (_) {
    strapi.log.info(`[Blog Lifecycle] sharp not installed — skipping ${contextLabel}.`);
    return null;
  }
}

async function loadImageBuffer(strapi, file) {
  // Try local path first.
  if (file.url && file.url.startsWith('/')) {
    const fs = require('fs');
    const path = require('path');
    const localPath = path.join(strapi.dirs.static.public, file.url);
    if (fs.existsSync(localPath)) {
      try { return fs.readFileSync(localPath); } catch (_) { /* fall through */ }
    }
  }
  // Fall back to HTTP.
  try {
    const fetch = require('node-fetch');
    let imageUrl = file.url;
    if (imageUrl.startsWith('/')) {
      imageUrl = `http://127.0.0.1:${strapi.config.get('server.port', 1337)}${imageUrl}`;
    }
    const response = await fetch(imageUrl);
    return Buffer.from(await response.arrayBuffer());
  } catch (fetchErr) {
    strapi.log.warn(`[Blog Lifecycle] Could not fetch image: ${fetchErr.message}`);
    return null;
  }
}

async function buildMetaImageBufferBelowMax(strapi, imageBuffer, outputSpec) {
  const sharp = require('sharp');
  let width = 1200;
  let height = 630;

  if (outputSpec.format === 'jpeg') {
    const encodeJpeg = (w, h, q) =>
      sharp(imageBuffer)
        .resize(w, h, { fit: 'cover', position: 'center' })
        .jpeg({ quality: q, mozjpeg: true })
        .toBuffer();

    for (let scalePass = 0; scalePass < 14; scalePass++) {
      for (let q = 85; q >= 18; q -= 4) {
        const buf = await encodeJpeg(width, height, q);
        if (buf.length <= META_IMAGE_MAX_BYTES) {
          return { buffer: buf, width, height };
        }
      }
      width = Math.round(width * 0.86);
      height = Math.round(height * 0.86);
      if (width < 420) {
        const buf = await encodeJpeg(width, height, 12);
        if (buf.length <= META_IMAGE_MAX_BYTES) {
          return { buffer: buf, width, height };
        }
        strapi.log.error(
          `[Blog Lifecycle] Meta image still ${bytesToKbytes(buf.length)} KB after min compression — skipping auto meta file.`
        );
        return null;
      }
    }
    return null;
  }

  const baseResize = (w, h) =>
    sharp(imageBuffer).resize(w, h, { fit: 'cover', position: 'center' });

  async function tryPngEncoders(w, h) {
    const attempts = [
      () => baseResize(w, h).png({ compressionLevel: 9, adaptiveFiltering: true }).toBuffer(),
      () => baseResize(w, h).png({ compressionLevel: 9, palette: true, colors: 256 }).toBuffer(),
      () => baseResize(w, h).png({ compressionLevel: 9, palette: true, colors: 128 }).toBuffer(),
      () => baseResize(w, h).png({ compressionLevel: 9, palette: true, colors: 64 }).toBuffer(),
      () => baseResize(w, h).png({ compressionLevel: 9, palette: true, colors: 32 }).toBuffer(),
    ];
    for (const run of attempts) {
      try {
        const buf = await run();
        if (buf.length <= META_IMAGE_MAX_BYTES) return buf;
      } catch (_) { /* palette quantize edge cases */ }
    }
    return null;
  }

  for (let scalePass = 0; scalePass < 14; scalePass++) {
    const buf = await tryPngEncoders(width, height);
    if (buf) return { buffer: buf, width, height };

    width = Math.round(width * 0.86);
    height = Math.round(height * 0.86);
    if (width < 420) {
      const finalBuf = await tryPngEncoders(width, height);
      if (finalBuf) return { buffer: finalBuf, width, height };
      strapi.log.error(
        '[Blog Lifecycle] PNG meta image still exceeds size limit after compression — skipping auto meta file.'
      );
      return null;
    }
  }
  return null;
}

async function assertMetaImageWithinSizeLimit(strapi, metaImageRef) {
  if (!metaImageRef) return;
  const id =
    typeof metaImageRef === 'object' && metaImageRef.id != null
      ? metaImageRef.id
      : metaImageRef;
  if (id == null) return;

  const file = await strapi.plugins['upload'].services.upload.findOne(id);
  if (!file || typeof file.size !== 'number') return;

  if (file.size > META_IMAGE_MAX_KB) {
    throw new ValidationError(
      `SEO meta image must be ${META_IMAGE_MAX_KB} KB or smaller (this file is about ${file.size} KB). Use a smaller or more compressed image.`
    );
  }
}

async function resizeCoverImageForMeta(strapi, coverImageRef) {
  if (!coverImageRef) return null;
  if (!tryRequireSharp(strapi, 'image → metaImage resize')) return null;

  const imageId = resolveMediaId(coverImageRef);
  if (!imageId) return null;

  try {
    const file = await strapi.plugins['upload'].services.upload.findOne(imageId);
    if (!file || !file.url) {
      strapi.log.warn('[Blog Lifecycle] Could not find image file for metaImage resize.');
      return null;
    }

    const imageBuffer = await loadImageBuffer(strapi, file);
    if (!imageBuffer) return null;

    const outputSpec = getResizedOutputSpec(file);
    const built = await buildMetaImageBufferBelowMax(strapi, imageBuffer, outputSpec);
    if (!built) return null;

    const { buffer: resizedBuffer, width: outW, height: outH } = built;

    const os = require('os');
    const fs = require('fs');
    const path = require('path');
    const baseName = file.name.replace(/\.[^/.]+$/, '');
    const fileName = `${baseName}_meta_1200x630${outputSpec.ext}`;
    const tmpPath = path.join(os.tmpdir(), fileName);
    fs.writeFileSync(tmpPath, resizedBuffer);

    const existingFiles = await strapi.db.query('plugin::upload.file').findMany({
      where: { name: fileName },
      limit: 1,
    });

    let resultId;
    if (existingFiles && existingFiles.length > 0) {
      const existingFile = existingFiles[0];
      if (existingFile.url && existingFile.url.startsWith('/')) {
        const localPath = path.join(strapi.dirs.static.public, existingFile.url);
        try { fs.writeFileSync(localPath, resizedBuffer); } catch (_) { /* ignore */ }
      }
      await strapi.db.query('plugin::upload.file').update({
        where: { id: existingFile.id },
        data: {
          width: outW,
          height: outH,
          mime: outputSpec.mime,
          ext: outputSpec.ext,
          size: bytesToKbytes(resizedBuffer.length),
          updatedAt: new Date(),
        },
      });
      resultId = existingFile.id;
      strapi.log.info(`[Blog Lifecycle] Replaced existing metaImage "${fileName}" (id=${resultId})`);
    } else {
      const uploadResult = await strapi.plugins['upload'].services.upload.upload({
        data: {},
        files: {
          filepath: tmpPath,
          originalFilename: fileName,
          mimetype: outputSpec.mime,
          size: resizedBuffer.length,
          // Back-compat with v4 upload field names — passing both is safe.
          path: tmpPath,
          name: fileName,
          type: outputSpec.mime,
        },
      });
      if (uploadResult && uploadResult.length > 0) {
        resultId = uploadResult[0].id;
        await strapi.db.query('plugin::upload.file').update({
          where: { id: resultId },
          data: {
            width: outW,
            height: outH,
            mime: outputSpec.mime,
            ext: outputSpec.ext,
            size: bytesToKbytes(resizedBuffer.length),
          },
        });
        strapi.log.info(`[Blog Lifecycle] Uploaded new metaImage "${fileName}" (id=${resultId})`);
      }
    }

    try { fs.unlinkSync(tmpPath); } catch (_) { /* ignore */ }

    return resultId || null;
  } catch (err) {
    strapi.log.error('[Blog Lifecycle] Failed to resize image for metaImage:', err.message);
    return null;
  }
}

async function resizeBlogImage(strapi, imageRef) {
  if (!imageRef) return;
  const sharp = tryRequireSharp(strapi, 'blog image resize');
  if (!sharp) return;

  const imageId = resolveMediaId(imageRef);
  if (!imageId) return;

  try {
    const file = await strapi.plugins['upload'].services.upload.findOne(imageId);
    if (!file || !file.url || !file.url.startsWith('/')) return;

    const fs = require('fs');
    const path = require('path');
    const localPath = path.join(strapi.dirs.static.public, file.url);

    if (!fs.existsSync(localPath)) {
      strapi.log.warn(`[Blog Lifecycle] Blog image not found at ${localPath}`);
      return;
    }

    const resizedBuffer = await sharp(localPath)
      .resize(723, 542, { fit: 'cover', position: 'center' })
      .toBuffer();

    fs.writeFileSync(localPath, resizedBuffer);

    await strapi.db.query('plugin::upload.file').update({
      where: { id: imageId },
      data: { width: 723, height: 542, size: Math.round(resizedBuffer.length / 1024) },
    });

    strapi.log.info(`[Blog Lifecycle] Resized blog Image to 723x542 (file id=${imageId})`);
  } catch (err) {
    strapi.log.error('[Blog Lifecycle] Failed to resize blog image:', err.message);
  }
}

async function generateResizedThumbnails(strapi, seoData) {
  if (!seoData || !seoData.metaImage) return seoData;
  if (!seoData.metaSocial || seoData.metaSocial.length === 0) return seoData;

  const sharp = tryRequireSharp(strapi, 'social thumbnail resize');
  if (!sharp) return seoData;

  let imageFileId = seoData.metaImage;
  if (typeof imageFileId === 'object' && imageFileId.id) imageFileId = imageFileId.id;

  const file = await strapi.plugins['upload'].services.upload.findOne(imageFileId);
  if (!file || !file.url) {
    strapi.log.warn('[Blog Lifecycle] Could not find metaImage file for thumbnail resizing.');
    return seoData;
  }

  const imageBuffer = await loadImageBuffer(strapi, file);
  if (!imageBuffer) return seoData;

  const metaImageId = typeof seoData.metaImage === 'object'
    ? seoData.metaImage?.id
    : seoData.metaImage;

  for (const social of seoData.metaSocial) {
    const dimensions = SOCIAL_MEDIA_SIZES[social.socialNetwork];
    if (!dimensions) continue;

    const socialImageId = social.image
      ? (typeof social.image === 'object' ? social.image.id : social.image)
      : null;

    // Skip only if the social image is already a *different* file from metaImage.
    if (socialImageId && socialImageId !== metaImageId) continue;

    try {
      const outputSpec = getResizedOutputSpec(file);
      const pipeline = sharp(imageBuffer)
        .resize(dimensions.width, dimensions.height, { fit: 'cover', position: 'center' });
      if (outputSpec.format === 'png') pipeline.png();
      else pipeline.jpeg({ quality: 85 });
      const resizedBuffer = await pipeline.toBuffer();

      const os = require('os');
      const fs = require('fs');
      const path = require('path');
      const fileName = `${file.name.replace(/\.[^/.]+$/, '')}_${social.socialNetwork.toLowerCase()}_${dimensions.width}x${dimensions.height}${outputSpec.ext}`;
      const tmpPath = path.join(os.tmpdir(), fileName);
      fs.writeFileSync(tmpPath, resizedBuffer);

      const existingFiles = await strapi.db.query('plugin::upload.file').findMany({
        where: { name: fileName },
        limit: 1,
      });

      let resultId;

      if (existingFiles && existingFiles.length > 0) {
        const existingFile = existingFiles[0];
        if (existingFile.url && existingFile.url.startsWith('/')) {
          const localPath = path.join(strapi.dirs.static.public, existingFile.url);
          try { fs.writeFileSync(localPath, resizedBuffer); } catch (_) { /* ignore */ }
        }
        await strapi.db.query('plugin::upload.file').update({
          where: { id: existingFile.id },
          data: {
            width: dimensions.width,
            height: dimensions.height,
            mime: outputSpec.mime,
            ext: outputSpec.ext,
            size: Math.round(resizedBuffer.length / 1024),
            updatedAt: new Date(),
          },
        });
        resultId = existingFile.id;
        strapi.log.info(`[Blog Lifecycle] Replaced existing thumbnail "${fileName}" (id=${resultId})`);
      } else {
        const uploadResult = await strapi.plugins['upload'].services.upload.upload({
          data: {},
          files: {
            filepath: tmpPath,
            originalFilename: fileName,
            mimetype: outputSpec.mime,
            size: resizedBuffer.length,
            path: tmpPath,
            name: fileName,
            type: outputSpec.mime,
          },
        });
        if (uploadResult && uploadResult.length > 0) {
          resultId = uploadResult[0].id;
          await strapi.db.query('plugin::upload.file').update({
            where: { id: resultId },
            data: {
              width: dimensions.width,
              height: dimensions.height,
              mime: outputSpec.mime,
              ext: outputSpec.ext,
            },
          });
          strapi.log.info(`[Blog Lifecycle] Uploaded new thumbnail "${fileName}" (id=${resultId})`);
        }
      }

      try { fs.unlinkSync(tmpPath); } catch (_) { /* ignore */ }

      if (resultId) social.image = resultId;
    } catch (resizeErr) {
      strapi.log.error(
        `[Blog Lifecycle] Failed to generate ${social.socialNetwork} thumbnail:`,
        resizeErr.message
      );
    }
  }

  return seoData;
}

module.exports = {
  META_IMAGE_MAX_KB,
  SOCIAL_MEDIA_SIZES,
  resolveMediaId,
  resolvePrimaryImageRef,
  getResizedOutputSpec,
  buildMetaImageBufferBelowMax,
  assertMetaImageWithinSizeLimit,
  resizeCoverImageForMeta,
  resizeBlogImage,
  generateResizedThumbnails,
};
