import { mergeConfig } from 'vite';

/**
 * Strapi admin (Vite) overrides. The dev server watches the whole project;
 * the Next.js apps in ./zuse-cms and ./zuse-site write build output that
 * would otherwise reload the admin page on every CMS/site build.
 */
export default (config) =>
  mergeConfig(config, {
    server: {
      watch: {
        ignored: ['**/zuse-cms/**', '**/zuse-site/**'],
      },
    },
  });
