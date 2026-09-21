'use strict';

const { extractDescriptionHtml, stripHtmlToPlainText } = require('./tts-openai');

const OPENAI_SUMMARY_MODEL = process.env.OPENAI_SUMMARY_MODEL || 'gpt-4o-mini';

// Truncate body to ~12 000 chars (~3 k tokens) before sending to the API.
const MAX_CONTENT_CHARS = 12000;

function getOpenAIClient() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey || apiKey === 'tobemodified' || apiKey.startsWith('sk-REPLACE')) {
    return null;
  }
  const OpenAI = require('openai');
  return new OpenAI({ apiKey });
}

/**
 * Generate a single-paragraph AI summary for a blog post.
 *
 * @param {object} blogData - Must include at least Title and/or Description.
 * @returns {Promise<string>} The generated summary paragraph.
 * @throws {Error} If the API key is missing or the API call fails.
 */
async function generateBlogSummary(blogData) {
  const client = getOpenAIClient();
  if (!client) {
    throw new Error(
      'OpenAI API key is not configured. Set OPENAI_API_KEY in your environment.'
    );
  }

  const title = (blogData.Title || '').trim();
  const descriptionHtml = extractDescriptionHtml(blogData.Description);
  const body = stripHtmlToPlainText(
    typeof descriptionHtml === 'string' ? descriptionHtml : ''
  );

  if (!title && !body) {
    throw new Error('Blog has no title or content to summarize.');
  }

  const truncatedBody =
    body.length > MAX_CONTENT_CHARS ? body.slice(0, MAX_CONTENT_CHARS) + '…' : body;

  const userContent = [
    title ? `Title: ${title}` : null,
    truncatedBody ? `Content:\n${truncatedBody}` : null,
  ]
    .filter(Boolean)
    .join('\n\n');

  const completion = await client.chat.completions.create({
    model: OPENAI_SUMMARY_MODEL,
    messages: [
      {
        role: 'system',
        content:
          'You are a professional blog editor. Write a single concise paragraph summarising the blog post provided. The summary should capture the key points and be suitable as an introductory overview for readers. Write in plain prose — no bullet points, no headings, no markdown.',
      },
      {
        role: 'user',
        content: userContent,
      },
    ],
    max_tokens: 300,
    temperature: 0.5,
  });

  const summary = completion.choices?.[0]?.message?.content?.trim();
  if (!summary) {
    throw new Error('OpenAI returned an empty response.');
  }
  return summary;
}

module.exports = { generateBlogSummary };
