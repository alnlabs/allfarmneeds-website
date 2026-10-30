import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { t } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { pathAfterRoles, safeInternalPath } from "@/lib/redirect";

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; message?: string }>;
}) {
  const params = await searchParams;
  const next = safeInternalPath(params.next);
  const { locale } = await getRequestLocale();
  const copy = t(locale);

  const user = await requireUser();
  if (user) {
    redirect(
      user.roles.length
        ? pathAfterRoles(user.roles, next)
        : `/onboarding/roles?next=${encodeURIComponent(next)}`,
    );
  }

  const errorText =
    params.error === "google"
      ? params.message ||
        (locale === "te"
          ? "Google సైన్-ఇన్ ఇంకా కాన్ఫిగర్ కాలేదు. Supabase Authలో Google ప్రొవైడర్ ఆన్ చేయండి."
          : "Google sign-in is not configured yet. Enable the Google provider in Supabase Auth.")
      : params.error
        ? locale === "te"
          ? "సైన్-ఇన్ విఫలమైంది లేదా గడువు ముగిసింది. Google మళ్లీ ప్రయత్నించండి లేదా కొత్త ఇమెయిల్ కోడ్ అడగండి."
          : "Sign-in failed or expired. Try Google again or request a new email code."
        : null;

  return (
    <PageShell title={copy.loginTitle} subtitle={copy.loginSubtitle}>
      <Panel>
        {errorText ? (
          <p className="mb-4 text-sm text-red-700">{errorText}</p>
        ) : null}
        <LoginForm nextPath={next} />
      </Panel>
    </PageShell>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; message?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Sign in" />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}
