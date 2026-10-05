'use strict';

/**
 * "Draft with AI" for pages: a brief in, an unpublished page draft out, built
 * only from the text-based section types (intro, text, offerings, steps,
 * bullet grids, callout, FAQ) plus the SEO title, description and focus
 * keyword. Images, case studies, testimonials and so on are left for the
 * editor; nothing is ever published by this.
 *
 * Uses OpenAI like the blog summaries (OPENAI_API_KEY; model
 * OPENAI_PAGE_DRAFT_MODEL, default gpt-4o-mini) with a strict JSON schema, and
 * then checks every value again before saving. CMS_AI_DEMO=true returns a
 * fixed sample draft instead, for trying the flow without a key.
 */

const { errors } = require('@strapi/utils');

const MODEL = () => process.env.OPENAI_PAGE_DRAFT_MODEL || 'gpt-4o-mini';
const demo = () => process.env.CMS_AI_DEMO === 'true';

function openAI() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'tobemodified' || apiKey.startsWith('sk-REPLACE')) return null;
  const OpenAI = require('openai');
  return new OpenAI({ apiKey });
}

// ── The JSON the model must return (OpenAI strict mode: every key required, nulls allowed) ──

const str = (description) => ({ type: ['string', 'null'], ...(description ? { description } : {}) });
const obj = (properties) => ({ type: 'object', additionalProperties: false, required: Object.keys(properties), properties });
const arr = (items, description) => ({ type: 'array', items, ...(description ? { description } : {}) });
const kind = (name) => ({ type: 'string', enum: [name] });
const bullet = obj({ title: str(), description: str() });

const SECTIONS = {
  'page-intro': obj({ type: kind('page-intro'), label: str('Small caption above the title, e.g. "AI Services"'), title: str('Page heading; wrap 1–3 key words in *single asterisks* for the brand gradient'), lead: str('1–2 sentence introduction') }),
  'rich-text': obj({ type: kind('rich-text'), markdown: str('Body copy in simple Markdown: ## headings, paragraphs, - lists, **bold**') }),
  'service-offerings': obj({
    type: kind('service-offerings'),
    title: str(),
    items: arr(obj({ title: str(), description: str(), points: arr(bullet) }), '3–6 offerings'),
  }),
  'process-steps': obj({ type: kind('process-steps'), title: str(), steps: arr(obj({ title: str(), description: str() }), '3–6 steps in order') }),
  'bullet-grid': obj({ type: kind('bullet-grid'), title: str(), lead: str(), items: arr(bullet, '3–9 short points, e.g. benefits') }),
  'bullet-groups': obj({ type: kind('bullet-groups'), title: str(), groups: arr(obj({ title: str(), items: arr(bullet) }), '2–4 groups') }),
  callout: obj({ type: kind('callout'), title: str(), markdown: str('A short call to action in simple Markdown') }),
  faq: obj({ type: kind('faq'), title: str(), items: arr(obj({ question: str(), answer: str() }), '4–8 questions a buyer would ask') }),
};

const DRAFT_SCHEMA = obj({
  pageName: { type: 'string', description: 'Short page name for the CMS, e.g. "AI Chatbots for Real Estate"' },
  path: { type: 'string', description: 'URL path, lowercase words joined by hyphens, starting with /, e.g. /services/ai-chatbots-real-estate' },
  seo: obj({
    metaTitle: { type: 'string', description: 'At most 60 characters, includes the focus keyword' },
    metaDescription: { type: 'string', description: '120–160 characters, includes the focus keyword' },
    focusKeyword: { type: 'string', description: 'The main search phrase the page should rank for' },
  }),
  sections: arr({ anyOf: Object.values(SECTIONS) }, 'Start with page-intro; usually 4–7 sections; end with faq and/or callout'),
});

const SYSTEM = `You draft web pages for Zuse Digital, an award-winning Australian agency for websites, web and mobile apps, AI products and SEO (based in Melbourne, founded 2014).
Write in Australian English, confident and plain-spoken, no hype words like "revolutionary" or "cutting-edge", no emojis.
Build the page only from the section types in the schema. Be specific to the brief; never invent statistics, client names, prices, awards or guarantees.
Keep titles short. Descriptions are 1–3 sentences. The page is a draft an editor will review.`;

// ── Turning the model's JSON into CMS page data, checking everything ──

const MAX = { line: 160, text: 700, markdown: 6000, items: 12 };
const clean = (value, max = MAX.text) => (typeof value === 'string' ? value.replace(/[ \t]+\n/g, '\n').trim().slice(0, max) || null : null);
const items = (value) => (Array.isArray(value) ? value.slice(0, MAX.items) : []);

/** Inline **bold** → Strapi blocks text nodes. */
function inline(text) {
  return text
    .split(/(\*\*[^*]+\*\*)/g)
    .filter(Boolean)
    .map((part) => (/^\*\*[^*]+\*\*$/.test(part) ? { type: 'text', text: part.slice(2, -2), bold: true } : { type: 'text', text: part }));
}

/** Simple Markdown (## headings, paragraphs, - / 1. lists, **bold**) → Strapi blocks. */
function markdownToBlocks(markdown) {
  const blocks = [];
  for (const chunk of String(markdown || '').replace(/\r/g, '').split(/\n\s*\n/)) {
    const lines = chunk.split('\n').map((line) => line.trim()).filter(Boolean);
    if (!lines.length) continue;
    const heading = /^(#{1,4})\s+(.+)$/.exec(lines[0]);
    if (heading && lines.length === 1) {
      blocks.push({ type: 'heading', level: Math.min(4, Math.max(2, heading[1].length)), children: inline(heading[2]) });
      continue;
    }
    if (lines.every((line) => /^[-*]\s+/.test(line)) || lines.every((line) => /^\d+[.)]\s+/.test(line))) {
      const ordered = /^\d/.test(lines[0]);
      blocks.push({
        type: 'list',
        format: ordered ? 'ordered' : 'unordered',
        children: lines.map((line) => ({ type: 'list-item', children: inline(line.replace(/^([-*]|\d+[.)])\s+/, '')) })),
      });
      continue;
    }
    if (heading) {
      blocks.push({ type: 'heading', level: Math.min(4, Math.max(2, heading[1].length)), children: inline(heading[2]) });
      lines.shift();
    }
    if (lines.length) blocks.push({ type: 'paragraph', children: inline(lines.join(' ')) });
  }
  return blocks.length ? blocks : null;
}

const bullets = (list) =>
  items(list)
    .map((item) => ({ title: clean(item && item.title, MAX.line), description: clean(item && item.description) }))
    .filter((item) => item.title || item.description);

/** One section from the model → CMS section data, or null when it's empty or unknown. */
function toSection(section) {
  if (!section || typeof section !== 'object') return null;
  const title = clean(section.title, MAX.line);
  switch (section.type) {
    case 'page-intro':
      return title ? { __component: 'sections.page-intro', label: clean(section.label, MAX.line), title, lead: clean(section.lead) } : null;
    case 'rich-text': {
      const body = markdownToBlocks(clean(section.markdown, MAX.markdown));
      return body ? { __component: 'sections.rich-text', body } : null;
    }
    case 'service-offerings': {
      const list = items(section.items)
        .map((item) => ({ title: clean(item && item.title, MAX.line), description: clean(item && item.description), points: bullets(item && item.points) }))
        .filter((item) => item.title);
      return list.length ? { __component: 'sections.service-offerings', title, items: list } : null;
    }
    case 'process-steps': {
      const steps = items(section.steps)
        .map((step) => ({ title: clean(step && step.title, MAX.line), description: clean(step && step.description) }))
        .filter((step) => step.title);
      return steps.length ? { __component: 'sections.process-steps', title, steps } : null;
    }
    case 'bullet-grid': {
      const list = bullets(section.items);
      return list.length ? { __component: 'sections.bullet-grid', title, lead: clean(section.lead), items: list } : null;
    }
    case 'bullet-groups': {
      const groups = items(section.groups)
        .map((group) => ({ title: clean(group && group.title, MAX.line), items: bullets(group && group.items) }))
        .filter((group) => group.title && group.items.length);
      return groups.length ? { __component: 'sections.bullet-groups', title, groups } : null;
    }
    case 'callout': {
      const body = markdownToBlocks(clean(section.markdown, MAX.markdown));
      return title || body ? { __component: 'sections.callout', title, body } : null;
    }
    case 'faq': {
      const list = items(section.items)
        .map((item) => ({ question: clean(item && item.question, 300), answer: clean(item && item.answer, 1500) }))
        .filter((item) => item.question && item.answer);
      return list.length ? { __component: 'sections.faq', title, items: list } : null;
    }
    default:
      return null;
  }
}

/** "/Services/AI Chatbots!" → "/services/ai-chatbots" */
function cleanPath(path, fallbackName) {
  const words = String(path || fallbackName || 'new-page')
    .toLowerCase()
    .split('/')
    .map((part) => part.normalize('NFKD').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, ''))
    .filter(Boolean);
  return `/${(words.length ? words : ['new-page']).join('/')}`.slice(0, 120);
}

/** The model's JSON → page data for the CMS (Name, slug, path, seo, sections). Throws if nothing usable came back. */
function toPageData(draft) {
  const name = clean(draft && draft.pageName, 80) || 'AI draft';
  const sections = items(draft && draft.sections).map(toSection).filter(Boolean);
  if (!sections.length) throw new errors.ApplicationError('The AI returned no usable sections. Try a more detailed brief.');
  const seo = (draft && draft.seo) || {};
  const path = cleanPath(draft && draft.path, name);
  return {
    Name: name,
    path,
    slug: path.split('/').filter(Boolean).join('-'),
    seo: {
      metaTitle: clean(seo.metaTitle, 60),
      metaDescription: clean(seo.metaDescription, 160),
      focusKeyword: clean(seo.focusKeyword, 80),
    },
    sections,
  };
}

/** A fixed draft for CMS_AI_DEMO (no API call). */
function demoDraft(brief) {
  const topic = brief.split(/[.\n]/)[0].slice(0, 60).trim() || 'New service';
  return {
    pageName: `${topic} (demo draft)`,
    path: `/demo/${topic}`,
    seo: { metaTitle: `${topic} | Zuse Digital`, metaDescription: `Demo draft for “${topic}”. Replace this with a real description of 120–160 characters before publishing the page.`, focusKeyword: topic.toLowerCase() },
    sections: [
      { type: 'page-intro', label: 'Demo draft', title: `${topic} that *works*`, lead: 'This is a sample draft (CMS_AI_DEMO). With an OpenAI key, this text is written from your brief.' },
      { type: 'bullet-grid', title: 'Why it matters', lead: null, items: [{ title: 'Clear goals', description: 'Sample point.' }, { title: 'Fast delivery', description: 'Sample point.' }, { title: 'Measured results', description: 'Sample point.' }] },
      { type: 'process-steps', title: 'How we work', steps: [{ title: 'Discover', description: 'Sample step.' }, { title: 'Design', description: 'Sample step.' }, { title: 'Build', description: 'Sample step.' }, { title: 'Launch', description: 'Sample step.' }] },
      { type: 'rich-text', markdown: '## About this draft\n\nA **sample** paragraph.\n\n- First point\n- Second point' },
      { type: 'faq', title: 'Questions', items: [{ question: 'Is this a real draft?', answer: 'No, it is the demo sample.' }] },
      { type: 'callout', title: 'Ready to talk?', markdown: 'Book a **free estimation call**.' },
    ],
  };
}

module.exports = ({ strapi }) => ({
  available: () => demo() || Boolean(openAI()),

  /**
   * Creates an unpublished page from a brief and returns its documentId.
   * { brief, audience?, tone? } — the brief is required (20–3000 characters).
   */
  async create({ brief, audience, tone } = {}) {
    const text = typeof brief === 'string' ? brief.trim() : '';
    if (text.length < 20) throw new errors.ValidationError('Describe the page in at least a sentence or two (20+ characters).');
    if (text.length > 3000) throw new errors.ValidationError('Keep the brief under 3000 characters.');

    let draft;
    if (demo() && !openAI()) {
      draft = demoDraft(text);
    } else {
      const client = openAI();
      if (!client) throw new errors.ApplicationError('AI drafts need OPENAI_API_KEY in Strapi’s environment.');
      const existing = await strapi.documents('api::page.page').findMany({ status: 'draft', fields: ['Name', 'path'], limit: 200 });
      const user = [
        `Brief:\n${text}`,
        audience ? `Audience: ${String(audience).slice(0, 200)}` : null,
        tone ? `Tone: ${String(tone).slice(0, 100)}` : null,
        `Existing pages (avoid their paths; you may mention them): ${existing.map((page) => `${page.Name} ${page.path || ''}`.trim()).join('; ')}`,
      ]
        .filter(Boolean)
        .join('\n\n');
      let completion;
      try {
        completion = await client.chat.completions.create({
          model: MODEL(),
          temperature: 0.6,
          max_tokens: 4000,
          response_format: { type: 'json_schema', json_schema: { name: 'page_draft', strict: true, schema: DRAFT_SCHEMA } },
          messages: [
            { role: 'system', content: SYSTEM },
            { role: 'user', content: user },
          ],
        });
      } catch (error) {
        strapi.log.error(`[page-draft] OpenAI: ${error.message}`);
        throw new errors.ApplicationError('The AI service didn’t respond. Try again in a minute.');
      }
      const message = completion.choices && completion.choices[0] && completion.choices[0].message;
      if (!message || message.refusal) throw new errors.ApplicationError('The AI declined this brief. Try rewording it.');
      try {
        draft = JSON.parse(message.content);
      } catch {
        throw new errors.ApplicationError('The AI returned an unreadable draft. Try again.');
      }
    }

    const data = toPageData(draft);
    // Paths are unique: add -2, -3… when the suggested one is taken.
    const pages = strapi.documents('api::page.page');
    const base = data.path;
    for (let n = 2; await pages.findFirst({ status: 'draft', filters: { $or: [{ path: data.path }, { slug: data.slug }] }, fields: ['documentId'] }); n++) {
      data.path = `${base}-${n}`;
      data.slug = data.path.split('/').filter(Boolean).join('-');
    }
    const created = await strapi.service('api::cms.cms').create('page', data);
    return { documentId: created.data.documentId, name: data.Name, demo: demo() && !openAI(), sections: data.sections.length };
  },
});

// For tests.
module.exports.toPageData = toPageData;
module.exports.markdownToBlocks = markdownToBlocks;
module.exports.cleanPath = cleanPath;
module.exports.DRAFT_SCHEMA = DRAFT_SCHEMA;
