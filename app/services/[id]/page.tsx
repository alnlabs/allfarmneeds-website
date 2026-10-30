import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { EnquiryForm } from "@/components/enquiry-form";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { formatArea } from "@/lib/locations";
import { createClient } from "@/utils/supabase/server";

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
      provider_id,
      service_categories(name_en, name_te),
      profiles!service_listings_provider_id_fkey(
        display_name,
        provider_profiles(business_name, verification_status, about)
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

  if (
    error ||
    !listing ||
    (listing.status !== "published" && listing.provider_id !== user?.id)
  ) {
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

  const isOwner = user?.id === listing.provider_id;

  return (
    <PageShell
      title={listing.title}
      subtitle={
        category
          ? `${category.name_te} — ${category.name_en}`
          : "Agricultural service"
      }
    >
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

        <Panel>
          <h2 className="text-lg font-semibold">Enquire</h2>
          <p className="mt-2 text-sm text-muted">
            Your message goes to the provider. Contact numbers stay private by
            default.
          </p>
          <div className="mt-4">
            {!user ? (
              <Link
                href="/login"
                className="inline-flex rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
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
