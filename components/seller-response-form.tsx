"use client";

import { useActionState } from "react";
import {
  createSellerResponse,
  type RequirementActionState,
} from "@/app/actions/requirements";
import {
  Field,
  Notice,
  PrimaryButton,
  Select,
  TextArea,
  TextInput,
} from "@/components/ui";

const UNITS = [
  { value: "kg", label: "kg" },
  { value: "quintal", label: "Quintal" },
  { value: "tonne", label: "Tonne" },
  { value: "litre", label: "Litre" },
  { value: "piece", label: "Piece" },
] as const;

const initialState: RequirementActionState = {};

export function SellerResponseForm({
  requirementId,
  defaultUnit,
}: {
  requirementId: number;
  defaultUnit?: string | null;
}) {
  const [state, action, pending] = useActionState(createSellerResponse, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="requirement_id" value={requirementId} />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Quantity you can supply">
          <TextInput name="quantity" type="number" min="0" step="0.001" />
        </Field>
        <Field label="Unit">
          <Select name="quantity_unit" defaultValue={defaultUnit ?? "quintal"}>
            {UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Price (₹)">
          <TextInput name="price_amount" type="number" min="0" step="0.01" />
        </Field>
        <Field label="Price unit">
          <Select name="price_unit" defaultValue={defaultUnit ?? "quintal"}>
            {UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="Quality notes">
        <TextArea name="quality_notes" rows={2} placeholder="Grade, harvest date…" />
      </Field>
      <Field label="Delivery / pickup note">
        <TextArea name="delivery_note" rows={2} placeholder="Can deliver to mandi / pickup only" />
      </Field>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Sending…" : "Send offer"}
      </PrimaryButton>
    </form>
  );
}
