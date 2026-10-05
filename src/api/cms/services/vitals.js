'use strict';

/**
 * Real-visitor speed (Core Web Vitals). The site's browsers report LCP, INP,
 * CLS, FCP and TTFB once per page view (zuse-site components/WebVitals.tsx):
 * just the page path, the values and phone/desktop — no IP, cookie or ID.
 * The CMS shows the 75th percentile per page, the figure Google uses.
 * Rows older than 90 days are removed.
 */

const { errors } = require('@strapi/utils');

const UID = 'api::web-vital.web-vital';
const RETENTION_DAYS = 90;
const MAX_ROWS = 50000;

/** Google's thresholds: good ≤ first, poor > second. Units: ms, CLS unitless. */
const THRESHOLDS = {
  LCP: [2500, 4000],
  INP: [200, 500],
  CLS: [0.1, 0.25],
  FCP: [1800, 3000],
  TTFB: [800, 1800],
};
const MAX_VALUE = { LCP: 120000, INP: 60000, CLS: 50, FCP: 120000, TTFB: 120000 };

const ratingOf = (metric, value) => {
  const [good, poor] = THRESHOLDS[metric];
  return value <= good ? 'good' : value <= poor ? 'needs-improvement' : 'poor';
};

/** "/About/?x=1#y" → "/about"; anything odd → null. */
function cleanPath(path) {
  if (typeof path !== 'string' || !path.startsWith('/')) return null;
  const bare = path.split(/[?#]/)[0].toLowerCase().replace(/\/{2,}/g, '/');
  const trimmed = bare.length > 1 ? bare.replace(/\/+$/, '') : bare;
  return /^\/[a-z0-9/_.-]*$/.test(trimmed) && trimmed.length <= 200 ? trimmed : null;
}

/** 75th percentile (nearest rank). */
function p75(values) {
  if (!values.length) return null;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.ceil(sorted.length * 0.75) - 1)];
}

function summarise(rows) {
  const out = {};
  for (const metric of Object.keys(THRESHOLDS)) {
    const values = rows.filter((row) => row.metric === metric).map((row) => row.value);
    const value = p75(values);
    out[metric] = { p75: value, rating: value === null ? null : ratingOf(metric, value), count: values.length };
  }
  return out;
}

const since = (days) => new Date(Date.now() - Math.min(Math.max(Number(days) || 28, 1), RETENTION_DAYS) * 86400000);

module.exports = ({ strapi }) => ({
  /** One page view's report: { path, device, metrics: [{ name, value }] }. Invalid parts are dropped. */
  async record(body) {
    let payload = body;
    if (typeof payload === 'string') {
      try {
        payload = JSON.parse(payload);
      } catch {
        throw new errors.ValidationError('Invalid JSON');
      }
    }
    const path = cleanPath(payload && payload.path);
    if (!path) throw new errors.ValidationError('Invalid path');
    const device = payload.device === 'mobile' ? 'mobile' : 'desktop';
    const seen = new Set();
    const rows = (Array.isArray(payload.metrics) ? payload.metrics.slice(0, 10) : [])
      .map((metric) => ({ metric: metric && metric.name, value: Number(metric && metric.value) }))
      .filter(({ metric, value }) => {
        if (!THRESHOLDS[metric] || seen.has(metric) || !Number.isFinite(value) || value < 0 || value > MAX_VALUE[metric]) return false;
        seen.add(metric);
        return true;
      });
    if (!rows.length) return 0;

    const query = strapi.db.query(UID);
    for (const { metric, value } of rows) {
      await query.create({ data: { path, device, metric, value: Math.round(value * 10000) / 10000, rating: ratingOf(metric, value) } });
    }
    // Now and then, drop rows past the retention period.
    if (Math.random() < 0.01) {
      await query.deleteMany({ where: { createdAt: { $lt: since(RETENTION_DAYS) } } }).catch(() => {});
    }
    return rows.length;
  },

  /** One page: p75 per metric over the last `days`, for all visitors, phones and desktops. */
  async page(path, days = 28) {
    const clean = cleanPath(path);
    if (!clean) throw new errors.ValidationError('Invalid path');
    const rows = await strapi.db.query(UID).findMany({
      where: { path: clean, createdAt: { $gte: since(days) } },
      select: ['metric', 'value', 'device'],
      orderBy: { createdAt: 'desc' },
      limit: MAX_ROWS,
    });
    return {
      path: clean,
      days: Number(days) || 28,
      thresholds: THRESHOLDS,
      all: summarise(rows),
      mobile: summarise(rows.filter((row) => row.device === 'mobile')),
      desktop: summarise(rows.filter((row) => row.device === 'desktop')),
    };
  },

  /** Every page with reports: p75 of LCP, INP and CLS and how many page views, slowest first. */
  async overview(days = 28, device = null) {
    const rows = await strapi.db.query(UID).findMany({
      where: { createdAt: { $gte: since(days) }, ...(device === 'mobile' || device === 'desktop' ? { device } : {}) },
      select: ['path', 'metric', 'value'],
      orderBy: { createdAt: 'desc' },
      limit: MAX_ROWS,
    });
    const byPath = new Map();
    for (const row of rows) {
      if (!byPath.has(row.path)) byPath.set(row.path, []);
      byPath.get(row.path).push(row);
    }
    const order = { poor: 0, 'needs-improvement': 1, good: 2, null: 3 };
    const pages = [...byPath].map(([path, list]) => {
      const summary = summarise(list);
      const ratings = ['LCP', 'INP', 'CLS'].map((metric) => summary[metric].rating).filter(Boolean);
      const worst = ratings.includes('poor') ? 'poor' : ratings.includes('needs-improvement') ? 'needs-improvement' : ratings.length ? 'good' : null;
      return { path, views: summary.LCP.count || summary.TTFB.count, worst, LCP: summary.LCP, INP: summary.INP, CLS: summary.CLS };
    });
    pages.sort((a, b) => order[a.worst] - order[b.worst] || (b.LCP.p75 || 0) - (a.LCP.p75 || 0));
    return { days: Number(days) || 28, thresholds: THRESHOLDS, site: summarise(rows), pages };
  },
});

module.exports.cleanPath = cleanPath;
module.exports.p75 = p75;
module.exports.ratingOf = ratingOf;
