"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { requireUser } from "@/lib/auth";

export type BookingActionState = {
  error?: string;
  success?: string;
};

const PROVIDER_STATUSES = [
  "accepted",
  "rejected",
  "scheduled",
  "in_progress",
  "completed",
  "cancelled",
] as const;

const FARMER_STATUSES = ["cancelled"] as const;

export async function createBooking(
  _prev: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const listingId = Number(formData.get("listing_id"));
  const message = String(formData.get("message") ?? "").trim();
  const preferredDate = String(formData.get("preferred_date") ?? "").trim() || null;

  if (!listingId || !message) {
    return { error: "Please describe what you need." };
  }
  if (
    !user.roles.includes("farmer") &&
    !user.roles.includes("service_provider")
  ) {
    redirect(`/onboarding/roles?next=${encodeURIComponent(`/services/${listingId}`)}`);
  }

  const supabase = await createClient();
  const { data: listing, error: listingError } = await supabase
    .from("service_listings")
    .select("id, provider_id, status, moderation_status")
    .eq("id", listingId)
    .maybeSingle();

  if (listingError || !listing) {
    return { error: listingError?.message ?? "Listing not found." };
  }
  if (listing.provider_id === user.id) {
    return { error: "You cannot book your own listing." };
  }
  if (listing.status !== "published" || listing.moderation_status !== "approved") {
    return { error: "This listing is not available for booking." };
  }

  const { error } = await supabase.from("service_bookings").insert({
    listing_id: listingId,
    farmer_id: user.id,
    provider_id: listing.provider_id,
    message,
    preferred_date: preferredDate,
    status: "requested",
  });

  if (error) {
    return { error: error.message };
  }

  redirect("/bookings");
}

export async function updateBookingStatus(formData: FormData) {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const bookingId = Number(formData.get("booking_id"));
  const status = String(formData.get("status") ?? "").trim();
  const returnTo = String(formData.get("return_to") ?? "/bookings").trim();

  if (!bookingId || !status) {
    redirect(returnTo.startsWith("/") ? returnTo : "/bookings");
  }

  const supabase = await createClient();
  const { data: booking } = await supabase
    .from("service_bookings")
    .select("id, farmer_id, provider_id, status")
    .eq("id", bookingId)
    .maybeSingle();

  if (!booking) {
    redirect(returnTo.startsWith("/") ? returnTo : "/bookings");
  }

  const isProvider = booking.provider_id === user.id;
  const isFarmer = booking.farmer_id === user.id;
  const isStaff =
    user.roles.includes("administrator") || user.roles.includes("moderator");

  const allowed =
    isStaff ||
    (isProvider && PROVIDER_STATUSES.includes(status as (typeof PROVIDER_STATUSES)[number])) ||
    (isFarmer && FARMER_STATUSES.includes(status as (typeof FARMER_STATUSES)[number]));

  if (!allowed) {
    redirect(returnTo.startsWith("/") ? returnTo : "/bookings");
  }

  await supabase
    .from("service_bookings")
    .update({ status })
    .eq("id", bookingId);

  redirect(returnTo.startsWith("/") ? returnTo : "/bookings");
}
