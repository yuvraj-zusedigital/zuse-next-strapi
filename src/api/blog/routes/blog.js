'use strict';

/**
 * blog router
 *
 * Standard CRUD routes. We list routes explicitly rather than spreading
 * createCoreRouter().routes because that getter requires Strapi to be fully
 * initialized (triggers at module load time before Strapi is ready).
 *
 * The AI summary and text-to-speech actions (in the blog controller) are not
 * public: the Strapi admin side panels reach them through admin-only routes
 * (src/plugins/blog-tools) and the Zuse CMS through /api/cms/blogs/... They
 * used to be here with `auth: false`, which let anyone trigger paid OpenAI and
 * ElevenLabs calls.
 */

module.exports = {
  routes: [
    { method: 'GET',    path: '/blogs',     handler: 'blog.find',    config: { policies: [] } },
    { method: 'GET',    path: '/blogs/:id', handler: 'blog.findOne', config: { policies: [] } },
    { method: 'POST',   path: '/blogs',     handler: 'blog.create',  config: { policies: [] } },
    { method: 'PUT',    path: '/blogs/:id', handler: 'blog.update',  config: { policies: [] } },
    { method: 'DELETE', path: '/blogs/:id', handler: 'blog.delete',  config: { policies: [] } },
  ],
};
