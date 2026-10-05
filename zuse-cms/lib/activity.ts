import type { Activity, ActivityAction } from "@/lib/types";

const VERBS: Record<ActivityAction, string> = {
  create: "created",
  update: "edited",
  publish: "published",
  unpublish: "unpublished",
  discard: "discarded changes to",
  delete: "deleted",
  upload: "uploaded",
  "media-update": "edited details of",
  "media-delete": "deleted",
  "user-create": "created account",
  "user-update": "changed account",
};

export const activityVerb = (activity: Activity) => VERBS[activity.action] ?? activity.action;

/** Who did it, without the email domain ("editor" for editor@zuse-cms.test). */
export const activityWho = (activity: Activity) => activity.userEmail?.split("@")[0] ?? "Someone";

/** Link to the changed item, if it still exists. */
export function activityHref(activity: Activity) {
  if (activity.action === "delete" || activity.action === "media-delete") return null;
  if (activity.targetType === "user") return "/users";
  if (activity.targetType === "media") return "/media";
  return activity.targetId ? `/${activity.targetType}/${activity.targetId}` : `/${activity.targetType}`;
}

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
const UNITS: [Intl.RelativeTimeFormatUnit, number][] = [
  ["year", 365 * 24 * 3600],
  ["month", 30 * 24 * 3600],
  ["week", 7 * 24 * 3600],
  ["day", 24 * 3600],
  ["hour", 3600],
  ["minute", 60],
];

/** "5 minutes ago". Formatted on the server, so it can't differ between server and browser time zones. */
export function timeAgo(iso: string, now = Date.now()) {
  const seconds = Math.round((new Date(iso).getTime() - now) / 1000);
  for (const [unit, size] of UNITS) {
    if (Math.abs(seconds) >= size) return relative.format(Math.round(seconds / size), unit);
  }
  return "just now";
}
