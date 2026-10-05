import "server-only";

import { cache } from "react";
import { redirect } from "next/navigation";
import { env } from "@/lib/env";
import { verifySession } from "@/lib/dal";
import type { Activity, ActivityPage, CmsAccount, CmsSchema, CmsUser, EntryResponse, LeadDetail, LeadKind, LeadListResponse, ListResponse, DashboardData, PageVitals, SiteChrome, VitalsOverview } from "@/lib/types";
import type { RoleType } from "@/lib/roles";

export type StrapiFieldError = { path: string[]; message: string };

export class StrapiError extends Error {
  constructor(
    public status: number,
    message: string,
    public fieldErrors: StrapiFieldError[] = [],
  ) {
    super(message);
  }
}

/** Calls Strapi as the signed-in editor. Server-only; never expose the token. */
export async function strapiFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
  const { token } = await verifySession();

  const response = await fetch(`${env.strapiUrl}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...init.headers,
      Authorization: `Bearer ${token}`,
    },
  });

  // Expired/revoked token or deactivated account. (403 = not allowed for this
  // role: an ordinary error; getMe() handles losing CMS access altogether.)
  if (response.status === 401) redirect("/session-expired");
  if (response.status === 204) return undefined as T;

  const body = await response.json().catch(() => null);
  if (!response.ok) {
    throw new StrapiError(
      response.status,
      body?.error?.message || `Strapi responded ${response.status}`,
      body?.error?.details?.errors ?? [],
    );
  }
  return body as T;
}

/**
 * The signed-in user as Strapi sees them now (the role may have changed since
 * sign-in). Signs out users who no longer have a CMS role.
 */
export const getMe = cache(async () => {
  try {
    return (await strapiFetch<{ data: CmsUser }>("/api/cms/me")).data;
  } catch (error) {
    if (error instanceof StrapiError && error.status === 403) redirect("/session-expired");
    throw error;
  }
});

/** Saves the signed-in user's preferences; send only what changes (null = default). */
export async function updateMyPreferences(data: { timezone?: string | null; accent?: string | null }) {
  return (await strapiFetch<{ data: { timezone: string | null; accent: string | null } }>("/api/cms/me", { method: "PUT", body: JSON.stringify({ data }) })).data;
}

export const getSchema = cache(async () => (await strapiFetch<{ data: CmsSchema }>("/api/cms/schema")).data);

export async function getContentType(slug: string) {
  return (await getSchema()).contentTypes.find((type) => type.slug === slug) ?? null;
}

/** API path for one entry; single types use `/single` instead of a documentId. */
export function entryPath(type: string, documentId: string | null) {
  return `/api/cms/types/${encodeURIComponent(type)}/${documentId ? encodeURIComponent(documentId) : "single"}`;
}

export async function listEntries(
  type: string,
  params: { q?: string; page?: number; pageSize?: number; sort?: string; status?: string; columns?: string } = {},
) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return strapiFetch<ListResponse>(`/api/cms/types/${encodeURIComponent(type)}?${search}`);
}

/** null when the entry doesn't exist (collection types only). */
export async function getEntry(type: string, documentId: string | null) {
  try {
    return await strapiFetch<EntryResponse>(entryPath(type, documentId));
  } catch (error) {
    if (error instanceof StrapiError && error.status === 404) return null;
    throw error;
  }
}

/** The live header & footer for page previews; null if unavailable (previews then show sections only). */
export const getSiteChrome = cache(async () => {
  try {
    return (await strapiFetch<{ data: SiteChrome | null }>("/api/cms/site-chrome")).data;
  } catch {
    return null;
  }
});

/** Base for relative media URLs (local uploads); S3/CDN URLs are already absolute. */
export function mediaBaseUrl() {
  return env.strapiUrl;
}

/** One page of the audit log (Admins), with filters. */
export async function listActivityPage(params: { type?: string; action?: string; user?: string; page?: number; pageSize?: number } = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return strapiFetch<ActivityPage>(`/api/cms/activity?${search}`);
}

export async function listUsers() {
  return (await strapiFetch<{ data: CmsAccount[] }>("/api/cms/users")).data;
}

export async function createUser(data: { email: string; password: string; role: RoleType }) {
  return (await strapiFetch<{ data: CmsAccount }>("/api/cms/users", { method: "POST", body: JSON.stringify({ data }) })).data;
}

export async function updateUser(id: number, data: { role?: RoleType; blocked?: boolean; password?: string }) {
  return (await strapiFetch<{ data: CmsAccount }>(`/api/cms/users/${id}`, { method: "PUT", body: JSON.stringify({ data }) })).data;
}

/** Recent CMS changes (audit log), optionally for one type or entry. */
export async function listActivity(params: { type?: string; documentId?: string; limit?: number } = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return (await strapiFetch<{ data: Activity[] }>(`/api/cms/activity?${search}`)).data;
}

/** Form submissions, subscribers or visitor tracking (Admins). */
export async function listLeads(kind: LeadKind, params: { q?: string; page?: number; pageSize?: number } = {}) {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value !== undefined && value !== "") search.set(key, String(value));
  }
  return strapiFetch<LeadListResponse>(`/api/cms/leads/${kind}?${search}`);
}

/** null when it doesn't exist (e.g. deleted). */
export async function getLead(kind: LeadKind, id: number) {
  try {
    return (await strapiFetch<{ data: LeadDetail }>(`/api/cms/leads/${kind}/${id}`)).data;
  } catch (error) {
    if (error instanceof StrapiError && error.status === 404) return null;
    throw error;
  }
}

export async function deleteLead(kind: LeadKind, id: number) {
  await strapiFetch(`/api/cms/leads/${kind}/${id}`, { method: "DELETE" });
}

/** Whether "Draft with AI" can run (OpenAI key set in Strapi, or demo mode). */
export async function getAiStatus() {
  try {
    return (await strapiFetch<{ data: { pageDraft: boolean } }>("/api/cms/ai/status")).data;
  } catch {
    return { pageDraft: false };
  }
}

/** A new unpublished page drafted from a brief (src/api/cms/services/page-draft.js). */
export async function createPageDraft(input: { brief: string; audience?: string; tone?: string }) {
  return (
    await strapiFetch<{ data: { documentId: string; name: string; demo: boolean; sections: number } }>("/api/cms/ai/page-draft", {
      method: "POST",
      body: JSON.stringify(input),
    })
  ).data;
}

/** Real-visitor speed for one page path, last `days` days. */
export async function getPageVitals(path: string, days = 28) {
  return (await strapiFetch<{ data: PageVitals }>(`/api/cms/vitals?${new URLSearchParams({ path, days: String(days) })}`)).data;
}

/** Real-visitor speed for every page, slowest first. */
export async function getVitalsOverview(days = 28, device = "") {
  const search = new URLSearchParams({ days: String(days), ...(device ? { device } : {}) });
  return (await strapiFetch<{ data: VitalsOverview }>(`/api/cms/vitals/overview?${search}`)).data;
}

/** Dashboard figures; days are counted in the user's time zone. */
export async function getDashboard(timeZone: string | null) {
  return (await strapiFetch<{ data: DashboardData }>(`/api/cms/dashboard?${new URLSearchParams({ tz: timeZone || "UTC" })}`)).data;
}
