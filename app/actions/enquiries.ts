"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";

export type EnquiryActionState = {
  error?: string;
  success?: string;
};

export async function sendEnquiry(
  _prev: EnquiryActionState,
  formData: FormData,
): Promise<EnquiryActionState> {
  const user = await requireUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(String(formData.get("next") ?? "/services"))}`);
  }

  const listingId = Number(formData.get("service_listing_id"));
  const message = String(formData.get("message") ?? "").trim();

  if (!listingId || message.length < 5) {
    return { error: "Write a short message about what you need." };
  }

  const supabase = await createClient();
  const { data: listing, error: listingError } = await supabase
    .from("service_listings")
    .select("id, provider_id, status")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing || listing.status !== "published") {
    return { error: "This listing is not available." };
  }

  if (listing.provider_id === user.id) {
    return { error: "You cannot enquire on your own listing." };
  }

  const { data, error } = await supabase
    .from("enquiries")
    .insert({
      sender_id: user.id,
      recipient_id: listing.provider_id,
      service_listing_id: listingId,
      message,
    })
    .select("id")
    .single();

  if (error || !data) {
    return { error: error?.message ?? "Could not send enquiry." };
  }

  redirect(`/messages/${data.id}`);
}

export async function closeEnquiry(formData: FormData) {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const enquiryId = Number(formData.get("enquiry_id"));
  if (!enquiryId) {
    redirect("/messages");
  }

  const supabase = await createClient();
  await supabase
    .from("enquiries")
    .update({ status: "closed" })
    .eq("id", enquiryId)
    .or(`sender_id.eq.${user.id},recipient_id.eq.${user.id}`);

  redirect(`/messages/${enquiryId}`);
}
