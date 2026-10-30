"use client";

import { useActionState, useMemo, useState } from "react";
import { saveListing, type ListingActionState } from "@/app/actions/listings";
import { LISTING_STATUSES, PRICE_UNITS } from "@/lib/site";
import {
  Field,
  Notice,
  PrimaryButton,
  Select,
  TextArea,
  TextInput,
} from "@/components/ui";

type Category = { id: number; name_en: string; name_te: string };
type District = { id: number; name: string; label?: string; state_name?: string };
type Mandal = { id: number; name: string; district_id: number };
type Village = { id: number; name: string; mandal_id: number };

export type SelectedArea = {
  token: string;
  label: string;
};

type ListingValues = {
  id?: number;
  category_id?: number;
  title?: string;
  description?: string;
  price_amount?: number | null;
  price_unit?: string | null;
  minimum_booking?: string | null;
  availability_note?: string | null;
  travel_charge_note?: string | null;
  status?: string;
  photo_urls?: string[];
  areas?: SelectedArea[];
};

const initialState: ListingActionState = {};

export function ListingForm({
  categories,
  districts,
  mandals,
  villages,
  initial,
}: {
  categories: Category[];
  districts: District[];
  mandals: Mandal[];
  villages: Village[];
  initial?: ListingValues;
}) {
  const [state, action, pending] = useActionState(saveListing, initialState);
  const [selectedAreas, setSelectedAreas] = useState<SelectedArea[]>(
    initial?.areas ?? [],
  );
  const [keptPhotos, setKeptPhotos] = useState<string[]>(
    initial?.photo_urls ?? [],
  );
  const [districtId, setDistrictId] = useState(
    districts.find((d) => d.name === "Rangareddy")?.id ?? districts[0]?.id ?? 0,
  );

  const filteredMandals = useMemo(
    () => mandals.filter((mandal) => mandal.district_id === districtId),
    [mandals, districtId],
  );
  const [mandalId, setMandalId] = useState(filteredMandals[0]?.id ?? 0);
  const filteredVillages = useMemo(
    () => villages.filter((village) => village.mandal_id === mandalId),
    [villages, mandalId],
  );
  const [villageId, setVillageId] = useState(filteredVillages[0]?.id ?? 0);

  const districtLabel = (district: District) =>
    district.label ?? district.name;

  function addArea(token: string, label: string) {
    setSelectedAreas((current) =>
      current.some((area) => area.token === token)
        ? current
        : [...current, { token, label }],
    );
  }

  function removeArea(token: string) {
    setSelectedAreas((current) => current.filter((area) => area.token !== token));
  }

  const selectedDistrict = districts.find((d) => d.id === districtId);
  const selectedMandal = filteredMandals.find((m) => m.id === mandalId);
  const selectedVillage = filteredVillages.find((v) => v.id === villageId);

  return (
    <form action={action} className="space-y-4" encType="multipart/form-data">
      {initial?.id ? <input type="hidden" name="listing_id" value={initial.id} /> : null}
      {selectedAreas.map((area) => (
        <input key={area.token} type="hidden" name="areas" value={area.token} />
      ))}
      {keptPhotos.map((url) => (
        <input key={url} type="hidden" name="keep_photo_url" value={url} />
      ))}
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
          placeholder="Tractor with driver — 40 HP"
        />
      </Field>

      <Field label="Description">
        <TextArea
          name="description"
          rows={5}
          defaultValue={initial?.description ?? ""}
          placeholder="What is included, working hours, fuel, operator…"
        />
      </Field>

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Price amount">
          <TextInput
            name="price_amount"
            type="number"
            min="0"
            step="0.01"
            defaultValue={initial?.price_amount ?? ""}
          />
        </Field>
        <Field label="Price unit">
          <Select name="price_unit" defaultValue={initial?.price_unit ?? ""}>
            <option value="">Select unit</option>
            {PRICE_UNITS.map((unit) => (
              <option key={unit.value} value={unit.value}>
                {unit.label}
              </option>
            ))}
          </Select>
        </Field>
      </div>

      <Field label="Minimum booking">
        <TextInput
          name="minimum_booking"
          defaultValue={initial?.minimum_booking ?? ""}
          placeholder="Minimum 2 acres"
        />
      </Field>
      <Field label="Availability">
        <TextInput
          name="availability_note"
          defaultValue={initial?.availability_note ?? ""}
          placeholder="Available Mon–Sat, mornings"
        />
      </Field>
      <Field label="Travel / transport charges">
        <TextInput
          name="travel_charge_note"
          defaultValue={initial?.travel_charge_note ?? ""}
          placeholder="Travel charge outside Shamshabad"
        />
      </Field>

      <div className="space-y-3 rounded-2xl border border-border bg-white p-4">
        <p className="text-sm font-medium">Service areas</p>
        <p className="text-sm text-muted">
          Add one or more districts, mandals, or villages where you offer this
          service.
        </p>

        <div className="grid gap-3 sm:grid-cols-3">
          <Field label="District">
            <Select
              value={districtId}
              onChange={(event) => {
                const nextDistrict = Number(event.target.value);
                setDistrictId(nextDistrict);
                const nextMandal =
                  mandals.find((mandal) => mandal.district_id === nextDistrict)
                    ?.id ?? 0;
                setMandalId(nextMandal);
                const nextVillage =
                  villages.find((village) => village.mandal_id === nextMandal)
                    ?.id ?? 0;
                setVillageId(nextVillage);
              }}
            >
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {districtLabel(district)}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Mandal">
            <Select
              value={mandalId}
              onChange={(event) => {
                const nextMandal = Number(event.target.value);
                setMandalId(nextMandal);
                const nextVillage =
                  villages.find((village) => village.mandal_id === nextMandal)
                    ?.id ?? 0;
                setVillageId(nextVillage);
              }}
            >
              {filteredMandals.map((mandal) => (
                <option key={mandal.id} value={mandal.id}>
                  {mandal.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Village / town">
            <Select
              value={villageId}
              onChange={(event) => setVillageId(Number(event.target.value))}
            >
              {filteredVillages.map((village) => (
                <option key={village.id} value={village.id}>
                  {village.name}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent-soft"
            onClick={() => {
              if (!selectedDistrict) return;
              addArea(
                `district:${selectedDistrict.id}`,
                `District: ${districtLabel(selectedDistrict)}`,
              );
            }}
          >
            Add district
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent-soft"
            onClick={() => {
              if (!selectedMandal || !selectedDistrict) return;
              addArea(
                `mandal:${selectedMandal.id}`,
                `Mandal: ${selectedMandal.name} (${districtLabel(selectedDistrict)})`,
              );
            }}
          >
            Add mandal
          </button>
          <button
            type="button"
            className="rounded-lg border border-border px-3 py-1.5 text-sm hover:bg-accent-soft"
            onClick={() => {
              if (!selectedVillage || !selectedMandal || !selectedDistrict) return;
              addArea(
                `village:${selectedVillage.id}`,
                `${selectedVillage.name} · ${selectedMandal.name} · ${districtLabel(selectedDistrict)}`,
              );
            }}
          >
            Add village / town
          </button>
        </div>

        {selectedAreas.length === 0 ? (
          <p className="text-sm text-muted">No areas added yet.</p>
        ) : (
          <ul className="flex flex-wrap gap-2">
            {selectedAreas.map((area) => (
              <li
                key={area.token}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-accent-soft px-3 py-1 text-sm"
              >
                <span>{area.label}</span>
                <button
                  type="button"
                  className="text-muted hover:text-accent-strong"
                  onClick={() => removeArea(area.token)}
                  aria-label={`Remove ${area.label}`}
                >
                  ×
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <Field
        label="Service photos"
        hint="Up to 8 images, 5 MB each. Existing photos stay unless you remove them."
      >
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
        <input
          type="file"
          name="photos"
          accept="image/*"
          multiple
          className="block w-full text-sm"
        />
      </Field>

      <Field label="Status">
        <Select name="status" defaultValue={initial?.status ?? "draft"}>
          {LISTING_STATUSES.map((status) => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </Select>
      </Field>
      <p className="text-sm text-muted">
        Published listings are reviewed by AllFarmNeeds staff before they appear
        in public search.
      </p>

      <PrimaryButton type="submit" disabled={pending || selectedAreas.length === 0}>
        {pending ? "Saving…" : initial?.id ? "Update listing" : "Create listing"}
      </PrimaryButton>
    </form>
  );
}
