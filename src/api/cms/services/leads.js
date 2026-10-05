'use strict';

/**
 * Leads for the Zuse CMS (Admins only — they hold personal data):
 *   submissions  contact-form entries (ezforms plugin, POST /api/ezforms/submit)
 *   subscribers  blog newsletter sign-ups (same endpoint, formName "sub")
 *   tracking     the pages a visitor viewed before submitting (linked to a submission)
 *
 * Read and delete only: these are written by the website's forms, never edited.
 */

const { errors } = require('@strapi/utils');

const MAX_PAGE_SIZE = 100;

const KINDS = {
  submissions: {
    uid: 'plugin::ezforms.submission',
    search: ['email', 'FirstName', 'LastName', 'phoneNumber', 'message', 'budget'],
    populate: { user_trackings: true },
  },
  subscribers: {
    uid: 'api::subscriber.subscriber',
    search: ['email', 'FirstName', 'LastName'],
    // Draft & publish is on for this type; the form creates published rows.
    where: { publishedAt: { $notNull: true } },
  },
  tracking: {
    uid: 'api::user-tracking.user-tracking',
    search: ['email'],
    populate: { form_submission: { select: ['id', 'FirstName', 'LastName', 'email'] } },
  },
};

const kindOf = (kind) => {
  const config = KINDS[kind];
  if (!config) throw new errors.NotFoundError('Unknown kind');
  return config;
};

const fullName = (row) => [row.FirstName, row.LastName].filter(Boolean).join(' ') || null;
const visits = (data) => (Array.isArray(data) ? data : data && Array.isArray(data.userTrackingData) ? data.userTrackingData : []);
const seconds = (list) => list.reduce((sum, item) => sum + (Number(item && item.totalTimeSpendInSec) || 0), 0);

/** One row of a list: just what the table shows. */
function summary(kind, row) {
  const base = { id: row.id, createdAt: row.createdAt, name: fullName(row), email: row.email || null };
  if (kind === 'submissions') {
    const journey = visits(row.data);
    return {
      ...base,
      formName: row.formName || null,
      phone: row.phoneNumber || null,
      budget: row.budget || null,
      location: row.Location || null,
      hearAboutUs: row.hearAboutUs || null,
      pages: journey.length,
      seconds: seconds(journey),
    };
  }
  if (kind === 'subscribers') {
    const journey = visits(row.data);
    return { ...base, location: row.Location || null, pages: journey.length, seconds: seconds(journey) };
  }
  const journey = visits(row.data);
  const submission = row.form_submission;
  return {
    ...base,
    pages: journey.length,
    seconds: seconds(journey),
    submission: submission ? { id: submission.id, name: fullName(submission) || submission.email } : null,
  };
}

module.exports = ({ strapi }) => ({
  kinds: Object.keys(KINDS),

  /** ?q= searches name/email (and phone, message, budget for submissions); newest first. */
  async list(kind, { q, page = 1, pageSize = 25 } = {}) {
    const config = kindOf(kind);
    page = Math.max(1, parseInt(page, 10) || 1);
    pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize, 10) || 25));

    const text = String(q || '').trim();
    const where = {
      ...(config.where || {}),
      ...(text ? { $or: config.search.map((field) => ({ [field]: { $containsi: text } })) } : {}),
    };
    const query = strapi.db.query(config.uid);
    const [rows, total] = await Promise.all([
      query.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        offset: (page - 1) * pageSize,
        limit: pageSize,
        populate: kind === 'tracking' ? config.populate : undefined,
      }),
      query.count({ where }),
    ]);

    return {
      data: rows.map((row) => summary(kind, row)),
      meta: { pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } },
    };
  },

  /** Everything about one lead, with its visitor journey. */
  async get(kind, id) {
    const config = kindOf(kind);
    const row = await strapi.db.query(config.uid).findOne({
      where: { id: Number(id), ...(config.where || {}) },
      populate: config.populate,
    });
    if (!row) throw new errors.NotFoundError('Not found');

    const { data, ...fields } = row;
    let journey = visits(data);
    // A submission's journey is stored on it and on its tracking row; prefer the tracking row.
    if (kind === 'submissions' && Array.isArray(row.user_trackings) && row.user_trackings.length) {
      const tracked = visits(row.user_trackings[0].data);
      if (tracked.length) journey = tracked;
    }
    return {
      data: {
        ...summary(kind, row),
        fields: Object.fromEntries(
          Object.entries(fields).filter(([key]) => !['user_trackings', 'form_submission', 'documentId', 'locale', 'publishedAt'].includes(key)),
        ),
        // The form's own payload (submissions): any field the site sends, even ones without a column.
        raw: kind === 'submissions' && data && typeof data === 'object' && !Array.isArray(data) ? { ...data, userTrackingData: undefined } : null,
        journey,
        trackingIds: kind === 'submissions' ? (row.user_trackings || []).map((item) => item.id) : [],
      },
    };
  },

  /** Deletes a lead; a submission's tracking rows go with it (they're the same person's data). */
  async remove(kind, id) {
    const config = kindOf(kind);
    const row = await strapi.db.query(config.uid).findOne({ where: { id: Number(id) }, populate: config.populate });
    if (!row) return null;
    if (kind === 'submissions' && Array.isArray(row.user_trackings) && row.user_trackings.length) {
      await strapi.db.query(KINDS.tracking.uid).deleteMany({ where: { id: { $in: row.user_trackings.map((item) => item.id) } } });
    }
    if (kind === 'subscribers' && row.documentId) {
      // Draft & publish keeps a draft and a published row per document: remove both.
      await strapi.db.query(config.uid).deleteMany({ where: { documentId: row.documentId } });
    } else {
      await strapi.db.query(config.uid).delete({ where: { id: row.id } });
    }
    return fullName(row) || row.email || `#${row.id}`;
  },
});
