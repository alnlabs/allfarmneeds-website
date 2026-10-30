-- Phase 1 extensions: provider contact prefs, listing moderation,
-- service bookings, and public service-photo storage.

alter table public.provider_profiles
  add column if not exists phone text,
  add column if not exists whatsapp text,
  add column if not exists show_contact_publicly boolean not null default false;

alter table public.service_listings
  add column if not exists moderation_status text not null default 'approved'
    check (moderation_status in ('pending', 'approved', 'rejected'));

comment on column public.service_listings.moderation_status is
  'Admin review state. Public browse shows published + approved.';

create table if not exists public.service_bookings (
  id bigint generated always as identity primary key,
  listing_id bigint not null references public.service_listings (id) on delete cascade,
  farmer_id uuid not null references public.profiles (id) on delete cascade,
  provider_id uuid not null references public.profiles (id),
  message text not null default '',
  preferred_date date,
  status text not null default 'requested'
    check (status in (
      'requested',
      'accepted',
      'rejected',
      'scheduled',
      'in_progress',
      'completed',
      'cancelled',
      'disputed'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists service_bookings_listing_id_idx
  on public.service_bookings (listing_id);
create index if not exists service_bookings_farmer_id_idx
  on public.service_bookings (farmer_id);
create index if not exists service_bookings_provider_id_idx
  on public.service_bookings (provider_id);
create index if not exists service_bookings_status_idx
  on public.service_bookings (status);

create trigger service_bookings_set_updated_at
  before update on public.service_bookings
  for each row execute function private.set_updated_at();

alter table public.service_bookings enable row level security;

grant select, insert, update on public.service_bookings to authenticated;
grant select, insert, update, delete on public.service_bookings to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

create policy service_bookings_select_parties on public.service_bookings
  for select to authenticated
  using (
    farmer_id = (select auth.uid())
    or provider_id = (select auth.uid())
    or (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );

create policy service_bookings_insert_farmer on public.service_bookings
  for insert to authenticated
  with check (
    farmer_id = (select auth.uid())
    and (
      (select private.current_user_has_role('farmer'))
      or (select private.current_user_has_role('service_provider'))
    )
    and exists (
      select 1
      from public.service_listings
      where service_listings.id = listing_id
        and service_listings.status = 'published'
        and service_listings.moderation_status = 'approved'
        and service_listings.provider_id = provider_id
        and service_listings.provider_id <> (select auth.uid())
    )
  );

create policy service_bookings_update_parties on public.service_bookings
  for update to authenticated
  using (
    farmer_id = (select auth.uid())
    or provider_id = (select auth.uid())
    or (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  )
  with check (
    farmer_id = (select auth.uid())
    or provider_id = (select auth.uid())
    or (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );

-- Storage bucket for listing photos
insert into storage.buckets (id, name, public)
values ('service-photos', 'service-photos', true)
on conflict (id) do nothing;

create policy service_photos_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'service-photos');

create policy service_photos_owner_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'service-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy service_photos_owner_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'service-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'service-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy service_photos_owner_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'service-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

-- Public browse requires published + approved; owners and staff see all theirs / all.
drop policy if exists service_listings_public_read on public.service_listings;
create policy service_listings_public_read on public.service_listings
  for select to anon, authenticated
  using (
    (
      status = 'published'
      and moderation_status = 'approved'
    )
    or provider_id = (select auth.uid())
    or (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );

drop policy if exists service_listing_areas_public_read on public.service_listing_areas;
create policy service_listing_areas_public_read on public.service_listing_areas
  for select to anon, authenticated
  using (
    exists (
      select 1
      from public.service_listings
      where service_listings.id = listing_id
        and (
          (
            service_listings.status = 'published'
            and service_listings.moderation_status = 'approved'
          )
          or service_listings.provider_id = (select auth.uid())
          or (select private.current_user_has_role('administrator'))
          or (select private.current_user_has_role('moderator'))
        )
    )
  );

-- Staff can moderate listings (approve / reject)
create policy service_listings_staff_moderation on public.service_listings
  for update to authenticated
  using (
    (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  )
  with check (
    (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );
