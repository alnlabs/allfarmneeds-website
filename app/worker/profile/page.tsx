import { Suspense } from "react";
import { redirect } from "next/navigation";
import { WorkerProfileForm } from "@/components/worker-profile-form";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getJobFormOptions } from "@/lib/locations";
import { safeInternalPath } from "@/lib/redirect";
import { createClient } from "@/utils/supabase/server";

async function WorkerProfileContent({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("worker") && !user.roles.includes("labour_contractor")) {
    redirect("/onboarding/roles?next=/worker/profile");
  }

  const params = await searchParams;
  const nextPath = safeInternalPath(params.next) || "/jobs";
  const options = await getJobFormOptions();
  const supabase = await createClient();
  const [{ data: profile }, { data: skills }] = await Promise.all([
    supabase
      .from("worker_profiles")
      .select("village_id, experience, expected_compensation, availability")
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("worker_skills")
      .select("job_category_id")
      .eq("user_id", user.id),
  ]);

  return (
    <PageShell
      title="Worker profile"
      subtitle="Tell farmers where you work and which skills you offer."
    >
      <Panel>
        <WorkerProfileForm
          {...options}
          villageId={profile?.village_id}
          experience={profile?.experience ?? ""}
          expectedCompensation={profile?.expected_compensation ?? ""}
          availability={profile?.availability ?? ""}
          skillIds={(skills ?? []).map((row) => row.job_category_id)}
          nextPath={nextPath}
        />
      </Panel>
    </PageShell>
  );
}

export default function WorkerProfilePage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Worker profile" />}>
      <WorkerProfileContent searchParams={searchParams} />
    </Suspense>
  );
}
