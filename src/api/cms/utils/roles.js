'use strict';

/**
 * Zuse CMS roles (users-permissions roles, by `type`), lowest to highest.
 * Each role can do everything the roles below it can:
 *
 * - editor:      edit content and media, save drafts, publish/unpublish.
 * - admin:       + delete entries and files, site settings, activity log,
 *                  and manage Editor accounts.
 * - super-admin: + manage every account, including Admins and Super Admins.
 */
const ROLES = [
  { type: 'editor', name: 'Editor', description: 'Zuse CMS: edits and publishes content.' },
  { type: 'admin', name: 'Admin', description: 'Zuse CMS: editor rights plus deleting, site settings, activity log and managing editors.' },
  { type: 'super-admin', name: 'Super Admin', description: 'Zuse CMS: full access, including managing admins.' },
];

const CMS_ROLES = ROLES.map((role) => role.type);

/** 0 for users without a CMS role. */
const rankOf = (roleType) => CMS_ROLES.indexOf(roleType) + 1;

const userRole = (user) => (user && user.role && user.role.type) || null;

/** True when the user's role is `min` or higher. */
const atLeast = (user, min) => rankOf(userRole(user)) >= rankOf(min) && rankOf(min) > 0;

/** Content types only Admins and up may read or change (site-wide settings). */
const ADMIN_TYPES = ['global', 'organization-setting', 'text-snippet'];

module.exports = { ROLES, CMS_ROLES, rankOf, userRole, atLeast, ADMIN_TYPES };
