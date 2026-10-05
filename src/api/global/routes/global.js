'use strict';

/**
 * global router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const deepPopulate = { name: 'global::deep-populate', config: { uid: 'api::global.global' } };

module.exports = createCoreRouter('api::global.global', {
  config: {
    find: { middlewares: [deepPopulate] },
  },
});
