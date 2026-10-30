"use client";

import { useActionState, useMemo, useState } from "react";
import { saveRoles, type RoleActionState } from "@/app/actions/roles";
import type { AppRole } from "@/lib/auth";
import { Field, Notice, PrimaryButton, Select, TextArea, TextInput } from "@/components/ui";

const initialState: RoleActionState = {};

type District = { id: number; name: string; label?: string };
type Mandal = { id: number; name: string; district_id: number };
type Village = { id: number; name: string; mandal_id: number };

export function RolesForm({
  displayName,
  roles,
  nextPath = "/services",
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
      <Field label="Your name">
        <TextInput
          name="display_name"
          defaultValue={displayName}
          placeholder="Farmer or business name"
          required
        />
      </Field>
      <fieldset className="space-y-3">
        <legend className="text-sm font-medium">How will you use AllFarmNeeds?</legend>
        <label className="flex items-start gap-3 rounded-xl border border-border bg-white p-3">
          <input
            type="checkbox"
            name="farmer"
            defaultChecked={roles.includes("farmer")}
            className="mt-1"
            onChange={(event) => setIsFarmer(event.target.checked)}
          />
          <span>
            <span className="block font-medium">Farmer</span>
            <span className="text-sm text-muted">
              Find services, post farm jobs, and sell produce on the crop marketplace.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-border bg-white p-3">
          <input
            type="checkbox"
            name="worker"
            defaultChecked={roles.includes("worker")}
            className="mt-1"
          />
          <span>
            <span className="block font-medium">Farm worker</span>
            <span className="text-sm text-muted">
              Browse farm jobs and apply for paid work near your village.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-border bg-white p-3">
          <input
            type="checkbox"
            name="service_provider"
            defaultChecked={roles.includes("service_provider")}
            className="mt-1"
          />
          <span>
            <span className="block font-medium">Service provider</span>
            <span className="text-sm text-muted">
              Publish tractor, labour, irrigation and other farm services.
            </span>
          </span>
        </label>
        <label className="flex items-start gap-3 rounded-xl border border-border bg-white p-3">
          <input
            type="checkbox"
            name="buyer"
            defaultChecked={roles.includes("buyer")}
            className="mt-1"
          />
          <span>
            <span className="block font-medium">Buyer / trader</span>
            <span className="text-sm text-muted">
              Reserve approved crop listings and manage deals with sellers.
            </span>
          </span>
        </label>
      </fieldset>

      {isFarmer ? (
        <div className="space-y-4 rounded-2xl border border-border bg-white p-4">
          <p className="text-sm font-medium">Farmer location</p>
          <Field label="District">
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
            <Select
              name="village_id"
              defaultValue={farmerVillageId ?? filteredVillages[0]?.id ?? ""}
            >
              <option value="">Select location</option>
              {filteredVillages.map((village) => (
                <option key={village.id} value={village.id}>
                  {village.name}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="About your farm (optional)">
            <TextArea name="about" rows={3} defaultValue={farmerAbout ?? ""} />
          </Field>
        </div>
      ) : null}

      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Continue"}
      </PrimaryButton>
    </form>
  );
}
