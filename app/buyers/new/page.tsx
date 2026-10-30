import { Suspense } from "react";
import { redirect } from "next/navigation";
import { RequirementForm } from "@/components/requirement-form";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getProductFormOptions } from "@/lib/locations";
import { createClient } from "@/utils/supabase/server";

async function NewRequirementContent() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("buyer") && !user.roles.includes("retailer")) {
    redirect("/onboarding/roles?next=/buyers/new");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("buyer_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!profile) {
    redirect("/buyer/profile?next=/buyers/new");
  }

  const options = await getProductFormOptions();
  return (
    <PageShell
      title="Post purchase requirement"
      subtitle="Tell sellers what produce you need. Staff approve before farmers can offer supply."
    >
      <Panel>
        <RequirementForm {...options} />
      </Panel>
    </PageShell>
  );
}

export default function NewRequirementPage() {
  return (
    <Suspense fallback={<PageFallback title="Post purchase requirement" />}>
      <NewRequirementContent />
    </Suspense>
  );
}
