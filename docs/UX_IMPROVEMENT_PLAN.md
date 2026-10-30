# AllFarmNeeds — UX Improvement Plan

**Date:** 2026-10-30  
**Live site reviewed:** https://allfarmneeds.vercel.app/  
**Codebase:** `allfarmneeds-website` (`main`)  
**Status:** Phase 1 (audit) + Phase 2 (proposed IA / homepage) — **awaiting approval before large implementation**

**Audience:** Farmers, agricultural workers, service providers, buyers and traders in Telangana (EN + TE).

**Companion docs:** [COMPLETE_UI_UX_AUDIT.md](./COMPLETE_UI_UX_AUDIT.md) (earlier pass; partially superseded), [IMPLEMENTATION_ROADMAP.md](./IMPLEMENTATION_ROADMAP.md), [SYSTEM_ARCHITECTURE.md](./SYSTEM_ARCHITECTURE.md).

---

## 0. Execution gate

| Phase | Deliverable | Status |
| --- | --- | --- |
| 1 | Audit existing experience | **Done** (this doc §1–§4) |
| 2 | Propose IA + homepage | **Done** (this doc §5–§7) |
| 3 | Shared navigation + design system | **Done** — approved 2026-10-30 |
| 4 | Homepage | **Done** |
| 5 | Marketplace modules | **Done** |
| 6 | Forms + user journeys | **Done** |
| 7 | Agri Mitra | **Done** |
| 8 | Responsive + functional validation + `UX_IMPLEMENTATION_REPORT.md` + `RESPONSIVE_TEST_RESULTS.md` | **Done** |

**Rule:** Preserve auth, RLS, schema, and working marketplace actions. Implement incrementally. No visual-only buttons. Do not claim incomplete features as fully operational.

---

## 1. Audit method

1. Full App Router inventory (`app/**/page.tsx`).
2. Shared chrome review: `site-header.tsx`, `site-footer.tsx`, `language-switcher.tsx`, `filter-panel.tsx`, `components/ui.tsx`, `app/globals.css`, `lib/locale.ts`.
3. Module review: services / jobs / crops / buyers list + detail + create forms; Agri Mitra; login / roles; messages / notifications; role dashboards.
4. Live check (2026-10-30): homepage and `/services`, `/jobs`, `/crops`, `/buyers`, `/agri-mitra`, `/explore`, `/login` all return **200**. Local `main` includes recent UI chrome that may still lag on Vercel until push.

---

## 2. What already works (keep)

| Area | Strength |
| --- | --- |
| Brand palette | `#F7F8F2` / `#246B38` / `#E8F0E5` / `#E3E5DC` / `#263629` / `#657363` in `globals.css` |
| Marketplace backend | Four modules + bookings, deals, offers, moderation, notifications |
| Services privacy | Contact via RPC; Call / WhatsApp / booking / enquire |
| Agri Mitra safety | Confirmation gate before publish; no silent writes |
| Shared primitives | `PageShell`, `ListingCard`, `FilterPanel`, `EmptyState`, `StatusBadge` |
| Mobile drawer | Hamburger + Escape + body scroll lock (local) |
| Locale | EN/TE copy + location-aware switcher |

---

## 3. Top problems (farmer impact)

Ranked for mobile + limited digital literacy:

| # | Problem | Why it hurts | Primary fix phase |
| --- | --- | --- | --- |
| 1 | Login + role onboarding mostly English-only | TE-first users blocked at the door | 6 |
| 2 | Notification unread badge on **Messages** | Trains wrong inbox; miss bookings/apps | 3 |
| 3 | Two-row dense desktop nav + Home ≈ Explore ≈ module cards | Overwhelm / competing destinations | 3–4 |
| 4 | Role dashboards buried on desktop (“Profile” only) | Can’t find my jobs / listings / deals | 3 |
| 5 | Crop deal copy (“atomically”, buy vs reserve) | Fear / abandon | 5–6 |
| 6 | “Buyers & Traders” label vs purchase-requirements content | Wrong mental model | 4–5 |
| 7 | Jobs/crops/buyers filters weak vs “near you” promise | Broken trust | 5 |
| 8 | Detail pages + many forms still EN-locked | Stuck mid-task in Telugu | 5–6 |
| 9 | Services detail: four equal contact actions | Decision paralysis | 5 |
| 10 | Post-login always lands on `/services` | Wrong next step by role | 6 |
| 11 | Raw dual status enums on dashboards | “Is my listing live?” unclear | 5–6 |
| 12 | Agri Mitra jargon + thin confirmation + auto-TTS | Literacy / publish fear | 7 |
| 13 | Create hub / empty states push seekers to “Create” | Wrong CTA for browse-first users | 4–5 |
| 14 | Homepage dumps all service categories | Long scroll; competes with modules | 4 |
| 15 | No phone OTP (email/Google only) | Village friction — product decision later | Later (not Phase 3–7) |

---

## 4. Surface-by-surface findings

### 4.1 Header / navigation / footer

- **Desktop:** Brand row + second row with Home / Explore / Create / Messages / Profile **and** four modules + Agri Mitra (+ notifications when signed in) → too many peers.
- **Mobile:** Drawer is good; Account role links exist only there → desktop users lose them.
- **Badge bug:** Unread **notifications** count shown on Messages.
- **Hardcoded EN:** “Menu”, “Close”, “Admin”.
- **Footer:** Always offers Sign in; no role hubs; duplicates marketplace links (acceptable if slimmed).

### 4.2 Homepage

Current order: repeated brand H1 → three equal CTAs → four modules → Agri Mitra → **all** service categories → footer.

Problems:

- Does not answer “what can I do / how do I start” with one clear primary action.
- Home ≈ Explore (near duplicate module grid).
- Categories create a third discovery path into Services and lengthen the first visit.
- Agri Mitra eyebrow says “Voice assistant” while body says text-first browser voice.

### 4.3 Marketplace modules

| Module | Works | Gaps |
| --- | --- | --- |
| **Services** | Rich filters (q, category, D→M→V, verified); contact actions | Card meta partly EN; empty → Create; four CTAs compete on detail |
| **Jobs** | Role-aware CTAs; apply flow | Category-only filters; raw payment labels; no call; detail EN-heavy |
| **Crops** | Photos; atomic deals | “Reserve/buy” jargon; weak filters; deal copy scary |
| **Buyers** | Requirements + offers | Label implies people directory; farmer-only offer not obvious; EN-heavy |
| **Agri Mitra** | Confirm gate; text + optional mic | Jargon; thin confirm payload; auto-TTS; weak empty guidance |

### 4.4 Auth / journeys / messages

- Roles form: no labour_contractor / retailer checkboxes (aliases only in header).
- After roles: default `next` → `/services` regardless of role.
- Messages = enquiries; Notifications = bookings/apps/deals — never explained.
- Profile is the real hub but labelled weakly; Create omits a clear worker “find jobs” path.

---

## 5. Design philosophy (approved direction)

Mobile-first, **task-oriented** agricultural marketplace:

- Simple, clean, trustworthy, touch-friendly, accessible, fast, consistent.
- Suitable for limited digital experience — plain language over product jargon.
- Preserve AllFarmNeeds brand; **extend** the existing green / off-white system (no new theme, no decorative gradients/shadows).
- Every advertised control must work; incomplete capabilities stay honestly labelled.
- Telugu and English first-class on chrome, forms, empty/error/success states.

---

## 6. Proposed information architecture

### 6.1 Three layers (stop mixing them)

| Layer | Purpose | Contents |
| --- | --- | --- |
| **Main app** | Always-available tasks | Home · Explore (marketplace index) · Create · Messages · My work |
| **Marketplace** | Domain modules | Farm Services · Farm Jobs · Sell crops · Purchase needs · Agri Mitra |
| **Account / My work** | Role-specific work | Notifications (badge **only here**) · role dashboards · Roles · Sign out |

**Rename (labels only; keep URLs unless migration is approved later):**

| Today | Proposed user-facing label |
| --- | --- |
| Profile | **My work** |
| Buyers & Traders | **Purchase needs** (or “Buyer requirements”) |
| Explore | Marketplace index (sole module grid; home links into it) |

### 6.2 Mobile navigation

**Sticky bottom nav (signed-in, max 5):**

`Home | Explore | Create | Messages | My work`

- Drawer / “More” for Agri Mitra, Notifications, role links, language/location if needed.
- Guest: `Home | Explore | Sign in` (Create → login with `next`).

**Do not** put all four marketplace modules in the bottom bar.

### 6.3 Desktop navigation

- **One** primary row: Home · Explore · Create · Messages · My work · Sign in/out.
- Marketplace modules: secondary row **or** Explore dropdown / Explore page — not five equal peers beside Create.
- My work menu: Notifications (badge), then role hubs (My jobs, My listings, Applications, Deals, …).

### 6.4 Badge rules

| Count | Show on |
| --- | --- |
| Unread notifications | **Notifications** / My work only |
| Unread enquiries (optional later) | Messages only |

---

## 7. Proposed homepage (Phase 4 target)

First screen must answer: (1) What is this? (2) What can I do? (3) How do I start?

| Section | Content | Notes |
| --- | --- | --- |
| **A. Compact header** | Logo, location, language, account, menu | Brand once here — **no** duplicate H1 “AllFarmNeeds” |
| **B. Task hero** | One headline + short TG-first description + **search** (services/jobs/crops query → Explore or Services) + **one** primary CTA | Guest primary: Sign in / Get started. Signed-in: role-aware (Find a tractor / Post a job / Sell crop / Post a need). Secondary: Explore |
| **C. Marketplace discovery** | Four tiles: Farm Services · Farm Jobs · Sell Crops · Find Buyers (purchase needs) | Short TE-primary titles; drop confusing bilingual eyebrow misuse |
| **D. Agri Mitra** | Recognisable assistant band: talk or type; TE+EN; “nothing publishes until you confirm” | Honest voice wording |
| **E. Popular categories** | 6 featured + “See all categories” expand/link to `/services` | Stop dumping all ~15 on first paint |
| **F. Next steps + footer** | Trust one-liner + slim footer | Staff review / confirm-before-publish |

**Remove from first viewport:** three equal CTAs; Explore as a peer destination identical to home modules; full category grid.

**Do not remove:** links into all four live modules, Agri Mitra, or category discovery — restructure, don’t delete capability.

---

## 8. User journeys to verify (Phases 5–6)

### Farmer
Find service → contact / book → post job → find workers → list crop → receive buyer enquiry / deal.

### Worker
Register → worker profile → find jobs → apply → track applications.

### Service provider
Provider profile → publish listing → enquiries → bookings.

### Buyer
Buyer profile → post purchase need → receive offers → negotiate / track deals.

**Journey UX rules:**

- Obvious primary action on every screen.
- Always show “what happens next” after submit (moderation, hold, confirm).
- Role-aware post-login and post-roles landing.
- Empty states: browse CTAs for seekers; create CTAs only when role allows.

---

## 9. Module improvement targets (Phase 5)

### Farm Services
- Keep location cascade; reinforce mandal-before-village.
- Cards: price (or “on enquiry”), provider, area, availability, verified badge.
- Detail: progressive disclosure — primary **Call** / **WhatsApp**; Booking + Enquire secondary.
- Empty: Browse tips + Create only if provider role.

### Farm Jobs
- Add location / search filters (parity with services where data exists).
- Cards: compensation + location + dates prominent.
- Humanize `payment_model`; TE chrome on detail + apply.
- Application success → “Track in My work / Applications”.

### Crop Marketplace
- Stronger image cards; quantity + unit + expected price labelled.
- Replace “atomic / reserve” jargon with “Hold quantity” + plain explanation.
- Available qty accurate; enquiry/purchase actions clear.

### Buyers & Traders → Purchase needs
- Cards: buyer type, location, quantity, timing.
- Prominent “Offer supply” for farmers; status via `StatusBadge`.
- Clarify who can offer and what happens after accept/decline.

### Agri Mitra (Phase 7)
- Plain intro; mic prominent with text fallback always visible.
- Mute / no surprise auto-TTS default on mobile.
- Confirmation shows full payload (title, place, date, wages/qty).
- TE + EN throughout; keep confirm-before-publish and privacy note.

---

## 10. Shared design system work (Phase 3)

Keep palette. Standardise:

| Token / pattern | Action |
| --- | --- |
| Typography | Readable mobile minimums; Telugu-capable stack where feasible |
| Spacing / buttons | `min-h-11` touch targets; primary / secondary / danger |
| Cards | One `ListingCard` density; avoid double borders |
| Forms | Shared Field/Select; short steps; inline why-disabled |
| Status | `StatusBadge` + TE/EN labels for moderation + lifecycle |
| Empty / loading / error | `EmptyState` with body + CTA; localize `PageFallback` |
| FilterPanel | Localize Show/Hide; sidebar on desktop for services (and later others) |

Avoid: new gradients, heavy shadows, decorative chrome, tiny TE text.

---

## 11. Responsive requirements (Phase 8)

Test widths: **320, 360, 375, 390, 430, 768, 1024, 1280, 1440, 1920**.

| Breakpoint | Layout intent |
| --- | --- |
| Mobile | 1–2 columns; bottom nav; large taps; short forms; no horizontal overflow |
| Tablet | Flexible grids; compact header; balanced density |
| Desktop | Full nav; `max-w-7xl`; sidebar filters where useful |

Both EN and TE must remain usable (no clipped CTAs, no overflow from long Telugu strings).

Screenshots + automation → `docs/RESPONSIVE_TEST_RESULTS.md`  
Journey results → `docs/UX_IMPLEMENTATION_REPORT.md`

---

## 12. What we will not change

| Keep | Reason |
| --- | --- |
| Supabase auth (email OTP + Google) | Working; wrap with TE + better `next` |
| RLS + Agri Mitra confirmation gate | Trust / safety |
| Schema / dual status + moderation fields | Humanize in UI, don’t collapse DB |
| Services contact privacy RPC | Privacy |
| Green brand tokens | Extend, don’t replace |
| Live module URLs (`/services`, `/jobs`, `/crops`, `/buyers`, `/agri-mitra`) | Avoid breaking links; rename labels first |

**Deferred product decisions:** phone OTP, cloud STT/TTS (Bhashini), `media_assets` B2, SMS/email delivery.

---

## 13. Incremental backlog (after approval)

### Phase 3 — Navigation + design system
1. [x] Collapse desktop nav to Main + My work; fix notification badge placement.
2. [x] Add mobile bottom nav; keep drawer for secondary.
3. [x] Localize header/footer/FilterPanel chrome; `html lang` follows locale (client).
4. [x] StatusBadge helpers + EmptyState bodies (messages + My work); role labels on My work.
5. [x] Explore = marketplace discovery (search + modules), not Home clone.
6. [x] Create = role-aware actions including worker Find jobs.
7. [x] Labels: My work; Purchase needs / Sell Crops (URLs unchanged).

### Phase 4 — Homepage
1. [x] Sections A–F; auth/role-aware primary CTA; marketplace search in hero.
2. [x] Cap categories at 6 + “See all”.
3. [x] No duplicate brand H1; Explore remains discovery page (Phase 3).
4. [x] Agri Mitra honest talk/type copy; trust strip.

### Phase 5 — Modules
1. [x] Services: localized card meta; empty → Explore; detail Call/WhatsApp primary, booking/enquire in disclosure.
2. [x] Jobs/crops/buyers: search `q` + category filters; stronger card meta (pay/qty/price/location).
3. [x] Crop hold plain language (no “atomic”); StatusBadge on non-public crop/service detail.

### Phase 6 — Forms + journeys
1. [x] Login + roles localized (EN/TE); default next is My work, not Services.
2. [x] Role-aware `pathAfterRoles` after OTP/Google/roles save; welcome checklist on `/profile?welcome=1`.
3. [x] Messages vs Notifications explainer on both inboxes.

### Phase 7 — Agri Mitra
1. [x] Plain EN/TE intro (no STT/RLS jargon); recent chat picker.
2. [x] Auto-voice muted by default; Listen + Auto-voice toggle; full utterance.
3. [x] Confirmation shows title/qty/workers/etc.; empty can/cannot + examples.

### Phase 8 — Validate
1. [x] Viewport matrix + EN/TE screenshots → `docs/screenshots/phase8/` (0 overflow fails).
2. [x] `docs/RESPONSIVE_TEST_RESULTS.md` + `docs/UX_IMPLEMENTATION_REPORT.md`.

---

## 14. Approval checklist

Please confirm before Phase 3 starts:

- [ ] Approve three-layer IA (Main / Marketplace / My work).
- [ ] Approve mobile bottom nav (5 items).
- [ ] Approve homepage A–F (search in hero; 6 featured categories).
- [ ] Approve label renames: Profile → My work; Buyers & Traders → Purchase needs (URLs unchanged for now).
- [ ] Approve badge fix (notifications not on Messages).
- [ ] Confirm phone OTP and cloud STT remain **out of scope** for this UX pass.

Once approved, implementation proceeds Phase 3 → 8 with incremental commits and no architecture/RLS regressions.
