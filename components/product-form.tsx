"use client";

import { useActionState, useState } from "react";
import { saveProductListing, type ProductActionState } from "@/app/actions/products";
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

const initialState: ProductActionState = {};

export function ProductForm({
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
    quantity_available?: number;
    quantity_unit?: string;
    expected_price?: number | null;
    price_unit?: string | null;
    quality_grade?: string | null;
    village_id?: number | null;
    minimum_order_quantity?: number | null;
    fulfillment?: string;
    status?: string;
    photo_urls?: string[];
  };
}) {
  const [state, action, pending] = useActionState(saveProductListing, initialState);
  const [keptPhotos, setKeptPhotos] = useState(initial?.photo_urls ?? []);

  return (
    <form action={action} className="space-y-4" encType="multipart/form-data">
      {initial?.id ? (
        <input type="hidden" name="listing_id" value={initial.id} />
      ) : null}
      {keptPhotos.map((url) => (
        <input key={url} type="hidden" name="keep_photo_url" value={url} />
      ))}
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
          placeholder="Sona Masuri paddy — fresh harvest"
        />
      </Field>
      <Field label="Description">
        <TextArea name="description" rows={4} defaultValue={initial?.description ?? ""} />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Quantity available">
          <TextInput
            name="quantity_available"
            type="number"
            min="0"
            step="0.001"
            required
            defaultValue={initial?.quantity_available ?? ""}
          />
        </Field>
        <Field label="Quantity unit">
          <Select name="quantity_unit" required defaultValue={initial?.quantity_unit ?? "quintal"}>
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
            <option value="">Same as quantity unit</option>
            {UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Quality / grade">
          <TextInput name="quality_grade" defaultValue={initial?.quality_grade ?? ""} />
        </Field>
        <Field label="Minimum order quantity">
          <TextInput
            name="minimum_order_quantity"
            type="number"
            min="0"
            step="0.001"
            defaultValue={initial?.minimum_order_quantity ?? ""}
          />
        </Field>
      </div>
      <Field label="Fulfillment">
        <Select name="fulfillment" defaultValue={initial?.fulfillment ?? "pickup"}>
          <option value="pickup">Pickup</option>
          <option value="delivery">Delivery</option>
          <option value="either">Either</option>
        </Select>
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


      <Field label="Photos" hint="Up to 8 images, 5 MB each.">
        {keptPhotos.length > 0 ? (
          <ul className="mb-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {keptPhotos.map((url) => (
              <li key={url} className="relative overflow-hidden rounded-xl border border-border">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={url} alt="" className="h-24 w-full object-cover" />
                <button
                  type="button"
                  className="absolute right-1 top-1 rounded bg-black/60 px-2 py-0.5 text-xs text-white"
                  onClick={() =>
                    setKeptPhotos((current) => current.filter((item) => item !== url))
                  }
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        ) : null}
        <input type="file" name="photos" accept="image/*" multiple className="block w-full text-sm" />
      </Field>

      <Field label="Status">
        <Select name="status" defaultValue={initial?.status ?? "draft"}>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="closed">Closed</option>
        </Select>
      </Field>
      <p className="text-sm text-muted">
        Published crop listings are reviewed by staff before buyers can reserve quantity.
      </p>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : initial?.id ? "Update listing" : "Create listing"}
      </PrimaryButton>
    </form>
  );
}
