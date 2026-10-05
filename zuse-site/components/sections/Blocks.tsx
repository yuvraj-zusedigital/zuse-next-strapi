import { Fragment, type ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Block, BlockInline } from "@/lib/blocks";

/** Optional classes per element, for layouts whose CSS targets elements directly (e.g. legal pages). */
export type BlockClasses = Partial<Record<"p" | "h2" | "h3" | "h4" | "ul" | "ol" | "li" | "a" | "blockquote", string>>;

const LINK_CLASS = "underline underline-offset-4";

/**
 * Inline images inside a sentence, written as Markdown in the text:
 * "Founded by ![Zanyar Outhman](/images/zeyed.webp)Zanyar Outhman".
 * (Strapi rich text has block images only.) Styled like the site's inline portraits.
 */
function TextWithImages({ text }: { text: string }) {
  const parts = text.split(/(!\[[^\]]*\]\([^)\s]+\))/g);
  if (parts.length === 1) return <>{text}</>;
  return (
    <>
      {parts.map((part, index) => {
        const image = /^!\[([^\]]*)\]\(([^)\s]+)\)$/.exec(part);
        return image ? (
          <Image
            key={index}
            src={image[2]}
            alt={image[1]}
            width={34}
            height={34}
            className="zuse-manifesto-img zuse-manifesto-img-1 manifesto-word"
          />
        ) : (
          <Fragment key={index}>{part}</Fragment>
        );
      })}
    </>
  );
}
const isInternal = (url: string) => url.startsWith("/") && !url.startsWith("//");

function Inline({ nodes, classes }: { nodes: BlockInline[]; classes: BlockClasses }) {
  return (
    <>
      {nodes.map((node, index) => {
        if (node.type === "link") {
          const children = <Inline nodes={node.children} classes={classes} />;
          const className = classes.a ?? LINK_CLASS;
          return isInternal(node.url) ? (
            <Link key={index} href={node.url} className={className}>
              {children}
            </Link>
          ) : !/^https?:/i.test(node.url) ? (
            <a key={index} href={node.url} className={className}>
              {children}
            </a>
          ) : (
            <a key={index} href={node.url} className={className} target="_blank" rel="noopener noreferrer">
              {children}
            </a>
          );
        }
        let content: ReactNode = node.text.split("\n").map((part, i) => (
          <Fragment key={i}>
            {i > 0 && <br />}
            <TextWithImages text={part} />
          </Fragment>
        ));
        if (node.code) content = <code>{content}</code>;
        if (node.strikethrough) content = <s>{content}</s>;
        if (node.underline) content = <u>{content}</u>;
        if (node.italic) content = <em>{content}</em>;
        if (node.bold) content = <strong>{content}</strong>;
        return <Fragment key={index}>{content}</Fragment>;
      })}
    </>
  );
}

function List({ block, classes }: { block: Extract<Block, { type: "list" }>; classes: BlockClasses }) {
  const Tag = block.format === "ordered" ? "ol" : "ul";
  return (
    <Tag className={classes[Tag]}>
      {block.children.map((child, index) =>
        child.type === "list" ? (
          <li key={index} className={classes.li}>
            <List block={child} classes={classes} />
          </li>
        ) : child.type === "list-item" ? (
          <li key={index} className={classes.li}>
            <Inline nodes={child.children} classes={classes} />
          </li>
        ) : null,
      )}
    </Tag>
  );
}

/** Renders Strapi "blocks" rich text as plain HTML elements. */
export function Blocks({ value, classes = {} }: { value: Block[] | null | undefined; classes?: BlockClasses }) {
  if (!value?.length) return null;
  return (
    <>
      {value.map((block, index) => {
        switch (block.type) {
          case "heading": {
            const Tag = `h${Math.min(Math.max(block.level, 2), 4)}` as "h2" | "h3" | "h4";
            return (
              <Tag key={index} className={classes[Tag]}>
                <Inline nodes={block.children} classes={classes} />
              </Tag>
            );
          }
          case "list":
            return <List key={index} block={block} classes={classes} />;
          case "quote":
            return (
              <blockquote key={index} className={classes.blockquote}>
                <Inline nodes={block.children} classes={classes} />
              </blockquote>
            );
          case "code":
            return (
              <pre key={index}>
                <code>{block.children.map((child) => child.text).join("")}</code>
              </pre>
            );
          case "image":
            return (
              // eslint-disable-next-line @next/next/no-img-element -- CMS rich-text image of any size/host
              <img key={index} src={block.image.url} alt={block.image.alternativeText ?? ""} width={block.image.width} height={block.image.height} />
            );
          default:
            return (
              <p key={index} className={classes.p}>
                <Inline nodes={block.children} classes={classes} />
              </p>
            );
        }
      })}
    </>
  );
}
