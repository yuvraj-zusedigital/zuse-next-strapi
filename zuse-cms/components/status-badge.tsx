import { Badge } from "@/components/ui/badge";
import type { EntryStatus } from "@/lib/types";

const STATUS: Record<EntryStatus, { label: string; variant: "default" | "secondary" | "outline"; title: string }> = {
  published: { label: "Published", variant: "default", title: "Live on the site" },
  modified: { label: "Modified", variant: "secondary", title: "Live, with unpublished changes" },
  draft: { label: "Draft", variant: "outline", title: "Not on the site" },
};

export function StatusBadge({ status }: { status: EntryStatus }) {
  const { label, variant, title } = STATUS[status];
  return (
    <Badge variant={variant} title={title}>
      {label}
    </Badge>
  );
}
