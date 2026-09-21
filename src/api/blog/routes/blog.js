'use strict';

/**
 * blog router
 *
 * Standard CRUD routes plus a custom action to trigger background TTS generation.
 * We list routes explicitly rather than spreading createCoreRouter().routes because
 * that getter requires Strapi to be fully initialized (triggers at module load time
 * before Strapi is ready).
 */

module.exports = {
  routes: [
    { method: 'GET',    path: '/blogs',     handler: 'blog.find',    config: { policies: [] } },
    { method: 'GET',    path: '/blogs/:id', handler: 'blog.findOne', config: { policies: [] } },
    { method: 'POST',   path: '/blogs',     handler: 'blog.create',  config: { policies: [] } },
    { method: 'PUT',    path: '/blogs/:id', handler: 'blog.update',  config: { policies: [] } },
    { method: 'DELETE', path: '/blogs/:id', handler: 'blog.delete',  config: { policies: [] } },
    {
      method: 'GET',
      path: '/blogs/:id/audio-status',
      handler: 'blog.getAudioStatus',
      config: {
        // auth: false — the admin panel polls this to show live TTS progress.
        // The admin JWT is not accepted by the content API, so auth must be off.
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/blogs/:id/generate-audio',
      handler: 'blog.generateAudio',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/blogs/:id/generate-audio-elevenlabs',
      handler: 'blog.generateAudioElevenLabs',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'GET',
      path: '/blogs/:id/ai-summary',
      handler: 'blog.getSummary',
      config: {
        auth: false,
        policies: [],
      },
    },
    {
      method: 'POST',
      path: '/blogs/:id/generate-summary',
      handler: 'blog.generateSummary',
      config: {
        auth: false,
        policies: [],
      },
    },
  ],
};
