"use client";

import { useActionState } from "react";
import { saveBuyerProfile, type BuyerActionState } from "@/app/actions/buyer";
import {
  Field,
  Notice,
  PrimaryButton,
  Select,
  TextArea,
  TextInput,
} from "@/components/ui";

type District = { id: number; name: string; label?: string };

const initialState: BuyerActionState = {};

export function BuyerProfileForm({
  districts,
  nextPath = "/buyer/requirements",
  initial,
}: {
  districts: District[];
  nextPath?: string;
  initial?: {
    business_name?: string;
    business_type?: string;
    about?: string;
    district_ids?: number[];
  };
}) {
  const [state, action, pending] = useActionState(saveBuyerProfile, initialState);
  const selected = new Set(initial?.district_ids ?? []);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label="Business / buyer name">
        <TextInput
          name="business_name"
          required
          defaultValue={initial?.business_name ?? ""}
          placeholder="Sri Venkateswara Traders"
        />
      </Field>
      <Field label="Business type">
        <Select name="business_type" defaultValue={initial?.business_type ?? "individual"}>
          <option value="individual">Individual buyer</option>
          <option value="trader">Trader</option>
          <option value="wholesaler">Wholesaler</option>
          <option value="retailer">Retailer</option>
          <option value="restaurant">Restaurant</option>
          <option value="processor">Processor</option>
          <option value="other">Other</option>
        </Select>
      </Field>
      <Field label="About">
        <TextArea
          name="about"
          rows={3}
          defaultValue={initial?.about ?? ""}
          placeholder="What produce do you buy and where?"
        />
      </Field>
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Operating districts</legend>
        <p className="text-sm text-muted">Select districts where you typically buy produce.</p>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {districts.map((district) => (
            <label
              key={district.id}
              className="flex items-center gap-2 rounded-xl border border-border bg-white px-3 py-2 text-sm"
            >
              <input
                type="checkbox"
                name="district_id"
                value={district.id}
                defaultChecked={selected.has(district.id)}
              />
              <span>{district.label ?? district.name}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save buyer profile"}
      </PrimaryButton>
    </form>
  );
}
