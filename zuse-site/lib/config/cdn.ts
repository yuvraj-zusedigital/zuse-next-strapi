/**
 * Where the site's own static images and videos live (the production CDN).
 * Set NEXT_PUBLIC_CDN_URL=/cdn locally after running `npm run cdn:mirror` to
 * serve them from public/cdn instead, e.g. to work offline. No trailing slash.
 */
export const CDN_URL = (process.env.NEXT_PUBLIC_CDN_URL || "https://d13fy5c8tglk2k.cloudfront.net").replace(/\/$/, "");
