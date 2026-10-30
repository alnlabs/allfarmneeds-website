import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ListingForm } from "@/components/listing-form";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getListingFormOptions } from "@/lib/locations";
import { createClient } from "@/utils/supabase/server";

async function NewListingContent() {
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
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!profile) {
    redirect("/provider/profile");
  }

  const options = await getListingFormOptions();

  return (
    <PageShell
      title="New service listing"
      subtitle="Publish only after you confirm the details. Farmers will see published listings."
    >
      <Panel>
        <ListingForm {...options} />
      </Panel>
    </PageShell>
  );
}

export default function NewListingPage() {
  return (
    <Suspense fallback={<PageFallback title="New service listing" />}>
      <NewListingContent />
    </Suspense>
  );
}
