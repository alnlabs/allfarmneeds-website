"use client";

import { useActionState } from "react";
import { sendEnquiry, type EnquiryActionState } from "@/app/actions/enquiries";
import { Field, Notice, PrimaryButton, TextArea } from "@/components/ui";

const initialState: EnquiryActionState = {};

export function EnquiryForm({
  listingId,
  nextPath,
}: {
  listingId: number;
  nextPath: string;
}) {
  const [state, action, pending] = useActionState(sendEnquiry, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="service_listing_id" value={listingId} />
      <input type="hidden" name="next" value={nextPath} />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label="Your message">
        <TextArea
          name="message"
          rows={4}
          required
          placeholder="I need a tractor tomorrow for 3 acres in Shamshabad…"
        />
      </Field>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send enquiry"}
      </PrimaryButton>
    </form>
  );
}
