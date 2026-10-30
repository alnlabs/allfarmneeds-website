"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Field, Select } from "@/components/ui";
import {
  asLocationId,
  mandalsForDistrict,
  resolveInitialLocationIds,
  type LocationDistrict,
  type LocationMandal,
  type LocationVillage,
} from "@/lib/location-ui";
import { createClient } from "@/utils/supabase/client";

type Labels = {
  district: string;
  mandal: string;
  village: string;
  selectLocation: string;
  selectMandalFirst: string;
};

export function LocationCascade({
  districts,
  mandals,
  name = "village_id",
  districtName,
  initialVillageId,
  initialDistrictId,
  initialMandalId,
  initialVillages = [],
  labels,
  required = true,
  className,
}: {
  districts: LocationDistrict[];
  mandals: LocationMandal[];
  name?: string;
  /** When set, district select is submitted under this field name. */
  districtName?: string;
  initialVillageId?: number | null;
  initialDistrictId?: number | null;
  initialMandalId?: number | null;
  initialVillages?: LocationVillage[];
  labels: Labels;
  required?: boolean;
  className?: string;
}) {
  const initial = resolveInitialLocationIds({
    districts,
    mandals,
    savedVillageId: initialVillageId,
    savedMandalId: initialMandalId,
    savedDistrictId: initialDistrictId,
  });

  const [districtId, setDistrictId] = useState(initial.districtId);
  const [mandalId, setMandalId] = useState(initial.mandalId);
  const [villageId, setVillageId] = useState(
    initial.villageId || asLocationId(initialVillages[0]?.id) || 0,
  );
  const [villages, setVillages] = useState<LocationVillage[]>(initialVillages);
  const [loadingVillages, setLoadingVillages] = useState(false);
  const skipFirstFetch = useRef(
    Boolean(
      initial.mandalId &&
        initialVillages.length > 0 &&
        initialVillages.every(
          (v) => asLocationId(v.mandal_id) === initial.mandalId,
        ),
    ),
  );

  const filteredMandals = useMemo(
    () => mandalsForDistrict(mandals, districtId),
    [mandals, districtId],
  );

  useEffect(() => {
    let cancelled = false;
    if (!mandalId) {
      setVillages([]);
      return;
    }

    if (skipFirstFetch.current) {
      skipFirstFetch.current = false;
      return;
    }

    setLoadingVillages(true);
    const supabase = createClient();
    void supabase
      .from("villages")
      .select("id, name, mandal_id")
      .eq("mandal_id", mandalId)
      .order("name")
      .then(({ data }) => {
        if (cancelled) return;
        const next = (data ?? []) as LocationVillage[];
        setVillages(next);
        setVillageId((current) => {
          if (next.some((v) => asLocationId(v.id) === current)) return current;
          return asLocationId(next[0]?.id) ?? 0;
        });
        setLoadingVillages(false);
      });

    return () => {
      cancelled = true;
    };
  }, [mandalId]);

  function selectDistrict(nextDistrict: number) {
    setDistrictId(nextDistrict);
    const nextMandals = mandalsForDistrict(mandals, nextDistrict);
    const nextMandal = asLocationId(nextMandals[0]?.id) ?? 0;
    setMandalId(nextMandal);
    setVillageId(0);
    setVillages([]);
  }

  function selectMandal(nextMandal: number) {
    setMandalId(nextMandal);
    setVillageId(0);
    setVillages([]);
  }

  return (
    <div className={className ?? "space-y-4"}>
      <Field label={labels.district}>
        <Select
          name={districtName}
          value={districtId || ""}
          onChange={(event) => selectDistrict(Number(event.target.value))}
        >
          {districts.map((district) => (
            <option key={district.id} value={district.id}>
              {district.label ?? district.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={labels.mandal}>
        <Select
          value={mandalId || ""}
          onChange={(event) => selectMandal(Number(event.target.value))}
        >
          {filteredMandals.length === 0 ? (
            <option value="">{labels.selectMandalFirst}</option>
          ) : null}
          {filteredMandals.map((mandal) => (
            <option key={mandal.id} value={mandal.id}>
              {mandal.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label={labels.village}>
        <Select
          key={mandalId}
          name={name}
          value={villageId || ""}
          onChange={(event) => setVillageId(Number(event.target.value) || 0)}
          required={required}
          disabled={!mandalId || loadingVillages}
        >
          <option value="">
            {loadingVillages ? "…" : labels.selectLocation}
          </option>
          {villages.map((village) => (
            <option key={village.id} value={village.id}>
              {village.name}
            </option>
          ))}
        </Select>
      </Field>
    </div>
  );
}
