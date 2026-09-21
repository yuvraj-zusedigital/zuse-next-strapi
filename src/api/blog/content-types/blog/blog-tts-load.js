'use strict';

const { buildTtsInputText } = require('./tts-openai');

const BLOG_UID = 'api::blog.blog';

const TTS_FIELDS = ['id', 'Title', 'Summary', 'Description', 'slug', 'ttsStatus', 'audioVariants'];

function ttsContentScore(entry) {
  if (!entry) return 0;
  const text = buildTtsInputText({
    Title: entry.Title,
    Summary: entry.Summary,
    Description: entry.Description,
    slug: entry.slug,
  });
  return text ? text.length : 0;
}

/**
 * Load the blog row that best represents what the user sees in the admin editor.
 * With draft & publish, `findOne` without `status` can return the published copy while
 * Title/Summary/Description were edited only on draft — TTS would then see empty/old body.
 */
async function loadBlogEntryForTts(strapi, documentId) {
  const collected = [];

  for (const status of ['draft', 'published']) {
    let e = null;
    try {
      e = await strapi.documents(BLOG_UID).findOne({
        documentId,
        status,
        fields: TTS_FIELDS,
      });
    } catch {
      e = null;
    }
    if (e) collected.push({ status, e });
  }

  if (collected.length === 0) {
    try {
      return await strapi.documents(BLOG_UID).findOne({
        documentId,
        fields: TTS_FIELDS,
      });
    } catch {
      return null;
    }
  }

  collected.sort((a, b) => {
    const diff = ttsContentScore(b.e) - ttsContentScore(a.e);
    if (diff !== 0) return diff;
    if (a.status === 'draft' && b.status === 'published') return -1;
    if (a.status === 'published' && b.status === 'draft') return 1;
    return 0;
  });

  return collected[0].e;
}

module.exports = {
  loadBlogEntryForTts,
  TTS_FIELDS,
};
