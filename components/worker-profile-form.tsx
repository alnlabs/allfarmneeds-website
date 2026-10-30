"use client";

import { useActionState, useMemo, useState } from "react";
import { saveWorkerProfile, type WorkerActionState } from "@/app/actions/worker";
import { Field, Notice, PrimaryButton, Select, TextArea, TextInput } from "@/components/ui";

type Category = { id: number; name_en: string; name_te: string };
type District = { id: number; name: string; label?: string };
type Mandal = { id: number; name: string; district_id: number };
type Village = { id: number; name: string; mandal_id: number };

const initialState: WorkerActionState = {};

export function WorkerProfileForm({
  districts,
  mandals,
  villages,
  categories,
  villageId,
  experience,
  expectedCompensation,
  availability,
  skillIds,
  nextPath = "/jobs",
}: {
  districts: District[];
  mandals: Mandal[];
  villages: Village[];
  categories: Category[];
  villageId?: number | null;
  experience: string;
  expectedCompensation: string;
  availability: string;
  skillIds: number[];
  nextPath?: string;
}) {
  const [state, action, pending] = useActionState(saveWorkerProfile, initialState);
  const initialVillage = villages.find((v) => v.id === villageId);
  const initialMandal = mandals.find((m) => m.id === initialVillage?.mandal_id);
  const [districtId, setDistrictId] = useState(
    initialMandal?.district_id ??
      districts.find((d) => d.name === "Rangareddy")?.id ??
      districts[0]?.id ??
      0,
  );
  const filteredMandals = useMemo(
    () => mandals.filter((m) => m.district_id === districtId),
    [mandals, districtId],
  );
  const [mandalId, setMandalId] = useState(
    initialMandal?.id ?? filteredMandals[0]?.id ?? 0,
  );
  const filteredVillages = useMemo(
    () => villages.filter((v) => v.mandal_id === mandalId),
    [villages, mandalId],
  );

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}

      <div className="grid gap-3 sm:grid-cols-3">
        <Field label="District">
          <Select
            value={districtId}
            onChange={(event) => {
              const nextDistrict = Number(event.target.value);
              setDistrictId(nextDistrict);
              setMandalId(
                mandals.find((m) => m.district_id === nextDistrict)?.id ?? 0,
              );
            }}
          >
            {districts.map((district) => (
              <option key={district.id} value={district.id}>
                {district.label ?? district.name}
              </option>
            ))}
          </Select>
        </Field>
        <Field label="Mandal">
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
        <Field label="Village / town">
          <Select name="village_id" defaultValue={villageId ?? filteredVillages[0]?.id ?? ""}>
            <option value="">Select location</option>
            {filteredVillages.map((village) => (
              <option key={village.id} value={village.id}>
                {village.name}
              </option>
            ))}
          </Select>
        </Field>
      </div>

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
