'use strict';

/**
 * page router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const deepPopulate = { name: 'global::deep-populate', config: { uid: 'api::page.page' } };

module.exports = createCoreRouter('api::page.page', {
  config: {
    find: { middlewares: [deepPopulate] },
    findOne: { middlewares: [deepPopulate] },
  },
});
