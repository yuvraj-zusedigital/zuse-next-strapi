"use client";

import { useEffect, useMemo, useState, useSyncExternalStore, useTransition } from "react";
import { Clock as ClockIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { saveTimezone } from "@/app/(cms)/preferences-actions";
import { Button } from "@/components/ui/button";
import { Combobox, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxList } from "@/components/ui/combobox";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const subscribe = () => () => {};

/** Ticks on the second, aligned to the clock so seconds change on time. */
function useNow() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    let timer: number;
    const tick = () => {
      setNow(new Date());
      timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    };
    timer = window.setTimeout(tick, 1000 - (Date.now() % 1000));
    return () => window.clearTimeout(timer);
  }, []);
  return now;
}

const deviceZone = () => Intl.DateTimeFormat().resolvedOptions().timeZone;

/** "GMT+5:30" for a zone at a moment. */
function offsetOf(zone: string, at: Date) {
  try {
    return (
      new Intl.DateTimeFormat("en", { timeZone: zone, timeZoneName: "shortOffset" })
        .formatToParts(at)
        .find((part) => part.type === "timeZoneName")?.value ?? ""
    );
  } catch {
    return "";
  }
}

type ZoneOption = { value: string | null; label: string };

function TimezoneDialog({
  current,
  onClose,
  onSaved,
}: {
  current: string | null;
  onClose: () => void;
  onSaved: (zone: string | null) => void;
}) {
  const [pending, startTransition] = useTransition();
  const options = useMemo<ZoneOption[]>(() => {
    const now = new Date();
    const device = deviceZone();
    const zones = Intl.supportedValuesOf("timeZone");
    return [
      { value: null, label: `Device time zone — ${device.replace(/_/g, " ")} (${offsetOf(device, now)})` },
      ...(zones.includes("UTC") ? [] : [{ value: "UTC", label: "UTC (GMT)" }]),
      ...zones.map((zone) => ({ value: zone, label: `${zone.replace(/_/g, " ")} (${offsetOf(zone, now)})` })),
    ];
  }, []);
  const [selected, setSelected] = useState<ZoneOption>(() => options.find((option) => option.value === current) ?? options[0]);
  // The search box starts empty; the current choice is shown underneath.
  const [picked, setPicked] = useState<ZoneOption | null>(null);

  const save = () =>
    startTransition(async () => {
      const result = await saveTimezone(selected.value);
      if (!result.ok) {
        toast.error(result.message);
        return;
      }
      onSaved(selected.value);
      toast.success(selected.value ? `Clock set to ${selected.value.replace(/_/g, " ")}.` : "Clock follows your device's time zone.");
      onClose();
    });

  return (
    <Dialog open onOpenChange={(open) => !open && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Clock time zone</DialogTitle>
          <DialogDescription>Saved to your account, so the clock shows this time zone wherever you sign in.</DialogDescription>
        </DialogHeader>
        <div className="space-y-2">
          <Label htmlFor="clock-timezone">Time zone</Label>
          <Combobox
            items={options}
            value={picked}
            onValueChange={(next) => {
              setPicked((next as ZoneOption) ?? null);
              if (next) setSelected(next as ZoneOption);
            }}
            itemToStringLabel={(option: ZoneOption) => option.label}
            isItemEqualToValue={(a: ZoneOption, b: ZoneOption) => a.value === b.value}
          >
            <ComboboxInput id="clock-timezone" placeholder="Search a city or region, e.g. Tokyo" className="w-full" />
            <ComboboxContent>
              <ComboboxEmpty>No matching time zone</ComboboxEmpty>
              <ComboboxList>
                {(option: ZoneOption) => (
                  <ComboboxItem key={option.value ?? "device"} value={option}>
                    {option.label}
                  </ComboboxItem>
                )}
              </ComboboxList>
            </ComboboxContent>
          </Combobox>
          <p className="text-sm text-muted-foreground">
            Selected: <span className="font-medium text-foreground">{selected.label}</span>
          </p>
        </div>
        <DialogFooter>
          <Button type="button" variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button type="button" onClick={save} disabled={pending}>
            {pending && <Loader2 className="animate-spin" />} Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

/**
 * Digital clock (24-hour) in the user's saved time zone, or the device's.
 * Click it to change the time zone. Rendered only in the browser, with a
 * same-size placeholder until then so nothing shifts.
 */
export function DigitalClock({
  timezone,
  className,
  editable = true,
}: {
  timezone: string | null;
  className?: string;
  /** false (e.g. on the sign-in page, with no account to save to): just shows the time. */
  editable?: boolean;
}) {
  const mounted = useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
  const now = useNow();
  const [zone, setZone] = useState<string | null>(timezone);
  const [editing, setEditing] = useState(false);

  // A zone the browser doesn't know falls back to the device's.
  const safeZone = useMemo(() => {
    if (!zone) return undefined;
    try {
      new Intl.DateTimeFormat("en", { timeZone: zone });
      return zone;
    } catch {
      return undefined;
    }
  }, [zone]);

  const parts = new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hourCycle: "h23",
    timeZone: safeZone,
  }).formatToParts(now);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  const date = new Intl.DateTimeFormat(undefined, { weekday: "short", day: "numeric", month: "short", timeZone: safeZone }).format(now);
  const zoneName = safeZone ?? (mounted ? deviceZone() : "");
  const zoneLabel = zoneName.split("/").pop()?.replace(/_/g, " ") ?? "";
  const offset = mounted && zoneName ? offsetOf(zoneName, now) : "";

  const face = (
    <>
      <ClockIcon className="size-3.5 text-primary" aria-hidden="true" />
      <span className="text-xs text-muted-foreground">{mounted ? date : " "}</span>
      <span className="h-3.5 w-px bg-border" aria-hidden="true" />
      <time dateTime={mounted ? now.toISOString() : undefined} className="font-mono text-sm font-semibold tracking-tight tabular-nums">
        {mounted ? (
          <>
            {part("hour")}
            <span className="cms-clock-colon">:</span>
            {part("minute")}
            <span className="cms-clock-colon">:</span>
            <span className="text-primary">{part("second")}</span>
          </>
        ) : (
          "--:--:--"
        )}
      </time>
      {mounted && zoneLabel && <span className="hidden text-[11px] font-medium text-muted-foreground sm:inline">{zoneLabel}</span>}
    </>
  );
  const pill = cn("cms-glass flex items-center gap-2.5 rounded-full px-3.5 py-1.5 ring-1 ring-white/70 dark:ring-white/10", className);

  if (!editable) {
    return (
      <div className={pill} role="timer" aria-label={mounted ? `${part("hour")}:${part("minute")} ${date}, ${zoneName}` : "Clock"}>
        {face}
      </div>
    );
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setEditing(true)}
        className={cn(
          pill,
          "transition-shadow outline-none hover:shadow-[0_8px_24px_-10px_color-mix(in_oklab,var(--a-deep)_45%,transparent)] focus-visible:ring-3 focus-visible:ring-ring/50",
        )}
        aria-label={mounted ? `${part("hour")}:${part("minute")} ${date}, ${zoneName}. Change time zone` : "Clock. Change time zone"}
        title={mounted ? `${zoneName} (${offset}) — click to change` : undefined}
      >
        {face}
      </button>
      {editing && <TimezoneDialog current={zone} onClose={() => setEditing(false)} onSaved={setZone} />}
    </>
  );
}
