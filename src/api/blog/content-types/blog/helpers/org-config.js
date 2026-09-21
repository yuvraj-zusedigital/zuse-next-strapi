'use strict';

const DEFAULT_SITE_URL = process.env.FRONTEND_URL || 'https://www.zusedigital.com';
const DEFAULT_BLOG_BASE_PATH = process.env.BLOG_BASE_PATH || '/blog';

const ORG_CONFIG_CACHE_TTL_MS = 60 * 1000;
let orgConfigCache = null;
let orgConfigCacheAt = 0;

function normalizeSiteUrl(url) {
  const input = String(url || '').trim();
  if (!input) return DEFAULT_SITE_URL;
  return input.replace(/\/+$/, '');
}

function normalizeBlogPath(pathValue) {
  const input = String(pathValue || '').trim();
  if (!input) return DEFAULT_BLOG_BASE_PATH;
  const prefixed = input.startsWith('/') ? input : `/${input}`;
  return prefixed.replace(/\/+$/, '');
}

function normalizeOrgConfig(raw = {}) {
  const siteUrl = normalizeSiteUrl(raw.siteUrl);
  const sameAs = Array.isArray(raw.orgSameAs)
    ? raw.orgSameAs.map((v) => String(v || '').trim()).filter(Boolean)
    : [];
  const logoFromMedia = raw?.orgLogo?.url
    ? (raw.orgLogo.url.startsWith('http') ? raw.orgLogo.url : `${siteUrl}${raw.orgLogo.url}`)
    : null;

  return {
    siteUrl,
    blogBasePath: normalizeBlogPath(raw.blogBasePath),
    orgName: String(raw.orgName || '').trim() || 'My Organization',
    orgDescription: String(raw.orgDescription || '').trim() || '',
    orgLanguage: String(raw.orgLanguage || '').trim() || 'en',
    orgLogoUrl: String(raw.orgLogoUrl || '').trim() || logoFromMedia || '',
    orgSameAs: sameAs,
    defaultAuthorName: String(raw.defaultAuthorName || '').trim() || null,
    defaultAuthorUrl: String(raw.defaultAuthorUrl || '').trim() || null,
    searchActionUrlTemplate: String(raw.searchActionUrlTemplate || '').trim() || null,
  };
}

async function getOrgConfig(strapi) {
  const now = Date.now();
  if (orgConfigCache && now - orgConfigCacheAt < ORG_CONFIG_CACHE_TTL_MS) {
    return orgConfigCache;
  }

  try {
    const loaded = await strapi
      .documents('api::organization-setting.organization-setting')
      .findFirst({ populate: { orgLogo: true } });
    orgConfigCache = normalizeOrgConfig(loaded || {});
  } catch (err) {
    strapi.log.warn(`[Blog Lifecycle] Failed to load organization settings: ${err.message}`);
    orgConfigCache = normalizeOrgConfig({});
  }

  orgConfigCacheAt = now;
  return orgConfigCache;
}

module.exports = {
  getOrgConfig,
  normalizeOrgConfig,
  normalizeSiteUrl,
  normalizeBlogPath,
  DEFAULT_SITE_URL,
  DEFAULT_BLOG_BASE_PATH,
};
