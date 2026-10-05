import type { NextConfig } from "next";

// Set STATIC_EXPORT=1 to produce a fully static site in `out/` for S3 + CloudFront
// hosting (e.g. staging.zusedigital.com). In this mode Next pre-renders every
// route to HTML at build time (SSG): no Node server, so ISR/`revalidate`,
// on-demand image optimization, and proxy.ts do NOT run — content refreshes only
// on rebuild. Leave it unset for a Node-server deployment (`next start`), which
// keeps ISR, image optimization, and proxy.ts.
const STATIC_EXPORT = process.env.STATIC_EXPORT === "1";
const STRAPI_API_URL = (
  process.env.STRAPI_API_URL ||
  process.env.NEXT_PUBLIC_STRAPI_API_URL ||
  "https://stagingadmin.zusedigital.com"
).replace(/\/$/, "");

// Images uploaded to Strapi's media library are served from Strapi's host
// (S3/CloudFront on staging/production; http://localhost:1338/uploads locally).
const STRAPI_HOST = new URL(STRAPI_API_URL);
const STRAPI_IS_LOCAL = ["localhost", "127.0.0.1"].includes(STRAPI_HOST.hostname);

const nextConfig: NextConfig = {
  ...(STATIC_EXPORT ? { output: "export" } : {}),
  ...(!STATIC_EXPORT
    ? {
        async rewrites() {
          return [
            {
              source: "/api/ezforms/submit",
              destination: `${STRAPI_API_URL}/api/ezforms/submit`,
            },
            {
              source: "/api/web-vitals",
              destination: `${STRAPI_API_URL}/api/cms/vitals`,
            },
          ];
        },
      }
    : {}),
  images: {
    // Static export cannot run the image optimizer; serve images as-is.
    unoptimized: STATIC_EXPORT,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "d13fy5c8tglk2k.cloudfront.net",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: STRAPI_HOST.protocol === "http:" ? "http" : "https",
        hostname: STRAPI_HOST.hostname,
        ...(STRAPI_HOST.port ? { port: STRAPI_HOST.port } : {}),
      },
    ],
    // Only for a local Strapi in development: Next 16 refuses to optimise images from local IPs otherwise.
    dangerouslyAllowLocalIP: STRAPI_IS_LOCAL,
  },
  experimental: {
    // Own the unmatched-URL 404 document so layout metadata can't emit a second <title>.
    globalNotFound: true,
  },
};

export default nextConfig;
