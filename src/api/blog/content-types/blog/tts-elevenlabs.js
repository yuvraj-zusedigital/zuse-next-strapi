'use strict';

const os = require('os');
const fs = require('fs');
const path = require('path');

const ELEVENLABS_MODEL = process.env.ELEVENLABS_TTS_MODEL || 'eleven_flash_v2_5';
const MAX_INPUT_CHARS = 5000;

function getElevenLabsClient() {
  const apiKey = process.env.ELEVENLABS_API_KEY;
  if (!apiKey || apiKey === 'tobemodified' || apiKey.startsWith('REPLACE')) {
    return null;
  }
  const { ElevenLabsClient } = require('@elevenlabs/elevenlabs-js');
  return new ElevenLabsClient({ apiKey });
}

function getElevenLabsVoices() {
  const fromEnv = String(process.env.ELEVENLABS_TTS_VOICES || '')
    .split(',')
    .map((v) => v.trim())
    .filter(Boolean);

  if (fromEnv.length > 0) {
    return fromEnv.map((entry) => {
      const [id, name] = entry.includes(':') ? entry.split(':', 2) : [entry, null];
      return { id: id.trim(), name: name ? name.trim() : id.trim() };
    });
  }

  const singleId = process.env.ELEVENLABS_TTS_VOICE_ID;
  if (singleId) {
    return [{ id: singleId, name: process.env.ELEVENLABS_TTS_VOICE_NAME || 'Zanyar' }];
  }

  return [{ id: 'lvYhUBHpuhrdIcG0uqtH', name: 'Zanyar' }];
}

function buildAudioLabel(voiceName) {
  if (!voiceName) return 'ElevenLabs Audio';
  return voiceName.charAt(0).toUpperCase() + voiceName.slice(1);
}

const { buildTtsInputText } = require('./tts-openai');

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
 * Collect a Readable stream into a Buffer.
 */
async function streamToBuffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

/**
 * Call the ElevenLabs SDK to synthesize a single text chunk.
 * Returns an MP3 Buffer.
 */
async function synthesizeChunk(client, text, voiceId) {
  const audio = await client.textToSpeech.convert(voiceId, {
    text,
    modelId: ELEVENLABS_MODEL,
    outputFormat: 'mp3_44100_128',
    voiceSettings: {
      stability: 0.5,
      similarityBoost: 0.75,
      style: 0.0,
      useSpeakerBoost: true,
    },
  });

  return streamToBuffer(audio);
}

async function uploadMp3ToStrapi(mp3Buffer, slug, voiceName) {
  const safeSlug = String(slug || 'untitled')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
  const safeVoice = String(voiceName || 'default')
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .toLowerCase();
  const fileName = `blog_audio_elevenlabs_${safeSlug}_${safeVoice}_${Date.now()}.mp3`;
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
      strapi.log.info(`[Blog TTS ElevenLabs] Uploaded audio "${fileName}" (id=${file.id})`);
      return { url: file.url, uploadId: file.id };
    }

    strapi.log.warn('[Blog TTS ElevenLabs] Upload returned empty result.');
    return null;
  } finally {
    try { fs.unlinkSync(tmpPath); } catch (_) { /* ignore */ }
  }
}

async function generateAudioForVoice(client, blogData, fullText, voice, voiceIdx, totalVoices, onProgress) {
  const chunks = splitTextIntoChunks(fullText);
  const totalChunks = chunks.length;
  const currentVoice = voiceIdx + 1;

  strapi.log.info(
    `[Blog TTS ElevenLabs] Generating voice="${voice.name}" id=${voice.id} (${currentVoice}/${totalVoices}) for "${blogData.Title || 'untitled'}" ` +
    `(${fullText.length} chars, ${totalChunks} chunk(s))`
  );

  const mp3Buffers = [];
  for (let ci = 0; ci < chunks.length; ci++) {
    if (onProgress) {
      await onProgress({
        provider: 'elevenlabs',
        voice: voice.name,
        currentVoice,
        totalVoices,
        chunk: ci + 1,
        totalChunks,
        message: `ElevenLabs "${voice.name}" (${currentVoice}/${totalVoices}) — chunk ${ci + 1} of ${totalChunks}`,
      }).catch(() => {});
    }
    const buf = await synthesizeChunk(client, chunks[ci], voice.id);
    mp3Buffers.push(buf);
  }

  if (onProgress) {
    await onProgress({
      provider: 'elevenlabs',
      voice: voice.name,
      currentVoice,
      totalVoices,
      chunk: totalChunks,
      totalChunks,
      message: `Uploading ElevenLabs audio for voice "${voice.name}"...`,
    }).catch(() => {});
  }

  const combinedMp3 = Buffer.concat(mp3Buffers);
  const uploaded = await uploadMp3ToStrapi(combinedMp3, blogData.slug, voice.name);
  if (!uploaded?.url) return null;

  return {
    provider: 'elevenlabs',
    voice: voice.name,
    voiceId: voice.id,
    label: `ElevenLabs — ${buildAudioLabel(voice.name)}`,
    url: uploaded.url,
    uploadId: uploaded.uploadId,
  };
}

async function generateElevenLabsAudiosWithProgress(blogData, onProgress) {
  try {
    const client = getElevenLabsClient();
    if (!client) {
      strapi.log.warn('[Blog TTS ElevenLabs] ELEVENLABS_API_KEY not configured — cannot generate audio.');
      return { variants: [], reason: 'missing_api_key' };
    }

    const fullText = buildTtsInputText(blogData);
    if (!fullText) {
      strapi.log.warn('[Blog TTS ElevenLabs] No text content found for TTS generation.');
      return { variants: [], reason: 'no_text' };
    }

    const voices = getElevenLabsVoices();
    const totalVoices = voices.length;
    const variants = [];
    let lastVoiceError = null;

    for (let vi = 0; vi < voices.length; vi++) {
      const voice = voices[vi];
      try {
        const variant = await generateAudioForVoice(
          client, blogData, fullText, voice, vi, totalVoices, onProgress
        );
        if (variant) variants.push(variant);
      } catch (err) {
        lastVoiceError = err;
        strapi.log.error(`[Blog TTS ElevenLabs] Voice "${voice.name}" (${voice.id}) failed: ${err.message}`);
      }
    }

    if (variants.length === 0 && voices.length > 0) {
      return {
        variants: [],
        reason: 'all_voices_failed',
        detail: lastVoiceError?.message || 'Every configured voice failed or upload returned no URL.',
      };
    }

    return { variants };
  } catch (err) {
    strapi.log.error(`[Blog TTS ElevenLabs] Audio generation failed: ${err.message}`);
    return { variants: [], reason: 'unexpected', detail: err.message };
  }
}

/**
 * Remove Strapi upload files for the given ElevenLabs variant rows only.
 */
async function deleteElevenLabsUploadsFromVariants(variants) {
  if (!Array.isArray(variants) || variants.length === 0) return;
  const uploadService = strapi.plugins['upload'].services.upload;
  const ids = new Set();
  for (const v of variants) {
    if (v?.provider !== 'elevenlabs') continue;
    const id = v?.uploadId ?? v?.fileId;
    if (typeof id === 'number' || typeof id === 'string') ids.add(Number(id));
  }
  for (const id of ids) {
    if (!Number.isFinite(id)) continue;
    try {
      const file = await uploadService.findOne(id);
      if (file) {
        await uploadService.remove(file);
        strapi.log.info(`[Blog TTS ElevenLabs] Removed previous upload file id=${id}`);
      }
    } catch (err) {
      strapi.log.warn(`[Blog TTS ElevenLabs] Failed removing previous upload id=${id}: ${err.message}`);
    }
  }
}

async function deleteElevenLabsAudioUploads(existing) {
  if (!existing) return;
  await deleteElevenLabsUploadsFromVariants(existing.audioVariants);
}

module.exports = {
  generateElevenLabsAudiosWithProgress,
  deleteElevenLabsAudioUploads,
  deleteElevenLabsUploadsFromVariants,
};
