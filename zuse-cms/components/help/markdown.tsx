import { Fragment, type ReactNode } from "react";
import { cn } from "@/lib/utils";

/**
 * Small Markdown renderer for the help guides: # headings, paragraphs,
 * "- " and "1. " lists, **bold**, *italic*, `code` and [links](url).
 */
function inline(text: string): ReactNode[] {
  const parts = text.split(/(\*\*[^*]+\*\*|`[^`]+`|\[[^\]]+\]\([^)]+\)|\*[^*\s][^*]*\*)/g);
  return parts.map((part, index) => {
    if (/^\*\*[^*]+\*\*$/.test(part)) {
      return (
        <strong key={index} className="font-semibold text-foreground">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (/^`[^`]+`$/.test(part)) {
      return (
        <code key={index} className="rounded bg-muted px-1 py-0.5 font-mono text-[0.85em]">
          {part.slice(1, -1)}
        </code>
      );
    }
    const link = /^\[([^\]]+)\]\(([^)]+)\)$/.exec(part);
    if (link) {
      const external = /^https?:/.test(link[2]);
      return (
        <a
          key={index}
          href={link[2]}
          className="text-primary underline underline-offset-2"
          {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        >
          {link[1]}
        </a>
      );
    }
    if (/^\*[^*\s][^*]*\*$/.test(part)) return <em key={index}>{part.slice(1, -1)}</em>;
    return <Fragment key={index}>{part}</Fragment>;
  });
}

const Heading = ({ level, text }: { level: number; text: string }) =>
  level === 1 ? (
    <h2 className="text-lg font-semibold text-foreground">{inline(text)}</h2>
  ) : (
    <h3 className="pt-2 text-sm font-semibold text-foreground">{inline(text)}</h3>
  );

export function Markdown({ source, className }: { source: string; className?: string }) {
  const blocks = source.replace(/\r/g, "").trim().split(/\n\s*\n/);
  return (
    <div className={cn("space-y-3 text-sm leading-relaxed text-muted-foreground", className)}>
      {blocks.map((block, index) => {
        const lines = block.split("\n");
        const heading = /^(#{1,3})\s+(.*)$/.exec(lines[0]);
        if (heading && lines.length === 1) return <Heading key={index} level={heading[1].length} text={heading[2]} />;
        if (lines.every((line) => /^[-*]\s+/.test(line))) {
          return (
            <ul key={index} className="list-disc space-y-1.5 pl-5 marker:text-primary/60">
              {lines.map((line, i) => (
                <li key={i}>{inline(line.replace(/^[-*]\s+/, ""))}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((line) => /^\d+\.\s+/.test(line))) {
          return (
            <ol key={index} className="list-decimal space-y-1.5 pl-5 marker:font-semibold marker:text-primary">
              {lines.map((line, i) => (
                <li key={i}>{inline(line.replace(/^\d+\.\s+/, ""))}</li>
              ))}
            </ol>
          );
        }
        if (heading) {
          // A heading followed by text in the same block.
          return (
            <Fragment key={index}>
              <Heading level={heading[1].length} text={heading[2]} />
              <p>{inline(lines.slice(1).join(" "))}</p>
            </Fragment>
          );
        }
        return <p key={index}>{inline(lines.join(" "))}</p>;
      })}
    </div>
  );
}
