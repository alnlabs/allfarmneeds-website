"use client";

import { useActionState } from "react";
import { submitReview, type ReviewActionState } from "@/app/actions/reviews";
import {
  Field,
  Notice,
  PrimaryButton,
  Select,
  TextArea,
} from "@/components/ui";

const initialState: ReviewActionState = {};

export function ReviewForm({
  entityType,
  entityId,
  revieweeId,
  revieweeLabel,
  returnTo,
}: {
  entityType: "service_booking" | "job_application" | "product_deal";
  entityId: number;
  revieweeId: string;
  revieweeLabel: string;
  returnTo: string;
}) {
  const [state, action, pending] = useActionState(submitReview, initialState);

  return (
    <form action={action} className="mt-3 space-y-3 rounded-xl border border-border bg-accent-soft/40 p-3">
      <input type="hidden" name="entity_type" value={entityType} />
      <input type="hidden" name="entity_id" value={entityId} />
      <input type="hidden" name="reviewee_id" value={revieweeId} />
      <input type="hidden" name="return_to" value={returnTo} />
      <p className="text-sm font-medium">Rate {revieweeLabel}</p>
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label="Rating">
        <Select name="rating" required defaultValue="5">
          <option value="5">5 — Excellent</option>
          <option value="4">4 — Good</option>
          <option value="3">3 — Okay</option>
          <option value="2">2 — Poor</option>
          <option value="1">1 — Bad</option>
        </Select>
      </Field>
      <Field label="Comment (optional)">
        <TextArea name="comment" rows={2} placeholder="What went well?" />
      </Field>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Submit review"}
      </PrimaryButton>
    </form>
  );
}
