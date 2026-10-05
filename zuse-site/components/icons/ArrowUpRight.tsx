import type { SVGProps } from "react";

export function ArrowUpRight({
  width = 16,
  height = 16,
  strokeWidth = 1,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      <path d="M3 9 9 3M4.5 3H9v4.5" />
    </svg>
  );
}
