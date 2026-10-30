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
  const initialVillage = villages.find((v) => v.id === farmerVillageId);
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
              value={districtId}
              onChange={(event) => {
                const nextDistrict = Number(event.target.value);
                setDistrictId(nextDistrict);
                const nextMandal =
                  mandals.find((m) => m.district_id === nextDistrict)?.id ?? 0;
                setMandalId(nextMandal);
              }}
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
          <Field label={copy.village}>
            <Select
              name="village_id"
              defaultValue={farmerVillageId ?? filteredVillages[0]?.id ?? ""}
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
