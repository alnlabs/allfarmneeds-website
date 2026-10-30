-- Phase 5 shared trust: B3 notifications, B4 reviews, B6 enquiry replies
-- Schema: notifications, reviews, enquiry_messages + notify helper + eligibility guard.
-- RLS: own notifications; reviews public visible; enquiry messages party-only.
-- Backward compatible: additive tables/policies/triggers; existing enquiries unchanged.
-- Rollback: drop triggers/functions/policies/tables (keep enquiries/reports).
-- Skips B2 media_assets (deferred).

-- ─── Notifications (B3) ───────────────────────────────────────────────────────

create table if not exists public.notifications (
  id bigint generated always as identity primary key,
  user_id uuid not null references public.profiles (id) on delete cascade,
  type text not null,
  title_en text not null,
  title_te text not null,
  body_en text not null default '',
  body_te text not null default '',
  link_path text not null default '/',
  entity_type text,
  entity_id text,
  read_at timestamptz,
  created_at timestamptz not null default now()
);

create index if not exists notifications_user_id_created_idx
  on public.notifications (user_id, created_at desc);
create index if not exists notifications_user_unread_idx
  on public.notifications (user_id)
  where read_at is null;

alter table public.notifications enable row level security;

grant select, update on public.notifications to authenticated;
grant select, insert, update, delete on public.notifications to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

drop policy if exists notifications_select_own on public.notifications;
create policy notifications_select_own on public.notifications
  for select to authenticated
  using (user_id = (select auth.uid()));

drop policy if exists notifications_update_own on public.notifications;
create policy notifications_update_own on public.notifications
  for update to authenticated
  using (user_id = (select auth.uid()))
  with check (user_id = (select auth.uid()));

create or replace function private.notify_user(
  p_user_id uuid,
  p_type text,
  p_title_en text,
  p_title_te text,
  p_body_en text,
  p_body_te text,
  p_link_path text,
  p_entity_type text default null,
  p_entity_id text default null
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if p_user_id is null then
    return;
  end if;
  insert into public.notifications (
    user_id, type, title_en, title_te, body_en, body_te,
    link_path, entity_type, entity_id
  ) values (
    p_user_id, p_type, p_title_en, p_title_te, coalesce(p_body_en, ''),
    coalesce(p_body_te, ''), coalesce(p_link_path, '/'),
    p_entity_type, p_entity_id
  );
end;
$$;

create or replace function private.notify_on_enquiry_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  perform private.notify_user(
    new.recipient_id,
    'enquiry',
    'New enquiry',
    'కొత్త సందేశం',
    left(new.message, 160),
    left(new.message, 160),
    '/messages/' || new.id::text,
    'enquiry',
    new.id::text
  );
  return new;
end;
$$;

drop trigger if exists enquiries_notify_insert on public.enquiries;
create trigger enquiries_notify_insert
  after insert on public.enquiries
  for each row execute function private.notify_on_enquiry_insert();

create or replace function private.notify_on_booking_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform private.notify_user(
      new.provider_id,
      'booking',
      'New booking request',
      'కొత్త బుకింగ్ అభ్యర్థన',
      left(coalesce(new.message, ''), 160),
      left(coalesce(new.message, ''), 160),
      '/provider/bookings',
      'service_booking',
      new.id::text
    );
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    perform private.notify_user(
      new.farmer_id,
      'booking_status',
      'Booking updated: ' || new.status,
      'బుకింగ్ అప్‌డేట్: ' || new.status,
      'Your booking status is now ' || new.status || '.',
      'మీ బుకింగ్ స్థితి ఇప్పుడు ' || new.status || '.',
      '/bookings',
      'service_booking',
      new.id::text
    );
  end if;
  return new;
end;
$$;

drop trigger if exists service_bookings_notify on public.service_bookings;
create trigger service_bookings_notify
  after insert or update on public.service_bookings
  for each row execute function private.notify_on_booking_change();

create or replace function private.notify_on_job_application_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  farmer uuid;
  job_title text;
begin
  select farmer_id, title into farmer, job_title
  from public.farm_jobs
  where id = new.job_id;

  if tg_op = 'INSERT' then
    perform private.notify_user(
      farmer,
      'job_application',
      'New job application',
      'కొత్త ఉద్యోగ దరఖాస్తు',
      coalesce(job_title, 'Farm job'),
      coalesce(job_title, 'Farm job'),
      '/farmer/jobs',
      'job_application',
      new.id::text
    );
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    perform private.notify_user(
      new.worker_id,
      'job_application_status',
      'Application ' || new.status,
      'దరఖాస్తు ' || new.status,
      coalesce(job_title, 'Farm job') || ' · ' || new.status,
      coalesce(job_title, 'Farm job') || ' · ' || new.status,
      '/worker/applications',
      'job_application',
      new.id::text
    );
  end if;
  return new;
end;
$$;

drop trigger if exists job_applications_notify on public.job_applications;
create trigger job_applications_notify
  after insert or update on public.job_applications
  for each row execute function private.notify_on_job_application_change();

create or replace function private.notify_on_product_deal_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  if tg_op = 'INSERT' then
    perform private.notify_user(
      new.seller_id,
      'product_deal',
      'New crop deal reserved',
      'కొత్త పంట డీల్ రిజర్వ్',
      new.quantity::text || ' ' || new.quantity_unit,
      new.quantity::text || ' ' || new.quantity_unit,
      '/seller/crops',
      'product_deal',
      new.id::text
    );
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    perform private.notify_user(
      case when new.status in ('accepted', 'rejected') then new.buyer_id else new.seller_id end,
      'product_deal_status',
      'Deal ' || new.status,
      'డీల్ ' || new.status,
      'Crop deal is now ' || new.status || '.',
      'పంట డీల్ ఇప్పుడు ' || new.status || '.',
      case
        when new.status in ('accepted', 'rejected') then '/buyer/deals'
        else '/seller/crops'
      end,
      'product_deal',
      new.id::text
    );
    if new.status in ('cancelled', 'completed') then
      perform private.notify_user(
        case when (select auth.uid()) = new.buyer_id then new.seller_id else new.buyer_id end,
        'product_deal_status',
        'Deal ' || new.status,
        'డీల్ ' || new.status,
        'Crop deal is now ' || new.status || '.',
        'పంట డీల్ ఇప్పుడు ' || new.status || '.',
        case
          when (select auth.uid()) = new.buyer_id then '/seller/crops'
          else '/buyer/deals'
        end,
        'product_deal',
        new.id::text
      );
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists product_deals_notify on public.product_deals;
create trigger product_deals_notify
  after insert or update on public.product_deals
  for each row execute function private.notify_on_product_deal_change();

create or replace function private.notify_on_seller_response_change()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  buyer uuid;
  req_title text;
begin
  select buyer_id, title into buyer, req_title
  from public.buyer_requirements
  where id = new.requirement_id;

  if tg_op = 'INSERT' then
    perform private.notify_user(
      buyer,
      'seller_offer',
      'New supply offer',
      'కొత్త సరఫరా ఆఫర్',
      coalesce(req_title, 'Requirement'),
      coalesce(req_title, 'Requirement'),
      '/buyers/' || new.requirement_id::text,
      'seller_response',
      new.id::text
    );
  elsif tg_op = 'UPDATE' and new.status is distinct from old.status then
    perform private.notify_user(
      new.seller_id,
      'seller_offer_status',
      'Offer ' || new.status,
      'ఆఫర్ ' || new.status,
      coalesce(req_title, 'Requirement') || ' · ' || new.status,
      coalesce(req_title, 'Requirement') || ' · ' || new.status,
      '/buyers/' || new.requirement_id::text,
      'seller_response',
      new.id::text
    );
  end if;
  return new;
end;
$$;

drop trigger if exists seller_responses_notify on public.seller_responses;
create trigger seller_responses_notify
  after insert or update on public.seller_responses
  for each row execute function private.notify_on_seller_response_change();

-- ─── Enquiry replies (B6) ───────────────────────────────────────────────────

create table if not exists public.enquiry_messages (
  id bigint generated always as identity primary key,
  enquiry_id bigint not null references public.enquiries (id) on delete cascade,
  sender_id uuid not null references public.profiles (id) on delete cascade,
  body text not null check (char_length(trim(body)) > 0),
  created_at timestamptz not null default now()
);

create index if not exists enquiry_messages_enquiry_id_idx
  on public.enquiry_messages (enquiry_id, created_at);

alter table public.enquiry_messages enable row level security;

grant select, insert on public.enquiry_messages to authenticated;
grant select, insert, update, delete on public.enquiry_messages to service_role;

drop policy if exists enquiry_messages_select_parties on public.enquiry_messages;
create policy enquiry_messages_select_parties on public.enquiry_messages
  for select to authenticated
  using (
    exists (
      select 1 from public.enquiries e
      where e.id = enquiry_id
        and (e.sender_id = (select auth.uid()) or e.recipient_id = (select auth.uid()))
    )
  );

drop policy if exists enquiry_messages_insert_parties on public.enquiry_messages;
create policy enquiry_messages_insert_parties on public.enquiry_messages
  for insert to authenticated
  with check (
    sender_id = (select auth.uid())
    and exists (
      select 1 from public.enquiries e
      where e.id = enquiry_id
        and e.status = 'open'
        and (e.sender_id = (select auth.uid()) or e.recipient_id = (select auth.uid()))
    )
  );

create or replace function private.notify_on_enquiry_message_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  other_party uuid;
begin
  select case
    when e.sender_id = new.sender_id then e.recipient_id
    else e.sender_id
  end into other_party
  from public.enquiries e
  where e.id = new.enquiry_id;

  perform private.notify_user(
    other_party,
    'enquiry_reply',
    'Enquiry reply',
    'సందేశం ప్రత్యుత్తరం',
    left(new.body, 160),
    left(new.body, 160),
    '/messages/' || new.enquiry_id::text,
    'enquiry',
    new.enquiry_id::text
  );
  return new;
end;
$$;

drop trigger if exists enquiry_messages_notify_insert on public.enquiry_messages;
create trigger enquiry_messages_notify_insert
  after insert on public.enquiry_messages
  for each row execute function private.notify_on_enquiry_message_insert();

-- ─── Reviews (B4) ───────────────────────────────────────────────────────────

create table if not exists public.reviews (
  id bigint generated always as identity primary key,
  reviewer_id uuid not null references public.profiles (id) on delete cascade,
  reviewee_id uuid not null references public.profiles (id) on delete cascade,
  entity_type text not null check (entity_type in (
    'service_booking',
    'job_application',
    'product_deal'
  )),
  entity_id bigint not null,
  rating smallint not null check (rating between 1 and 5),
  comment text not null default '',
  status text not null default 'visible'
    check (status in ('visible', 'hidden')),
  created_at timestamptz not null default now(),
  constraint reviews_not_self check (reviewer_id <> reviewee_id),
  unique (reviewer_id, entity_type, entity_id)
);

create index if not exists reviews_reviewee_id_idx on public.reviews (reviewee_id);
create index if not exists reviews_entity_idx on public.reviews (entity_type, entity_id);

alter table public.reviews enable row level security;

grant select, insert on public.reviews to authenticated;
grant select, insert, update, delete on public.reviews to service_role;

drop policy if exists reviews_public_read on public.reviews;
create policy reviews_public_read on public.reviews
  for select to anon, authenticated
  using (
    status = 'visible'
    or reviewer_id = (select auth.uid())
    or reviewee_id = (select auth.uid())
    or (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );

drop policy if exists reviews_insert_own on public.reviews;
create policy reviews_insert_own on public.reviews
  for insert to authenticated
  with check (reviewer_id = (select auth.uid()));

drop policy if exists reviews_staff_update on public.reviews;
create policy reviews_staff_update on public.reviews
  for update to authenticated
  using (
    (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  )
  with check (
    (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );

create or replace function private.guard_review_insert()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  ok boolean := false;
  other uuid;
begin
  if new.reviewer_id is distinct from (select auth.uid())
     and not (
       (select private.current_user_has_role('administrator'))
       or (select private.current_user_has_role('moderator'))
     ) then
    raise exception 'reviewer must be signed-in user';
  end if;

  if new.entity_type = 'service_booking' then
    select
      case
        when b.status = 'completed' and b.farmer_id = new.reviewer_id then b.provider_id
        when b.status = 'completed' and b.provider_id = new.reviewer_id then b.farmer_id
        else null
      end
    into other
    from public.service_bookings b
    where b.id = new.entity_id;
    ok := other is not null and other = new.reviewee_id;
  elsif new.entity_type = 'job_application' then
    select
      case
        when a.status = 'selected' and a.worker_id = new.reviewer_id then j.farmer_id
        when a.status = 'selected' and j.farmer_id = new.reviewer_id then a.worker_id
        else null
      end
    into other
    from public.job_applications a
    join public.farm_jobs j on j.id = a.job_id
    where a.id = new.entity_id;
    ok := other is not null and other = new.reviewee_id;
  elsif new.entity_type = 'product_deal' then
    select
      case
        when d.status in ('accepted', 'completed') and d.buyer_id = new.reviewer_id then d.seller_id
        when d.status in ('accepted', 'completed') and d.seller_id = new.reviewer_id then d.buyer_id
        else null
      end
    into other
    from public.product_deals d
    where d.id = new.entity_id;
    ok := other is not null and other = new.reviewee_id;
  end if;

  if not ok then
    raise exception 'review not allowed for this entity/status';
  end if;

  return new;
end;
$$;

drop trigger if exists reviews_guard_insert on public.reviews;
create trigger reviews_guard_insert
  before insert on public.reviews
  for each row execute function private.guard_review_insert();
