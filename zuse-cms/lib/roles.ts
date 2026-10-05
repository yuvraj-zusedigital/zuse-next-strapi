/**
 * Zuse CMS roles, lowest to highest (same as Strapi's
 * src/api/cms/utils/roles.js, which enforces them). Each role can do
 * everything the roles below it can.
 */
export const ROLES = [
  { type: "editor", name: "Editor", description: "Edits and publishes content and media." },
  { type: "admin", name: "Admin", description: "Also deletes, edits site settings, sees the activity log and manages editors." },
  { type: "super-admin", name: "Super Admin", description: "Full access, including managing admins." },
] as const;

export type RoleType = (typeof ROLES)[number]["type"];

const rank = (type: string | null | undefined) => ROLES.findIndex((role) => role.type === type) + 1;

/** True when `type` is `min` or higher. */
export const atLeast = (type: string | null | undefined, min: RoleType) => rank(type) >= rank(min);

/** Roles a user with `type` may give to others (Admins: Editor only). */
export const assignableRoles = (type: string | null | undefined) =>
  type === "super-admin" ? ROLES : type === "admin" ? ROLES.filter((role) => role.type === "editor") : [];

export const roleName = (type: string | null | undefined) => ROLES.find((role) => role.type === type)?.name ?? "No access";
