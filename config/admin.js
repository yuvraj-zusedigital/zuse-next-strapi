module.exports = ({ env }) => ({
  // The Next.js apps (./zuse-cms, ./zuse-site) must not restart `strapi develop`.
  watchIgnoreFiles: ['**/zuse-cms/**', '**/zuse-site/**'],
  preview: {
    enabled: false,
  },
  auth: {
    secret: env('ADMIN_JWT_SECRET'),
  },
  apiToken: {
    salt: env('API_TOKEN_SALT'),
  },
  transfer: {
    token: {
      salt: env('TRANSFER_TOKEN_SALT'),
    },
  },
});
