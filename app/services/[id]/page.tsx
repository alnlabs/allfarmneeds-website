import Link from "next/link";
import { Suspense } from "react";
import { notFound } from "next/navigation";
import { BookingForm } from "@/components/booking-form";
import { EnquiryForm } from "@/components/enquiry-form";
import { PageFallback } from "@/components/page-fallback";
import { ReportForm } from "@/components/report-form";
import { PageShell, Panel, StatusBadge } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { statusLabel, statusTone, t } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
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

  const { locale } = await getRequestLocale();
  const copy = t(locale);
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
  const showContact = !!(phoneDigits || whatsappDigits);
  const loginNext = `/login?next=${encodeURIComponent(`/services/${listing.id}`)}`;

  return (
    <PageShell
      title={listing.title}
      subtitle={
        category
          ? locale === "te"
            ? `${category.name_te} — ${category.name_en}`
            : `${category.name_en} — ${category.name_te}`
          : copy.farmServices
      }
    >
      {!isPublic ? (
        <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-950">
          <span>
            {locale === "te"
              ? "ఈ జాబితా ఇంకా పబ్లిక్ కాదు."
              : "This listing is not public yet."}
          </span>
          <StatusBadge tone={statusTone(listing.status)}>
            {statusLabel(locale, listing.status)}
          </StatusBadge>
          <StatusBadge tone={statusTone(listing.moderation_status)}>
            {statusLabel(locale, listing.moderation_status)}
          </StatusBadge>
        </div>
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
              copy.provider}
            {providerProfile?.verification_status === "verified"
              ? ` · ${copy.verified}`
              : ` · ${copy.notVerified}`}
          </p>
          <p className="mt-4 whitespace-pre-wrap">
            {listing.description ||
              (locale === "te" ? "వివరణ లేదు." : "No description provided.")}
          </p>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted">
                {locale === "te" ? "ధర" : "Price"}
              </dt>
              <dd className="font-medium">
                {listing.price_amount != null
                  ? `₹${listing.price_amount}${listing.price_unit ? ` / ${listing.price_unit}` : ""}`
                  : copy.priceOnEnquiry}
              </dd>
            </div>
            <div>
              <dt className="text-muted">
                {locale === "te" ? "కనీస బుకింగ్" : "Minimum booking"}
              </dt>
              <dd className="font-medium">{listing.minimum_booking || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">
                {locale === "te" ? "అందుబాటు" : "Availability"}
              </dt>
              <dd className="font-medium">{listing.availability_note || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">
                {locale === "te" ? "ప్రయాణ ఛార్జీలు" : "Travel charges"}
              </dt>
              <dd className="font-medium">
                {listing.travel_charge_note || "—"}
              </dd>
            </div>
            <div className="sm:col-span-2">
              <dt className="text-muted">
                {locale === "te" ? "సేవా ప్రాంతాలు" : "Service areas"}
              </dt>
              <dd className="font-medium">
                {areas.length
                  ? areas.map((area) => formatArea(area)).join(", ")
                  : "—"}
              </dd>
            </div>
          </dl>
          {providerProfile?.about ? (
            <div className="mt-6 border-t border-border pt-4">
              <h2 className="font-medium">
                {locale === "te" ? "ప్రొవైడర్ గురించి" : "About the provider"}
              </h2>
              <p className="mt-2 whitespace-pre-wrap text-sm text-muted">
                {providerProfile.about}
              </p>
            </div>
          ) : null}
        </Panel>

        <div className="space-y-4">
          {showContact ? (
            <Panel>
              <h2 className="text-lg font-semibold">{copy.contactProvider}</h2>
              <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                {phoneDigits ? (
                  <a
                    href={`tel:+${phoneDigits.startsWith("91") ? phoneDigits : `91${phoneDigits}`}`}
                    className="inline-flex min-h-11 items-center justify-center rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
                  >
                    {copy.callProvider}
                  </a>
                ) : null}
                {whatsappDigits ? (
                  <a
                    href={`https://wa.me/${whatsappDigits.startsWith("91") ? whatsappDigits : `91${whatsappDigits}`}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-11 items-center justify-center rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
                  >
                    {copy.whatsappProvider}
                  </a>
                ) : null}
              </div>
            </Panel>
          ) : null}

          <details className="group rounded-2xl border border-border bg-white open:pb-0">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-3 px-5 py-3 font-semibold marker:content-none">
              <span>{copy.moreContactOptions}</span>
              <span className="text-sm font-normal text-muted group-open:hidden">
                {copy.showFilters}
              </span>
              <span className="hidden text-sm font-normal text-muted group-open:inline">
                {copy.hideFilters}
              </span>
            </summary>
            <div className="space-y-6 border-t border-border px-5 py-4">
              <div>
                <h3 className="font-medium">{copy.requestBooking}</h3>
                <p className="mt-1 text-sm text-muted">{copy.requestBookingHint}</p>
                <div className="mt-3">
                  {!user ? (
                    <Link
                      href={loginNext}
                      className="inline-flex min-h-11 items-center rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
                    >
                      {copy.signInToBook}
                    </Link>
                  ) : isOwner ? (
                    <p className="text-sm text-muted">{copy.yourListing}</p>
                  ) : (
                    <BookingForm listingId={listing.id} />
                  )}
                </div>
              </div>
              <div>
                <h3 className="font-medium">{copy.enquire}</h3>
                <p className="mt-1 text-sm text-muted">{copy.enquireHint}</p>
                <div className="mt-3">
                  {!user ? (
                    <Link
                      href={loginNext}
                      className="inline-flex min-h-11 items-center rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft"
                    >
                      {copy.signInToEnquire}
                    </Link>
                  ) : isOwner ? (
                    <p className="text-sm text-muted">{copy.yourListing}</p>
                  ) : (
                    <EnquiryForm
                      listingId={listing.id}
                      nextPath={`/services/${listing.id}`}
                    />
                  )}
                </div>
              </div>
            </div>
          </details>
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
