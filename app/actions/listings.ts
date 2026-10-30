"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";

export type ListingActionState = {
  error?: string;
  success?: string;
};

type AreaRow = {
  district_id: number | null;
  mandal_id: number | null;
  village_id: number | null;
};

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

function parseAreas(formData: FormData): AreaRow[] {
  const tokens = formData
    .getAll("areas")
    .map((value) => String(value).trim())
    .filter(Boolean);

  const areas: AreaRow[] = [];
  const seen = new Set<string>();

  for (const token of tokens) {
    const [type, idText] = token.split(":");
    const id = Number(idText);
    if (!id || !["district", "mandal", "village"].includes(type)) {
      continue;
    }
    if (seen.has(token)) continue;
    seen.add(token);

    if (type === "village") {
      areas.push({ village_id: id, mandal_id: null, district_id: null });
    } else if (type === "mandal") {
      areas.push({ mandal_id: id, village_id: null, district_id: null });
    } else {
      areas.push({ district_id: id, mandal_id: null, village_id: null });
    }
  }

  return areas;
}

async function uploadListingPhotos(
  supabase: Awaited<ReturnType<typeof createClient>>,
  userId: string,
  listingId: number,
  files: File[],
) {
  const uploaded: string[] = [];

  for (const file of files) {
    if (!file.type.startsWith("image/")) {
      return { error: "Only image files can be uploaded." };
    }
    if (file.size > 5 * 1024 * 1024) {
      return { error: "Each photo must be under 5 MB." };
    }

    const extension = file.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${userId}/${listingId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const { error } = await supabase.storage
      .from("service-photos")
      .upload(path, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file.type,
      });

    if (error) {
      return { error: error.message };
    }

    const { data } = supabase.storage.from("service-photos").getPublicUrl(path);
    uploaded.push(data.publicUrl);
  }

  return { urls: uploaded };
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

  const listingIdRaw = String(formData.get("listing_id") ?? "").trim();
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
  const areas = parseAreas(formData);
  const keepUrls = formData
    .getAll("keep_photo_url")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const newFiles = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!title || !categoryId) {
    return { error: "Title and category are required." };
  }
  if (!["draft", "published", "paused", "closed"].includes(status)) {
    return { error: "Invalid status." };
  }
  if (areas.length === 0) {
    return { error: "Add at least one service area (district, mandal, or village)." };
  }
  if (keepUrls.length + newFiles.length > 8) {
    return { error: "You can attach up to 8 photos per listing." };
  }

  const supabase = await createClient();
  let savedId = listingIdRaw ? Number(listingIdRaw) : null;
  let existingPhotoUrls: string[] = [];

  if (savedId) {
    const { data: existing, error: existingError } = await supabase
      .from("service_listings")
      .select("id, photo_urls")
      .eq("id", savedId)
      .eq("provider_id", user.id)
      .maybeSingle();

    if (existingError || !existing) {
      return { error: existingError?.message ?? "Listing not found." };
    }
    existingPhotoUrls = existing.photo_urls ?? [];
  } else {
    const { data, error } = await supabase
      .from("service_listings")
      .insert({
        provider_id: user.id,
        category_id: categoryId,
        title,
        description,
        price_amount: priceAmount,
        price_unit: priceUnit,
        minimum_booking: minimumBooking,
        availability_note: availabilityNote,
        travel_charge_note: travelChargeNote,
        status: "draft",
        moderation_status: "pending",
        photo_urls: [],
      })
      .select("id")
      .single();

    if (error || !data) {
      return { error: error?.message ?? "Could not create listing." };
    }
    savedId = data.id;
  }

  if (!savedId) {
    return { error: "Could not save listing." };
  }

  const listingId = savedId;
  const kept = existingPhotoUrls.filter((url) => keepUrls.includes(url));
  const upload = await uploadListingPhotos(supabase, user.id, listingId, newFiles);
  if ("error" in upload && upload.error) {
    return { error: upload.error };
  }

  const photoUrls = [...kept, ...(upload.urls ?? [])].slice(0, 8);

  const { error: updateError } = await supabase
    .from("service_listings")
    .update({
      category_id: categoryId,
      title,
      description,
      price_amount: priceAmount,
      price_unit: priceUnit,
      minimum_booking: minimumBooking,
      availability_note: availabilityNote,
      travel_charge_note: travelChargeNote,
      status,
      // Re-publish always returns to staff review before public browse.
      ...(status === "published" ? { moderation_status: "pending" as const } : {}),
      photo_urls: photoUrls,
    })
    .eq("id", listingId)
    .eq("provider_id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  await supabase.from("service_listing_areas").delete().eq("listing_id", listingId);

  const { error: areaError } = await supabase.from("service_listing_areas").insert(
    areas.map((area) => ({
      listing_id: listingId,
      ...area,
    })),
  );

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

export async function moderateListing(formData: FormData) {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }
  if (
    !user.roles.includes("administrator") &&
    !user.roles.includes("moderator")
  ) {
    redirect("/");
  }

  const listingId = Number(formData.get("listing_id"));
  const decision = String(formData.get("decision") ?? "").trim();
  if (!listingId || !["approved", "rejected"].includes(decision)) {
    redirect("/admin/listings");
  }

  const supabase = await createClient();
  await supabase
    .from("service_listings")
    .update({ moderation_status: decision })
    .eq("id", listingId);

  redirect("/admin/listings");
}
