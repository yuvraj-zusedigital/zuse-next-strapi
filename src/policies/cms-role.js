'use strict';

const { atLeast } = require('../api/cms/utils/roles');

/**
 * Allows a request only from a users-permissions user with a Zuse CMS role at
 * least `config.min` (default "editor"; see src/api/cms/utils/roles.js). API
 * tokens and the default Authenticated role (which anyone can get through
 * public registration) are rejected.
 *
 *   policies: [{ name: 'global::cms-role', config: { min: 'admin' } }]
 */
module.exports = (policyContext, config = {}) => atLeast(policyContext.state.user, config.min || 'editor');
