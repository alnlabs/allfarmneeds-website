-- B1: Provider contact privacy
-- Schema: private contacts table + secure RPC; public profile phone columns nulled (not dropped).
-- RLS: contacts readable by owner/staff only; public/counterparties use get_provider_contact().
-- Backward compatible: additive; app reads RPC / private table; old columns retained empty.
-- Rollback: restore phones onto provider_profiles from private table, then drop RPC/table/policies.

create table if not exists public.provider_private_contacts (
  user_id uuid primary key references public.provider_profiles (user_id) on delete cascade,
  phone text,
  whatsapp text,
  updated_at timestamptz not null default now()
);

comment on table public.provider_private_contacts is
  'Sensitive provider phone/WhatsApp. Never grant public SELECT; use get_provider_contact().';

create trigger provider_private_contacts_set_updated_at
  before update on public.provider_private_contacts
  for each row execute function private.set_updated_at();

-- Move any existing numbers into the private table, then clear public columns.
insert into public.provider_private_contacts (user_id, phone, whatsapp)
select user_id, phone, whatsapp
from public.provider_profiles
where phone is not null or whatsapp is not null
on conflict (user_id) do update
set
  phone = excluded.phone,
  whatsapp = excluded.whatsapp,
  updated_at = now();

update public.provider_profiles
set phone = null, whatsapp = null
where phone is not null or whatsapp is not null;

alter table public.provider_private_contacts enable row level security;

grant select, insert, update, delete on public.provider_private_contacts to authenticated;
grant select, insert, update, delete on public.provider_private_contacts to service_role;
-- Explicitly no grants to anon.

create policy provider_private_contacts_select_own on public.provider_private_contacts
  for select to authenticated
  using (
    user_id = (select auth.uid())
    or (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );

create policy provider_private_contacts_insert_own on public.provider_private_contacts
  for insert to authenticated
  with check (
    user_id = (select auth.uid())
    and (select private.current_user_has_role('service_provider'))
  );

create policy provider_private_contacts_update_own on public.provider_private_contacts
  for update to authenticated
  using (
    user_id = (select auth.uid())
    and (select private.current_user_has_role('service_provider'))
  )
  with check (
    user_id = (select auth.uid())
    and (select private.current_user_has_role('service_provider'))
  );

create policy provider_private_contacts_delete_own on public.provider_private_contacts
  for delete to authenticated
  using (
    user_id = (select auth.uid())
    and (select private.current_user_has_role('service_provider'))
  );

create or replace function public.get_provider_contact(p_provider_id uuid)
returns table (phone text, whatsapp text, show_contact_publicly boolean)
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  is_public boolean := false;
  allow_read boolean := false;
begin
  select coalesce(pp.show_contact_publicly, false)
  into is_public
  from public.provider_profiles pp
  where pp.user_id = p_provider_id;

  if not found then
    return;
  end if;

  if actor is not null and actor = p_provider_id then
    allow_read := true;
  elsif (select private.current_user_has_role('administrator'))
     or (select private.current_user_has_role('moderator')) then
    allow_read := true;
  elsif is_public then
    allow_read := true;
  elsif actor is not null and exists (
    select 1
    from public.service_bookings sb
    where sb.provider_id = p_provider_id
      and sb.farmer_id = actor
      and sb.status in (
        'requested', 'accepted', 'scheduled', 'in_progress', 'completed', 'disputed'
      )
  ) then
    allow_read := true;
  elsif actor is not null and exists (
    select 1
    from public.enquiries e
    where e.recipient_id = p_provider_id
      and e.sender_id = actor
      and e.status = 'open'
  ) then
    allow_read := true;
  end if;

  if not allow_read then
    return query
      select null::text, null::text, is_public;
    return;
  end if;

  return query
    select c.phone, c.whatsapp, is_public
    from (select p_provider_id as uid) p
    left join public.provider_private_contacts c on c.user_id = p.uid;
end;
$$;

revoke all on function public.get_provider_contact(uuid) from public;
grant execute on function public.get_provider_contact(uuid) to anon, authenticated, service_role;

comment on function public.get_provider_contact(uuid) is
  'Returns provider phone/WhatsApp only for owner, staff, public opt-in, or active booking/enquiry counterparties.';
