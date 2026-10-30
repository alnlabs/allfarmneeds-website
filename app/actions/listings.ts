"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";

export type ListingActionState = {
  error?: string;
  success?: string;
};

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

export async function saveListing(
  _prev: ListingActionState,
  formData: FormData,
): Promise<ListingActionState> {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.roles.includes("service_provider")) {
    redirect("/onboarding/roles");
  }

  const listingId = String(formData.get("listing_id") ?? "").trim();
  const categoryId = Number(formData.get("category_id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const priceAmount = parseOptionalNumber(formData.get("price_amount"));
  const priceUnit = String(formData.get("price_unit") ?? "").trim() || null;
  const minimumBooking = String(formData.get("minimum_booking") ?? "").trim() || null;
  const availabilityNote =
    String(formData.get("availability_note") ?? "").trim() || null;
  const travelChargeNote =
    String(formData.get("travel_charge_note") ?? "").trim() || null;
  const status = String(formData.get("status") ?? "draft").trim();
  const areaType = String(formData.get("area_type") ?? "district");
  const areaId = Number(formData.get("area_id"));

  if (!title || !categoryId) {
    return { error: "Title and category are required." };
  }
  if (!["draft", "published", "paused", "closed"].includes(status)) {
    return { error: "Invalid status." };
  }
  if (!areaId) {
    return { error: "Choose a service area." };
  }

  const areaPayload =
    areaType === "village"
      ? { village_id: areaId, mandal_id: null, district_id: null }
      : areaType === "mandal"
        ? { mandal_id: areaId, village_id: null, district_id: null }
        : { district_id: areaId, mandal_id: null, village_id: null };

  const supabase = await createClient();
  const payload = {
    provider_id: user.id,
    category_id: categoryId,
    title,
    description,
    price_amount: priceAmount,
    price_unit: priceUnit,
    minimum_booking: minimumBooking,
    availability_note: availabilityNote,
    travel_charge_note: travelChargeNote,
    status,
  };

  let savedId = listingId ? Number(listingId) : null;

  if (savedId) {
    const { data: existing, error: existingError } = await supabase
      .from("service_listings")
      .select("id")
      .eq("id", savedId)
      .eq("provider_id", user.id)
      .maybeSingle();

    if (existingError || !existing) {
      return { error: existingError?.message ?? "Listing not found." };
    }

    const { error } = await supabase
      .from("service_listings")
      .update(payload)
      .eq("id", savedId)
      .eq("provider_id", user.id);

    if (error) {
      return { error: error.message };
    }

    await supabase.from("service_listing_areas").delete().eq("listing_id", savedId);
  } else {
    const { data, error } = await supabase
      .from("service_listings")
      .insert(payload)
      .select("id")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Could not create listing." };
    }
    savedId = data.id;
  }

  const { error: areaError } = await supabase.from("service_listing_areas").insert({
    listing_id: savedId,
    ...areaPayload,
  });

  if (areaError) {
    return { error: areaError.message };
  }

  redirect("/provider/listings");
}

export async function deleteListing(formData: FormData) {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const listingId = Number(formData.get("listing_id"));
  if (!listingId) {
    redirect("/provider/listings");
  }

  const supabase = await createClient();
  await supabase
    .from("service_listings")
    .delete()
    .eq("id", listingId)
    .eq("provider_id", user.id);

  redirect("/provider/listings");
}
