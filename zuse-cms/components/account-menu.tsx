"use client";

import { useTransition } from "react";
import { Menu } from "@base-ui/react/menu";
import { Loader2, LogOut } from "lucide-react";
import { logout } from "@/app/(auth)/login/actions";

/**
 * Top-right account button: just the initials. It opens a small menu with
 * who's signed in (email and role) and Sign out.
 */
export function AccountMenu({ email, role }: { email: string; role: string }) {
  const [signingOut, startSigningOut] = useTransition();

  return (
    <Menu.Root>
      <Menu.Trigger
        aria-label={`Account: ${email} (${role})`}
        data-hint={`${email} · ${role}`}
        className="grid size-8 place-items-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground uppercase ring-2 ring-white/70 outline-none transition-transform hover:scale-105 focus-visible:ring-ring data-popup-open:ring-ring dark:ring-white/15"
      >
        {email.slice(0, 2)}
      </Menu.Trigger>
      <Menu.Portal>
        <Menu.Positioner side="bottom" align="end" sideOffset={8} className="z-50">
          <Menu.Popup className="w-64 origin-(--transform-origin) rounded-xl bg-popover p-1.5 text-sm text-popover-foreground ring-1 ring-foreground/10 outline-none data-closed:animate-out data-closed:fade-out-0 data-closed:zoom-out-95 data-open:animate-in data-open:fade-in-0 data-open:zoom-in-95">
            <div className="flex items-center gap-2.5 px-2 py-2">
              <span className="grid size-9 shrink-0 place-items-center rounded-full bg-primary text-xs font-semibold text-primary-foreground uppercase" aria-hidden="true">
                {email.slice(0, 2)}
              </span>
              <div className="min-w-0">
                <div className="truncate font-medium" title={email}>
                  {email}
                </div>
                <div className="text-xs text-muted-foreground">{role}</div>
              </div>
            </div>
            <div className="my-1 h-px bg-border" role="separator" />
            <Menu.Item
              disabled={signingOut}
              onClick={() => startSigningOut(() => logout())}
              className="flex cursor-default items-center gap-2 rounded-lg px-2 py-1.5 outline-none select-none data-highlighted:bg-destructive/10 data-highlighted:text-destructive data-disabled:opacity-60"
            >
              {signingOut ? <Loader2 className="size-4 animate-spin" /> : <LogOut className="size-4" />} Sign out
            </Menu.Item>
          </Menu.Popup>
        </Menu.Positioner>
      </Menu.Portal>
    </Menu.Root>
  );
}
