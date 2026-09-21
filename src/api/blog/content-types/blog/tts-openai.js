'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');

const OPENAI_TTS_MODEL = 'tts-1';
const OPENAI_TTS_FORMAT = 'mp3';
const MAX_INPUT_CHARS = 4096;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'tobemodified' || apiKey.startsWith('sk-REPLACE')) {
    return null;
  }
  const OpenAI = require('openai');
  return new OpenAI({ apiKey });
}

function getVoices() {
  const fromList = String(process.env.OPENAI_TTS_VOICES || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);
  if (fromList.length > 0) return [...new Set(fromList)];
  return [process.env.OPENAI_TTS_VOICE || 'alloy'];
}

function buildAudioLabel(voice) {
  if (!voice) return 'Audio';
  return voice.charAt(0).toUpperCase() + voice.slice(1);
}

/**
 * Strip HTML tags, decode common entities, and collapse whitespace
 * into clean plain text suitable for TTS input.
 */
function stripHtmlToPlainText(html) {
  if (!html || typeof html !== 'string') return '';
  return html
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '.\n\n')
    .replace(/<[^>]*>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&\w+;/gi, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

const MAX_DESC_DEPTH = 6;

/**
 * Resolve TinyMCE / Strapi custom-field shapes to an HTML string for TTS.
 */
function extractDescriptionHtml(description, depth = 0) {
  if (depth > MAX_DESC_DEPTH) return '';
  if (description == null || description === '') return '';
  if (typeof description === 'string') return description;

  if (typeof description === 'object') {
    const candidates = [
      description.data?.Description,
      description.data?.body,
      description.data?.html,
      description.Description,
      description.body,
      description.html,
      description.content,
      description.value,
    ];
    for (const c of candidates) {
      if (typeof c === 'string' && c.trim()) return c;
      if (c && typeof c === 'object') {
        const nested = extractDescriptionHtml(c, depth + 1);
        if (nested) return nested;
      }
    }
  }

  return '';
}

/**
 * Build the full TTS input text from blog data fields.
 */
function buildTtsInputText(blogData) {
  const title = (blogData.Title || '').trim();
  const summary = (blogData.Summary || '').trim();
  const descriptionHtml = extractDescriptionHtml(blogData.Description);
  const body = stripHtmlToPlainText(
    typeof descriptionHtml === 'string' ? descriptionHtml : ''
  );

  const parts = [];
  if (title) parts.push(title);
  if (summary) parts.push(summary);
  if (body) parts.push(body);

  return parts.join('.\n\n').replace(/\.{2,}/g, '.').trim();
}

/**
 * Split text into chunks that respect the OpenAI TTS character limit.
 * Splits at sentence boundaries when possible.
 */
function splitTextIntoChunks(text, maxLen = MAX_INPUT_CHARS) {
  if (!text || text.length <= maxLen) return text ? [text] : [];

  const sentences = text.split(/(?<=[.!?])\s+/);
  const chunks = [];
  let current = '';

  for (const sentence of sentences) {
    if (sentence.length > maxLen) {
      if (current) {
        chunks.push(current.trim());
        current = '';
      }
      // Force-split oversized sentence by character
      for (let i = 0; i < sentence.length; i += maxLen) {
        chunks.push(sentence.slice(i, i + maxLen));
      }
      continue;
    }

    const next = current ? `${current} ${sentence}` : sentence;
    if (next.length > maxLen) {
      chunks.push(current.trim());
      current = sentence;
    } else {
      current = next;
    }
  }

  if (current.trim()) chunks.push(current.trim());
  return chunks;
}

/**
 * Call OpenAI TTS for a single text chunk and return the MP3 buffer.
 */
async function synthesizeChunk(client, text, voice) {
  const response = await client.audio.speech.create({
    model: OPENAI_TTS_MODEL,
    voice,
    input: text,
    response_format: OPENAI_TTS_FORMAT,
  });

  const arrayBuffer = await response.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Upload an MP3 buffer to the Strapi media library (S3).
 * @returns {{ url: string, uploadId: number } | null}
 */
async function uploadMp3ToStrapi(mp3Buffer, slug, voice) {
  const safeSlug = String(slug || 'untitled')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
  const safeVoice = String(voice || 'default')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
  const fileName = `blog_audio_${safeSlug}_${safeVoice}_${Date.now()}.mp3`;
  const tmpPath = path.join(os.tmpdir(), fileName);

  fs.writeFileSync(tmpPath, mp3Buffer);

  try {
    const uploadResult = await strapi.plugins['upload'].services.upload.upload({
      data: { path: 'audio' },
      files: {
        filepath: tmpPath,
        originalFilename: fileName,
        mimetype: 'audio/mpeg',
        size: mp3Buffer.length,
      },
    });

    if (uploadResult && uploadResult.length > 0) {
      const file = uploadResult[0];
      strapi.log.info(`[Blog TTS] Uploaded audio "${fileName}" (id=${file.id})`);
      return { url: file.url, uploadId: file.id };
    }

    strapi.log.warn('[Blog TTS] Upload returned empty result.');
    return null;
  } finally {
    try { fs.unlinkSync(tmpPath); } catch (_) { /* ignore */ }
  }
}

/**
 * Generate TTS audio for one voice, calling onProgress(progressObject) before
 * each chunk synthesis and before the upload step.
 *
 * @param {object}   client    - OpenAI client
 * @param {object}   blogData  - blog fields (Title, Summary, Description, slug)
 * @param {string}   fullText  - pre-built plain-text content
 * @param {string}   voice     - voice name (e.g. 'alloy')
 * @param {number}   voiceIdx  - 0-based index of this voice in the voices array
 * @param {number}   totalVoices - total number of voices being generated
 * @param {Function} [onProgress] - async (progressObj) => void
 */
async function generateAudioForVoice(client, blogData, fullText, voice, voiceIdx, totalVoices, onProgress) {
  const chunks = splitTextIntoChunks(fullText);
  const totalChunks = chunks.length;
  const currentVoice = voiceIdx + 1;

  strapi.log.info(
    `[Blog TTS] Generating voice=${voice} (${currentVoice}/${totalVoices}) for "${blogData.Title || 'untitled'}" ` +
    `(${fullText.length} chars, ${totalChunks} chunk(s))`
  );

  const mp3Buffers = [];
  for (let ci = 0; ci < chunks.length; ci++) {
    if (onProgress) {
      await onProgress({
        voice,
        currentVoice,
        totalVoices,
        chunk: ci + 1,
        totalChunks,
        message: `Voice "${voice}" (${currentVoice}/${totalVoices}) — chunk ${ci + 1} of ${totalChunks}`,
      }).catch(() => {});
    }
    const buf = await synthesizeChunk(client, chunks[ci], voice);
    mp3Buffers.push(buf);
  }

  if (onProgress) {
    await onProgress({
      voice,
      currentVoice,
      totalVoices,
      chunk: totalChunks,
      totalChunks,
      message: `Uploading audio for voice "${voice}"...`,
    }).catch(() => {});
  }

  const combinedMp3 = Buffer.concat(mp3Buffers);
  const uploaded = await uploadMp3ToStrapi(combinedMp3, blogData.slug, voice);
  if (!uploaded?.url) return null;

  return {
    provider: 'openai',
    voice,
    label: `OpenAI — ${buildAudioLabel(voice)}`,
    url: uploaded.url,
    uploadId: uploaded.uploadId,
  };
}

/**
 * Generate audio for all configured voices, reporting chunk-level progress via
 * the optional onProgress callback.  Never throws — returns { variants: [] } on failure.
 *
 * @param {object}   blogData   - blog fields
 * @param {Function} [onProgress] - async ({ voice, currentVoice, totalVoices, chunk, totalChunks, message }) => void
 */
async function generateBlogAudiosWithProgress(blogData, onProgress) {
  try {
    const client = getOpenAIClient();
    if (!client) {
      strapi.log.warn('[Blog TTS] OPENAI_API_KEY not configured — cannot generate audio.');
      return { variants: [] };
    }

    const fullText = buildTtsInputText(blogData);
    if (!fullText) {
      strapi.log.warn('[Blog TTS] No text content found for TTS generation.');
      return { variants: [] };
    }

    const voices = getVoices();
    const totalVoices = voices.length;
    const variants = [];

    for (let vi = 0; vi < voices.length; vi++) {
      const voice = voices[vi];
      try {
        const variant = await generateAudioForVoice(
          client, blogData, fullText, voice, vi, totalVoices, onProgress
        );
        if (variant) variants.push(variant);
      } catch (err) {
        strapi.log.error(`[Blog TTS] Voice "${voice}" failed: ${err.message}`);
      }
    }

    return { variants };
  } catch (err) {
    strapi.log.error(`[Blog TTS] Audio generation failed: ${err.message}`);
    return { variants: [] };
  }
}

/** Convenience wrapper — no progress reporting (kept for any remaining callers). */
async function generateBlogAudios(blogData) {
  return generateBlogAudiosWithProgress(blogData, null);
}

/**
 * Delete previously generated OpenAI audio upload files from the media library / S3.
 * Only removes variants with provider === 'openai' (or no provider set, for backward compat).
 * Safe to call with an entry that has no audioVariants.
 */
async function deletePreviousBlogAudioUploads(existing) {
  if (!existing) return;
  const uploadService = strapi.plugins['upload'].services.upload;
  const ids = new Set();
  if (Array.isArray(existing.audioVariants)) {
    for (const v of existing.audioVariants) {
      if (v?.provider && v.provider !== 'openai') continue;
      const id = v?.uploadId ?? v?.fileId;
      if (typeof id === 'number' || typeof id === 'string') ids.add(Number(id));
    }
  }
  for (const id of ids) {
    if (!Number.isFinite(id)) continue;
    try {
      const file = await uploadService.findOne(id);
      if (file) {
        await uploadService.remove(file);
        strapi.log.info(`[Blog TTS] Removed previous OpenAI upload file id=${id}`);
      }
    } catch (err) {
      strapi.log.warn(`[Blog TTS] Failed removing previous upload id=${id}: ${err.message}`);
    }
  }
}

module.exports = {
  generateBlogAudios,
  generateBlogAudiosWithProgress,
  deletePreviousBlogAudioUploads,
  buildTtsInputText,
  extractDescriptionHtml,
  stripHtmlToPlainText,
};
