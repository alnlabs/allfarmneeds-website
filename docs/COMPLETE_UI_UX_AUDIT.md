# AllFarmNeeds — Complete UI/UX, Responsive & Functional Audit

**Date:** 2026-10-30  
**Live site reviewed:** https://allfarmneeds.vercel.app/  
**Codebase:** `allfarmneeds-website` (local `main` may be ahead of Vercel until push)

**Method:** Route inventory from App Router, component/layout inspection, live homepage + `/services` fetch, comparison of design tokens vs brand spec. Viewport matrix below is a **planned verification checklist** (not automated screenshot suite).

---

## 1. Existing pages (routes)

| Route | Purpose | Functional in code |
| --- | --- | --- |
| `/` | Homepage modules + categories | Yes |
| `/login` | OTP + Google | Yes |
| `/onboarding/roles` | Multi-role select | Yes (farmer/worker/provider/buyer) |
| `/services`, `/services/[id]` | Browse + book/enquire | Yes |
| `/provider/*` | Provider profile/listings/bookings | Yes |
| `/bookings` | Farmer bookings + reviews | Yes |
| `/jobs`, `/jobs/new`, `/jobs/[id]` | Jobs marketplace | Yes (local; may be missing on unpushed deploy) |
| `/farmer/jobs`, `/worker/*` | Job management | Yes |
| `/crops`, `/crops/new`, `/crops/[id]` | Crop marketplace + deals | Yes |
| `/seller/crops`, `/buyer/deals` | Seller/buyer crop flows | Yes |
| `/buyers`, `/buyers/new`, `/buyers/[id]` | Requirements + offers | Yes |
| `/buyer/profile`, `/buyer/requirements` | Buyer account | Yes |
| `/messages`, `/messages/[id]` | Enquiries + replies | Yes |
| `/notifications` | In-app alerts | Yes |
| `/admin` + moderation queues | Staff | Yes |
| `/agri-mitra` | Text/voice demo + confirm gate | Yes (browser Web Speech; not cloud STT) |

**Live vs local:** Production homepage at audit time still reflected an older build for some module surfaces; local repo has all four modules + Agri Mitra. Treat “Coming soon” on an old deploy as a **deploy lag**, not product intent—local homepage cards are live links.

---

## 2. Shared layout & components — current state

| Piece | Status | Notes |
| --- | --- | --- |
| Header | Exists | `SiteHeader` wraps **all** module + role links in one flex-wrap row |
| Footer | **Missing** | No site footer |
| Mobile menu / drawer | **Missing** | No hamburger; nav wraps → clutter + overflow risk on 320–430 widths |
| PageShell / Panel / Field / buttons | Shared | Consistent brand colors; good baseline |
| Empty / loading | Minimal | `PageFallback` = “Loading…”; empty copy inline per page |
| Status badges | **Missing** | Status shown as raw text |
| Listing cards | Ad-hoc | Repeated Link+border patterns; not one component |
| Dialogs / confirmation | Partial | Agri Mitra has confirm cards; no shared modal |
| Pagination | **Missing** | Lists unbounded |
| Filter panels | Inline forms | Services dumps **all villages** into one `<select>` when mandal unset |

Design tokens in `globals.css` already match brand (`#F7F8F2`, `#246B38`, etc.).

---

## 3. Device / responsive issues

### Mobile (320–430)

| Issue | Severity |
| --- | --- |
| Header nav lists 10–20+ links with wrap; tagline + language compete for space | **Critical** |
| No drawer; hard to reach Messages/Profile | High |
| Services village dropdown can contain hundreds of towns (live `/services` showed huge option lists) | **Critical** |
| Filter forms always expanded; push results below fold | High |
| Listing cards OK stacked; images often `hidden` until `sm` | Medium |
| Telugu labels may widen buttons past comfortable tap targets | Medium |
| Risk of horizontal overflow from long unwrapped nav/strings | High |

### Tablet (768–1024)

| Issue | Severity |
| --- | --- |
| Header still shows full role soup instead of compact primary + “More” | High |
| Module grids 2-col OK; filters 2-col OK | Low |
| No dedicated create/explore hubs | Medium |

### Desktop / wide (1280–1920)

| Issue | Severity |
| --- | --- |
| Header works but is visually dense when signed in with multiple roles | Medium |
| Services filters top-of-page only (no sidebar on large screens) | Medium |
| No footer / trust links | Medium |
| Admin links buried among consumer links | Medium |

---

## 4. Module-specific findings

### Homepage

- Local: four live cards + Agri Mitra (good).  
- Positioning mentions TG + AP equally; product asks **Telangana-first**.  
- Module grid: `sm:2` / `lg:4` — OK; mobile should explicitly prefer **2 columns**.  
- Hero is page-title style, not a distinct hero composition.

### Farm Services

- Search + category + district/mandal/village + verified: **implemented**.  
- Hierarchy bug/UX: villages listed without requiring mandal → mixes towns across districts.  
- Call/WhatsApp via privacy RPC: implemented.  
- No filter drawer; no listing card primitive.

### Farm Jobs / Crops / Buyers

- Full CRUD + moderation + role gates in code.  
- Listing pages are single-column stacks (fine on mobile; desktop underuses width).  
- Many English-only chrome strings in role-specific pages (“My jobs”, “Applications”).  
- Crop deal atomicity is server-side (RPC)—UI does not surface concurrency errors richly.

### Agri Mitra

- Text intents + confirmation before publish: **real**.  
- Voice: **browser** `SpeechRecognition` / `speechSynthesis` only—must not claim cloud Telugu STT reliability.  
- Mic control present when API exists; unsupported browsers get text-only (correct).

### Auth & dashboards

- Multi-role onboarding works.  
- No unified `/profile` or `/create` hub—role pages are deep links only.  
- Admin has `/admin` hub; consumer dashboards are fragmented.

### Accessibility

- Language switcher has `role="group"` / `aria-pressed` (good).  
- Icon-free text links help, but no skip link, focus trap for future drawer, or `aria-expanded` on filters.  
- Images often `alt=""`.  
- Color contrast on accent/white generally OK.

---

## 5. Inconsistent components

- Listing rows vs dashed “coming soon” cards (legacy pattern still in code path).  
- Primary CTAs sometimes raw `<button className=…>` vs `PrimaryButton`.  
- Status shown as free text (`published`, `reserved`) without badges.  
- Nav labels mix EN product names with TE secondary lines inconsistently.

---

## 6. Missing / incomplete workflows (product honesty)

| Claim | Reality |
| --- | --- |
| Full cloud voice Agri Mitra | Demo Web Speech only |
| Email/SMS notifications | In-app table only |
| Negotiation chat for buyers | Offer accept/decline, not free-form negotiation |
| Pagination / infinite scroll | Not implemented |
| Dedicated profile/create IA | Not implemented (planned in this UI pass) |

Do **not** advertise unfinished cloud voice or email as complete.

---

## 7. Recommended fixes (priority)

1. **Responsive header** — primary nav Home / Explore / Create / Messages / Profile + hamburger drawer; role links inside drawer.  
2. **Site footer** — brand, modules, Telangana-first note, language.  
3. **Shared primitives** — EmptyState, StatusBadge, ListingCard, FilterPanel (`<details>` on mobile).  
4. **Services location UX** — cascade: district → mandal → villages only after mandal chosen; Telangana districts first.  
5. **Homepage** — Telangana-first copy; 2-col mobile modules; clear Agri Mitra “demo voice” wording.  
6. **Explore / Create / Profile hubs** — keep all four modules discoverable without header soup.  
7. TE string pass on role chrome (follow-up).  
8. Desktop filter sidebar for services (follow-up).  
9. Manual viewport matrix sign-off after UI ship.

---

## 8. Viewport verification checklist

| Viewport | Pass? | Notes |
| --- | --- | --- |
| 320×568 | ☐ | |
| 360×800 | ☐ | |
| 375×812 | ☐ | |
| 390×844 | ☐ | |
| 430×932 | ☐ | |
| 768×1024 | ☐ | |
| 1024×768 | ☐ | |
| 1280×800 | ☐ | |
| 1440×900 | ☐ | |
| 1920×1080 | ☐ | |

---

## 9. Fixes shipped in this pass (2026-10-30)

| Fix | Status |
| --- | --- |
| Audit document | Done — this file |
| Responsive header + hamburger drawer | Done |
| Primary IA: Home / Explore / Create / Messages / Profile | Done (`/explore`, `/create`, `/profile`) |
| Site footer | Done |
| Shared EmptyState / StatusBadge / ListingCard / FilterPanel | Done |
| Homepage 2-col modules + Telangana-first copy | Done |
| Services: collapsible filters, desktop sidebar, mandal→village cascade, TG districts first | Done |
| Honest Agri Mitra copy (browser voice / confirm) | Done |
| Jobs / Crops / Buyers: FilterPanel + ListingCard grids | Done |
| Messages: EmptyState + StatusBadge + TE strings | Done |
| Agri Mitra: mobile tap targets + honest mic hint | Done |
| Homepage responsive (320–1920), no horizontal overflow | Done — see `docs/screenshots/homepage/` |

## 10. Verdict

**Functionality (code):** Four marketplace modules + trust + Agri Mitra demo are real.  
**UI/UX:** Critical mobile nav and village mega-dropdown issues addressed in this pass.  
**Still open:** Full viewport matrix sign-off, TE chrome on older forms, jobs/crops/buyers ListingCard adoption, pagination, cloud STT evaluation.
