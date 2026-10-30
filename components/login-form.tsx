"use client";

import { useActionState } from "react";
import {
  sendLoginCode,
  signInWithGoogle,
  verifyLoginCode,
  type AuthActionState,
} from "@/app/actions/auth";
import { Field, Notice, PrimaryButton, TextInput } from "@/components/ui";

const initialState: AuthActionState = { step: "email" };

export function LoginForm({ nextPath = "/services" }: { nextPath?: string }) {
  const [sendState, sendAction, sendPending] = useActionState(
    sendLoginCode,
    { ...initialState, next: nextPath },
  );
  const [verifyState, verifyAction, verifyPending] = useActionState(
    verifyLoginCode,
    { ...initialState, next: nextPath },
  );

  const email = verifyState.email ?? sendState.email ?? "";
  const step = verifyState.step ?? sendState.step ?? "email";
  const error = verifyState.error ?? sendState.error;
  const success = sendState.success;
  const next = verifyState.next ?? sendState.next ?? nextPath;

  return (
    <div className="space-y-6">
      {error ? <Notice tone="error">{error}</Notice> : null}
      {success ? <Notice tone="success">{success}</Notice> : null}

      {step === "email" ? (
        <>
          <form action={signInWithGoogle}>
            <input type="hidden" name="next" value={next} />
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-white px-4 py-2.5 font-medium hover:bg-accent-soft"
            >
              <GoogleMark />
              Continue with Google
            </button>
          </form>

          <div className="flex items-center gap-3 text-sm text-muted">
            <span className="h-px flex-1 bg-border" />
            or use email
            <span className="h-px flex-1 bg-border" />
          </div>

          <form action={sendAction} className="space-y-4">
            <input type="hidden" name="next" value={next} />
            <Field
              label="Email"
              hint="We will email a one-time code. Magic links also work when your Auth template includes them."
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
        </>
      ) : (
        <form action={verifyAction} className="space-y-4">
          <input type="hidden" name="email" value={email} />
          <input type="hidden" name="next" value={next} />
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

function GoogleMark() {
  return (
    <svg aria-hidden="true" width="18" height="18" viewBox="0 0 48 48">
      <path
        fill="#FFC107"
        d="M43.6 20.5H42V20H24v8h11.3C33.7 32.7 29.3 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
      />
      <path
        fill="#FF3D00"
        d="M6.3 14.7l6.6 4.8C14.7 16.1 19 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.2 6.1 29.4 4 24 4 16.1 4 9.2 8.5 6.3 14.7z"
      />
      <path
        fill="#4CAF50"
        d="M24 44c5.2 0 9.9-2 13.4-5.2l-6.2-5.2C29.3 35.3 26.8 36 24 36c-5.3 0-9.7-3.3-11.3-8l-6.5 5C9.1 39.5 16 44 24 44z"
      />
      <path
        fill="#1976D2"
        d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.6l.1-.1 6.2 5.2C39.2 36.3 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"
      />
    </svg>
  );
}
