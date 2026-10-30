#!/usr/bin/env python3
"""Regenerate supabase/migrations/*_seed_tg_ap_mandals_villages.sql from data/*.csv."""

from __future__ import annotations

import csv
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
OUT = ROOT / "supabase/migrations/20261030180000_seed_tg_ap_mandals_villages.sql"

CSV_TO_OURS = {
    "Jagitial": "Jagtial",
    "Jangoan": "Jangaon",
    "Jayashankar Bhupalapally": "Jayashankar Bhupalpally",
    "Medchal Malkajgiri": "Medchal-Malkajgiri",
    "Ranga Reddy": "Rangareddy",
    "Ntr": "NTR",
    "Y.S.R. Kadapa": "YSR Kadapa",
}

BATCH = 200

REMAPPING = r"""
-- 3) Remap references from Municipal towns villages onto same-named villages in real mandals.
-- Prefer a village whose mandal name matches the town name; else any same-named village in the district.

create temporary table municipal_remap (
  old_village_id bigint primary key,
  new_village_id bigint not null
) on commit drop;

insert into municipal_remap (old_village_id, new_village_id)
select oldv.id, coalesce(preferred.id, any_match.id) as new_id
from public.villages oldv
join public.mandals oldm on oldm.id = oldv.mandal_id
join public.districts d on d.id = oldm.district_id
left join lateral (
  select v.id
  from public.villages v
  join public.mandals m on m.id = v.mandal_id
  where m.district_id = d.id
    and m.name <> 'Municipal towns'
    and v.name = oldv.name
    and m.name = oldv.name
  order by v.id
  limit 1
) preferred on true
left join lateral (
  select v.id
  from public.villages v
  join public.mandals m on m.id = v.mandal_id
  where m.district_id = d.id
    and m.name <> 'Municipal towns'
    and v.name = oldv.name
  order by v.id
  limit 1
) any_match on true
where oldm.name = 'Municipal towns'
  and coalesce(preferred.id, any_match.id) is not null;

update public.farmer_profiles t set village_id = r.new_village_id
from municipal_remap r where t.village_id = r.old_village_id;

update public.worker_profiles t set village_id = r.new_village_id
from municipal_remap r where t.village_id = r.old_village_id;

update public.user_locations t set village_id = r.new_village_id
from municipal_remap r where t.village_id = r.old_village_id;

update public.buyer_operating_areas t set village_id = r.new_village_id
from municipal_remap r where t.village_id = r.old_village_id;

update public.service_listing_areas t set village_id = r.new_village_id
from municipal_remap r where t.village_id = r.old_village_id;

update public.farm_jobs t set village_id = r.new_village_id
from municipal_remap r where t.village_id = r.old_village_id;

update public.product_listings t set village_id = r.new_village_id
from municipal_remap r where t.village_id = r.old_village_id;

update public.buyer_requirements t set village_id = r.new_village_id
from municipal_remap r where t.village_id = r.old_village_id;

update public.farmer_profiles set village_id = null
where village_id in (
  select v.id from public.villages v
  join public.mandals m on m.id = v.mandal_id
  where m.name = 'Municipal towns'
);

update public.worker_profiles set village_id = null
where village_id in (
  select v.id from public.villages v
  join public.mandals m on m.id = v.mandal_id
  where m.name = 'Municipal towns'
);

update public.user_locations set village_id = null
where village_id in (
  select v.id from public.villages v
  join public.mandals m on m.id = v.mandal_id
  where m.name = 'Municipal towns'
);

delete from public.buyer_operating_areas
where village_id in (
  select v.id from public.villages v
  join public.mandals m on m.id = v.mandal_id
  where m.name = 'Municipal towns'
);

delete from public.service_listing_areas
where village_id in (
  select v.id from public.villages v
  join public.mandals m on m.id = v.mandal_id
  where m.name = 'Municipal towns'
);

update public.farm_jobs set village_id = null
where village_id in (
  select v.id from public.villages v
  join public.mandals m on m.id = v.mandal_id
  where m.name = 'Municipal towns'
);

update public.product_listings set village_id = null
where village_id in (
  select v.id from public.villages v
  join public.mandals m on m.id = v.mandal_id
  where m.name = 'Municipal towns'
);

update public.buyer_requirements set village_id = null
where village_id in (
  select v.id from public.villages v
  join public.mandals m on m.id = v.mandal_id
  where m.name = 'Municipal towns'
);

-- 4) Remove synthetic Municipal towns bucket.
delete from public.villages v
using public.mandals m
where v.mandal_id = m.id
  and m.name = 'Municipal towns';

delete from public.mandals
where name = 'Municipal towns';
"""


def load(path: Path):
    with path.open(newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def esc(value: str) -> str:
    return value.replace("'", "''")


def main() -> None:
    rows = load(ROOT / "data/telangana_villages.csv") + load(
        ROOT / "data/andhra_pradesh_villages.csv"
    )
    mandals: dict[tuple[str, str, str], bool] = {}
    villages: list[tuple[str, str, str, str]] = []
    seen: set[tuple[str, str, str, str]] = set()

    for row in rows:
        state = row["State"].strip()
        district = CSV_TO_OURS.get(row["District"].strip(), row["District"].strip())
        mandal = row["Mandal"].strip()
        village = row["Village"].strip()
        if not mandal or not village:
            continue
        mandals[(state, district, mandal)] = True
        key = (state, district, mandal, village)
        if key in seen:
            continue
        seen.add(key)
        villages.append(key)

    parts: list[str] = [
        "-- Seed real TG/AP mandals and villages (District → Mandal → Village).\n"
        "-- Source: LGD-derived CSV (india-village-finder v1.3.0).\n"
        "-- Regenerate with: python3 scripts/generate-location-seed.py\n\n"
    ]

    mandal_list = sorted(mandals.keys())
    parts.append("-- 1) Mandals\n")
    for i in range(0, len(mandal_list), BATCH):
        batch = mandal_list[i : i + BATCH]
        values = ",\n  ".join(
            f"('{esc(s)}', '{esc(d)}', '{esc(m)}')" for s, d, m in batch
        )
        parts.append(
            f"""insert into public.mandals (district_id, name)
select districts.id, v.mandal_name
from (values
  {values}
) as v(state_name, district_name, mandal_name)
join public.states on states.name = v.state_name
join public.districts on districts.state_id = states.id and districts.name = v.district_name
on conflict (district_id, name) do nothing;

"""
        )

    parts.append("-- 2) Villages\n")
    for i in range(0, len(villages), BATCH):
        batch = villages[i : i + BATCH]
        values = ",\n  ".join(
            f"('{esc(s)}', '{esc(d)}', '{esc(m)}', '{esc(v)}')" for s, d, m, v in batch
        )
        parts.append(
            f"""insert into public.villages (mandal_id, name)
select mandals.id, v.village_name
from (values
  {values}
) as v(state_name, district_name, mandal_name, village_name)
join public.states on states.name = v.state_name
join public.districts on districts.state_id = states.id and districts.name = v.district_name
join public.mandals on mandals.district_id = districts.id and mandals.name = v.mandal_name
on conflict (mandal_id, name) do nothing;

"""
        )

    OUT.write_text("".join(parts) + REMAPPING, encoding="utf-8")
    print(f"Wrote {OUT} ({OUT.stat().st_size} bytes)")
    print(f"Mandals {len(mandal_list)}, villages {len(villages)}")


if __name__ == "__main__":
    main()
