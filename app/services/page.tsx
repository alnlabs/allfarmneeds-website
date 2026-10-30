import Link from "next/link";
import { Suspense } from "react";
import { FilterPanel } from "@/components/filter-panel";
import { PageFallback } from "@/components/page-fallback";
import {
  EmptyState,
  ListingCard,
  PageShell,
  Select,
  TextInput,
} from "@/components/ui";
import { categoryLabel, t, type Locale } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { formatArea } from "@/lib/locations";
import { createClient } from "@/utils/supabase/server";

async function ServicesResults({
  categoryId,
  districtId,
  mandalId,
  villageId,
  query,
  verifiedOnly,
  locale,
}: {
  categoryId?: number;
  districtId?: number;
  mandalId?: number;
  villageId?: number;
  query?: string;
  verifiedOnly: boolean;
  locale: Locale;
}) {
  const copy = t(locale);
  const supabase = await createClient();

  let villageIdsInDistrict: number[] = [];
  let mandalIdsInDistrict: number[] = [];
  let villageIdsInMandal: number[] = [];

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

  if (mandalId) {
    const { data: villages } = await supabase
      .from("villages")
      .select("id")
      .eq("mandal_id", mandalId);
    villageIdsInMandal = (villages ?? []).map((village) => village.id);
  }

  let listingsQuery = supabase
    .from("service_listings")
    .select(
      `
      id,
      title,
      description,
      price_amount,
      price_unit,
      photo_urls,
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
    .eq("moderation_status", "approved")
    .order("updated_at", { ascending: false });

  if (categoryId) {
    listingsQuery = listingsQuery.eq("category_id", categoryId);
  }
  if (query) {
    listingsQuery = listingsQuery.or(
      `title.ilike.%${query}%,description.ilike.%${query}%`,
    );
  }

  const { data: listings, error } = await listingsQuery;

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

    const areas = Array.isArray(listing.service_listing_areas)
      ? listing.service_listing_areas
      : listing.service_listing_areas
        ? [listing.service_listing_areas]
        : [];

    if (villageId) {
      return areas.some(
        (area) =>
          area.village_id === villageId ||
          area.mandal_id === mandalId ||
          area.district_id === districtId,
      );
    }

    if (mandalId) {
      return areas.some(
        (area) =>
          area.mandal_id === mandalId ||
          (area.village_id != null &&
            villageIdsInMandal.includes(area.village_id)) ||
          area.district_id === districtId,
      );
    }

    if (!districtId) {
      return true;
    }

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
      <EmptyState
        title={copy.noServices}
        action={
          <Link
            href="/create"
            className="inline-flex rounded-xl border border-border bg-white px-4 py-2.5 text-sm hover:bg-accent-soft"
          >
            {copy.navCreate}
          </Link>
        }
      />
    );
  }

  return (
    <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
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
        const photo = listing.photo_urls?.[0];
        const eyebrow = category
          ? (() => {
              const label = categoryLabel(locale, category);
              return `${label.primary} — ${label.secondary}`;
            })()
          : copy.farmServices;

        return (
          <ListingCard
            key={listing.id}
            href={`/services/${listing.id}`}
            eyebrow={eyebrow}
            title={listing.title}
            description={listing.description || undefined}
            imageUrl={photo}
            meta={
              <>
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
              </>
            }
          />
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
    mandal?: string;
    village?: string;
    q?: string;
    verified?: string;
  }>;
}) {
  const params = await searchParams;
  const categoryId = params.category ? Number(params.category) : undefined;
  const districtId = params.district ? Number(params.district) : undefined;
  const mandalId = params.mandal ? Number(params.mandal) : undefined;
  const villageId = params.village ? Number(params.village) : undefined;
  const query = params.q?.trim() || undefined;
  const verifiedOnly = params.verified === "1";
  const { locale } = await getRequestLocale();
  const copy = t(locale);

  const supabase = await createClient();
  const [{ data: categories }, { data: districts }, { data: mandals }, { data: villages }] =
    await Promise.all([
      supabase
        .from("service_categories")
        .select("id, name_en, name_te")
        .order("name_en"),
      supabase
        .from("districts")
        .select("id, name, states!inner(name)")
        .in("states.name", ["Telangana", "Andhra Pradesh"])
        .order("name"),
      supabase.from("mandals").select("id, name, district_id").order("name"),
      supabase.from("villages").select("id, name, mandal_id").order("name"),
    ]);

  const stateName = (
    states: { name: string } | { name: string }[] | null | undefined,
  ) => {
    if (Array.isArray(states)) return states[0]?.name;
    return states?.name;
  };

  const sortedDistricts = [...(districts ?? [])].sort((a, b) => {
    const rank = (name?: string) => (name === "Telangana" ? 0 : 1);
    const byState = rank(stateName(a.states)) - rank(stateName(b.states));
    if (byState !== 0) return byState;
    return a.name.localeCompare(b.name);
  });

  const filteredMandals = (mandals ?? []).filter(
    (mandal) => !districtId || mandal.district_id === districtId,
  );
  // Cascade: only list villages after a mandal is chosen (avoids mega-dropdowns).
  const filteredVillages = mandalId
    ? (villages ?? []).filter((village) => village.mandal_id === mandalId)
    : [];

  return (
    <PageShell title={copy.servicesTitle} subtitle={copy.servicesSubtitle}>
      <div className="grid gap-6 lg:grid-cols-[minmax(16rem,20rem)_1fr]">
        <FilterPanel title={copy.filters}>
          <form className="grid gap-3">
            <label className="space-y-2 text-sm">
              <span className="font-medium">{copy.search}</span>
              <TextInput
                name="q"
                defaultValue={query ?? ""}
                placeholder={copy.searchPlaceholder}
              />
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">{copy.category}</span>
              <Select name="category" defaultValue={categoryId ?? ""}>
                <option value="">{copy.allCategories}</option>
                {categories?.map((category) => {
                  const label = categoryLabel(locale, category);
                  return (
                    <option key={category.id} value={category.id}>
                      {label.primary} — {label.secondary}
                    </option>
                  );
                })}
              </Select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">{copy.district}</span>
              <Select name="district" defaultValue={districtId ?? ""}>
                <option value="">{copy.allDistricts}</option>
                {sortedDistricts.map((district) => {
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
            <label className="space-y-2 text-sm">
              <span className="font-medium">{copy.mandal}</span>
              <Select name="mandal" defaultValue={mandalId ?? ""}>
                <option value="">{copy.allMandals}</option>
                {filteredMandals.map((mandal) => (
                  <option key={mandal.id} value={mandal.id}>
                    {mandal.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className="space-y-2 text-sm">
              <span className="font-medium">{copy.village}</span>
              <Select
                name="village"
                defaultValue={mandalId ? (villageId ?? "") : ""}
                disabled={!mandalId}
              >
                <option value="">
                  {mandalId ? copy.allVillages : copy.selectMandalFirst}
                </option>
                {filteredVillages.map((village) => (
                  <option key={village.id} value={village.id}>
                    {village.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                name="verified"
                value="1"
                defaultChecked={verifiedOnly}
              />
              <span>{copy.verifiedOnly}</span>
            </label>
            <button
              type="submit"
              className="w-full rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong"
            >
              {copy.applyFilters}
            </button>
          </form>
        </FilterPanel>

        <ServicesResults
          categoryId={categoryId}
          districtId={districtId}
          mandalId={mandalId}
          villageId={villageId}
          query={query}
          verifiedOnly={verifiedOnly}
          locale={locale}
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
    mandal?: string;
    village?: string;
    q?: string;
    verified?: string;
  }>;
}) {
  return (
    <Suspense fallback={<PageFallback title="Agricultural services" />}>
      <ServicesPageContent searchParams={searchParams} />
    </Suspense>
  );
}
