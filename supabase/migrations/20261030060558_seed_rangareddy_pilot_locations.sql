-- Pilot location seed for Rangareddy (plan candidate district).
-- Mandals and a few villages so providers can set service areas.

with rr as (
  select districts.id
  from public.districts
  join public.states on states.id = districts.state_id
  where states.name = 'Telangana'
    and districts.name = 'Rangareddy'
)
insert into public.mandals (district_id, name)
select rr.id, mandal.name
from rr
cross join (
  values
    ('Shamshabad'),
    ('Chevella'),
    ('Ibrahimpatnam'),
    ('Maheshwaram'),
    ('Shankarpally'),
    ('Pargi'),
    ('Tandur')
) as mandal(name)
on conflict (district_id, name) do nothing;

insert into public.villages (mandal_id, name)
select mandals.id, village.name
from public.mandals
join public.districts on districts.id = mandals.district_id
join public.states on states.id = districts.state_id
cross join lateral (
  select *
  from (
    values
      ('Shamshabad', 'Shamshabad'),
      ('Shamshabad', 'Mankhal'),
      ('Shamshabad', 'Pedda Golconda'),
      ('Chevella', 'Chevella'),
      ('Chevella', 'Aloor'),
      ('Chevella', 'Kandawada'),
      ('Ibrahimpatnam', 'Ibrahimpatnam'),
      ('Ibrahimpatnam', 'Yacharam'),
      ('Ibrahimpatnam', 'Manchal'),
      ('Maheshwaram', 'Maheshwaram'),
      ('Maheshwaram', 'Imamguda'),
      ('Maheshwaram', 'Raviryal'),
      ('Shankarpally', 'Shankarpally'),
      ('Shankarpally', 'Mokila'),
      ('Shankarpally', 'Donthanpally'),
      ('Pargi', 'Pargi'),
      ('Pargi', 'Syedalipur'),
      ('Tandur', 'Tandur'),
      ('Tandur', 'Peddamul')
  ) as v(mandal_name, name)
) as village
where states.name = 'Telangana'
  and districts.name = 'Rangareddy'
  and mandals.name = village.mandal_name
on conflict (mandal_id, name) do nothing;
