'use strict';

const { CMS_ROLES, ADMIN_TYPES, atLeast } = require('../utils/roles');

/** CMS colour themes a user may save (same list as zuse-cms lib/accents.ts). */
const CMS_ACCENTS = ['zuse', 'emerald', 'violet', 'sunset', 'rose', 'ocean', 'teal', 'amber', 'fuchsia', 'graphite'];

const service = () => strapi.service('api::cms.cms');
const accounts = () => strapi.service('api::cms.users');

/** Runs an account change, answering 403 with the reason when it isn't allowed. */
const guarded = async (ctx, run) => {
  try {
    return await run();
  } catch (error) {
    if (error && error.name === 'ForbiddenError') {
      ctx.forbidden(error.message);
      return null;
    }
    throw error;
  }
};

/** Site-settings types need Admin; returns false (and answers 403) otherwise. */
const allowType = (ctx) => {
  if (!ADMIN_TYPES.includes(ctx.params.type) || atLeast(ctx.state.user, 'admin')) return true;
  ctx.forbidden('Only admins can change site settings.');
  return false;
};
const media = () => strapi.service('api::cms.media');
const activity = () => strapi.service('api::cms.activity');
const leads = () => strapi.service('api::cms.leads');

/** Text snippets (Site settings → Text snippets) as { name: value }. */
const snippetValues = async () => {
  const snippets = await strapi.documents('api::text-snippet.text-snippet').findMany({ fields: ['name', 'value'], limit: 500 });
  const out = {};
  for (const snippet of snippets) {
    if (snippet && snippet.name) out[snippet.name] = snippet.value || '';
  }
  return out;
};
/** Activity-log type for each kind of lead. */
const LEAD_TYPES = { submissions: 'form-submission', subscribers: 'subscriber', tracking: 'visitor-tracking' };

/** Logs a change to an entry (who, what, when); see services/activity.js. */
const logEntry = (ctx, action, result) =>
  activity().record(ctx.state.user, {
    action,
    targetType: ctx.params.type,
    targetId: (result && result.data && result.data.documentId) || ctx.params.documentId || null,
    title: service().titleOf(ctx.params.type, result && result.data),
  });

module.exports = {
  /**
   * CMS sign-in. Same checks as users-permissions' /api/auth/local, plus a
   * CMS role, but rate-limited per visitor IP and per account (see the
   * route) instead of per calling server, which for the CMS is always the
   * same IP.
   */
  async login(ctx) {
    const { identifier, password } = ctx.request.body || {};
    const invalid = () => ctx.badRequest('Invalid identifier or password');
    if (typeof identifier !== 'string' || typeof password !== 'string' || !identifier || !password) return invalid();

    const user = await strapi.db.query('plugin::users-permissions.user').findOne({
      where: { provider: 'local', $or: [{ email: identifier.trim().toLowerCase() }, { username: identifier.trim() }] },
      populate: ['role'],
    });
    const users = strapi.plugin('users-permissions').service('user');
    if (!user || !user.password || !(await users.validatePassword(password, user.password))) return invalid();

    const advanced = await strapi.store({ type: 'plugin', name: 'users-permissions' }).get({ key: 'advanced' });
    if (user.blocked === true || (advanced && advanced.email_confirmation && user.confirmed !== true)) return invalid();

    if (!user.role || !CMS_ROLES.includes(user.role.type)) {
      return ctx.forbidden("This account doesn't have access to the CMS.");
    }

    ctx.body = {
      jwt: strapi.plugin('users-permissions').service('jwt').issue({ id: user.id }),
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: { name: user.role.name, type: user.role.type },
        accent: user.accent || null,
      },
    };
  },

  async me(ctx) {
    const { id, username, email, role } = ctx.state.user;
    const prefs = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { id }, select: ['timezone', 'accent'] });
    ctx.body = {
      data: {
        id,
        username,
        email,
        role: { name: role.name, type: role.type },
        timezone: (prefs && prefs.timezone) || null,
        accent: (prefs && prefs.accent) || null,
      },
    };
  },

  /**
   * The signed-in user's own preferences (send only what changes):
   *   timezone: an IANA zone like "Asia/Kolkata", or null for the device's;
   *   accent: a CMS colour theme (zuse-cms lib/accents.ts), or null for the default.
   */
  async updateMe(ctx) {
    const body = (ctx.request.body && ctx.request.body.data) || {};
    const data = {};

    if ('timezone' in body) {
      const { timezone } = body;
      if (timezone === null || timezone === '') data.timezone = null;
      else {
        // Any zone Intl accepts, including aliases (Asia/Kolkata = Asia/Calcutta).
        let valid = typeof timezone === 'string' && timezone.length <= 64;
        try {
          if (valid) new Intl.DateTimeFormat('en', { timeZone: timezone });
        } catch {
          valid = false;
        }
        if (!valid) return ctx.badRequest('Unknown time zone.');
        data.timezone = timezone;
      }
    }

    if ('accent' in body) {
      const { accent } = body;
      if (accent === null || accent === '') data.accent = null;
      else if (CMS_ACCENTS.includes(accent)) data.accent = accent;
      else return ctx.badRequest('Unknown colour theme.');
    }

    if (Object.keys(data).length) {
      await strapi.db.query('plugin::users-permissions.user').update({ where: { id: ctx.state.user.id }, data });
    }
    const prefs = await strapi.db.query('plugin::users-permissions.user').findOne({ where: { id: ctx.state.user.id }, select: ['timezone', 'accent'] });
    ctx.body = { data: { timezone: prefs.timezone || null, accent: prefs.accent || null } };
  },

  /**
   * The live header and footer (Header & Footer, published), read-only for
   * every CMS role, so page previews can show the whole page.
   */
  async siteChrome(ctx) {
    const link = { populate: { page: { fields: ['path'] } } };
    const populate = {
      logo: true,
      navLinks: link,
      serviceLinks: link,
      headerCta: link,
      footerCta: link,
      footerColumns: { populate: { links: link } },
      socialLinks: { populate: { icon: true } },
      legalLinks: link,
    };
    const documents = strapi.documents('api::global.global');
    const global = (await documents.findFirst({ status: 'published', populate })) || (await documents.findFirst({ status: 'draft', populate }));
    if (!global) return (ctx.body = { data: null });

    // Parts switched off in the CMS (the eye buttons and "Hide …" switches) are left out.
    const shown = (item) => item && item.hidden !== true;
    const toLink = (item) => shown(item) && item.label && { label: item.label, href: (item.page && item.page.path) || item.href || '#', variant: item.variant || null };
    const links = (items) => (items || []).map(toLink).filter(Boolean);
    const media = (file) => file && file.url && { url: file.url, alternativeText: file.alternativeText || '', mime: file.mime || null };
    const footerBand = global.hideFooterCallToAction !== true;

    ctx.body = {
      data: {
        logo: media(global.logo),
        navLinks: links(global.navLinks),
        servicesLabel: global.servicesLabel || null,
        hasServices: global.hideServicesMenu !== true && (global.serviceLinks || []).some(shown),
        headerCta: toLink(global.headerCta) || null,
        footerHeading: footerBand ? global.footerHeading || null : null,
        footerCta: footerBand ? toLink(global.footerCta) || null : null,
        footerDescription: global.hideFooterDescription === true ? null : global.footerDescription || null,
        officeTitle: global.hideOffice === true ? null : global.officeTitle || null,
        officeAddress: global.hideOffice === true ? null : global.officeAddress || null,
        footerColumns: (global.footerColumns || []).filter(shown).map((column) => ({ title: column.title || '', links: links(column.links) })),
        socialLinks:
          global.hideSocialLinks === true
            ? []
            : (global.socialLinks || []).filter(shown).map((social) => ({ name: social.name || '', href: social.href || '#', icon: media(social.icon) })),
        legalLinks: links(global.legalLinks),
        copyright: global.hideCopyright === true ? null : global.copyrightText || '© Zuse Digital {year}, All rights reserved.',
        // Text snippets ({phone} etc.) so previews read like the site.
        snippets: await snippetValues(),
      },
    };
  },

  /** Site-settings types are left out for Editors. */
  async schema(ctx) {
    const schema = service().schema();
    if (!atLeast(ctx.state.user, 'admin')) {
      schema.contentTypes = schema.contentTypes.filter((type) => !ADMIN_TYPES.includes(type.slug));
    }
    ctx.body = { data: schema };
  },

  async find(ctx) {
    if (!allowType(ctx)) return;
    const { q, page, pageSize, sort, status, columns } = ctx.query;
    ctx.body = await service().find(ctx.params.type, { q, page, pageSize, sort, status, columns });
  },

  async findOne(ctx) {
    if (!allowType(ctx)) return;
    ctx.body = await service().findOne(ctx.params.type, ctx.params.documentId);
  },

  async create(ctx) {
    if (!allowType(ctx)) return;
    const result = await service().create(ctx.params.type, ctx.request.body && ctx.request.body.data);
    await logEntry(ctx, 'create', result);
    ctx.status = 201;
    ctx.body = result;
  },

  async update(ctx) {
    if (!allowType(ctx)) return;
    const result = await service().update(ctx.params.type, ctx.params.documentId, ctx.request.body && ctx.request.body.data);
    await logEntry(ctx, 'update', result);
    ctx.body = result;
  },

  async transition(ctx) {
    if (!allowType(ctx)) return;
    const result = await service().transition(ctx.params.type, ctx.params.documentId, ctx.params.action);
    await logEntry(ctx, ctx.params.action, result);
    ctx.body = result;
  },

  async delete(ctx) {
    if (!allowType(ctx)) return;
    const title = await service().delete(ctx.params.type, ctx.params.documentId);
    await activity().record(ctx.state.user, {
      action: 'delete',
      targetType: ctx.params.type,
      targetId: ctx.params.documentId,
      title,
    });
    ctx.status = 204;
  },

  /**
   * Recent changes: ?type=&documentId=&action=&user=&page=&pageSize=
   * One entry's history (documentId) is open to Editors; the full log needs Admin.
   */
  async activity(ctx) {
    const { type, documentId, action, user, page, pageSize, limit } = ctx.query;
    if (!documentId && !atLeast(ctx.state.user, 'admin')) return ctx.forbidden('Only admins can see the activity log.');
    const result = await activity().page({ targetType: type, targetId: documentId, action, userEmail: user, page, pageSize: pageSize || limit });
    // Full log: also list who appears in it, for the "person" filter.
    if (!documentId) result.meta.people = await activity().people();
    ctx.body = result;
  },

  // ── Accounts (Admins manage Editors; Super Admins manage everyone) ──

  async usersFind(ctx) {
    ctx.body = { data: await accounts().list() };
  },

  async usersCreate(ctx) {
    const account = await guarded(ctx, () => accounts().create(ctx.state.user, (ctx.request.body && ctx.request.body.data) || {}));
    if (!account) return;
    await activity().record(ctx.state.user, { action: 'user-create', targetType: 'user', targetId: String(account.id), title: `${account.email} (${account.role.name})` });
    ctx.status = 201;
    ctx.body = { data: account };
  },

  async usersUpdate(ctx) {
    const changes = (ctx.request.body && ctx.request.body.data) || {};
    const account = await guarded(ctx, () => accounts().update(ctx.state.user, Number(ctx.params.id), changes));
    if (!account) return;
    const what = [
      changes.role !== undefined && `role ${account.role && account.role.name}`,
      changes.blocked !== undefined && (account.blocked ? 'deactivated' : 'activated'),
      changes.password !== undefined && 'password reset',
    ].filter(Boolean);
    await activity().record(ctx.state.user, { action: 'user-update', targetType: 'user', targetId: String(account.id), title: `${account.email}${what.length ? `: ${what.join(', ')}` : ''}` });
    ctx.body = { data: account };
  },

  // ── Blog tools (AI summary, text-to-speech) ──
  // Editor-only versions of the blog's own actions, which the Strapi admin
  // side panels call on unauthenticated routes.

  async blogTools(ctx) {
    const entry = await strapi.documents('api::blog.blog').findOne({
      documentId: ctx.params.documentId,
      fields: ['ttsStatus', 'ttsProgress', 'audioVariants', 'aiSummary'],
    });
    if (!entry) return ctx.notFound('Blog entry not found.');
    ctx.body = {
      data: {
        ttsStatus: entry.ttsStatus || 'idle',
        ttsProgress: entry.ttsProgress || null,
        audioVariants: Array.isArray(entry.audioVariants) ? entry.audioVariants : [],
        aiSummary: entry.aiSummary || null,
      },
    };
  },

  async blogGenerateAudio(ctx) {
    const action = { openai: 'generateAudio', elevenlabs: 'generateAudioElevenLabs' }[ctx.params.provider];
    if (!action) return ctx.notFound('Unknown audio provider.');
    ctx.params.id = ctx.params.documentId;
    return strapi.controller('api::blog.blog')[action](ctx);
  },

  async blogGenerateSummary(ctx) {
    ctx.params.id = ctx.params.documentId;
    return strapi.controller('api::blog.blog').generateSummary(ctx);
  },

  // ── Media library ──

  async mediaFind(ctx) {
    const { q, kind, page, pageSize } = ctx.query;
    ctx.body = await media().find({ q, kind, page, pageSize });
  },

  async mediaFindOne(ctx) {
    ctx.body = await media().findOne(ctx.params.id);
  },

  /** multipart/form-data: `files` (one or more) and optional `fileInfo` JSON. */
  async mediaUpload(ctx) {
    const { files = {} } = ctx.request;
    let fileInfo = {};
    try {
      fileInfo = JSON.parse((ctx.request.body && ctx.request.body.fileInfo) || '{}');
    } catch {
      // ignore malformed fileInfo; the file name is used instead
    }
    const result = await media().upload(files.files, fileInfo);
    for (const file of result.data) {
      await activity().record(ctx.state.user, { action: 'upload', targetType: 'media', targetId: String(file.id), title: file.name });
    }
    ctx.status = 201;
    ctx.body = result;
  },

  async mediaUpdate(ctx) {
    const result = await media().update(ctx.params.id, (ctx.request.body && ctx.request.body.data) || {});
    await activity().record(ctx.state.user, { action: 'media-update', targetType: 'media', targetId: String(result.data.id), title: result.data.name });
    ctx.body = result;
  },

  async mediaDelete(ctx) {
    const name = await media().delete(ctx.params.id);
    await activity().record(ctx.state.user, { action: 'media-delete', targetType: 'media', targetId: String(ctx.params.id), title: name });
    ctx.status = 204;
  },

  /** Dashboard figures (services/dashboard.js); ?tz= for day boundaries. */
  async dashboard(ctx) {
    ctx.body = { data: await strapi.service('api::cms.dashboard').get(ctx.state.user, { timeZone: String(ctx.query.tz || 'UTC').slice(0, 64) }) };
  },

  /** A page view's Core Web Vitals from the site (public; services/vitals.js). */
  async vitalsRecord(ctx) {
    await strapi.service('api::cms.vitals').record(ctx.request.body);
    ctx.status = 204;
  },

  /** Real-visitor speed for one page (?path=&days=). */
  async vitalsPage(ctx) {
    ctx.body = { data: await strapi.service('api::cms.vitals').page(ctx.query.path, ctx.query.days) };
  },

  /** Real-visitor speed for every page, slowest first (?days=&device=). */
  async vitalsOverview(ctx) {
    ctx.body = { data: await strapi.service('api::cms.vitals').overview(ctx.query.days, ctx.query.device) };
  },

  /** What the AI features can do here (key set, or demo mode). */
  async aiStatus(ctx) {
    ctx.body = { data: { pageDraft: strapi.service('api::cms.page-draft').available() } };
  },

  /** "Draft with AI": a new unpublished page from a brief (services/page-draft.js). */
  async aiPageDraft(ctx) {
    const body = ctx.request.body || {};
    const result = await strapi.service('api::cms.page-draft').create({ brief: body.brief, audience: body.audience, tone: body.tone });
    await activity().record(ctx.state.user, { action: 'create', targetType: 'page', targetId: result.documentId, title: `${result.name} (AI draft)` });
    ctx.status = 201;
    ctx.body = { data: result };
  },

  /** Form submissions, subscribers and visitor tracking (Admins; see services/leads.js). */
  async leadsFind(ctx) {
    const { q, page, pageSize } = ctx.query;
    ctx.body = await leads().list(ctx.params.kind, { q, page, pageSize });
  },

  async leadsFindOne(ctx) {
    ctx.body = await leads().get(ctx.params.kind, ctx.params.id);
  },

  async leadsDelete(ctx) {
    const title = await leads().remove(ctx.params.kind, ctx.params.id);
    if (title) {
      await activity().record(ctx.state.user, {
        action: 'delete',
        targetType: LEAD_TYPES[ctx.params.kind],
        targetId: String(ctx.params.id),
        title,
      });
    }
    ctx.status = 204;
  },
};
