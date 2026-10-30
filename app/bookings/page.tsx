import Link from "next/link";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { updateBookingStatus } from "@/app/actions/bookings";
import { PageFallback } from "@/components/page-fallback";
import { ReviewForm } from "@/components/review-form";
import { PageShell, Panel, SecondaryButton } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function BookingsContent() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
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
      provider_id,
      service_listings(id, title),
      profiles!service_bookings_provider_id_fkey(display_name)
    `,
    )
    .eq("farmer_id", user.id)
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
      title="My booking requests"
      subtitle="Track status of service bookings you requested."
      actions={
        <Link
          href="/services"
          className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
        >
          Browse services
        </Link>
      }
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
            const provider = Array.isArray(booking.profiles)
              ? booking.profiles[0]
              : booking.profiles;

            return (
              <Panel key={booking.id}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h2 className="text-lg font-semibold">
                      {listing?.title ?? "Service"}
                    </h2>
                    <p className="mt-1 text-sm text-muted">
                      Provider: {provider?.display_name ?? "—"} · Status:{" "}
                      {booking.status}
                      {booking.preferred_date
                        ? ` · Preferred: ${booking.preferred_date}`
                        : ""}
                    </p>
                    <p className="mt-2 whitespace-pre-wrap text-sm">{booking.message}</p>
                  </div>
                  {booking.status === "requested" || booking.status === "accepted" ? (
                    <form action={updateBookingStatus}>
                      <input type="hidden" name="booking_id" value={booking.id} />
                      <input type="hidden" name="status" value="cancelled" />
                      <input type="hidden" name="return_to" value="/bookings" />
                      <SecondaryButton type="submit">Cancel</SecondaryButton>
                    </form>
                  ) : null}
                </div>
                {booking.status === "completed" && !reviewed.has(booking.id) ? (
                  <ReviewForm
                    entityType="service_booking"
                    entityId={booking.id}
                    revieweeId={booking.provider_id}
                    revieweeLabel={provider?.display_name ?? "provider"}
                    returnTo="/bookings"
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

export default function BookingsPage() {
  return (
    <Suspense fallback={<PageFallback title="My booking requests" />}>
      <BookingsContent />
    </Suspense>
  );
}
