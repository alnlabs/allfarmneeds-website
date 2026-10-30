import Link from "next/link";
import { Suspense } from "react";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel, Select } from "@/components/ui";
import { formatArea } from "@/lib/locations";
import { createClient } from "@/utils/supabase/server";

async function ServicesResults({
  categoryId,
  districtId,
  verifiedOnly,
}: {
  categoryId?: number;
  districtId?: number;
  verifiedOnly: boolean;
}) {
  const supabase = await createClient();

  let villageIdsInDistrict: number[] = [];
  let mandalIdsInDistrict: number[] = [];

  if (districtId) {
    const { data: mandals } = await supabase
      .from("mandals")
      .select("id")
      .eq("district_id", districtId);
    mandalIdsInDistrict = (mandals ?? []).map((mandal) => mandal.id);

    if (mandalIdsInDistrict.length > 0) {
      const { data: villages } = await supabase
        .from("villages")
        .select("id")
        .in("mandal_id", mandalIdsInDistrict);
      villageIdsInDistrict = (villages ?? []).map((village) => village.id);
    }
  }

  let query = supabase
    .from("service_listings")
    .select(
      `
      id,
      title,
      description,
      price_amount,
      price_unit,
      category_id,
      provider_id,
      service_categories(name_en, name_te),
      profiles!service_listings_provider_id_fkey(
        display_name,
        provider_profiles(business_name, verification_status)
      ),
      service_listing_areas(
        district_id,
        mandal_id,
        village_id,
        districts(name),
        mandals(name),
        villages(name)
      )
    `,
    )
    .eq("status", "published")
    .order("updated_at", { ascending: false });

  if (categoryId) {
    query = query.eq("category_id", categoryId);
  }

  const { data: listings, error } = await query;

  if (error) {
    return <p className="text-red-700">{error.message}</p>;
  }

  const filtered = (listings ?? []).filter((listing) => {
    const profile = Array.isArray(listing.profiles)
      ? listing.profiles[0]
      : listing.profiles;
    const provider = Array.isArray(profile?.provider_profiles)
      ? profile?.provider_profiles[0]
      : profile?.provider_profiles;

    if (verifiedOnly && provider?.verification_status !== "verified") {
      return false;
    }

    if (!districtId) {
      return true;
    }

    const areas = Array.isArray(listing.service_listing_areas)
      ? listing.service_listing_areas
      : listing.service_listing_areas
        ? [listing.service_listing_areas]
        : [];

    return areas.some(
      (area) =>
        area.district_id === districtId ||
        (area.mandal_id != null &&
          mandalIdsInDistrict.includes(area.mandal_id)) ||
        (area.village_id != null &&
          villageIdsInDistrict.includes(area.village_id)),
    );
  });

  if (filtered.length === 0) {
    return (
      <Panel>
        <p className="text-muted">
          No published services match these filters yet. Providers can add
          listings after signing in.
        </p>
      </Panel>
    );
  }

  return (
    <div className="space-y-3">
      {filtered.map((listing) => {
        const category = Array.isArray(listing.service_categories)
          ? listing.service_categories[0]
          : listing.service_categories;
        const profile = Array.isArray(listing.profiles)
          ? listing.profiles[0]
          : listing.profiles;
        const provider = Array.isArray(profile?.provider_profiles)
          ? profile?.provider_profiles[0]
          : profile?.provider_profiles;
        const area = Array.isArray(listing.service_listing_areas)
          ? listing.service_listing_areas[0]
          : listing.service_listing_areas;

        return (
          <Link
            key={listing.id}
            href={`/services/${listing.id}`}
            className="block rounded-2xl border border-border bg-surface p-5 transition hover:border-accent"
          >
            <p className="text-sm text-muted">
              {category
                ? `${category.name_te} — ${category.name_en}`
                : "Service"}
            </p>
            <h2 className="mt-1 text-xl font-semibold">{listing.title}</h2>
            <p className="mt-2 line-clamp-2 text-sm text-muted">
              {listing.description || "No description yet."}
            </p>
            <div className="mt-3 flex flex-wrap gap-3 text-sm text-muted">
              <span>
                {listing.price_amount != null
                  ? `₹${listing.price_amount}${listing.price_unit ? ` / ${listing.price_unit}` : ""}`
                  : "Price on enquiry"}
              </span>
              <span>{area ? formatArea(area) : "Area not set"}</span>
              <span>
                {provider?.business_name ?? profile?.display_name ?? "Provider"}
                {provider?.verification_status === "verified"
                  ? " · Verified"
                  : ""}
              </span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}

async function ServicesPageContent({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    district?: string;
    verified?: string;
  }>;
}) {
  const params = await searchParams;
  const categoryId = params.category ? Number(params.category) : undefined;
  const districtId = params.district ? Number(params.district) : undefined;
  const verifiedOnly = params.verified === "1";

  const supabase = await createClient();
  const [{ data: categories }, { data: districts }] = await Promise.all([
    supabase
      .from("service_categories")
      .select("id, name_en, name_te")
      .order("name_en"),
    supabase
      .from("districts")
      .select("id, name, states!inner(name)")
      .in("states.name", ["Telangana", "Andhra Pradesh"])
      .order("name"),
  ]);

  return (
    <PageShell
      title="Agricultural services"
      subtitle="Browse published services. Contact providers through enquiries — phone numbers stay private."
    >
      <Panel>
        <form className="grid gap-3 md:grid-cols-4">
          <label className="space-y-2 text-sm">
            <span className="font-medium">Category</span>
            <Select name="category" defaultValue={categoryId ?? ""}>
              <option value="">All categories</option>
              {categories?.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name_te} — {category.name_en}
                </option>
              ))}
            </Select>
          </label>
          <label className="space-y-2 text-sm">
            <span className="font-medium">District</span>
            <Select name="district" defaultValue={districtId ?? ""}>
              <option value="">All districts</option>
              {districts?.map((district) => {
                const state = Array.isArray(district.states)
                  ? district.states[0]
                  : district.states;
                return (
                  <option key={district.id} value={district.id}>
                    {district.name}
                    {state?.name ? ` (${state.name})` : ""}
                  </option>
                );
              })}
            </Select>
          </label>
          <label className="flex items-end gap-2 pb-2 text-sm">
            <input
              type="checkbox"
              name="verified"
              value="1"
              defaultChecked={verifiedOnly}
            />
            <span>Verified providers only</span>
          </label>
          <div className="flex items-end">
            <button
              type="submit"
              className="w-full rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
            >
              Apply filters
            </button>
          </div>
        </form>
      </Panel>

      <div className="mt-6">
        <ServicesResults
          categoryId={categoryId}
          districtId={districtId}
          verifiedOnly={verifiedOnly}
        />
      </div>
    </PageShell>
  );
}

export default function ServicesPage({
  searchParams,
}: {
  searchParams: Promise<{
    category?: string;
    district?: string;
    verified?: string;
  }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Agricultural services" />}>
      <ServicesPageContent searchParams={searchParams} />
    </Suspense>
  );
}
