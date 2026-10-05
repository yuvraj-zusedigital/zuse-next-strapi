'use strict';

/** Read-only for the site (its API token); editing happens in the Zuse CMS. */
const { createCoreRouter } = require('@strapi/strapi').factories;

module.exports = createCoreRouter('api::text-snippet.text-snippet', { only: ['find', 'findOne'] });
