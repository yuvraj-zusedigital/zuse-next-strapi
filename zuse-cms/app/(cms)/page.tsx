import Link from "next/link";
import { FileText, Images, Newspaper, Plus } from "lucide-react";
import { ColumnChart, ContentChart, StatTile } from "@/components/dashboard/charts";
import { sum } from "@/lib/chart-math";
import { getDashboard, getMe, getSchema } from "@/lib/strapi";

const QUICK_ACTIONS = [
  { href: "/page/new", label: "New page", icon: FileText },
  { href: "/blog/new", label: "New blog post", icon: Newspaper },
  { href: "/media", label: "Upload media", icon: Images },
];

const dayLabel = new Intl.DateTimeFormat("en-AU", { day: "numeric", month: "short", timeZone: "UTC" });
const fullDay = new Intl.DateTimeFormat("en-AU", { weekday: "short", day: "numeric", month: "short", timeZone: "UTC" });
const asDate = (key: string) => new Date(`${key}T00:00:00Z`);

export default async function DashboardPage() {
  const me = await getMe();
  const [schema, data] = await Promise.all([getSchema(), getDashboard(me.timezone ?? null)]);
  const collections = schema.contentTypes.filter((type) => type.kind === "collectionType");
  const name = me.username.includes("@") ? me.username.split("@")[0] : me.username;

  const contentTotals = {
    published: sum(data.content.map((row) => row.published)),
    modified: sum(data.content.map((row) => row.modified)),
    draft: sum(data.content.map((row) => row.draft)),
  };
  const days = data.activity.days;
  const last7 = sum(days.slice(-7).map((day) => day.count));
  const prev7 = sum(days.slice(-14, -7).map((day) => day.count));
  const edits30 = sum(days.map((day) => day.count));
  const leads = data.leads;

  return (
    <div className="space-y-8">
      <div className="cms-rise flex flex-wrap items-end justify-between gap-6">
        <div className="space-y-1">
          <p className="text-sm font-medium text-muted-foreground">Dashboard</p>
          <h1 className="text-3xl font-semibold tracking-tight md:text-4xl">
            Welcome back, <span className="cms-gradient-text capitalize">{name}</span>
          </h1>
          <p className="text-muted-foreground">Everything editors manage on zusedigital.com.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {QUICK_ACTIONS.filter((action) => action.href === "/media" || collections.some((type) => action.href.startsWith(`/${type.slug}/`))).map(
            ({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className="cms-glass group inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ring-1 ring-white/70 transition-all dark:ring-white/10 hover:-translate-y-0.5 hover:text-primary hover:shadow-[0_12px_28px_-12px_color-mix(in_oklab,var(--a-deep)_45%,transparent)]"
              >
                <span className="grid size-6 place-items-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {href === "/media" ? <Icon className="size-3.5" /> : <Plus className="size-3.5" />}
                </span>
                {label}
              </Link>
            ),
          )}
        </div>
      </div>

      {/* Headline figures */}
      <div className={`cms-rise grid gap-4 sm:grid-cols-2 ${leads ? "xl:grid-cols-3 2xl:grid-cols-5" : "xl:grid-cols-4"}`} style={{ "--i": 1 } as React.CSSProperties}>
        <StatTile label="Published entries" value={contentTotals.published} note="Live on the site" />
        <StatTile label="Unpublished changes" value={contentTotals.modified} note={contentTotals.modified ? "Live, with edits waiting to publish" : "Everything is published"}/>
        <StatTile label="Drafts" value={contentTotals.draft}note="Never published" />
        <StatTile label="Edits, last 7 days" value={last7} previous={prev7} trend={days.slice(-14).map((day) => day.count)} href={me.role.type === "editor" ? undefined : "/activity"} />
        {leads && <StatTile label="Enquiries, last 7 days" value={leads.enquiries7} previous={leads.enquiriesPrev7} upIsGood href="/leads/submissions" />}
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
        <section className="cms-rise cms-glass rounded-2xl p-5" style={{ "--i": 2 } as React.CSSProperties}>
          <h2 className="font-semibold">Content by type</h2>
          <p className="mb-4 text-sm text-muted-foreground">Entries per type, by publishing status. Click a bar to open that list.</p>
          <ContentChart rows={data.content} />
        </section>

        <div className="space-y-6">
          <section className="cms-rise cms-glass rounded-2xl p-5" style={{ "--i": 3 } as React.CSSProperties}>
            <h2 className="font-semibold">Edits per day</h2>
            <p className="mb-4 text-sm text-muted-foreground">
              Saves, publishes and uploads in the CMS over the last 30 days: {edits30.toLocaleString("en-AU")} in total.
            </p>
            <ColumnChart
              valueLabel="edits"
              caption="Edits per day, last 30 days"
              empty="No edits in the last 30 days."
              labelEvery={7}
              points={days.map((day) => ({ key: day.day, label: fullDay.format(asDate(day.day)), short: dayLabel.format(asDate(day.day)), value: day.count }))}
            />
          </section>

          {leads && (
            <section className="cms-rise cms-glass rounded-2xl p-5" style={{ "--i": 4 } as React.CSSProperties}>
              <h2 className="font-semibold">Enquiries per week</h2>
              <p className="mb-4 text-sm text-muted-foreground">
                Contact form submissions over the last 12 weeks. {leads.subscribers7} new {leads.subscribers7 === 1 ? "subscriber" : "subscribers"} in the last 7 days.
              </p>
              <ColumnChart
                valueLabel="enquiries"
                caption="Enquiries per week, last 12 weeks"
                empty="No enquiries in the last 12 weeks."
                labelEvery={4}
                points={leads.weeks.map((week) => ({
                  key: week.end,
                  label: `${dayLabel.format(asDate(week.start))} – ${dayLabel.format(asDate(week.end))}`,
                  short: dayLabel.format(asDate(week.end)),
                  value: week.count,
                }))}
              />
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
