import { Suspense } from "react";
import { redirect } from "next/navigation";
import { updateReportStatus } from "@/app/actions/reports";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel, PrimaryButton, SecondaryButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function AdminReportsContent() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (
    !user.roles.includes("administrator") &&
    !user.roles.includes("moderator")
  ) {
    redirect("/");
  }

  const supabase = await createClient();
  const { data: reports, error } = await supabase
    .from("reports")
    .select(
      `
      id,
      target_type,
      target_id,
      reason,
      status,
      created_at,
      profiles!reports_reporter_id_fkey(display_name)
    `,
    )
    .order("created_at", { ascending: false })
    .limit(100);

  return (
    <PageShell
      title="Reports queue"
      subtitle="Review user reports for listings, jobs, products, requirements and profiles."
    >
      {error ? <p className="text-red-700">{error.message}</p> : null}
      <div className="space-y-3">
        {(reports ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">No reports yet.</p>
          </Panel>
        ) : (
          reports?.map((report) => {
            const reporter = Array.isArray(report.profiles)
              ? report.profiles[0]
              : report.profiles;
            return (
              <Panel key={report.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="text-sm text-muted">
                      {report.target_type} #{report.target_id} · {report.status} ·{" "}
                      {new Date(report.created_at).toLocaleString()}
                    </p>
                    <p className="mt-1 text-sm">
                      Reporter: {reporter?.display_name ?? "User"}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap">{report.reason}</p>
                  </div>
                  {report.status === "open" ? (
                    <div className="flex flex-wrap gap-2">
                      <form action={updateReportStatus}>
                        <input type="hidden" name="report_id" value={report.id} />
                        <input type="hidden" name="status" value="reviewed" />
                        <PrimaryButton type="submit">Mark reviewed</PrimaryButton>
                      </form>
                      <form action={updateReportStatus}>
                        <input type="hidden" name="report_id" value={report.id} />
                        <input type="hidden" name="status" value="dismissed" />
                        <SecondaryButton type="submit">Dismiss</SecondaryButton>
                      </form>
                    </div>
                  ) : null}
                </div>
              </Panel>
            );
          })
        )}
      </div>
    </PageShell>
  );
}

export default function AdminReportsPage() {
  return (
    <Suspense fallback={<PageFallback title="Reports queue" />}>
      <AdminReportsContent />
    </Suspense>
  );
}
