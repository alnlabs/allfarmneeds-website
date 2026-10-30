"use client";

import { useActionState, useState } from "react";
import { saveRoles, type RoleActionState } from "@/app/actions/roles";
import { LocationCascade } from "@/components/location-cascade";
import { useLocale } from "@/components/locale-provider";
import type { AppRole } from "@/lib/auth";
import type {
  LocationDistrict,
  LocationMandal,
  LocationVillage,
} from "@/lib/location-ui";
import { Field, Notice, PrimaryButton, TextArea, TextInput } from "@/components/ui";

const initialState: RoleActionState = {};

export function RolesForm({
  displayName,
  roles,
  nextPath = "/profile",
  districts,
  mandals,
  farmerVillageId,
  farmerDistrictId,
  farmerMandalId,
  farmerVillages = [],
  farmerAbout,
}: {
  displayName: string;
  roles: AppRole[];
  nextPath?: string;
  districts: LocationDistrict[];
  mandals: LocationMandal[];
  farmerVillageId?: number | null;
  farmerDistrictId?: number | null;
  farmerMandalId?: number | null;
  farmerVillages?: LocationVillage[];
  farmerAbout?: string;
}) {
  const { copy } = useLocale();
  const [state, action, pending] = useActionState(saveRoles, initialState);
  const [isFarmer, setIsFarmer] = useState(roles.includes("farmer"));

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
          <LocationCascade
            districts={districts}
            mandals={mandals}
            initialVillageId={farmerVillageId}
            initialDistrictId={farmerDistrictId}
            initialMandalId={farmerMandalId}
            initialVillages={farmerVillages}
            labels={{
              district: copy.district,
              mandal: copy.mandal,
              village: copy.village,
              selectLocation: copy.selectLocation,
              selectMandalFirst: copy.selectMandalFirst,
            }}
          />
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
