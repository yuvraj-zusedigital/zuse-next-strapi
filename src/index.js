'use strict';

const Sentry = require('@sentry/node');
const { registerBlogDocumentMiddleware } = require('./api/blog/middleware/document-middleware');

module.exports = {
  /**
   * Runs before the application is initialized.
   * Initialise Sentry here so it can capture errors during bootstrap too.
   */
  
  register({ strapi }) {
    // Blog content-type lifecycle (v5 document-service middleware).
    // Replaces the commented-out src/api/blog/content-types/blog/lifecycles.js.
    registerBlogDocumentMiddleware(strapi);

    const dsn = process.env.SENTRY_DSN;
    const sendgridApiKey = process.env.SENDGRID_API_KEY;

    if (!dsn) {
      strapi.log.warn('[Sentry] SENTRY_DSN is not set — error tracking disabled.');
      return;
    }

    // Disable Sentry on localhost / development to avoid noise
    if (process.env.NODE_ENV !== 'production') {
      strapi.log.info('[Sentry] Skipping init in non-production environment.');
      return;
    }

    Sentry.init({
      dsn,
      environment: process.env.NODE_ENV || 'development',
      // Capture 100 % of transactions in dev; tune down in production
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
    });

    strapi.log.info(`[Sentry] Initialised (env: ${process.env.NODE_ENV || 'development'})`);

    if (!sendgridApiKey || !sendgridApiKey.startsWith('SG.')) {
      const error = new Error('SENDGRID_API_KEY is missing or invalid.');

      Sentry.withScope((scope) => {
        scope.setTag('config', 'sendgrid');
        scope.setTag('stage', 'startup');
        scope.setLevel('error');
        scope.setExtra('sendgrid_key_present', Boolean(sendgridApiKey));
        Sentry.captureException(error);
      });

      strapi.log.error('[SendGrid] SENDGRID_API_KEY is missing or invalid.');
    }

    // Expose a helper so controllers / services can capture errors manually:
    //   strapi.sentry.captureException(err)
    strapi.sentry = Sentry;
  },

  /**
   * Runs after the application is initialised but before it starts
   * accepting requests. Wire up the global error handler here.
   */
  bootstrap({ strapi }) {
    const app = strapi.server.app;

    // ── Middleware: catch ALL errors including handled ones (403, 401, etc.) ──
    // Strapi's error handler catches ForbiddenError, UnauthorizedError, etc.
    // and turns them into HTTP responses WITHOUT emitting a Koa 'error' event.
    // This middleware sits above Strapi's error handler so it can intercept them.
    app.use(async (ctx, next) => {
      try {
        await next();
      } catch (err) {
        // Send every error to Sentry — including Forbidden, Unauthorized, etc.
        Sentry.withScope((scope) => {
          scope.setExtra('url', ctx.url);
          scope.setExtra('method', ctx.method);
          scope.setExtra('status', err.status || ctx.status || 500);
          scope.setTag('error.name', err.name || 'UnknownError');
          scope.setTag('http.status_code', String(err.status || ctx.status || 500));

          if (ctx.state && ctx.state.user) {
            scope.setUser({ id: ctx.state.user.id, email: ctx.state.user.email });
          }

          // Set severity based on status code
          if (err.status === 403 || err.status === 401) {
            scope.setLevel('warning');
          } else {
            scope.setLevel('error');
          }

          Sentry.captureException(err);
        });

        // Re-throw so Strapi's own error handler still processes the response
        throw err;
      }
    });

    // ── Fallback: catch truly unhandled errors that bubble to Koa ──
    app.on('error', (err, ctx) => {
      Sentry.withScope((scope) => {
        if (ctx) {
          scope.setExtra('url', ctx.url);
          scope.setExtra('method', ctx.method);
          scope.setExtra('status', ctx.status);
          if (ctx.state && ctx.state.user) {
            scope.setUser({ id: ctx.state.user.id, email: ctx.state.user.email });
          }
        }
        Sentry.captureException(err);
      });
    });
  },
};
