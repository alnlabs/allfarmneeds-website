"use client";

import { useActionState, useMemo, useState } from "react";
import { saveRoles, type RoleActionState } from "@/app/actions/roles";
import { useLocale } from "@/components/locale-provider";
import type { AppRole } from "@/lib/auth";
import { Field, Notice, PrimaryButton, Select, TextArea, TextInput } from "@/components/ui";

const initialState: RoleActionState = {};

type District = { id: number; name: string; label?: string };
type Mandal = { id: number; name: string; district_id: number };
type Village = { id: number; name: string; mandal_id: number };

function asId(value: number | string | null | undefined): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function RolesForm({
  displayName,
  roles,
  nextPath = "/profile",
  districts,
  mandals,
  villages,
  farmerVillageId,
  farmerAbout,
}: {
  displayName: string;
  roles: AppRole[];
  nextPath?: string;
  districts: District[];
  mandals: Mandal[];
  villages: Village[];
  farmerVillageId?: number | null;
  farmerAbout?: string;
}) {
  const { copy } = useLocale();
  const [state, action, pending] = useActionState(saveRoles, initialState);
  const [isFarmer, setIsFarmer] = useState(roles.includes("farmer"));

  const savedVillageId = asId(farmerVillageId);
  const initialVillage = savedVillageId
    ? villages.find((v) => asId(v.id) === savedVillageId)
    : undefined;
  const initialMandal = initialVillage
    ? mandals.find((m) => asId(m.id) === asId(initialVillage.mandal_id))
    : undefined;
  const defaultDistrictId =
    asId(initialMandal?.district_id) ??
    asId(districts.find((d) => d.name === "Rangareddy")?.id) ??
    asId(districts[0]?.id) ??
    0;

  const [districtId, setDistrictId] = useState(defaultDistrictId);

  const filteredMandals = useMemo(
    () => mandals.filter((m) => asId(m.district_id) === districtId),
    [mandals, districtId],
  );

  const defaultMandalId =
    asId(initialMandal?.id) &&
    filteredMandals.some((m) => asId(m.id) === asId(initialMandal?.id))
      ? asId(initialMandal?.id)!
      : (asId(filteredMandals[0]?.id) ?? 0);

  const [mandalId, setMandalId] = useState(defaultMandalId);

  const filteredVillages = useMemo(
    () => villages.filter((v) => asId(v.mandal_id) === mandalId),
    [villages, mandalId],
  );

  const defaultVillageId =
    savedVillageId &&
    filteredVillages.some((v) => asId(v.id) === savedVillageId)
      ? savedVillageId
      : (asId(filteredVillages[0]?.id) ?? 0);

  const [villageId, setVillageId] = useState(defaultVillageId);

  function selectDistrict(nextDistrict: number) {
    setDistrictId(nextDistrict);
    const nextMandals = mandals.filter(
      (m) => asId(m.district_id) === nextDistrict,
    );
    const nextMandal = asId(nextMandals[0]?.id) ?? 0;
    setMandalId(nextMandal);
    const nextVillages = villages.filter(
      (v) => asId(v.mandal_id) === nextMandal,
    );
    setVillageId(asId(nextVillages[0]?.id) ?? 0);
  }

  function selectMandal(nextMandal: number) {
    setMandalId(nextMandal);
    const nextVillages = villages.filter(
      (v) => asId(v.mandal_id) === nextMandal,
    );
    setVillageId(asId(nextVillages[0]?.id) ?? 0);
  }

  return (
    <form action={action} className="space-y-5">
      <input type="hidden" name="next" value={nextPath} />
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label={copy.yourName}>
        <TextInput
          name="display_name"
          defaultValue={displayName}
          placeholder={copy.yourNamePlaceholder}
          required
        />
      </Field>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">{copy.howUse}</legend>
        <label className="flex min-h-14 items-start gap-3 rounded-xl border border-border bg-white p-3">
          <input
            type="checkbox"
            name="farmer"
            defaultChecked={roles.includes("farmer")}
            className="mt-1"
            onChange={(event) => setIsFarmer(event.target.checked)}
          />
          <span>
            <span className="block font-medium">{copy.roleFarmer}</span>
            <span className="text-sm text-muted">{copy.roleFarmerDesc}</span>
          </span>
        </label>
        <label className="flex min-h-14 items-start gap-3 rounded-xl border border-border bg-white p-3">
          <input
            type="checkbox"
            name="worker"
            defaultChecked={roles.includes("worker")}
            className="mt-1"
          />
          <span>
            <span className="block font-medium">{copy.roleWorker}</span>
            <span className="text-sm text-muted">{copy.roleWorkerDesc}</span>
          </span>
        </label>
        <label className="flex min-h-14 items-start gap-3 rounded-xl border border-border bg-white p-3">
          <input
            type="checkbox"
            name="service_provider"
            defaultChecked={roles.includes("service_provider")}
            className="mt-1"
          />
          <span>
            <span className="block font-medium">{copy.roleProvider}</span>
            <span className="text-sm text-muted">{copy.roleProviderDesc}</span>
          </span>
        </label>
        <label className="flex min-h-14 items-start gap-3 rounded-xl border border-border bg-white p-3">
          <input
            type="checkbox"
            name="buyer"
            defaultChecked={roles.includes("buyer")}
            className="mt-1"
          />
          <span>
            <span className="block font-medium">{copy.roleBuyer}</span>
            <span className="text-sm text-muted">{copy.roleBuyerDesc}</span>
          </span>
        </label>
      </fieldset>

      {isFarmer ? (
        <div className="space-y-4 rounded-2xl border border-border bg-white p-4">
          <p className="text-sm font-medium">{copy.farmerLocation}</p>
          <Field label={copy.district}>
            <Select
              value={districtId || ""}
              onChange={(event) => selectDistrict(Number(event.target.value))}
            >
              {districts.map((district) => (
                <option key={district.id} value={district.id}>
                  {district.label ?? district.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={copy.mandal}>
            <Select
              value={mandalId || ""}
              onChange={(event) => selectMandal(Number(event.target.value))}
            >
              {filteredMandals.length === 0 ? (
                <option value="">{copy.selectMandalFirst}</option>
              ) : null}
              {filteredMandals.map((mandal) => (
                <option key={mandal.id} value={mandal.id}>
                  {mandal.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={copy.village}>
            <Select
              key={mandalId}
              name="village_id"
              value={villageId || ""}
              onChange={(event) => setVillageId(Number(event.target.value) || 0)}
              required
            >
              <option value="">{copy.selectLocation}</option>
              {filteredVillages.map((village) => (
                <option key={village.id} value={village.id}>
                  {village.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label={copy.aboutFarm}>
            <TextArea name="about" rows={3} defaultValue={farmerAbout ?? ""} />
          </Field>
        </div>
      ) : null}

      <PrimaryButton type="submit" disabled={pending} className="min-h-11 w-full sm:w-auto">
        {pending ? copy.saving : copy.continue}
      </PrimaryButton>
    </form>
  );
}
