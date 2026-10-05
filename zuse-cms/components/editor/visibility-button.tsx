"use client";

import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/** Components with a "hidden" field show this eye button instead of the field. */
export const HIDDEN_FIELD = "hidden";

/** Show/hide on the site (a component's "hidden" field). */
export function VisibilityButton({ hidden, onToggle, className }: { hidden: boolean; onToggle: () => void; className?: string }) {
  return (
    <Button
      type="button"
      size="icon-sm"
      variant="ghost"
      aria-pressed={hidden}
      aria-label={hidden ? "Show on site" : "Hide on site"}
      title={hidden ? "Hidden on the site — click to show it" : "Shown on the site — click to hide it"}
      onClick={onToggle}
      className={cn(hidden && "text-muted-foreground", className)}
    >
      {hidden ? <EyeOff /> : <Eye />}
    </Button>
  );
}
