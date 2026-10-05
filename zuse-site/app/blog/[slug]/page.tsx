import Link from "next/link";
import { notFound } from "next/navigation";

import { resolvePageJsonLd, JsonLd } from "@/components/seo/JsonLd";
import {
  buildMetadataFromSeo,
  buildWebPageJsonLd,
  type StrapiPageSeo,
} from "@/lib/seo/strapi-page-metadata";
import { getBlogBySlug, getBlogs } from "@/lib/strapi";
import { BlogActions } from "@/components/blog/BlogActions";
import { AuthorProfileCard } from "@/components/blog/AuthorProfileCard";
import BlogCard from "@/components/blog/BlogCard";

type BlogAuthor = {
  Name?: string;
  Designation?: string;
  Description?: string;
  profileUrl?: string;
  Image?: { url?: string };
};

type RelatedBlogRecord = {
  Title?: string;
  slug?: string;
  Image?: { url?: string };
  author?: BlogAuthor;
};

type BlogRecord = {
  Title?: string;
  title?: string;
  slug?: string;
  Summary?: string;
  summary?: string;
  aiSummary?: string;
  audioVariants?: { url: string; label: string;[key: string]: any }[];
  Description?: string | { data?: { Description?: string } };
  author?: BlogAuthor;
  RelatedBlog?: RelatedBlogRecord[];
  publishedAt?: string;
  Image?: { url: string; alternativeText?: string; width?: number; height?: number };
  seo?: StrapiPageSeo;
};

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const blogs = (await getBlogs()) as BlogRecord[];
  return blogs
    .map((blog) => blog.slug)
    .filter((slug): slug is string => Boolean(slug))
    .map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const blog = (await getBlogBySlug(slug)) as BlogRecord | null;
  const title = blog?.Title || blog?.title || "Blog";
  const description =
    blog?.Summary || blog?.summary || "Insights from the Zuse Digital team.";

  // Prefer the shared blog-detail Socialthumbnail for now (over article Image /
  // Strapi SEO metaImage). Flip back to blog?.Image?.url || Socialthumbnail
  // once CMS OG assets are updated for production.
  return buildMetadataFromSeo(blog?.seo, {
    title: `${title} | Zuse Digital`,
    description,
    path: `/blog/${slug}`,
    keywords: ["zuse digital blog", title],
    ogImage: "/images/Socialthumbnail/Blog-detail-Page-Social-Thumbnail.jpg",
  });
}

function descriptionHtml(blog: BlogRecord): string | null {
  const desc = blog.Description;
  let raw: string | null = null;
  if (typeof desc === "string" && desc.trim()) raw = desc;
  else if (desc && typeof desc === "object" && typeof desc.data?.Description === "string") {
    raw = desc.data.Description;
  }
  if (!raw) return null;
  // The page renders its own <h1> (the article title). Demote any <h1> that
  // authors added inside the CMS body to <h2> so the page keeps a single h1.
  return raw.replace(/<(\/?)h1(\s|>)/gi, "<$1h2$2");
}

export default async function BlogArticlePage({ params }: PageProps) {
  const { slug } = await params;
  const blog = (await getBlogBySlug(slug)) as BlogRecord | null;
  if (!blog) notFound();

  const title = blog.Title || blog.title || "Article";
  const summary = blog.Summary || blog.summary;
  const imageUrl = blog.Image?.url;
  const imageAlt = blog.Image?.alternativeText || title;
  const author = blog.author?.Name;
  const relatedBlogs = (blog.RelatedBlog || []).filter(
    (related): related is RelatedBlogRecord & { slug: string } => Boolean(related.slug)
  );
  const html = descriptionHtml(blog);
  const jsonLd = resolvePageJsonLd(
    blog.seo,
    buildWebPageJsonLd({
      name: title,
      description: summary || title,
      path: `/blog/${slug}`,
    })
  );

  return (
    <main className="relative pt-28 pb-16 md:pt-36 md:pb-24 lg:pt-40 ">
      <JsonLd data={jsonLd} />
      <div className="section-container zuse-blog-detail">
        <h1 className="zuse-blog-detail-title mb-6">{title}</h1>
        {(author || blog.publishedAt) ? (
          <div className="mb-6 flex items-center  text-sm text-ink-400">
            {/* {author ? <span className="font-medium text-ink-900">By {author}</span> : null} */}

            <span className="zuse-blog-detail-date">Published on {blog.publishedAt ? (
              <time dateTime={blog.publishedAt}>
                {new Date(blog.publishedAt).toLocaleDateString("en-AU", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            ) : null}
            </span>
          </div>
        ) : null}
        {summary ? (
          <p className="zuse-blog-detail-summary mb-6">{summary}</p>
        ) : null}

        <BlogActions aiSummary={blog.aiSummary} audioVariants={blog.audioVariants} />

        {imageUrl ? (
          <img src={imageUrl} alt={imageAlt} className="block w-full h-auto mt-6 mb-0 rounded-lg" />
        ) : null}

        {html ? (
          <div className="zuse-blog-detail-content" dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p>
            This article is available on our blog.{" "}
            <Link href="/blog" className="underline underline-offset-4">
              Back to all articles
            </Link>
            .
          </p>
        )}



      </div>
      {/* Author Profile Block */}
      <div className="px-4">
        <AuthorProfileCard
          className="mt-12 md:mt-16 w-full max-w-[824px] mx-auto"
          author={{
            name: blog.author?.Name,
            designation: blog.author?.Designation,
            description: blog.author?.Description,
            imageUrl: blog.author?.Image?.url,
            profileUrl: blog.author?.profileUrl,
          }}
        />
      </div>

      {relatedBlogs.length > 0 ? (
        <section className="section-container zuse-blog-detail-related" aria-labelledby="related-blog-title">
          <h2 id="related-blog-title" className="zuse-blog-detail-related-title">Related Blog</h2>
          <div className="zuse-blog-index-grid">
            {relatedBlogs.map((related) => (
              <BlogCard
                key={related.slug}
                title={related.Title || "Article"}
                href={`/blog/${related.slug}`}
                image={related.Image?.url || "/images/blogs/blog-1.png"}
                authorName={related.author?.Name}
                authorImage={related.author?.Image?.url}
              />
            ))}
          </div>
        </section>
      ) : null}

    </main>
  );
}
