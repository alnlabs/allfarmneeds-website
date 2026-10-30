-- AllFarmNeeds marketplace foundation.
-- Identity lives in auth.users. Public tables hold profiles, locations,
-- and the four marketplace areas: services, farm jobs, products, buyers.

create schema if not exists private;

revoke all on schema private from public;
grant usage on schema private to authenticated;

create or replace function private.set_updated_at()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- Locations: India -> State -> District -> Mandal -> Village

create table public.states (
  id bigint generated always as identity primary key,
  country_code text not null default 'IN',
  name text not null,
  created_at timestamptz not null default now(),
  unique (country_code, name)
);

create table public.districts (
  id bigint generated always as identity primary key,
  state_id bigint not null references public.states (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (state_id, name)
);

create index districts_state_id_idx on public.districts (state_id);

create table public.mandals (
  id bigint generated always as identity primary key,
  district_id bigint not null references public.districts (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (district_id, name)
);

create index mandals_district_id_idx on public.mandals (district_id);

create table public.villages (
  id bigint generated always as identity primary key,
  mandal_id bigint not null references public.mandals (id) on delete cascade,
  name text not null,
  created_at timestamptz not null default now(),
  unique (mandal_id, name)
);

create index villages_mandal_id_idx on public.villages (mandal_id);

-- Accounts and roles

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  display_name text not null default '',
  avatar_url text,
  preferred_language text not null default 'te'
    check (preferred_language in ('te', 'en')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute function private.set_updated_at();

create table public.user_roles (
  user_id uuid not null references public.profiles (id) on delete cascade,
  role text not null check (role in (
    'farmer',
    'worker',
    'labour_contractor',
    'service_provider',
    'buyer',
    'retailer',
    'agricultural_professional',
    'administrator',
    'moderator'
  )),
  created_at timestamptz not null default now(),
  primary key (user_id, role)
);

create index user_roles_role_idx on public.user_roles (role);

create or replace function private.current_user_has_role(requested_role text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.user_roles
    where user_id = (select auth.uid())
      and role = requested_role
  );
$$;

revoke all on function private.current_user_has_role(text) from public;
grant execute on function private.current_user_has_role(text) to authenticated;

create or replace function private.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function private.handle_new_user();

insert into public.profiles (id)
select id from auth.users
on conflict (id) do nothing;

create table public.user_locations (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  village_id bigint not null references public.villages (id),
  label text,
  is_primary boolean not null default false,
  created_at timestamptz not null default now()
);

create index user_locations_user_id_idx on public.user_locations (user_id);
create index user_locations_village_id_idx on public.user_locations (village_id);
create unique index user_locations_one_primary_idx
  on public.user_locations (user_id)
  where is_primary;

create table public.farmer_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  village_id bigint references public.villages (id),
  about text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index farmer_profiles_village_id_idx on public.farmer_profiles (village_id);

create trigger farmer_profiles_set_updated_at
  before update on public.farmer_profiles
  for each row execute function private.set_updated_at();

create table public.worker_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  village_id bigint references public.villages (id),
  work_radius_km numeric(6,1) check (work_radius_km is null or work_radius_km >= 0),
  experience text not null default '',
  expected_compensation text not null default '',
  availability text not null default '',
  languages text[] not null default array['te']::text[],
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index worker_profiles_village_id_idx on public.worker_profiles (village_id);

create trigger worker_profiles_set_updated_at
  before update on public.worker_profiles
  for each row execute function private.set_updated_at();

create table public.provider_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  business_name text not null default '',
  about text not null default '',
  logo_url text,
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger provider_profiles_set_updated_at
  before update on public.provider_profiles
  for each row execute function private.set_updated_at();

create table public.buyer_profiles (
  user_id uuid primary key references public.profiles (id) on delete cascade,
  business_name text not null default '',
  business_type text not null default 'individual'
    check (business_type in (
      'individual', 'trader', 'wholesaler', 'retailer',
      'restaurant', 'processor', 'other'
    )),
  about text not null default '',
  verification_status text not null default 'unverified'
    check (verification_status in ('unverified', 'pending', 'verified', 'rejected')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger buyer_profiles_set_updated_at
  before update on public.buyer_profiles
  for each row execute function private.set_updated_at();

create or replace function private.keep_unverified_until_staff()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if (select private.current_user_has_role('administrator'))
     or (select private.current_user_has_role('moderator')) then
    return new;
  end if;

  if tg_op = 'INSERT' then
    new.verification_status = 'unverified';
  else
    new.verification_status = old.verification_status;
  end if;

  return new;
end;
$$;

create trigger provider_profiles_protect_verification
  before insert or update on public.provider_profiles
  for each row execute function private.keep_unverified_until_staff();

create trigger buyer_profiles_protect_verification
  before insert or update on public.buyer_profiles
  for each row execute function private.keep_unverified_until_staff();

create table public.buyer_operating_areas (
  id bigint generated always as identity primary key,
  buyer_id uuid not null references public.buyer_profiles (user_id) on delete cascade,
  district_id bigint references public.districts (id),
  mandal_id bigint references public.mandals (id),
  village_id bigint references public.villages (id),
  created_at timestamptz not null default now(),
  constraint buyer_operating_areas_one_place check (
    num_nonnulls(district_id, mandal_id, village_id) = 1
  )
);

create index buyer_operating_areas_buyer_id_idx on public.buyer_operating_areas (buyer_id);
create index buyer_operating_areas_district_id_idx on public.buyer_operating_areas (district_id);
create index buyer_operating_areas_mandal_id_idx on public.buyer_operating_areas (mandal_id);
create index buyer_operating_areas_village_id_idx on public.buyer_operating_areas (village_id);

-- Services

create table public.service_categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name_en text not null,
  name_te text not null,
  created_at timestamptz not null default now()
);

create table public.service_listings (
  id bigint generated always as identity primary key,
  provider_id uuid not null references public.profiles (id) on delete cascade,
  category_id bigint not null references public.service_categories (id),
  title text not null,
  description text not null default '',
  photo_urls text[] not null default '{}',
  price_amount numeric(12,2) check (price_amount is null or price_amount >= 0),
  price_unit text check (price_unit is null or price_unit in (
    'acre', 'hour', 'day', 'half_day', 'job', 'kilometre'
  )),
  minimum_booking text,
  availability_note text,
  travel_charge_note text,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'paused', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index service_listings_provider_id_idx on public.service_listings (provider_id);
create index service_listings_category_id_idx on public.service_listings (category_id);
create index service_listings_published_category_idx
  on public.service_listings (category_id)
  where status = 'published';

create trigger service_listings_set_updated_at
  before update on public.service_listings
  for each row execute function private.set_updated_at();

create table public.service_listing_areas (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.service_listings (id) on delete cascade,
  district_id bigint references public.districts (id),
  mandal_id bigint references public.mandals (id),
  village_id bigint references public.villages (id),
  constraint service_listing_areas_one_place check (
    num_nonnulls(district_id, mandal_id, village_id) = 1
  )
);

create index service_listing_areas_listing_id_idx on public.service_listing_areas (listing_id);
create index service_listing_areas_district_id_idx on public.service_listing_areas (district_id);
create index service_listing_areas_mandal_id_idx on public.service_listing_areas (mandal_id);
create index service_listing_areas_village_id_idx on public.service_listing_areas (village_id);

-- Farm jobs

create table public.job_categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name_en text not null,
  name_te text not null,
  created_at timestamptz not null default now()
);

create table public.worker_skills (
  user_id uuid not null references public.worker_profiles (user_id) on delete cascade,
  job_category_id bigint not null references public.job_categories (id),
  primary key (user_id, job_category_id)
);

create index worker_skills_job_category_id_idx on public.worker_skills (job_category_id);

create table public.farm_jobs (
  id bigint generated always as identity primary key,
  farmer_id uuid not null references public.profiles (id) on delete cascade,
  category_id bigint not null references public.job_categories (id),
  title text not null,
  description text not null default '',
  workers_required integer not null check (workers_required > 0),
  village_id bigint references public.villages (id),
  work_date date,
  start_time time,
  expected_duration text,
  payment_model text check (payment_model is null or payment_model in (
    'hourly', 'half_day', 'full_day', 'per_acre', 'per_task', 'quantity'
  )),
  advertised_amount numeric(12,2) check (advertised_amount is null or advertised_amount >= 0),
  food_water_accommodation text,
  application_deadline timestamptz,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'filled', 'closed', 'cancelled')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index farm_jobs_farmer_id_idx on public.farm_jobs (farmer_id);
create index farm_jobs_category_id_idx on public.farm_jobs (category_id);
create index farm_jobs_village_id_idx on public.farm_jobs (village_id);
create index farm_jobs_published_date_idx
  on public.farm_jobs (work_date, category_id)
  where status = 'published';

create trigger farm_jobs_set_updated_at
  before update on public.farm_jobs
  for each row execute function private.set_updated_at();

create table public.job_applications (
  id bigint generated always as identity primary key,
  job_id bigint not null references public.farm_jobs (id) on delete cascade,
  worker_id uuid not null references public.profiles (id) on delete cascade,
  note text not null default '',
  status text not null default 'submitted'
    check (status in ('submitted', 'selected', 'declined', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (job_id, worker_id)
);

create index job_applications_job_id_idx on public.job_applications (job_id);
create index job_applications_worker_id_idx on public.job_applications (worker_id);

create trigger job_applications_set_updated_at
  before update on public.job_applications
  for each row execute function private.set_updated_at();

create or replace function private.guard_job_application_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  farmer uuid;
begin
  select farmer_id into farmer
  from public.farm_jobs
  where id = old.job_id;

  new.job_id = old.job_id;
  new.worker_id = old.worker_id;
  new.note = old.note;
  new.created_at = old.created_at;

  if actor = old.worker_id then
    if new.status <> 'withdrawn' then
      raise exception 'workers can only withdraw an application';
    end if;
  elsif actor = farmer then
    if new.status not in ('submitted', 'selected', 'declined') then
      raise exception 'invalid application status';
    end if;
  else
    raise exception 'not allowed to update this application';
  end if;

  return new;
end;
$$;

create trigger job_applications_guard_update
  before update on public.job_applications
  for each row execute function private.guard_job_application_update();

-- Products

create table public.product_categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name_en text not null,
  name_te text not null,
  created_at timestamptz not null default now()
);

create table public.product_listings (
  id bigint generated always as identity primary key,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  category_id bigint not null references public.product_categories (id),
  title text not null,
  description text not null default '',
  photo_urls text[] not null default '{}',
  quantity_available numeric(14,3) not null check (quantity_available >= 0),
  quantity_unit text not null check (quantity_unit in (
    'kg', 'quintal', 'tonne', 'litre', 'piece'
  )),
  expected_price numeric(12,2) check (expected_price is null or expected_price >= 0),
  price_unit text check (price_unit is null or price_unit in (
    'kg', 'quintal', 'tonne', 'litre', 'piece'
  )),
  quality_grade text,
  available_on date,
  village_id bigint references public.villages (id),
  minimum_order_quantity numeric(14,3) check (
    minimum_order_quantity is null or minimum_order_quantity >= 0
  ),
  fulfillment text not null default 'pickup'
    check (fulfillment in ('pickup', 'delivery', 'either')),
  expires_on date,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'partially_sold', 'sold', 'expired', 'closed')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index product_listings_seller_id_idx on public.product_listings (seller_id);
create index product_listings_category_id_idx on public.product_listings (category_id);
create index product_listings_village_id_idx on public.product_listings (village_id);
create index product_listings_published_category_idx
  on public.product_listings (category_id)
  where status = 'published';

create trigger product_listings_set_updated_at
  before update on public.product_listings
  for each row execute function private.set_updated_at();

-- Buyer requirements

create table public.buyer_requirements (
  id bigint generated always as identity primary key,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  category_id bigint not null references public.product_categories (id),
  title text not null,
  description text not null default '',
  quantity numeric(14,3) check (quantity is null or quantity >= 0),
  quantity_unit text check (quantity_unit is null or quantity_unit in (
    'kg', 'quintal', 'tonne', 'litre', 'piece'
  )),
  district_id bigint references public.districts (id),
  village_id bigint references public.villages (id),
  needed_from date,
  needed_until date,
  expected_price numeric(12,2) check (expected_price is null or expected_price >= 0),
  price_unit text check (price_unit is null or price_unit in (
    'kg', 'quintal', 'tonne', 'litre', 'piece'
  )),
  quality_notes text,
  expires_on date,
  status text not null default 'draft'
    check (status in ('draft', 'published', 'closed', 'expired')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index buyer_requirements_buyer_id_idx on public.buyer_requirements (buyer_id);
create index buyer_requirements_category_id_idx on public.buyer_requirements (category_id);
create index buyer_requirements_district_id_idx on public.buyer_requirements (district_id);
create index buyer_requirements_village_id_idx on public.buyer_requirements (village_id);
create index buyer_requirements_published_category_idx
  on public.buyer_requirements (category_id)
  where status = 'published';

create trigger buyer_requirements_set_updated_at
  before update on public.buyer_requirements
  for each row execute function private.set_updated_at();

create table public.seller_responses (
  id bigint generated always as identity primary key,
  requirement_id bigint not null references public.buyer_requirements (id) on delete cascade,
  seller_id uuid not null references public.profiles (id) on delete cascade,
  quantity numeric(14,3) check (quantity is null or quantity >= 0),
  quantity_unit text check (quantity_unit is null or quantity_unit in (
    'kg', 'quintal', 'tonne', 'litre', 'piece'
  )),
  price_amount numeric(12,2) check (price_amount is null or price_amount >= 0),
  price_unit text check (price_unit is null or price_unit in (
    'kg', 'quintal', 'tonne', 'litre', 'piece'
  )),
  quality_notes text not null default '',
  delivery_note text not null default '',
  status text not null default 'offered'
    check (status in ('offered', 'accepted', 'declined', 'withdrawn')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (requirement_id, seller_id)
);

create index seller_responses_requirement_id_idx on public.seller_responses (requirement_id);
create index seller_responses_seller_id_idx on public.seller_responses (seller_id);

create trigger seller_responses_set_updated_at
  before update on public.seller_responses
  for each row execute function private.set_updated_at();

create or replace function private.guard_seller_response_update()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  buyer uuid;
begin
  select buyer_id into buyer
  from public.buyer_requirements
  where id = old.requirement_id;

  new.requirement_id = old.requirement_id;
  new.seller_id = old.seller_id;
  new.quantity = old.quantity;
  new.quantity_unit = old.quantity_unit;
  new.price_amount = old.price_amount;
  new.price_unit = old.price_unit;
  new.quality_notes = old.quality_notes;
  new.delivery_note = old.delivery_note;
  new.created_at = old.created_at;

  if actor = old.seller_id then
    if new.status <> 'withdrawn' then
      raise exception 'sellers can only withdraw a response';
    end if;
  elsif actor = buyer then
    if new.status not in ('offered', 'accepted', 'declined') then
      raise exception 'invalid response status';
    end if;
  else
    raise exception 'not allowed to update this response';
  end if;

  return new;
end;
$$;

create trigger seller_responses_guard_update
  before update on public.seller_responses
  for each row execute function private.guard_seller_response_update();

-- Enquiries keep phone numbers off the public listing.

create table public.enquiries (
  id bigint generated always as identity primary key,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  recipient_id uuid not null references public.profiles (id),
  service_listing_id bigint references public.service_listings (id) on delete cascade,
  farm_job_id bigint references public.farm_jobs (id) on delete cascade,
  product_listing_id bigint references public.product_listings (id) on delete cascade,
  buyer_requirement_id bigint references public.buyer_requirements (id) on delete cascade,
  message text not null,
  status text not null default 'open' check (status in ('open', 'closed')),
  created_at timestamptz not null default now(),
  constraint enquiries_one_subject check (
    num_nonnulls(
      service_listing_id,
      farm_job_id,
      product_listing_id,
      buyer_requirement_id
    ) = 1
  )
);

create index enquiries_sender_id_idx on public.enquiries (sender_id);
create index enquiries_recipient_id_idx on public.enquiries (recipient_id);
create index enquiries_service_listing_id_idx on public.enquiries (service_listing_id);
create index enquiries_farm_job_id_idx on public.enquiries (farm_job_id);
create index enquiries_product_listing_id_idx on public.enquiries (product_listing_id);
create index enquiries_buyer_requirement_id_idx on public.enquiries (buyer_requirement_id);

create or replace function private.set_enquiry_recipient()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  owner_id uuid;
begin
  if new.sender_id is distinct from (select auth.uid()) then
    raise exception 'sender must be the signed-in user';
  end if;

  if new.service_listing_id is not null then
    select provider_id into owner_id
    from public.service_listings
    where id = new.service_listing_id
      and status = 'published';
  elsif new.farm_job_id is not null then
    select farmer_id into owner_id
    from public.farm_jobs
    where id = new.farm_job_id
      and status = 'published';
  elsif new.product_listing_id is not null then
    select seller_id into owner_id
    from public.product_listings
    where id = new.product_listing_id
      and status in ('published', 'partially_sold');
  elsif new.buyer_requirement_id is not null then
    select buyer_id into owner_id
    from public.buyer_requirements
    where id = new.buyer_requirement_id
      and status = 'published';
  end if;

  if owner_id is null then
    raise exception 'enquiry subject is not available';
  end if;

  if owner_id = new.sender_id then
    raise exception 'cannot enquire on your own listing';
  end if;

  new.recipient_id = owner_id;
  return new;
end;
$$;

create trigger enquiries_set_recipient
  before insert on public.enquiries
  for each row execute function private.set_enquiry_recipient();

create or replace function private.freeze_enquiry_content()
returns trigger
language plpgsql
set search_path = ''
as $$
begin
  new.sender_id = old.sender_id;
  new.recipient_id = old.recipient_id;
  new.service_listing_id = old.service_listing_id;
  new.farm_job_id = old.farm_job_id;
  new.product_listing_id = old.product_listing_id;
  new.buyer_requirement_id = old.buyer_requirement_id;
  new.message = old.message;
  new.created_at = old.created_at;
  return new;
end;
$$;

create trigger enquiries_freeze_content
  before update on public.enquiries
  for each row execute function private.freeze_enquiry_content();

create table public.reports (
  id bigint generated always as identity primary key,
  reporter_id uuid not null references public.profiles (id) on delete cascade,
  target_type text not null check (target_type in (
    'profile',
    'service_listing',
    'farm_job',
    'product_listing',
    'buyer_requirement',
    'enquiry'
  )),
  target_id text not null,
  reason text not null,
  status text not null default 'open'
    check (status in ('open', 'reviewed', 'dismissed')),
  created_at timestamptz not null default now()
);

create index reports_reporter_id_idx on public.reports (reporter_id);
create index reports_status_idx on public.reports (status);

-- Seed Telangana and the categories named in the product plan.

insert into public.states (country_code, name)
values ('IN', 'Telangana');

insert into public.districts (state_id, name)
select states.id, district.name
from public.states
cross join (
  values
    ('Adilabad'),
    ('Bhadradri Kothagudem'),
    ('Hanumakonda'),
    ('Hyderabad'),
    ('Jagtial'),
    ('Jangaon'),
    ('Jayashankar Bhupalpally'),
    ('Jogulamba Gadwal'),
    ('Kamareddy'),
    ('Karimnagar'),
    ('Khammam'),
    ('Kumuram Bheem Asifabad'),
    ('Mahabubabad'),
    ('Mahabubnagar'),
    ('Mancherial'),
    ('Medak'),
    ('Medchal-Malkajgiri'),
    ('Mulugu'),
    ('Nagarkurnool'),
    ('Nalgonda'),
    ('Narayanpet'),
    ('Nirmal'),
    ('Nizamabad'),
    ('Peddapalli'),
    ('Rajanna Sircilla'),
    ('Rangareddy'),
    ('Sangareddy'),
    ('Siddipet'),
    ('Suryapet'),
    ('Vikarabad'),
    ('Wanaparthy'),
    ('Warangal'),
    ('Yadadri Bhuvanagiri')
) as district(name)
where states.country_code = 'IN'
  and states.name = 'Telangana';

insert into public.service_categories (slug, name_en, name_te)
values
  ('tractor-rental', 'Tractor rental', 'ట్రాక్టర్ అద్దె'),
  ('ploughing', 'Rotavator, cultivator and ploughing', 'దుక్కి మరియు రోటవేటర్'),
  ('harvester', 'Harvester and machinery', 'హార్వెస్టర్'),
  ('earthmoving', 'JCB and earthmoving', 'జెసీబీ'),
  ('drone-spraying', 'Drone spraying and crop monitoring', 'డ్రోన్ స్ప్రేయింగ్'),
  ('pesticide-fertilizer', 'Pesticide and fertilizer application', 'పురుగు మందు మరియు ఎరువులు'),
  ('irrigation', 'Irrigation installation and repair', 'నీటిపారుదల'),
  ('borewell-pump', 'Borewell and pump services', 'బోరుబావి మరియు మోటారు'),
  ('drip-sprinkler', 'Drip and sprinkler systems', 'డ్రిప్ మరియు స్ప్రింక్లర్'),
  ('farm-labour', 'Farm labour services', 'వ్యవసాయ కూలీలు'),
  ('transport', 'Transport', 'రవాణా'),
  ('repairs', 'Machinery and electrical repairs', 'మరమ్మత్తులు'),
  ('fencing-sheds', 'Fencing and farm sheds', 'కంచె మరియు షెడ్లు'),
  ('veterinary', 'Veterinary and dairy equipment', 'పశు వైద్యం'),
  ('soil-testing', 'Soil testing and agronomy', 'మట్టి పరీక్ష');

insert into public.job_categories (slug, name_en, name_te)
values
  ('planting', 'Planting and transplantation', 'నాట్లు'),
  ('harvesting', 'Harvesting', 'కోత'),
  ('cotton-picking', 'Cotton picking', 'పత్తి తీయడం'),
  ('paddy-harvesting', 'Paddy harvesting', 'వరి కోత'),
  ('picking', 'Vegetable and fruit picking', 'కూరగాయలు మరియు పండ్లు కోయడం'),
  ('weeding', 'Weeding', 'కలుపు తీయడం'),
  ('fertilizer-application', 'Fertilizer application', 'ఎరువులు వేయడం'),
  ('irrigation', 'Irrigation', 'నీటిపారుదల పని'),
  ('farm-maintenance', 'Farm maintenance', 'పొలం నిర్వహణ'),
  ('livestock-care', 'Livestock care', 'పశువుల సంరక్షణ'),
  ('equipment-operation', 'Equipment operation', 'యంత్రాలు నడపడం'),
  ('loading', 'Loading and unloading', 'లోడింగ్'),
  ('fencing-construction', 'Fencing and farm construction', 'కంచె మరియు నిర్మాణం'),
  ('other', 'Other farm work', 'ఇతర పొలం పని');

insert into public.product_categories (slug, name_en, name_te)
values
  ('paddy', 'Paddy and rice', 'వరి మరియు బియ్యం'),
  ('cotton', 'Cotton', 'పత్తి'),
  ('maize', 'Maize', 'మొక్కజొన్న'),
  ('turmeric', 'Turmeric', 'పసుపు'),
  ('chilli', 'Chilli', 'మిరప'),
  ('groundnuts', 'Groundnuts', 'వేరుశనగ'),
  ('pulses', 'Pulses', 'పప్పుధాన్యాలు'),
  ('vegetables', 'Vegetables', 'కూరగాయలు'),
  ('fruits', 'Fruits', 'పండ్లు'),
  ('dairy', 'Milk and dairy', 'పాలు'),
  ('poultry', 'Eggs and poultry', 'గుడ్లు మరియు కోళ్లు'),
  ('livestock', 'Livestock', 'పశువులు'),
  ('seeds', 'Seeds and other permitted goods', 'విత్తనాలు');

-- Privileges. RLS still decides which rows each role can see.

grant select on
  public.states,
  public.districts,
  public.mandals,
  public.villages,
  public.service_categories,
  public.job_categories,
  public.product_categories
to anon, authenticated;

grant select, insert, update, delete on
  public.states,
  public.districts,
  public.mandals,
  public.villages,
  public.service_categories,
  public.job_categories,
  public.product_categories
to service_role;

grant select, update on public.profiles to authenticated;
grant select, insert, update, delete on public.profiles to service_role;

grant select, insert, delete on public.user_roles to authenticated;
grant select, insert, update, delete on public.user_roles to service_role;

grant select, insert, update, delete on
  public.user_locations,
  public.farmer_profiles,
  public.worker_profiles,
  public.provider_profiles,
  public.buyer_profiles,
  public.buyer_operating_areas,
  public.worker_skills,
  public.service_listings,
  public.service_listing_areas,
  public.farm_jobs,
  public.job_applications,
  public.product_listings,
  public.buyer_requirements,
  public.seller_responses,
  public.enquiries,
  public.reports
to authenticated, service_role;

grant select on
  public.profiles,
  public.provider_profiles,
  public.buyer_profiles,
  public.worker_profiles,
  public.farmer_profiles,
  public.service_listings,
  public.service_listing_areas,
  public.farm_jobs,
  public.product_listings,
  public.buyer_requirements
to anon;

grant usage, select on all sequences in schema public to authenticated, service_role;

-- Row level security

alter table public.states enable row level security;
alter table public.districts enable row level security;
alter table public.mandals enable row level security;
alter table public.villages enable row level security;
alter table public.profiles enable row level security;
alter table public.user_roles enable row level security;
alter table public.user_locations enable row level security;
alter table public.farmer_profiles enable row level security;
alter table public.worker_profiles enable row level security;
alter table public.provider_profiles enable row level security;
alter table public.buyer_profiles enable row level security;
alter table public.buyer_operating_areas enable row level security;
alter table public.service_categories enable row level security;
alter table public.service_listings enable row level security;
alter table public.service_listing_areas enable row level security;
alter table public.job_categories enable row level security;
alter table public.worker_skills enable row level security;
alter table public.farm_jobs enable row level security;
alter table public.job_applications enable row level security;
alter table public.product_categories enable row level security;
alter table public.product_listings enable row level security;
alter table public.buyer_requirements enable row level security;
alter table public.seller_responses enable row level security;
alter table public.enquiries enable row level security;
alter table public.reports enable row level security;

create policy states_public_read on public.states
  for select to anon, authenticated
  using (true);

create policy districts_public_read on public.districts
  for select to anon, authenticated
  using (true);

create policy mandals_public_read on public.mandals
  for select to anon, authenticated
  using (true);

create policy villages_public_read on public.villages
  for select to anon, authenticated
  using (true);

create policy service_categories_public_read on public.service_categories
  for select to anon, authenticated
  using (true);

create policy job_categories_public_read on public.job_categories
  for select to anon, authenticated
  using (true);

create policy product_categories_public_read on public.product_categories
  for select to anon, authenticated
  using (true);

create policy reference_data_admin_insert on public.states
  for insert to authenticated
  with check ((select private.current_user_has_role('administrator')));

create policy reference_data_admin_update on public.states
  for update to authenticated
  using ((select private.current_user_has_role('administrator')))
  with check ((select private.current_user_has_role('administrator')));

create policy reference_data_admin_delete on public.states
  for delete to authenticated
  using ((select private.current_user_has_role('administrator')));

create policy districts_admin_insert on public.districts
  for insert to authenticated
  with check ((select private.current_user_has_role('administrator')));

create policy districts_admin_update on public.districts
  for update to authenticated
  using ((select private.current_user_has_role('administrator')))
  with check ((select private.current_user_has_role('administrator')));

create policy districts_admin_delete on public.districts
  for delete to authenticated
  using ((select private.current_user_has_role('administrator')));

create policy mandals_admin_insert on public.mandals
  for insert to authenticated
  with check ((select private.current_user_has_role('administrator')));

create policy mandals_admin_update on public.mandals
  for update to authenticated
  using ((select private.current_user_has_role('administrator')))
  with check ((select private.current_user_has_role('administrator')));

create policy mandals_admin_delete on public.mandals
  for delete to authenticated
  using ((select private.current_user_has_role('administrator')));

create policy villages_admin_insert on public.villages
  for insert to authenticated
  with check ((select private.current_user_has_role('administrator')));

create policy villages_admin_update on public.villages
  for update to authenticated
  using ((select private.current_user_has_role('administrator')))
  with check ((select private.current_user_has_role('administrator')));

create policy villages_admin_delete on public.villages
  for delete to authenticated
  using ((select private.current_user_has_role('administrator')));

create policy service_categories_admin_insert on public.service_categories
  for insert to authenticated
  with check ((select private.current_user_has_role('administrator')));

create policy service_categories_admin_update on public.service_categories
  for update to authenticated
  using ((select private.current_user_has_role('administrator')))
  with check ((select private.current_user_has_role('administrator')));

create policy service_categories_admin_delete on public.service_categories
  for delete to authenticated
  using ((select private.current_user_has_role('administrator')));

create policy job_categories_admin_insert on public.job_categories
  for insert to authenticated
  with check ((select private.current_user_has_role('administrator')));

create policy job_categories_admin_update on public.job_categories
  for update to authenticated
  using ((select private.current_user_has_role('administrator')))
  with check ((select private.current_user_has_role('administrator')));

create policy job_categories_admin_delete on public.job_categories
  for delete to authenticated
  using ((select private.current_user_has_role('administrator')));

create policy product_categories_admin_insert on public.product_categories
  for insert to authenticated
  with check ((select private.current_user_has_role('administrator')));

create policy product_categories_admin_update on public.product_categories
  for update to authenticated
  using ((select private.current_user_has_role('administrator')))
  with check ((select private.current_user_has_role('administrator')));

create policy product_categories_admin_delete on public.product_categories
  for delete to authenticated
  using ((select private.current_user_has_role('administrator')));

create policy profiles_public_read on public.profiles
  for select to anon, authenticated
  using (true);

create policy profiles_update_own on public.profiles
  for update to authenticated
  using (id = (select auth.uid()))
  with check (id = (select auth.uid()));

create policy user_roles_select_own on public.user_roles
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );

create policy user_roles_insert_own on public.user_roles
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and role not in ('administrator', 'moderator')
  );

create policy user_roles_delete_own on public.user_roles
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    and role not in ('administrator', 'moderator')
  );

create policy user_locations_own on public.user_locations
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy farmer_profiles_public_read on public.farmer_profiles
  for select to anon, authenticated
  using (true);

create policy farmer_profiles_write_own on public.farmer_profiles
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select private.current_user_has_role('farmer'))
  );

create policy farmer_profiles_update_own on public.farmer_profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (select private.current_user_has_role('farmer'))
  );

create policy farmer_profiles_delete_own on public.farmer_profiles
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy worker_profiles_public_read on public.worker_profiles
  for select to anon, authenticated
  using (true);

create policy worker_profiles_insert_own on public.worker_profiles
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      (select private.current_user_has_role('worker'))
      or (select private.current_user_has_role('labour_contractor'))
    )
  );

create policy worker_profiles_update_own on public.worker_profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      (select private.current_user_has_role('worker'))
      or (select private.current_user_has_role('labour_contractor'))
    )
  );

create policy worker_profiles_delete_own on public.worker_profiles
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy provider_profiles_public_read on public.provider_profiles
  for select to anon, authenticated
  using (true);

create policy provider_profiles_insert_own on public.provider_profiles
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select private.current_user_has_role('service_provider'))
  );

create policy provider_profiles_update_own on public.provider_profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (select private.current_user_has_role('service_provider'))
  );

create policy provider_profiles_delete_own on public.provider_profiles
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy buyer_profiles_public_read on public.buyer_profiles
  for select to anon, authenticated
  using (true);

create policy buyer_profiles_insert_own on public.buyer_profiles
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (
      (select private.current_user_has_role('buyer'))
      or (select private.current_user_has_role('retailer'))
    )
  );

create policy buyer_profiles_update_own on public.buyer_profiles
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (
    user_id = (select auth.uid())
    and (
      (select private.current_user_has_role('buyer'))
      or (select private.current_user_has_role('retailer'))
    )
  );

create policy buyer_profiles_delete_own on public.buyer_profiles
  for delete to authenticated
  using (user_id = (select auth.uid()));

create policy buyer_operating_areas_public_read on public.buyer_operating_areas
  for select to anon, authenticated
  using (true);

create policy buyer_operating_areas_write_own on public.buyer_operating_areas
  for all to authenticated
  using (buyer_id = (select auth.uid()))
  with check (buyer_id = (select auth.uid()));

create policy worker_skills_public_read on public.worker_skills
  for select to anon, authenticated
  using (true);

create policy worker_skills_write_own on public.worker_skills
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy service_listings_public_read on public.service_listings
  for select to anon, authenticated
  using (
    status = 'published'
    or provider_id = (select auth.uid())
  );

create policy service_listings_insert_own on public.service_listings
  for insert to authenticated
  with check (
    provider_id = (select auth.uid())
    and (select private.current_user_has_role('service_provider'))
  );

create policy service_listings_update_own on public.service_listings
  for update to authenticated
  using (provider_id = (select auth.uid()))
  with check (provider_id = (select auth.uid()));

create policy service_listings_delete_own on public.service_listings
  for delete to authenticated
  using (provider_id = (select auth.uid()));

create policy service_listing_areas_public_read on public.service_listing_areas
  for select to anon, authenticated
  using (
    exists (
      select 1
      from public.service_listings
      where service_listings.id = listing_id
        and (
          service_listings.status = 'published'
          or service_listings.provider_id = (select auth.uid())
        )
    )
  );

create policy service_listing_areas_write_own on public.service_listing_areas
  for all to authenticated
  using (
    exists (
      select 1
      from public.service_listings
      where service_listings.id = listing_id
        and service_listings.provider_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1
      from public.service_listings
      where service_listings.id = listing_id
        and service_listings.provider_id = (select auth.uid())
    )
  );

create policy farm_jobs_public_read on public.farm_jobs
  for select to anon, authenticated
  using (
    status = 'published'
    or farmer_id = (select auth.uid())
  );

create policy farm_jobs_insert_own on public.farm_jobs
  for insert to authenticated
  with check (
    farmer_id = (select auth.uid())
    and (select private.current_user_has_role('farmer'))
  );

create policy farm_jobs_update_own on public.farm_jobs
  for update to authenticated
  using (farmer_id = (select auth.uid()))
  with check (farmer_id = (select auth.uid()));

create policy farm_jobs_delete_own on public.farm_jobs
  for delete to authenticated
  using (farmer_id = (select auth.uid()));

create policy job_applications_select_parties on public.job_applications
  for select to authenticated
  using (
    worker_id = (select auth.uid())
    or exists (
      select 1
      from public.farm_jobs
      where farm_jobs.id = job_id
        and farm_jobs.farmer_id = (select auth.uid())
    )
  );

create policy job_applications_insert_own on public.job_applications
  for insert to authenticated
  with check (
    worker_id = (select auth.uid())
    and (
      (select private.current_user_has_role('worker'))
      or (select private.current_user_has_role('labour_contractor'))
    )
    and exists (
      select 1
      from public.farm_jobs
      where farm_jobs.id = job_id
        and farm_jobs.status = 'published'
    )
  );

create policy job_applications_update_parties on public.job_applications
  for update to authenticated
  using (
    worker_id = (select auth.uid())
    or exists (
      select 1
      from public.farm_jobs
      where farm_jobs.id = job_id
        and farm_jobs.farmer_id = (select auth.uid())
    )
  )
  with check (
    worker_id = (select auth.uid())
    or exists (
      select 1
      from public.farm_jobs
      where farm_jobs.id = job_id
        and farm_jobs.farmer_id = (select auth.uid())
    )
  );

create policy product_listings_public_read on public.product_listings
  for select to anon, authenticated
  using (
    status in ('published', 'partially_sold')
    or seller_id = (select auth.uid())
  );

create policy product_listings_insert_own on public.product_listings
  for insert to authenticated
  with check (
    seller_id = (select auth.uid())
    and (select private.current_user_has_role('farmer'))
  );

create policy product_listings_update_own on public.product_listings
  for update to authenticated
  using (seller_id = (select auth.uid()))
  with check (seller_id = (select auth.uid()));

create policy product_listings_delete_own on public.product_listings
  for delete to authenticated
  using (seller_id = (select auth.uid()));

create policy buyer_requirements_public_read on public.buyer_requirements
  for select to anon, authenticated
  using (
    status = 'published'
    or buyer_id = (select auth.uid())
  );

create policy buyer_requirements_insert_own on public.buyer_requirements
  for insert to authenticated
  with check (
    buyer_id = (select auth.uid())
    and (
      (select private.current_user_has_role('buyer'))
      or (select private.current_user_has_role('retailer'))
    )
  );

create policy buyer_requirements_update_own on public.buyer_requirements
  for update to authenticated
  using (buyer_id = (select auth.uid()))
  with check (buyer_id = (select auth.uid()));

create policy buyer_requirements_delete_own on public.buyer_requirements
  for delete to authenticated
  using (buyer_id = (select auth.uid()));

create policy seller_responses_select_parties on public.seller_responses
  for select to authenticated
  using (
    seller_id = (select auth.uid())
    or exists (
      select 1
      from public.buyer_requirements
      where buyer_requirements.id = requirement_id
        and buyer_requirements.buyer_id = (select auth.uid())
    )
  );

create policy seller_responses_insert_own on public.seller_responses
  for insert to authenticated
  with check (
    seller_id = (select auth.uid())
    and (select private.current_user_has_role('farmer'))
    and exists (
      select 1
      from public.buyer_requirements
      where buyer_requirements.id = requirement_id
        and buyer_requirements.status = 'published'
        and buyer_requirements.buyer_id <> (select auth.uid())
    )
  );

create policy seller_responses_update_parties on public.seller_responses
  for update to authenticated
  using (
    seller_id = (select auth.uid())
    or exists (
      select 1
      from public.buyer_requirements
      where buyer_requirements.id = requirement_id
        and buyer_requirements.buyer_id = (select auth.uid())
    )
  )
  with check (
    seller_id = (select auth.uid())
    or exists (
      select 1
      from public.buyer_requirements
      where buyer_requirements.id = requirement_id
        and buyer_requirements.buyer_id = (select auth.uid())
    )
  );

create policy enquiries_select_parties on public.enquiries
  for select to authenticated
  using (
    sender_id = (select auth.uid())
    or recipient_id = (select auth.uid())
  );

create policy enquiries_insert_own on public.enquiries
  for insert to authenticated
  with check (sender_id = (select auth.uid()));

create policy enquiries_update_parties on public.enquiries
  for update to authenticated
  using (
    sender_id = (select auth.uid())
    or recipient_id = (select auth.uid())
  )
  with check (
    sender_id = (select auth.uid())
    or recipient_id = (select auth.uid())
  );

create policy reports_insert_own on public.reports
  for insert to authenticated
  with check (reporter_id = (select auth.uid()));

create policy reports_select_own_or_staff on public.reports
  for select to authenticated
  using (
    reporter_id = (select auth.uid())
    or (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );

create policy reports_staff_update on public.reports
  for update to authenticated
  using (
    (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  )
  with check (
    (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );
