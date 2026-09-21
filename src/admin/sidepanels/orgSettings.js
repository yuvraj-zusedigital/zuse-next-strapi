const DEFAULT_SITE_URL =
  typeof window !== 'undefined' && window.location
    ? window.location.origin
    : 'https://www.example.com';
const DEFAULT_BLOG_BASE_PATH = '/blog';

let cache = null;
let inflight = null;

const normalizeSiteUrl = (url) => {
  const input = String(url || '').trim();
  if (!input) return DEFAULT_SITE_URL;
  return input.replace(/\/+$/, '');
};

const normalizeBlogPath = (pathValue) => {
  const input = String(pathValue || '').trim();
  if (!input) return DEFAULT_BLOG_BASE_PATH;
  const prefixed = input.startsWith('/') ? input : `/${input}`;
  return prefixed.replace(/\/+$/, '');
};

export const fetchOrgSettings = () => {
  if (cache) return Promise.resolve(cache);
  if (inflight) return inflight;
  inflight = fetch('/api/organization-setting', { credentials: 'include' })
    .then((r) => (r.ok ? r.json() : null))
    .then((payload) => {
      const data = payload?.data;
      const raw = data?.attributes ? { ...data.attributes, id: data.id } : data || {};
      cache = {
        siteUrl: normalizeSiteUrl(raw?.siteUrl),
        blogBasePath: normalizeBlogPath(raw?.blogBasePath),
      };
      return cache;
    })
    .catch(() => {
      cache = { siteUrl: DEFAULT_SITE_URL, blogBasePath: DEFAULT_BLOG_BASE_PATH };
      return cache;
    })
    .finally(() => {
      inflight = null;
    });
  return inflight;
};
