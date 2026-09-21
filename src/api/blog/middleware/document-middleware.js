'use strict';

const {
  pendingThumbnails,
  pendingStructuredData,
  pendingMetaImage,
  patchingIds,
  ttsUpdatingIds,
  summaryUpdatingIds,
} = require('../content-types/blog/thumbnail-patch');

const {
  autoPopulateSeoFields,
  ensureSocialEntries,
  SOCIAL_PLATFORMS,
} = require('../content-types/blog/helpers/seo-fields');

const {
  resizeBlogImage,
  resizeCoverImageForMeta,
  generateResizedThumbnails,
  assertMetaImageWithinSizeLimit,
  resolveMediaId,
  resolvePrimaryImageRef,
} = require('../content-types/blog/helpers/images');

const {
  shouldAutoAssignBlogRank,
  getNextBlogRank,
} = require('../content-types/blog/helpers/rank');

const BLOG_UID = 'api::blog.blog';

/* ------------------------------------------------------------------ *
 * beforeCreate                                                        *
 * ------------------------------------------------------------------ */
async function onBeforeCreate(strapi, ctx) {
  const data = ctx.params.data;
  if (!data) return;

  if (shouldAutoAssignBlogRank(data.rank)) {
    data.rank = await getNextBlogRank(strapi);
  }

  const blogImageRef = resolvePrimaryImageRef(data);
  if (blogImageRef) {
    await resizeBlogImage(strapi, blogImageRef);
  }

  // Auto-assign seo.metaImage from Image when not set: 1200×630 resized copy.
  const sourceImage = resolvePrimaryImageRef(data);
  if (sourceImage) {
    if (!data.seo) data.seo = {};
    if (!data.seo.metaImage) {
      const metaImageId = await resizeCoverImageForMeta(strapi, sourceImage);
      if (metaImageId) {
        data.seo.metaImage = metaImageId;
        strapi.log.info(`[Blog Lifecycle] beforeCreate: auto-assigned seo.metaImage=${metaImageId} from image`);
      }
    }
  }

  if (!data.seo) data.seo = {};
  if ('structuredData' in data.seo) delete data.seo.structuredData;
  if ('structuredDataText' in data.seo && !data.seo.structuredDataText) delete data.seo.structuredDataText;

  await autoPopulateSeoFields(strapi, data);
  data.seo = ensureSocialEntries(data.seo);
  data.seo = await generateResizedThumbnails(strapi, data.seo);
  await assertMetaImageWithinSizeLimit(strapi, data.seo?.metaImage);
}

/* ------------------------------------------------------------------ *
 * beforeUpdate                                                        *
 * ------------------------------------------------------------------ */
async function onBeforeUpdate(strapi, ctx, documentId) {
  const data = ctx.params.data;
  if (!data) return;

  if (data.Image !== undefined || data.image !== undefined) {
    await resizeBlogImage(strapi, resolvePrimaryImageRef(data));
  }

  let existing = null;
  try {
    existing = await strapi.documents(BLOG_UID).findOne({
      documentId,
      populate: {
        Image: true,
        author: true,
        seo: {
          populate: {
            metaImage: true,
            metaSocial: { populate: { image: true } },
          },
        },
      },
    });
  } catch (_) { /* ignore */ }

  // Protect TTS / summary fields when caller omits them.
  if (!data.audioVariants && existing?.audioVariants) data.audioVariants = existing.audioVariants;
  if (!data.ttsStatus && existing?.ttsStatus) data.ttsStatus = existing.ttsStatus;
  if (!data.ttsProgress && existing?.ttsProgress) data.ttsProgress = existing.ttsProgress;
  if (!data.aiSummary && existing?.aiSummary) data.aiSummary = existing.aiSummary;

  // Merge metaSocial — UI sends [] when SEO accordion is collapsed.
  const existingSocial = existing?.seo?.metaSocial || [];
  const incomingSocial = data.seo?.metaSocial;
  let mergedSocial;
  if (!incomingSocial || incomingSocial.length === 0) {
    mergedSocial = existingSocial;
  } else {
    mergedSocial = incomingSocial.map((incoming) => {
      const saved = existingSocial.find((s) => s.socialNetwork === incoming.socialNetwork);
      if (!saved) return incoming;
      return { ...incoming, image: incoming.image ?? saved.image ?? null };
    });
    for (const saved of existingSocial) {
      const alreadyIncluded = mergedSocial.some((s) => s.socialNetwork === saved.socialNetwork);
      if (!alreadyIncluded) mergedSocial.push(saved);
    }
  }

  // Auto-derive metaImage from Image when image changed and metaImage absent.
  const incomingCoverImage = resolvePrimaryImageRef(data);
  const existingCoverImage = resolvePrimaryImageRef({}, existing);
  const incomingCoverImageId = resolveMediaId(incomingCoverImage);
  const existingCoverImageId = resolveMediaId(existingCoverImage);
  const incomingMetaImage = data.seo?.metaImage ?? null;
  const imageWasChanged = Boolean(incomingCoverImageId && incomingCoverImageId !== existingCoverImageId);

  let coverDerivedMetaImage = null;
  if (incomingCoverImage && (!incomingMetaImage || imageWasChanged)) {
    coverDerivedMetaImage = await resizeCoverImageForMeta(strapi, incomingCoverImage);
    if (coverDerivedMetaImage) {
      pendingMetaImage.set(documentId, coverDerivedMetaImage);
      strapi.log.info(`[Blog Lifecycle] beforeUpdate documentId=${documentId}: auto-assigned seo.metaImage=${coverDerivedMetaImage} from image`);
    }
  }

  const existingMetaImageId = existing?.seo?.metaImage?.id ?? existing?.seo?.metaImage ?? null;
  const resolvedMetaImage =
    coverDerivedMetaImage ??
    data.seo?.metaImage ??
    existingMetaImageId ??
    null;

  if (data.seo && 'structuredData' in data.seo) delete data.seo.structuredData;
  if (data.seo && 'structuredDataText' in data.seo && !data.seo.structuredDataText) {
    delete data.seo.structuredDataText;
  }

  const mergedSeo = data.seo
    ? { ...existing?.seo, ...data.seo, metaImage: resolvedMetaImage, metaSocial: mergedSocial }
    : existing?.seo
      ? { ...existing.seo, metaImage: resolvedMetaImage, metaSocial: mergedSocial }
      : null;

  const authorChanged =
    data.author &&
    typeof data.author === 'object' &&
    Array.isArray(data.author.connect) &&
    data.author.connect.length > 0;
  const resolvedAuthor = authorChanged ? data.author : (existing?.author ?? data.author);

  const merged = {
    Title: data.Title ?? existing?.Title,
    Summary: data.Summary ?? existing?.Summary,
    Description: data.Description ?? existing?.Description,
    slug: data.slug ?? existing?.slug,
    author: resolvedAuthor,
    publishedAt: existing?.publishedAt,
    createdAt: existing?.createdAt,
    updatedAt: new Date().toISOString(),
    seo: mergedSeo,
  };

  if (!merged.seo) merged.seo = {};

  await autoPopulateSeoFields(strapi, merged);
  data.seo = merged.seo;

  if (data.seo.structuredData) {
    pendingStructuredData.set(documentId, {
      structuredData: data.seo.structuredData,
      structuredDataText: data.seo.structuredDataText,
    });
  }

  data.seo = ensureSocialEntries(data.seo);
  await assertMetaImageWithinSizeLimit(strapi, data.seo?.metaImage);

  const metaImageId = data.seo.metaImage
    ? (typeof data.seo.metaImage === 'object' ? data.seo.metaImage.id : data.seo.metaImage)
    : null;

  const socialMissingImage = (data.seo.metaSocial || []).some((s) => {
    if (!SOCIAL_PLATFORMS.includes(s.socialNetwork)) return false;
    const socialImageId = s.image
      ? (typeof s.image === 'object' ? s.image.id : s.image)
      : null;
    return !socialImageId || socialImageId === metaImageId;
  });

  if (data.seo.metaImage && socialMissingImage) {
    data.seo = await generateResizedThumbnails(strapi, data.seo);
    strapi.log.info(`[Blog Lifecycle] Thumbnails generated for documentId=${documentId}`);
    pendingThumbnails.set(documentId, data.seo.metaSocial);
  }
}

/* ------------------------------------------------------------------ *
 * afterUpdate                                                         *
 * ------------------------------------------------------------------ */
async function onAfterUpdate(strapi, documentId) {
  if (!documentId) return;

  const hasStructuredData = pendingStructuredData.has(documentId);
  const hasThumbnails = pendingThumbnails.has(documentId);
  const hasMetaImage = pendingMetaImage.has(documentId);
  if (!hasStructuredData && !hasThumbnails && !hasMetaImage) return;

  const structuredPayload = pendingStructuredData.get(documentId);
  const metaSocial = pendingThumbnails.get(documentId);
  const metaImageId = pendingMetaImage.get(documentId);
  pendingStructuredData.delete(documentId);
  pendingThumbnails.delete(documentId);
  pendingMetaImage.delete(documentId);

  try {
    const current = await strapi.documents(BLOG_UID).findOne({
      documentId,
      populate: {
        seo: {
          populate: { metaSocial: { populate: { image: true } } },
        },
      },
    });

    if (!current?.seo) return;

    let updatedMetaSocial = current.seo.metaSocial || [];
    if (hasThumbnails && metaSocial) {
      const generatedByPlatform = new Map(
        (metaSocial || [])
          .filter((s) => s && s.socialNetwork)
          .map((s) => [s.socialNetwork, s])
      );

      updatedMetaSocial = updatedMetaSocial.map((saved) => {
        const platform = saved?.socialNetwork;
        if (!platform || !generatedByPlatform.has(platform)) return saved;
        const generated = generatedByPlatform.get(platform);
        const newImageId = generated.image
          ? (typeof generated.image === 'object' ? generated.image.id : generated.image)
          : null;
        const mergedEntry = { ...saved, ...generated, image: newImageId || saved.image };
        generatedByPlatform.delete(platform);
        return mergedEntry;
      });

      for (const generated of generatedByPlatform.values()) {
        const newImageId = generated.image
          ? (typeof generated.image === 'object' ? generated.image.id : generated.image)
          : null;
        updatedMetaSocial.push({ ...generated, image: newImageId });
      }
    }

    patchingIds.add(documentId);
    try {
      await strapi.documents(BLOG_UID).update({
        documentId,
        data: {
          seo: {
            ...current.seo,
            ...(structuredPayload ? {
              structuredData: structuredPayload.structuredData,
              structuredDataText: structuredPayload.structuredDataText,
            } : {}),
            ...(hasMetaImage ? { metaImage: metaImageId } : {}),
            metaSocial: updatedMetaSocial,
          },
        },
      });
      strapi.log.info(
        `[Blog Lifecycle] afterUpdate: patched seo for documentId=${documentId}` +
        (hasStructuredData ? ' [structuredData]' : '') +
        (hasMetaImage ? ` [metaImage=${metaImageId}]` : '') +
        (hasThumbnails ? ' [thumbnails]' : '')
      );
    } finally {
      patchingIds.delete(documentId);
    }
  } catch (err) {
    strapi.log.error(`[Blog Lifecycle] afterUpdate patch failed for documentId=${documentId}: ${err.message}`);
  }
}

/* ------------------------------------------------------------------ *
 * Middleware registration                                             *
 * ------------------------------------------------------------------ */
function registerBlogDocumentMiddleware(strapi) {
  strapi.documents.use(async (ctx, next) => {
    if (ctx.uid !== BLOG_UID && ctx.contentType?.uid !== BLOG_UID) {
      return next();
    }

    const documentId = ctx.params?.documentId;

    // Re-entry guards: skip the full lifecycle for internal patches and TTS / summary writes.
    if (documentId && (
      patchingIds.has(documentId) ||
      ttsUpdatingIds.has(documentId) ||
      summaryUpdatingIds.has(documentId)
    )) {
      return next();
    }

    if (ctx.action === 'create') {
      await onBeforeCreate(strapi, ctx);
      return next();
    }

    if (ctx.action === 'update') {
      await onBeforeUpdate(strapi, ctx, documentId);
      const result = await next();
      await onAfterUpdate(strapi, documentId);
      return result;
    }

    return next();
  });
}

module.exports = {
  registerBlogDocumentMiddleware,
};
