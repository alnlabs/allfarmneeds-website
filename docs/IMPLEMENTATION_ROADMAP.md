# AllFarmNeeds — Implementation Roadmap

**Goal:** Four equal marketplace modules on one stack, with Agri Mitra as a confirmation-gated assistant.  
**Status:** Phases 0–6 implemented and migrated. Phase 7 (quality) is continuous.

Companion docs:

- [PROJECT_AUDIT.md](./PROJECT_AUDIT.md)
- [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md)
- [DATABASE_DESIGN.md](./DATABASE_DESIGN.md)
- [SECURITY_TESTS_SERVICES.md](./SECURITY_TESTS_SERVICES.md)
- [SECURITY_TESTS_MARKETPLACE.md](./SECURITY_TESTS_MARKETPLACE.md)
- [CHANGELOG.md](./CHANGELOG.md)

---

## Guiding rules (from product brief)

1. Inspect before changing.  
2. Preserve working auth and existing UI.  
3. Do not replace tables without dependency review.  
4. No duplicate identities or duplicate domain tables.  
5. Schema changes via migrations + RLS.  
6. TypeScript + reusable components.  
7. One unified system — no microservices.  
8. Never put service-role keys in the client.  
9. No mock data presented as live marketplace inventory.  
10. Telugu + English for user-facing features.  
11. Homepage module cards go live only when the module slice is real.

---

## Build order (completed)

```text
Services (stabilize) → Jobs → Crops → Buyers → Shared trust → Agri Mitra → Quality
```

---

## Phase status

| Phase | Outcome | Status |
| --- | --- | --- |
| 0 | Docs + approval gate | Done |
| 1 | Farm Services privacy + bookings | Live |
| 2 | Farm Jobs + workers | Live `/jobs` |
| 3 | Crop Marketplace + atomic deals | Live `/crops` |
| 4 | Buyers & Traders + offers | Live `/buyers` |
| 5 | Notifications, reviews, reports, enquiry replies, admin hub | Live |
| 6 | Agri Mitra confirmation-gated demo | Live `/agri-mitra` |
| 7 | Quality, security matrix, docs | In progress |

### Deferred (intentional)

| Item | Reason |
| --- | --- |
| B2 `media_assets` | `photo_urls[]` + buckets enough for now |
| Cloud STT/TTS (Bhashini etc.) | Browser Web Speech used for demo; evaluate later |
| Email/SMS notification delivery | In-app notifications table + triggers shipped |

---

## Phase 1 — Stabilize Farm Services

- [x] Provider contact privacy (B1)  
- [x] Bookings + moderation + `service-photos`  
- [x] Services RLS contact tests documented  

**Routes:** `/services`, `/provider/*`, `/bookings`, `/admin/listings`

---

## Phase 2 — Farm Jobs and Workers

- [x] Worker role + profile  
- [x] Job create / browse / apply / select  
- [x] `moderation_status` on `farm_jobs` (B7)  
- [x] Homepage card → `/jobs`

**Routes:** `/jobs`, `/farmer/jobs`, `/worker/*`, `/admin/jobs`

---

## Phase 3 — Crop Marketplace

- [x] `product-photos` bucket + upload UI  
- [x] Seller listings + buyer browse  
- [x] Atomic `product_deals` + inventory events (B5)  
- [x] Product moderation (B7)  
- [x] Homepage card → `/crops`

**Routes:** `/crops`, `/seller/crops`, `/buyer/deals`, `/admin/crops`

---

## Phase 4 — Buyers and Traders

- [x] Buyer role + profile + operating districts  
- [x] Requirements + seller offers  
- [x] Requirement moderation (B7)  
- [x] Homepage card → `/buyers`

**Routes:** `/buyers`, `/buyer/profile`, `/buyer/requirements`, `/admin/buyers`

---

## Phase 5 — Shared trust

- [x] Notifications + header badge (B3)  
- [x] Reports UI + `/admin/reports`  
- [x] Reviews after booking / selected job / deal (B4)  
- [x] Enquiry reply threads (B6)  
- [x] Admin dashboard `/admin` pending counts  
- [ ] B2 media_assets (deferred)

---

## Phase 6 — Agri Mitra

- [x] Session / message / confirmation tables (B8)  
- [x] Intent tools: services, draft job, draft product, buyers, inbox  
- [x] Mandatory confirmation before publish  
- [x] Browser STT/TTS (te/en) + text fallback  
- [x] Homepage + header entry  

**Hard rule retained:** no auto-publish.

---

## Phase 7 — Quality and delivery (current)

For every vertical slice:

- [x] Docs updated (audit, architecture, design, changelog, security matrix)  
- [x] Migrations committed with RLS (Phases 1–6)  
- [x] Real DB persistence (no mock catalogues)  
- [ ] Role matrix executed manually — see [SECURITY_TESTS_MARKETPLACE.md](./SECURITY_TESTS_MARKETPLACE.md)  
- [ ] Unauthorized access spot-checks per module  
- [ ] Mobile + desktop pass on key flows  
- [ ] Expand remaining TE strings on older provider forms  
- [ ] Low-bandwidth image compression pass  

---

## Live file map

| Area | Touch points |
| --- | --- |
| Services | `app/services/**`, `app/actions/listings.ts`, `bookings.ts`, `enquiries.ts` |
| Jobs | `app/jobs/**`, `app/worker/**`, `app/farmer/jobs`, `app/actions/jobs.ts` |
| Crops | `app/crops/**`, `app/seller/crops`, `app/buyer/deals`, `app/actions/products.ts` |
| Buyers | `app/buyers/**`, `app/buyer/**`, `app/actions/requirements.ts`, `buyer.ts` |
| Trust | `app/notifications`, `app/admin/**`, `app/actions/{notifications,reports,reviews}.ts` |
| Agri Mitra | `app/agri-mitra`, `lib/agri-mitra/**`, `app/actions/agri-mitra.ts` |
| Migrations | `supabase/migrations/*.sql` |

**Do not** create parallel `users` tables or a second Auth provider store.

---

## Milestone proof

| Milestone | User-visible proof | Status |
| --- | --- | --- |
| M0 | Docs approved | Done |
| M1 | Services privacy + bookings | Done |
| M2 | Jobs live on homepage | Done |
| M3 | Crops + partial deal | Done |
| M4 | Buyers requirements + offers | Done |
| M5 | Reviews + reports staff queue | Done |
| M6 | Agri Mitra confirmed-action demo | Done |
| M7 | Security matrix + polish | Current |

---

## Explicit non-goals (still)

- Rewriting Services from scratch  
- Microservices / separate databases per module  
- Replacing Supabase Auth  
- Empty module cards without CRUD  
- Agri Mitra auto-publish  
- Premature `media_assets` rewrite  

---

## Next actions

1. Run [SECURITY_TESTS_MARKETPLACE.md](./SECURITY_TESTS_MARKETPLACE.md) with real role accounts.  
2. Fix any RLS/UI gaps found.  
3. Optionally evaluate cloud Telugu STT/TTS and email delivery.  
4. Commit/push when ready (ask before git commit).
