'use strict';

/**
 * Audit log for the Zuse CMS: who changed what, and when
 * (api::cms-activity.cms-activity). Strapi's own createdBy/updatedBy only
 * track admin users, so CMS editors would otherwise leave no trace.
 */

const UID = 'api::cms-activity.cms-activity';

// Autosave saves every few seconds; fold repeated saves of one entry by one
// person into a single line instead of hundreds.
const MERGE_WINDOW_MS = 10 * 60 * 1000;
const RETENTION_DAYS = 365;

const toItem = ({ action, targetType, targetId, title, userEmail, count, updatedAt }) => ({
  action,
  targetType,
  targetId,
  title,
  userEmail,
  count: count || 1,
  at: updatedAt,
});

module.exports = ({ strapi }) => ({
  /** Never throws: a failed log write must not fail the edit itself. */
  async record(user, { action, targetType, targetId = null, title = null }) {
    try {
      const entries = strapi.documents(UID);
      const who = { userId: user ? user.id : null, userEmail: user ? user.email : null };

      if (action === 'update') {
        const [last] = await entries.findMany({
          filters: { action, targetType, targetId, userId: who.userId },
          sort: { updatedAt: 'desc' },
          limit: 1,
        });
        if (last && Date.now() - new Date(last.updatedAt).getTime() < MERGE_WINDOW_MS) {
          await entries.update({
            documentId: last.documentId,
            data: { count: (last.count || 1) + 1, title: title || last.title },
          });
          return;
        }
      }

      await entries.create({ data: { action, targetType, targetId, title, ...who, count: 1 } });
    } catch (error) {
      strapi.log.warn(`[cms] Couldn't record activity (${action} ${targetType} ${targetId}): ${error.message}`);
    }
  },

  /** Filtered, paginated log: { data, meta: { pagination } }. */
  async page({ targetType, targetId, action, userEmail, page = 1, pageSize = 25 } = {}) {
    const filters = {};
    if (targetType) filters.targetType = targetType;
    if (targetId) filters.targetId = targetId;
    if (action) filters.action = action;
    if (userEmail) filters.userEmail = userEmail;
    const size = Math.min(100, Math.max(1, parseInt(pageSize, 10) || 25));
    const current = Math.max(1, parseInt(page, 10) || 1);
    const [rows, total] = await Promise.all([
      strapi.documents(UID).findMany({ filters, sort: { updatedAt: 'desc' }, limit: size, start: (current - 1) * size }),
      strapi.documents(UID).count({ filters }),
    ]);
    return {
      data: rows.map(toItem),
      meta: { pagination: { page: current, pageSize: size, total, pageCount: Math.max(1, Math.ceil(total / size)) } },
    };
  },

  /** People who appear in the log (for filtering). */
  async people() {
    const rows = await strapi.db.connection(strapi.db.metadata.get(UID).tableName).distinct('user_email').whereNotNull('user_email');
    return rows.map((row) => row.user_email).sort();
  },

  async list({ targetType, targetId, limit = 20 } = {}) {
    const filters = {};
    if (targetType) filters.targetType = targetType;
    if (targetId) filters.targetId = targetId;
    const rows = await strapi.documents(UID).findMany({
      filters,
      sort: { updatedAt: 'desc' },
      limit: Math.min(100, Math.max(1, parseInt(limit, 10) || 20)),
    });
    return rows.map(toItem);
  },

  /** Drops entries older than the retention period (runs at boot). */
  async prune() {
    const cutoff = new Date(Date.now() - RETENTION_DAYS * 24 * 60 * 60 * 1000).toISOString();
    const { count } = await strapi.db.query(UID).deleteMany({ where: { updatedAt: { $lt: cutoff } } });
    if (count) strapi.log.info(`[cms] Pruned ${count} activity entries older than ${RETENTION_DAYS} days.`);
  },
});
