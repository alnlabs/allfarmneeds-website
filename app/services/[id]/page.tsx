import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { EnquiryForm } from "@/components/enquiry-form";
import { PageFallback } from "@/components/page-fallback";
import { ReportForm } from "@/components/report-form";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatArea } from "@/lib/locations";
import { createClient } from "@/utils/supabase/server";

function digitsOnly(value: string | null | undefined) {
  return (value ?? "").replace(/\D/g, "");
}

async function ServiceDetailContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const listingId = Number(id);
  if (!listingId) {
    notFound();
  }

  const supabase = await createClient();
  const user = await requireUser();
  const isStaff =
    !!user &&
    (user.roles.includes("administrator") || user.roles.includes("moderator"));

  const { data: listing, error } = await supabase
    .from("service_listings")
    .select(
      `
      id,
      title,
      description,
      price_amount,
      price_unit,
      minimum_booking,
      availability_note,
      travel_charge_note,
      status,
      moderation_status,
      photo_urls,
      provider_id,
      service_categories(name_en, name_te),
      profiles!service_listings_provider_id_fkey(
        display_name,
        provider_profiles(
          business_name,
          verification_status,
          about,
          show_contact_publicly
        )
      ),
      service_listing_areas(
        districts(name),
        mandals(name),
        villages(name)
      )
    `,
    )
    .eq("id", listingId)
    .maybeSingle();

  const isOwner = user?.id === listing?.provider_id;
  const isPublic =
    listing?.status === "published" && listing?.moderation_status === "approved";

  if (error || !listing || (!isPublic && !isOwner && !isStaff)) {
    notFound();
  }

  const category = Array.isArray(listing.service_categories)
    ? listing.service_categories[0]
    : listing.service_categories;
  const profile = Array.isArray(listing.profiles)
    ? listing.profiles[0]
    : listing.profiles;
  const providerProfile = Array.isArray(profile?.provider_profiles)
    ? profile?.provider_profiles[0]
    : profile?.provider_profiles;
  const areas = Array.isArray(listing.service_listing_areas)
    ? listing.service_listing_areas
    : listing.service_listing_areas
      ? [listing.service_listing_areas]
      : [];
  const photos: string[] = listing.photo_urls ?? [];

  const { data: contactRows } = await supabase.rpc("get_provider_contact", {
    p_provider_id: listing.provider_id,
  });
  const contact = Array.isArray(contactRows) ? contactRows[0] : contactRows;
  const phoneDigits = digitsOnly(contact?.phone);
  const whatsappDigits = digitsOnly(contact?.whatsapp || contact?.phone);
  // RPC already enforces privacy; only render buttons when numbers are returned.
  const showContact = !!(phoneDigits || whatsappDigits);

  return (
    <PageShell
      title={listing.title}
      subtitle={
        category
          ? `${category.name_te} — ${category.name_en}`
          : "Agricultural service"
      }
    >
      {!isPublic ? (
        <p className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          This listing is not public yet (status: {listing.status}, moderation:{" "}
          {listing.moderation_status}).
        </p>
      ) : null}

      {photos.length > 0 ? (
        <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {photos.map((url) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={url}
              src={url}
              alt=""
              className="h-36 w-full rounded-2xl border border-border object-cover"
            />
          ))}
        </div>
      ) : null}

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <Panel>
          <p className="text-sm text-muted">
            {providerProfile?.business_name ??
              profile?.display_name ??
              "Provider"}
            {providerProfile?.verification_status === "verified"
              ? " · Verified identity/business status"
              : " · Not business-verified yet"}
          </p>
          <p className="mt-4 whitespace-pre-wrap">
            {listing.description || "No description provided."}
          </p>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">Price</dt>
              <dd className="font-medium">
                {listing.price_amount != null
                  ? `₹${listing.price_amount}${listing.price_unit ? ` / ${listing.price_unit}` : ""}`
                  : "On enquiry"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Minimum booking</dt>
              <dd className="font-medium">{listing.minimum_booking || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Availability</dt>
              <dd className="font-medium">{listing.availability_note || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Travel charges</dt>
              <dd className="font-medium">{listing.travel_charge_note || "—"}</dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted">Service areas</dt>
              <dd className="font-medium">
                {areas.length
                  ? areas.map((area) => formatArea(area)).join(", ")
                  : "—"}
              </dd>
            </div>
          </dl>
          {providerProfile?.about ? (
            <div className="mt-6 border-t border-border pt-4">
              <h2 className="font-medium">About the provider</h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted">
                {providerProfile.about}
              </p>
            </div>
          ) : null}
        </Panel>

        <div className="space-y-6">
          {showContact ? (
            <Panel>
              <h2 className="text-lg font-semibold">Contact provider</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {phoneDigits ? (
                  <a
                    href={`tel:+${phoneDigits.startsWith("91") ? phoneDigits : `91${phoneDigits}`}`}
                    className="rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
                  >
                    Call
                  </a>
                ) : null}
                {whatsappDigits ? (
                  <a
                    href={`https://wa.me/${whatsappDigits.startsWith("91") ? whatsappDigits : `91${whatsappDigits}`}`}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
                  >
                    WhatsApp
                  </a>
                ) : null}
              </div>
            </Panel>
          ) : null}

          <Panel>
            <h2 className="text-lg font-semibold">Request booking</h2>
            <p className="mt-2 text-sm text-muted">
              Send a booking request with your preferred date. The provider will
              update the status.
            </p>
            <div className="mt-4">
              {!user ? (
                <Link
                  href={`/login?next=${encodeURIComponent(`/services/${listing.id}`)}`}
                  className="inline-flex rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
                >
                  Sign in to book
                </Link>
              ) : isOwner ? (
                <p className="text-sm text-muted">This is your listing.</p>
              ) : (
                <BookingForm listingId={listing.id} />
              )}
            </div>
          </Panel>

          <Panel>
            <h2 className="text-lg font-semibold">Enquire</h2>
            <p className="mt-2 text-sm text-muted">
              Ask a question without committing to a booking.
            </p>
            <div className="mt-4">
              {!user ? (
                <Link
                  href={`/login?next=${encodeURIComponent(`/services/${listing.id}`)}`}
                  className="inline-flex rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
                >
                  Sign in to enquire
                </Link>
              ) : isOwner ? (
                <p className="text-sm text-muted">This is your listing.</p>
              ) : (
                <EnquiryForm
                  listingId={listing.id}
                  nextPath={`/services/${listing.id}`}
                />
              )}
            </div>
          </Panel>
        </div>
      </div>

      {user ? (
        <div className="mt-6">
          <ReportForm
            targetType="service_listing"
            targetId={listing.id}
            returnTo={`/services/${listing.id}`}
          />
        </div>
      ) : null}
    </PageShell>
  );
}

export default function ServiceDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Service" />}>
      <ServiceDetailContent params={params} />
    </Suspense>
  );
}
