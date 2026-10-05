'use strict';

/**
 * Creates (or changes the role of) a Zuse CMS account. Use it for the first
 * Super Admin; after that, Admins and Super Admins manage accounts in the CMS
 * (Users page).
 *
 *   CMS_EDITOR_EMAIL=jane@zusedigital.com CMS_EDITOR_PASSWORD='…' [CMS_ROLE=super-admin] npm run cms:create-editor
 *
 * CMS_ROLE: editor (default), admin or super-admin. An existing user with that
 * email gets the role; their password is only changed when
 * CMS_EDITOR_RESET_PASSWORD=1 (CMS_EDITOR_PASSWORD may then be left out
 * otherwise).
 */

const { createStrapi, compileStrapi } = require('@strapi/strapi');
const { ROLES } = require('../src/api/cms/utils/roles');

async function main() {
  const email = (process.env.CMS_EDITOR_EMAIL || '').trim().toLowerCase();
  const password = process.env.CMS_EDITOR_PASSWORD || '';
  const roleDef = ROLES.find((role) => role.type === (process.env.CMS_ROLE || 'editor'));
  if (!roleDef) {
    console.error(`CMS_ROLE must be one of: ${ROLES.map((role) => role.type).join(', ')}.`);
    process.exit(1);
  }
  if (!email) {
    console.error('Set CMS_EDITOR_EMAIL (and CMS_EDITOR_PASSWORD, 8+ characters, for a new account).');
    process.exit(1);
  }

  const app = await createStrapi(await compileStrapi()).load();
  app.log.level = 'error';

  try {
    const role = await app.db.query('plugin::users-permissions.role').findOne({ where: { type: roleDef.type } });
    if (!role) throw new Error(`Role "${roleDef.name}" not found — start Strapi once so it's created.`);
    const users = app.plugin('users-permissions').service('user');
    const existing = await app.db.query('plugin::users-permissions.user').findOne({ where: { email } });

    if (existing) {
      const changes = { role: role.id };
      if (process.env.CMS_EDITOR_RESET_PASSWORD === '1') {
        if (password.length < 8) throw new Error('CMS_EDITOR_PASSWORD must be 8+ characters.');
        changes.password = password;
      }
      await users.edit(existing.id, changes);
      console.log(`Updated ${email}: role ${roleDef.name}${changes.password ? ', password reset' : ''}.`);
    } else {
      if (password.length < 8) throw new Error('CMS_EDITOR_PASSWORD must be 8+ characters.');
      await users.add({
        username: email,
        email,
        password,
        provider: 'local',
        confirmed: true,
        blocked: false,
        role: role.id,
      });
      console.log(`Created ${roleDef.name} ${email}.`);
    }
  } finally {
    await app.destroy();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
