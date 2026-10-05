import type { MetadataRoute } from "next";
import { SITE_URL, IS_INDEXABLE } from "@/lib/config/site";

// Emit a static robots.txt (required for `output: export` / S3+CloudFront).
export const dynamic = "force-static";

/**
 * Generates /robots.txt at build time.
 *
 * Production (origin === https://zusedigital.com): allow crawling and advertise
 * the sitemap. Any other environment (staging, preview, local) disallows all
 * crawling so it can never be indexed or dilute the production site's SEO.
 */
export default function robots(): MetadataRoute.Robots {
  if (!IS_INDEXABLE) {
    return {
      rules: { userAgent: "*", disallow: "/" },
    };
  }

  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}
