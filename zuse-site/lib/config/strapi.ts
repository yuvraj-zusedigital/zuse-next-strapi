/**
 * Client-safe Strapi base URL (forms, absolute media links in the browser).
 * Mirrors Website/src/config/strapi.js — GATSBY_* → NEXT_PUBLIC_*.
 */
const STRAPI_API_URL = (
  process.env.NEXT_PUBLIC_STRAPI_API_URL ||
  process.env.STRAPI_API_URL ||
  "https://stagingadmin.zusedigital.com"
).replace(/\/$/, "");

export const EZFORMS_SUBMIT_URL = `${STRAPI_API_URL}/api/ezforms/submit`;
/** Real-visitor speed reports (components/WebVitals.tsx). */
export const WEB_VITALS_URL = `${STRAPI_API_URL}/api/cms/vitals`;

export default STRAPI_API_URL;
