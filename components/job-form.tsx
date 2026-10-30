"use client";

import { useActionState } from "react";
import { saveFarmJob, type JobActionState } from "@/app/actions/jobs";
import { LocationCascade } from "@/components/location-cascade";
import {
  Field,
  Notice,
  PrimaryButton,
  Select,
  TextArea,
  TextInput,
} from "@/components/ui";
import type {
  LocationDistrict,
  LocationMandal,
  LocationVillage,
} from "@/lib/location-ui";

type Category = { id: number; name_en: string; name_te: string };

const PAYMENT_MODELS = [
  { value: "hourly", label: "Hourly" },
  { value: "half_day", label: "Half day" },
  { value: "full_day", label: "Full day" },
  { value: "per_acre", label: "Per acre" },
  { value: "per_task", label: "Per task" },
  { value: "quantity", label: "By quantity" },
] as const;

const initialState: JobActionState = {};

export function JobForm({
  categories,
  districts,
  mandals,
  initial,
  initialDistrictId,
  initialMandalId,
  initialVillages = [],
}: {
  categories: Category[];
  districts: LocationDistrict[];
  mandals: LocationMandal[];
  initialDistrictId?: number | null;
  initialMandalId?: number | null;
  initialVillages?: LocationVillage[];
  initial?: {
    id?: number;
    category_id?: number;
    title?: string;
    description?: string;
    workers_required?: number;
    village_id?: number | null;
    work_date?: string | null;
    payment_model?: string | null;
    advertised_amount?: number | null;
    food_water_accommodation?: string | null;
    status?: string;
  };
}) {
  const [state, action, pending] = useActionState(saveFarmJob, initialState);

  return (
    <form action={action} className="space-y-4">
      {initial?.id ? <input type="hidden" name="job_id" value={initial.id} /> : null}
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}

      <Field label="Category">
        <Select name="category_id" required defaultValue={initial?.category_id ?? ""}>
          <option value="">Select category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name_te} — {category.name_en}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Title">
        <TextInput
          name="title"
          required
          defaultValue={initial?.title ?? ""}
          placeholder="Paddy transplantation — 8 workers"
        />
      </Field>
      <Field label="Description / instructions">
        <TextArea
          name="description"
          rows={5}
          defaultValue={initial?.description ?? ""}
          placeholder="Work details, tools, meeting point…"
        />
      </Field>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Workers required">
          <TextInput
            name="workers_required"
            type="number"
            min="1"
            required
            defaultValue={initial?.workers_required ?? 1}
          />
        </Field>
        <Field label="Work date">
          <TextInput
            name="work_date"
            type="date"
            defaultValue={initial?.work_date ?? ""}
          />
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Payment model">
          <Select name="payment_model" defaultValue={initial?.payment_model ?? ""}>
            <option value="">Select</option>
            {PAYMENT_MODELS.map((model) => (
              <option key={model.value} value={model.value}>
                {model.label}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Advertised amount (₹)">
          <TextInput
            name="advertised_amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initial?.advertised_amount ?? ""}
          />
        </Field>
      </div>
      <Field label="Food / water / stay">
        <TextInput
          name="food_water_accommodation"
          defaultValue={initial?.food_water_accommodation ?? ""}
          placeholder="Lunch and water provided"
        />
      </Field>

      <LocationCascade
        districts={districts}
        mandals={mandals}
        initialVillageId={initial?.village_id}
        initialDistrictId={initialDistrictId}
        initialMandalId={initialMandalId}
        initialVillages={initialVillages}
        labels={{
          district: "District",
          mandal: "Mandal",
          village: "Village / town",
          selectLocation: "Select location",
          selectMandalFirst: "Select a mandal first",
        }}
        className="grid gap-3 sm:grid-cols-3"
      />

      <Field label="Status">
        <Select name="status" defaultValue={initial?.status ?? "draft"}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="filled">Filled</option>
          <option value="closed">Closed</option>
          <option value="cancelled">Cancelled</option>
        </Select>
      </Field>
      <p className="text-sm text-muted">
        Published jobs are reviewed by AllFarmNeeds staff before workers can apply.
      </p>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : initial?.id ? "Update job" : "Create job"}
      </PrimaryButton>
    </form>
  );
}
