import { describe, expect, it } from "vitest";
import { analyse, collectText, countKeyword, lengthStatus, TITLE_RANGE } from "@/lib/seo";

describe("countKeyword", () => {
  it("matches whole phrases, ignoring case and punctuation", () => {
    expect(countKeyword("Web Design & Web-design, web designer", "web design")).toBe(2);
    expect(countKeyword("Café design", "cafe design")).toBe(1);
    expect(countKeyword("anything", "")).toBe(0);
  });
});

describe("lengthStatus", () => {
  it("rates lengths against the range", () => {
    expect(lengthStatus(0, TITLE_RANGE)).toBe("bad");
    expect(lengthStatus(20, TITLE_RANGE)).toBe("ok");
    expect(lengthStatus(45, TITLE_RANGE)).toBe("good");
    expect(lengthStatus(61, TITLE_RANGE)).toBe("bad");
  });
});

describe("collectText", () => {
  it("collects readable text and skips keys, URLs, media and slugs", () => {
    const text = collectText({
      __component: "sections.hero",
      title: "Mobile App Development",
      href: "/contact",
      image: { url: "/uploads/x.png", mime: "image/png" },
      body: [{ type: "paragraph", children: [{ type: "text", text: "We build apps." }] }],
      seo: { metaTitle: "ignored" },
      variant: "primary",
    }, ["seo"]);
    expect(text).toContain("Mobile App Development");
    expect(text).toContain("We build apps.");
    expect(text).not.toContain("ignored");
    expect(text).not.toContain("/contact");
  });
});

describe("analyse", () => {
  const base = {
    title: "Mobile App Development Agency in Melbourne | Zuse",
    description: "Zuse Digital builds award-winning iOS and Android apps. Mobile app development from strategy and UX to launch, support and growth for startups.",
    keyword: "mobile app development",
    path: "/services/mobile-app-development",
    content: "Mobile app development for startups. We love mobile app development.",
    hasImage: true,
    robots: "index, follow",
  };

  it("scores a well-optimised page highly", () => {
    const { score, checks } = analyse(base);
    expect(checks.every((check) => check.status === "good")).toBe(true);
    expect(score).toBe(100);
  });

  it("flags noindex, a missing image and a keyword missing from the title", () => {
    const { checks, score } = analyse({ ...base, title: "Apps by Zuse Digital for everyone", hasImage: false, robots: "noindex" });
    const status = Object.fromEntries(checks.map((check) => [check.id, check.status]));
    expect(status["keyword-title"]).toBe("bad");
    expect(status.image).toBe("bad");
    expect(status.indexing).toBe("bad");
    expect(score).toBeLessThan(80);
  });

  it("asks for a focus keyword when there is none", () => {
    const { checks } = analyse({ ...base, keyword: "" });
    expect(checks.find((check) => check.id === "keyword")?.status).toBe("ok");
  });
});
