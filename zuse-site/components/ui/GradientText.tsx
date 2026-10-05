"use client";

import React, { useEffect, useRef, useState } from "react";

export interface GradientTextProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  as?: "span" | "div" | "p" | "h1" | "h2" | "h3";
  className?: string;
  immediate?: boolean;
  threshold?: number;
}

/**
 * Reusable animated gradient text sweep component.
 * Sweeps vibrant brand gradient text when entering viewport or immediately on mount.
 */
export function GradientText({
  children,
  as: Component = "span",
  className = "",
  immediate = false,
  threshold = 0.1,
  ...restProps
}: GradientTextProps) {
  const [isVisible, setIsVisible] = useState<boolean>(immediate);
  const elementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (immediate) {
      setIsVisible(true);
      return;
    }

    const element = elementRef.current;
    if (!element) return;

    if (typeof window === "undefined" || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold }
    );

    observer.observe(element);

    return () => {
      observer.disconnect();
    };
  }, [immediate, threshold]);

  const ComponentTag = Component as React.ElementType;
  const combinedClassName = [
    "gradient-text-sweep",
    "gradient-text-animate",
    isVisible ? "is-visible" : "",
    className,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <ComponentTag
      ref={elementRef}
      className={combinedClassName}
      {...restProps}
    >
      {children}
    </ComponentTag>
  );
}

export default GradientText;
