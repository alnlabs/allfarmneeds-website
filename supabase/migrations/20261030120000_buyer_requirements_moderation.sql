-- B7 (Buyers): moderation parity for buyer_requirements
-- Schema: moderation_status; public browse = published + approved.
-- RLS: staff moderation; seller offers only against approved published requirements.
-- Backward compatible: additive; existing rows default approved.
-- Rollback: restore prior public-read + insert policies; drop staff policy/column (separate approval).

alter table public.buyer_requirements
  add column if not exists moderation_status text not null default 'approved'
    check (moderation_status in ('pending', 'approved', 'rejected'));

comment on column public.buyer_requirements.moderation_status is
  'Admin review state. Public browse shows published + approved.';

drop policy if exists buyer_requirements_public_read on public.buyer_requirements;
create policy buyer_requirements_public_read on public.buyer_requirements
  for select to anon, authenticated
  using (
    (
      status = 'published'
      and moderation_status = 'approved'
    )
    or buyer_id = (select auth.uid())
    or (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );

drop policy if exists buyer_requirements_staff_moderation on public.buyer_requirements;
create policy buyer_requirements_staff_moderation on public.buyer_requirements
  for update to authenticated
  using (
    (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  )
  with check (
    (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );

drop policy if exists seller_responses_insert_own on public.seller_responses;
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
        and buyer_requirements.moderation_status = 'approved'
        and buyer_requirements.buyer_id <> (select auth.uid())
    )
  );
