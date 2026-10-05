import { Fragment, type ReactNode } from "react";
import Link from "next/link";
import { GradientText, type GradientTextProps } from "@/components/ui";

/**
 * Plain-text CMS fields with the editor conventions (docs/page-builder.md):
 * a line break renders as <br />, **text** as <strong>, and in titles
 * *text* as gradient text.
 */
function lines(text: string, renderLine: (line: string) => ReactNode) {
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 && <br />}
      {renderLine(line)}
    </Fragment>
  ));
}

/** Text with **bold** and line breaks. */
export function InlineText({ text }: { text: string | null | undefined }) {
  if (!text) return null;
  return (
    <>
      {lines(text, (line) =>
        line.split(/(\*\*[^*]+\*\*)/g).map((part, index) =>
          /^\*\*[^*]+\*\*$/.test(part) ? <strong key={index}>{part.slice(2, -2)}</strong> : <Fragment key={index}>{part}</Fragment>,
        ),
      )}
    </>
  );
}

/** Text with **bold**, [links](/path) and line breaks (e.g. a form's consent line). */
export function LinkedText({ text }: { text: string | null | undefined }) {
  if (!text) return null;
  return (
    <>
      {lines(text, (line) =>
        line.split(/(\*\*[^*]+\*\*|\[[^\]]+\]\([^)\s]+\))/g).map((part, index) => {
          if (/^\*\*[^*]+\*\*$/.test(part)) return <strong key={index}>{part.slice(2, -2)}</strong>;
          const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
          if (link) {
            return /^https?:/.test(link[2]) ? (
              <a key={index} href={link[2]} target="_blank" rel="noopener noreferrer">
                {link[1]}
              </a>
            ) : (
              <Link key={index} href={link[2]}>
                {link[1]}
              </Link>
            );
          }
          return <Fragment key={index}>{part}</Fragment>;
        }),
      )}
    </>
  );
}

/**
 * A title with *gradient* words and line breaks. Without asterisks the whole
 * title is gradient (as on most page headings).
 */
export function GradientTitle({ text, ...gradient }: { text: string | null | undefined } & Omit<GradientTextProps, "children">) {
  if (!text) return null;
  if (!text.includes("*")) return <GradientText {...gradient}>{text}</GradientText>;
  return (
    <>
      {lines(text, (line) =>
        line.split(/(\*[^*]+\*)/g).map((part, index) =>
          /^\*[^*]+\*$/.test(part) ? (
            <GradientText key={index} {...gradient}>
              {part.slice(1, -1)}
            </GradientText>
          ) : (
            <Fragment key={index}>{part}</Fragment>
          ),
        ),
      )}
    </>
  );
}
