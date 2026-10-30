-- B8 Agri Mitra: sessions, messages, confirmation-gated actions
-- Schema: agri_mitra_sessions / messages / confirmations.
-- RLS: own sessions only; confirmations execute only when status=confirmed via Server Action.
-- Backward compatible: additive tables.
-- Rollback: drop tables/policies (no other modules depend on these).

create table if not exists public.agri_mitra_sessions (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  locale text not null default 'en' check (locale in ('en', 'te')),
  title text not null default 'Agri Mitra',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists agri_mitra_sessions_user_id_idx
  on public.agri_mitra_sessions (user_id, updated_at desc);

create trigger agri_mitra_sessions_set_updated_at
  before update on public.agri_mitra_sessions
  for each row execute function private.set_updated_at();

create table if not exists public.agri_mitra_messages (
  id bigint generated always as identity primary key,
  session_id bigint not null references public.agri_mitra_sessions (id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system', 'tool')),
  content text not null default '',
  tool_name text,
  tool_payload jsonb,
  created_at timestamptz not null default now()
);

create index if not exists agri_mitra_messages_session_id_idx
  on public.agri_mitra_messages (session_id, created_at);

create table if not exists public.agri_mitra_confirmations (
  id bigint generated always as identity primary key,
  session_id bigint not null references public.agri_mitra_sessions (id) on delete cascade,
  action_type text not null check (action_type in (
    'publish_farm_job',
    'publish_product_listing'
  )),
  payload jsonb not null default '{}'::jsonb,
  status text not null default 'pending'
    check (status in ('pending', 'confirmed', 'cancelled', 'executed', 'failed')),
  result_path text,
  error_message text not null default '',
  confirmed_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists agri_mitra_confirmations_session_id_idx
  on public.agri_mitra_confirmations (session_id, created_at desc);
create index if not exists agri_mitra_confirmations_status_idx
  on public.agri_mitra_confirmations (status)
  where status = 'pending';

alter table public.agri_mitra_sessions enable row level security;
alter table public.agri_mitra_messages enable row level security;
alter table public.agri_mitra_confirmations enable row level security;

grant select, insert, update on public.agri_mitra_sessions to authenticated;
grant select, insert on public.agri_mitra_messages to authenticated;
grant select, insert, update on public.agri_mitra_confirmations to authenticated;
grant select, insert, update, delete on public.agri_mitra_sessions to service_role;
grant select, insert, update, delete on public.agri_mitra_messages to service_role;
grant select, insert, update, delete on public.agri_mitra_confirmations to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

drop policy if exists agri_mitra_sessions_own on public.agri_mitra_sessions;
create policy agri_mitra_sessions_own on public.agri_mitra_sessions
  for all to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

drop policy if exists agri_mitra_messages_own on public.agri_mitra_messages;
create policy agri_mitra_messages_own on public.agri_mitra_messages
  for all to authenticated
  using (
    exists (
      select 1 from public.agri_mitra_sessions s
      where s.id = session_id and s.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.agri_mitra_sessions s
      where s.id = session_id and s.user_id = (select auth.uid())
    )
  );

drop policy if exists agri_mitra_confirmations_own on public.agri_mitra_confirmations;
create policy agri_mitra_confirmations_own on public.agri_mitra_confirmations
  for all to authenticated
  using (
    exists (
      select 1 from public.agri_mitra_sessions s
      where s.id = session_id and s.user_id = (select auth.uid())
    )
  )
  with check (
    exists (
      select 1 from public.agri_mitra_sessions s
      where s.id = session_id and s.user_id = (select auth.uid())
    )
  );
