'use strict';

const { errors } = require('@strapi/utils');
const types = require('../config/types');
const { buildPopulate } = require('../../../middlewares/deep-populate');

const MAX_PAGE_SIZE = 100;

// Runtime attributes Strapi adds to every schema; the CMS never edits them.
const SYSTEM_ATTRIBUTES = [
  'createdAt',
  'updatedAt',
  'publishedAt',
  'createdBy',
  'updatedBy',
  'locale',
  'localizations',
];

const slugByUid = Object.fromEntries(Object.entries(types).map(([slug, { uid }]) => [uid, slug]));

/**
 * Editable attributes, with relations annotated by the CMS slug of their
 * target (null when the target isn't a CMS type, i.e. read-only in the CMS).
 */
/**
 * Fields Strapi's own admin hides (pluginOptions.content-manager.visible:
 * false) are machine-managed, e.g. blog audio status written by background
 * jobs. The CMS neither shows nor writes them.
 */
const isHidden = (attribute) =>
  Boolean(attribute.pluginOptions && attribute.pluginOptions['content-manager'] && attribute.pluginOptions['content-manager'].visible === false);

const pickAttributes = (attributes) =>
  Object.fromEntries(
    Object.entries(attributes)
      .filter(([name, attribute]) => !SYSTEM_ATTRIBUTES.includes(name) && !isHidden(attribute))
      .map(([name, attribute]) => [
        name,
        attribute.type === 'relation' ? { ...attribute, targetType: slugByUid[attribute.target] || null } : attribute,
      ])
  );

const hasDraftAndPublish = (schema) => Boolean(schema.options && schema.options.draftAndPublish);

/** draft (never published) · published · modified (published, with newer draft edits). */
const STATUSES = ['draft', 'published', 'modified'];
const statusOf = (draftAndPublish, draft, published) => {
  if (!draftAndPublish) return 'published';
  if (!published) return 'draft';
  return new Date(draft.updatedAt) > new Date(published.updatedAt) ? 'modified' : 'published';
};

module.exports = ({ strapi }) => {
  const populateCache = new Map();

  const deepPopulate = (uid) => {
    if (!populateCache.has(uid)) populateCache.set(uid, buildPopulate(strapi, uid) || '*');
    return populateCache.get(uid);
  };

  const isPlainObject = (value) => Boolean(value) && typeof value === 'object' && !Array.isArray(value);

  /**
   * Converts one level of CMS form data into Document Service input, recursing
   * into components and dynamic zones. Unknown and private attributes are
   * dropped; component ids are dropped too, so Strapi writes the submitted
   * list as-is (it replaces a document's components on every save anyway).
   */
  const toData = (attributes, data) => {
    const input = {};

    for (const [name, value] of Object.entries(data)) {
      const attribute = attributes[name];
      if (!attribute || attribute.private || isHidden(attribute) || SYSTEM_ATTRIBUTES.includes(name)) continue;

      switch (attribute.type) {
        case 'media': {
          // File ids from the media library: one id (or null), or a list when multiple.
          const ids = (Array.isArray(value) ? value : value == null ? [] : [value])
            .map((id) => Number(id))
            .filter((id) => Number.isInteger(id) && id > 0);
          input[name] = attribute.multiple ? ids : ids[0] || null;
          break;
        }
        case 'component': {
          const component = strapi.components[attribute.component];
          if (attribute.repeatable) {
            input[name] = (Array.isArray(value) ? value : [])
              .filter(isPlainObject)
              .map((item) => toData(component.attributes, item));
          } else {
            input[name] = isPlainObject(value) ? toData(component.attributes, value) : null;
          }
          break;
        }
        case 'dynamiczone':
          input[name] = (Array.isArray(value) ? value : [])
            .filter((item) => isPlainObject(item) && attribute.components.includes(item.__component))
            .map((item) => ({
              __component: item.__component,
              ...toData(strapi.components[item.__component].attributes, item),
            }));
          break;
        case 'relation': {
          if (!slugByUid[attribute.target]) break; // only relations to CMS types are editable
          const ids = (Array.isArray(value) ? value : value ? [value] : []).filter(
            (id) => typeof id === 'string' && id
          );
          input[name] = { set: ids.map((documentId) => ({ documentId })) };
          break;
        }
        case 'blocks':
          input[name] = Array.isArray(value) ? value : null;
          break;
        default:
          // Empty means "not set": Strapi's required check accepts "" but not null.
          input[name] = value === '' ? null : value;
      }
    }

    return input;
  };

  /** Validates the body shape, converts it, then runs Strapi's input sanitizer (drops private fields). */
  const toInput = async (schema, data) => {
    if (!isPlainObject(data)) {
      throw new errors.ValidationError('Body must be { data: { … } }');
    }
    return strapi.contentAPI.sanitize.input(toData(schema.attributes, data), schema);
  };

  /**
   * Strapi only enforces uid/unique values when publishing; check on save too
   * so editors find out while they're still on the field.
   */
  const assertUnique = async (uid, schema, input, documentId) => {
    const failures = [];
    for (const [name, attribute] of Object.entries(schema.attributes)) {
      if (!(attribute.type === 'uid' || attribute.unique) || input[name] == null || input[name] === '') continue;
      const clash = await strapi.documents(uid).findFirst({
        status: hasDraftAndPublish(schema) ? 'draft' : undefined,
        filters: { [name]: input[name], ...(documentId ? { documentId: { $ne: documentId } } : {}) },
        fields: ['documentId'],
      });
      if (clash) failures.push({ path: [name], message: 'Another entry already uses this value', value: input[name] });
    }
    if (failures.length) {
      throw new errors.ValidationError(failures[0].message, { errors: failures });
    }
  };

  /**
   * Text snippets: {name} must be letters and numbers and not one the site
   * fills in itself ({year}, and {name} in the thank-you title). Uniqueness is
   * the attribute's own `unique` check (assertUnique).
   */
  const RESERVED_SNIPPETS = ['year', 'name'];
  const assertSnippetName = (uid, input) => {
    if (uid !== 'api::text-snippet.text-snippet' || typeof input.name !== 'string') return;
    const name = input.name.trim();
    const path = ['name'];
    let message = null;
    if (!/^[A-Za-z][A-Za-z0-9]*$/.test(name)) message = 'Letters and numbers only, starting with a letter (e.g. phone, yearsInBusiness)';
    else if (RESERVED_SNIPPETS.includes(name.toLowerCase())) message = `{${name}} is filled in by the site; choose another name`;
    if (message) throw new errors.ValidationError(message, { errors: [{ path, message, value: name }] });
  };

  /** Rewrites yup's "must be a `string` type, but the final value was: `null`" into plain language. */
  const friendlyErrors = async (run) => {
    try {
      return await run();
    } catch (error) {
      // Match by name: the document service throws ValidationErrors from its own copy of @strapi/utils.
      const list = error && error.name === 'ValidationError' && error.details && error.details.errors;
      if (list) {
        for (const item of list) {
          if (item.value === null || item.value === undefined || item.value === '') {
            item.message = 'This field is required';
          }
        }
        error.message = list[0] ? `${list[0].path.join('.')}: ${list[0].message}` : error.message;
      }
      throw error;
    }
  };

  return {
    getType(slug, documentId) {
      const type = types[slug];
      if (!type) throw new errors.NotFoundError(`Unknown content type "${slug}"`);
      const schema = strapi.getModel(type.uid);
      // Collection types always need a documentId (the /single routes are for single types).
      if (documentId === null && schema.kind !== 'singleType') {
        throw new errors.NotFoundError('Document not found');
      }
      return { slug, ...type, schema, draftAndPublish: hasDraftAndPublish(schema) };
    },

    /** Schemas of every CMS type plus all components, for schema-driven forms. */
    schema() {
      const contentTypes = Object.keys(types).map((slug) => {
        const { uid, mainField, schema, draftAndPublish, group } = this.getType(slug);
        return {
          slug,
          uid,
          kind: schema.kind,
          // Sidebar group: single types and listed setting types sit under "Site settings".
          group: group || (schema.kind === 'singleType' ? 'settings' : 'content'),
          displayName: schema.info.displayName,
          description: schema.info.description || '',
          draftAndPublish,
          mainField,
          attributes: pickAttributes(schema.attributes),
        };
      });

      const components = Object.values(strapi.components).map((component) => ({
        uid: component.uid,
        category: component.category,
        displayName: component.info.displayName,
        icon: component.info.icon || null,
        attributes: pickAttributes(component.attributes),
      }));

      return { contentTypes, components };
    },

    /**
     * One page of a type's entries (draft versions, the latest edits) with their status.
     * q searches the main field; sort is field:asc|desc (main field, updatedAt
     * or createdAt); status (draft | published | modified) needs every
     * matching entry's status, so it filters in memory before paging.
     */
    async find(slug, { q, page = 1, pageSize = 25, sort = 'updatedAt:desc', status: wanted, columns } = {}) {
      const { uid, mainField, schema, draftAndPublish } = this.getType(slug);

      page = Math.max(1, parseInt(page, 10) || 1);
      pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize, 10) || 25));

      const filters = q && mainField ? { [mainField]: { $containsi: String(q) } } : {};
      const [field, order = 'asc'] = String(sort).split(':');
      const sortable = [mainField, 'updatedAt', 'createdAt'].filter(Boolean);
      const safeSort = sortable.includes(field) ? { [field]: order === 'desc' ? 'desc' : 'asc' } : { updatedAt: 'desc' };

      const status = draftAndPublish ? 'draft' : undefined;
      const documents = strapi.documents(uid);
      // Extra text columns for the list (?columns=label,value): only plain text attributes.
      const extra = String(columns || '')
        .split(',')
        .map((name) => name.trim())
        .filter((name) => name && name !== mainField && ['string', 'text', 'email', 'uid', 'enumeration'].includes(schema.attributes[name] && schema.attributes[name].type) && !isHidden(schema.attributes[name]))
        .slice(0, 4);
      const fields = ['documentId', 'updatedAt', ...(mainField ? [mainField] : []), ...extra];

      const publishedOf = async (ids) => {
        if (!draftAndPublish || !ids.length) return new Map();
        const versions = await documents.findMany({
          status: 'published',
          filters: { documentId: { $in: ids } },
          fields: ['documentId', 'updatedAt'],
        });
        return new Map(versions.map((entry) => [entry.documentId, entry]));
      };

      let results;
      let total;
      let published;
      if (draftAndPublish && STATUSES.includes(wanted)) {
        const all = await documents.findMany({ status, filters, sort: safeSort, fields });
        published = await publishedOf(all.map((entry) => entry.documentId));
        const matching = all.filter((entry) => statusOf(true, entry, published.get(entry.documentId)) === wanted);
        total = matching.length;
        results = matching.slice((page - 1) * pageSize, page * pageSize);
      } else {
        [results, total] = await Promise.all([
          documents.findMany({ status, filters, sort: safeSort, fields, start: (page - 1) * pageSize, limit: pageSize }),
          documents.count({ status, filters }),
        ]);
        published = await publishedOf(results.map((entry) => entry.documentId));
      }

      const data = results.map((entry) => ({
        documentId: entry.documentId,
        title: mainField ? entry[mainField] : schema.info.displayName,
        updatedAt: entry.updatedAt,
        status: statusOf(draftAndPublish, entry, published.get(entry.documentId)),
        ...(extra.length ? { columns: Object.fromEntries(extra.map((name) => [name, entry[name] == null ? null : String(entry[name]).slice(0, 200)])) } : {}),
      }));

      return {
        data,
        meta: { pagination: { page, pageSize, total, pageCount: Math.ceil(total / pageSize) } },
      };
    },

    /**
     * One document's draft version, fully populated, with its status.
     * Single types ignore documentId and return { data: null } before the
     * first save.
     */
    async findOne(slug, documentId = null) {
      const { uid, schema, draftAndPublish } = this.getType(slug, documentId);
      const documents = strapi.documents(uid);
      const params = { status: draftAndPublish ? 'draft' : undefined, populate: deepPopulate(uid) };

      const entry =
        schema.kind === 'singleType'
          ? await documents.findFirst(params)
          : await documents.findOne({ documentId, ...params });

      if (!entry) {
        if (schema.kind === 'singleType') return { data: null, meta: { status: 'draft' } };
        throw new errors.NotFoundError('Document not found');
      }

      const published = draftAndPublish
        ? await documents.findOne({ documentId: entry.documentId, status: 'published', fields: ['updatedAt'] })
        : null;

      return {
        // Strip private attributes (passwords, tokens) from populated relations.
        data: await strapi.contentAPI.sanitize.output(entry, schema),
        meta: { status: statusOf(draftAndPublish, entry, published) },
      };
    },

    /** Creates a draft (or, without draft & publish, the live entry). */
    async create(slug, data) {
      const { uid, schema } = this.getType(slug);
      if (schema.kind === 'singleType') {
        throw new errors.ValidationError('Single types are saved with PUT /cms/types/:type');
      }
      const input = await toInput(schema, data);
      const created = await friendlyErrors(async () => {
        await assertUnique(uid, schema, input);
        assertSnippetName(uid, input);
        return strapi.documents(uid).create({ data: input });
      });
      return this.findOne(slug, created.documentId);
    },

    /** Saves the draft. Single types are created on first save. */
    async update(slug, documentId = null, data) {
      const { uid, schema } = this.getType(slug, documentId);
      const documents = strapi.documents(uid);
      const input = await toInput(schema, data);

      if (schema.kind === 'singleType') {
        const existing = await documents.findFirst({ fields: ['documentId'] });
        if (!existing) {
          await friendlyErrors(() => documents.create({ data: input }));
          return this.findOne(slug);
        }
        documentId = existing.documentId;
      }

      const updated = await friendlyErrors(async () => {
        await assertUnique(uid, schema, input, documentId);
        assertSnippetName(uid, input);
        return documents.update({ documentId, data: input });
      });
      if (!updated) throw new errors.NotFoundError('Document not found');
      return this.findOne(slug, documentId);
    },

    /** publish · unpublish · discard (reset the draft to the published version). */
    async transition(slug, documentId = null, action) {
      const { uid, schema, draftAndPublish } = this.getType(slug, documentId);
      if (!draftAndPublish) throw new errors.ValidationError(`${schema.info.displayName} has no draft & publish`);

      const documents = strapi.documents(uid);
      if (schema.kind === 'singleType') {
        const existing = await documents.findFirst({ fields: ['documentId'] });
        if (!existing) throw new errors.NotFoundError('Nothing saved yet');
        documentId = existing.documentId;
      }

      const run = { publish: 'publish', unpublish: 'unpublish', discard: 'discardDraft' }[action];
      if (!run) throw new errors.NotFoundError(`Unknown action "${action}"`);
      await friendlyErrors(() => documents[run]({ documentId }));
      return this.findOne(slug, documentId);
    },

    /** Deletes a collection entry; returns its title (for the activity log). */
    async delete(slug, documentId) {
      const { uid, schema, mainField } = this.getType(slug);
      if (schema.kind === 'singleType') throw new errors.ValidationError('Single types cannot be deleted');
      const existing = await strapi.documents(uid).findOne({
        documentId,
        fields: ['documentId', ...(mainField ? [mainField] : [])],
      });
      if (!existing) throw new errors.NotFoundError('Document not found');
      await strapi.documents(uid).delete({ documentId });
      return mainField ? existing[mainField] : null;
    },

    /** Display title of an entry: its main field, or the type's name for single types. */
    titleOf(slug, entry) {
      const { mainField, schema } = this.getType(slug);
      return (mainField && entry && entry[mainField]) || schema.info.displayName;
    },
  };
};
