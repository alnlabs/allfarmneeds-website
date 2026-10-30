import { Suspense } from "react";
import { redirect } from "next/navigation";
import { BuyerProfileForm } from "@/components/buyer-profile-form";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getTgApLocationOptions } from "@/lib/locations";
import { safeInternalPath } from "@/lib/redirect";
import { createClient } from "@/utils/supabase/server";

async function BuyerProfileContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("buyer") && !user.roles.includes("retailer")) {
    redirect("/onboarding/roles?next=/buyer/profile");
  }

  const params = await searchParams;
  const next = safeInternalPath(params.next);
  const supabase = await createClient();
  const [{ data: profile }, { data: areas }, locations] = await Promise.all([
    supabase
      .from("buyer_profiles")
      .select("business_name, business_type, about")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("buyer_operating_areas")
      .select("district_id")
      .eq("buyer_id", user.id),
    getTgApLocationOptions(),
  ]);

  return (
    <PageShell
      title="Buyer profile"
      subtitle="Tell farmers what you buy and where you operate."
    >
      <Panel>
        <BuyerProfileForm
          districts={locations.districts}
          nextPath={next === "/" ? "/buyer/requirements" : next}
          initial={{
            business_name: profile?.business_name ?? "",
            business_type: profile?.business_type ?? "individual",
            about: profile?.about ?? "",
            district_ids: (areas ?? [])
              .map((area) => area.district_id)
              .filter((id): id is number => id != null),
          }}
        />
      </Panel>
    </PageShell>
  );
}

export default function BuyerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Buyer profile" />}>
      <BuyerProfileContent searchParams={searchParams} />
    </Suspense>
  );
}
