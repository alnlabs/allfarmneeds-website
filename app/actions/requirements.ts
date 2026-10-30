"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";

export type RequirementActionState = {
  error?: string;
};

const UNITS = ["kg", "quintal", "tonne", "litre", "piece"] as const;

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export async function saveBuyerRequirement(
  _prev: RequirementActionState,
  formData: FormData,
): Promise<RequirementActionState> {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("buyer") && !user.roles.includes("retailer")) {
    redirect("/onboarding/roles?next=/buyers/new");
  }

  const requirementIdRaw = String(formData.get("requirement_id") ?? "").trim();
  const categoryId = Number(formData.get("category_id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const quantity = parseOptionalNumber(formData.get("quantity"));
  const quantityUnit = String(formData.get("quantity_unit") ?? "").trim() || null;
  const districtId = Number(formData.get("district_id") || 0) || null;
  const villageId = Number(formData.get("village_id") || 0) || null;
  const neededFrom = String(formData.get("needed_from") ?? "").trim() || null;
  const neededUntil = String(formData.get("needed_until") ?? "").trim() || null;
  const expectedPrice = parseOptionalNumber(formData.get("expected_price"));
  const priceUnit = String(formData.get("price_unit") ?? "").trim() || null;
  const qualityNotes = String(formData.get("quality_notes") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "draft").trim();

  if (!title || !categoryId) return { error: "Title and category are required." };
  if (!["draft", "published", "closed"].includes(status)) {
    return { error: "Invalid status." };
  }
  if (quantityUnit && !UNITS.includes(quantityUnit as (typeof UNITS)[number])) {
    return { error: "Invalid quantity unit." };
  }
  if (priceUnit && !UNITS.includes(priceUnit as (typeof UNITS)[number])) {
    return { error: "Invalid price unit." };
  }

  const supabase = await createClient();
  const payload = {
    category_id: categoryId,
    title,
    description,
    quantity,
    quantity_unit: quantityUnit,
    district_id: districtId,
    village_id: villageId,
    needed_from: neededFrom,
    needed_until: neededUntil,
    expected_price: expectedPrice,
    price_unit: priceUnit,
    quality_notes: qualityNotes,
    status,
    ...(status === "published" ? { moderation_status: "pending" as const } : {}),
  };

  if (requirementIdRaw) {
    const { error } = await supabase
      .from("buyer_requirements")
      .update(payload)
      .eq("id", Number(requirementIdRaw))
      .eq("buyer_id", user.id);
    if (error) return { error: error.message };
  } else {
    const { error } = await supabase.from("buyer_requirements").insert({
      buyer_id: user.id,
      ...payload,
      moderation_status: "pending",
    });
    if (error) return { error: error.message };
  }

  redirect("/buyer/requirements");
}

export async function createSellerResponse(
  _prev: RequirementActionState,
  formData: FormData,
): Promise<RequirementActionState> {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("farmer")) {
    redirect("/onboarding/roles?next=/buyers");
  }

  const requirementId = Number(formData.get("requirement_id"));
  const quantity = parseOptionalNumber(formData.get("quantity"));
  const quantityUnit = String(formData.get("quantity_unit") ?? "").trim() || null;
  const priceAmount = parseOptionalNumber(formData.get("price_amount"));
  const priceUnit = String(formData.get("price_unit") ?? "").trim() || null;
  const qualityNotes = String(formData.get("quality_notes") ?? "").trim();
  const deliveryNote = String(formData.get("delivery_note") ?? "").trim();

  if (!requirementId) return { error: "Requirement is required." };
  if (quantityUnit && !UNITS.includes(quantityUnit as (typeof UNITS)[number])) {
    return { error: "Invalid quantity unit." };
  }
  if (priceUnit && !UNITS.includes(priceUnit as (typeof UNITS)[number])) {
    return { error: "Invalid price unit." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("seller_responses").upsert(
    {
      requirement_id: requirementId,
      seller_id: user.id,
      quantity,
      quantity_unit: quantityUnit,
      price_amount: priceAmount,
      price_unit: priceUnit,
      quality_notes: qualityNotes,
      delivery_note: deliveryNote,
      status: "offered",
    },
    { onConflict: "requirement_id,seller_id" },
  );
  if (error) return { error: error.message };
  redirect(`/buyers/${requirementId}`);
}

export async function transitionSellerResponse(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const responseId = Number(formData.get("response_id"));
  const status = String(formData.get("status") ?? "").trim();
  const returnTo = String(formData.get("return_to") ?? "/buyer/requirements").trim();
  if (!responseId || !["accepted", "declined", "withdrawn"].includes(status)) {
    redirect(returnTo.startsWith("/") ? returnTo : "/buyer/requirements");
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from("seller_responses")
    .update({ status })
    .eq("id", responseId);
  if (error) {
    redirect(
      `${returnTo.startsWith("/") ? returnTo : "/buyer/requirements"}?error=${encodeURIComponent(error.message)}`,
    );
  }
  redirect(returnTo.startsWith("/") ? returnTo : "/buyer/requirements");
}

export async function moderateBuyerRequirement(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (
    !user.roles.includes("administrator") &&
    !user.roles.includes("moderator")
  ) {
    redirect("/");
  }

  const requirementId = Number(formData.get("requirement_id"));
  const decision = String(formData.get("decision") ?? "").trim();
  if (!requirementId || !["approved", "rejected"].includes(decision)) {
    redirect("/admin/buyers");
  }

  const supabase = await createClient();
  await supabase
    .from("buyer_requirements")
    .update({ moderation_status: decision })
    .eq("id", requirementId);
  redirect("/admin/buyers");
}
