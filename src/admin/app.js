import { registerSidePanels } from './sidepanels';

const DEFAULT_SITE_URL =
  (typeof window !== 'undefined' && window.location ? window.location.origin : 'https://www.example.com');
const DEFAULT_BLOG_BASE_PATH = '/blog';

const DEFAULT_META_ROBOTS =
  'index,follow,max-snippet:-1,max-image-preview:large,max-video-preview:-1';
const DEFAULT_META_VIEWPORT = 'width=device-width, initial-scale=1';
const DEFAULT_ORG_NAME = 'My Organization';
const DEFAULT_ORG_LANGUAGE = 'en';

const orgSettingsState = {
  loaded: false,
  siteUrl: DEFAULT_SITE_URL,
  blogBasePath: DEFAULT_BLOG_BASE_PATH,
  orgName: DEFAULT_ORG_NAME,
  orgDescription: '',
  orgLanguage: DEFAULT_ORG_LANGUAGE,
  orgLogoUrl: '',
  orgSameAs: [],
  defaultAuthorName: null,
  defaultAuthorUrl: null,
  searchActionUrlTemplate: null,
};

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

function getOrgSettings() {
  return orgSettingsState;
}

function getSiteUrl() {
  return getOrgSettings().siteUrl;
}

function getBlogBasePath() {
  return getOrgSettings().blogBasePath;
}

function toAbsoluteFromSite(url) {
  if (!url || typeof url !== 'string') return '';
  if (/^https?:\/\//i.test(url)) return url;
  return url.startsWith('/') ? `${getSiteUrl()}${url}` : `${getSiteUrl()}/${url}`;
}

async function hydrateOrganizationSettings() {
  try {
    const response = await fetch('/api/organization-setting?populate=orgLogo', {
      credentials: 'include',
    });
    if (!response.ok) return;
    const payload = await response.json();
    const data = payload?.data;
    const raw = data?.attributes ? { ...data.attributes, id: data.id } : (data || {});
    if (!raw || typeof raw !== 'object') return;

    const sameAs = Array.isArray(raw.orgSameAs)
      ? raw.orgSameAs.map((value) => String(value || '').trim()).filter(Boolean)
      : [];
    const logoUrl = String(raw.orgLogoUrl || '').trim()
      || toAbsoluteFromSite(raw?.orgLogo?.data?.attributes?.url || raw?.orgLogo?.url || '');

    orgSettingsState.siteUrl = normalizeSiteUrl(raw.siteUrl);
    orgSettingsState.blogBasePath = normalizeBlogPath(raw.blogBasePath);
    orgSettingsState.orgName = String(raw.orgName || '').trim() || DEFAULT_ORG_NAME;
    orgSettingsState.orgDescription = String(raw.orgDescription || '').trim() || '';
    orgSettingsState.orgLanguage = String(raw.orgLanguage || '').trim() || DEFAULT_ORG_LANGUAGE;
    orgSettingsState.orgLogoUrl = logoUrl || '';
    orgSettingsState.orgSameAs = sameAs;
    orgSettingsState.defaultAuthorName = String(raw.defaultAuthorName || '').trim() || null;
    orgSettingsState.defaultAuthorUrl = String(raw.defaultAuthorUrl || '').trim() || null;
    orgSettingsState.searchActionUrlTemplate =
      String(raw.searchActionUrlTemplate || '').trim() || null;
    orgSettingsState.loaded = true;
  } catch (_) {
    // Keep defaults in admin preview when org settings are unavailable.
  }
}
const KEYWORD_STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'by', 'from', 'is', 'are', 'was', 'were', 'be', 'been',
  'it', 'its', 'this', 'that', 'these', 'those', 'as', 'if', 'so', 'not',
  'can', 'will', 'would', 'should', 'could', 'you', 'your', 'we', 'our',
]);

const config = {
  head: {
    favicon: 'https://d13fy5c8tglk2k.cloudfront.net/logo_icn_zuse_895728350e.ico',
  },
  custom: {
    css: './custom.css',
  },
};

/**
 * Field-specific overrides.
 * We prefer native input constraints (maxlength/minlength) and only override when needed.
 * Strapi often does not set maxlength on the DOM for controlled inputs — these defaults
 * ensure the live counter still appears (matches shared.seo / meta-social / blog schemas).
 */
const FIELD_LIMIT_OVERRIDES = {
  metaTitle: { max: 60 },
  metaDescription: { max: 160, min: 50 },
  title: { max: 60 },
  description: { max: 65 },
  Summary: { max: 170 },
};

/**
 * Strapi Design System often omits `name` on the DOM; `id` still matches the field (e.g. Summary).
 */
function getFieldPathKey(input) {
  if (!input) return '';
  return (
    input.name ||
    input.getAttribute('name') ||
    input.getAttribute('id') ||
    ''
  ).trim();
}

/**
 * Gets the short field name from a Strapi input name like "seo.metaSocial.0.title"
 */
function getShortName(input) {
  const fieldName = getFieldPathKey(input);
  if (!fieldName) return '';
  const segments = fieldName.split('.');
  return segments[segments.length - 1];
}

/**
 * Gets the full field name path from a Strapi input
 */
function getFullName(input) {
  return input.name || input.getAttribute('name') || '';
}

function isFormInput(element) {
  return element && (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA');
}

/**
 * Strapi Design System Textarea does not put `name` on the DOM node (only Field context).
 * We resolve those controls via label[for] + id, same as accessible inputs.
 */
function normalizeFieldLabel(text) {
  return (text || '')
    .replace(/\*/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

function findFormControlByLabel(...normalizedLabels) {
  const wanted = new Set(normalizedLabels);
  const labels = document.querySelectorAll('label[for]');
  for (const label of labels) {
    const key = normalizeFieldLabel(label.textContent);
    if (!wanted.has(key)) continue;
    const id = label.getAttribute('for');
    if (!id) continue;
    const el = document.getElementById(id);
    if (isFormInput(el)) return el;
  }
  return null;
}

function getTinyMceBodyHtml() {
  const iframe = document.querySelector('iframe.tox-edit-area__iframe');
  if (!iframe || !iframe.contentDocument) return '';
  const body = iframe.contentDocument.body;
  return body ? body.innerHTML : '';
}

function findKeywordsSeoTextarea() {
  const exact = findFormControlByLabel('keywords');
  if (exact) return exact;
  const labels = document.querySelectorAll('label[for]');
  for (const label of labels) {
    const key = normalizeFieldLabel(label.textContent);
    if (!key.includes('keyword')) continue;
    const id = label.getAttribute('for');
    if (!id) continue;
    const el = document.getElementById(id);
    if (el && el.tagName === 'TEXTAREA') return el;
  }
  return findInputByShortName('keywords');
}

function parseNumericAttr(input, attrName) {
  const raw = input.getAttribute(attrName);
  if (!raw) return null;
  const parsed = parseInt(raw, 10);
  return Number.isNaN(parsed) ? null : parsed;
}

function getLimitConfig(input) {
  const shortName = getShortName(input);
  const overrides = FIELD_LIMIT_OVERRIDES[shortName] || {};

  const nativeMax =
    typeof input.maxLength === 'number' && input.maxLength > 0
      ? input.maxLength
      : parseNumericAttr(input, 'maxlength');
  const nativeMin =
    typeof input.minLength === 'number' && input.minLength > 0
      ? input.minLength
      : parseNumericAttr(input, 'minlength');

  const max = overrides.max || nativeMax;
  const min = overrides.min !== undefined ? overrides.min : nativeMin;

  if (!max || max <= 0) {
    return null;
  }

  return { max, min: min || null };
}

function escapeAttrSelector(value) {
  if (typeof CSS !== 'undefined' && typeof CSS.escape === 'function') {
    return CSS.escape(value);
  }
  return value.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
}

/** Strapi admin persists theme as `light` | `dark` | `system` (see @strapi/admin STRAPI_THEME). */
const STRAPI_THEME_STORAGE_KEY = 'STRAPI_THEME';

function getEffectiveAdminTheme() {
  try {
    const stored = window.localStorage.getItem(STRAPI_THEME_STORAGE_KEY) || 'system';
    if (stored === 'light') return 'light';
    if (stored === 'dark') return 'dark';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  } catch {
    return 'light';
  }
}

/**
 * Muted / state colors aligned with @strapi/design-system light and dark tokens.
 */
function getCharCountThemeColors(theme) {
  if (theme === 'dark') {
    return {
      default: '#a5a5ba',
      nearLimit: '#7b79ff',
      minWarn: '#f29d41',
      overMax: '#ee5e52',
    };
  }
  return {
    default: '#666687',
    nearLimit: '#4945ff',
    minWarn: '#d9822f',
    overMax: '#d02b20',
  };
}

function applyCharCountInlineBaseStyle(el) {
  const s = el.style;
  s.float = 'none';
  s.clear = 'none';
  s.display = 'block';
  s.margin = '4px 0 6px 0';
  s.padding = '0';
  s.border = 'none';
  s.textAlign = 'right';
  s.fontSize = '1.25rem';
  s.fontWeight = '400';
  s.letterSpacing = '0.01em';
  s.lineHeight = '1.25';
  s.whiteSpace = 'nowrap';
  s.boxSizing = 'border-box';
  s.cursor = 'default';
  s.fontFamily = 'inherit';
}

/** Typography when counter sits beside Strapi’s hint row (Summary, metaTitle, metaDescription). */
function applyCharCountHintRowStyle(el) {
  const s = el.style;
  s.float = 'none';
  s.clear = 'none';
  s.display = 'block';
  s.padding = '0';
  s.border = 'none';
  s.textAlign = 'right';
  s.fontSize = '1.25rem';
  s.fontWeight = '400';
  s.letterSpacing = '0.01em';
  s.lineHeight = '1.25';
  s.whiteSpace = 'nowrap';
  s.boxSizing = 'border-box';
  s.cursor = 'default';
  s.fontFamily = 'inherit';
}

/**
 * One flex row for hint (left) + count (right) under the control.
 * Strapi DOM order is often [label, input-wrap, .zd-char-count, p#*-hint]; flex `order` fixes visual order.
 */
function applyHintAndCountRowLayout(parent, hintEl, countEl, input) {
  if (!parent || !hintEl || !countEl || !input) return;

  parent.style.display = 'flex';
  parent.style.flexWrap = 'wrap';
  parent.style.flexDirection = 'row';
  parent.style.alignItems = 'baseline';
  parent.style.overflow = '';

  for (const child of parent.children) {
    if (child === countEl || child === hintEl) continue;
    const isLabel = child.tagName === 'LABEL';
    const wrapsInput = child.contains && child.contains(input);
    if (isLabel || wrapsInput) {
      child.style.flexBasis = '100%';
      child.style.width = '100%';
      child.style.maxWidth = '100%';
    }
  }

  const hs = hintEl.style;
  hs.float = 'none';
  hs.order = '1';
  hs.flex = '1 1 auto';
  hs.minWidth = '0';
  hs.margin = '4px 12px 0 0';
  hs.alignSelf = 'baseline';

  const cs = countEl.style;
  cs.float = 'none';
  cs.clear = 'none';
  cs.order = '2';
  cs.flex = '0 0 auto';
  cs.margin = '4px 0 0 0';
  cs.marginLeft = 'auto';
  cs.alignSelf = 'baseline';
}

function findHintForInput(input, fieldName, scope) {
  if (!fieldName) return null;
  const byId = scope.querySelector(`#${escapeAttrSelector(fieldName)}-hint`);
  if (byId) return byId;

  const described = (input.getAttribute('aria-describedby') || '').trim();
  if (described) {
    for (const rawId of described.split(/\s+/)) {
      const id = rawId.trim();
      if (!id) continue;
      const node = scope.getElementById(id);
      if (node) return node;
    }
  }

  let walk = input.parentElement;
  for (let d = 0; walk && d < 8; d++) {
    let sib = walk.nextElementSibling;
    for (let step = 0; sib && step < 6; step++) {
      const hid = sib.getAttribute && sib.getAttribute('id');
      if (hid && hid.endsWith('-hint')) return sib;
      sib = sib.nextElementSibling;
    }
    walk = walk.parentElement;
  }
  return null;
}

/**
 * Hint+count row for Summary / main SEO fields, and metaSocial title & description only
 * (path-guarded so other `title` / `description` fields stay on the label).
 */
function shouldPlaceCharCountBesideHint(fieldName, shortName) {
  if (
    shortName === 'Summary' ||
    shortName === 'metaTitle' ||
    shortName === 'metaDescription'
  ) {
    return true;
  }
  if (!fieldName) return false;
  if (
    shortName === 'title' &&
    /[sS][eE][oO]\.metaSocial\.\d+\.title$/.test(fieldName)
  ) {
    return true;
  }
  if (
    shortName === 'description' &&
    /[sS][eE][oO]\.metaSocial\.\d+\.description$/.test(fieldName)
  ) {
    return true;
  }
  return false;
}

function updateCharCountText(el, input, cfg) {
  const len = (input.value || '').length;
  const { max, min } = cfg;
  let text = `${len} / ${max}`;
  if (min) {
    text += ` · min ${min}`;
  }
  el.textContent = text;
  if (el.dataset.zdCountPlace === 'hint-row') {
    applyCharCountHintRowStyle(el);
  } else {
    applyCharCountInlineBaseStyle(el);
  }

  const theme = getEffectiveAdminTheme();
  const colors = getCharCountThemeColors(theme);

  if (min && len < min) {
    el.style.color = colors.minWarn;
    el.style.opacity = '1';
  } else if (max - len <= 10 && len <= max) {
    el.style.color = colors.nearLimit;
    el.style.opacity = '1';
  } else if (len > max) {
    el.style.color = colors.overMax;
    el.style.opacity = '1';
  } else {
    el.style.color = colors.default;
    el.style.opacity = '1';
  }
}

function findInputForCharCountKey(key) {
  if (!key) return null;
  const byId = document.getElementById(key);
  if (isFormInput(byId)) return byId;
  const esc = escapeAttrSelector(key);
  return document.querySelector(`textarea[name="${esc}"], input[name="${esc}"]`);
}

/** Re-apply colors when admin light/dark/system theme changes (counters are plain DOM, not themed by Strapi). */
function refreshAllCharCountStyles() {
  document.querySelectorAll('.zd-char-count[data-zd-char-for]').forEach((el) => {
    const key = el.getAttribute('data-zd-char-for');
    const input = findInputForCharCountKey(key);
    if (!input) return;
    const cfg = getLimitConfig(input);
    if (!cfg) return;
    updateCharCountText(el, input, cfg);
  });
}

/**
 * Strapi’s primary field label (e.g. label[for="seo.metaTitle"]). Counter `<div>` is inserted after it.
 */
function findLabelForInput(input) {
  const id = input.getAttribute('id');
  if (id) {
    const root = input.getRootNode();
    const scope =
      root instanceof ShadowRoot || root instanceof Document ? root : document;
    const lab = scope.querySelector(`label[for="${escapeAttrSelector(id)}"]`);
    if (lab) return lab;
  }
  const wrapping = input.closest('label');
  if (wrapping) return wrapping;

  let node = input.parentElement;
  for (let d = 0; node && d < 14; d++) {
    const prev = node.previousElementSibling;
    if (prev && prev.tagName === 'LABEL') return prev;
    node = node.parentElement;
  }
  return null;
}

function ensureCharCountForInput(input) {
  const cfg = getLimitConfig(input);
  if (!cfg) return;

  const fieldName = getFieldPathKey(input);
  if (!fieldName) return;

  if (!input.parentElement) return;

  const shortName = getShortName(input);
  const escaped = escapeAttrSelector(fieldName);
  const root = input.getRootNode && input.getRootNode();
  const scope = root && root.nodeType === Node.DOCUMENT_FRAGMENT_NODE ? root : document;
  let el = scope.querySelector(`.zd-char-count[data-zd-char-for="${escaped}"]`);
  if (el && el.tagName !== 'DIV') {
    el.remove();
    el = null;
  }

  const useHintRow = shouldPlaceCharCountBesideHint(fieldName, shortName);
  const hintEl = useHintRow ? findHintForInput(input, fieldName, scope) : null;

  if (hintEl) {
    if (!el) {
      el = document.createElement('div');
      el.className = 'zd-char-count';
      el.setAttribute('data-zd-char-for', fieldName);
      el.setAttribute('aria-live', 'polite');
      el.dataset.zdCountPlace = 'hint-row';
      hintEl.insertAdjacentElement('beforebegin', el);
    } else {
      el.dataset.zdCountPlace = 'hint-row';
      if (el.nextElementSibling !== hintEl) {
        hintEl.insertAdjacentElement('beforebegin', el);
      }
    }
  } else {
    const fieldLabel = findLabelForInput(input);
    if (el) el.dataset.zdCountPlace = 'after-label';

    if (fieldLabel) {
      if (!el) {
        el = document.createElement('div');
        el.className = 'zd-char-count';
        el.setAttribute('data-zd-char-for', fieldName);
        el.setAttribute('aria-live', 'polite');
        el.dataset.zdCountPlace = 'after-label';
        fieldLabel.insertAdjacentElement('afterend', el);
      } else if (el.previousElementSibling !== fieldLabel) {
        fieldLabel.insertAdjacentElement('afterend', el);
      }
    } else {
      if (!el) {
        el = document.createElement('div');
        el.className = 'zd-char-count';
        el.setAttribute('data-zd-char-for', fieldName);
        el.setAttribute('aria-live', 'polite');
        el.dataset.zdCountPlace = 'after-label';
        input.insertAdjacentElement('beforebegin', el);
      } else if (el.nextElementSibling !== input) {
        input.insertAdjacentElement('beforebegin', el);
      }
    }
  }

  input.dataset.zdCharCountInit = 'true';
  updateCharCountText(el, input, cfg);

  if (hintEl && el.dataset.zdCountPlace === 'hint-row') {
    applyHintAndCountRowLayout(hintEl.parentElement, hintEl, el, input);
  }
}

// =============================================
// META TITLE/DESCRIPTION → SOCIAL FIELDS SYNC
// =============================================

/**
 * Uses React's internal setter to programmatically update a controlled input.
 * This is required because Strapi uses React controlled inputs — setting .value
 * directly doesn't trigger React state updates.
 */
function setNativeValue(input, value) {
  const isTextarea = input.tagName === 'TEXTAREA';
  const nativeInputValueSetter = isTextarea
    ? Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')?.set
    : Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value')?.set;

  if (nativeInputValueSetter) {
    nativeInputValueSetter.call(input, value);
  } else {
    input.value = value;
  }

  // Dispatch events that React listens for
  input.dispatchEvent(new Event('input', { bubbles: true }));
  input.dispatchEvent(new Event('change', { bubbles: true }));
}

/**
 * Gets the displayed name from a Strapi relation field (e.g. "author").
 * Relation fields render the selected item as a link inside an <ol> list
 * next to the combobox.  We locate the combobox by its id/label, then find
 * the sibling list and read the first link text.
 */
function getSelectedRelationName(fieldId) {
  const label = document.querySelector('label[for="' + fieldId + '"]');
  if (!label) return null;
  // Walk up until we find an ancestor that contains both the label and an <ol> with relation links
  let el = label.parentElement;
  while (el && el !== document.body) {
    const link = el.querySelector('ol a[href*="/content-manager/"]');
    if (link) {
      if (link.textContent.includes('Author')) {
        return null;
      }
      const name = (link.textContent || '').trim();
      return name || null;
    }
    el = el.parentElement;
  }
  return null;
}

/**
 * Finds all social media title/description inputs that should be synced.
 * Strapi names them like: seo.metaSocial.0.title, seo.metaSocial.1.title, SEO.metaSocial.0.title
 */
function findSocialInputs(fieldSuffix) {
  const allInputs = document.querySelectorAll('input[name], textarea[name]');
  const matches = [];
  allInputs.forEach((input) => {
    const name = getFullName(input);
    // Match patterns like seo.metaSocial.X.title or SEO.metaSocial.X.title
    if (name.match(/[sS][eE][oO]\.metaSocial\.\d+\./) && name.endsWith(fieldSuffix)) {
      matches.push(input);
    }
  });
  return matches;
}

/**
 * Syncs the value from a meta field to all corresponding social media fields.
 * metaTitle → all metaSocial[*].title
 * metaDescription → all metaSocial[*].description (truncated to 65 chars)
 */
function syncMetaToSocialFields(sourceInput) {
  if (!isStrapiBlogContentManagerPath()) return;

  const shortName = getShortName(sourceInput);

  if (shortName === 'metaTitle') {
    const socialTitleInputs = findSocialInputs('title');
    socialTitleInputs.forEach((target) => {
      const isEmpty = !(target.value || '').trim();
      if (!isEmpty && !autoFilledFlags.socialTitle) return;
      const truncated = (sourceInput.value || '').substring(0, 60);
      if (target.value !== truncated) {
        _programmaticUpdate = true;
        setNativeValue(target, truncated);
        _programmaticUpdate = false;
        autoFilledFlags.socialTitle = true;
      }
    });
  }

  if (shortName === 'metaDescription') {
    const socialDescInputs = findSocialInputs('description');
    socialDescInputs.forEach((target) => {
      const isEmpty = !(target.value || '').trim();
      if (!isEmpty && !autoFilledFlags.socialDescription) return;
      const truncated = (sourceInput.value || '').substring(0, 65);
      if (target.value !== truncated) {
        _programmaticUpdate = true;
        setNativeValue(target, truncated);
        _programmaticUpdate = false;
        autoFilledFlags.socialDescription = true;
      }
    });
  }
}

// =============================================
// SOCIAL IMAGE SIZE HINTS
// =============================================

const SOCIAL_IMAGE_SIZE_HINTS = {
  Facebook: '1200 × 630 px',
  Twitter: '1200 × 600 px',
};

/**
 * Injects a small size-hint badge below each social image picker.
 * Matches by walking the DOM for the social network label nearest
 * to each metaSocial image container.
 */
function injectSocialImageSizeHints() {
  // Find all social network name inputs (e.g. seo.metaSocial.0.socialNetwork)
  const allInputs = document.querySelectorAll('input[name]');
  allInputs.forEach((input) => {
    const name = getFullName(input);
    if (!/\.metaSocial\.\d+\.socialNetwork$/.test(name)) return;

    const platform = input.value; // e.g. "Facebook" or "Twitter"
    const hint = SOCIAL_IMAGE_SIZE_HINTS[platform];
    if (!hint) return;

    // Walk up to find the repeatable component container, then find the image picker inside
    const section = input.closest('[class*="RepeatableComponent"], [class*="repeatable"], fieldset, [data-strapi-field]')
      || input.parentElement?.parentElement?.parentElement?.parentElement;
    if (!section) return;

    // Find all buttons in this section — the image picker button is usually the last upload button
    const imageContainers = section.querySelectorAll('[class*="InputWrapper"], [class*="inputWrapper"], [class*="field-wrapper"]');
    let targetContainer = null;
    imageContainers.forEach((el) => {
      // Look for an image-related label inside
      const labels = el.querySelectorAll('label');
      labels.forEach((lbl) => {
        if (/image/i.test(lbl.textContent)) {
          targetContainer = el;
        }
      });
    });

    // Fallback: any container in the section with an "image" label
    if (!targetContainer) {
      const allLabels = section.querySelectorAll('label');
      allLabels.forEach((lbl) => {
        if (/image/i.test(lbl.textContent)) {
          targetContainer = lbl.closest('[class*="field"], [data-strapi-field]') || lbl.parentElement;
        }
      });
    }

    if (!targetContainer) return;
    if (targetContainer.querySelector('.zd-social-size-hint')) return; // already injected

    const badge = document.createElement('div');
    badge.className = 'zd-social-size-hint';
    badge.textContent = `Recommended size: ${hint}`;
    targetContainer.appendChild(badge);
  });
}


// =============================================
// IMAGE → META IMAGE SYNC (Admin UI)
// =============================================

/**
 * Reads the current Image fiber value and, when seo.metaImage is not yet
 * set, pushes the same image object to it in real-time.
 *
 * This gives instant feedback in the admin UI — the metaImage picker shows the
 * selected cover image immediately, before the user saves. On save the lifecycle
 * will generate a properly resized 1200×630 copy on the server side.
 */
/**
 * Tracks whether metaTitle / metaDescription were auto-filled (true) or
 * manually edited by the user (false).  When auto-filled, typing in Title /
 * Summary keeps the meta fields in sync in real-time.  Once the user
 * directly edits a meta field, syncing stops for that field.
 */
const autoFilledFlags = {
  // Keep sync active by default on edit pages.
  // A direct user edit of each target field turns that specific sync off.
  metaTitle: true,
  metaDescription: true,
  socialTitle: true,
  socialDescription: true,
};

/**
 * Guard flag: true while we are programmatically setting a value via
 * setNativeValue inside our sync functions.  handleLiveUpdate checks this
 * so it does not treat programmatic changes as manual user edits.
 */
let _programmaticUpdate = false;

let lastSyncedCoverImageId = null;
let lastObservedTitleValue = null;
let lastObservedSummaryValue = null;

function getMediaValueAndId(value) {
  if (!value) return { mediaValue: null, mediaId: null };
  if (Array.isArray(value)) {
    const first = value[0];
    if (!first) return { mediaValue: null, mediaId: null };
    return { mediaValue: first, mediaId: first.id || null };
  }
  if (typeof value === 'object') {
    return { mediaValue: value, mediaId: value.id || null };
  }
  return { mediaValue: null, mediaId: value };
}

/**
 * Walks the React fiber tree from any DOM node up to the root, looking for
 * the Strapi v5 Form context (a ContextProvider whose `value` exposes
 * `onChange(path, value)`, `getValues()`, and `setValues()`).
 *
 * Returns the form context object or null. Strapi v5 dropped the v4-style
 * event-based `onChange({ target: { name, value } })` and now exposes
 * `onChange(path, value)` via `useField` / `useForm` from `@strapi/admin`.
 */
function _ctxLooksLikeForm(obj) {
  return (
    obj &&
    typeof obj === 'object' &&
    typeof obj.onChange === 'function' &&
    typeof obj.getValues === 'function'
  );
}

function getStrapiFormCtx() {
  // Walk up from an input that is guaranteed to live inside the form, so we
  // reliably traverse the FormProvider fiber on the way up.
  //
  // Strapi v5's form context comes from a custom `createContext` wrapper
  // (src/components/Context.mjs) — the public methods are passed as TOP-LEVEL
  // props to <FormProvider {...formCtx}> AND re-exposed as `value` on the
  // inner ContextProvider. So check both shapes.
  const candidates = document.querySelectorAll(
    'input[name], textarea[name], select[name]'
  );
  for (const root of candidates) {
    const fk = Object.keys(root).find((k) => k.startsWith('__reactFiber'));
    if (!fk) continue;
    let f = root[fk];
    let depth = 0;
    while (f && depth < 300) {
      const p = f.memoizedProps;
      if (p) {
        if (_ctxLooksLikeForm(p.value)) return p.value;
        if (_ctxLooksLikeForm(p)) return p;
      }
      f = f.return;
      depth++;
    }
  }
  return null;
}

/**
 * Resolves the form value at `path`, supporting dotted paths and numeric
 * indices (e.g. `seo.metaSocial.0.image`).
 */
function getFormValueAt(formCtx, path) {
  try {
    const values = formCtx.getValues();
    return path.split('.').reduce((acc, key) => {
      if (acc == null) return undefined;
      const idx = /^\d+$/.test(key) ? Number(key) : key;
      return acc[idx];
    }, values);
  } catch (_) {
    return undefined;
  }
}

/**
 * Returns the path of the field whose label / name matches the regex. The
 * MediaLibraryInput component receives `name` as a prop, so its fiber's
 * memoizedProps have `name` set.
 */
function findFieldNamesByPattern(namePattern) {
  const found = new Set();
  // Walk every element with a fiber ref — most of the form has them.
  const nodes = document.querySelectorAll('button, label, div');
  for (const node of nodes) {
    const fk = Object.keys(node).find((k) => k.startsWith('__reactFiber'));
    if (!fk) continue;
    let f = node[fk];
    let depth = 0;
    while (f && depth < 40) {
      const p = f.memoizedProps;
      if (p && typeof p.name === 'string' && namePattern.test(p.name)) {
        found.add(p.name);
        break;
      }
      f = f.return;
      depth++;
    }
    if (found.size > 50) break; // safety cap
  }
  return Array.from(found);
}

function syncCoverImageToMetaImage() {
  if (!isStrapiBlogContentManagerPath()) return;
  const formCtx = getStrapiFormCtx();
  if (!formCtx) return;

  const coverNames = findFieldNamesByPattern(/^(image|Image|CoverImage)$/);
  if (coverNames.length === 0) return;
  const coverName = coverNames[0];
  const coverValue = getFormValueAt(formCtx, coverName);
  const { mediaValue, mediaId: coverId } = getMediaValueAndId(coverValue);
  if (!mediaValue || !coverId) return;

  const metaNames = findFieldNamesByPattern(/(^|\.)metaImage$/);
  if (metaNames.length === 0) return;
  const metaName = metaNames[0];
  const { mediaId: metaId } = getMediaValueAndId(getFormValueAt(formCtx, metaName));
  if (metaId) return; // already set — don't overwrite

  if (lastSyncedCoverImageId === coverId) return;

  try {
    formCtx.onChange(metaName, mediaValue);
    lastSyncedCoverImageId = coverId;
  } catch (_) {
    /* ignore */
  }
}

// =============================================
// META IMAGE → SOCIAL IMAGE SYNC (Admin UI)
// =============================================

/**
 * Core: reads the current value from the metaImage fiber and pushes it
 * to all social image fibers that are currently empty.
 * Called whenever a DOM mutation suggests the media picker was used.
 */
let lastSyncedMetaImageId = null;

function syncMetaImageToSocialFibers() {
  if (!isStrapiBlogContentManagerPath()) return;
  const formCtx = getStrapiFormCtx();
  if (!formCtx) return;

  const metaNames = findFieldNamesByPattern(/(^|\.)metaImage$/);
  if (metaNames.length === 0) return;
  const metaName = metaNames[0];
  const { mediaValue: metaImageValue, mediaId: metaImageId } =
    getMediaValueAndId(getFormValueAt(formCtx, metaName));
  if (!metaImageValue || !metaImageId) return;

  const socialNames = findFieldNamesByPattern(/\.metaSocial\.\d+\.image$/);
  if (socialNames.length === 0) return;

  // Skip only if same image AND no empty slots
  const hasEmpty = socialNames.some(
    (n) => !getMediaValueAndId(getFormValueAt(formCtx, n)).mediaId
  );
  if (lastSyncedMetaImageId === metaImageId && !hasEmpty) return;

  let synced = false;
  for (const name of socialNames) {
    if (getMediaValueAndId(getFormValueAt(formCtx, name)).mediaId) continue;
    try {
      formCtx.onChange(name, metaImageValue);
      synced = true;
    } catch (_) { /* ignore */ }
  }

  if (synced) lastSyncedMetaImageId = metaImageId;
}

// =============================================
// SEO FIELD AUTO-POPULATION
// =============================================

function findInputByShortName(name) {
  const all = document.querySelectorAll('input[name], textarea[name]');
  for (const input of all) {
    if (getShortName(input) === name) return input;
  }
  const byId = document.getElementById(name);
  if (byId && isFormInput(byId)) return byId;
  return null;
}

function autoFillSeoDefaults() {
  if (!isStrapiBlogContentManagerPath()) return;

  const metaRobotsInput = findInputByShortName('metaRobots');
  if (metaRobotsInput && !metaRobotsInput.value) {
    setNativeValue(metaRobotsInput, DEFAULT_META_ROBOTS);
  }

  const metaViewportInput = findInputByShortName('metaViewport');
  if (metaViewportInput && !metaViewportInput.value) {
    setNativeValue(metaViewportInput, DEFAULT_META_VIEWPORT);
  }
}

function findSlugInput() {
  return findInputByShortName('slug') || findFormControlByLabel('slug');
}

function findCanonicalUrlInput() {
  return (
    findInputByShortName('canonicalURL') ||
    findFormControlByLabel('canonicalurl', 'canonical url')
  );
}

function normalizeBlogCanonicalUrl(canonicalUrl, slug) {
  const siteUrl = getSiteUrl();
  const blogBasePath = getBlogBasePath();
  const fallback = `${siteUrl}${blogBasePath}/${slug}`;
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

function autoFillCanonicalURL() {
  if (!isStrapiBlogContentManagerPath()) return;

  const canonicalInput = findCanonicalUrlInput();
  if (!canonicalInput) return;

  const slugInput = findSlugInput();
  const slug = (slugInput?.value || '').trim();
  if (!slug) return;

  const currentValue = (canonicalInput.value || '').trim();
  if (!currentValue) {
    setNativeValue(canonicalInput, `${getSiteUrl()}${getBlogBasePath()}/${slug}`);
  } else {
    const normalized = normalizeBlogCanonicalUrl(currentValue, slug);
    if (canonicalInput.value !== normalized) {
      setNativeValue(canonicalInput, normalized);
    }
  }
}

/**
 * Keeps canonical URL aligned with the slug field (typing, paste, or UID "Regenerate").
 * Regenerate often updates React state after a tick, so callers may schedule retries.
 */
function syncCanonicalToCurrentSlug() {
  if (!isStrapiBlogContentManagerPath()) return;

  const slugInput = findSlugInput();
  const canonicalInput = findCanonicalUrlInput();
  if (!slugInput || !canonicalInput) return;
  const slug = (slugInput.value || '').trim();
  if (!slug) return;
  const currentValue = (canonicalInput.value || '').trim();
  if (!currentValue) {
    const newUrl = `${getSiteUrl()}${getBlogBasePath()}/${slug}`;
    if (canonicalInput.value !== newUrl) {
      setNativeValue(canonicalInput, newUrl);
    }
  } else {
    const normalized = normalizeBlogCanonicalUrl(currentValue, slug);
    if (canonicalInput.value !== normalized) {
      setNativeValue(canonicalInput, normalized);
    }
  }
}

let slugCanonicalClickDebounce = null;
function scheduleSyncCanonicalFromSlug() {
  if (!isStrapiBlogContentManagerPath()) return;

  if (slugCanonicalClickDebounce) {
    clearTimeout(slugCanonicalClickDebounce);
  }
  slugCanonicalClickDebounce = setTimeout(() => {
    slugCanonicalClickDebounce = null;
    syncCanonicalToCurrentSlug();
    setTimeout(syncCanonicalToCurrentSlug, 120);
    setTimeout(syncCanonicalToCurrentSlug, 350);
  }, 40);
}

/**
 * Converts a title string into a URL-friendly slug.
 * Handles accented characters, strips non-alphanumeric chars, and collapses hyphens.
 */
function slugify(text) {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // strip diacritics
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')   // remove non-alphanumeric
    .replace(/[\s_]+/g, '-')         // spaces/underscores → hyphens
    .replace(/-+/g, '-')             // collapse consecutive hyphens
    .replace(/^-+|-+$/g, '');        // trim leading/trailing hyphens
}

/**
 * Auto-fills the slug field from the Title when the slug is empty or was auto-generated.
 * Uses a flag so that once the user manually edits the slug, auto-sync stops.
 */
let _slugAutoFilled = true; // default true so first fill works
let _lastAutoSlug = '';

function autoFillSlugFromTitle() {
  if (!isStrapiBlogContentManagerPath()) return;

  const titleInput =
    findFormControlByLabel('title') || findInputByShortName('Title');
  if (!titleInput || !(titleInput.value || '').trim()) return;

  const slugInput = findSlugInput();
  if (!slugInput) return;

  const currentSlug = (slugInput.value || '').trim();
  const newSlug = slugify(titleInput.value);
  if (!newSlug) return;

  // Only auto-fill when empty or still matches previous auto-generated value
  const isEmpty = !currentSlug;
  const isStillAutoGenerated = _slugAutoFilled && currentSlug === _lastAutoSlug;
  if (!isEmpty && !isStillAutoGenerated) return;

  if (currentSlug !== newSlug) {
    _programmaticUpdate = true;
    setNativeValue(slugInput, newSlug);
    _programmaticUpdate = false;
    _slugAutoFilled = true;
    _lastAutoSlug = newSlug;
    // Cascade: update canonical URL from the new slug
    syncCanonicalToCurrentSlug();
  }
}

function stripHtml(value) {
  if (!value) return '';
  return value.replace(/<[^>]*>/g, ' ').replace(/&\w+;/g, ' ').replace(/\s+/g, ' ').trim();
}

function buildKeywordsText() {
  const titleInput =
    findFormControlByLabel('title') || findInputByShortName('Title');
  const summaryInput =
    findFormControlByLabel('summary') || findInputByShortName('Summary');

  let descriptionHtml =
    findInputByShortName('Description')?.value ||
    document.querySelector('textarea[name="Description"], textarea[name$=".Description"]')?.value ||
    getTinyMceBodyHtml();

  let text = [
    titleInput?.value || '',
    summaryInput?.value || '',
    stripHtml(descriptionHtml),
  ]
    .filter(Boolean)
    .join(' ');

  if (!text) {
    const metaTitle =
      findInputByShortName('metaTitle') ||
      findFormControlByLabel('metatitle', 'meta title');
    const metaDesc =
      findInputByShortName('metaDescription') ||
      findFormControlByLabel('metadescription', 'meta description');
    text = [metaTitle?.value || '', metaDesc?.value || ''].filter(Boolean).join(' ');
  }

  return text;
}

function generateKeywordsFromInputs() {
  const text = buildKeywordsText();
  if (!text) return '';

  const tokens = text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .split(/\s+/)
    .filter((word) => word.length > 2 && !KEYWORD_STOP_WORDS.has(word));

  if (!tokens.length) return '';

  const counts = {};
  tokens.forEach((token) => { counts[token] = (counts[token] || 0) + 1; });

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 12)
    .map(([word]) => word)
    .join(', ');
}

function syncKeywordsFromContent() {
  if (!isStrapiBlogContentManagerPath()) return;

  const keywordsInput = findKeywordsSeoTextarea();
  if (!keywordsInput) return;

  // Only fill when empty — never replace non-empty values (user or previously saved keywords).
  if ((keywordsInput.value || '').trim()) return;

  const nextKeywords = generateKeywordsFromInputs();
  if (nextKeywords && keywordsInput.value !== nextKeywords) {
    setNativeValue(keywordsInput, nextKeywords);
  }
}

/**
 * Auto-fills metaTitle from the blog Title field when metaTitle is empty.
 * After filling, cascades into social title sync and char-count update.
 */
function autoFillMetaTitle() {
  if (!isStrapiBlogContentManagerPath()) return;

  const metaTitleInput =
    findInputByShortName('metaTitle') ||
    findFormControlByLabel('metatitle', 'meta title');
  if (!metaTitleInput || (metaTitleInput.value || '').trim()) return;

  const titleInput =
    findFormControlByLabel('title') || findInputByShortName('Title');
  if (!titleInput || !(titleInput.value || '').trim()) return;

  const truncated = titleInput.value.trim().substring(0, 60);
  if (metaTitleInput.value !== truncated) {
    _programmaticUpdate = true;
    setNativeValue(metaTitleInput, truncated);
    _programmaticUpdate = false;
    autoFilledFlags.metaTitle = true;
    ensureCharCountForInput(metaTitleInput);
    syncMetaToSocialFields(metaTitleInput);
  }
}

/**
 * Live-syncs metaTitle from Title while the field is still auto-filled.
 * Skipped when the user has manually edited metaTitle.
 */
function syncMetaTitleFromTitle() {
  if (!isStrapiBlogContentManagerPath()) return;

  const metaTitleInput =
    findInputByShortName('metaTitle') ||
    findFormControlByLabel('metatitle', 'meta title');
  if (!metaTitleInput) return;

  const titleInput =
    findFormControlByLabel('title') || findInputByShortName('Title');
  if (!titleInput) return;

  const currentTitle = (titleInput.value || '').trim();
  const truncated = currentTitle.substring(0, 60);
  const previousTitleTruncated = (lastObservedTitleValue || '').trim().substring(0, 60);
  const currentMetaTitle = (metaTitleInput.value || '').trim();
  const shouldKeepSynced =
    autoFilledFlags.metaTitle || currentMetaTitle === previousTitleTruncated;
  if (!shouldKeepSynced) return;

  if (metaTitleInput.value !== truncated) {
    _programmaticUpdate = true;
    setNativeValue(metaTitleInput, truncated);
    _programmaticUpdate = false;
    autoFilledFlags.metaTitle = true;
    ensureCharCountForInput(metaTitleInput);
    syncMetaToSocialFields(metaTitleInput);
  }

  lastObservedTitleValue = currentTitle;
}

/**
 * Auto-fills metaDescription from the blog Summary field when metaDescription is empty.
 * After filling, cascades into social description sync and char-count update.
 */
function autoFillMetaDescription() {
  if (!isStrapiBlogContentManagerPath()) return;

  const metaDescInput =
    findInputByShortName('metaDescription') ||
    findFormControlByLabel('metadescription', 'meta description');
  if (!metaDescInput || (metaDescInput.value || '').trim()) return;

  const summaryInput =
    findFormControlByLabel('summary') || findInputByShortName('Summary');
  if (!summaryInput || !(summaryInput.value || '').trim()) return;

  const truncated = summaryInput.value.trim().substring(0, 160);
  if (metaDescInput.value !== truncated) {
    _programmaticUpdate = true;
    setNativeValue(metaDescInput, truncated);
    _programmaticUpdate = false;
    autoFilledFlags.metaDescription = true;
    ensureCharCountForInput(metaDescInput);
    syncMetaToSocialFields(metaDescInput);
  }
}

/**
 * Live-syncs metaDescription from Summary while the field is still auto-filled.
 * Skipped when the user has manually edited metaDescription.
 */
function syncMetaDescFromSummary() {
  if (!isStrapiBlogContentManagerPath()) return;

  const metaDescInput =
    findInputByShortName('metaDescription') ||
    findFormControlByLabel('metadescription', 'meta description');
  if (!metaDescInput) return;

  const summaryInput =
    findFormControlByLabel('summary') || findInputByShortName('Summary');
  if (!summaryInput) return;

  const currentSummary = (summaryInput.value || '').trim();
  const truncated = currentSummary.substring(0, 160);
  const previousSummaryTruncated = (lastObservedSummaryValue || '').trim().substring(0, 160);
  const currentMetaDescription = (metaDescInput.value || '').trim();
  const shouldKeepSynced =
    autoFilledFlags.metaDescription || currentMetaDescription === previousSummaryTruncated;
  if (!shouldKeepSynced) return;

  if (metaDescInput.value !== truncated) {
    _programmaticUpdate = true;
    setNativeValue(metaDescInput, truncated);
    _programmaticUpdate = false;
    autoFilledFlags.metaDescription = true;
    ensureCharCountForInput(metaDescInput);
    syncMetaToSocialFields(metaDescInput);
  }

  lastObservedSummaryValue = currentSummary;
}

// =============================================
// STRUCTURED DATA AUTO-GENERATION (Admin UI)
// =============================================

/** ISO 8601 with timezone for schema.org DateTime (matches server output after save). */
function getSchemaOrgDateTimeNow() {
  return new Date().toISOString();
}

function deriveArticleSectionFromTitle(title) {
  if (!title) return null;
  const stopWords = KEYWORD_STOP_WORDS;
  const words = title
    .replace(/[^a-zA-Z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !stopWords.has(w.toLowerCase()) && !/^\d+$/.test(w));
  const word = words[0];
  if (word && word.toLowerCase() === 'ai') return 'AI Strategy';
  return word ? word.charAt(0).toUpperCase() + word.slice(1) : null;
}

function toAbsoluteUrl(url) {
  if (!url || typeof url !== 'string') return null;
  if (/^https?:\/\//i.test(url)) return url;
  if (!url.startsWith('/')) return `${getSiteUrl()}/${url}`;
  return `${getSiteUrl()}${url}`;
}

function buildStructuredImageObject() {
  const formCtx = getStrapiFormCtx();
  if (!formCtx) return null;
  const metaNames = findFieldNamesByPattern(/(^|\.)metaImage$/);
  if (metaNames.length === 0) return null;
  const { mediaValue } = getMediaValueAndId(getFormValueAt(formCtx, metaNames[0]));
  if (!mediaValue || typeof mediaValue !== 'object') return null;

  const imageUrl = toAbsoluteUrl(mediaValue.url);
  if (!imageUrl) return null;

  const imageObject = { '@type': 'ImageObject', url: imageUrl };
  if (mediaValue.width) imageObject.width = mediaValue.width;
  if (mediaValue.height) imageObject.height = mediaValue.height;
  return imageObject;
}

function estimateWordCountFromText(text) {
  const clean = (text || '').replace(/\s+/g, ' ').trim();
  if (!clean) return null;
  const words = clean.split(' ').filter(Boolean);
  return words.length > 0 ? words.length : null;
}

function toIso8601DurationMinutes(wordCount) {
  if (!Number.isFinite(wordCount) || wordCount <= 0) return null;
  const minutes = Math.max(1, Math.ceil(wordCount / 200));
  return `PT${minutes}M`;
}

function buildWebsiteSchema() {
  const orgSettings = getOrgSettings();
  const publisher = {
    '@type': 'Organization',
    name: orgSettings.orgName,
    url: orgSettings.siteUrl,
  };
  if (orgSettings.orgLogoUrl) {
    publisher.logo = { '@type': 'ImageObject', url: orgSettings.orgLogoUrl };
  }
  if (orgSettings.orgSameAs.length > 0) {
    publisher.sameAs = orgSettings.orgSameAs;
  }

  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: orgSettings.orgName,
    url: orgSettings.siteUrl,
    ...(orgSettings.orgDescription ? { description: orgSettings.orgDescription } : {}),
    inLanguage: orgSettings.orgLanguage,
    publisher,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: orgSettings.searchActionUrlTemplate
          || `${orgSettings.siteUrl}/search?q={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

function buildBreadcrumbSchema(canonical, headline) {
  const orgSettings = getOrgSettings();
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: orgSettings.siteUrl },
      {
        '@type': 'ListItem',
        position: 2,
        name: 'Blog',
        item: `${orgSettings.siteUrl}${orgSettings.blogBasePath}`,
      },
      {
        '@type': 'ListItem',
        position: 3,
        name: headline || 'Article',
        item: canonical || orgSettings.siteUrl,
      },
    ],
  };
}

/**
 * Builds the structured data JSON object from current form field values.
 * Used to populate structuredDataText live in the admin UI.
 * Datetimes use “now” in the admin preview; author name may be partial — lifecycle fills precisely on save.
 */
function buildStructuredDataJson() {
  const metaTitleInput =
    findInputByShortName('metaTitle') || findFormControlByLabel('metatitle', 'meta title');
  const metaDescInput =
    findInputByShortName('metaDescription') || findFormControlByLabel('metadescription', 'meta description');
  const canonicalInput =
    findInputByShortName('canonicalURL') || findFormControlByLabel('canonicalurl', 'canonical url');
  const keywordsInput = findKeywordsSeoTextarea();
  const titleInput =
    findFormControlByLabel('title') || findInputByShortName('Title');
  const summaryInput =
    findFormControlByLabel('summary') || findInputByShortName('Summary');
  const authorName = getSelectedRelationName('author')

  // Prefer current content fields so the live preview mirrors editor input.
  const headline = (titleInput?.value || metaTitleInput?.value || '').trim();
  const description = (summaryInput?.value || metaDescInput?.value || '').trim();
  if (!headline && !description) return null;

  const orgSettings = getOrgSettings();
  const canonical = (canonicalInput?.value || '').trim() || orgSettings.siteUrl;
  const keywordsStr = (keywordsInput?.value || '').trim();
  const keywordsArray = keywordsStr
    ? keywordsStr.split(',').map((k) => k.trim()).filter(Boolean)
    : [];
  const structuredKeywords = keywordsArray.slice(0, 8).join(', ');
  const aboutThings = keywordsArray.slice(0, 4).map((name) => ({ '@type': 'Thing', name }));

  const nowIso = getSchemaOrgDateTimeNow();
  const articleSection = deriveArticleSectionFromTitle(titleInput?.value || headline);
  const imageObject = buildStructuredImageObject();
  const wordCount = estimateWordCountFromText(description);
  const timeRequired = toIso8601DurationMinutes(wordCount);

  const structured = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    mainEntityOfPage: { '@type': 'WebPage', '@id': canonical },
    url: canonical,
    headline,
    description,
    author: {
      '@type': 'Person',
      name: authorName || orgSettings.defaultAuthorName || 'Unknown Author',
      url: orgSettings.defaultAuthorUrl || `${orgSettings.siteUrl}/about`,
    },
    publisher: {
      '@type': 'Organization',
      name: orgSettings.orgName,
      ...(orgSettings.orgLogoUrl
        ? { logo: { '@type': 'ImageObject', url: orgSettings.orgLogoUrl } }
        : {}),
    },
    datePublished: nowIso,
    dateModified: nowIso,
    inLanguage: orgSettings.orgLanguage,
  };

  if (imageObject) structured.image = imageObject;
  if (articleSection) structured.articleSection = articleSection;
  if (structuredKeywords) structured.keywords = structuredKeywords;
  if (aboutThings.length > 0) structured.about = aboutThings;
  if (wordCount) structured.wordCount = wordCount;
  if (timeRequired) structured.timeRequired = timeRequired;

  return structured;
}

/**
 * Regenerates the structuredDataText textarea with a <script type="application/ld+json">
 * block built from the current form values. Always overwrites so the preview stays
 * in sync with what the editor is typing (real-time update).
 */
function autoFillStructuredDataText() {
  if (!isStrapiBlogContentManagerPath()) return;

  const structuredInput =
    findInputByShortName('structuredData') ||
    findFormControlByLabel('structureddata', 'structured data');
  const textInput =
    findInputByShortName('structuredDataText') ||
    findFormControlByLabel('structureddatatext', 'structured data text');
  if (!textInput && !structuredInput) return;

  // Prevent edit pages from being marked dirty on open:
  // only auto-generate on create pages or when the fields are blank.
  const isCreate = isStrapiBlogCreatePath();
  const hasText = Boolean((textInput?.value || '').trim());
  const hasStructured = Boolean((structuredInput?.value || '').trim());
  if (!isCreate && (hasText || hasStructured)) return;

  const structured = buildStructuredDataJson();
  if (!structured) return;

  const websiteSchema = buildWebsiteSchema();
  const breadcrumbSchema = buildBreadcrumbSchema(structured.url, structured.headline);
  const scriptTag = [
    `<script type="application/ld+json">\n${JSON.stringify(structured, null, 2)}\n<\/script>`,
    `<script type="application/ld+json">\n${JSON.stringify(websiteSchema, null, 2)}\n<\/script>`,
    `<script type="application/ld+json">\n${JSON.stringify(breadcrumbSchema, null, 2)}\n<\/script>`,
  ].join('\n');
  if (textInput && textInput.value !== scriptTag) {
    setNativeValue(textInput, scriptTag);
    ensureCharCountForInput(textInput);
  }

  const structuredJson = JSON.stringify(structured, null, 2);
  if (structuredInput && structuredInput.value !== structuredJson) {
    setNativeValue(structuredInput, structuredJson);
  }
}

// =============================================
// BLOG RANK (auto-prefill on create)
// =============================================

function isStrapiBlogContentManagerPath() {
  try {
    const p = window.location.pathname || '';
    return p.includes('api::blog.blog');
  } catch {
    return false;
  }
}

function isStrapiBlogCreatePath() {
  try {
    const p = window.location.pathname || '';
    return p.includes('api::blog.blog') && p.includes('/create');
  } catch {
    return false;
  }
}

let _blogRankFetched = false;
let _blogRankLastPath = '';

async function fetchNextBlogRank() {
  try {
    const res = await fetch(
      '/api/blogs?sort=rank:desc&pagination[pageSize]=1&fields[0]=rank&publicationState=preview',
      { credentials: 'include' }
    );
    if (!res.ok) return null;
    const json = await res.json();
    const top = json?.data?.[0]?.attributes?.rank ?? json?.data?.[0]?.rank ?? 0;
    const n = Number(top);
    return (Number.isFinite(n) ? n : 0) + 1;
  } catch {
    return null;
  }
}

function configureBlogRankFieldAuto() {
  if (!isStrapiBlogContentManagerPath()) return;

  const rankInput =
    findInputByShortName('rank') ||
    document.querySelector('input#rank, input[name="rank"]');
  if (!rankInput || !isFormInput(rankInput)) return;

  rankInput.removeAttribute('readonly');
  rankInput.removeAttribute('aria-readonly');

  const currentPath = window.location.pathname;
  if (currentPath !== _blogRankLastPath) {
    _blogRankFetched = false;
    _blogRankLastPath = currentPath;
  }

  if (isStrapiBlogCreatePath()) {
    rankInput.setAttribute(
      'title',
      'Auto-filled with the next rank. Change it to reorder manually.'
    );

    if (!_blogRankFetched) {
      _blogRankFetched = true;
      fetchNextBlogRank().then((nextRank) => {
        if (nextRank == null) return;
        const current = rankInput.value;
        if (!current || current === '0' || current === '0.0' || current === 'NaN') {
          setNativeValue(rankInput, String(nextRank));
        }
      });
    }
  } else {
    rankInput.removeAttribute('title');
  }
}

// =============================================
// ATTACH LISTENERS & OBSERVER
// =============================================

/**
 * Our injected nodes update often (textContent). With subtree: true the MutationObserver
 * would see those as new nodes and call attachAll in a loop → tab crash ("Aw Snap").
 */
function shouldIgnoreMutationForZdInjections(mutation) {
  const t = mutation.target;
  if (t && t.nodeType === Node.ELEMENT_NODE && t.classList?.contains?.('zd-char-count')) {
    return true;
  }
  if (mutation.type !== 'childList') {
    return false;
  }
  for (const n of mutation.addedNodes) {
    if (n.nodeType === Node.TEXT_NODE) {
      if (n.parentElement?.classList?.contains('zd-char-count')) return true;
      continue;
    }
    if (n.nodeType === Node.ELEMENT_NODE) {
      if (n.classList?.contains('zd-char-count')) return true;
      if (n.classList?.contains('zd-social-size-hint')) return true;
    }
  }
  return false;
}

/**
 * Named controls plus id-only textareas/inputs (Strapi DS), deduped.
 */
function queryCharCountTargets(container) {
  const seen = new Set();
  const list = [];
  function add(el) {
    if (!el || seen.has(el)) return;
    seen.add(el);
    list.push(el);
  }
  container.querySelectorAll('input[name], textarea[name]').forEach(add);
  container
    .querySelectorAll('textarea:not([name])[id], input:not([name])[id]')
    .forEach(add);
  return list;
}

function attachAll(container) {
  const inputs = queryCharCountTargets(container);

  inputs.forEach((input) => {
    const shortName = getShortName(input);
    if (
      !input.dataset.zdMetaSyncInit &&
      (shortName === 'metaTitle' || shortName === 'metaDescription')
    ) {
      input.dataset.zdMetaSyncInit = 'true';
      setTimeout(() => {
        if (input.value) {
          syncMetaToSocialFields(input);
        }
      }, 300);
    }
  });

  inputs.forEach((input) => {
    ensureCharCountForInput(input);
  });

  // Auto-fill SEO defaults when the SEO section fields appear
  setTimeout(() => {
    autoFillSeoDefaults();
    autoFillMetaTitle();
    autoFillMetaDescription();
    autoFillSlugFromTitle();
    autoFillCanonicalURL();
    syncCanonicalToCurrentSlug();
    syncKeywordsFromContent();
    autoFillStructuredDataText();
    injectSocialImageSizeHints();
    configureBlogRankFieldAuto();

    // Prime previous values on edit pages so first title/summary change can
    // still sync meta fields when they were originally auto-generated.
    const titleInput =
      findFormControlByLabel('title') || findInputByShortName('Title');
    if (titleInput) {
      lastObservedTitleValue = (titleInput.value || '').trim();
    }
    const summaryInput =
      findFormControlByLabel('summary') || findInputByShortName('Summary');
    if (summaryInput) {
      lastObservedSummaryValue = (summaryInput.value || '').trim();
    }
    // Prime slug auto-fill state on edit pages
    const slugInput = findSlugInput();
    if (slugInput && slugInput.value) {
      _lastAutoSlug = slugInput.value.trim();
    }
  }, 400);
}

/**
 * Periodically re-sync in case the SEO component was opened/toggled after initial load.
 * This catches the case where the user hasn't opened the SEO dropdown yet.
 */
function periodicSync() {
  const allInputs = queryCharCountTargets(document.body);

  allInputs.forEach((input) => {
    const shortName = getShortName(input);
    if ((shortName === 'metaTitle' || shortName === 'metaDescription') && input.value) {
      syncMetaToSocialFields(input);
    }
  });
  autoFillMetaTitle();
  autoFillMetaDescription();
  syncKeywordsFromContent();
  autoFillStructuredDataText();
  syncCanonicalToCurrentSlug();
  syncCoverImageToMetaImage();
  syncMetaImageToSocialFibers();
  injectSocialImageSizeHints();
  configureBlogRankFieldAuto();
}

const bootstrap = (app) => {
  if (typeof window !== 'undefined') {
    let zdCharCountLastTheme = getEffectiveAdminTheme();

    const syncCharCountColorsToTheme = () => {
      const next = getEffectiveAdminTheme();
      if (next === zdCharCountLastTheme) return;
      zdCharCountLastTheme = next;
      refreshAllCharCountStyles();
    };

    const startObserver = () => {
      // Initial scan
      attachAll(document.body);
      zdCharCountLastTheme = getEffectiveAdminTheme();

      setInterval(syncCharCountColorsToTheme, 1000);
      // Keep media sync resilient when Strapi updates existing React nodes
      // without adding DOM nodes (MutationObserver won't fire in that case).
      setInterval(() => {
        syncCoverImageToMetaImage();
        syncMetaImageToSocialFibers();
      }, 1200);
      try {
        window
          .matchMedia('(prefers-color-scheme: dark)')
          .addEventListener('change', syncCharCountColorsToTheme);
      } catch (_) {
        /* matchMedia addEventListener not supported */
      }
      window.addEventListener('storage', (e) => {
        if (e.key === STRAPI_THEME_STORAGE_KEY) syncCharCountColorsToTheme();
      });

      const handleLiveUpdate = (event) => {
        const target = event.target;
        if (!isFormInput(target)) return;

        ensureCharCountForInput(target);

        const shortName = getShortName(target);
        const fullName = getFullName(target);
        const isSocialField = /[sS][eE][oO]\.metaSocial\.\d+\./.test(fullName);

        // Only clear auto-filled flags on genuine user input, not programmatic setNativeValue calls
        if (!_programmaticUpdate) {
          if (isSocialField && shortName === 'title') {
            autoFilledFlags.socialTitle = false;
          }
          if (isSocialField && shortName === 'description') {
            autoFilledFlags.socialDescription = false;
          }
          if (shortName === 'metaTitle') {
            autoFilledFlags.metaTitle = false;
          }
          if (shortName === 'metaDescription') {
            autoFilledFlags.metaDescription = false;
          }
        }

        if (shortName === 'metaTitle') {
          setTimeout(() => syncMetaToSocialFields(target), 0);
        }
        if (shortName === 'metaDescription') {
          setTimeout(() => syncMetaToSocialFields(target), 0);
        }
        if (shortName === 'slug') {
          if (!_programmaticUpdate) {
            _slugAutoFilled = false;
          }
          setTimeout(() => syncCanonicalToCurrentSlug(), 0);
          scheduleSyncCanonicalFromSlug();
        }
        if (shortName === 'Title') {
          setTimeout(() => { autoFillMetaTitle(); syncMetaTitleFromTitle(); }, 0);
          setTimeout(() => autoFillSlugFromTitle(), 0);
          setTimeout(() => syncKeywordsFromContent(), 0);
          setTimeout(() => autoFillStructuredDataText(), 50);
        }
        if (shortName === 'Summary') {
          setTimeout(() => { autoFillMetaDescription(); syncMetaDescFromSummary(); }, 0);
          setTimeout(() => syncKeywordsFromContent(), 0);
          setTimeout(() => autoFillStructuredDataText(), 50);
        }
        if (shortName === 'Description' || shortName === 'metaTitle' || shortName === 'metaDescription') {
          setTimeout(() => syncKeywordsFromContent(), 0);
          setTimeout(() => autoFillStructuredDataText(), 50);
        }
        if (shortName === 'keywords' || shortName === 'canonicalURL') {
          setTimeout(() => autoFillStructuredDataText(), 50);
        }
      };

      document.addEventListener('input', handleLiveUpdate, true);
      document.addEventListener('change', handleLiveUpdate, true);
      document.addEventListener('focusin', handleLiveUpdate, true);
      document.addEventListener('click', scheduleSyncCanonicalFromSlug, true);

      // Detect author relation changes (select from dropdown / remove button).
      // The author combobox and its list are inside a wrapper labelled "author".
      // Any click inside that wrapper or on a dropdown option may change the relation.
      document.addEventListener('click', (e) => {
        if (!isStrapiBlogContentManagerPath()) return;
        const target = e.target;
        // Remove-relation button (data-testid="remove-relation-*")
        const removeBtn = target.closest('button[data-testid^="remove-relation"]');
        // Click inside the author combobox wrapper or a listbox option
        const authorCombo = target.closest('[id="author"], [aria-controls]');
        const listboxOption = target.closest('[role="option"]');
        if (removeBtn || authorCombo || listboxOption) {
          // Delay to let React state settle after the relation change
          setTimeout(() => autoFillStructuredDataText(), 150);
          setTimeout(() => autoFillStructuredDataText(), 500);
        }
      }, true);

      // When any button is clicked (media picker "Finish" / "Select" / confirm),
      // schedule a sync so the newly picked metaImage propagates to social fields.
      document.addEventListener('click', (e) => {
        const btn = e.target.closest('button');
        if (!btn) return;
        const btnText = (btn.textContent || '').trim().toLowerCase();
        // Common confirm button labels in Strapi's media library dialog
        if (
          btnText.includes('finish') ||
          btnText.includes('select') ||
          btnText.includes('choose') ||
          btnText.includes('upload') ||
          btnText.includes('done')
        ) {
          // Sync CoverImage → metaImage first, then metaImage → social fields
          setTimeout(() => syncCoverImageToMetaImage(), 200);
          setTimeout(() => syncCoverImageToMetaImage(), 600);
          setTimeout(() => syncMetaImageToSocialFibers(), 300);
          setTimeout(() => syncMetaImageToSocialFibers(), 800);
          setTimeout(() => syncMetaImageToSocialFibers(), 1400);
        }
      }, true);

      let lastObservedPath = window.location.pathname;
      let observerAttachTimer = null;
      const scheduleObserverFollowUps = () => {
        setTimeout(() => periodicSync(), 200);
        setTimeout(() => syncCoverImageToMetaImage(), 250);
        setTimeout(() => syncMetaImageToSocialFibers(), 300);
        setTimeout(() => syncMetaImageToSocialFibers(), 800);
        setTimeout(() => injectSocialImageSizeHints(), 500);
      };

      // Watch for new fields appearing (navigation, accordions opening, etc.)
      const observer = new MutationObserver((mutations) => {
        let hasNewNodes = false;
        for (const mutation of mutations) {
          if (shouldIgnoreMutationForZdInjections(mutation)) continue;
          if (mutation.addedNodes.length > 0) {
            hasNewNodes = true;
            break;
          }
        }
        if (!hasNewNodes) return;

        if (observerAttachTimer) clearTimeout(observerAttachTimer);
        observerAttachTimer = setTimeout(() => {
          observerAttachTimer = null;
          // Reset auto-fill flags on navigation so stale state doesn't carry over
          const currentPath = window.location.pathname;
          if (currentPath !== lastObservedPath) {
            lastObservedPath = currentPath;
            autoFilledFlags.metaTitle = true;
            autoFilledFlags.metaDescription = true;
            autoFilledFlags.socialTitle = true;
            autoFilledFlags.socialDescription = true;
            lastObservedTitleValue = null;
            lastObservedSummaryValue = null;
            lastSyncedCoverImageId = null;
            lastSyncedMetaImageId = null;
            _blogRankFetched = false;
            _slugAutoFilled = true;
            _lastAutoSlug = '';
          }
          attachAll(document.body);
          scheduleObserverFollowUps();
        }, 100);
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
      });
    };

    const startObserverAfterOrgSettings = () => {
      hydrateOrganizationSettings().finally(() => {
        setTimeout(startObserver, 1000);
      });
    };

    if (document.readyState === 'complete') {
      startObserverAfterOrgSettings();
    } else {
      window.addEventListener('load', startObserverAfterOrgSettings);
    }
  }
};

const register = (app) => {
  registerSidePanels(app);
};

export default {
  config,
  register,
  bootstrap,
};
