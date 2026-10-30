"use client";

import { useActionState } from "react";
import { replyToEnquiry, type EnquiryActionState } from "@/app/actions/enquiries";
import { Field, Notice, PrimaryButton, TextArea } from "@/components/ui";

const initialState: EnquiryActionState = {};

export function EnquiryReplyForm({ enquiryId }: { enquiryId: number }) {
  const [state, action, pending] = useActionState(replyToEnquiry, initialState);

  return (
    <form action={action} className="space-y-3">
      <input type="hidden" name="enquiry_id" value={enquiryId} />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label="Reply">
        <TextArea
          name="body"
          rows={3}
          required
          minLength={2}
          placeholder="Write your reply…"
        />
      </Field>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send reply"}
      </PrimaryButton>
    </form>
  );
}
