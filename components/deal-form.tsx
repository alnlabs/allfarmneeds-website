"use client";

import { useActionState } from "react";
import { createProductDeal, type ProductActionState } from "@/app/actions/products";
import { Field, Notice, PrimaryButton, TextArea, TextInput } from "@/components/ui";

const initialState: ProductActionState = {};

export function DealForm({
  listingId,
  quantityUnit,
  maxQuantity,
  minimumOrder,
}: {
  listingId: number;
  quantityUnit: string;
  maxQuantity: number;
  minimumOrder?: number | null;
}) {
  const [state, action, pending] = useActionState(createProductDeal, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="listing_id" value={listingId} />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field
        label={`Quantity (${quantityUnit})`}
        hint={
          minimumOrder
            ? `Available ${maxQuantity}. Minimum ${minimumOrder}.`
            : `Available ${maxQuantity}.`
        }
      >
        <TextInput
          name="quantity"
          type="number"
          min={minimumOrder ?? 0.001}
          max={maxQuantity}
          step="0.001"
          required
          defaultValue={minimumOrder ?? Math.min(1, maxQuantity)}
        />
      </Field>
      <Field label="Message to seller">
        <TextArea name="message" rows={3} placeholder="Pickup timing, quality notes…" />
      </Field>
      <PrimaryButton type="submit" disabled={pending || maxQuantity <= 0}>
        {pending ? "Reserving…" : "Reserve quantity"}
      </PrimaryButton>
      <p className="text-xs text-muted">
        Reserving holds stock immediately so it cannot be oversold. Cancel later to release it.
      </p>
    </form>
  );
}
