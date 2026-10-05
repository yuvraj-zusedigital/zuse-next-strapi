import { describe, expect, it } from "vitest";
import { activityHref, activityVerb, activityWho, timeAgo } from "@/lib/activity";
import type { Activity } from "@/lib/types";

const base: Activity = {
  action: "update",
  targetType: "page",
  targetId: "abc",
  title: "Home",
  userEmail: "jane@zusedigital.com",
  count: 3,
  at: "2026-09-29T10:00:00.000Z",
};

describe("activity wording", () => {
  it("describes who did what", () => {
    expect(activityWho(base)).toBe("jane");
    expect(activityVerb(base)).toBe("edited");
    expect(activityVerb({ ...base, action: "discard" })).toBe("discarded changes to");
  });

  it("links to items that still exist", () => {
    expect(activityHref(base)).toBe("/page/abc");
    expect(activityHref({ ...base, action: "delete" })).toBeNull();
    expect(activityHref({ ...base, targetType: "media", action: "upload" })).toBe("/media");
  });

  it("formats relative times", () => {
    const now = new Date("2026-09-29T10:05:00.000Z").getTime();
    expect(timeAgo(base.at, now)).toBe("5 minutes ago");
    expect(timeAgo("2026-09-29T10:04:50.000Z", now)).toBe("just now");
    expect(timeAgo("2026-09-28T10:05:00.000Z", now)).toBe("yesterday");
  });
});
