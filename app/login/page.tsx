import { Suspense } from "react";
import { redirect } from "next/navigation";
import { LoginForm } from "@/components/login-form";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";

async function LoginContent({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const user = await requireUser();
  if (user) {
    redirect(user.roles.length ? "/services" : "/onboarding/roles");
  }

  const params = await searchParams;

  return (
    <PageShell
      title="Sign in"
      subtitle="Use your email for a one-time login code. Magic links also work when your Auth email template includes them."
    >
      <Panel>
        {params.error ? (
          <p className="mb-4 text-sm text-red-700">
            Sign-in link expired or invalid. Request a new code.
          </p>
        ) : null}
        <LoginForm />
      </Panel>
    </PageShell>
  );
}

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Sign in" />}>
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}
