'use strict';

/**
 * blog controller
 */

const { createCoreController } = require('@strapi/strapi').factories;
const {
  applyPendingThumbnailPatch,
  ttsUpdatingIds,
  summaryUpdatingIds,
} = require('../content-types/blog/thumbnail-patch');
const { generateBlogAudiosWithProgress, deletePreviousBlogAudioUploads } = require('../content-types/blog/tts-openai');
const {
  generateElevenLabsAudiosWithProgress,
  deleteElevenLabsUploadsFromVariants,
} = require('../content-types/blog/tts-elevenlabs');
const { loadBlogEntryForTts } = require('../content-types/blog/blog-tts-load');
const { generateBlogSummary } = require('../content-types/blog/summary-openai');

const BLOG_UID = 'api::blog.blog';

function elevenLabsFailureMessage(reason, detail) {
  switch (reason) {
    case 'missing_api_key':
      return 'ElevenLabs API key is missing or still a placeholder. Set ELEVENLABS_API_KEY in your environment and restart Strapi.';
    case 'no_text':
      return 'No text found to read aloud. Add Title, Summary, or Description (body) content — unpublished draft edits are used when they contain more text.';
    case 'all_voices_failed':
      return (
        'ElevenLabs did not return usable audio for any configured voice. ' +
        `Check ELEVENLABS_TTS_VOICES / voice IDs, quotas, and upload storage. ${detail ? `(${detail})` : ''}`.trim()
      );
    case 'unexpected':
      return detail || 'ElevenLabs audio generation failed unexpectedly.';
    default:
      return 'No ElevenLabs audio variants were generated. Check ELEVENLABS_API_KEY, voice configuration, and article content.';
  }
}

/**
 * Resolve the document-id (uuid) from the route's numeric :id, or just pass
 * the value through when it already looks like a documentId.
 */
async function resolveDocumentId(strapi, raw) {
  if (raw == null || raw === '') return null;
  const asNumber = Number(raw);
  if (Number.isFinite(asNumber) && String(asNumber) === String(raw)) {
    const row = await strapi.db.query(BLOG_UID).findOne({
      where: { id: asNumber },
      select: ['documentId'],
    });
    return row?.documentId || null;
  }
  // Already a documentId string.
  return String(raw);
}

module.exports = createCoreController(BLOG_UID, ({ strapi }) => ({
  async update(ctx) {
    const response = await super.update(ctx);

    const documentId = await resolveDocumentId(strapi, ctx.params?.id);
    if (!documentId) return response;

    const refreshed = await applyPendingThumbnailPatch(strapi, documentId);
    if (refreshed) response.data = refreshed;

    return response;
  },

  /**
   * GET /api/blogs/:id/audio-status
   */
  async getAudioStatus(ctx) {
    const documentId = await resolveDocumentId(strapi, ctx.params?.id);
    if (!documentId) return ctx.notFound('Blog entry not found.');

    const entry = await strapi.documents(BLOG_UID).findOne({
      documentId,
      fields: ['ttsStatus', 'ttsProgress'],
    });
    if (!entry) return ctx.notFound('Blog entry not found.');

    ctx.body = {
      data: {
        ttsStatus: entry.ttsStatus || 'idle',
        ttsProgress: entry.ttsProgress || null,
      },
    };
  },

  /**
   * POST /api/blogs/:id/generate-audio  (OpenAI TTS, background job)
   */
  async generateAudio(ctx) {
    const documentId = await resolveDocumentId(strapi, ctx.params?.id);
    if (!documentId) return ctx.notFound('Blog entry not found.');

    const existing = await loadBlogEntryForTts(strapi, documentId);
    if (!existing) return ctx.notFound('Blog entry not found.');

    if (existing.ttsStatus === 'generating') {
      return ctx.badRequest('Audio generation is already in progress.');
    }

    ttsUpdatingIds.add(documentId);
    try {
      await strapi.documents(BLOG_UID).update({
        documentId,
        data: {
          ttsStatus: 'generating',
          ttsProgress: {
            message: 'Starting audio generation…',
            voice: null,
            chunk: 0,
            totalChunks: 0,
            currentVoice: 0,
            totalVoices: 0,
          },
        },
      });
    } finally {
      ttsUpdatingIds.delete(documentId);
    }

    setImmediate(async () => {
      const writeStatus = async (status, progress) => {
        ttsUpdatingIds.add(documentId);
        try {
          const patch = { ttsStatus: status };
          if (progress !== undefined) patch.ttsProgress = progress;
          await strapi.documents(BLOG_UID).update({ documentId, data: patch });
        } catch (err) {
          strapi.log.warn(`[Blog TTS] Progress write failed for documentId=${documentId}: ${err.message}`);
        } finally {
          ttsUpdatingIds.delete(documentId);
        }
      };

      try {
        const freshExisting = await loadBlogEntryForTts(strapi, documentId);
        if (!freshExisting) {
          await writeStatus('failed', { message: 'Blog entry could not be loaded for audio generation.', done: true });
          return;
        }

        await deletePreviousBlogAudioUploads(freshExisting);

        const existingNonOpenAi = Array.isArray(freshExisting.audioVariants)
          ? freshExisting.audioVariants.filter((v) => v?.provider && v.provider !== 'openai')
          : [];

        const blogForTts = {
          Title: freshExisting.Title,
          Summary: freshExisting.Summary,
          Description: freshExisting.Description,
          slug: freshExisting.slug,
        };

        const onProgress = (progress) => writeStatus('generating', progress);

        const { variants } = await generateBlogAudiosWithProgress(blogForTts, onProgress);

        if (variants.length > 0) {
          const mergedVariants = [...variants, ...existingNonOpenAi];
          ttsUpdatingIds.add(documentId);
          try {
            await strapi.documents(BLOG_UID).update({
              documentId,
              data: {
                ttsStatus: 'done',
                ttsProgress: { message: 'OpenAI audio generated successfully!', done: true },
                audioVariants: mergedVariants,
              },
            });
          } finally {
            ttsUpdatingIds.delete(documentId);
          }
          strapi.log.info(`[Blog TTS] generateAudio documentId=${documentId}: ${variants.length} OpenAI variant(s) ready.`);
        } else {
          await writeStatus('failed', { message: 'No audio variants were generated. Check OPENAI_API_KEY and article content.', done: true });
        }
      } catch (err) {
        strapi.log.error(`[Blog TTS] generateAudio documentId=${documentId} failed: ${err.message}`);
        await writeStatus('failed', { message: err.message, done: true });
      }
    });

    ctx.body = { data: { status: 'generating' } };
  },

  /**
   * POST /api/blogs/:id/generate-audio-elevenlabs  (ElevenLabs TTS, background job)
   */
  async generateAudioElevenLabs(ctx) {
    const documentId = await resolveDocumentId(strapi, ctx.params?.id);
    if (!documentId) return ctx.notFound('Blog entry not found.');

    const existing = await loadBlogEntryForTts(strapi, documentId);
    if (!existing) return ctx.notFound('Blog entry not found.');

    if (existing.ttsStatus === 'generating') {
      return ctx.badRequest('Audio generation is already in progress.');
    }

    ttsUpdatingIds.add(documentId);
    try {
      await strapi.documents(BLOG_UID).update({
        documentId,
        data: {
          ttsStatus: 'generating',
          ttsProgress: {
            message: 'Starting ElevenLabs audio generation…',
            provider: 'elevenlabs',
            voice: null,
            chunk: 0,
            totalChunks: 0,
            currentVoice: 0,
            totalVoices: 0,
          },
        },
      });
    } finally {
      ttsUpdatingIds.delete(documentId);
    }

    setImmediate(async () => {
      const writeStatus = async (status, progress) => {
        ttsUpdatingIds.add(documentId);
        try {
          const patch = { ttsStatus: status };
          if (progress !== undefined) patch.ttsProgress = progress;
          await strapi.documents(BLOG_UID).update({ documentId, data: patch });
        } catch (err) {
          strapi.log.warn(`[Blog TTS ElevenLabs] Progress write failed for documentId=${documentId}: ${err.message}`);
        } finally {
          ttsUpdatingIds.delete(documentId);
        }
      };

      try {
        const freshExisting = await loadBlogEntryForTts(strapi, documentId);
        if (!freshExisting) {
          await writeStatus('failed', { message: 'Blog entry could not be loaded for audio generation.', done: true });
          return;
        }

        const priorElevenLabsVariants = Array.isArray(freshExisting.audioVariants)
          ? freshExisting.audioVariants.filter((v) => v?.provider === 'elevenlabs')
          : [];

        const existingNonElevenLabs = Array.isArray(freshExisting.audioVariants)
          ? freshExisting.audioVariants.filter((v) => v?.provider !== 'elevenlabs')
          : [];

        const blogForTts = {
          Title: freshExisting.Title,
          Summary: freshExisting.Summary,
          Description: freshExisting.Description,
          slug: freshExisting.slug,
        };

        const onProgress = (progress) => writeStatus('generating', progress);

        const { variants, reason, detail } = await generateElevenLabsAudiosWithProgress(blogForTts, onProgress);

        if (variants.length > 0) {
          const mergedVariants = [...existingNonElevenLabs, ...variants];
          ttsUpdatingIds.add(documentId);
          try {
            await strapi.documents(BLOG_UID).update({
              documentId,
              data: {
                ttsStatus: 'done',
                ttsProgress: { message: 'ElevenLabs audio generated successfully!', done: true },
                audioVariants: mergedVariants,
              },
            });
            await deleteElevenLabsUploadsFromVariants(priorElevenLabsVariants);
          } finally {
            ttsUpdatingIds.delete(documentId);
          }
          strapi.log.info(`[Blog TTS ElevenLabs] generateAudio documentId=${documentId}: ${variants.length} variant(s) ready.`);
        } else {
          await writeStatus('failed', { message: elevenLabsFailureMessage(reason, detail), done: true });
        }
      } catch (err) {
        strapi.log.error(`[Blog TTS ElevenLabs] generateAudio documentId=${documentId} failed: ${err.message}`);
        await writeStatus('failed', { message: err.message, done: true });
      }
    });

    ctx.body = { data: { status: 'generating' } };
  },

  /**
   * GET /api/blogs/:id/ai-summary
   */
  async getSummary(ctx) {
    const documentId = await resolveDocumentId(strapi, ctx.params?.id);
    if (!documentId) return ctx.notFound('Blog entry not found.');

    const entry = await strapi.documents(BLOG_UID).findOne({
      documentId,
      fields: ['aiSummary'],
    });
    if (!entry) return ctx.notFound('Blog entry not found.');

    ctx.body = {
      data: { aiSummary: entry.aiSummary || null },
    };
  },

  /**
   * POST /api/blogs/:id/generate-summary  (synchronous)
   */
  async generateSummary(ctx) {
    const documentId = await resolveDocumentId(strapi, ctx.params?.id);
    if (!documentId) return ctx.notFound('Blog entry not found.');

    const entry = await strapi.documents(BLOG_UID).findOne({
      documentId,
      fields: ['id', 'Title', 'Description'],
    });
    if (!entry) return ctx.notFound('Blog entry not found.');

    let summary;
    try {
      summary = await generateBlogSummary({
        Title: entry.Title,
        Description: entry.Description,
      });
    } catch (err) {
      strapi.log.error(`[Blog AI Summary] generateSummary documentId=${documentId} failed: ${err.message}`);
      return ctx.badRequest(err.message);
    }

    summaryUpdatingIds.add(documentId);
    try {
      await strapi.documents(BLOG_UID).update({
        documentId,
        data: { aiSummary: summary },
      });
    } finally {
      summaryUpdatingIds.delete(documentId);
    }

    strapi.log.info(`[Blog AI Summary] Summary generated for documentId=${documentId}`);
    ctx.body = { data: { aiSummary: summary } };
  },
}));
