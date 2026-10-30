"use client";

import { useActionState } from "react";
import { createBooking, type BookingActionState } from "@/app/actions/bookings";
import { Field, Notice, PrimaryButton, TextArea, TextInput } from "@/components/ui";

const initialState: BookingActionState = {};

export function BookingForm({ listingId }: { listingId: number }) {
  const [state, action, pending] = useActionState(createBooking, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="listing_id" value={listingId} />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label="Preferred date (optional)">
        <TextInput name="preferred_date" type="date" />
      </Field>
      <Field label="Booking request">
        <TextArea
          name="message"
          rows={4}
          required
          placeholder="I need this service for 3 acres near Shamshabad on Tuesday morning…"
        />
      </Field>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Sending…" : "Request booking"}
      </PrimaryButton>
    </form>
  );
}
