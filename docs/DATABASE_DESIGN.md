# AllFarmNeeds — Database Design

**Rule:** Existing tables stay. Proposed changes are **additive** unless a migration explicitly documents a safe alteration.  
**No approval yet for destructive changes.**

---

## A. Existing schema (as deployed)

### A1. Identity and roles

| Table | Purpose | Key columns |
| --- | --- | --- |
| `profiles` | Public profile for `auth.users` | `id`, `display_name`, `avatar_url`, timestamps |
| `user_roles` | Many roles per user | `(user_id, role)` PK; role check constraint |
| `user_locations` | Optional saved locations | village/district refs |
| `farmer_profiles` | Farmer extras | `village_id`, `about` |
| `worker_profiles` | Worker extras | `village_id`, radius, experience, availability, languages |
| `provider_profiles` | Service business | `business_name`, `about`, `logo_url`, `verification_status`, **`phone`**, **`whatsapp`**, **`show_contact_publicly`** |
| `buyer_profiles` | Buyer/trader business | `business_name`, `business_type`, `about`, `verification_status` |
| `buyer_operating_areas` | Buyer coverage | exactly one of district/mandal/village |

**Helper:** `private.current_user_has_role(text)` — `SECURITY DEFINER`; execute for `anon` + `authenticated`.

### A2. Geography

| Table | Notes |
| --- | --- |
| `states` | Seeded: Telangana (+ AP via later seed) |
| `districts` | TG + AP |
| `mandals` | Includes synthetic “Municipal towns” for urban seeds |
| `villages` | Villages + municipal towns |

### A3. Farm Services (implemented in product)

| Table | Notes |
| --- | --- |
| `service_categories` | EN/TE names seeded |
| `service_listings` | pricing, availability, `photo_urls[]`, `status`, **`moderation_status`** |
| `service_listing_areas` | multi-row areas; one place level per row |
| `service_bookings` | farmer↔provider status machine |

**Storage:** bucket `service-photos`.

### A4. Farm Jobs (schema only)

| Table | Notes |
| --- | --- |
| `job_categories` | EN/TE seeded |
| `worker_skills` | worker ↔ job category |
| `farm_jobs` | workers_required, dates, payment_model, village, status |
| `job_applications` | unique (job, worker); status guarded by trigger |

### A5. Crop Marketplace (schema only)

| Table | Notes |
| --- | --- |
| `product_categories` | EN/TE |
| `product_listings` | qty, units, price, grade, photos, village, fulfillment, status |

### A6. Buyers & Traders (schema only)

| Table | Notes |
| --- | --- |
| `buyer_requirements` | qty, area, price expectations, status |
| `seller_responses` | offer; status guarded by trigger |

### A7. Shared contact / trust

| Table | Notes |
| --- | --- |
| `enquiries` | Exactly one subject FK among service/job/product/requirement |
| `reports` | Reporter + target_type/target_id + status |

### A8. What is **not** in the existing schema

- `notifications`
- `reviews` / ratings
- Normalized `media_assets`
- Enquiry reply threads
- Product order / partial purchase ledger
- Deal timeline beyond `seller_responses.status`
- Agri Mitra session tables

---

## B. Proposed changes (additive)

> **Await approval before applying.** Prefer new migrations; avoid dropping columns used by the live Services app.

### B1. Contact privacy (Services hardening)

**Problem:** `provider_profiles` is publicly selectable; phone fields leak even when `show_contact_publicly = false`.

**Proposal (choose one after approval):**

1. **Preferred:** Postgres view `provider_profiles_public` that nulls phone/whatsapp unless flag true; revoke direct select of sensitive columns from `anon` (may require column grants / split table).  
2. **Simpler interim:** move phone/whatsapp to `provider_contacts` with RLS `select` only for owner, staff, or booking/enquiry counterparties.

No change to Auth identity.

### B2. Shared media assets

```text
media_assets (
  id, owner_id, bucket, path, public_url,
  entity_type, entity_id, sort_order, created_at
)
```

- RLS: owner write; public read when parent entity is publicly readable.
- Buckets: `product-photos` (+ optional `job-photos`, `avatars`).
- Keep `photo_urls[]` temporarily for Services; sync or dual-write during transition.

### B3. Notifications

```text
notifications (
  id, user_id, type, title_en, title_te, body_en, body_te,
  link_path, read_at, created_at,
  entity_type, entity_id
)
```

- RLS: select/update own rows only.
- Insert via `SECURITY DEFINER` trigger functions or trusted Server Action using user context where possible.

### B4. Reviews

```text
reviews (
  id, reviewer_id, reviewee_id,
  entity_type, entity_id, rating (1-5), comment,
  status ('visible','hidden'), created_at
)
```

- Allow review only after completed booking / selected job / accepted deal (enforced by trigger).
- RLS: public read visible; insert own; staff moderate.

### B5. Crop partial purchases / deals (new)

Existing `product_listings.quantity_available` can decrease, but there is no audit of partial buys.

**Proposal:**

```text
product_deals (
  id, product_listing_id, buyer_id, seller_id,
  quantity, quantity_unit, price_amount, price_unit,
  status ('requested','accepted','rejected','completed','cancelled'),
  message, created_at, updated_at
)
```

- Trigger adjusts `quantity_available` on accept/complete; prevents oversell.
- RLS: parties + staff.

### B6. Enquiry replies (optional)

```text
enquiry_messages (
  id, enquiry_id, sender_id, body, created_at
)
```

- Keep `enquiries` as conversation header.
- RLS: same parties as parent enquiry.

### B7. Moderation parity

Add `moderation_status` to:

- `farm_jobs`
- `product_listings`
- `buyer_requirements`

Same values: `pending | approved | rejected`.  
Public read = `published` + `approved` (mirror services).

### B8. Agri Mitra (later)

```text
agri_mitra_sessions (id, user_id, locale, created_at)
agri_mitra_messages (id, session_id, role, content, tool_name, tool_payload, created_at)
agri_mitra_confirmations (id, session_id, action_type, payload, status, confirmed_at)
```

- RLS: own sessions only.
- Consequential tools write confirmation rows; Server Action executes only when `status = confirmed`.

---

## C. Existing vs proposed — summary (post Phase 6)

| Concern | Status |
| --- | --- |
| Users / roles | Live onboarding: farmer, worker, provider, buyer |
| Locations | TG/AP seeded; deepen villages as needed |
| Services | Live + B1 contact privacy |
| Jobs / crops / buyers | Live UI + B7 moderation |
| Messaging | Enquiries + B6 `enquiry_messages` |
| Media | `photo_urls[]` + `service-photos` / `product-photos`; B2 deferred |
| Notifications | Live B3 |
| Reviews | Live B4 |
| Partial crop sales | Live B5 `product_deals` + inventory events |
| Agri Mitra | Live B8 sessions / messages / confirmations |

---

## D. Migration policy

1. One concern per migration file.  
2. Always: `enable row level security` + policies + grants in the same file.  
3. Default privileges: no broad `grant all` to `anon`.  
4. Seed data separate from structural migrations when large.  
5. Never rename/drop live Services columns without a dual-read period and product sign-off.

---

## E. ER overview (target unified model)

```text
profiles ──┬── role profiles (farmer/worker/provider/buyer)
           ├── service_listings ── areas ── bookings
           ├── farm_jobs ── applications
           ├── product_listings ── product_deals
           ├── buyer_requirements ── seller_responses
           ├── enquiries ── enquiry_messages
           ├── notifications
           ├── reviews
           ├── reports
           └── agri_mitra_sessions ── messages / confirmations
```

Geography and categories remain shared reference data.
