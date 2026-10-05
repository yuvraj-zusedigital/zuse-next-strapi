"use client";

import { useTransition } from "react";
import { Loader2, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ConfirmButton } from "@/components/confirm-button";
import { deleteLeadAction } from "./actions";

/** Deletes one lead after confirming; personal data, so it's for good. */
export function DeleteLeadButton({ kind, id, label, note }: { kind: string; id: number; label: string; note?: string }) {
  const [pending, startTransition] = useTransition();
  return (
    <ConfirmButton
      variant="outline"
      destructive
      disabled={pending}
      title={`Delete ${label}?`}
      description={`This permanently removes their details${note ? ` ${note}` : ""}. Use it for spam, or when someone asks for their data to be deleted.`}
      confirmLabel="Delete"
      onConfirm={() =>
        startTransition(async () => {
          const result = await deleteLeadAction(kind, id);
          if (result && !result.ok) toast.error(result.message);
        })
      }
    >
      {pending ? <Loader2 className="animate-spin" /> : <Trash2 />} Delete
    </ConfirmButton>
  );
}
