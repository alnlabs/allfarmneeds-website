"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";
import { safeInternalPath } from "@/lib/redirect";

export type ReportActionState = {
  error?: string;
  success?: string;
};

const TARGET_TYPES = [
  "profile",
  "service_listing",
  "farm_job",
  "product_listing",
  "buyer_requirement",
  "enquiry",
] as const;

export async function submitReport(
  _prev: ReportActionState,
  formData: FormData,
): Promise<ReportActionState> {
  const user = await requireUser();
  if (!user) redirect("/login");

  const targetType = String(formData.get("target_type") ?? "").trim();
  const targetId = String(formData.get("target_id") ?? "").trim();
  const reason = String(formData.get("reason") ?? "").trim();
  const returnTo = safeInternalPath(String(formData.get("return_to") ?? "/"));

  if (!TARGET_TYPES.includes(targetType as (typeof TARGET_TYPES)[number])) {
    return { error: "Invalid report target." };
  }
  if (!targetId || reason.length < 8) {
    return { error: "Please describe the issue (at least 8 characters)." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reports").insert({
    reporter_id: user.id,
    target_type: targetType,
    target_id: targetId,
    reason,
    status: "open",
  });
  if (error) return { error: error.message };

  redirect(`${returnTo}?reported=1`);
}

export async function updateReportStatus(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (
    !user.roles.includes("administrator") &&
    !user.roles.includes("moderator")
  ) {
    redirect("/");
  }

  const reportId = Number(formData.get("report_id"));
  const status = String(formData.get("status") ?? "").trim();
  if (!reportId || !["reviewed", "dismissed", "open"].includes(status)) {
    redirect("/admin/reports");
  }

  const supabase = await createClient();
  await supabase.from("reports").update({ status }).eq("id", reportId);
  redirect("/admin/reports");
}
