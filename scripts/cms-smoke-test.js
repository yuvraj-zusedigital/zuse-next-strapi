'use strict';

/**
 * End-to-end smoke test for the Zuse CMS API (src/api/cms) against a running
 * Strapi. Creates "[smoke]" entries and a tiny image, and deletes them again
 * (also when a check fails). Safe to run on local and staging. Needs an Admin
 * or Super Admin account, since Editors can't delete.
 *
 *   CMS_EDITOR_EMAIL=… CMS_EDITOR_PASSWORD=… npm run cms:smoke-test
 *   STRAPI_URL=https://stagingstrapi.zusedigital.com … npm run cms:smoke-test
 *
 * Exits 1 if any check fails.
 */

const BASE = (process.env.STRAPI_URL || 'http://localhost:1338').replace(/\/$/, '');
const { CMS_EDITOR_EMAIL: email, CMS_EDITOR_PASSWORD: password } = process.env;

let token = null;
let failures = 0;
const cleanup = [];

const check = (name, ok, detail = '') => {
  if (!ok) failures += 1;
  console.log(`${ok ? '✓' : '✗'} ${name}${!ok && detail ? ` — ${detail}` : ''}`);
};

async function api(method, path, body, { auth = true, raw = false } = {}) {
  const headers = {};
  if (auth && token) headers.Authorization = `Bearer ${token}`;
  if (body && !(body instanceof FormData)) headers['Content-Type'] = 'application/json';
  const response = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
  });
  const json = raw ? null : await response.json().catch(() => null);
  return { status: response.status, json };
}

async function main() {
  if (!email || !password) {
    console.error('Set CMS_EDITOR_EMAIL and CMS_EDITOR_PASSWORD (an Admin or Super Admin account).');
    process.exit(1);
  }
  console.log(`Zuse CMS smoke test → ${BASE}\n`);

  // ── Auth ──
  const wrong = await api('POST', '/api/cms/login', { identifier: email, password: `${password}-wrong` }, { auth: false });
  check('wrong password is rejected', wrong.status === 400, `got ${wrong.status}`);
  const login = await api('POST', '/api/cms/login', { identifier: email, password }, { auth: false });
  check('editor can sign in', login.status === 200 && login.json && login.json.jwt, `got ${login.status}`);
  if (!login.json || !login.json.jwt) throw new Error('Cannot continue without a session');
  token = login.json.jwt;

  const anonymous = await api('GET', '/api/cms/schema', null, { auth: false });
  check('CMS API refuses anonymous requests', anonymous.status === 403, `got ${anonymous.status}`);

  // ── Schema ──
  const schema = await api('GET', '/api/cms/schema');
  const blog = schema.json && schema.json.data.contentTypes.find((type) => type.slug === 'blog');
  check('schema lists the CMS types', Boolean(blog));
  check('machine-managed blog fields are hidden', blog && !('ttsStatus' in blog.attributes) && !('audioVariants' in blog.attributes));
  const unknown = await api('GET', '/api/cms/types/user-tracking');
  check('types outside the allow-list are unreachable', unknown.status === 404, `got ${unknown.status}`);

  // ── Draft / publish lifecycle ──
  const created = await api('POST', '/api/cms/types/testimonial', { data: { name: '[smoke] Testimonial', rating: 4 } });
  const id = created.json && created.json.data && created.json.data.documentId;
  if (id) cleanup.push(['testimonial', id]);
  check('create makes a draft', created.status === 201 && created.json.meta.status === 'draft', `got ${created.status}`);

  const steps = [
    ['PUT', `/api/cms/types/testimonial/${id}`, { data: { company: 'Smoke Co' } }, 'draft', 'save keeps it a draft'],
    ['POST', `/api/cms/types/testimonial/${id}/publish`, null, 'published', 'publish'],
    ['PUT', `/api/cms/types/testimonial/${id}`, { data: { company: 'Changed' } }, 'modified', 'editing a published entry marks it modified'],
    ['POST', `/api/cms/types/testimonial/${id}/discard`, null, 'published', 'discard restores the published version'],
    ['POST', `/api/cms/types/testimonial/${id}/unpublish`, null, 'draft', 'unpublish'],
  ];
  for (const [method, path, body, expected, name] of steps) {
    const result = await api(method, path, body);
    check(name, result.json && result.json.meta && result.json.meta.status === expected, `got ${result.status} ${JSON.stringify(result.json && result.json.meta)}`);
  }
  const discarded = await api('GET', `/api/cms/types/testimonial/${id}`);
  check('discarded edit is gone', discarded.json && discarded.json.data.company === 'Smoke Co');

  const invalid = await api('PUT', `/api/cms/types/testimonial/${id}`, { data: { rating: 9 } });
  const paths = ((invalid.json && invalid.json.error && invalid.json.error.details && invalid.json.error.details.errors) || []).map((e) => e.path.join('.'));
  check('validation errors name the field', invalid.status === 400 && paths.includes('rating'), `got ${invalid.status} ${paths}`);

  // ── Uniqueness ──
  const catA = await api('POST', '/api/cms/types/project-category', { data: { Name: '[smoke] A', slug: 'smoke-unique-test' } });
  if (catA.json && catA.json.data) cleanup.push(['project-category', catA.json.data.documentId]);
  const catB = await api('POST', '/api/cms/types/project-category', { data: { Name: '[smoke] B', slug: 'smoke-unique-test' } });
  if (catB.json && catB.json.data) cleanup.push(['project-category', catB.json.data.documentId]);
  check('duplicate slugs are refused on save', catB.status === 400, `got ${catB.status}`);

  // ── Page builder (nested components, required fields on publish) ──
  const page = await api('POST', '/api/cms/types/page', {
    data: {
      Name: '[smoke] Page',
      path: `/smoke-test-${Date.now()}`,
      sections: [
        { __component: 'sections.hero', title: 'Hello *world*', primaryCta: { label: 'Go', href: '/contact' } },
        { __component: 'sections.bullet-groups', title: 'Tech', groups: [{ title: 'Frontend', items: [{ title: 'React' }, { title: 'Next.js' }] }] },
        { __component: 'sections.faq', title: 'FAQ', items: [{ question: '', answer: '' }] },
        { __component: 'sections.not-a-section', title: 'dropped' },
      ],
    },
  });
  const pageId = page.json && page.json.data && page.json.data.documentId;
  if (pageId) cleanup.push(['page', pageId]);
  const sections = (page.json && page.json.data && page.json.data.sections) || [];
  check('nested sections are saved', sections.length === 3 && sections[1].groups[0].items.length === 2, `got ${sections.length}`);
  check('unknown section types are dropped', !sections.some((s) => s.__component === 'sections.not-a-section'));
  const publishPage = await api('POST', `/api/cms/types/page/${pageId}/publish`);
  const pagePaths = ((publishPage.json && publishPage.json.error && publishPage.json.error.details && publishPage.json.error.details.errors) || []).map((e) => e.path.join('.'));
  check('empty required nested fields block publishing', publishPage.status === 400 && pagePaths.includes('sections.2.items.0.question'), `got ${publishPage.status} ${pagePaths}`);

  // ── Media ──
  const png = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==', 'base64');
  const form = new FormData();
  form.append('files', new Blob([png], { type: 'image/png' }), 'smoke-test.png');
  const upload = await api('POST', '/api/cms/media', form);
  const fileId = upload.json && upload.json.data && upload.json.data[0] && upload.json.data[0].id;
  if (fileId) cleanup.push(['media', fileId]);
  check('upload an image', upload.status === 201 && Boolean(fileId), `got ${upload.status}`);
  const svg = new FormData();
  svg.append('files', new Blob(['<svg xmlns="http://www.w3.org/2000/svg"/>'], { type: 'image/svg+xml' }), 'x.svg');
  check('SVG uploads are refused', (await api('POST', '/api/cms/media', svg)).status === 400);
  const alt = await api('PUT', `/api/cms/media/${fileId}`, { data: { alternativeText: 'Smoke test pixel' } });
  check('edit alt text', alt.json && alt.json.data && alt.json.data.alternativeText === 'Smoke test pixel');

  // ── Audit log ──
  const activity = await api('GET', `/api/cms/activity?type=testimonial&documentId=${id}`);
  const actions = ((activity.json && activity.json.data) || []).map((a) => a.action);
  check('changes are recorded in the activity log', ['create', 'update', 'publish', 'discard', 'unpublish'].every((a) => actions.includes(a)), actions.join(','));

  // ── Legacy public blog AI routes are gone ──
  const legacy = await api('POST', '/api/blogs/1/generate-summary', null, { auth: false, raw: true });
  check('legacy unauthenticated AI routes are closed', legacy.status === 404 || legacy.status === 405, `got ${legacy.status}`);
}

async function removeCreated() {
  for (const [type, id] of cleanup.reverse()) {
    const path = type === 'media' ? `/api/cms/media/${id}` : `/api/cms/types/${type}/${id}`;
    const { status } = await api('DELETE', path, null, { raw: true }).catch(() => ({ status: 'error' }));
    if (status !== 204 && status !== 404) console.warn(`  couldn't remove ${type} ${id} (${status})`);
  }
}

main()
  .catch((error) => {
    failures += 1;
    console.error(`✗ ${error.message}`);
  })
  .finally(async () => {
    if (token) await removeCreated();
    console.log(failures ? `\n${failures} check(s) failed.` : '\nAll checks passed.');
    process.exit(failures ? 1 : 0);
  });
