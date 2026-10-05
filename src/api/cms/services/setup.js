'use strict';

/**
 * Ensures the Zuse CMS roles (Editor, Admin, Super Admin — see
 * utils/roles.js) exist and can call every /api/cms/* action. Runs on each
 * boot, so new CMS routes are granted automatically. What each role may do is
 * decided per route by the `global::cms-role` policy. Only these roles get CMS
 * actions — never Authenticated, which public registration hands out.
 */

const { ROLES } = require('../utils/roles');

const cmsActions = (strapi) =>
  Object.keys(strapi.controller('api::cms.cms')).map((action) => `api::cms.cms.${action}`);

module.exports = ({ strapi }) => ({
  async ensureRoles() {
    const roles = strapi.db.query('plugin::users-permissions.role');
    const permissions = strapi.db.query('plugin::users-permissions.permission');

    for (const definition of ROLES) {
      let role = await roles.findOne({ where: { type: definition.type } });
      if (!role) {
        role = await roles.create({ data: definition });
        strapi.log.info(`[cms] Created users-permissions role "${definition.name}".`);
      }

      const existing = await permissions.findMany({
        where: { role: role.id, action: { $startsWith: 'api::cms.' } },
      });
      const have = new Set(existing.map((permission) => permission.action));

      for (const action of cmsActions(strapi)) {
        if (!have.has(action)) {
          await permissions.create({ data: { action, role: role.id } });
          strapi.log.info(`[cms] Granted ${action} to ${definition.name}.`);
        }
      }
    }
  },
});
