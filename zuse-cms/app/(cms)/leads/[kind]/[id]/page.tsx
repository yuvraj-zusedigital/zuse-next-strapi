import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Clock, ExternalLink, FileText, Mail, Phone } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { env } from "@/lib/env";
import { describeDevice, formatDuration, isLeadKind, journeyByDay, LEAD_KINDS } from "@/lib/leads";
import { atLeast } from "@/lib/roles";
import { getLead, getMe } from "@/lib/strapi";
import type { LeadDetail, LeadKind } from "@/lib/types";
import { DeleteLeadButton } from "../../delete-lead-button";

export async function generateMetadata({ params }: PageProps<"/leads/[kind]/[id]">): Promise<Metadata> {
  const { kind } = await params;
  return { title: isLeadKind(kind) ? LEAD_KINDS[kind].title : "Leads" };
}

const text = (value: unknown) => (value === null || value === undefined || value === "" ? null : String(value));

/** Labels for the extra fields the website's forms send (stored in the submission's data). */
const EXTRA_LABELS: Record<string, string> = {
  pageUrl: "Sent from page",
  screensize: "Screen size",
  fromSubmitTime: "Sent at (Melbourne time)",
  countryCode: "Country code",
};
/** Shown elsewhere on the page already. */
const SHOWN = new Set(["firstName", "lastName", "email", "phoneNumber", "message", "budget", "hearAboutUs", "getUpdate", "device", "location", "userTrackingData", "formName"]);

function Details({ rows }: { rows: [string, React.ReactNode][] }) {
  const filled = rows.filter(([, value]) => value !== null && value !== undefined && value !== "");
  if (!filled.length) return null;
  return (
    <dl className="@container grid gap-y-3 text-sm">
      {filled.map(([label, value]) => (
        <div key={label} className="grid gap-x-4 gap-y-0.5 @sm:grid-cols-[10rem_minmax(0,1fr)]">
          <dt className="text-muted-foreground">{label}</dt>
          <dd className="min-w-0 [overflow-wrap:anywhere]">{value}</dd>
        </div>
      ))}
    </dl>
  );
}

function Card({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <section className={`rounded-xl border bg-card p-5 shadow-xs ${className ?? ""}`}>
      <h2 className="mb-4 text-sm font-semibold">{title}</h2>
      {children}
    </section>
  );
}

function Journey({ lead, timeZone }: { lead: LeadDetail; timeZone?: string }) {
  const days = journeyByDay(lead.journey, timeZone);
  const timeFormat = new Intl.DateTimeFormat("en-AU", { timeStyle: "short", timeZone });
  const pages = days.reduce((sum, day) => sum + day.steps.length, 0);
  const seconds = days.reduce((sum, day) => sum + day.steps.reduce((total, step) => total + step.seconds, 0), 0);

  return (
    <Card title="Visitor journey">
      {pages === 0 ? (
        <p className="text-sm text-muted-foreground">No pages were recorded for this visit.</p>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-muted-foreground">
            {pages} {pages === 1 ? "page" : "pages"} viewed · {formatDuration(seconds)} on the site
          </p>
          {days.map((day) => (
            <div key={day.day}>
              <h3 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">{day.day}</h3>
              <ol className="relative space-y-3 border-l pl-5">
                {day.steps.map((step, index) => (
                  <li key={index} className="relative">
                    <span className="absolute top-1.5 -left-[1.6rem] size-2.5 rounded-full bg-primary ring-4 ring-card" aria-hidden="true" />
                    <div className="flex flex-wrap items-baseline justify-between gap-x-3">
                      <span className="font-medium">{step.name}</span>
                      <span className="inline-flex items-center gap-1 text-xs text-muted-foreground tabular-nums">
                        <Clock className="size-3" /> {formatDuration(step.seconds)}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-x-3 text-xs text-muted-foreground">
                      {step.at && <span className="tabular-nums">{timeFormat.format(step.at)}</span>}
                      {step.path && (
                        <a href={`${env.siteUrl}${step.path}`} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:text-foreground hover:underline">
                          {step.path} <ExternalLink className="size-3" />
                        </a>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

/** One form submission, subscriber or visit record (Admins only). */
export default async function LeadPage({ params }: PageProps<"/leads/[kind]/[id]">) {
  const { kind, id } = await params;
  if (!isLeadKind(kind) || !/^\d+$/.test(id)) notFound();
  const me = await getMe();
  if (!atLeast(me.role.type, "admin")) notFound();

  const lead = await getLead(kind as LeadKind, Number(id));
  if (!lead) notFound();

  const info = LEAD_KINDS[kind];
  const timeZone = me.timezone ?? undefined;
  const dateFormat = new Intl.DateTimeFormat("en-AU", { dateStyle: "full", timeStyle: "short", timeZone });
  const fields = lead.fields;
  const raw = lead.raw ?? {};
  const title = lead.name || lead.submission?.name || lead.email || `${info.singular[0].toUpperCase()}${info.singular.slice(1)} #${lead.id}`;
  const message = kind === "submissions" ? text(fields.message) : null;
  const extras = Object.entries(raw).filter(([key, value]) => !SHOWN.has(key) && text(value) && typeof value !== "object");

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <Link href={`/leads/${kind}`} className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> {info.title}
        </Link>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{title}</h1>
            <p className="text-sm text-muted-foreground">
              {kind === "subscribers" ? "Signed up" : "Received"} {dateFormat.format(new Date(lead.createdAt))}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            {lead.email && (
              <a href={`mailto:${lead.email}`} className={buttonVariants()}>
                <Mail /> Email {lead.name?.split(" ")[0] || "them"}
              </a>
            )}
            {lead.phone && (
              <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className={buttonVariants({ variant: "outline" })}>
                <Phone /> Call
              </a>
            )}
            {kind === "tracking" && lead.submission && (
              <Link href={`/leads/submissions/${lead.submission.id}`} className={buttonVariants({ variant: "outline" })}>
                <FileText /> View their form submission
              </Link>
            )}
            <DeleteLeadButton
              kind={kind}
              id={lead.id}
              label={`this ${info.singular}`}
              note={kind === "submissions" ? "and the record of pages they visited" : undefined}
            />
          </div>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(0,26rem)]">
        <div className="min-w-0 space-y-6">
          {message && (
            <Card title="Message">
              <p className="text-sm leading-relaxed whitespace-pre-line">{message}</p>
            </Card>
          )}
          {kind !== "tracking" && (
            <Card title="Details">
              <Details
                rows={[
                  ["Email", lead.email && <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>],
                  ["Phone", lead.phone && <a href={`tel:${lead.phone.replace(/[^\d+]/g, "")}`} className="text-primary hover:underline">{lead.phone}</a>],
                  ["Budget", lead.budget],
                  ["Heard about us", lead.hearAboutUs],
                  ["Wants updates", kind === "submissions" && typeof fields.Stayupdated === "boolean" ? (fields.Stayupdated ? "Yes" : "No") : null],
                  ["Location", lead.location],
                  ["Device", describeDevice(text(fields.device))],
                  ["Form", kind === "submissions" && lead.formName && lead.formName !== "form" ? lead.formName : null],
                  ...extras.map(([key, value]): [string, React.ReactNode] => [
                    EXTRA_LABELS[key] ?? key,
                    key === "pageUrl" ? (
                      <a href={String(value)} target="_blank" rel="noreferrer" className="text-primary hover:underline">
                        {String(value)}
                      </a>
                    ) : (
                      String(value)
                    ),
                  ]),
                ]}
              />
            </Card>
          )}
          {kind === "tracking" && (
            <Card title="Details">
              <Details
                rows={[
                  ["Email", lead.email && <a href={`mailto:${lead.email}`} className="text-primary hover:underline">{lead.email}</a>],
                  [
                    "Form submission",
                    lead.submission && (
                      <Link href={`/leads/submissions/${lead.submission.id}`} className="text-primary hover:underline">
                        {lead.submission.name || `#${lead.submission.id}`}
                      </Link>
                    ),
                  ],
                ]}
              />
            </Card>
          )}
        </div>
        <Journey lead={lead} timeZone={timeZone} />
      </div>
    </div>
  );
}
