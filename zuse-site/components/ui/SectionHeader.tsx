import React, { ReactNode } from "react";

interface SectionHeaderProps {
  title: ReactNode;
  description: ReactNode;
  className?: string;
}

export function SectionHeader({ title, description, className = "" }: SectionHeaderProps) {
  return (
    <div className={`relative  w-full mx-auto mb-12 box-border md:mb-16 lg:px-0 ${className}`}>
      <div className="flex flex-col items-start justify-between gap-4 md:gap-8 md:flex-row">
        <h2 className="m-0 font-display font-medium text-[32px] leading-[31px] tracking-[-0.02em] text-ink-800 md:w-1/2 md:text-[40px] md:leading-[1.05] md:tracking-[-0.03em]">
          {title}
        </h2>
        {description &&
          <div className="m-0 font-sans text-[16px] leading-[1.625] text-ink-700 md:w-full md:max-w-[440px]">
            {description}
          </div>
        }
      </div>
    </div>
  );
}
