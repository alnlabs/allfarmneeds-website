import { Suspense } from "react";
import { notFound, redirect } from "next/navigation";
import { ListingForm, type SelectedArea } from "@/components/listing-form";
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
      "id, category_id, title, description, price_amount, price_unit, minimum_booking, availability_note, travel_charge_note, status, photo_urls, moderation_status, service_listing_areas(district_id, mandal_id, village_id, districts(name), mandals(name), villages(name))",
    )
    .eq("id", listingId)
    .eq("provider_id", user.id)
    .maybeSingle();

  if (!listing) {
    notFound();
  }

  const options = await getListingFormOptions();
  const areaRows = Array.isArray(listing.service_listing_areas)
    ? listing.service_listing_areas
    : listing.service_listing_areas
      ? [listing.service_listing_areas]
      : [];

  const relationName = (
    value: { name: string } | { name: string }[] | null | undefined,
  ) => (Array.isArray(value) ? value[0]?.name : value?.name);

  const areas: SelectedArea[] = areaRows.flatMap((area) => {
    const districtName = relationName(
      area.districts as { name: string } | { name: string }[] | null,
    );
    const mandalName = relationName(
      area.mandals as { name: string } | { name: string }[] | null,
    );
    const villageName = relationName(
      area.villages as { name: string } | { name: string }[] | null,
    );

    if (area.village_id) {
      return [
        {
          token: `village:${area.village_id}`,
          label: villageName ?? `Village #${area.village_id}`,
        },
      ];
    }
    if (area.mandal_id) {
      return [
        {
          token: `mandal:${area.mandal_id}`,
          label: mandalName ? `Mandal: ${mandalName}` : `Mandal #${area.mandal_id}`,
        },
      ];
    }
    if (area.district_id) {
      return [
        {
          token: `district:${area.district_id}`,
          label: districtName
            ? `District: ${districtName}`
            : `District #${area.district_id}`,
        },
      ];
    }
    return [];
  });

  return (
    <PageShell
      title="Edit listing"
      subtitle={`${listing.title} · Moderation: ${listing.moderation_status}`}
    >
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
            photo_urls: listing.photo_urls ?? [],
            areas,
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
