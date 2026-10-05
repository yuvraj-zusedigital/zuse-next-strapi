"use client";

import { createContext, useContext } from "react";
import { ChevronDown } from "lucide-react";
import type { SiteChrome } from "@/lib/types";
import { Container, Heading, lines, Media, SiteButton } from "./primitives";

const ChromeContext = createContext<SiteChrome | null>(null);

/** The live header & footer (GET /api/cms/site-chrome), shown around page previews. */
export const SiteChromeProvider = ChromeContext.Provider;
export const useSiteChrome = () => useContext(ChromeContext);

/** The site header, as a bar at the top of the preview (it stays in view while scrolling). */
export function PreviewHeader({ chrome }: { chrome: SiteChrome }) {
  return (
    <div className="sticky top-0 z-20 px-3 pt-3 @3xl:px-5">
      <header className="flex items-center gap-6 rounded-xl bg-white/95 px-4 py-3 shadow-[0_6px_24px_-12px_rgb(1_11_57/0.25)] ring-1 ring-site-line backdrop-blur @3xl:px-5">
        <Media value={chrome.logo ? [chrome.logo] : []} className="h-6 w-auto object-contain" placeholder={false} />
        {!chrome.logo && <span className="font-semibold">Zuse Digital</span>}
        <nav className="hidden flex-1 items-center justify-center gap-6 text-sm text-site-ink-soft @3xl:flex">
          {chrome.hasServices && (
            <span className="inline-flex items-center gap-1">
              {chrome.servicesLabel || "Services"} <ChevronDown className="size-3.5" />
            </span>
          )}
          {chrome.navLinks.map((link) => (
            <span key={`${link.label}-${link.href}`} title={link.href}>
              {link.label}
            </span>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-3 @3xl:ml-0">
          {chrome.headerCta && (
            <span className="rounded-lg bg-site-brand px-4 py-2 text-sm font-medium text-white" title={chrome.headerCta.href}>
              {chrome.headerCta.label}
            </span>
          )}
          <span className="flex flex-col gap-1 @3xl:hidden" aria-hidden="true">
            <span className="h-0.5 w-5 bg-site-ink" />
            <span className="h-0.5 w-5 bg-site-ink" />
          </span>
        </div>
      </header>
    </div>
  );
}

/** The site footer: call-to-action band, company info, link columns and legal line. */
export function PreviewFooter({ chrome }: { chrome: SiteChrome }) {
  return (
    <footer className="mt-10">
      {(chrome.footerHeading || chrome.footerCta) && (
        <div className="bg-gradient-to-b from-[#dce8fb] to-white py-16 @3xl:py-20">
          <Container className="flex flex-col items-start justify-between gap-8 @3xl:flex-row @3xl:items-center">
            <Heading text={chrome.footerHeading} className="font-normal @3xl:text-5xl" />
            <SiteButton link={chrome.footerCta} />
          </Container>
        </div>
      )}
      <Container className="grid gap-10 py-14 @3xl:grid-cols-[1.2fr_1fr_2.4fr]">
        <div className="space-y-4">
          <Media value={chrome.logo ? [chrome.logo] : []} className="h-9 w-auto object-contain" placeholder={false} />
          {chrome.footerDescription && <p className="text-sm leading-relaxed text-site-ink-soft">{chrome.footerDescription}</p>}
        </div>
        <div className="space-y-6 text-sm">
          {(chrome.officeTitle || chrome.officeAddress) && (
            <div className="space-y-2">
              {chrome.officeTitle && <div className="text-[11px] tracking-wide text-site-muted uppercase">{chrome.officeTitle}</div>}
              <div className="leading-relaxed text-site-ink">
                {lines(chrome.officeAddress).map((line) => (
                  <div key={line}>{line}</div>
                ))}
              </div>
            </div>
          )}
          {chrome.socialLinks.length > 0 && (
            <div className="space-y-2">
              <div className="text-[11px] tracking-wide text-site-muted uppercase">Follow us</div>
              <div className="flex gap-3">
                {chrome.socialLinks.map((social) => (
                  <span key={`${social.name}-${social.href}`} title={social.name}>
                    <Media value={social.icon ? [social.icon] : []} className="size-4 object-contain" placeholder={false} />
                    {!social.icon && <span className="text-xs">{social.name}</span>}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
        <div className="grid grid-cols-2 gap-8 @3xl:grid-cols-3">
          {chrome.footerColumns.map((column) => (
            <div key={column.title} className="space-y-3 text-sm">
              <div className="text-[11px] tracking-wide text-site-muted uppercase">{column.title}</div>
              <ul className="space-y-2.5 text-site-ink">
                {column.links.map((link) => (
                  <li key={`${link.label}-${link.href}`} title={link.href}>
                    {link.label}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Container>
      <Container className="border-t border-site-line py-6 text-sm text-site-ink-soft">
        {chrome.copyright}
        {chrome.legalLinks.map((link, index) => (
          <span key={link.label}>
            {chrome.copyright || index > 0 ? " | " : ""}
            {link.label}
          </span>
        ))}
      </Container>
    </footer>
  );
}
