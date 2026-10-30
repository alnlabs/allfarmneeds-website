import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { safeInternalPath } from "@/lib/redirect";

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string; message?: string }>;
}) {
  const params = await searchParams;
  const next = safeInternalPath(params.next);

  const user = await requireUser();
  if (user) {
    redirect(
      user.roles.length
        ? next
        : `/onboarding/roles?next=${encodeURIComponent(next)}`,
    );
  }

  const errorText =
    params.error === "google"
      ? params.message ||
        "Google sign-in is not configured yet. Enable the Google provider in Supabase Auth."
      : params.error
        ? "Sign-in failed or expired. Try Google again or request a new email code."
        : null;

  return (
    <PageShell
      title="Sign in"
      subtitle="Continue with Google, or use email for a one-time login code."
    >
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
