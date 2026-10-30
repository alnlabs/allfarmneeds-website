"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";
import { safeInternalPath } from "@/lib/redirect";

export type ReviewActionState = {
  error?: string;
};

const ENTITY_TYPES = ["service_booking", "job_application", "product_deal"] as const;

export async function submitReview(
  _prev: ReviewActionState,
  formData: FormData,
): Promise<ReviewActionState> {
  const user = await requireUser();
  if (!user) redirect("/login");

  const entityType = String(formData.get("entity_type") ?? "").trim();
  const entityId = Number(formData.get("entity_id"));
  const revieweeId = String(formData.get("reviewee_id") ?? "").trim();
  const rating = Number(formData.get("rating"));
  const comment = String(formData.get("comment") ?? "").trim();
  const returnTo = safeInternalPath(String(formData.get("return_to") ?? "/"));

  if (!ENTITY_TYPES.includes(entityType as (typeof ENTITY_TYPES)[number])) {
    return { error: "Invalid review target." };
  }
  if (!entityId || !revieweeId) return { error: "Missing review details." };
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { error: "Choose a rating from 1 to 5." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("reviews").insert({
    reviewer_id: user.id,
    reviewee_id: revieweeId,
    entity_type: entityType,
    entity_id: entityId,
    rating,
    comment,
    status: "visible",
  });
  if (error) return { error: error.message };

  redirect(returnTo);
}

export async function moderateReview(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (
    !user.roles.includes("administrator") &&
    !user.roles.includes("moderator")
  ) {
    redirect("/");
  }

  const reviewId = Number(formData.get("review_id"));
  const status = String(formData.get("status") ?? "").trim();
  if (!reviewId || !["visible", "hidden"].includes(status)) {
    redirect("/admin/reviews");
  }

  const supabase = await createClient();
  await supabase.from("reviews").update({ status }).eq("id", reviewId);
  redirect("/admin/reviews");
}
