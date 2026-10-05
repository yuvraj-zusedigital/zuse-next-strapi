import { Fragment } from "react";
import Link from "next/link";
import Image from "next/image";
import { Button, GradientText } from "@/components/ui";
import type { LinkColumn, SiteLink, SiteSettings } from "@/lib/site-settings";

// Header & footer content comes from Strapi (lib/site-settings.ts), with the
// original links as defaults.

// Prefer native anchors for these so static-export soft navigation cannot drop them.
const NATIVE_ANCHOR_PATHS = new Set(["/work", "/blog"]);

function FooterLink({ link }: { link: SiteLink }) {
  const className = "zuse-footer-link zuse-footer-text";
  const external = /^[a-z]+:/i.test(link.href) || link.href.startsWith("#");

  if (link.newTab || external || NATIVE_ANCHOR_PATHS.has(link.href)) {
    return (
      <a
        href={link.href}
        className={className}
        {...(link.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      >
        {link.label}
      </a>
    );
  }

  return (
    <Link href={link.href} className={className}>
      {link.label}
    </Link>
  );
}

function FooterColumn({ column, keyPrefix = "" }: { column: LinkColumn; keyPrefix?: string }) {
  return (
    <>
      <h3 className="zuse-footer-heading">{column.title}</h3>
      <ul className="zuse-footer-list">
        {column.links.map((link, idx) => (
          <li key={`${keyPrefix}${link.href}-${idx}`}>
            <FooterLink link={link} />
          </li>
        ))}
      </ul>
    </>
  );
}

/** Text with line breaks kept; in headings, *asterisks* mark gradient words (site convention). */
function RichText({ text, gradient = false }: { text: string; gradient?: boolean }) {
  return (
    <>
      {text.split("\n").map((line, lineIndex) => (
        <Fragment key={lineIndex}>
          {lineIndex > 0 && <br />}
          {gradient
            ? line.split(/(\*[^*]+\*)/g).map((part, index) =>
                /^\*[^*]+\*$/.test(part) ? <GradientText key={index}>{part.slice(1, -1)}</GradientText> : <Fragment key={index}>{part}</Fragment>,
              )
            : line}
        </Fragment>
      ))}
    </>
  );
}

function FooterLegal({ className, copyright, links }: { className: string; copyright: string | null; links: SiteLink[] }) {
  if (!copyright && !links.length) return null;
  return (
    <div className={className}>
      <p>
        {copyright}
        {links.length > 0 && (
          <>
            {copyright && (
              <span className="zuse-footer-legal-separator" aria-hidden="true">
                {" | "}
              </span>
            )}
            <span className="zuse-footer-legal-links">
              {links.map((link, index) => (
                <Fragment key={`${link.href}-${index}`}>
                  {index > 0 && <span aria-hidden="true"> | </span>}
                  <Link href={link.href} {...(link.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {})}>
                    {link.label}
                  </Link>
                </Fragment>
              ))}
            </span>
          </>
        )}
      </p>
    </div>
  );
}

function Socials({ settings, keyPrefix = "" }: { settings: SiteSettings; keyPrefix?: string }) {
  return (
    <div className="zuse-footer-socials">
      {settings.socialLinks.map((item) => (
        <a
          key={`${keyPrefix}${item.name}`}
          href={item.href}
          rel="noopener noreferrer"
          target={item.href.startsWith("http") ? "_blank" : undefined}
          aria-label={item.name}
        >
          <Image src={item.icon} alt={item.name} width={18} height={18} unoptimized={item.icon.startsWith("http")} />
        </a>
      ))}
    </div>
  );
}

export default function Footer({ settings }: { settings: SiteSettings }) {
  const { logo, footerHeading, footerCta, footerDescription, officeTitle, officeAddress, footerColumns, legalLinks, copyright } = settings;
  const { showCallToAction, showDescription, showOffice } = settings;
  const showSocials = settings.socialLinks.length > 0;
  const logoSrc = logo ?? "/images/logo_new.svg";
  // Mobile: columns alternate between the two sub-columns (Company & Projects | Services & office).
  const mobileLeft = footerColumns.filter((_, index) => index % 2 === 0);
  const mobileRight = footerColumns.filter((_, index) => index % 2 === 1);

  return (
    <footer className="zuse-footer">
      <div className="zuse-footer-inner">
        {/* ── Top CTA Row ──────────────────────────────────────── */}
        {showCallToAction && (
          <div className="zuse-footer-cta-row">
            <h2 className="zuse-footer-cta-title">
              <RichText text={footerHeading} gradient />
            </h2>

            {footerCta && (
              <Button
                href={footerCta.href}
                target={footerCta.newTab ? "_blank" : undefined}
                className="zuse-footer-cta-btn"
                arrow
              >
                {footerCta.label}
              </Button>
            )}
          </div>
        )}

        {/* ── Navigation Columns ───────────────────────────────── */}
        <div className="zuse-footer-nav">
          {/* Desktop Navigation (lg+) */}
          <div className="zuse-footer-desktop">
            <div className="zuse-footer-brand">
              <Link href="/" aria-label="Zuse Digital Homepage">
                <Image
                  src={logoSrc}
                  alt="Zuse Digital"
                  width={140}
                  height={44}
                  className="zuse-footer-logo"
                  unoptimized={Boolean(logo)}
                />
              </Link>
              {showDescription && <p className="zuse-footer-text">{footerDescription}</p>}
            </div>

            <div className="zuse-footer-cols">
              {/* Office & Socials */}
              <div className="zuse-footer-col is-office">
                {showOffice && (
                  <div>
                    <h3 className="zuse-footer-heading">{officeTitle}</h3>
                    <p className="zuse-footer-text">
                      <RichText text={officeAddress} />
                    </p>
                  </div>
                )}
                {showSocials && (
                  <div className="zuse-footer-social-block">
                    <h3 className="zuse-footer-heading">Follow Us</h3>
                    <Socials settings={settings} />
                  </div>
                )}
              </div>

              {footerColumns.map((column, index) => (
                <div key={`${column.title}-${index}`} className={`zuse-footer-col${index === 0 ? " zuse-footer-company" : ""}`}>
                  <FooterColumn column={column} />
                  {/* The legal line sits under the first column on desktop. */}
                  {index === 0 && <FooterLegal className="zuse-footer-legal  zuse-footer-legal-desktop" copyright={copyright} links={legalLinks} />}
                </div>
              ))}
            </div>
          </div>
          {/* Mobile Navigation (<lg) */}
          <div className="zuse-footer-mobile">
            <div className="zuse-footer-mobile-brand">
              <Link href="/" aria-label="Zuse Digital Homepage">
                <Image
                  src={logoSrc}
                  alt="Zuse Digital"
                  width={120}
                  height={34}
                  className="zuse-footer-mobile-logo"
                  unoptimized={Boolean(logo)}
                />
              </Link>
              {showDescription && <p className="zuse-footer-text">{footerDescription}</p>}
            </div>

            <div className="zuse-footer-mobile-grid">
              <div className="zuse-footer-mobile-col">
                {mobileLeft.map((column, index) => (
                  <div key={`mob-left-${column.title}-${index}`}>
                    <FooterColumn column={column} keyPrefix="mob-" />
                  </div>
                ))}
              </div>

              <div className="zuse-footer-mobile-col">
                {mobileRight.map((column, index) => (
                  <div key={`mob-right-${column.title}-${index}`}>
                    <FooterColumn column={column} keyPrefix="mob-" />
                  </div>
                ))}
                <div>
                  {showOffice && (
                    <>
                      <h3 className="zuse-footer-heading">{officeTitle}</h3>
                      <p className="zuse-footer-text mb-8 md:mb-6">
                        <RichText text={officeAddress} />
                      </p>
                    </>
                  )}
                  {showSocials && (
                    <>
                      <h3 className="zuse-footer-heading">Follow Us</h3>
                      <Socials settings={settings} keyPrefix="mob-soc-" />
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>

          <FooterLegal className="zuse-footer-legal zuse-footer-legal-mobile" copyright={copyright} links={legalLinks} />
        </div>
      </div>

      {/* ── Ambient Wave Background ────────────────────────────── */}
      <div className="zuse-footer-wave" aria-hidden="true">
        <Image
          src="/images/footer-image.webp"
          alt="Zuse Digital"
          width={1920}
          height={600}
          className="zuse-footer-wave-img"
        />
      </div>
    </footer>
  );
}
