"use client";

import { useActionState } from "react";
import {
  saveBuyerRequirement,
  type RequirementActionState,
} from "@/app/actions/requirements";
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

const UNITS = [
  { value: "kg", label: "kg" },
  { value: "quintal", label: "Quintal" },
  { value: "tonne", label: "Tonne" },
  { value: "litre", label: "Litre" },
  { value: "piece", label: "Piece" },
] as const;

const initialState: RequirementActionState = {};

export function RequirementForm({
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
    quantity?: number | null;
    quantity_unit?: string | null;
    district_id?: number | null;
    village_id?: number | null;
    needed_from?: string | null;
    needed_until?: string | null;
    expected_price?: number | null;
    price_unit?: string | null;
    quality_notes?: string | null;
    status?: string;
  };
}) {
  const [state, action, pending] = useActionState(saveBuyerRequirement, initialState);

  return (
    <form action={action} className="space-y-4">
      {initial?.id ? (
        <input type="hidden" name="requirement_id" value={initial.id} />
      ) : null}
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}

      <Field label="Category">
        <Select name="category_id" required defaultValue={initial?.category_id ?? ""}>
          <option value="">Select crop / product</option>
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
          placeholder="Looking for Sona Masuri paddy"
        />
      </Field>
      <Field label="Description">
        <TextArea name="description" rows={4} defaultValue={initial?.description ?? ""} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Quantity needed">
          <TextInput
            name="quantity"
            type="number"
            min="0"
            step="0.001"
            defaultValue={initial?.quantity ?? ""}
          />
        </Field>
        <Field label="Quantity unit">
          <Select name="quantity_unit" defaultValue={initial?.quantity_unit ?? "quintal"}>
            <option value="">Any</option>
            {UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Expected price (₹)">
          <TextInput
            name="expected_price"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initial?.expected_price ?? ""}
          />
        </Field>
        <Field label="Price unit">
          <Select name="price_unit" defaultValue={initial?.price_unit ?? "quintal"}>
            <option value="">Any</option>
            {UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Needed from">
          <TextInput
            name="needed_from"
            type="date"
            defaultValue={initial?.needed_from ?? ""}
          />
        </Field>
        <Field label="Needed until">
          <TextInput
            name="needed_until"
            type="date"
            defaultValue={initial?.needed_until ?? ""}
          />
        </Field>
      </div>
      <Field label="Quality notes">
        <TextArea name="quality_notes" rows={2} defaultValue={initial?.quality_notes ?? ""} />
      </Field>

      <LocationCascade
        districts={districts}
        mandals={mandals}
        districtName="district_id"
        initialVillageId={initial?.village_id}
        initialDistrictId={initialDistrictId ?? initial?.district_id}
        initialMandalId={initialMandalId}
        initialVillages={initialVillages}
        required={false}
        labels={{
          district: "District",
          mandal: "Mandal",
          village: "Village / town",
          selectLocation: "Any in mandal",
          selectMandalFirst: "Select a mandal first",
        }}
        className="grid gap-3 sm:grid-cols-3"
      />


      <Field label="Status">
        <Select name="status" defaultValue={initial?.status ?? "draft"}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </Select>
      </Field>
      <p className="text-sm text-muted">
        Published requirements are reviewed by staff before sellers can offer produce.
      </p>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : initial?.id ? "Update requirement" : "Create requirement"}
      </PrimaryButton>
    </form>
  );
}
