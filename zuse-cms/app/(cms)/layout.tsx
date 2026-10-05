import { MediaBaseProvider, SiteBaseProvider } from "@/components/media/media-base";
import { env } from "@/lib/env";
import { Backdrop } from "@/components/backdrop";
import { DigitalClock } from "@/components/clock";
import { AccountMenu } from "@/components/account-menu";
import { HelpButton } from "@/components/help/help-drawer";
import { RoleProvider } from "@/components/role-context";
import { getMe, getSchema, mediaBaseUrl } from "@/lib/strapi";
import { Sidebar } from "./sidebar";

export default async function CmsLayout({ children }: LayoutProps<"/">) {
  // Current role from Strapi (it may have changed since sign-in).
  const [user, schema] = await Promise.all([getMe(), getSchema()]);

  const nav = schema.contentTypes.map(({ slug, displayName, kind, group }) => ({
    slug,
    displayName,
    group: group ?? (kind === "singleType" ? "settings" : "content"),
  }));

  return (
    <RoleProvider value={user.role.type}>
      <MediaBaseProvider value={mediaBaseUrl()}>
        <SiteBaseProvider value={env.siteUrl}>
        <Backdrop />
        <div className="relative z-10 flex min-h-svh">
          <Sidebar nav={nav} user={{ roleType: user.role.type, accent: user.accent ?? null }} />
          <div className="flex min-w-0 flex-1 flex-col">
            {/* Slim top bar, top right on every CMS page: help, clock, who's signed in and Sign out. */}
            <div className="sticky top-0 z-30 flex h-12 shrink-0 items-center justify-end bg-background/50 px-4 backdrop-blur-xl md:px-6">
              <div className="flex items-center gap-2">
                <HelpButton />
                <DigitalClock timezone={user.timezone ?? null} />
                <AccountMenu email={user.email} role={user.role.name} />
              </div>
            </div>
            <main className="min-w-0 flex-1 px-6 pb-6 md:px-10 md:pb-10">{children}</main>
          </div>
        </div>
        </SiteBaseProvider>
      </MediaBaseProvider>
    </RoleProvider>
  );
}
