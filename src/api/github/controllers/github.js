"use strict";

const axios = require("axios");

module.exports = {
  triggerGithubWorkflow: async (ctx) => {
    try {
      // Make a POST request to GitHub Actions
      const response = await axios.post(
        "https://api.github.com/repos/zusedigital/Website/actions/workflows/production.yml/dispatches",
        { ref: "master" },
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      return ctx.send({ success: true, message: "GitHub workflow triggered!", data: response.data });
    } catch (error) {
      return ctx.badRequest(error.response?.data || error.message);
    }
  },
  triggerGithubWorkflowStaging: async (ctx) => {
    try {
      // Make a POST request to GitHub Actions
      const response = await axios.post(
        "https://api.github.com/repos/zusedigital/Website/actions/workflows/staging.yml/dispatches",
        { ref: "staging" },
        {
          headers: {
            Authorization: `token ${process.env.GITHUB_TOKEN}`,
            Accept: "application/vnd.github.v3+json",
          },
        }
      );

      return ctx.send({ success: true, message: "GitHub workflow triggered!", data: response.data });
    } catch (error) {
      return ctx.badRequest(error.response?.data || error.message);
    }
  },
};
