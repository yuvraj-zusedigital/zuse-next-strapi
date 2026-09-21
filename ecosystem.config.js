// Secrets are loaded from .env.prod on the production server.
// On the server, copy/symlink .env.prod to .env so Strapi's built-in
// dotenv loader picks it up:  ln -sf .env.prod .env
module.exports = {
  apps: [
    {
      name: 'strapi-back-end', // Your project name
      cwd: '/home/ubuntu/strapi-backend', // Path to your project
      script: 'npm', // For this example we're using npm, could also be yarn
      args: 'start', // Script to start the Strapi server, `start` by default
    },
  ],
};
