'use strict';

/**
 * Figures for the Zuse CMS dashboard: entries per type by status, edits per
 * day (from the activity log) and, for Admins, enquiries per week. Counts
 * only — no names or personal details — so every CMS role can see them,
 * except the leads figures, which need Admin.
 */

const types = require('../config/types');
const { ADMIN_TYPES, atLeast } = require('../utils/roles');

const DAY_MS = 86400000;
const ACTIVITY_DAYS = 30;
const LEAD_WEEKS = 12;

/** "2026-10-05" for a moment, in the given time zone. */
function dayKey(date, timeZone) {
  try {
    return new Intl.DateTimeFormat('en-CA', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  } catch {
    return new Intl.DateTimeFormat('en-CA', { timeZone: 'UTC', year: 'numeric', month: '2-digit', day: '2-digit' }).format(date);
  }
}

/** The last `count` days as keys, oldest first, ending today in the time zone. */
function lastDays(count, timeZone, now = new Date()) {
  return Array.from({ length: count }, (_, index) => dayKey(new Date(now.getTime() - (count - 1 - index) * DAY_MS), timeZone));
}

const isNewer = (a, b) => new Date(a).getTime() > new Date(b).getTime();

module.exports = ({ strapi }) => ({
  async get(user, { timeZone = 'UTC' } = {}) {
    const admin = atLeast(user, 'admin');
    const now = new Date();

    // ── Entries per collection type: published, modified (live with unpublished changes), draft (never published).
    const content = [];
    for (const [slug, config] of Object.entries(types)) {
      const schema = strapi.getModel(config.uid);
      if (!schema || schema.kind !== 'collectionType') continue;
      if (ADMIN_TYPES.includes(slug) && !admin) continue;
      const documents = strapi.documents(config.uid);
      const draftAndPublish = Boolean(schema.options && schema.options.draftAndPublish);
      if (!draftAndPublish) {
        const total = await documents.count({});
        content.push({ slug, label: schema.info.displayName, published: total, modified: 0, draft: 0 });
        continue;
      }
      const [drafts, published] = await Promise.all([
        documents.findMany({ status: 'draft', fields: ['documentId', 'updatedAt'] }),
        documents.findMany({ status: 'published', fields: ['documentId', 'updatedAt'] }),
      ]);
      const live = new Map(published.map((entry) => [entry.documentId, entry.updatedAt]));
      const counts = { published: 0, modified: 0, draft: 0 };
      for (const entry of drafts) {
        if (!live.has(entry.documentId)) counts.draft++;
        else if (isNewer(entry.updatedAt, live.get(entry.documentId))) counts.modified++;
        else counts.published++;
      }
      content.push({ slug, label: schema.info.displayName, ...counts });
    }

    // ── Edits per day (every CMS change: saves, publishes, uploads…; repeated autosaves count individually).
    const days = lastDays(ACTIVITY_DAYS * 2, timeZone, now);
    const perDay = new Map(days.map((day) => [day, 0]));
    const activity = await strapi.db.query('api::cms-activity.cms-activity').findMany({
      where: { updatedAt: { $gte: new Date(now.getTime() - (ACTIVITY_DAYS * 2 + 1) * DAY_MS) } },
      select: ['updatedAt', 'count'],
      limit: 20000,
    });
    for (const row of activity) {
      const key = dayKey(new Date(row.updatedAt), timeZone);
      if (perDay.has(key)) perDay.set(key, perDay.get(key) + (row.count || 1));
    }
    const series = days.map((day) => ({ day, count: perDay.get(day) }));

    // ── Leads (Admins): enquiries per week, and new subscribers.
    let leads = null;
    if (admin) {
      const since = new Date(now.getTime() - LEAD_WEEKS * 7 * DAY_MS);
      const [submissions, subscribers] = await Promise.all([
        strapi.db.query('plugin::ezforms.submission').findMany({ where: { createdAt: { $gte: since } }, select: ['createdAt'], limit: 20000 }),
        strapi.db.query('api::subscriber.subscriber').findMany({ where: { createdAt: { $gte: new Date(now.getTime() - 14 * DAY_MS) }, publishedAt: { $notNull: true } }, select: ['createdAt'], limit: 20000 }),
      ]);
      // Weeks end today: week 0 is the last 7 days.
      const weeks = Array.from({ length: LEAD_WEEKS }, (_, index) => {
        const end = new Date(now.getTime() - (LEAD_WEEKS - 1 - index) * 7 * DAY_MS);
        return { start: dayKey(new Date(end.getTime() - 6 * DAY_MS), timeZone), end: dayKey(end, timeZone), count: 0 };
      });
      for (const row of submissions) {
        const age = Math.floor((now.getTime() - new Date(row.createdAt).getTime()) / (7 * DAY_MS));
        const slot = LEAD_WEEKS - 1 - age;
        if (slot >= 0 && slot < LEAD_WEEKS) weeks[slot].count++;
      }
      const inLast = (rows, from, to) => rows.filter((row) => {
        const age = now.getTime() - new Date(row.createdAt).getTime();
        return age >= from * DAY_MS && age < to * DAY_MS;
      }).length;
      leads = {
        weeks,
        enquiries7: inLast(submissions, 0, 7),
        enquiriesPrev7: inLast(submissions, 7, 14),
        subscribers7: inLast(subscribers, 0, 7),
        subscribersPrev7: inLast(subscribers, 7, 14),
      };
    }

    return {
      timeZone,
      content,
      activity: { days: series.slice(-ACTIVITY_DAYS), previous: series.slice(0, ACTIVITY_DAYS) },
      leads,
    };
  },
});

module.exports.dayKey = dayKey;
module.exports.lastDays = lastDays;
