"use client";

import { useEffect, useSyncExternalStore, useTransition } from "react";
import { ThemeProvider as NextThemesProvider, useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import { saveAccent } from "@/app/(cms)/preferences-actions";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select";
import { ACCENT_COOKIE, ACCENT_COOKIE_MAX_AGE, ACCENTS, isAccent, type Accent } from "@/lib/accents";
import { cn } from "@/lib/utils";

/** Light, dark or the system setting; remembered per browser (next-themes). */
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      {children}
    </NextThemesProvider>
  );
}

const subscribe = () => () => {};

type ViewTransitionDocument = Document & {
  startViewTransition?: (update: () => void) => { ready: Promise<void> };
};

/**
 * Switches the theme with a smooth reveal: the new theme grows as a circle
 * from the switch (View Transitions), or colours cross-fade where that isn't
 * supported. Instant for reduced-motion users.
 */
function switchTheme(next: "light" | "dark", origin: HTMLElement, setTheme: (theme: string) => void) {
  const root = document.documentElement;
  const apply = () => {
    // Set the class right away so the transition captures the new look;
    // next-themes then stores the choice.
    root.classList.toggle("dark", next === "dark");
    root.style.colorScheme = next;
    setTheme(next);
  };

  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return apply();

  const doc = document as ViewTransitionDocument;
  if (!doc.startViewTransition || document.visibilityState !== "visible") {
    root.classList.add("cms-theme-fade");
    apply();
    window.setTimeout(() => root.classList.remove("cms-theme-fade"), 500);
    return;
  }

  const rect = origin.getBoundingClientRect();
  const x = rect.left + rect.width / 2;
  const y = rect.top + rect.height / 2;
  const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

  doc
    .startViewTransition(apply)
    .ready.then(() => {
      root.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 650, easing: "cubic-bezier(0.4, 0, 0.2, 1)", pseudoElement: "::view-transition-new(root)" },
      );
    })
    // Skipped (e.g. the tab is in the background): the theme has still changed.
    .catch(() => {});
}

/**
 * Light/dark switch. Follows the system setting until it's flipped, then
 * remembers the choice. `tone="sidebar"` for the navy sidebar.
 */
export function ThemeToggle({ tone = "default", className }: { tone?: "default" | "sidebar"; className?: string }) {
  const { resolvedTheme, setTheme } = useTheme();
  // The theme is only known in the browser; render "light" on the server.
  const mounted = useSyncExternalStore(subscribe, () => true, () => false);
  const dark = mounted && resolvedTheme === "dark";
  const sidebar = tone === "sidebar";

  return (
    <label className={cn("flex cursor-pointer items-center justify-between gap-3 text-xs select-none", sidebar ? "text-sidebar-foreground/80" : "text-muted-foreground", className)}>
      <span>{dark ? "Dark mode" : "Light mode"}</span>
      <button
        type="button"
        role="switch"
        aria-checked={dark}
        aria-label="Dark mode"
        data-hint={dark ? "Switch to light mode" : "Switch to dark mode"}
        onClick={(event) => switchTheme(dark ? "light" : "dark", event.currentTarget, setTheme)}
        className={cn(
          "relative inline-flex h-7 w-13 shrink-0 items-center rounded-full p-0.5 transition-colors duration-300 outline-none focus-visible:ring-3 focus-visible:ring-ring/50",
          dark ? "bg-gradient-to-r from-brand-royal to-brand-bright" : sidebar ? "bg-white/15" : "bg-brand-sky/50 ring-1 ring-border",
        )}
      >
        {/* Track icons */}
        <Sun className={cn("absolute left-1.5 size-3.5 transition-opacity", dark ? "text-white/50 opacity-100" : "opacity-0")} />
        <Moon className={cn("absolute right-1.5 size-3.5 transition-opacity", dark ? "opacity-0" : sidebar ? "text-white/60" : "text-brand-royal/50")} />
        {/* Thumb */}
        <span
          className={cn(
            "relative z-10 grid size-6 place-items-center rounded-full bg-white shadow-md transition-transform duration-300 ease-[cubic-bezier(.4,1.4,.6,1)]",
            dark ? "translate-x-6" : "translate-x-0",
          )}
        >
          {dark ? <Moon className="size-3.5 text-brand-royal" /> : <Sun className="size-3.5 text-amber-500" />}
        </span>
      </button>
    </label>
  );
}

const readAccent = (): Accent => (document.documentElement.getAttribute("data-accent") as Accent | null) ?? "zuse";
const subscribeAccent = (onChange: () => void) => {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-accent"] });
  return () => observer.disconnect();
};

/**
 * Shows a colour theme now and remembers it in this browser's cookie (the
 * layout renders from it). The change is one smooth cross-fade of the whole
 * screen (View Transitions): a snapshot fades into the new colours, so the
 * glass surfaces aren't repainted mid-animation. Instant where that isn't
 * supported, and for reduced-motion users.
 */
function applyAccent(accent: Accent, { animate = true } = {}) {
  const root = document.documentElement;
  const set = () => {
    if (accent === "zuse") root.removeAttribute("data-accent");
    else root.setAttribute("data-accent", accent);
  };
  document.cookie = `${ACCENT_COOKIE}=${accent}; path=/; max-age=${ACCENT_COOKIE_MAX_AGE}; samesite=lax`;
  const doc = document as ViewTransitionDocument;
  const smooth = animate && typeof doc.startViewTransition === "function" && document.visibilityState === "visible" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!smooth) return set();
  doc
    .startViewTransition!(set)
    .ready.then(() => {
      root.animate({ opacity: [0, 1] }, { duration: 320, easing: "ease-out", pseudoElement: "::view-transition-new(root)" });
    })
    .catch(() => {});
}

/** A theme's colour dot, with a fine ring so light and dark swatches both show on any surface. */
const Swatch = ({ color }: { color: string }) => (
  <span className="size-3.5 shrink-0 rounded-full ring-1 ring-black/10 dark:ring-white/20" style={{ background: color }} aria-hidden="true" />
);

/**
 * Colour theme dropdown. The choice is saved on the user's account (`saved`
 * is the account's value), so it follows them to every device.
 */
export function AccentPicker({ saved, tone = "default", className }: { saved: string | null; tone?: "default" | "sidebar"; className?: string }) {
  const accent = useSyncExternalStore(subscribeAccent, readAccent, () => "zuse" as Accent);
  const [, startSaving] = useTransition();

  // Changed on another device: follow the account (no fade on load).
  useEffect(() => {
    const account: Accent = isAccent(saved) ? saved : "zuse";
    if (account !== readAccent()) applyAccent(account, { animate: false });
  }, [saved]);

  const choose = (next: Accent) => {
    const previous = readAccent();
    applyAccent(next);
    startSaving(async () => {
      const result = await saveAccent(next);
      if (!result.ok) {
        applyAccent(previous);
        toast.error(`Couldn't save the colour theme: ${result.message}`);
      }
    });
  };
  const sidebar = tone === "sidebar";
  const current = ACCENTS.find((item) => item.value === accent) ?? ACCENTS[0];

  return (
    <div className={cn("space-y-1.5 text-xs", sidebar ? "text-sidebar-foreground/80" : "text-muted-foreground", className)}>
      <span className="block">Colour theme</span>
      <Select value={current.value} onValueChange={(value) => isAccent(value as string) && choose(value as Accent)}>
        <SelectTrigger
          aria-label={`Colour theme: ${current.label}`}
          className={cn("w-full", sidebar && "cms-sidebar-select border-white/15 text-white hover:bg-white/10 dark:hover:bg-white/10")}
        >
          <span className="flex min-w-0 items-center gap-2">
            <Swatch color={current.swatch} />
            <span className="truncate">{current.label}</span>
          </span>
        </SelectTrigger>
        <SelectContent side="top" alignItemWithTrigger={false} className="min-w-44">
          {ACCENTS.map((item) => (
            <SelectItem key={item.value} value={item.value}>
              <Swatch color={item.swatch} />
              {item.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

}
