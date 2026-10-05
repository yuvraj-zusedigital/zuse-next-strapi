'use strict';

/**
 * CMS accounts (users-permissions users with a Zuse CMS role).
 *
 * Who may manage whom: Super Admins manage every account; Admins manage
 * Editor accounts only (create, block, reset password) and can't promote
 * anyone. Nobody can change their own role or block themselves, and there is
 * always at least one active Super Admin.
 */

const { errors } = require('@strapi/utils');
const { CMS_ROLES, userRole } = require('../utils/roles');

const UID = 'plugin::users-permissions.user';
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD = 8;

const toAccount = (user) => ({
  id: user.id,
  username: user.username,
  email: user.email,
  blocked: Boolean(user.blocked),
  role: user.role ? { type: user.role.type, name: user.role.name } : null,
  createdAt: user.createdAt,
});

/** Can `actor` manage an account whose role is `roleType`? */
const canManage = (actor, roleType) => {
  const role = userRole(actor);
  if (role === 'super-admin') return CMS_ROLES.includes(roleType);
  if (role === 'admin') return roleType === 'editor';
  return false;
};

module.exports = ({ strapi }) => {
  const users = () => strapi.db.query(UID);
  const roleByType = async (type) => {
    const role = CMS_ROLES.includes(type) && (await strapi.db.query('plugin::users-permissions.role').findOne({ where: { type } }));
    if (!role) throw new errors.ValidationError('Unknown role.');
    return role;
  };
  const checkPassword = (password) => {
    if (typeof password !== 'string' || password.length < MIN_PASSWORD) {
      throw new errors.ValidationError(`Password must be at least ${MIN_PASSWORD} characters.`);
    }
  };

  return {
    canManage,

    async list() {
      const rows = await users().findMany({
        where: { role: { type: { $in: CMS_ROLES } } },
        populate: ['role'],
        orderBy: { email: 'asc' },
      });
      return rows.map(toAccount);
    },

    async create(actor, { email, password, role: roleType } = {}) {
      const address = typeof email === 'string' ? email.trim().toLowerCase() : '';
      if (!EMAIL.test(address)) throw new errors.ValidationError('Enter a valid email address.');
      checkPassword(password);
      if (!canManage(actor, roleType)) throw new errors.ForbiddenError("You can't create accounts with this role.");

      const taken = await users().findOne({ where: { $or: [{ email: address }, { username: address }] } });
      if (taken) throw new errors.ValidationError('An account with this email already exists.');

      const role = await roleByType(roleType);
      const created = await strapi.plugin('users-permissions').service('user').add({
        username: address,
        email: address,
        password,
        provider: 'local',
        confirmed: true,
        blocked: false,
        role: role.id,
      });
      return toAccount({ ...created, role });
    },

    /** changes: { role?, blocked?, password? } */
    async update(actor, id, changes = {}) {
      const target = await users().findOne({ where: { id }, populate: ['role'] });
      if (!target || !CMS_ROLES.includes(userRole(target))) throw new errors.NotFoundError('Account not found.');
      const self = target.id === actor.id;

      if (!self && !canManage(actor, userRole(target))) throw new errors.ForbiddenError("You can't manage this account.");

      const data = {};
      if (changes.role !== undefined && changes.role !== userRole(target)) {
        if (self) throw new errors.ForbiddenError("You can't change your own role.");
        if (!canManage(actor, changes.role)) throw new errors.ForbiddenError("You can't give this role.");
        data.role = (await roleByType(changes.role)).id;
      }
      if (changes.blocked !== undefined && Boolean(changes.blocked) !== Boolean(target.blocked)) {
        if (self) throw new errors.ForbiddenError("You can't deactivate your own account.");
        data.blocked = Boolean(changes.blocked);
      }
      if (changes.password !== undefined) {
        checkPassword(changes.password);
        data.password = changes.password;
      }
      if (!Object.keys(data).length) return toAccount(target);

      // Keep at least one active Super Admin.
      const losesSuperAdmin = userRole(target) === 'super-admin' && !target.blocked && (data.role !== undefined || data.blocked === true);
      if (losesSuperAdmin) {
        const others = await users().count({ where: { id: { $ne: target.id }, blocked: false, role: { type: 'super-admin' } } });
        if (!others) throw new errors.ValidationError('There must be at least one active Super Admin.');
      }

      await strapi.plugin('users-permissions').service('user').edit(target.id, data);
      return toAccount(await users().findOne({ where: { id: target.id }, populate: ['role'] }));
    },
  };
};
