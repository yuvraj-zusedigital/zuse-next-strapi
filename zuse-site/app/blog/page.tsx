import { RenderSections } from "@/components/sections/SectionsPage";
import { GradientTitle } from "@/components/sections/InlineText";
import { blogPage } from "@/content/pages/listings";
import { getPageSections, hasSection, sectionOf } from "@/lib/pages";
import { SUBSCRIBE_DEFAULTS } from "@/lib/form-defaults";
import type { PageIntroSection, SubscribeFormSection } from "@/lib/sections";
import Image from "next/image";
import Link from "next/link";
import BlogIndexGrid, {
  type BlogIndexCard,
} from "@/components/blog/BlogIndexGrid";
import BlogSubscribe from "@/components/blog/BlogSubscribe";
import { JsonLd, resolvePageJsonLd } from "@/components/seo/JsonLd";
import {
  buildStrapiPageMetadata,
  buildWebPageJsonLd,
} from "@/lib/seo/strapi-page-metadata";
import { buildBlogIndexData } from "@/lib/strapi";

const FALLBACKS = {
  title: "Blog | Zuse Digital",
  description:
    "Insights on AI, website design, software development, and digital strategy from the Zuse Digital team.",
  path: "/blog",
  keywords: [
    "zuse digital blog",
    "AI insights",
    "website design tips",
    "software development articles",
    "digital strategy australia",
  ],
  ogImage: "/images/Socialthumbnail/Blog-Page-Social-Thumbnail.jpg",
};

export async function generateMetadata() {
  return buildStrapiPageMetadata("blogs", FALLBACKS);
}

type BlogNode = {
  Title?: string;
  title?: string;
  slug?: string;
  Summary?: string;
  summary?: string;
  Image?: { url?: string };
  image?: { url?: string };
  author?: { Name?: string };
};

const FALLBACK_IMAGES = [
  "/images/blogs/blog-1.png",
  "/images/blogs/blog-2.png",
  "/images/blogs/blog-3.png",
];

export default async function BlogPage() {
  const sections = await getPageSections(blogPage);
  const intro = sectionOf<PageIntroSection>(sections, blogPage, "sections.page-intro");
  // The subscribe box keeps its place at the foot of the page; anything else
  // added to the Blog page shows below the article grid. A Blog page without
  // a Subscribe box section (e.g. before one is added in the CMS) shows the
  // built-in box; one switched off ("Hidden") hides it.
  const hasSubscribeSection = await hasSection(blogPage.slug, "sections.subscribe-form");
  const subscribe = (sections.find((section) => section.__component === "sections.subscribe-form") ??
    (hasSubscribeSection ? undefined : SUBSCRIBE_DEFAULTS)) as SubscribeFormSection | undefined;
  const extra = sections.filter((section) => section.__component !== "sections.page-intro" && section !== subscribe);
  const data = await buildBlogIndexData();
  const page = data.strapiPage as { seo?: Parameters<typeof resolvePageJsonLd>[0] } | null;
  const blogs = (data.allStrapiBlog.nodes || []) as BlogNode[];
  const displayedBlogs: BlogIndexCard[] = blogs.map((blog, index) => ({
    title: blog.Title || blog.title || `Article ${index + 1}`,
    href: blog.slug ? `/blog/${blog.slug}` : "/blog",
    image:
      blog.Image?.url ||
      blog.image?.url ||
      FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
  }));
  const jsonLd = resolvePageJsonLd(
    page?.seo,
    buildWebPageJsonLd({
      name: FALLBACKS.title,
      description: FALLBACKS.description,
      path: FALLBACKS.path,
    })
  );

  return (
    <>
      <main className="zuse-blog-index">
        <JsonLd data={jsonLd} />
        <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[780px] w-full">
          <Image
            src="/images/blogpage/blogbg.jpg"
            alt=""
            fill
            priority
            className="object-cover object-right-bottom"
          />
        </div>
        <div className="section-container zuse-blog-index-inner">
          <h1 className="zuse-blog-index-title">
            <GradientTitle text={intro.title} immediate className="zuse-display-gradient" />
          </h1>

          {blogs.length > 0 ? (
            <BlogIndexGrid cards={displayedBlogs} />
          ) : (
            <p className="zuse-blog-index-empty">
              Articles on AI, product design, and software delivery will appear
              here as they are published. In the meantime, explore our{" "}
              <Link href="/work">work</Link> or{" "}
              <span aria-disabled="true">get in touch</span>.
            </p>
          )}
        </div>
        {extra.length ? <RenderSections sections={extra} /> : null}
      </main>
      {subscribe ? <BlogSubscribe data={subscribe} /> : null}
    </>
  );
}
