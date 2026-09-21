// Secrets are loaded from .env.stag on the staging server.
// On the server, copy/symlink .env.stag to .env so Strapi's built-in
// dotenv loader picks it up:  ln -sf .env.stag .env
module.exports = {
  apps: [
    {
      name: 'zuse-staging', // Your project name
      cwd: '/home/ubuntu/zuse-staging', // Path to your project
      script: 'npm', // For this example we're using npm, could also be yarn
      args: 'start', // Script to start the Strapi server, `start` by default
    },
  ],
};
