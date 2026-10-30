import { createClient } from "@/utils/supabase/server";

async function fetchAllRows<T>(
  query: (from: number, to: number) => PromiseLike<{ data: T[] | null }>,
  pageSize = 1000,
) {
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const { data } = await query(from, from + pageSize - 1);
    if (!data?.length) break;
    rows.push(...data);
    if (data.length < pageSize) break;
  }
  return rows;
}

export async function getTgApLocationOptions() {
  const supabase = await createClient();
  const [districts, mandals] = await Promise.all([
    fetchAllRows<{
      id: number;
      name: string;
      state_id: number;
      states: { name: string } | { name: string }[] | null;
    }>((from, to) =>
      supabase
        .from("districts")
        .select("id, name, state_id, states!inner(name)")
        .in("states.name", ["Telangana", "Andhra Pradesh"])
        .order("name")
        .range(from, to),
    ),
    fetchAllRows<{ id: number; name: string; district_id: number }>(
      (from, to) =>
        supabase
          .from("mandals")
          .select("id, name, district_id")
          .order("name")
          .range(from, to),
    ),
  ]);

  return {
    districts: districts.map((district) => {
      const state = Array.isArray(district.states)
        ? district.states[0]
        : district.states;
      return {
        id: district.id,
        name: district.name,
        state_name: state?.name ?? "",
        label: state?.name
          ? `${district.name} (${state.name})`
          : district.name,
      };
    }),
    mandals,
  };
}

export async function getVillagesForMandal(mandalId: number) {
  if (!mandalId) return [];
  const supabase = await createClient();
  const { data } = await supabase
    .from("villages")
    .select("id, name, mandal_id")
    .eq("mandal_id", mandalId)
    .order("name");
  return data ?? [];
}

export async function resolveVillageLocation(villageId: number | null | undefined) {
  if (!villageId) return null;
  const supabase = await createClient();
  const { data: village } = await supabase
    .from("villages")
    .select("id, name, mandal_id, mandals(id, name, district_id)")
    .eq("id", villageId)
    .maybeSingle();

  if (!village) return null;
  const mandal = Array.isArray(village.mandals)
    ? village.mandals[0]
    : village.mandals;
  if (!mandal) return null;

  const villages = await getVillagesForMandal(mandal.id);
  return {
    villageId: village.id,
    villageName: village.name,
    mandalId: mandal.id,
    mandalName: mandal.name,
    districtId: mandal.district_id,
    villages,
  };
}

export async function getListingFormOptions() {
  const supabase = await createClient();
  const [{ data: categories }, locations] = await Promise.all([
    supabase
      .from("service_categories")
      .select("id, name_en, name_te")
      .order("name_en"),
    getTgApLocationOptions(),
  ]);

  return {
    categories: categories ?? [],
    ...locations,
  };
}

export async function getJobFormOptions() {
  const supabase = await createClient();
  const [{ data: categories }, locations] = await Promise.all([
    supabase
      .from("job_categories")
      .select("id, name_en, name_te")
      .order("name_en"),
    getTgApLocationOptions(),
  ]);

  return {
    categories: categories ?? [],
    ...locations,
  };
}

export async function getProductFormOptions() {
  const supabase = await createClient();
  const [{ data: categories }, locations] = await Promise.all([
    supabase
      .from("product_categories")
      .select("id, name_en, name_te")
      .order("name_en"),
    getTgApLocationOptions(),
  ]);

  return {
    categories: categories ?? [],
    ...locations,
  };
}

export function formatArea(area: {
  districts?: { name: string } | { name: string }[] | null;
  mandals?: { name: string } | { name: string }[] | null;
  villages?: { name: string } | { name: string }[] | null;
}) {
  const district = Array.isArray(area.districts)
    ? area.districts[0]?.name
    : area.districts?.name;
  const mandal = Array.isArray(area.mandals)
    ? area.mandals[0]?.name
    : area.mandals?.name;
  const village = Array.isArray(area.villages)
    ? area.villages[0]?.name
    : area.villages?.name;

  return village ?? mandal ?? district ?? "Area not set";
}
