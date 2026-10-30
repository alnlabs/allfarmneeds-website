export type LocationDistrict = { id: number; name: string; label?: string };
export type LocationMandal = { id: number; name: string; district_id: number };
export type LocationVillage = { id: number; name: string; mandal_id: number };

export function asLocationId(
  value: number | string | null | undefined,
): number | null {
  if (value == null || value === "") return null;
  const n = Number(value);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function mandalsForDistrict(
  mandals: LocationMandal[],
  districtId: number,
) {
  return mandals.filter((m) => asLocationId(m.district_id) === districtId);
}

export function resolveInitialLocationIds(args: {
  districts: LocationDistrict[];
  mandals: LocationMandal[];
  savedVillageId?: number | null;
  savedMandalId?: number | null;
  savedDistrictId?: number | null;
  fallbackDistrictName?: string;
}) {
  const {
    districts,
    mandals,
    savedVillageId,
    savedMandalId,
    savedDistrictId,
    fallbackDistrictName = "Rangareddy",
  } = args;

  const villageId = asLocationId(savedVillageId);
  const mandalIdFromSaved = asLocationId(savedMandalId);
  const districtIdFromSaved = asLocationId(savedDistrictId);

  const districtId =
    districtIdFromSaved ??
    asLocationId(
      districts.find((d) => d.name === fallbackDistrictName)?.id,
    ) ??
    asLocationId(districts[0]?.id) ??
    0;

  const districtMandals = mandalsForDistrict(mandals, districtId);
  const mandalId =
    mandalIdFromSaved &&
    districtMandals.some((m) => asLocationId(m.id) === mandalIdFromSaved)
      ? mandalIdFromSaved
      : (asLocationId(districtMandals[0]?.id) ?? 0);

  return {
    districtId,
    mandalId,
    villageId: villageId ?? 0,
  };
}
