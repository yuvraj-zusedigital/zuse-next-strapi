"use client";

import { CDN_URL } from "@/lib/config/cdn";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Fragment, useState, useEffect, useRef } from "react";
import { PhoneIcon } from "./icons";
import { Button } from "@/components/ui";
import type { SiteLink, SiteSettings } from "@/lib/site-settings";

/** Props for links that may open in a new tab. */
const linkTarget = (link: SiteLink) => (link.newTab ? { target: "_blank", rel: "noopener noreferrer" } : {});

/** Keeps editor line breaks ("Framework-agnostic agents that\nstreamline operations."). */
function Lines({ text }: { text: string }) {
  return (
    <>
      {text.split("\n").map((line, index) => (
        <Fragment key={index}>
          {index > 0 && <br />}
          {line}
        </Fragment>
      ))}
    </>
  );
}

// Header & footer content comes from Strapi (lib/site-settings.ts), with the
// original links as defaults.
export default function Header({ settings }: { settings: SiteSettings }) {
  const { navLinks, servicesLabel, serviceLinks, headerCta, socialLinks, logo } = settings;
  const firstPreview = serviceLinks.find((item) => item.image)?.image ?? "";
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isServicesMenuOpen, setIsServicesMenuOpen] = useState(false);
  const [isMobileServicesOpen, setIsMobileServicesOpen] = useState(false);
  const [megaPreview, setMegaPreview] = useState(firstPreview);
  const [navBlur, setNavBlur] = useState(false);
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const handleOpenServices = () => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setIsServicesMenuOpen(true);
  };

  const handleCloseServices = (delay = 180) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
    }
    closeTimerRef.current = setTimeout(() => {
      setIsServicesMenuOpen(false);
      setMegaPreview(firstPreview);
      closeTimerRef.current = null;
    }, delay);
  };

  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current);
      }
    };
  }, []);

  // Add backdrop blur after 300ms on mount, and on any scroll.
  // Avoids Tailwind JIT issue with backdrop-blur-[var(--css-var)] arbitrary brackets.
  useEffect(() => {
    const enableBlur = () => setNavBlur(true);
    const timer = setTimeout(enableBlur, 2500);
    window.addEventListener("scroll", enableBlur, { once: true, passive: true });
    return () => {
      clearTimeout(timer);
      window.removeEventListener("scroll", enableBlur);
    };
  }, []);

  // home-v3: lock scroll; reset services pane when menu closes
  useEffect(() => {
    document.body.style.overflow = isMobileMenuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isMobileMenuOpen]);

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
    setIsMobileServicesOpen(false);
  };

  const toggleMobileMenu = () => {
    if (isMobileMenuOpen) setIsMobileServicesOpen(false);
    setIsMobileMenuOpen((open) => !open);
  };

  const isLinkActive = (href: string) =>
    pathname === href || pathname.startsWith(`${href}/`);

  const headerStateClasses = [
    isMobileMenuOpen ? "menu-open" : "",
    isServicesMenuOpen ? "desk-mega-open" : ""
  ].filter(Boolean).join(" ");

  return (
    <>
      <button
        type="button"
        className={`zuse-desk-mega-scrim ${isServicesMenuOpen ? 'is-open' : ''}`}
        aria-label="Close services menu"
        tabIndex={-1}
        onClick={() => setIsServicesMenuOpen(false)}
      ></button>

      <header
        className={`relative w-full zuse-header ${headerStateClasses}`}
        onMouseLeave={() => handleCloseServices(150)}
      >
        <div
          className="zuse-nav-shell"
          onMouseLeave={() => handleCloseServices(150)}
        >
          <nav className={`zuse-nav-bar max-lg:shadow-[0_8px_32px_rgba(1,11,57,0.07)] ${navBlur ? "nav-blur-active" : ""}`}>
            <a href="/" className="zuse-nav-logo" onClick={closeMobileMenu}>
              <Image
                src={logo ?? "/images/logo_new.svg"}
                alt="Zuse Digital"
                width={160}
                height={40}
                className="zuse-nav-logo-img"
                priority
                unoptimized={Boolean(logo)}
              />
            </a>

            <div className="zuse-nav-links-wrapper">
              {serviceLinks.length > 0 && (
              <div
                className="zuse-serv-nav"
                onMouseEnter={handleOpenServices}
                onMouseLeave={() => handleCloseServices(180)}
              >
                <button
                  type="button"
                  className="zuse-nav-link zuse-serv-trigger hover:text-ink-900 transition-colors"
                  aria-expanded={isServicesMenuOpen}
                  aria-haspopup="true"
                  onClick={() => setIsServicesMenuOpen((prev) => !prev)}
                >
                  {servicesLabel}
                </button>
              </div>
              )}
              {navLinks.map((link) => {
                const className = `zuse-nav-link hover:text-ink-900 transition-colors${isLinkActive(link.href) ? " is-active" : ""}`;
                const ariaCurrent = isLinkActive(link.href) ? "page" : undefined;

                // Native anchors: static-export soft navigations can drop intermittently.
                return (
                  <a
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    {...linkTarget(link)}
                    className={className}
                    aria-current={ariaCurrent}
                    onMouseEnter={() => handleCloseServices(80)}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>

            <div className="flex items-center">
              {headerCta && (
                <Button
                  href={headerCta.href}
                  target={headerCta.newTab ? "_blank" : undefined}
                  className="zuse-nav-cta !hidden lg:!inline-flex"
                  font="sans"
                  onMouseEnter={() => handleCloseServices(80)}
                >
                  {headerCta.label}
                </Button>
              )}
              <button
                type="button"
                className={`zuse-menu-toggle menu-toggle lg:hidden ml-4 ${isMobileMenuOpen ? 'is-open' : ''}`}
                aria-label={isMobileMenuOpen ? "Close menu" : "Open menu"}
                aria-expanded={isMobileMenuOpen}
                onClick={toggleMobileMenu}
              >
                <span className="zuse-menu-toggle-bar menu-toggle-bar" aria-hidden="true"></span>
              </button>
            </div>
          </nav>

          {serviceLinks.length > 0 && (
          <div
            className={`zuse-serv-dropdown ${isServicesMenuOpen ? 'is-open' : ''}`}
            aria-hidden={!isServicesMenuOpen}
            onMouseEnter={handleOpenServices}
            onMouseLeave={() => handleCloseServices(150)}
          >
            <div className="zuse-serv-dropdown-inner">
              <div className="zuse-serv-dropdown-list">
                {serviceLinks.map((item) => (
                  <a
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    {...linkTarget(item)}
                    className="zuse-serv-dropdown-item"
                    onMouseEnter={() => item.image && setMegaPreview(item.image)}
                    onClick={() => setIsServicesMenuOpen(false)}
                  >
                    <span className="zuse-serv-dropdown-title">{item.label}</span>
                    {item.description && (
                      <span className="zuse-serv-dropdown-desc">
                        <Lines text={item.description} />
                      </span>
                    )}
                  </a>
                ))}
              </div>
              <div className="zuse-serv-dropdown-preview" aria-hidden="true">
                {[...new Set(serviceLinks.map((item) => item.image).filter((src): src is string => Boolean(src)))].map((src) => (
                  <Image
                    key={src}
                    src={src}
                    alt="Zuse Digital Services Preview"
                    width={2400}
                    height={2000}
                    className="object-contain"
                    style={{ display: megaPreview === src ? "block" : "none" }}
                    quality={100}
                    unoptimized
                    priority
                  />
                ))}
              </div>
            </div>
          </div>
          )}
        </div>

        {/* Mobile menu — structure/effect from home-v3 */}
        <div
          id="mobileMenu"
          className={`zuse-mobile-menu lg:hidden ${isMobileMenuOpen ? "is-open" : ""} ${isMobileServicesOpen ? "services-open" : ""}`}
        >
          <div className="zuse-mobile-menu-body">
            <div className="zuse-mobile-menu-links">
              {serviceLinks.length > 0 && (
                <button
                  type="button"
                  className="zuse-mobile-menu-link zuse-mobile-services-trigger"
                  onClick={() => setIsMobileServicesOpen(true)}
                >
                  {servicesLabel}
                </button>
              )}
              {navLinks.map((link) => {
                const className = `zuse-mobile-menu-link${isLinkActive(link.href) ? " is-active" : ""}`;
                const ariaCurrent = isLinkActive(link.href) ? "page" : undefined;

                // Native anchors: static-export soft navigations can drop intermittently.
                return (
                  <a
                    key={`${link.href}-${link.label}`}
                    href={link.href}
                    {...linkTarget(link)}
                    className={className}
                    aria-current={ariaCurrent}
                    onClick={closeMobileMenu}
                  >
                    {link.label}
                  </a>
                );
              })}
            </div>

            <div
              className={`zuse-mobile-services ${isMobileServicesOpen ? "is-open" : ""}`}
              aria-hidden={!isMobileServicesOpen}
            >
              <button
                type="button"
                className="zuse-mobile-services-back"
                onClick={() => setIsMobileServicesOpen(false)}
              >
                <Image
                  src={`${CDN_URL}/images/services_sub_menu-back.svg`}
                  alt="Zuse Digital"
                  width={25}
                  height={25}
                />
                <span>Back</span>
              </button>
              <div className="zuse-mobile-services-links">
                {serviceLinks.map((item) => (
                  <a
                    key={`${item.href}-${item.label}`}
                    href={item.href}
                    {...linkTarget(item)}
                    className="zuse-mobile-menu-link"
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="zuse-mobile-menu-footer">
            {socialLinks.length > 0 && <div className="zuse-mobile-social-label">Follow us</div>}
            <div className="zuse-mobile-social-icons">
              {socialLinks.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="zuse-mobile-social-icon"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={item.name}
                >
                  <Image src={item.icon} alt={`Zuse Digital ${item.name}`} width={20} height={20} className="w-5 h-5" unoptimized={item.icon.startsWith("http")} />
                </a>
              ))}
              <a href="/" className="zuse-mobile-social-icon" aria-label="Website" onClick={closeMobileMenu}>
                <Image src="/images/icons/website.svg" alt="Zuse Digital Website" width={20} height={20} className="w-5 h-5" />
              </a>
            </div>
            {headerCta && (
            <div className="zuse-mobile-cta-row">
              <Button
                href={headerCta.href}
                target={headerCta.newTab ? "_blank" : undefined}
                className="zuse-mobile-cta-btn"
                font="sans"
                onClick={closeMobileMenu}
              >
                {headerCta.label}
              </Button>
              <a
                href={headerCta.href}
                className="zuse-mobile-cta-icon-btn"
                aria-label="Contact"
                onClick={closeMobileMenu}
              >
                <PhoneIcon />
              </a>
            </div>
            )}
          </div>
        </div>
      </header>
    </>
  );
}
