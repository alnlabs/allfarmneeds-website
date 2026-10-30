import { Suspense } from "react";
import { redirect } from "next/navigation";
import { RolesForm } from "@/components/roles-form";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getListingFormOptions } from "@/lib/locations";
import { safeInternalPath } from "@/lib/redirect";
import { createClient } from "@/utils/supabase/server";

async function RolesContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const params = await searchParams;
  const next = safeInternalPath(params.next);
  const supabase = await createClient();
  const [{ data: profile }, { data: farmer }, options] = await Promise.all([
    supabase.from("profiles").select("display_name").eq("id", user.id).maybeSingle(),
    supabase
      .from("farmer_profiles")
      .select("village_id, about")
      .eq("user_id", user.id)
      .maybeSingle(),
    getListingFormOptions(),
  ]);

  return (
    <PageShell
      title="Choose your roles"
      subtitle="One account can hold farmer, worker, provider, and buyer roles."
    >
      <Panel>
        <RolesForm
          displayName={profile?.display_name ?? ""}
          roles={user.roles}
          nextPath={next}
          districts={options.districts}
          mandals={options.mandals}
          villages={options.villages}
          farmerVillageId={farmer?.village_id}
          farmerAbout={farmer?.about ?? ""}
        />
      </Panel>
    </PageShell>
  );
}

export default function RolesPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Choose your roles" />}>
      <RolesContent searchParams={searchParams} />
    </Suspense>
  );
}
