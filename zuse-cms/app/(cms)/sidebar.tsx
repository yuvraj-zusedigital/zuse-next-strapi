"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Footprints, Gauge, History, Images, Inbox, LayoutDashboard, MailPlus, Users } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { AccentPicker, ThemeToggle } from "@/components/theme";
import { atLeast } from "@/lib/roles";
import { typeIcon } from "@/lib/type-icons";
import { cn } from "@/lib/utils";

type NavItem = { slug: string; displayName: string; group: "content" | "settings" };

function NavLink({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex items-center gap-2.5 rounded-lg px-2.5 py-1.5 text-sm text-sidebar-foreground/80 transition-all duration-200 hover:translate-x-0.5 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground [&_svg]:transition-colors",
        active &&
          "bg-gradient-to-r from-white/14 to-white/4 font-medium text-white shadow-[inset_0_0_0_1px_rgb(255_255_255/0.08)] [&_svg]:text-brand-sky before:absolute before:top-1.5 before:bottom-1.5 before:-left-2 before:w-1 before:rounded-full before:bg-gradient-to-b before:from-brand-sky before:to-brand-bright before:shadow-[0_0_12px_var(--a-soft)]",
      )}
    >
      {children}
    </Link>
  );
}

export function Sidebar({ nav, user }: { nav: NavItem[]; user: { roleType: string; accent: string | null } }) {
  const isAdmin = atLeast(user.roleType, "admin");
  const pathname = usePathname();
  const isActive = (href: string) => pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  const groups = [
    { label: "Content", items: nav.filter((item) => item.group === "content") },
    { label: "Site settings", items: nav.filter((item) => item.group === "settings") },
  ].filter((group) => group.items.length);

  return (
    <aside className="sticky top-0 hidden h-svh w-60 shrink-0 flex-col overflow-hidden cms-sidebar-glass text-sidebar-foreground md:flex">
      {/* Soft light in the corner of the sidebar. */}
      <div aria-hidden="true" className="pointer-events-none absolute -top-24 -left-16 size-64 rounded-full bg-brand-bright/30 blur-3xl" />
      <Link href="/" className="relative flex items-center gap-2 px-5 py-5" aria-label="Zuse CMS dashboard">
        {/* White version of the logo on the navy sidebar. */}
        <Image src="/zuse-logo.png" alt="Zuse Digital" width={684} height={138} priority className="h-auto w-32 brightness-0 invert" />
        <span className="rounded-md bg-white/10 px-1.5 py-0.5 text-[10px] font-semibold tracking-widest text-brand-sky uppercase ring-1 ring-white/10">
          CMS
        </span>
      </Link>
      <nav className="relative flex-1 space-y-5 overflow-y-auto px-3">
        <div className="space-y-1">
          <NavLink href="/" active={isActive("/")}>
            <LayoutDashboard className="size-4" /> Dashboard
          </NavLink>
          <NavLink href="/media" active={isActive("/media")}>
            <Images className="size-4" /> Media library
          </NavLink>
          <NavLink href="/speed" active={isActive("/speed")}>
            <Gauge className="size-4" /> Site speed
          </NavLink>
        </div>
        {groups.map(({ label, items }) => (
          <div key={label} className="space-y-1">
            <div className="px-2.5 pb-1 text-[11px] font-medium uppercase tracking-widest text-sidebar-foreground/75">{label}</div>
            {items.map((item) => {
              const Icon = typeIcon(item.slug);
              return (
                <NavLink key={item.slug} href={`/${item.slug}`} active={isActive(`/${item.slug}`)}>
                  <Icon className="size-4" /> {item.displayName}
                </NavLink>
              );
            })}
          </div>
        ))}
        {isAdmin && (
          <div className="space-y-1">
            <div className="px-2.5 pb-1 text-[11px] font-medium uppercase tracking-widest text-sidebar-foreground/75">Leads</div>
            <NavLink href="/leads/submissions" active={isActive("/leads/submissions")}>
              <Inbox className="size-4" /> Form submissions
            </NavLink>
            <NavLink href="/leads/subscribers" active={isActive("/leads/subscribers")}>
              <MailPlus className="size-4" /> Subscribers
            </NavLink>
            <NavLink href="/leads/tracking" active={isActive("/leads/tracking")}>
              <Footprints className="size-4" /> Visitor tracking
            </NavLink>
          </div>
        )}
        {isAdmin && (
          <div className="space-y-1">
            <div className="px-2.5 pb-1 text-[11px] font-medium uppercase tracking-widest text-sidebar-foreground/75">Administration</div>
            <NavLink href="/activity" active={isActive("/activity")}>
              <History className="size-4" /> Activity
            </NavLink>
            <NavLink href="/users" active={isActive("/users")}>
              <Users className="size-4" /> Users
            </NavLink>
          </div>
        )}
      </nav>
      <Separator className="relative bg-sidebar-border" />
      <div className="relative space-y-3 p-4">
        <ThemeToggle tone="sidebar" />
        <AccentPicker tone="sidebar" saved={user.accent} />
      </div>
    </aside>
  );
}
