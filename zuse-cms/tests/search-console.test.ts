import { generateKeyPairSync } from "node:crypto";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// "server-only" throws outside a React Server Component; it's irrelevant here.
vi.mock("server-only", () => ({}));

const { dateRange, pageRegex, pagePerformance, searchConsoleConfig } = await import("@/lib/search-console");

describe("dateRange", () => {
  it("covers the 28 days ending two days ago", () => {
    expect(dateRange(new Date("2026-10-01T10:00:00Z"))).toEqual({ start: "2026-09-02", end: "2026-09-29" });
  });
});

describe("pageRegex", () => {
  it("matches the page with or without a trailing slash, and nothing deeper", () => {
    const re = new RegExp(pageRegex("https://zusedigital.com", "/services/website-design"));
    expect(re.test("https://zusedigital.com/services/website-design")).toBe(true);
    expect(re.test("https://zusedigital.com/services/website-design/")).toBe(true);
    expect(re.test("https://zusedigital.com/services/website-design/extra")).toBe(false);
    const home = new RegExp(pageRegex("https://zusedigital.com", "/"));
    expect(home.test("https://zusedigital.com/")).toBe(true);
    expect(home.test("https://zusedigital.com/about")).toBe(false);
  });
});

describe("pagePerformance", () => {
  const { privateKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
  const credentials = { client_email: "cms@project.iam.gserviceaccount.com", private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString() };

  beforeEach(() => {
    process.env.SEARCH_CONSOLE_CREDENTIALS = Buffer.from(JSON.stringify(credentials)).toString("base64");
    process.env.SEARCH_CONSOLE_SITE = "sc-domain:zusedigital.com";
    delete process.env.SEARCH_CONSOLE_DEMO;
  });
  afterEach(() => {
    vi.unstubAllGlobals();
    delete process.env.SEARCH_CONSOLE_CREDENTIALS;
    delete process.env.SEARCH_CONSOLE_SITE;
  });

  it("is configured from base64 credentials", () => {
    expect(searchConsoleConfig().configured).toBe(true);
  });

  it("signs in with the service account and queries totals, days and searches for the page", async () => {
    const bodies: Record<string, unknown>[] = [];
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, init: RequestInit) => {
        if (url.startsWith("https://oauth2.googleapis.com/token")) {
          const params = new URLSearchParams(String(init.body));
          expect(params.get("grant_type")).toBe("urn:ietf:params:oauth:grant-type:jwt-bearer");
          expect(params.get("assertion")?.split(".")).toHaveLength(3);
          return new Response(JSON.stringify({ access_token: "token-1", expires_in: 3600 }));
        }
        expect(url).toBe("https://www.googleapis.com/webmasters/v3/sites/sc-domain%3Azusedigital.com/searchAnalytics/query");
        expect((init.headers as Record<string, string>).Authorization).toBe("Bearer token-1");
        const body = JSON.parse(String(init.body));
        bodies.push(body);
        const dims = body.dimensions?.[0];
        const rows =
          dims === "date"
            ? [{ keys: ["2026-09-28"], clicks: 3, impressions: 90, ctr: 0.03, position: 9 }]
            : dims === "query"
              ? [{ keys: ["website design melbourne"], clicks: 5, impressions: 200, ctr: 0.025, position: 7.2 }]
              : [{ clicks: 12, impressions: 640, ctr: 0.019, position: 11.4 }];
        return new Response(JSON.stringify({ rows }));
      }),
    );

    const data = await pagePerformance("/services/website-design-test");
    expect(data.totals).toEqual({ clicks: 12, impressions: 640, ctr: 0.019, position: 11.4 });
    expect(data.queries[0].query).toBe("website design melbourne");
    expect(data.trend).toEqual([{ date: "2026-09-28", clicks: 3, impressions: 90 }]);
    expect(bodies).toHaveLength(3);
    for (const body of bodies) {
      expect(body.dimensionFilterGroups).toEqual([
        { filters: [{ dimension: "page", operator: "includingRegex", expression: "^https://zusedigital\\.com/services/website-design-test/?$" }] },
      ]);
    }
  });

  it("explains a missing permission", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string) =>
        url.includes("oauth2")
          ? new Response(JSON.stringify({ access_token: "token-2", expires_in: 3600 }))
          : new Response(JSON.stringify({ error: { message: "forbidden" } }), { status: 403 }),
      ),
    );
    await expect(pagePerformance("/no-access-page")).rejects.toThrow(/add the service account as a user/);
  });
});
