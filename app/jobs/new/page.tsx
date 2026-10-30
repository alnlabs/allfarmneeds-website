import { Suspense } from "react";
import { redirect } from "next/navigation";
import { JobForm } from "@/components/job-form";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getJobFormOptions } from "@/lib/locations";

async function NewJobContent() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("farmer")) {
    redirect("/onboarding/roles?next=/jobs/new");
  }

  const options = await getJobFormOptions();

  return (
    <PageShell
      title="Post a farm job"
      subtitle="Describe the work, workers needed, pay and village. Published jobs wait for staff approval."
    >
      <Panel>
        <JobForm {...options} />
      </Panel>
    </PageShell>
  );
}

export default function NewJobPage() {
  return (
    <Suspense fallback={<PageFallback title="Post a farm job" />}>
      <NewJobContent />
    </Suspense>
  );
}
