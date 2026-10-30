-- B7 (Farm Jobs only): moderation parity for farm_jobs
-- Schema: add moderation_status; default approved for any existing rows.
-- RLS: public read requires published + approved; staff can moderate; applications require approved jobs.
-- Backward compatible: additive column; existing drafts unchanged; published jobs stay visible (default approved).
-- Rollback: restore prior public-read policy, drop staff policy, drop column (requires separate approval to drop).

alter table public.farm_jobs
  add column if not exists moderation_status text not null default 'approved'
    check (moderation_status in ('pending', 'approved', 'rejected'));

comment on column public.farm_jobs.moderation_status is
  'Admin review state. Public browse shows published + approved.';

drop policy if exists farm_jobs_public_read on public.farm_jobs;
create policy farm_jobs_public_read on public.farm_jobs
  for select to anon, authenticated
  using (
    (
      status = 'published'
      and moderation_status = 'approved'
    )
    or farmer_id = (select auth.uid())
    or (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );

drop policy if exists farm_jobs_staff_moderation on public.farm_jobs;
create policy farm_jobs_staff_moderation on public.farm_jobs
  for update to authenticated
  using (
    (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  )
  with check (
    (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );

-- Applications only against publicly approved jobs.
drop policy if exists job_applications_insert_own on public.job_applications;
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
        and farm_jobs.moderation_status = 'approved'
        and farm_jobs.farmer_id <> (select auth.uid())
    )
  );
