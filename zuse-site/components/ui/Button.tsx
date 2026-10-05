import React from "react";
import Link from "next/link";
import { UrlObject } from "url";
import { ArrowRight } from "@/components/icons";

type Url = string | UrlObject;

export interface ButtonBaseProps {
  variant?: "primary" | "secondary" | "outline";
  size?: "sm" | "md" | "lg";
  href?: Url;
  target?: string;
  type?: "button" | "submit" | "reset";
  className?: string;
  font?: "display" | "sans";
  arrow?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  children: React.ReactNode;
}

export type ButtonProps = ButtonBaseProps &
  Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, keyof ButtonBaseProps> &
  Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, keyof ButtonBaseProps>;

/**
 * Universal Interactive Hover Button component.
 * Encapsulates the animated bubble fill, sliding labels, and optional icons
 * for both Next.js <Link> and native <button> elements.
 */
export function Button({
  variant = "primary",
  size,
  font,
  arrow,
  href,
  target,
  className = "",
  type = "button",
  disabled = false,
  leftIcon,
  rightIcon,
  children,
  ...props
}: ButtonProps) {
  const sizeClass = size ? `btn-${size}` : "";
  const variantClass = variant ? `btn-${variant}` : "";
  const fontClass = font === "sans" ? "font-sans font-medium" : "font-display font-semibold";
  const effectiveRightIcon = rightIcon || (arrow ? <ArrowRight /> : null);
  const hasIcon = Boolean(leftIcon || effectiveRightIcon);
  const iconLayoutClass = hasIcon ? "btn-with-icon" : "btn-no-icon";
  const baseClasses = `zuse-ihb group btn-base ${variantClass} ${iconLayoutClass} ${sizeClass} ${fontClass} ${className}`.trim();

  const innerContent = (
    <>
      <span className="zuse-ihb-fill btn-fill" aria-hidden="true" />
      <span className="zuse-ihb-default btn-text-default">
        {leftIcon && (
          <span className="zuse-ihb-arrow zuse-ihb-left-icon" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className="zuse-ihb-label">{children}</span>
        {effectiveRightIcon && (
          <span className="zuse-ihb-arrow zuse-ihb-right-icon" aria-hidden="true">
            {effectiveRightIcon}
          </span>
        )}
      </span>
      <span className="zuse-ihb-hover btn-text-hover" aria-hidden="true">
        {leftIcon && (
          <span className="zuse-ihb-arrow zuse-ihb-left-icon" aria-hidden="true">
            {leftIcon}
          </span>
        )}
        <span className="zuse-ihb-label">{children}</span>
        {effectiveRightIcon && (
          <span className="zuse-ihb-arrow zuse-ihb-right-icon" aria-hidden="true">
            {effectiveRightIcon}
          </span>
        )}
      </span>
    </>
  );

  if (href && !disabled) {
    // Native anchors for internal paths: static-export soft navigations can drop intermittently.
    const hardNav =
      typeof href === "string" &&
      (href.startsWith("/") || href.startsWith("#")) &&
      !href.startsWith("//");

    if (hardNav) {
      return (
        <a
          href={href}
          target={target}
          className={baseClasses}
          {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
        >
          {innerContent}
        </a>
      );
    }

    return (
      <Link
        href={href}
        target={target}
        className={baseClasses}
        {...(props as React.AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {innerContent}
      </Link>
    );
  }

  return (
    <button
      className={baseClasses}
      type={type}
      disabled={disabled}
      aria-disabled={disabled || undefined}
      {...(props as React.ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {innerContent}
    </button>
  );
}

export default Button;
