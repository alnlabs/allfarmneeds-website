"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";

export type JobActionState = {
  error?: string;
};

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export async function saveFarmJob(
  _prev: JobActionState,
  formData: FormData,
): Promise<JobActionState> {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("farmer")) {
    redirect("/onboarding/roles?next=/jobs/new");
  }

  const jobIdRaw = String(formData.get("job_id") ?? "").trim();
  const categoryId = Number(formData.get("category_id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const workersRequired = Number(formData.get("workers_required") || 0);
  const villageId = Number(formData.get("village_id") || 0) || null;
  const workDate = String(formData.get("work_date") ?? "").trim() || null;
  const paymentModel = String(formData.get("payment_model") ?? "").trim() || null;
  const advertisedAmount = parseOptionalNumber(formData.get("advertised_amount"));
  const foodWater = String(formData.get("food_water_accommodation") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "draft").trim();

  if (!title || !categoryId) {
    return { error: "Title and category are required." };
  }
  if (!workersRequired || workersRequired < 1) {
    return { error: "Workers required must be at least 1." };
  }
  if (!["draft", "published", "filled", "closed", "cancelled"].includes(status)) {
    return { error: "Invalid status." };
  }

  const supabase = await createClient();
  const payload = {
    farmer_id: user.id,
    category_id: categoryId,
    title,
    description,
    workers_required: workersRequired,
    village_id: villageId,
    work_date: workDate,
    payment_model: paymentModel,
    advertised_amount: advertisedAmount,
    food_water_accommodation: foodWater,
    status,
    moderation_status: status === "published" ? ("pending" as const) : ("pending" as const),
  };

  if (jobIdRaw) {
    const jobId = Number(jobIdRaw);
    const { error } = await supabase
      .from("farm_jobs")
      .update({
        ...payload,
        ...(status === "published" ? { moderation_status: "pending" } : {}),
      })
      .eq("id", jobId)
      .eq("farmer_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("farm_jobs").insert({
      ...payload,
      moderation_status: status === "published" ? "pending" : "pending",
    });
    if (error) return { error: error.message };
  }

  redirect("/farmer/jobs");
}

export async function applyToJob(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("worker") && !user.roles.includes("labour_contractor")) {
    redirect("/onboarding/roles?next=/jobs");
  }

  const jobId = Number(formData.get("job_id"));
  const note = String(formData.get("note") ?? "").trim();
  if (!jobId) redirect("/jobs");

  const supabase = await createClient();
  const { data: workerProfile } = await supabase
    .from("worker_profiles")
    .select("user_id")
    .eq("user_id", user.id)
    .maybeSingle();
  if (!workerProfile) {
    redirect("/worker/profile");
  }

  const { error } = await supabase.from("job_applications").insert({
    job_id: jobId,
    worker_id: user.id,
    note,
    status: "submitted",
  });

  if (error) {
    redirect(`/jobs/${jobId}?error=${encodeURIComponent(error.message)}`);
  }

  redirect("/worker/applications");
}

export async function updateApplicationStatus(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const applicationId = Number(formData.get("application_id"));
  const status = String(formData.get("status") ?? "").trim();
  const returnTo = String(formData.get("return_to") ?? "/farmer/jobs").trim();
  if (!applicationId || !status) {
    redirect(returnTo.startsWith("/") ? returnTo : "/farmer/jobs");
  }

  const supabase = await createClient();
  await supabase
    .from("job_applications")
    .update({ status })
    .eq("id", applicationId);

  redirect(returnTo.startsWith("/") ? returnTo : "/farmer/jobs");
}

export async function moderateFarmJob(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (
    !user.roles.includes("administrator") &&
    !user.roles.includes("moderator")
  ) {
    redirect("/");
  }

  const jobId = Number(formData.get("job_id"));
  const decision = String(formData.get("decision") ?? "").trim();
  if (!jobId || !["approved", "rejected"].includes(decision)) {
    redirect("/admin/jobs");
  }

  const supabase = await createClient();
  await supabase
    .from("farm_jobs")
    .update({ moderation_status: decision })
    .eq("id", jobId);

  redirect("/admin/jobs");
}
