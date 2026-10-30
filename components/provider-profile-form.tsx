"use client";

import { useActionState } from "react";
import {
  saveProviderProfile,
  type ProviderActionState,
} from "@/app/actions/provider";
import { Field, Notice, PrimaryButton, TextArea, TextInput } from "@/components/ui";

const initialState: ProviderActionState = {};

export function ProviderProfileForm({
  businessName,
  about,
  logoUrl,
}: {
  businessName: string;
  about: string;
  logoUrl: string;
}) {
  const [state, action, pending] = useActionState(saveProviderProfile, initialState);

  return (
    <form action={action} className="space-y-4">
      {state.error ? <Notice tone="error">{state.error}</Notice> : null}
      <Field label="Business name">
        <TextInput
          name="business_name"
          required
          defaultValue={businessName}
          placeholder="Ravi Tractor Services"
        />
      </Field>
      <Field label="About your services">
        <TextArea
          name="about"
          rows={5}
          defaultValue={about}
          placeholder="Villages you cover, machines you own, working hours…"
        />
      </Field>
      <Field label="Logo URL" hint="Optional for now. Upload support comes later.">
        <TextInput name="logo_url" defaultValue={logoUrl} placeholder="https://…" />
      </Field>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save provider profile"}
      </PrimaryButton>
    </form>
  );
}
