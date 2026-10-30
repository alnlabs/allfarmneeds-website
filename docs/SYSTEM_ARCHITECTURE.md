# AllFarmNeeds — System Architecture

**Status:** Design document (no implementation required for approval)  
**Principle:** One Next.js app + one Supabase project. No microservices.

---

## 1. High-level system

```text
┌─────────────────────────────────────────────────────────────┐
│                     Vercel (Next.js 16)                     │
│  App Router pages · Server Actions · proxy session refresh  │
│  Locale cookies · Publishable Supabase key only             │
└────────────────────────────┬────────────────────────────────┘
                             │ HTTPS (anon / user JWT)
┌────────────────────────────▼────────────────────────────────┐
│                         Supabase                            │
│  Auth  │  Postgres + RLS  │  Storage  │  (future) Edge Fn   │
└─────────────────────────────────────────────────────────────┘
```

**Optional later (not required now):**

- Supabase Edge Functions for Agri Mitra orchestration (still same project).
- Email/SMS provider for notifications (triggered via DB webhook or Edge Function).

---

## 2. Application layers

| Layer | Responsibility |
| --- | --- |
| **Routes (`app/`)** | Page composition, Suspense, SEO metadata |
| **Server Actions (`app/actions/`)** | Mutations with auth checks; never hold service-role in browser |
| **Components** | Forms, header, locale switcher, shared UI primitives |
| **Lib** | Auth helpers, locale, locations, redirects, site URL |
| **Supabase clients** | `server` (cookies), `client` (browser), middleware refresh |

Authorization **must not** rely on UI alone. Server Actions check session/roles; **RLS is the source of truth**.

---

## 3. Unified identity and roles

```text
auth.users
    │ 1:1
profiles ──────────────┬── farmer_profiles
    │                  ├── worker_profiles
    │                  ├── provider_profiles
    │                  └── buyer_profiles
user_roles (many)
```

**Supported roles (existing enum):**  
`farmer`, `worker`, `labour_contractor`, `service_provider`, `buyer`, `retailer`, `agricultural_professional`, `administrator`, `moderator`

**Product rule:** One login, multiple roles. Do not create separate user accounts per module.

**Onboarding expansion (planned):** extend `/onboarding/roles` to worker + buyer without removing farmer/provider.

---

## 4. Four marketplace modules (one system)

All modules share:

- `profiles` + `user_roles`
- Location hierarchy: `states` → `districts` → `mandals` → `villages`
- Category tables with `name_en` / `name_te`
- Listing lifecycle: `draft` → `published` (+ moderation where required)
- `enquiries` + `enquiry_messages` as cross-module contact
- Live shared: `notifications`, `reviews`, `reports`
- Deferred: `media_assets` (B2)

```text
                    ┌──────────────┐
                    │   profiles   │
                    └──────┬───────┘
           ┌───────────────┼───────────────┬──────────────┐
           ▼               ▼               ▼              ▼
    service_listings   farm_jobs   product_listings  buyer_requirements
           │               │               │              │
           ▼               ▼               ▼              ▼
   service_bookings  job_applications  product_deals  seller_responses
                                           │
                                      enquiries / notifications / reviews
```

| Module | Actor creates | Counterparty action |
| --- | --- | --- |
| Farm Services | Provider listings | Farmer enquire / book |
| Farm Jobs | Farmer jobs | Worker apply; farmer select |
| Crop Marketplace | Farmer/seller products | Buyer reserve partial qty (deals) |
| Buyers & Traders | Buyer requirements | Seller offer; accept/decline |
| Agri Mitra | Draft + confirmation | User confirms → RLS write |

---

## 5. Shared workflows

| Workflow | Status |
| --- | --- |
| Messaging | `enquiries` + `enquiry_messages` replies |
| Bookings | `service_bookings` status machine live |
| Applications | `job_applications` UI + guard trigger |
| Offers | `seller_responses` UI + guard trigger |
| Moderation | Services, jobs, products, requirements |
| Reports | Table + `/admin/reports` |
| Reviews | Table + post-completion UI + staff hide |
| Notifications | Table + triggers + `/notifications` (+ email later) |

---

## 6. Media

**Today:** `photo_urls text[]` on listings + Storage bucket `service-photos`.

**Target (non-breaking):** introduce `media_assets` for normalized ownership, module type, and ordering; keep arrays as denormalized cache **or** migrate reads gradually. Prefer additive migration over rewrite.

Planned buckets:

| Bucket | Use |
| --- | --- |
| `service-photos` | Exists |
| `job-photos` | Optional |
| `product-photos` | Required for crops |
| `profile-avatars` | Optional |

Path convention: `{user_id}/{entity_type}/{entity_id}/{filename}`.

---

## 7. Internationalization

| Piece | Approach |
| --- | --- |
| UI chrome | `lib/locale.ts` message catalogs (`en` / `te`) |
| Domain names | DB `name_en` / `name_te` on categories |
| Default language | Geo (TG/AP) + Accept-Language + manual override cookie |
| Agri Mitra | Same locale; voice STT/TTS per language |

---

## 8. Agri Mitra (architecture sketch)

Voice-first assistant, **not** a separate backend product.

```text
User mic → STT (te/en) → Intent router → Tool calls
                                      ├─ search_services
                                      ├─ draft_farm_job
                                      ├─ draft_product_listing
                                      └─ read_enquiries / applications
                         → Confirmation card → User confirms → Server Action / RLS
```

**Hard rule:** No publish / booking accept / hire without explicit user confirmation UI.

**Shipped demo:** `agri_mitra_sessions` / `messages` / `confirmations` with Next.js Server Actions under the user JWT + RLS. Intent routing is rule-based (EN/TE); STT/TTS uses browser Web Speech API. Cloud STT/TTS / Edge orchestration can replace the demo layer later without changing confirmation semantics.

---

## 9. Admin

| Capability | Mechanism |
| --- | --- |
| Listing moderation | Role `administrator` / `moderator` + RLS |
| Verification of provider/buyer | Existing `verification_status` columns + staff-only update trigger |
| Reports queue | `reports` + staff policies |
| Reference data | Admin RLS already on states/districts/categories |

No separate admin microservice.

---

## 10. Environment and secrets

| Variable | Where |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel + local |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Vercel + local |
| `NEXT_PUBLIC_SITE_URL` | Production `https://allfarmneeds.vercel.app` |
| Service role | Supabase dashboard / CI only — **never** `NEXT_PUBLIC_*` |

---

## 11. Quality gates (architecture)

- Every new table ships with RLS + grants in the same migration.
- Every mutation path has a Server Action **and** a failing unauthorized RLS case in the test plan.
- Modules share components for location pickers, photo upload, status badges, enquiry forms.
- Homepage module cards become live links only when that module’s first vertical slice is production-ready (no empty pretend pages).
