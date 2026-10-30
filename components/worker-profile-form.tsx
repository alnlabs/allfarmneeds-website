"use client";

import { useActionState } from "react";
import { saveWorkerProfile, type WorkerActionState } from "@/app/actions/worker";
import { LocationCascade } from "@/components/location-cascade";
import type {
  LocationDistrict,
  LocationMandal,
  LocationVillage,
} from "@/lib/location-ui";
import { Field, Notice, PrimaryButton, TextArea, TextInput } from "@/components/ui";

type Category = { id: number; name_en: string; name_te: string };

const initialState: WorkerActionState = {};

export function WorkerProfileForm({
  districts,
  mandals,
  categories,
  villageId,
  districtId,
  mandalId,
  villages = [],
  experience,
  expectedCompensation,
  availability,
  skillIds,
  nextPath = "/jobs",
}: {
  districts: LocationDistrict[];
  mandals: LocationMandal[];
  categories: Category[];
  villageId?: number | null;
  districtId?: number | null;
  mandalId?: number | null;
  villages?: LocationVillage[];
  experience: string;
  expectedCompensation: string;
  availability: string;
  skillIds: number[];
  nextPath?: string;
}) {
  const [state, action, pending] = useActionState(saveWorkerProfile, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}

      <LocationCascade
        districts={districts}
        mandals={mandals}
        initialVillageId={villageId}
        initialDistrictId={districtId}
        initialMandalId={mandalId}
        initialVillages={villages}
        labels={{
          district: "District",
          mandal: "Mandal",
          village: "Village / town",
          selectLocation: "Select location",
          selectMandalFirst: "Select a mandal first",
        }}
        className="grid gap-3 sm:grid-cols-3"
      />

      <Field label="Experience">
        <TextArea name="experience" rows={3} defaultValue={experience} />
      </Field>
      <Field label="Expected compensation">
        <TextInput
          name="expected_compensation"
          defaultValue={expectedCompensation}
          placeholder="₹500 / day"
        />
      </Field>
      <Field label="Availability">
        <TextInput
          name="availability"
          defaultValue={availability}
          placeholder="Available Mon–Sat"
        />
      </Field>

      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">Skills</legend>
        <div className="grid gap-2 sm:grid-cols-2">
          {categories.map((category) => (
            <label
              key={category.id}
              className="flex items-start gap-2 rounded-xl border border-border bg-white p-3 text-sm"
            >
              <input
                type="checkbox"
                name="skill_ids"
                value={category.id}
                defaultChecked={skillIds.includes(category.id)}
                className="mt-1"
              />
              <span>
                {category.name_te} — {category.name_en}
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save worker profile"}
      </PrimaryButton>
    </form>
  );
}
