import "server-only";

function required(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Missing environment variable ${name} (see .env.example)`);
  return value;
}

export const env = {
  get strapiUrl() {
    return required("STRAPI_URL").replace(/\/$/, "");
  },
  /** The public website (zuse-site), for site images in previews. Optional. */
  get siteUrl() {
    return (process.env.SITE_URL ?? "").replace(/\/$/, "");
  },
  get sessionSecret() {
    return required("SESSION_SECRET");
  },
};
