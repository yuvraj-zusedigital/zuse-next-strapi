"use client";

import { ChevronDown, Quote as QuoteIcon, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Blocks,
  Container,
  Heading,
  lines,
  list,
  media,
  Media,
  Muted,
  Placeholder,
  Rich,
  Section,
  SiteButton,
  str,
  type Values,
} from "./primitives";

/**
 * Approximate renderers for each page-builder section, styled after the
 * nextsetup components. They show structure and content, not pixel-perfect
 * design; the real site is the source of truth.
 */

type Renderer = (props: { data: Values }) => React.ReactNode;

const relationLabels = (value: unknown) => list(value).map((item) => str(item.label));

function WorkCard({ card, large }: { card: Values; large?: boolean }) {
  const tags = str(card.tags)
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
  return (
    <div className={cn("overflow-hidden rounded-2xl bg-site-card", large && "@3xl:col-span-2")}>
      <Media value={media(card.video).length ? card.video : card.image} className="aspect-[16/10] w-full" />
      <div className="space-y-2 p-5">
        <div className="text-lg font-semibold">{str(card.title) || "Untitled"}</div>
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((tag) => (
              <span key={tag} className="rounded-full border border-site-line px-2.5 py-0.5 text-xs text-site-ink-soft">
                {tag}
              </span>
            ))}
          </div>
        )}
        {str(card.description) && <p className="text-sm text-site-ink-soft">{str(card.description)}</p>}
      </div>
    </div>
  );
}

const Hero: Renderer = ({ data }) => (
  <section className="relative overflow-hidden bg-gradient-to-b from-site-hero to-white">
    {media(data.backgroundImage).length > 0 && (
      <Media value={data.backgroundImage} className="absolute inset-y-0 right-0 hidden h-full w-1/2 opacity-80 @3xl:block" placeholder={false} />
    )}
    <Container className="relative py-20 @3xl:py-28">
      <div className="max-w-2xl space-y-6">
        {str(data.label) && (
          <div className="inline-flex items-center gap-2 text-sm text-site-muted">
            <Media value={data.labelIcon} className="h-3.5 w-5" placeholder={false} />
            {str(data.label)}
          </div>
        )}
        <h1 className="text-4xl leading-[1.02] font-semibold tracking-tight @3xl:text-6xl">
          <Rich text={data.title} />
        </h1>
        {str(data.description) && <Muted>{str(data.description)}</Muted>}
        <div className="flex flex-wrap gap-3">
          <SiteButton link={data.primaryCta} />
          <SiteButton link={data.secondaryCta} fallbackVariant="secondary" />
        </div>
      </div>
    </Container>
  </section>
);

const LogoStrip: Renderer = ({ data }) => (
  <Section className="py-10 @3xl:py-12">
    <Container className="space-y-6 text-center">
      <div className="flex items-center justify-center gap-3 text-lg font-medium">
        <Media value={data.avatarImage} className="size-8 rounded-full" placeholder={false} />
        <span>
          {str(data.headingBefore)} <span className="site-gradient">{str(data.headingHighlight)}</span> {str(data.headingAfter)}
        </span>
      </div>
      <div className="flex flex-wrap items-center justify-center gap-8 opacity-70 grayscale">
        {media(data.logos).map((logo) => (
          <Media key={logo.id} value={[logo]} className="h-8 w-auto object-contain" />
        ))}
        {media(data.logos).length === 0 && <Placeholder>Client logos</Placeholder>}
      </div>
    </Container>
  </Section>
);

const BadgeGrid: Renderer = ({ data }) => (
  <Section className="py-10">
    <Container className="grid grid-cols-3 gap-6 @3xl:grid-cols-6">
      {media(data.badges).map((badge) => (
        <Media key={badge.id} value={[badge]} className="aspect-square w-full object-contain" />
      ))}
      {media(data.badges).length === 0 && <Placeholder className="col-span-full">Badges</Placeholder>}
    </Container>
  </Section>
);

const Manifesto: Renderer = ({ data }) => (
  <Section>
    <Container className="space-y-2 text-3xl leading-tight font-semibold tracking-tight @3xl:text-5xl">
      {list(data.paragraphs).map((line, index) => (
        <p key={str(line.__key) || index}>
          <Rich text={line.textBefore} />{" "}
          {media(line.inlineImage).length > 0 && (
            <Media value={line.inlineImage} className="mx-1 inline-block h-[0.8em] w-[1.8em] rounded-full align-middle" />
          )}{" "}
          <Rich text={line.textAfter} />
        </p>
      ))}
      <div className="pt-6 text-base">
        <SiteButton link={data.cta} />
      </div>
    </Container>
  </Section>
);

const ServicesGrid: Renderer = ({ data }) => (
  <Section>
    <Container className="space-y-10">
      <div className="max-w-2xl space-y-4">
        <Heading text={data.title} />
        {str(data.description) && <Muted>{str(data.description)}</Muted>}
      </div>
      <div className="grid gap-4 @3xl:grid-cols-3">
        {list(data.cards).map((card, index) => (
          <div key={str(card.__key) || index} className="relative overflow-hidden rounded-2xl bg-site-card p-6">
            <Media value={card.backgroundImage} className="absolute inset-0 h-full w-full opacity-30" placeholder={false} />
            <div className="relative space-y-2">
              {str(card.diagram) && str(card.diagram) !== "none" && (
                <div className="mb-6 flex h-24 items-center justify-center rounded-xl bg-white/70 text-xs text-site-muted">
                  {str(card.diagram)} diagram
                </div>
              )}
              <div className="text-xl font-semibold">{str(card.title)}</div>
              <p className="text-sm text-site-ink-soft">{str(card.description)}</p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  </Section>
);

const FeaturedWork: Renderer = ({ data }) => (
  <Section>
    <Container className="space-y-10">
      <div className="max-w-2xl space-y-4">
        <Heading text={data.title} />
        {str(data.description) && <Muted>{str(data.description)}</Muted>}
      </div>
      <div className="grid gap-5 @3xl:grid-cols-2">
        {list(data.cards).map((card, index) => (
          <WorkCard key={str(card.__key) || index} card={card} large={str(card.size) === "large"} />
        ))}
      </div>
      <SiteButton link={data.cta} />
    </Container>
  </Section>
);

const ProcessStages: Renderer = ({ data }) => (
  <section className="site-process-bg py-20 text-white">
    <Container className="space-y-10">
      <h2 className="text-3xl font-semibold tracking-tight @3xl:text-5xl">
        <Rich text={data.title} />
      </h2>
      <ol className="grid gap-4 @3xl:grid-cols-4">
        {list(data.stages).map((stage, index) => (
          <li key={str(stage.__key) || index} className="rounded-2xl bg-white/10 p-5 backdrop-blur">
            <div className="text-sm opacity-70">
              {String(index + 1).padStart(2, "0")} · {str(stage.shortTitle)}
            </div>
            <div className="mt-2 text-xl font-semibold">{str(stage.title)}</div>
            <p className="mt-2 text-sm opacity-80">{str(stage.body)}</p>
          </li>
        ))}
      </ol>
    </Container>
  </section>
);

const Industries: Renderer = ({ data }) => (
  <Section>
    <Container className="space-y-10">
      <div className="max-w-2xl space-y-4">
        <Heading text={data.title} />
        {str(data.description) && <Muted>{str(data.description)}</Muted>}
      </div>
      <div className="grid gap-4 @3xl:grid-cols-3">
        {list(data.items).map((item, index) => (
          <div
            key={str(item.__key) || index}
            className="overflow-hidden rounded-2xl"
            style={{ background: `linear-gradient(160deg, ${str(item.color) || "#124ab9"}22, ${str(item.color) || "#124ab9"}66)` }}
          >
            <Media value={item.imageDesktop} className="aspect-[4/3] w-full" />
            <div className="space-y-2 p-5">
              <div className="text-xl font-semibold">{str(item.title)}</div>
              <p className="text-sm text-site-ink-soft">{str(item.copy)}</p>
            </div>
          </div>
        ))}
      </div>
    </Container>
  </Section>
);

const Testimonials: Renderer = ({ data }) => {
  const names = relationLabels(data.testimonials);
  return (
    <Section className="bg-[#f7f8fb]">
      <Container className="space-y-10">
        <Heading text={data.title} />
        <div className={cn("grid gap-4", str(data.layout) === "grid" ? "@3xl:grid-cols-3" : "auto-cols-[80%] grid-flow-col overflow-hidden @3xl:auto-cols-[40%]")}>
          {(names.length ? names : ["Every published testimonial", "…ordered by rank", "…"]).map((name, index) => (
            <div key={index} className="space-y-4 rounded-2xl border border-site-line bg-white p-6">
              <QuoteIcon className="size-6 text-site-sky" />
              <div className="flex gap-0.5 text-amber-400">
                {Array.from({ length: 5 }, (_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <p className="text-sm text-site-muted">Testimonial text appears here on the site.</p>
              <div className="font-semibold">{name}</div>
            </div>
          ))}
        </div>
      </Container>
    </Section>
  );
};

const BlogFeed: Renderer = ({ data }) => {
  const count = Math.min(Number(str(data.limit)) || 3, 6);
  return (
    <Section>
      <Container className="space-y-10">
        <Heading text={data.title} />
        <div className="grid gap-5 @3xl:grid-cols-3">
          {Array.from({ length: count }, (_, index) => (
            <div key={index} className="space-y-3">
              <div className="aspect-[16/10] rounded-2xl bg-site-card" />
              <div className="h-4 w-3/4 rounded bg-site-card" />
              <div className="h-3 w-1/2 rounded bg-site-card" />
            </div>
          ))}
        </div>
        <p className="text-xs text-site-muted">
          Latest {data.featuredOnly ? "featured " : ""}blog posts ({count}) are loaded by the site.
        </p>
      </Container>
    </Section>
  );
};

const PageIntro: Renderer = ({ data }) => (
  <Section className="bg-gradient-to-b from-site-hero to-white">
    <Container className="max-w-3xl space-y-6">
      <Heading text={data.title} as="h1" className="@3xl:text-6xl" />
      {str(data.lead) && <Muted className="text-lg @3xl:text-xl">{str(data.lead)}</Muted>}
      <Blocks value={data.body} />
    </Container>
  </Section>
);

const ServiceOfferings: Renderer = ({ data }) => (
  <Section>
    <Container className="space-y-10">
      <Heading text={data.title} />
      <div className="grid gap-4 @3xl:grid-cols-2">
        {list(data.items).map((item, index) => (
          <div key={str(item.__key) || index} className="space-y-3 rounded-2xl border border-site-line p-6">
            <div className="text-xl font-semibold">{str(item.title)}</div>
            <p className="text-sm text-site-ink-soft">{str(item.description)}</p>
            <ul className="space-y-1.5 text-sm">
              {list(item.points).map((point, i) => (
                <li key={str(point.__key) || i} className="flex gap-2">
                  <span className="mt-1.5 size-1.5 shrink-0 rounded-full bg-site-brand-2" />
                  <span>
                    <span className="font-medium">{str(point.title)}</span>
                    {str(point.description) && <span className="text-site-ink-soft"> — {str(point.description)}</span>}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Container>
  </Section>
);

const ProcessSteps: Renderer = ({ data }) => (
  <Section>
    <Container className="space-y-10">
      <Heading text={data.title} />
      <ol className="grid gap-6 @3xl:grid-cols-4">
        {list(data.steps).map((step, index) => (
          <li key={str(step.__key) || index} className="space-y-3">
            <div className="flex items-center gap-3">
              <Media value={step.icon} className="size-10 rounded-xl" />
              <span className="text-sm text-site-muted">Step {index + 1}</span>
            </div>
            <div className="text-lg font-semibold">{str(step.title)}</div>
            <p className="text-sm text-site-ink-soft">{str(step.description)}</p>
          </li>
        ))}
      </ol>
    </Container>
  </Section>
);

const BulletGrid: Renderer = ({ data }) => (
  <Section>
    <Container className="space-y-10">
      <div className="max-w-2xl space-y-4">
        <Heading text={data.title} />
        {str(data.lead) && <Muted>{str(data.lead)}</Muted>}
      </div>
      <div className="grid gap-x-8 gap-y-6 @xl:grid-cols-2 @3xl:grid-cols-3">
        {list(data.items).map((item, index) => (
          <div key={str(item.__key) || index} className="space-y-1.5 border-t border-site-line pt-4">
            <div className="font-semibold">{str(item.title)}</div>
            <p className="text-sm text-site-ink-soft">{str(item.description)}</p>
          </div>
        ))}
      </div>
    </Container>
  </Section>
);

const BulletGroups: Renderer = ({ data }) => (
  <Section>
    <Container className="space-y-10">
      <Heading text={data.title} />
      <div className="grid gap-6 @3xl:grid-cols-3">
        {list(data.groups).map((group, index) => (
          <div key={str(group.__key) || index} className="rounded-2xl bg-site-card p-6">
            <div className="mb-3 font-semibold">{str(group.title)}</div>
            <div className="flex flex-wrap gap-2">
              {list(group.items).map((item, i) => (
                <span key={str(item.__key) || i} className="rounded-full bg-white px-3 py-1 text-sm">
                  {str(item.title)}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </Container>
  </Section>
);

const CaseStudyCards: Renderer = ({ data }) => (
  <Section>
    <Container className="space-y-10">
      <Heading text={data.title} />
      <div className="grid gap-5 @3xl:grid-cols-2">
        {list(data.cards).map((card, index) => (
          <WorkCard key={str(card.__key) || index} card={card} large={str(card.size) === "large"} />
        ))}
      </div>
    </Container>
  </Section>
);

const RichText: Renderer = ({ data }) => (
  <Section>
    <Container className="max-w-3xl">
      <Blocks value={data.body} />
      {!Array.isArray(data.body) && <Placeholder>Empty rich text</Placeholder>}
    </Container>
  </Section>
);

const Faq: Renderer = ({ data }) => (
  <Section>
    <Container className="grid gap-10 @3xl:grid-cols-[1fr_2fr]">
      <Heading text={data.title} className="@3xl:text-4xl" />
      <div className="divide-y divide-site-line border-y border-site-line">
        {list(data.items).map((item, index) => (
          <details key={str(item.__key) || index} className="group py-4" open={index === 0}>
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
              {str(item.question) || "Question"}
              <ChevronDown className="size-4 shrink-0 transition-transform group-open:rotate-180" />
            </summary>
            <p className="mt-3 text-sm whitespace-pre-line text-site-ink-soft">{str(item.answer)}</p>
          </details>
        ))}
      </div>
    </Container>
  </Section>
);

const AwardsList: Renderer = ({ data }) => {
  const names = relationLabels(data.awards);
  return (
    <Section>
      <Container className="space-y-8">
        {!data.detailed && <Heading text={data.title || "Awards & Recognition"} />}
        {!data.detailed && str(data.lead) && <Muted>{str(data.lead)}</Muted>}
        {names.length ? (
          <ul className="divide-y divide-site-line border-y border-site-line">
            {names.map((name) => (
              <li key={name} className="py-4 text-lg font-medium">
                {name}
              </li>
            ))}
          </ul>
        ) : (
          <Placeholder>Every published award, ordered by rank.</Placeholder>
        )}
      </Container>
    </Section>
  );
};

const Callout: Renderer = ({ data }) => (
  <Section>
    <Container className="max-w-3xl space-y-4 rounded-2xl bg-site-card p-8">
      <Heading text={data.title} />
      <Blocks value={data.body} />
    </Container>
  </Section>
);

const AuthorCard: Renderer = ({ data }) => {
  const [name] = relationLabels(data.author);
  return (
    <Section>
      <Container className="max-w-3xl">
        <div className="flex items-center gap-4 rounded-2xl border border-site-line p-6">
          <div className="size-16 shrink-0 rounded-full bg-site-card" />
          <div>
            <div className="font-semibold">{name || "Zanyar"}</div>
            <Muted className="text-sm">{name ? "Author profile card" : "Founder of Zuse Digital (default card)"}</Muted>
          </div>
        </div>
      </Container>
    </Section>
  );
};

const TestimonialSlider: Renderer = ({ data }) => {
  const items = list(data.items);
  const first = items[0];
  return (
    <Section className="bg-[#f7f8fb]">
      <Container className="max-w-3xl space-y-6">
        <div className="flex gap-3">
          {items.map((item, index) => (
            <Media key={str(item.__key) || index} value={item.image} className={cn("size-14 rounded-full", index > 0 && "opacity-50")} />
          ))}
        </div>
        {first ? (
          <div className="space-y-2">
            <div className="font-semibold">
              {str(first.name)}
              {str(first.company) && <span className="font-normal text-site-muted"> • {str(first.company)}</span>}
            </div>
            <div className="text-sm text-site-muted">{str(first.role)}</div>
            <blockquote className="text-lg">“{str(first.quote)}”</blockquote>
          </div>
        ) : (
          <Placeholder>Add quotes</Placeholder>
        )}
      </Container>
    </Section>
  );
};

const PhotoStrip: Renderer = ({ data }) => (
  <Section>
    <div className="flex gap-4 overflow-hidden px-6">
      {media(data.images).length ? (
        media(data.images).map((image, index) => <Media key={index} value={[image]} className="aspect-[480/560] w-40 shrink-0 rounded-2xl" />)
      ) : (
        <Placeholder className="w-full">Add photos</Placeholder>
      )}
    </div>
  </Section>
);

const QuoteBlock: Renderer = ({ data }) => (
  <Section>
    <Container className="max-w-3xl space-y-6">
      <QuoteIcon className="size-8 text-site-brand-2" />
      <p className="text-2xl leading-snug @3xl:text-3xl">{str(data.quote)}</p>
      <div className="flex items-center gap-2 text-site-muted">
        <Media value={data.citeImage} className="size-8 rounded-full" placeholder={false} />
        {str(data.cite)}
      </div>
    </Container>
  </Section>
);

const WorkGrid: Renderer = ({ data }) => (
  <Section>
    <Container className="space-y-8">
      <Heading text={data.title} />
      {Boolean(data.showFilter) && (
        <div className="flex flex-wrap gap-2">
          {["All", "Websites", "Web apps", "Mobile"].map((label, index) => (
            <span key={label} className={cn("rounded-full px-4 py-1.5 text-sm", index === 0 ? "bg-site-ink text-white" : "bg-[#e9f0f8]")}>
              {label}
            </span>
          ))}
        </div>
      )}
      <Placeholder>All projects are listed here on the site.</Placeholder>
    </Container>
  </Section>
);

/** The site's wording when a form field is left empty (zuse-site lib/form-defaults.ts). */
const FORM_FIELDS: [key: string, label: string, options?: string][] = [
  ["nameField", "Full Name"],
  ["emailField", "Email address"],
  ["phoneField", "Phone number"],
  ["serviceField", "Service Type", "serviceOptions"],
  ["messageField", "Your message"],
  ["budgetField", "Budget", "budgetOptions"],
  ["referralField", "How did you hear about us?", "referralOptions"],
];

const ContactForm: Renderer = ({ data }) => (
  <Section>
    <Container className="grid gap-10 @3xl:grid-cols-2">
      <div className="space-y-4">
        <Heading text={data.title} />
        {str(data.description) && <Muted>{str(data.description)}</Muted>}
      </div>
      <div className="space-y-3">
        {FORM_FIELDS.map(([key, fallback, optionsKey]) => {
          const field = (data[key] ?? {}) as Values;
          if (field.hidden === true) return null;
          const optional = field.required === false;
          return (
            <div key={key} className="rounded-xl border border-site-line px-4 py-3 text-sm">
              <div className="text-site-muted">
                {str(field.label) || fallback}
                {optional && <span className="ml-1 text-xs">(optional)</span>}
              </div>
              {str(field.placeholder) && !optionsKey && <div className="mt-1 text-xs text-site-muted/70">{str(field.placeholder)}</div>}
              {optionsKey && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {lines(data[optionsKey]).map((option) => (
                    <span key={option} className="rounded-full bg-site-card px-2.5 py-0.5 text-xs">
                      {option}
                    </span>
                  ))}
                </div>
              )}
            </div>
          );
        })}
        <label className="flex items-start gap-2 text-xs text-site-muted">
          <input type="checkbox" readOnly checked={data.consentChecked !== false} className="mt-0.5" />
          <span className="whitespace-pre-line">{str(data.consentText).replace(/\[([^\]]+)\]\([^)]+\)/g, "$1") || "Stay updated with Zuse!…"}</span>
        </label>
        <span className="inline-flex rounded-full bg-site-brand px-5 py-2.5 text-sm font-medium text-white">{str(data.submitLabel) || "Submit"}</span>
        {str(data.successPath) && <p className="text-xs text-site-muted">After sending: {str(data.successPath)}</p>}
      </div>
    </Container>
  </Section>
);

const SubscribeForm: Renderer = ({ data }) => (
  <Section className="bg-[#e9f2ff]">
    <Container className="grid items-center gap-6 @3xl:grid-cols-2">
      <div className="space-y-1">
        <h2 className="text-2xl font-medium tracking-tight">{str(data.title) || "Subscribe to Zuse Digital Blog"}</h2>
        {str(data.description) && <Muted>{str(data.description)}</Muted>}
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm text-site-muted">{str(data.namePlaceholder) || "Full name"}</span>
        <span className="flex-1 rounded-lg bg-white px-4 py-2.5 text-sm text-site-muted">{str(data.emailPlaceholder) || "name@company.com.au"}</span>
        <span className="rounded-lg border border-site-brand/30 bg-white px-4 py-2.5 text-sm font-medium text-site-brand">{str(data.buttonLabel) || "Subscribe"}</span>
      </div>
    </Container>
  </Section>
);

const Profile: Renderer = ({ data }) => (
  <Section>
    <Container className="grid gap-10 @3xl:grid-cols-[2fr_3fr]">
      <Media value={data.image} className="aspect-[4/5] w-full rounded-2xl" />
      <div className="space-y-5">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight @3xl:text-5xl">{str(data.name)}</h1>
          <div className="mt-1 text-site-muted">{str(data.role)}</div>
        </div>
        {str(data.lead) && <Muted>{str(data.lead)}</Muted>}
        <div className="space-y-4">
          {list(data.blocks).map((block, index) => (
            <div key={str(block.__key) || index}>
              <div className="font-semibold">{str(block.title)}</div>
              <p className="text-sm text-site-ink-soft">{str(block.description)}</p>
            </div>
          ))}
        </div>
      </div>
    </Container>
  </Section>
);

export const SECTION_RENDERERS: Record<string, Renderer> = {
  "sections.hero": Hero,
  "sections.logo-strip": LogoStrip,
  "sections.badge-grid": BadgeGrid,
  "sections.manifesto": Manifesto,
  "sections.services-grid": ServicesGrid,
  "sections.featured-work": FeaturedWork,
  "sections.process-stages": ProcessStages,
  "sections.industries": Industries,
  "sections.testimonials": Testimonials,
  "sections.blog-feed": BlogFeed,
  "sections.page-intro": PageIntro,
  "sections.service-offerings": ServiceOfferings,
  "sections.process-steps": ProcessSteps,
  "sections.bullet-grid": BulletGrid,
  "sections.bullet-groups": BulletGroups,
  "sections.case-study-cards": CaseStudyCards,
  "sections.rich-text": RichText,
  "sections.faq": Faq,
  "sections.awards-list": AwardsList,
  "sections.work-grid": WorkGrid,
  "sections.contact-form": ContactForm,
  "sections.subscribe-form": SubscribeForm,
  "sections.profile": Profile,
  "sections.callout": Callout,
  "sections.author-card": AuthorCard,
  "sections.testimonial-slider": TestimonialSlider,
  "sections.photo-strip": PhotoStrip,
  "sections.quote": QuoteBlock,
};
