'use strict';

/**
 * In-memory bridges between the blog document-service middleware and the
 * blog controller. Keys are `documentId` strings (Strapi v5).
 *
 * Each map / set is cleared by whoever consumes it.
 */

const pendingThumbnails = new Map();
const pendingStructuredData = new Map();
const pendingMetaImage = new Map();

// Re-entry guards (Set<documentId>):
//   patchingIds        — afterUpdate is performing the SEO patch update; skip the full lifecycle.
//   ttsUpdatingIds     — TTS background job is writing status/progress; skip lifecycle.
//   summaryUpdatingIds — summary endpoint is writing aiSummary; skip lifecycle.
const patchingIds = new Set();
const ttsUpdatingIds = new Set();
const summaryUpdatingIds = new Set();

/**
 * Called from the blog controller's update handler immediately after the
 * document-service update returns. The actual seo merge happens in the
 * middleware's afterUpdate phase; here we just re-fetch the entity so the
 * PUT response returned to the Admin UI shows the freshly patched images.
 *
 * Returns the populated entity if a patch was relevant, otherwise null.
 */
async function applyPendingThumbnailPatch(strapi, documentId) {
  if (!documentId) return null;
  // We can't check pendingThumbnails because afterUpdate already cleared it.
  // Instead, the controller always calls this after update; we just refresh.
  try {
    return await strapi.documents('api::blog.blog').findOne({
      documentId,
      populate: {
        author: true,
        seo: {
          populate: {
            metaImage: true,
            metaSocial: { populate: { image: true } },
          },
        },
      },
    });
  } catch (err) {
    strapi.log.error(
      `[Blog Lifecycle] Refresh after thumbnail patch failed for documentId=${documentId}: ${err.message}`
    );
    return null;
  }
}

module.exports = {
  applyPendingThumbnailPatch,
  pendingThumbnails,
  pendingStructuredData,
  pendingMetaImage,
  patchingIds,
  ttsUpdatingIds,
  summaryUpdatingIds,
};
