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
  phone,
  whatsapp,
  showContactPublicly,
  nextPath = "/provider/listings",
}: {
  businessName: string;
  about: string;
  logoUrl: string;
  phone: string;
  whatsapp: string;
  showContactPublicly: boolean;
  nextPath?: string;
}) {
  const [state, action, pending] = useActionState(saveProviderProfile, initialState);

  return (
    <form action={action} className="space-y-4">
      <input type="hidden" name="next" value={nextPath} />
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
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Phone" hint="Used for Call button when you make contact public.">
          <TextInput
            name="phone"
            type="tel"
            defaultValue={phone}
            placeholder="+91 9xxxxxxxxx"
          />
        </Field>
        <Field label="WhatsApp" hint="Defaults to phone if left blank on the listing page.">
          <TextInput
            name="whatsapp"
            type="tel"
            defaultValue={whatsapp}
            placeholder="+91 9xxxxxxxxx"
          />
        </Field>
      </div>
      <label className="flex items-start gap-3 rounded-xl border border-border bg-white p-3 text-sm">
        <input
          type="checkbox"
          name="show_contact_publicly"
          defaultChecked={showContactPublicly}
          className="mt-1"
        />
        <span>
          <span className="block font-medium">Show Call and WhatsApp on my listings</span>
          <span className="text-muted">
            Leave unchecked to receive booking requests and enquiries only.
          </span>
        </span>
      </label>
      <Field label="Logo URL" hint="Optional. Image upload for logos can be added later.">
        <TextInput name="logo_url" defaultValue={logoUrl} placeholder="https://…" />
      </Field>
      <PrimaryButton type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save provider profile"}
      </PrimaryButton>
    </form>
  );
}
