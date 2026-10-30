-- Crop Marketplace: B7 product moderation + B5 atomic deals + product-photos bucket
-- Schema: moderation_status; product_deals; product_inventory_events; storage bucket.
-- RLS: public read published/partially_sold + approved; deal writes via SECURITY DEFINER RPCs.
-- Backward compatible: additive; photo_urls retained; no column drops.
-- Rollback: drop RPCs, policies, deals/events tables, bucket policies; keep listings.

alter table public.product_listings
  add column if not exists moderation_status text not null default 'approved'
    check (moderation_status in ('pending', 'approved', 'rejected'));

comment on column public.product_listings.moderation_status is
  'Admin review state. Public browse shows published/partially_sold + approved.';

drop policy if exists product_listings_public_read on public.product_listings;
create policy product_listings_public_read on public.product_listings
  for select to anon, authenticated
  using (
    (
      status in ('published', 'partially_sold')
      and moderation_status = 'approved'
    )
    or seller_id = (select auth.uid())
    or (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );

drop policy if exists product_listings_staff_moderation on public.product_listings;
create policy product_listings_staff_moderation on public.product_listings
  for update to authenticated
  using (
    (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  )
  with check (
    (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );

create table if not exists public.product_deals (
  id bigint generated always as identity primary key,
  product_listing_id bigint not null references public.product_listings (id) on delete cascade,
  buyer_id uuid not null references public.profiles (id) on delete cascade,
  seller_id uuid not null references public.profiles (id),
  quantity numeric(14,3) not null check (quantity > 0),
  quantity_unit text not null check (quantity_unit in (
    'kg', 'quintal', 'tonne', 'litre', 'piece'
  )),
  price_amount numeric(12,2) check (price_amount is null or price_amount >= 0),
  price_unit text check (price_unit is null or price_unit in (
    'kg', 'quintal', 'tonne', 'litre', 'piece'
  )),
  message text not null default '',
  status text not null default 'reserved'
    check (status in (
      'reserved',
      'accepted',
      'completed',
      'cancelled',
      'rejected'
    )),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists product_deals_listing_id_idx
  on public.product_deals (product_listing_id);
create index if not exists product_deals_buyer_id_idx
  on public.product_deals (buyer_id);
create index if not exists product_deals_seller_id_idx
  on public.product_deals (seller_id);
create index if not exists product_deals_status_idx
  on public.product_deals (status);

create trigger product_deals_set_updated_at
  before update on public.product_deals
  for each row execute function private.set_updated_at();

create table if not exists public.product_inventory_events (
  id bigint generated always as identity primary key,
  product_listing_id bigint not null references public.product_listings (id) on delete cascade,
  deal_id bigint references public.product_deals (id) on delete set null,
  actor_id uuid references public.profiles (id),
  event_type text not null check (event_type in (
    'reserved',
    'released',
    'completed',
    'manual_adjust'
  )),
  quantity_delta numeric(14,3) not null,
  quantity_after numeric(14,3) not null check (quantity_after >= 0),
  note text not null default '',
  created_at timestamptz not null default now()
);

create index if not exists product_inventory_events_listing_id_idx
  on public.product_inventory_events (product_listing_id);
create index if not exists product_inventory_events_deal_id_idx
  on public.product_inventory_events (deal_id);

alter table public.product_deals enable row level security;
alter table public.product_inventory_events enable row level security;

grant select on public.product_deals to authenticated;
grant select on public.product_inventory_events to authenticated;
grant select, insert, update, delete on public.product_deals to service_role;
grant select, insert, update, delete on public.product_inventory_events to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;

create policy product_deals_select_parties on public.product_deals
  for select to authenticated
  using (
    buyer_id = (select auth.uid())
    or seller_id = (select auth.uid())
    or (select private.current_user_has_role('administrator'))
    or (select private.current_user_has_role('moderator'))
  );

create policy product_inventory_events_select_parties on public.product_inventory_events
  for select to authenticated
  using (
    exists (
      select 1
      from public.product_listings pl
      where pl.id = product_listing_id
        and (
          pl.seller_id = (select auth.uid())
          or (select private.current_user_has_role('administrator'))
          or (select private.current_user_has_role('moderator'))
        )
    )
    or exists (
      select 1
      from public.product_deals d
      where d.id = deal_id
        and (
          d.buyer_id = (select auth.uid())
          or d.seller_id = (select auth.uid())
        )
    )
  );

-- Atomic reserve: lock listing row, decrement qty, write deal + history.
create or replace function public.create_product_deal_reservation(
  p_listing_id bigint,
  p_quantity numeric,
  p_message text default '',
  p_price_amount numeric default null
)
returns public.product_deals
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  listing public.product_listings%rowtype;
  deal public.product_deals%rowtype;
  next_qty numeric(14,3);
  next_status text;
begin
  if actor is null then
    raise exception 'not authenticated';
  end if;
  if p_quantity is null or p_quantity <= 0 then
    raise exception 'quantity must be positive';
  end if;
  if not (
    (select private.current_user_has_role('buyer'))
    or (select private.current_user_has_role('retailer'))
    or (select private.current_user_has_role('farmer'))
  ) then
    raise exception 'buyer role required';
  end if;

  select * into listing
  from public.product_listings
  where id = p_listing_id
  for update;

  if not found then
    raise exception 'listing not found';
  end if;
  if listing.seller_id = actor then
    raise exception 'cannot buy your own listing';
  end if;
  if listing.moderation_status <> 'approved'
     or listing.status not in ('published', 'partially_sold') then
    raise exception 'listing is not available for purchase';
  end if;
  if listing.minimum_order_quantity is not null
     and p_quantity < listing.minimum_order_quantity then
    raise exception 'quantity below minimum order';
  end if;
  if listing.quantity_available < p_quantity then
    raise exception 'insufficient quantity available';
  end if;

  next_qty := listing.quantity_available - p_quantity;
  next_status := case
    when next_qty = 0 then 'sold'
    else 'partially_sold'
  end;

  update public.product_listings
  set
    quantity_available = next_qty,
    status = next_status,
    updated_at = now()
  where id = listing.id;

  insert into public.product_deals (
    product_listing_id,
    buyer_id,
    seller_id,
    quantity,
    quantity_unit,
    price_amount,
    price_unit,
    message,
    status
  )
  values (
    listing.id,
    actor,
    listing.seller_id,
    p_quantity,
    listing.quantity_unit,
    coalesce(p_price_amount, listing.expected_price),
    listing.price_unit,
    coalesce(p_message, ''),
    'reserved'
  )
  returning * into deal;

  insert into public.product_inventory_events (
    product_listing_id,
    deal_id,
    actor_id,
    event_type,
    quantity_delta,
    quantity_after,
    note
  )
  values (
    listing.id,
    deal.id,
    actor,
    'reserved',
    -p_quantity,
    next_qty,
    'Buyer reserved quantity'
  );

  return deal;
end;
$$;

create or replace function public.transition_product_deal(
  p_deal_id bigint,
  p_new_status text
)
returns public.product_deals
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := (select auth.uid());
  deal public.product_deals%rowtype;
  listing public.product_listings%rowtype;
  next_qty numeric(14,3);
  next_listing_status text;
begin
  if actor is null then
    raise exception 'not authenticated';
  end if;
  if p_new_status not in ('accepted', 'completed', 'cancelled', 'rejected') then
    raise exception 'invalid status';
  end if;

  select * into deal
  from public.product_deals
  where id = p_deal_id
  for update;

  if not found then
    raise exception 'deal not found';
  end if;

  select * into listing
  from public.product_listings
  where id = deal.product_listing_id
  for update;

  if p_new_status = 'accepted' then
    if actor <> deal.seller_id
       and not (
         (select private.current_user_has_role('administrator'))
         or (select private.current_user_has_role('moderator'))
       ) then
      raise exception 'only seller can accept';
    end if;
    if deal.status <> 'reserved' then
      raise exception 'only reserved deals can be accepted';
    end if;
    update public.product_deals
    set status = 'accepted', updated_at = now()
    where id = deal.id
    returning * into deal;
    return deal;
  end if;

  if p_new_status = 'completed' then
    if actor not in (deal.seller_id, deal.buyer_id)
       and not (
         (select private.current_user_has_role('administrator'))
         or (select private.current_user_has_role('moderator'))
       ) then
      raise exception 'not allowed to complete';
    end if;
    if deal.status not in ('reserved', 'accepted') then
      raise exception 'deal cannot be completed from current status';
    end if;
    update public.product_deals
    set status = 'completed', updated_at = now()
    where id = deal.id
    returning * into deal;

    insert into public.product_inventory_events (
      product_listing_id, deal_id, actor_id, event_type, quantity_delta, quantity_after, note
    ) values (
      listing.id, deal.id, actor, 'completed', 0, listing.quantity_available, 'Deal completed'
    );
    return deal;
  end if;

  -- cancelled or rejected: release reservation if still holding inventory
  if actor <> deal.buyer_id
     and actor <> deal.seller_id
     and not (
       (select private.current_user_has_role('administrator'))
       or (select private.current_user_has_role('moderator'))
     ) then
    raise exception 'not allowed to cancel/reject';
  end if;
  if p_new_status = 'rejected' and actor = deal.buyer_id then
    raise exception 'buyer cannot reject; use cancel';
  end if;
  if deal.status not in ('reserved', 'accepted') then
    raise exception 'deal is not active';
  end if;

  next_qty := listing.quantity_available + deal.quantity;
  next_listing_status := case
    when next_qty = 0 then 'sold'
    when listing.status in ('sold', 'partially_sold', 'published') then 'published'
    else listing.status
  end;

  update public.product_listings
  set
    quantity_available = next_qty,
    status = next_listing_status,
    updated_at = now()
  where id = listing.id;

  update public.product_deals
  set status = p_new_status, updated_at = now()
  where id = deal.id
  returning * into deal;

  insert into public.product_inventory_events (
    product_listing_id, deal_id, actor_id, event_type, quantity_delta, quantity_after, note
  ) values (
    listing.id,
    deal.id,
    actor,
    'released',
    deal.quantity,
    next_qty,
    'Reservation released via ' || p_new_status
  );

  return deal;
end;
$$;

revoke all on function public.create_product_deal_reservation(bigint, numeric, text, numeric) from public;
revoke all on function public.transition_product_deal(bigint, text) from public;
grant execute on function public.create_product_deal_reservation(bigint, numeric, text, numeric)
  to authenticated, service_role;
grant execute on function public.transition_product_deal(bigint, text)
  to authenticated, service_role;

-- Storage: product photos
insert into storage.buckets (id, name, public)
values ('product-photos', 'product-photos', true)
on conflict (id) do nothing;

drop policy if exists product_photos_public_read on storage.objects;
create policy product_photos_public_read
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'product-photos');

drop policy if exists product_photos_owner_insert on storage.objects;
create policy product_photos_owner_insert
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists product_photos_owner_update on storage.objects;
create policy product_photos_owner_update
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  )
  with check (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists product_photos_owner_delete on storage.objects;
create policy product_photos_owner_delete
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'product-photos'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
