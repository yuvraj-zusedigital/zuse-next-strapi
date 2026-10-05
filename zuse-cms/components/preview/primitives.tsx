"use client";

import { Fragment } from "react";
import { ArrowRight, ImageIcon } from "lucide-react";
import { useMediaBase, useSiteBase } from "@/components/media/media-base";
import type { StrapiBlock, StrapiInline } from "@/lib/blocks";
import { kindOf, mediaUrl } from "@/lib/media";
import type { MediaFile } from "@/lib/types";
import { cn } from "@/lib/utils";

/** Values as the form holds them (see lib/fields.ts). */
export type Values = Record<string, unknown>;

export const str = (value: unknown) => (typeof value === "string" ? value : value == null ? "" : String(value));
export const list = (value: unknown) => (Array.isArray(value) ? (value as Values[]) : []);
export const media = (value: unknown) => (Array.isArray(value) ? (value as MediaFile[]) : []);
export const lines = (value: unknown) =>
  str(value)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);

/**
 * Site title conventions (docs/page-builder.md): *asterisks* mark gradient
 * text and line breaks are kept.
 */
export function Rich({ text, className }: { text: unknown; className?: string }) {
  const value = str(text);
  if (!value) return null;
  return (
    <span className={className}>
      {value.split("\n").map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          {line.split(/(\*[^*]+\*)/g).map((part, index) =>
            /^\*[^*]+\*$/.test(part) ? (
              <span key={index} className="site-gradient">
                {part.slice(1, -1)}
              </span>
            ) : (
              <Fragment key={index}>{part}</Fragment>
            ),
          )}
        </Fragment>
      ))}
    </span>
  );
}

/** First file of a media value as an <img>/<video>, or a placeholder. */
export function Media({ value, className, placeholder = true }: { value: unknown; className?: string; placeholder?: boolean }) {
  const base = useMediaBase();
  const file = media(value)[0];
  if (!file) {
    return placeholder ? (
      <div className={cn("flex items-center justify-center bg-site-card text-site-muted", className)}>
        <ImageIcon className="size-6" />
      </div>
    ) : null;
  }
  const src = mediaUrl(file.url, base);
  if (kindOf(file.mime) === "video") return <video src={src} muted loop autoPlay playsInline className={cn("object-cover", className)} />;
  // eslint-disable-next-line @next/next/no-img-element -- CMS preview of CDN/local media
  return <img src={src} alt={file.alternativeText} className={cn("object-cover", className)} />;
}

export function SiteButton({ link, fallbackVariant = "primary" }: { link: unknown; fallbackVariant?: "primary" | "secondary" }) {
  const value = link as Values | null;
  if (!value || !str(value.label) || value.hidden === true) return null;
  const variant = str(value.variant) || fallbackVariant;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-sm font-medium",
        variant === "secondary" ? "border-site-brand-2 text-site-brand-2" : "border-site-brand bg-site-brand text-white",
      )}
      title={str(value.href)}
    >
      {str(value.label)}
      {variant !== "secondary" && <ArrowRight className="size-4" />}
    </span>
  );
}

export function Container({ children, className }: { children: React.ReactNode; className?: string }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 @3xl:px-10", className)}>{children}</div>;
}

export function Section({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("py-14 @3xl:py-20", className)}>{children}</section>;
}

export function Heading({ text, className, as: Tag = "h2" }: { text: unknown; className?: string; as?: "h1" | "h2" | "h3" }) {
  if (!str(text)) return null;
  return (
    <Tag className={cn("text-3xl leading-[1.05] font-semibold tracking-tight @3xl:text-5xl", className)}>
      <Rich text={text} />
    </Tag>
  );
}

export function Muted({ children, className }: { children: React.ReactNode; className?: string }) {
  return <p className={cn("text-base leading-relaxed text-site-ink-soft @3xl:text-lg", className)}>{children}</p>;
}

/** A note where the real site fills in data the CMS preview doesn't load. */
export function Placeholder({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("rounded-xl border border-dashed border-site-line bg-site-card/60 p-6 text-center text-sm text-site-muted", className)}>
      {children}
    </div>
  );
}

// ── Strapi blocks ──

/**
 * Inline portraits written inside a sentence, "Founded by ![Zanyar](/images/zeyed.webp)Zanyar"
 * (docs/page-builder.md), shown as the site's small round image.
 */
function TextWithImages({ text }: { text: string }) {
  const site = useSiteBase();
  const strapi = useMediaBase();
  const parts = text.split(/(!\[[^\]]*\]\([^)\s]+\))/g);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, index) => {
        const image = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(part);
        if (!image) return <Fragment key={index}>{part}</Fragment>;
        const src = /^https?:\/\//.test(image[2]) ? image[2] : `${image[2].startsWith("/uploads/") ? strapi : site}${image[2]}`;
        return (
          // eslint-disable-next-line @next/next/no-img-element -- preview of a site image
          <img key={index} src={src} alt={image[1]} className="mx-1 inline-block size-[1.4em] rounded-full object-cover align-middle" />
        );
      })}
    </>
  );
}

function Inline({ nodes }: { nodes: (StrapiInline | StrapiBlock)[] | undefined }) {
  return (
    <>
      {(nodes ?? []).map((node, index) => {
        const inline = node as StrapiInline;
        if (inline.type === "link") {
          return (
            <a key={index} href={inline.url} className="text-site-brand-2 underline" onClick={(event) => event.preventDefault()}>
              <Inline nodes={inline.children} />
            </a>
          );
        }
        if (inline.type !== "text") return null;
        let content: React.ReactNode = inline.text.split("\n").map((part, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            <TextWithImages text={part} />
          </Fragment>
        ));
        if (inline.code) content = <code className="rounded bg-site-card px-1 font-mono text-[0.9em]">{content}</code>;
        if (inline.bold) content = <strong>{content}</strong>;
        if (inline.italic) content = <em>{content}</em>;
        if (inline.underline) content = <u>{content}</u>;
        if (inline.strikethrough) content = <s>{content}</s>;
        return <Fragment key={index}>{content}</Fragment>;
      })}
    </>
  );
}

function BlockList({ block }: { block: StrapiBlock }) {
  const Tag = block.format === "ordered" ? "ol" : "ul";
  return (
    <Tag className={cn("my-3 space-y-1 pl-6", block.format === "ordered" ? "list-decimal" : "list-disc")}>
      {((block.children ?? []) as StrapiBlock[]).map((child, index) =>
        child.type === "list" ? (
          <li key={index} className="list-none">
            <BlockList block={child} />
          </li>
        ) : (
          <li key={index}>
            <Inline nodes={child.children} />
          </li>
        ),
      )}
    </Tag>
  );
}

export function Blocks({ value, className }: { value: unknown; className?: string }) {
  const blocks = Array.isArray(value) ? (value as StrapiBlock[]) : [];
  if (!blocks.length) return null;
  return (
    <div className={cn("text-base leading-relaxed text-site-ink-soft", className)}>
      {blocks.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const size = { 1: "text-3xl", 2: "text-2xl", 3: "text-xl" }[block.level ?? 2] ?? "text-lg";
            return (
              <h3 key={index} className={cn("mt-8 mb-3 font-semibold tracking-tight text-site-ink", size)}>
                <Inline nodes={block.children} />
              </h3>
            );
          }
          case "list":
            return <BlockList key={index} block={block} />;
          case "quote":
            return (
              <blockquote key={index} className="my-4 border-l-2 border-site-sky pl-4 italic">
                <Inline nodes={block.children} />
              </blockquote>
            );
          case "code":
            return (
              <pre key={index} className="my-4 overflow-x-auto rounded-lg bg-site-card p-4 font-mono text-sm">
                <Inline nodes={block.children} />
              </pre>
            );
          case "paragraph":
            return (
              <p key={index} className="my-3">
                <Inline nodes={block.children} />
              </p>
            );
          default:
            return (
              <Placeholder key={index} className="my-3">
                {block.type} block
              </Placeholder>
            );
        }
      })}
    </div>
  );
}
