"use client";

import { useActionState } from "react";
import { saveRoles, type RoleActionState } from "@/app/actions/roles";
import type { AppRole } from "@/lib/auth";
import { Field, Notice, PrimaryButton, TextInput } from "@/components/ui";

const initialState: RoleActionState = {};

export function RolesForm({
  displayName,
  roles,
}: {
  displayName: string;
  roles: AppRole[];
}) {
  const [state, action, pending] = useActionState(saveRoles, initialState);

  return (
    <form action={action} className="space-y-5">
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label="Your name">
        <TextInput
          name="display_name"
          defaultValue={displayName}
          placeholder="Farmer or business name"
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
          />
          <span>
            <span className="block font-medium">Farmer</span>
            <span className="text-sm text-muted">
              Find agricultural services near your village.
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
      </fieldset>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Continue"}
      </PrimaryButton>
    </form>
  );
}
