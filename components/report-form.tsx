"use client";

import { useActionState, useState } from "react";
import { submitReport, type ReportActionState } from "@/app/actions/reports";
import { Field, Notice, SecondaryButton, TextArea } from "@/components/ui";

const initialState: ReportActionState = {};

export function ReportForm({
  targetType,
  targetId,
  returnTo,
}: {
  targetType:
    | "profile"
    | "service_listing"
    | "farm_job"
    | "product_listing"
    | "buyer_requirement"
    | "enquiry";
  targetId: string | number;
  returnTo: string;
}) {
  const [open, setOpen] = useState(false);
  const [state, action, pending] = useActionState(submitReport, initialState);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="text-sm text-muted underline-offset-2 hover:underline"
      >
        Report
      </button>
    );
  }

  return (
    <form action={action} className="mt-3 space-y-3 rounded-xl border border-border bg-white p-3">
      <input type="hidden" name="target_type" value={targetType} />
      <input type="hidden" name="target_id" value={String(targetId)} />
      <input type="hidden" name="return_to" value={returnTo} />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label="Why are you reporting this?">
        <TextArea
          name="reason"
          rows={3}
          required
          minLength={8}
          placeholder="Spam, misleading info, abuse…"
        />
      </Field>
      <div className="flex flex-wrap gap-2">
        <SecondaryButton type="submit" disabled={pending}>
          {pending ? "Sending…" : "Submit report"}
        </SecondaryButton>
        <button
          type="button"
          className="rounded-xl px-3 py-2 text-sm text-muted hover:bg-accent-soft"
          onClick={() => setOpen(false)}
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
