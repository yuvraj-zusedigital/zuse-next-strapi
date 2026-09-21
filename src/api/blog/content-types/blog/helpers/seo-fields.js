'use strict';

const { getOrgConfig } = require('./org-config');
const {
  generateStructuredData,
  structuredDataToScriptTag,
} = require('./structured-data');

const DEFAULT_META_ROBOTS =
  'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1';
const DEFAULT_META_VIEWPORT = 'width=device-width, initial-scale=1';

const SOCIAL_PLATFORMS = ['Facebook', 'Twitter'];

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would',
  'could', 'should', 'may', 'might', 'can', 'shall', 'it', 'its',
  'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'we',
  'they', 'me', 'him', 'her', 'us', 'them', 'my', 'your', 'his',
  'our', 'their', 'what', 'which', 'who', 'whom', 'not', 'no',
  'so', 'if', 'as', 'about', 'up', 'out', 'then', 'than', 'too',
  'very', 'just', 'also', 'how', 'all', 'each', 'every', 'both',
  'few', 'more', 'most', 'other', 'some', 'such', 'only', 'own',
  'same', 'into', 'over', 'after', 'before', 'between', 'under',
  'again', 'further', 'once', 'here', 'there', 'when', 'where',
  'why', 'any', 'many', 'much', 'well', 'back', 'even', 'still',
  'way', 'take', 'come', 'make', 'like', 'get', 'know', 'think',
  'see', 'look', 'find', 'give', 'tell', 'say', 'go', 'need',
  'want', 'use', 'try', 'new', 'one', 'two', 'first', 'last',
  'nbsp', 'amp', 'quot', 'lt', 'gt',
]);

function stripHtml(html) {
  if (!html) return '';
  return String(html).replace(/<[^>]*>/g, ' ').replace(/&\w+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function generateKeywords(title, summary, description) {
  const text = [title, summary, stripHtml(description)].filter(Boolean).join(' ');
  if (!text) return null;

  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const freq = {};
  words.forEach((w) => { freq[w] = (freq[w] || 0) + 1; });

  const ranked = Object.entries(freq)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([word]) => word);

  const titleWords = (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS.has(w));

  const bigrams = [];
  for (let i = 0; i < titleWords.length - 1; i++) {
    bigrams.push(`${titleWords[i]} ${titleWords[i + 1]}`);
  }

  return [...new Set([...bigrams, ...ranked])].slice(0, 12).join(', ');
}

function generateCanonicalURL(slug, siteUrl, blogBasePath) {
  if (!slug) return null;
  return `${siteUrl}${blogBasePath}/${slug}`;
}

function normalizeBlogCanonicalUrl(canonicalUrl, slug, siteUrl, blogBasePath) {
  const fallback = generateCanonicalURL(slug, siteUrl, blogBasePath) || siteUrl;
  const input = typeof canonicalUrl === 'string' ? canonicalUrl.trim() : '';
  if (!input) return fallback;

  try {
    const parsed = new URL(input);
    const site = new URL(siteUrl);
    const normalizedPath = parsed.pathname.replace(/\/+$/, '');
    const expectedPath = `${blogBasePath}/${slug}`.replace(/\/+$/, '');
    const legacyHosts = new Set([
      'zusedigital.com',
      'stagingdev.zusedigital.com',
    ]);

    if (legacyHosts.has(parsed.hostname) && parsed.hostname !== site.hostname) {
      parsed.protocol = site.protocol;
      parsed.host = site.host;
    }

    if (slug && (normalizedPath === `/${slug}` || normalizedPath === expectedPath)) {
      parsed.pathname = expectedPath;
      return parsed.toString();
    }

    return parsed.toString();
  } catch (_) {
    return fallback;
  }
}

function estimateWordCount(data) {
  const html = typeof data?.Description === 'string' ? data.Description : '';
  if (!html) return null;
  const plainText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!plainText) return null;
  const words = plainText.split(' ').filter(Boolean);
  return words.length > 0 ? words.length : null;
}

function toIso8601DurationMinutes(wordCount) {
  if (!Number.isFinite(wordCount) || wordCount <= 0) return null;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `PT${minutes}M`;
}

function seoKeywordsNeedAutofill(keywords) {
  return keywords == null || String(keywords).trim() === '';
}

function seoCanonicalNeedAutofill(canonicalURL) {
  return canonicalURL == null || String(canonicalURL).trim() === '';
}

function ensureSocialEntries(seoData) {
  if (!seoData) return seoData;
  if (!seoData.metaSocial) seoData.metaSocial = [];

  const metaTitle = (seoData.metaTitle || '').substring(0, 60);
  const metaDesc = (seoData.metaDescription || '').substring(0, 65);

  let metaImageId = null;
  if (seoData.metaImage) {
    metaImageId =
      typeof seoData.metaImage === 'object' && seoData.metaImage.id
        ? seoData.metaImage.id
        : seoData.metaImage;
  }

  for (const platform of SOCIAL_PLATFORMS) {
    const existingIndex = seoData.metaSocial.findIndex(
      (s) => s.socialNetwork === platform
    );

    if (existingIndex >= 0) {
      const existingEntry = seoData.metaSocial[existingIndex];
      if (!existingEntry.title && metaTitle) existingEntry.title = metaTitle;
      if (!existingEntry.description && metaDesc) existingEntry.description = metaDesc;
      if (!existingEntry.image && metaImageId) existingEntry.image = metaImageId;
    } else if (metaTitle || metaDesc || metaImageId) {
      const entry = {
        socialNetwork: platform,
        title: metaTitle || platform,
        description: metaDesc || '',
      };
      if (metaImageId) entry.image = metaImageId;
      seoData.metaSocial.push(entry);
    }
  }

  return seoData;
}

async function autoPopulateSeoFields(strapi, data) {
  if (!data.seo) return;
  const orgConfig = await getOrgConfig(strapi);
  const seo = data.seo;

  if (!seo.metaTitle && data.Title) {
    seo.metaTitle = data.Title.substring(0, 60);
  }
  if (!seo.metaDescription && data.Summary) {
    seo.metaDescription = data.Summary.substring(0, 160);
  }

  if (seoKeywordsNeedAutofill(seo.keywords)) {
    const generated = generateKeywords(data.Title, data.Summary, data.Description);
    if (generated) seo.keywords = generated;
  }

  if (!seo.metaRobots) seo.metaRobots = DEFAULT_META_ROBOTS;
  if (!seo.metaViewport) seo.metaViewport = DEFAULT_META_VIEWPORT;

  if (seoCanonicalNeedAutofill(seo.canonicalURL)) {
    seo.canonicalURL = generateCanonicalURL(data.slug, orgConfig.siteUrl, orgConfig.blogBasePath);
  } else if (data.slug) {
    seo.canonicalURL = normalizeBlogCanonicalUrl(
      seo.canonicalURL,
      data.slug,
      orgConfig.siteUrl,
      orgConfig.blogBasePath
    );
  }

  const structured = await generateStructuredData(strapi, data, seo);
  seo.structuredData = structured;
  seo.structuredDataText = await structuredDataToScriptTag(strapi, structured);
}

module.exports = {
  SOCIAL_PLATFORMS,
  STOP_WORDS,
  autoPopulateSeoFields,
  ensureSocialEntries,
  generateKeywords,
  generateCanonicalURL,
  normalizeBlogCanonicalUrl,
  seoKeywordsNeedAutofill,
  seoCanonicalNeedAutofill,
  stripHtml,
  estimateWordCount,
  toIso8601DurationMinutes,
};
