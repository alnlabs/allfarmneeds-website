import { createClient } from "@/utils/supabase/server";

export async function getListingFormOptions() {
  const supabase = await createClient();

  const [
    { data: categories },
    { data: districts },
    { data: mandals },
    { data: villages },
  ] = await Promise.all([
    supabase
      .from("service_categories")
      .select("id, name_en, name_te")
      .order("name_en"),
    supabase
      .from("districts")
      .select("id, name, state_id, states!inner(name)")
      .in("states.name", ["Telangana", "Andhra Pradesh"])
      .order("name"),
    supabase.from("mandals").select("id, name, district_id").order("name"),
    supabase.from("villages").select("id, name, mandal_id").order("name"),
  ]);

  return {
    categories: categories ?? [],
    districts: (districts ?? []).map((district) => {
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
    mandals: mandals ?? [],
    villages: villages ?? [],
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
