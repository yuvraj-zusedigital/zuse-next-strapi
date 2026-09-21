'use strict';

const { getOrgConfig } = require('./org-config');

// NOTE: estimateWordCount and STOP_WORDS are defined in seo-fields.js. To avoid
// a circular require (seo-fields → structured-data → seo-fields), we duplicate
// the tiny pieces we need here.
const STOP_WORDS_FOR_SECTION = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of',
  'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'this', 'that',
]);

function estimateWordCountLocal(data) {
  const html = typeof data?.Description === 'string' ? data.Description : '';
  if (!html) return null;
  const plainText = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
  if (!plainText) return null;
  const words = plainText.split(' ').filter(Boolean);
  return words.length > 0 ? words.length : null;
}

function toIso8601DurationMinutesLocal(wordCount) {
  if (!Number.isFinite(wordCount) || wordCount <= 0) return null;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `PT${minutes}M`;
}

function normalizeBlogCanonicalUrlLocal(canonicalUrl, slug, siteUrl, blogBasePath) {
  const fallback = slug ? `${siteUrl}${blogBasePath}/${slug}` : siteUrl;
  const input = typeof canonicalUrl === 'string' ? canonicalUrl.trim() : '';
  if (!input) return fallback;
  try {
    const parsed = new URL(input);
    const site = new URL(siteUrl);
    const normalizedPath = parsed.pathname.replace(/\/+$/, '');
    const expectedPath = `${blogBasePath}/${slug}`.replace(/\/+$/, '');
    const legacyHosts = new Set(['zusedigital.com', 'stagingdev.zusedigital.com']);
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

function formatSchemaOrgDateTime(value) {
  if (!value) return null;
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  } catch (_) {
    return null;
  }
}

function deriveArticleSection(title) {
  if (!title) return null;
  const words = String(title)
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !STOP_WORDS_FOR_SECTION.has(w.toLowerCase()) && !/^\d+$/.test(w));
  const word = words[0];
  if (word && word.toLowerCase() === 'ai') return 'AI Strategy';
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : null;
}

async function resolveImageObject(strapi, seoData) {
  if (!seoData.metaImage) return null;
  const orgConfig = await getOrgConfig(strapi);
  const imageId =
    typeof seoData.metaImage === 'object' && seoData.metaImage.id
      ? seoData.metaImage.id
      : seoData.metaImage;
  try {
    const file = await strapi.plugins['upload'].services.upload.findOne(imageId);
    if (file && file.url) {
      const url = file.url.startsWith('http') ? file.url : `${orgConfig.siteUrl}${file.url}`;
      const image = { '@type': 'ImageObject', url };
      if (file.width) image.width = file.width;
      if (file.height) image.height = file.height;
      return image;
    }
  } catch (_) { /* ignore */ }
  return null;
}

async function resolveAuthor(strapi, authorRef) {
  const orgConfig = await getOrgConfig(strapi);
  const DEFAULT_AUTHOR = {
    name: orgConfig.defaultAuthorName || 'Zanyar Outhman',
    profileUrl: orgConfig.defaultAuthorUrl || null,
    sameAs: [],
  };

  if (!authorRef) return DEFAULT_AUTHOR;

  if (typeof authorRef === 'object' && authorRef.Name) {
    const sameAsLinks = authorRef.sameAs
      ? authorRef.sameAs.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
      : [];
    return {
      name: authorRef.Name,
      profileUrl: authorRef.profileUrl || null,
      sameAs: sameAsLinks,
    };
  }

  let authorId;
  if (typeof authorRef === 'object') {
    if (authorRef.connect && Array.isArray(authorRef.connect) && authorRef.connect.length > 0) {
      authorId = authorRef.connect[0].id;
    } else if (authorRef.id) {
      authorId = authorRef.id;
    } else {
      authorId = null;
    }
  } else {
    authorId = authorRef;
  }

  if (!authorId) return DEFAULT_AUTHOR;

  try {
    // In v5, db.query findOne by numeric id is the simplest way to fetch a
    // related entity when we only have its primary-key id.
    const author = await strapi.db.query('api::author.author').findOne({
      where: { id: authorId },
    });
    if (author && author.Name) {
      const sameAsLinks = author.sameAs
        ? author.sameAs.split(/[\n,]+/).map((s) => s.trim()).filter(Boolean)
        : [];
      return {
        name: author.Name,
        profileUrl: author.profileUrl || null,
        sameAs: sameAsLinks,
      };
    }
  } catch (_) { /* ignore */ }
  return DEFAULT_AUTHOR;
}

async function resolveAuthorName(strapi, authorRef) {
  return (await resolveAuthor(strapi, authorRef)).name;
}

async function generateStructuredData(strapi, data, seoData) {
  const orgConfig = await getOrgConfig(strapi);
  const canonical = normalizeBlogCanonicalUrlLocal(
    seoData.canonicalURL,
    data.slug,
    orgConfig.siteUrl,
    orgConfig.blogBasePath
  );
  const headline = data.Title || seoData.metaTitle || '';
  const description = data.Summary || seoData.metaDescription || '';
  const imageObject = await resolveImageObject(strapi, seoData);
  const author = await resolveAuthor(strapi, data.author);

  const nowIso = formatSchemaOrgDateTime(new Date());
  const datePublished =
    formatSchemaOrgDateTime(data.publishedAt || data.createdAt) || nowIso;
  const dateModified = formatSchemaOrgDateTime(data.updatedAt) || datePublished;

  const keywordsArray = seoData.keywords
    ? seoData.keywords.split(',').map((k) => k.trim()).filter(Boolean)
    : [];
  const structuredKeywords = keywordsArray.slice(0, 8).join(', ');
  const aboutThings = keywordsArray.slice(0, 4).map((name) => ({ '@type': 'Thing', name }));

  const articleSection = deriveArticleSection(data.Title);
  const wordCount = estimateWordCountLocal(data);
  const timeRequired = toIso8601DurationMinutesLocal(wordCount);

  const personNode = {
    '@type': 'Person',
    name: author.name,
    url: author.profileUrl || `${orgConfig.siteUrl}/about`,
  };
  if (author.sameAs && author.sameAs.length > 0) {
    personNode.sameAs = author.sameAs.length === 1 ? author.sameAs[0] : author.sameAs;
  }

  const publisherNode = {
    '@type': 'Organization',
    name: orgConfig.orgName,
    url: orgConfig.siteUrl,
  };
  if (orgConfig.orgLogoUrl) {
    publisherNode.logo = { '@type': 'ImageObject', url: orgConfig.orgLogoUrl };
  }
  if (orgConfig.orgSameAs.length > 0) {
    publisherNode.sameAs = orgConfig.orgSameAs;
  }

  const structured = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical || orgConfig.siteUrl },
    url: canonical || orgConfig.siteUrl,
    headline,
    description,
    author: personNode,
    publisher: publisherNode,
    datePublished,
    dateModified,
    inLanguage: orgConfig.orgLanguage,
  };

  if (imageObject) structured.image = imageObject;
  if (articleSection) structured.articleSection = articleSection;
  if (structuredKeywords) structured.keywords = structuredKeywords;
  if (aboutThings.length > 0) structured.about = aboutThings;
  if (wordCount) structured.wordCount = wordCount;
  if (timeRequired) structured.timeRequired = timeRequired;

  return structured;
}

async function buildWebsiteSchema(strapi) {
  const orgConfig = await getOrgConfig(strapi);
  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: orgConfig.orgName,
    url: orgConfig.siteUrl,
    inLanguage: orgConfig.orgLanguage,
    publisher: {
      '@type': 'Organization',
      name: orgConfig.orgName,
      url: orgConfig.siteUrl,
    },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate:
          orgConfig.searchActionUrlTemplate ||
          `${orgConfig.siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };

  if (orgConfig.orgDescription) websiteSchema.description = orgConfig.orgDescription;
  if (orgConfig.orgLogoUrl) {
    websiteSchema.publisher.logo = { '@type': 'ImageObject', url: orgConfig.orgLogoUrl };
  }
  if (orgConfig.orgSameAs.length > 0) {
    websiteSchema.publisher.sameAs = orgConfig.orgSameAs;
  }

  return websiteSchema;
}

async function buildBreadcrumbSchema(strapi, canonical, headline) {
  const orgConfig = await getOrgConfig(strapi);
  const currentUrl = canonical || orgConfig.siteUrl;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: orgConfig.siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${orgConfig.siteUrl}${orgConfig.blogBasePath}` },
      { '@type': 'ListItem', position: 3, name: headline || 'Article', item: currentUrl },
    ],
  };
}

async function structuredDataToScriptTag(strapi, structuredData) {
  if (!structuredData) return null;
  const websiteSchema = await buildWebsiteSchema(strapi);
  const breadcrumbSchema = await buildBreadcrumbSchema(
    strapi,
    structuredData.url,
    structuredData.headline
  );
  const blogScript = `<script type="application/ld+json">\n${JSON.stringify(structuredData, null, 2)}\n</script>`;
  const websiteScript = `<script type="application/ld+json">\n${JSON.stringify(websiteSchema, null, 2)}\n</script>`;
  const breadcrumbScript = `<script type="application/ld+json">\n${JSON.stringify(breadcrumbSchema, null, 2)}\n</script>`;
  return `${blogScript}\n${websiteScript}\n${breadcrumbScript}`;
}

module.exports = {
  generateStructuredData,
  buildWebsiteSchema,
  buildBreadcrumbSchema,
  structuredDataToScriptTag,
  resolveImageObject,
  resolveAuthor,
  resolveAuthorName,
  formatSchemaOrgDateTime,
  deriveArticleSection,
};
