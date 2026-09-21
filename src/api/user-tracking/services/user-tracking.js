'use strict';

/**
 * user-tracking service
 */

const { createCoreService } = require('@strapi/strapi').factories;

module.exports = createCoreService('api::user-tracking.user-tracking');
