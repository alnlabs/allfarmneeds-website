import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { ListingForm } from "@/components/listing-form";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getListingFormOptions } from "@/lib/locations";
import { createClient } from "@/utils/supabase/server";

async function EditListingContent({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }
  if (!user.roles.includes("service_provider")) {
    redirect("/onboarding/roles");
  }

  const { id } = await params;
  const listingId = Number(id);
  if (!listingId) {
    notFound();
  }

  const supabase = await createClient();
  const { data: listing } = await supabase
    .from("service_listings")
    .select(
      "id, category_id, title, description, price_amount, price_unit, minimum_booking, availability_note, travel_charge_note, status, service_listing_areas(district_id, mandal_id, village_id)",
    )
    .eq("id", listingId)
    .eq("provider_id", user.id)
    .maybeSingle();

  if (!listing) {
    notFound();
  }

  const area = Array.isArray(listing.service_listing_areas)
    ? listing.service_listing_areas[0]
    : listing.service_listing_areas;

  let areaType: "district" | "mandal" | "village" = "district";
  let areaId = area?.district_id ?? undefined;
  if (area?.village_id) {
    areaType = "village";
    areaId = area.village_id;
  } else if (area?.mandal_id) {
    areaType = "mandal";
    areaId = area.mandal_id;
  }

  const options = await getListingFormOptions();

  return (
    <PageShell title="Edit listing" subtitle={listing.title}>
      <Panel>
        <ListingForm
          {...options}
          initial={{
            id: listing.id,
            category_id: listing.category_id,
            title: listing.title,
            description: listing.description,
            price_amount: listing.price_amount,
            price_unit: listing.price_unit,
            minimum_booking: listing.minimum_booking,
            availability_note: listing.availability_note,
            travel_charge_note: listing.travel_charge_note,
            status: listing.status,
            area_type: areaType,
            area_id: areaId,
          }}
        />
      </Panel>
    </PageShell>
  );
}

export default function EditListingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Edit listing" />}>
      <EditListingContent params={params} />
    </Suspense>
  );
}
