"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";

export type ProductActionState = {
  error?: string;
};

const UNITS = ["kg", "quintal", "tonne", "litre", "piece"] as const;

function parseOptionalNumber(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  const number = Number(text);
  return Number.isFinite(number) ? number : null;
}

async function uploadProductPhotos(
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
    const { error } = await supabase.storage.from("product-photos").upload(path, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type,
    });
    if (error) return { error: error.message };
    const { data } = supabase.storage.from("product-photos").getPublicUrl(path);
    uploaded.push(data.publicUrl);
  }
  return { urls: uploaded };
}

export async function saveProductListing(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("farmer")) {
    redirect("/onboarding/roles?next=/crops/new");
  }

  const listingIdRaw = String(formData.get("listing_id") ?? "").trim();
  const categoryId = Number(formData.get("category_id"));
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const quantityAvailable = Number(formData.get("quantity_available"));
  const quantityUnit = String(formData.get("quantity_unit") ?? "").trim();
  const expectedPrice = parseOptionalNumber(formData.get("expected_price"));
  const priceUnit = String(formData.get("price_unit") ?? "").trim() || null;
  const qualityGrade = String(formData.get("quality_grade") ?? "").trim() || null;
  const villageId = Number(formData.get("village_id") || 0) || null;
  const minimumOrder = parseOptionalNumber(formData.get("minimum_order_quantity"));
  const fulfillment = String(formData.get("fulfillment") ?? "pickup").trim();
  const status = String(formData.get("status") ?? "draft").trim();
  const keepUrls = formData
    .getAll("keep_photo_url")
    .map((value) => String(value).trim())
    .filter(Boolean);
  const newFiles = formData
    .getAll("photos")
    .filter((entry): entry is File => entry instanceof File && entry.size > 0);

  if (!title || !categoryId) return { error: "Title and category are required." };
  if (!Number.isFinite(quantityAvailable) || quantityAvailable < 0) {
    return { error: "Quantity available is required." };
  }
  if (!UNITS.includes(quantityUnit as (typeof UNITS)[number])) {
    return { error: "Invalid quantity unit." };
  }
  if (!["draft", "published", "closed"].includes(status)) {
    return { error: "Invalid status." };
  }
  if (!["pickup", "delivery", "either"].includes(fulfillment)) {
    return { error: "Invalid fulfillment option." };
  }

  const supabase = await createClient();
  let savedId = listingIdRaw ? Number(listingIdRaw) : null;
  let existingPhotos: string[] = [];

  if (savedId) {
    const { data: existing, error } = await supabase
      .from("product_listings")
      .select("id, photo_urls")
      .eq("id", savedId)
      .eq("seller_id", user.id)
      .maybeSingle();
    if (error || !existing) return { error: error?.message ?? "Listing not found." };
    existingPhotos = existing.photo_urls ?? [];
  } else {
    const { data, error } = await supabase
      .from("product_listings")
      .insert({
        seller_id: user.id,
        category_id: categoryId,
        title,
        description,
        quantity_available: quantityAvailable,
        quantity_unit: quantityUnit,
        expected_price: expectedPrice,
        price_unit: priceUnit,
        quality_grade: qualityGrade,
        village_id: villageId,
        minimum_order_quantity: minimumOrder,
        fulfillment,
        status: "draft",
        moderation_status: "pending",
        photo_urls: [],
      })
      .select("id")
      .single();
    if (error || !data) return { error: error?.message ?? "Could not create listing." };
    savedId = data.id;
  }

  if (!savedId) return { error: "Could not save listing." };

  const kept = existingPhotos.filter((url) => keepUrls.includes(url));
  const upload = await uploadProductPhotos(supabase, user.id, savedId, newFiles);
  if ("error" in upload && upload.error) return { error: upload.error };
  const photoUrls = [...kept, ...(upload.urls ?? [])].slice(0, 8);

  const { error: updateError } = await supabase
    .from("product_listings")
    .update({
      category_id: categoryId,
      title,
      description,
      quantity_available: quantityAvailable,
      quantity_unit: quantityUnit,
      expected_price: expectedPrice,
      price_unit: priceUnit,
      quality_grade: qualityGrade,
      village_id: villageId,
      minimum_order_quantity: minimumOrder,
      fulfillment,
      status,
      ...(status === "published" ? { moderation_status: "pending" as const } : {}),
      photo_urls: photoUrls,
    })
    .eq("id", savedId)
    .eq("seller_id", user.id);

  if (updateError) return { error: updateError.message };
  redirect("/seller/crops");
}

export async function createProductDeal(
  _prev: ProductActionState,
  formData: FormData,
): Promise<ProductActionState> {
  const user = await requireUser();
  if (!user) redirect("/login");

  const listingId = Number(formData.get("listing_id"));
  const quantity = Number(formData.get("quantity"));
  const message = String(formData.get("message") ?? "").trim();
  if (!listingId || !Number.isFinite(quantity) || quantity <= 0) {
    return { error: "Enter a valid quantity." };
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("create_product_deal_reservation", {
    p_listing_id: listingId,
    p_quantity: quantity,
    p_message: message,
    p_price_amount: null,
  });
  if (error) return { error: error.message };
  redirect("/buyer/deals");
}

export async function transitionProductDeal(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");

  const dealId = Number(formData.get("deal_id"));
  const status = String(formData.get("status") ?? "").trim();
  const returnTo = String(formData.get("return_to") ?? "/buyer/deals").trim();
  if (!dealId || !status) {
    redirect(returnTo.startsWith("/") ? returnTo : "/buyer/deals");
  }

  const supabase = await createClient();
  const { error } = await supabase.rpc("transition_product_deal", {
    p_deal_id: dealId,
    p_new_status: status,
  });
  if (error) {
    redirect(
      `${returnTo.startsWith("/") ? returnTo : "/buyer/deals"}?error=${encodeURIComponent(error.message)}`,
    );
  }
  redirect(returnTo.startsWith("/") ? returnTo : "/buyer/deals");
}

export async function moderateProductListing(formData: FormData) {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (
    !user.roles.includes("administrator") &&
    !user.roles.includes("moderator")
  ) {
    redirect("/");
  }

  const listingId = Number(formData.get("listing_id"));
  const decision = String(formData.get("decision") ?? "").trim();
  if (!listingId || !["approved", "rejected"].includes(decision)) {
    redirect("/admin/crops");
  }

  const supabase = await createClient();
  await supabase
    .from("product_listings")
    .update({ moderation_status: decision })
    .eq("id", listingId);
  redirect("/admin/crops");
}
