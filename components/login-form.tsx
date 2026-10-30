"use client";

import { useActionState } from "react";
import {
  sendLoginCode,
  verifyLoginCode,
  type AuthActionState,
} from "@/app/actions/auth";
import { Field, Notice, PrimaryButton, TextInput } from "@/components/ui";

const initialState: AuthActionState = { step: "email" };

export function LoginForm() {
  const [sendState, sendAction, sendPending] = useActionState(
    sendLoginCode,
    initialState,
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyLoginCode,
    initialState,
  );

  const email = verifyState.email ?? sendState.email ?? "";
  const step = verifyState.step ?? sendState.step ?? "email";
  const error = verifyState.error ?? sendState.error;
  const success = sendState.success;

  return (
    <div className="space-y-6">
      {error ? <Notice tone="error">{error}</Notice> : null}
      {success ? <Notice tone="success">{success}</Notice> : null}

      {step === "email" ? (
        <form action={sendAction} className="space-y-4">
          <Field
            label="Email"
            hint="We will email a one-time code. Magic links also work if your project template includes them."
          >
            <TextInput
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              placeholder="you@example.com"
            />
          </Field>
          <PrimaryButton type="submit" disabled={sendPending}>
            {sendPending ? "Sending…" : "Send login code"}
          </PrimaryButton>
        </form>
      ) : (
        <form action={verifyAction} className="space-y-4">
          <input type="hidden" name="email" value={email} />
          <Field label="Email">
            <TextInput name="email_display" value={email} disabled readOnly />
          </Field>
          <Field label="One-time code" hint="Enter the 6-digit code from your email.">
            <TextInput
              id="token"
              name="token"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              placeholder="123456"
            />
          </Field>
          <PrimaryButton type="submit" disabled={verifyPending}>
            {verifyPending ? "Verifying…" : "Verify and continue"}
          </PrimaryButton>
        </form>
      )}
    </div>
  );
}
