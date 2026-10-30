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
  area_type?: "district" | "mandal" | "village";
  area_id?: number;
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
  const [areaType, setAreaType] = useState<"district" | "mandal" | "village">(
    initial?.area_type ?? "village",
  );
  const [districtId, setDistrictId] = useState(
    districts.find((d) => d.name === "Rangareddy")?.id ?? districts[0]?.id ?? 0,
  );
  const districtLabel = (district: District) =>
    district.label ?? district.name;

  const filteredMandals = useMemo(
    () => mandals.filter((mandal) => mandal.district_id === districtId),
    [mandals, districtId],
  );
  const [mandalId, setMandalId] = useState(
    initial?.area_type === "mandal"
      ? initial.area_id
      : filteredMandals[0]?.id ?? 0,
  );

  const filteredVillages = useMemo(
    () => villages.filter((village) => village.mandal_id === mandalId),
    [villages, mandalId],
  );

  const areaOptions =
    areaType === "district"
      ? districts
      : areaType === "mandal"
        ? filteredMandals
        : filteredVillages;

  return (
    <form action={action} className="space-y-4">
      {initial?.id ? <input type="hidden" name="listing_id" value={initial.id} /> : null}
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Service area type">
          <Select
            name="area_type"
            value={areaType}
            onChange={(event) =>
              setAreaType(event.target.value as "district" | "mandal" | "village")
            }
          >
            <option value="district">District</option>
            <option value="mandal">Mandal</option>
            <option value="village">Village</option>
          </Select>
        </Field>
        {areaType !== "district" ? (
          <Field label="District filter">
            <Select
              value={districtId}
              onChange={(event) => {
                const nextDistrict = Number(event.target.value);
                setDistrictId(nextDistrict);
                const nextMandal =
                  mandals.find((mandal) => mandal.district_id === nextDistrict)?.id ??
                  0;
                setMandalId(nextMandal);
              }}
            >
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {districtLabel(district)}
                </option>
              ))}
            </Select>
          </Field>
        ) : null}
      </div>

      {areaType === "village" ? (
        <Field label="Mandal filter">
          <Select
            value={mandalId}
            onChange={(event) => setMandalId(Number(event.target.value))}
          >
            {filteredMandals.map((mandal) => (
              <option key={mandal.id} value={mandal.id}>
                {mandal.name}
              </option>
            ))}
          </Select>
        </Field>
      ) : null}

      <Field label="Service area">
        <Select
          name="area_id"
          required
          defaultValue={initial?.area_id ?? areaOptions[0]?.id ?? ""}
        >
          <option value="">Select area</option>
          {areaOptions.map((area) => (
            <option key={area.id} value={area.id}>
              {"label" in area && area.label ? area.label : area.name}
            </option>
          ))}
        </Select>
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

      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : initial?.id ? "Update listing" : "Create listing"}
      </PrimaryButton>
    </form>
  );
}
