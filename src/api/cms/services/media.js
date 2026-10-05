'use strict';

const { errors } = require('@strapi/utils');

const FILE_UID = 'plugin::upload.file';
const MAX_PAGE_SIZE = 100;

/**
 * What editors may upload. SVG is left out on purpose: it can carry scripts
 * and is served from the site's own CDN.
 */
const ALLOWED_MIME = [/^image\/(jpeg|png|webp|gif|avif)$/, /^video\/(mp4|webm|quicktime)$/, /^audio\/(mpeg|mp4|wav|ogg)$/, /^application\/pdf$/];

const KIND_FILTERS = {
  image: { mime: { $startsWith: 'image/' } },
  video: { mime: { $startsWith: 'video/' } },
  audio: { mime: { $startsWith: 'audio/' } },
  document: { $and: ['image/', 'video/', 'audio/'].map((prefix) => ({ $not: { mime: { $startsWith: prefix } } })) },
};

/** The fields the CMS needs, with a small preview URL for grids. */
const toMedia = (file) => {
  const formats = file.formats || {};
  const preview = formats.small || formats.thumbnail;
  return {
    id: file.id,
    name: file.name,
    alternativeText: file.alternativeText || '',
    caption: file.caption || '',
    url: file.url,
    previewUrl: preview ? preview.url : file.url,
    mime: file.mime,
    ext: file.ext,
    size: file.size, // KB
    width: file.width || null,
    height: file.height || null,
    createdAt: file.createdAt,
    updatedAt: file.updatedAt,
  };
};

module.exports = ({ strapi }) => {
  const upload = () => strapi.plugin('upload').service('upload');

  const findFile = async (id) => {
    const file = await upload().findOne(Number(id));
    if (!file) throw new errors.NotFoundError('File not found');
    return file;
  };

  return {
    toMedia,

    async find({ q, kind, page = 1, pageSize = 40 } = {}) {
      page = Math.max(1, parseInt(page, 10) || 1);
      pageSize = Math.min(MAX_PAGE_SIZE, Math.max(1, parseInt(pageSize, 10) || 40));

      const filters = { $and: [] };
      if (q) filters.$and.push({ $or: [{ name: { $containsi: String(q) } }, { alternativeText: { $containsi: String(q) } }] });
      if (KIND_FILTERS[kind]) filters.$and.push(KIND_FILTERS[kind]);

      const { results, pagination } = await upload().findPage({
        filters,
        sort: { createdAt: 'desc' },
        page,
        pageSize,
      });

      return { data: results.map(toMedia), meta: { pagination } };
    },

    /** One file, plus how many entries use it (shown before deleting). */
    async findOne(id) {
      const file = await findFile(id);
      const withRelated = await strapi.db.query(FILE_UID).findOne({ where: { id: file.id }, populate: { related: true } });
      const usage = (withRelated && withRelated.related) || [];
      return { data: { ...toMedia(file), usedBy: usage.length } };
    },

    /** files: formidable file(s) from the multipart body. */
    async upload(files, fileInfo = {}) {
      const list = (Array.isArray(files) ? files : [files]).filter(Boolean);
      if (!list.length) throw new errors.ValidationError('No file received');

      for (const file of list) {
        const mime = file.mimetype || file.type;
        if (!ALLOWED_MIME.some((pattern) => pattern.test(mime))) {
          throw new errors.ValidationError(`${file.originalFilename || file.name}: ${mime || 'this file type'} isn't allowed`);
        }
      }

      const info = list.map((file) => ({
        name: fileInfo.name || file.originalFilename || file.name,
        alternativeText: fileInfo.alternativeText || null,
        caption: fileInfo.caption || null,
      }));

      const uploaded = await upload().upload({
        data: { fileInfo: list.length > 1 ? info : info[0] },
        files: list.length > 1 ? list : list[0],
      });
      return { data: uploaded.map(toMedia) };
    },

    async update(id, { name, alternativeText, caption } = {}) {
      const file = await findFile(id);
      const updated = await upload().updateFileInfo(file.id, {
        name: typeof name === 'string' && name.trim() ? name.trim() : file.name,
        alternativeText: typeof alternativeText === 'string' ? alternativeText : file.alternativeText,
        caption: typeof caption === 'string' ? caption : file.caption,
      });
      return { data: toMedia(updated) };
    },

    /** Returns the deleted file's name (for the activity log). */
    async delete(id) {
      const file = await findFile(id);
      await upload().remove(file);
      return file.name;
    },
  };
};
