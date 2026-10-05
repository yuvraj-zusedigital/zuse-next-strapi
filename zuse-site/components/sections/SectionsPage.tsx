import { Fragment, type ReactNode } from "react";
import { JsonLd } from "@/components/seo/JsonLd";
import { GradientText } from "@/components/ui";
import AwardsRecognition from "@/components/awards/AwardsRecognition";
import { AuthorProfileCard } from "@/components/blog/AuthorProfileCard";
import BlogSubscribe from "@/components/blog/BlogSubscribe";
import { ContactFaqs, ContactFormBlock, TestimonialSliderBlock } from "@/components/contact/ContactBlocks";
import Blog, { type HomeBlogPost } from "@/components/home/Blog";
import DigitalProducts from "@/components/home/DigitalProducts";
import Hero from "@/components/home/Hero";
import Leaders from "@/components/home/Leaders";
import Logos from "@/components/home/Logos";
import Manifesto from "@/components/home/Manifesto";
import Process from "@/components/home/Process";
import Services from "@/components/home/Services";
import Stats from "@/components/home/Stats";
import Testimonials from "@/components/home/Testimonials";
import { Blocks, type BlockClasses } from "@/components/sections/Blocks";
import CaseStudyCards from "@/components/sections/CaseStudyCards";
import ProcessSteps, { BulletGrid } from "@/components/sections/ProcessSteps";
import ServiceOfferings, { BulletGroups } from "@/components/sections/ServiceOfferings";
import { TestimonialsBanner, TestimonialsGrid } from "@/components/testimonials/TestimonialsPage";
import WorkGallery from "@/components/work/WorkGallery";
import { WorkIntro } from "@/components/work/WorkIntro";
import ZanyarCollage from "@/components/zanyar/ZanyarCollage";
import ZanyarProfile from "@/components/zanyar/ZanyarProfile";
import ZanyarQuote from "@/components/zanyar/ZanyarQuote";
import type { Block } from "@/lib/blocks";
import { getAwards, pickTestimonials, toCards } from "@/lib/cms-content";
import {
  refs,
  type AuthorCardSection,
  type AwardsListSection,
  type BadgeGridSection,
  type BlogFeedSection,
  type BulletGridSection,
  type BulletGroupsSection,
  type CalloutSection,
  type CaseStudyCardsSection,
  type ContactFormSection,
  type FaqSection,
  type FeaturedWorkSection,
  type HeroSection,
  type IndustriesSection,
  type LogoStripSection,
  type ManifestoSection,
  type PageIntroSection,
  type PhotoStripSection,
  type ProcessStagesSection,
  type ProcessStepsSection,
  type ProfileSection,
  type QuoteSection,
  type RichTextSection,
  type Section,
  type ServiceOfferingsSection,
  type ServicesGridSection,
  type SubscribeFormSection,
  type TestimonialSliderSection,
  type TestimonialsSection,
  type WorkGridSection,
} from "@/lib/sections";
import { getBlogs, getProjectCategories, getProjects } from "@/lib/strapi";
import type { WorkCategory, WorkProject } from "@/lib/work";

type JsonLdData = Record<string, unknown> | Record<string, unknown>[];

/**
 * How a page shows its page intro — the one section whose look depends on the
 * page. Every other section looks the same on any page.
 */
export type IntroStyle = "marketing" | "work" | "testimonials";

export type RenderOptions = {
  intro?: IntroStyle;
  /** Thank-you page: the contact form shows its thank-you message. */
  thankYou?: boolean;
  /** Case-study category pages: the work grid's selected category. */
  activeCategory?: string | null;
};

/** Prose styles of the marketing layout's body copy (was MarketingPage's children wrapper). */
const PROSE =
  "space-y-6 text-lg opacity-80 leading-relaxed [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-ink-900 [&_h2]:opacity-100 [&_h2]:mt-10 [&_h2]:mb-3 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_strong]:text-ink-900 [&_strong]:opacity-100";

/**
 * Where a section sits: its own full-width block ("bare"), grouped with its
 * neighbours in the wide or narrow content container, or the page intro/prose.
 */
function slot(section: Section): "intro" | "prose" | "wide" | "narrow" | "bare" | null {
  switch (section.__component) {
    case "sections.page-intro":
      return "intro";
    case "sections.rich-text":
      return "prose";
    case "sections.service-offerings":
    case "sections.process-steps":
    case "sections.bullet-grid":
    case "sections.bullet-groups":
    case "sections.callout":
    case "sections.case-study-cards":
      return "wide";
    case "sections.awards-list":
      return (section as AwardsListSection).detailed ? "wide" : "narrow";
    case "sections.author-card":
      return "narrow";
    case "sections.hero":
    case "sections.logo-strip":
    case "sections.badge-grid":
    case "sections.manifesto":
    case "sections.services-grid":
    case "sections.featured-work":
    case "sections.process-stages":
    case "sections.industries":
    case "sections.testimonials":
    case "sections.blog-feed":
    case "sections.contact-form":
    case "sections.subscribe-form":
    case "sections.testimonial-slider":
    case "sections.faq":
    case "sections.work-grid":
    case "sections.profile":
    case "sections.photo-strip":
    case "sections.quote":
      return "bare";
    default:
      return null;
  }
}

function Callout({ data }: { data: CalloutSection }) {
  return (
    <section className="awards-commitment">
      {data.title ? <h2 className="awards-commitment-title">{data.title}</h2> : null}
      <Blocks value={data.body} classes={{ a: "link-sweep" }} />
    </section>
  );
}

function AuthorCard({ data, className }: { data: AuthorCardSection; className?: string }) {
  const author = data.author;
  return (
    <AuthorProfileCard
      className={className}
      author={
        author
          ? {
              name: author.Name ?? undefined,
              designation: author.Designation ?? undefined,
              description: author.Description ?? undefined,
              imageUrl: author.Image?.url,
              profileUrl: author.profileUrl ?? undefined,
            }
          : undefined
      }
    />
  );
}

async function TestimonialsBlock({ data }: { data: TestimonialsSection }) {
  const testimonials = await pickTestimonials(refs(data.testimonials));
  if (data.layout === "grid") return <TestimonialsGrid testimonials={testimonials} />;
  return <Testimonials testimonials={toCards(testimonials)} title={data.title ?? undefined} description={data.description ?? undefined} />;
}

async function AwardsList({ data }: { data: AwardsListSection }) {
  const awards = await getAwards(refs(data.awards));
  return <AwardsRecognition awards={awards} detailed={Boolean(data.detailed)} title={data.title ?? undefined} lead={data.lead ?? undefined} />;
}

type StrapiBlog = { id?: string | number; Title?: string; title?: string; slug?: string; Image?: { url?: string }; image?: { url?: string } };

async function BlogFeed({ data }: { data: BlogFeedSection }) {
  const blogs = (await getBlogs({ featuredOnly: data.featuredOnly ?? false, limit: data.limit ?? 6 })) as StrapiBlog[];
  const posts = blogs.flatMap((blog, index): HomeBlogPost[] => {
    const title = blog.Title || blog.title;
    if (!title || !blog.slug) return [];
    return [
      {
        id: blog.id ?? blog.slug,
        title,
        image: blog.Image?.url || blog.image?.url || `/images/blogs/blog-${(index % 3) + 1}.png`,
        href: `/blog/${blog.slug}`,
      },
    ];
  });
  return <Blog posts={posts} title={data.title ?? undefined} />;
}

async function WorkGrid({ data, activeCategory }: { data: WorkGridSection; activeCategory?: string | null }) {
  const [projects, categories] = await Promise.all([getProjects(), getProjectCategories()]);
  return (
    <WorkGallery
      projects={projects as WorkProject[]}
      categories={categories as WorkCategory[]}
      activeCategory={activeCategory}
      showFilter={data.showFilter ?? true}
    />
  );
}

function PageIntro({ data, style }: { data: PageIntroSection; style: IntroStyle }) {
  if (style === "work") return <WorkIntro label={data.label ?? undefined} title={data.title} lead={data.lead ?? undefined} />;
  if (style === "testimonials") return <TestimonialsBanner title={data.title} lead={data.lead ?? undefined} />;
  return (
    <>
      <div className="section-container max-w-3xl">
        <h1 className="text-4xl font-bold mb-6 tracking-tight font-display">
          <GradientText immediate as="span" className="zuse-display-gradient">
            {data.title}
          </GradientText>
        </h1>
        {data.lead ? <p className="text-xl opacity-90 mb-10 leading-relaxed">{data.lead}</p> : null}
      </div>
      {data.body?.length ? (
        <div className="section-container max-w-3xl">
          <div className={PROSE}>
            <Blocks value={data.body} />
          </div>
        </div>
      ) : null}
    </>
  );
}

/** One section's block. `index` is its position within its container group. */
async function renderBlock(section: Section, index: number, sections: Section[], options: RenderOptions): Promise<ReactNode> {
  switch (section.__component) {
    case "sections.service-offerings":
      return <ServiceOfferings data={section as ServiceOfferingsSection} />;
    case "sections.process-steps":
      return <ProcessSteps data={section as ProcessStepsSection} />;
    case "sections.bullet-grid":
      return <BulletGrid data={section as BulletGridSection} />;
    case "sections.bullet-groups":
      return <BulletGroups data={section as BulletGroupsSection} />;
    case "sections.callout":
      return <Callout data={section as CalloutSection} />;
    case "sections.case-study-cards":
      return <CaseStudyCards data={section as CaseStudyCardsSection} />;
    case "sections.awards-list":
      return <AwardsList data={section as AwardsListSection} />;
    case "sections.author-card":
      // Spaced from whatever precedes it in the same column (the About page's awards).
      return <AuthorCard data={section as AuthorCardSection} className={index > 0 ? "mt-12 md:mt-16" : ""} />;
    case "sections.testimonials":
      return <TestimonialsBlock data={section as TestimonialsSection} />;
    case "sections.hero":
      return <Hero data={section as HeroSection} />;
    case "sections.logo-strip":
      return <Logos data={section as LogoStripSection} />;
    case "sections.badge-grid":
      return <Stats data={section as BadgeGridSection} />;
    case "sections.manifesto":
      return <Manifesto data={section as ManifestoSection} />;
    case "sections.services-grid":
      return <Services data={section as ServicesGridSection} />;
    case "sections.featured-work":
      return <DigitalProducts data={section as FeaturedWorkSection} />;
    case "sections.process-stages":
      return <Process data={section as ProcessStagesSection} />;
    case "sections.industries":
      return <Leaders data={section as IndustriesSection} />;
    case "sections.blog-feed":
      return <BlogFeed data={section as BlogFeedSection} />;
    case "sections.contact-form": {
      // The page's quote slider sits beside the form.
      const slider = sections.find((item) => item.__component === "sections.testimonial-slider") as TestimonialSliderSection | undefined;
      return <ContactFormBlock form={section as ContactFormSection} slider={slider} thankYou={options.thankYou} />;
    }
    case "sections.subscribe-form":
      return <BlogSubscribe data={section as SubscribeFormSection} />;
    case "sections.testimonial-slider":
      // Already shown beside a contact form on this page.
      return sections.some((item) => item.__component === "sections.contact-form") ? null : (
        <TestimonialSliderBlock data={section as TestimonialSliderSection} />
      );
    case "sections.faq":
      return <ContactFaqs data={section as FaqSection} />;
    case "sections.work-grid":
      return <WorkGrid data={section as WorkGridSection} activeCategory={options.activeCategory} />;
    case "sections.profile":
      return <ZanyarProfile data={section as ProfileSection} />;
    case "sections.photo-strip": {
      const images = (section as PhotoStripSection).images ?? [];
      return images.length ? <ZanyarCollage images={images} /> : null;
    }
    case "sections.quote":
      return (section as QuoteSection).quote ? <ZanyarQuote data={section as QuoteSection} /> : null;
    default:
      return null;
  }
}

/**
 * Renders a page's sections in their CMS order. Consecutive content sections
 * share a container (full-width: service grids, process, detailed awards;
 * narrow: compact awards, author card); page-level blocks (hero, testimonials,
 * contact form…) render edge to edge. Unknown section types are skipped.
 */
export async function RenderSections({ sections, ...options }: { sections: Section[] } & RenderOptions) {
  const groups: { slot: NonNullable<ReturnType<typeof slot>>; sections: Section[] }[] = [];
  for (const section of sections) {
    const kind = slot(section);
    if (!kind) continue;
    const last = groups[groups.length - 1];
    if (last && last.slot === kind && kind !== "intro" && kind !== "bare") last.sections.push(section);
    else groups.push({ slot: kind, sections: [section] });
  }

  return (
    <>
      {await Promise.all(
        groups.map(async (group, index) => {
          if (group.slot === "intro") {
            return <PageIntro key={index} data={group.sections[0] as PageIntroSection} style={options.intro ?? "marketing"} />;
          }
          if (group.slot === "prose") {
            return (
              <div key={index} className="section-container max-w-3xl">
                <div className={PROSE}>
                  {group.sections.map((section, i) => (
                    <Blocks key={i} value={(section as RichTextSection).body} />
                  ))}
                </div>
              </div>
            );
          }
          const children = await Promise.all(group.sections.map((section, i) => renderBlock(section, i, sections, options)));
          const content = children.map((child, i) => <Fragment key={i}>{child}</Fragment>);
          if (group.slot === "bare") return <Fragment key={index}>{content}</Fragment>;
          return (
            <div
              key={index}
              className={group.slot === "wide" ? "section-container mt-12 md:mt-16 lg:mt-20" : "section-container max-w-3xl mt-12 md:mt-16"}
            >
              {content}
            </div>
          );
        }),
      )}
    </>
  );
}

const LEGAL_CLASSES: BlockClasses = { ul: "list-disc space-y-3 pl-6", a: "text-brand-700 underline underline-offset-4" };

/** Splits rich text into sections at each level-2 heading. */
function byHeading(blocks: Block[]) {
  const out: { title: string; blocks: Block[] }[] = [];
  for (const block of blocks) {
    if (block.type === "heading" && block.level <= 2) {
      out.push({ title: block.children.map((child) => (child.type === "text" ? child.text : child.children.map((c) => c.text).join(""))).join(""), blocks: [] });
    } else {
      if (!out.length) out.push({ title: "", blocks: [] });
      out[out.length - 1].blocks.push(block);
    }
  }
  return out;
}

/** Legal layout (Privacy, Terms): the intro's title, then rich text split into sections at each "##" heading. */
function LegalSections({ sections }: { sections: Section[] }) {
  const intro = sections.find((section) => section.__component === "sections.page-intro") as PageIntroSection | undefined;
  const blocks = sections.flatMap((section) =>
    section.__component === "sections.rich-text"
      ? (section as RichTextSection).body ?? []
      : section.__component === "sections.page-intro"
        ? (section as PageIntroSection).body ?? []
        : [],
  );

  return (
    <div className="section-container">
      <div className="max-w-[800px]">
        {intro ? <h1 className="mb-14 font-display text-5xl font-medium tracking-tight text-ink-900 md:text-6xl">{intro.title}</h1> : null}
        <div className="space-y-12">
          {byHeading(blocks).map((part, index) => (
            <section key={index}>
              {part.title ? (
                <h2 className="mb-5 font-display text-3xl font-medium leading-tight text-ink-900 md:text-4xl">{part.title}</h2>
              ) : null}
              <div className="space-y-5 font-sans text-base leading-7 text-ink-700 md:text-lg md:leading-8">
                <Blocks value={part.blocks} classes={LEGAL_CLASSES} />
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

/** A long-form page built from page-builder sections (Strapi or content/pages defaults). */
export default function SectionsPage({
  sections,
  jsonLd,
  layout = "marketing",
}: {
  sections: Section[];
  jsonLd: JsonLdData;
  layout?: "marketing" | "legal";
}) {
  if (layout === "legal") {
    return (
      <main className="relative pt-36 pb-24 lg:pt-44 lg:pb-32">
        <JsonLd data={jsonLd} />
        <LegalSections sections={sections} />
      </main>
    );
  }
  return (
    <main className="relative pt-28 pb-16 md:pt-36 md:pb-24 lg:pt-40 lg:pb-32">
      <JsonLd data={jsonLd} />
      <RenderSections sections={sections} />
    </main>
  );
}
