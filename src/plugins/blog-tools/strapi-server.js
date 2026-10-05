'use strict';

/**
 * Admin-only routes behind the Strapi admin's blog side panels
 * (src/admin/sidepanels). They replace the old unauthenticated
 * /api/blogs/:id/... routes, which let anyone trigger paid OpenAI and
 * ElevenLabs calls. Served at /blog-tools/... and require an admin session.
 *
 * The work itself stays in the blog controller; the Zuse CMS reaches the same
 * actions through /api/cms/blogs/... (src/api/cms).
 */

const blog = (strapi) => strapi.controller('api::blog.blog');

// :id may be the numeric id (what the side panels have) or a documentId.
const delegate = (action) => async (ctx) => blog(strapi)[action](ctx);

const config = { policies: ['admin::isAuthenticatedAdmin'] };

module.exports = {
  controllers: {
    blog: {
      audioStatus: delegate('getAudioStatus'),
      generateAudioOpenAi: delegate('generateAudio'),
      generateAudioElevenLabs: delegate('generateAudioElevenLabs'),
      summary: delegate('getSummary'),
      generateSummary: delegate('generateSummary'),
    },
  },
  routes: {
    admin: {
      type: 'admin',
      routes: [
        { method: 'GET', path: '/blogs/:id/audio-status', handler: 'blog.audioStatus', config },
        { method: 'POST', path: '/blogs/:id/generate-audio', handler: 'blog.generateAudioOpenAi', config },
        { method: 'POST', path: '/blogs/:id/generate-audio-elevenlabs', handler: 'blog.generateAudioElevenLabs', config },
        { method: 'GET', path: '/blogs/:id/ai-summary', handler: 'blog.summary', config },
        { method: 'POST', path: '/blogs/:id/generate-summary', handler: 'blog.generateSummary', config },
      ],
    },
  },
};
