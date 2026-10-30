"use client";

import { useActionState } from "react";
import { createProductDeal, type ProductActionState } from "@/app/actions/products";
import { useLocale } from "@/components/locale-provider";
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
  const { copy, locale } = useLocale();

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="listing_id" value={listingId} />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field
        label={
          locale === "te"
            ? `పరిమాణం (${quantityUnit})`
            : `Quantity (${quantityUnit})`
        }
        hint={
          minimumOrder
            ? locale === "te"
              ? `అందుబాటు ${maxQuantity}. కనీసం ${minimumOrder}.`
              : `Available ${maxQuantity}. Minimum ${minimumOrder}.`
            : locale === "te"
              ? `అందుబాటు ${maxQuantity}.`
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
      <Field label={copy.messageToSeller}>
        <TextArea
          name="message"
          rows={3}
          placeholder={
            locale === "te"
              ? "పికప్ సమయం, నాణ్యత గమనికలు…"
              : "Pickup timing, quality notes…"
          }
        />
      </Field>
      <PrimaryButton
        type="submit"
        disabled={pending || maxQuantity <= 0}
        className="min-h-11 w-full sm:w-auto"
      >
        {pending ? copy.holdingQuantity : copy.holdQuantity}
      </PrimaryButton>
      <p className="text-xs text-muted">{copy.holdQuantityHint}</p>
    </form>
  );
}
