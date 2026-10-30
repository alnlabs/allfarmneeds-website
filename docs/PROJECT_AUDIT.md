# AllFarmNeeds — Project Audit

**Date:** 2026-10-30 (updated after Phases 1–6)  
**Live site:** https://allfarmneeds.vercel.app/  
**Repo:** `allfarmneeds-website`  
**Backend project:** Supabase `ojngkjcrafrqlphinzsc` (AllFarmNeeds)

This audit reflects the codebase and linked remote database after marketplace verticals, shared trust, and Agri Mitra shipped. No destructive changes are proposed here.

Companion: [CHANGELOG.md](./CHANGELOG.md), [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md), [SECURITY_TESTS_MARKETPLACE.md](./SECURITY_TESTS_MARKETPLACE.md).

---

## 1. Stack and deployment

| Area | Status | Notes |
| --- | --- | --- |
| Frontend | **Working** | Next.js **16.4.3** (App Router), React **19**, TypeScript, Tailwind CSS **4** |
| Auth client | **Working** | `@supabase/ssr` + cookie session via `proxy.ts` |
| Backend | **Working** | Supabase Auth + Postgres + Storage + RLS |
| Hosting | **Working** | Vercel (`allfarmneeds.vercel.app`) |
| Env (client-safe) | **Working** | `NEXT_PUBLIC_SUPABASE_*`, `NEXT_PUBLIC_SITE_URL` |
| Service-role key | **Not in client** | Correct |

---

## 2. Authentication and identity

| Capability | Status | Notes |
| --- | --- | --- |
| Email OTP + Google OAuth | **Working** | `/login`, `/auth/callback` |
| Profile bootstrap | **Working** | `private.handle_new_user()` |
| Multi-role onboarding | **Working** | farmer, worker, service_provider, buyer |
| Admin / moderator | **Working (manual assign)** | `/admin` hub |

**Do not duplicate:** `auth.users` ↔ `profiles.id`. Roles in `user_roles`.

---

## 3. Frontend routes (live)

| Route group | Purpose |
| --- | --- |
| `/`, `/login`, `/onboarding/roles` | Home, auth, roles |
| `/services/**`, `/provider/**`, `/bookings` | Farm Services |
| `/jobs/**`, `/farmer/jobs`, `/worker/**` | Farm Jobs |
| `/crops/**`, `/seller/crops`, `/buyer/deals` | Crop Marketplace |
| `/buyers/**`, `/buyer/profile`, `/buyer/requirements` | Buyers & Traders |
| `/messages/**`, `/notifications` | Messaging + notifications |
| `/admin`, `/admin/{listings,jobs,crops,buyers,reports,reviews}` | Staff |
| `/agri-mitra` | Confirmation-gated assistant |

Homepage module cards and Agri Mitra entry are **live** (not placeholders).

---

## 4. Module maturity

| Module | Schema | UI | Moderation | Notes |
| --- | --- | --- | --- | --- |
| Farm Services | Complete | Live | Yes | Contact privacy RPC (B1) |
| Farm Jobs | Complete | Live | Yes (B7) | Applications + guard trigger |
| Crops | Complete | Live | Yes (B7) | Atomic deals (B5) + product-photos |
| Buyers | Complete | Live | Yes (B7) | Offers + buyer profile |
| Notifications | Live (B3) | Live | — | Trigger-driven |
| Reviews | Live (B4) | Live | Staff hide/show | After completed/selected/accepted |
| Enquiry replies | Live (B6) | Live | — | Thread under enquiry |
| Reports | Live | Live | Staff queue | User report affordance on details |
| Agri Mitra | Live (B8) | Live | Confirm gate | Browser STT/TTS demo |
| media_assets | Deferred (B2) | — | — | Keep `photo_urls[]` |

---

## 5. Storage buckets

| Bucket | Status |
| --- | --- |
| `service-photos` | Live |
| `product-photos` | Live |

---

## 6. Migrations (remote-applied chronological)

Foundation + seeds + Services phase 1, then:

7. `20261030100000_provider_contact_privacy.sql`  
8. `20261030102000_farm_jobs_moderation.sql`  
9. `20261030110000_crop_marketplace_deals.sql`  
10. `20261030120000_buyer_requirements_moderation.sql`  
11. `20261030130000_shared_trust_workflows.sql`  
12. `20261030140000_agri_mitra.sql`

---

## 7. Known gaps / next polish

- Execute full role matrix in [SECURITY_TESTS_MARKETPLACE.md](./SECURITY_TESTS_MARKETPLACE.md).  
- Expand TE coverage on older provider listing forms.  
- Optional: cloud Telugu STT/TTS, email/SMS fan-out from notifications.  
- Optional: B2 `media_assets` if photo arrays become painful.  
- Deeper village seed coverage beyond pilot towns as needed.

---

## 8. Summary verdict

| Area | Verdict |
| --- | --- |
| Auth | **Working** — preserve |
| Farm Services | **Live** |
| Jobs / Crops / Buyers | **Live** |
| Shared messaging + trust | **Live** (threads, notifications, reviews, reports) |
| i18n | **Foundation good**; continue TE expansion |
| Agri Mitra | **Live demo** — confirmation required; no auto-publish |
| Docs | **Updated** for post–Phase 6 state |

**Recommendation:** Keep extending the unified schema. Prioritize Phase 7 manual security pass and production UX polish over new modules.
