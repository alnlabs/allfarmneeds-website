import { Suspense } from "react";
import { redirect } from "next/navigation";
import { updateBookingStatus } from "@/app/actions/bookings";
import { PageFallback } from "@/components/page-fallback";
import { ReviewForm } from "@/components/review-form";
import { PageShell, Panel, PrimaryButton, Select } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

const STATUS_OPTIONS = [
  { value: "accepted", label: "Accept" },
  { value: "rejected", label: "Reject" },
  { value: "scheduled", label: "Mark scheduled" },
  { value: "in_progress", label: "In progress" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancel" },
] as const;

async function ProviderBookingsContent() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.roles.includes("service_provider")) {
    redirect("/onboarding/roles");
  }

  const supabase = await createClient();
  const { data: bookings, error } = await supabase
    .from("service_bookings")
    .select(
      `
      id,
      status,
      message,
      preferred_date,
      created_at,
      farmer_id,
      service_listings(id, title),
      profiles!service_bookings_farmer_id_fkey(display_name)
    `,
    )
    .eq("provider_id", user.id)
    .order("created_at", { ascending: false });

  const completedIds = (bookings ?? [])
    .filter((b) => b.status === "completed")
    .map((b) => b.id);
  const { data: existingReviews } =
    completedIds.length > 0
      ? await supabase
          .from("reviews")
          .select("entity_id")
          .eq("reviewer_id", user.id)
          .eq("entity_type", "service_booking")
          .in("entity_id", completedIds)
      : { data: [] };
  const reviewed = new Set((existingReviews ?? []).map((r) => r.entity_id));

  return (
    <PageShell
      title="Booking requests"
      subtitle="Accept, schedule and complete farmer booking requests."
    >
      {error ? <p className="text-red-700">{error.message}</p> : null}
      <div className="space-y-3">
        {(bookings ?? []).length === 0 ? (
          <Panel>
            <p className="text-muted">No booking requests yet.</p>
          </Panel>
        ) : (
          bookings?.map((booking) => {
            const listing = Array.isArray(booking.service_listings)
              ? booking.service_listings[0]
              : booking.service_listings;
            const farmer = Array.isArray(booking.profiles)
              ? booking.profiles[0]
              : booking.profiles;

            return (
              <Panel key={booking.id}>
                <h2 className="text-lg font-semibold">
                  {listing?.title ?? "Service"}
                </h2>
                <p className="mt-1 text-sm text-muted">
                  Farmer: {farmer?.display_name ?? "—"} · Status: {booking.status}
                  {booking.preferred_date
                    ? ` · Preferred: ${booking.preferred_date}`
                    : ""}
                </p>
                <p className="mt-2 whitespace-pre-wrap text-sm">{booking.message}</p>
                <form action={updateBookingStatus} className="mt-4 flex flex-wrap gap-2">
                  <input type="hidden" name="booking_id" value={booking.id} />
                  <input type="hidden" name="return_to" value="/provider/bookings" />
                  <Select name="status" defaultValue="accepted" className="max-w-xs">
                    {STATUS_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </Select>
                  <PrimaryButton type="submit">Update status</PrimaryButton>
                </form>
                {booking.status === "completed" && !reviewed.has(booking.id) ? (
                  <ReviewForm
                    entityType="service_booking"
                    entityId={booking.id}
                    revieweeId={booking.farmer_id}
                    revieweeLabel={farmer?.display_name ?? "farmer"}
                    returnTo="/provider/bookings"
                  />
                ) : null}
              </Panel>
            );
          })
        )}
      </div>
    </PageShell>
  );
}

export default function ProviderBookingsPage() {
  return (
    <Suspense fallback={<PageFallback title="Booking requests" />}>
      <ProviderBookingsContent />
    </Suspense>
  );
}
