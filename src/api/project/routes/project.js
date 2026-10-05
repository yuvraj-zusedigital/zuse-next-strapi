'use strict';

/**
 * project router
 */

const { createCoreRouter } = require('@strapi/strapi').factories;

const deepPopulate = { name: 'global::deep-populate', config: { uid: 'api::project.project' } };

module.exports = createCoreRouter('api::project.project', {
  config: {
    find: { middlewares: [deepPopulate] },
    findOne: { middlewares: [deepPopulate] },
  },
});
