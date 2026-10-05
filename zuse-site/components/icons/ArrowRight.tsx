import type { SVGProps } from "react";

export function ArrowRight({
  width = 14,
  height = 14,
  strokeWidth = 1.5,
  ...props
}: SVGProps<SVGSVGElement>) {
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 14 14"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M2.5 7h9M7.5 3.5 11 7l-3.5 3.5" />
    </svg>
  );
}
