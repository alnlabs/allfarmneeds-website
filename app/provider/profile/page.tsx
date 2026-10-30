import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ProviderProfileForm } from "@/components/provider-profile-form";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { safeInternalPath } from "@/lib/redirect";
import { createClient } from "@/utils/supabase/server";

async function ProviderProfileContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.roles.includes("service_provider")) {
    redirect("/onboarding/roles");
  }

  const params = await searchParams;
  const nextPath = safeInternalPath(params.next) || "/provider/listings";

  const supabase = await createClient();
  const [{ data: profile }, { data: contact }] = await Promise.all([
    supabase
      .from("provider_profiles")
      .select("business_name, about, logo_url, verification_status, show_contact_publicly")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("provider_private_contacts")
      .select("phone, whatsapp")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

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
          phone={contact?.phone ?? ""}
          whatsapp={contact?.whatsapp ?? ""}
          showContactPublicly={profile?.show_contact_publicly ?? false}
          nextPath={nextPath}
        />
      </Panel>
    </PageShell>
  );
}

export default function ProviderProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Provider profile" />}>
      <ProviderProfileContent searchParams={searchParams} />
    </Suspense>
  );
}
