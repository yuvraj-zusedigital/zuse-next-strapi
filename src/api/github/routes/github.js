"use strict";

module.exports = {
  routes: [
    {
      method: "POST",
      path: "/github-webhook",
      handler: "github.triggerGithubWorkflow",
      config: {
        auth: false, // Set to `true` if you need authentication
      },
    },
    {
      method: "POST",
      path: "/github-webhook-staging",
      handler: "github.triggerGithubWorkflowStaging",
      config: {
        auth: false, // Set to `true` if you need authentication
      },
    },
  ],
};
