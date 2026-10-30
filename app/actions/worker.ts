"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";
import { safeInternalPath } from "@/lib/redirect";

export type WorkerActionState = {
  error?: string;
};

export async function saveWorkerProfile(
  _prev: WorkerActionState,
  formData: FormData,
): Promise<WorkerActionState> {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("worker") && !user.roles.includes("labour_contractor")) {
    redirect("/onboarding/roles");
  }

  const villageId = Number(formData.get("village_id") || 0) || null;
  const experience = String(formData.get("experience") ?? "").trim();
  const expectedCompensation = String(
    formData.get("expected_compensation") ?? "",
  ).trim();
  const availability = String(formData.get("availability") ?? "").trim();
  const skillIds = formData
    .getAll("skill_ids")
    .map((value) => Number(value))
    .filter((id) => Number.isFinite(id) && id > 0);
  const next = safeInternalPath(String(formData.get("next") ?? ""));

  const supabase = await createClient();
  const { error } = await supabase.from("worker_profiles").upsert({
    user_id: user.id,
    village_id: villageId,
    experience,
    expected_compensation: expectedCompensation,
    availability,
  });
  if (error) return { error: error.message };

  await supabase.from("worker_skills").delete().eq("user_id", user.id);
  if (skillIds.length > 0) {
    const { error: skillsError } = await supabase.from("worker_skills").insert(
      skillIds.map((job_category_id) => ({
        user_id: user.id,
        job_category_id,
      })),
    );
    if (skillsError) return { error: skillsError.message };
  }

  redirect(next === "/" ? "/jobs" : next);
}
