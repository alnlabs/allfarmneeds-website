-- FOR ALL includes SELECT, which overlapped the public read policies.

drop policy buyer_operating_areas_write_own on public.buyer_operating_areas;
drop policy service_listing_areas_write_own on public.service_listing_areas;
drop policy worker_skills_write_own on public.worker_skills;

create policy buyer_operating_areas_insert_own on public.buyer_operating_areas
  for insert to authenticated
  with check (buyer_id = (select auth.uid()));

create policy buyer_operating_areas_update_own on public.buyer_operating_areas
  for update to authenticated
  using (buyer_id = (select auth.uid()))
  with check (buyer_id = (select auth.uid()));

create policy buyer_operating_areas_delete_own on public.buyer_operating_areas
  for delete to authenticated
  using (buyer_id = (select auth.uid()));

create policy service_listing_areas_insert_own on public.service_listing_areas
  for insert to authenticated
  with check (
    exists (
      select 1
      from public.service_listings
      where service_listings.id = listing_id
        and service_listings.provider_id = (select auth.uid())
    )
  );

create policy service_listing_areas_update_own on public.service_listing_areas
  for update to authenticated
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

create policy service_listing_areas_delete_own on public.service_listing_areas
  for delete to authenticated
  using (
    exists (
      select 1
      from public.service_listings
      where service_listings.id = listing_id
        and service_listings.provider_id = (select auth.uid())
    )
  );

create policy worker_skills_insert_own on public.worker_skills
  for insert to authenticated
  with check (user_id = (select auth.uid()));

create policy worker_skills_update_own on public.worker_skills
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create policy worker_skills_delete_own on public.worker_skills
  for delete to authenticated
  using (user_id = (select auth.uid()));
