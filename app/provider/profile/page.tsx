import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ProviderProfileForm } from "@/components/provider-profile-form";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function ProviderProfileContent() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.roles.includes("service_provider")) {
    redirect("/onboarding/roles");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("provider_profiles")
    .select("business_name, about, logo_url, verification_status")
    .eq("user_id", user.id)
    .maybeSingle();

  return (
    <PageShell
      title="Provider profile"
      subtitle={`Verification: ${profile?.verification_status ?? "unverified"}. Business verification is handled by admins.`}
    >
      <Panel>
        <ProviderProfileForm
          businessName={profile?.business_name ?? ""}
          about={profile?.about ?? ""}
          logoUrl={profile?.logo_url ?? ""}
        />
      </Panel>
    </PageShell>
  );
}

export default function ProviderProfilePage() {
  return (
    <Suspense fallback={<PageFallback title="Provider profile" />}>
      <ProviderProfileContent />
    </Suspense>
  );
}
