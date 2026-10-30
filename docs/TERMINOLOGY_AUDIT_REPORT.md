# AllFarmNeeds — Terminology Audit Report (approval gate)

**Date:** 2026-10-30  
**Status:** **Awaiting approval — no large-scale UI replacements applied yet**  
**Primary dictionary:** `lib/locale.ts`  
**Also scanned:** `app/**`, `components/**`, `lib/agri-mitra/**`, category seeds in migrations  

**Constraints (unchanged):** DB enum/field names, URLs, auth, RLS, business logic stay as-is. Display labels and translations only after approval.

---

## 1. Executive summary

| Finding | Severity | Action after approval |
| --- | --- | --- |
| Telugu **కూలీ / కూలీలు** used for farm workers and labour services | Critical — disrespectful | Replace with respectful worker / farm-work wording |
| Heavy **English loanwords** in TE (ప్రొవైడర్, ఫార్మ్ జాబ్స్, డీల్స్, హోల్డ్, ఫిల్టర్లు, స్టాఫ్) | High — unnatural | Prefer natural Telugu where clear |
| **నా పని** for “My work” | Medium — ambiguous | Confirm preferred alternative |
| EN **labour** in search placeholders | Medium — UK spelling OK; “farm workers” clearer in UI | Prefer “farm workers” in farmer-facing search hints |
| Hardcoded bilingual strings outside `locale.ts` | High — drift risk | Move to dictionary after term approval |
| Seed category `వ్యవసాయ కూలీలు` | Critical | New migration to update **display** `name_te` only |
| Agri Mitra intent matching still needs **కూలీ** as input synonym | Keep in parser only | Do not show in UI; keep as understanding keyword |

**Approx. occurrences reviewed:** ~220 user-facing EN keys in `messages.en`, ~220 TE keys in `messages.te`, ~80+ inline `locale === "te"` strings, category seeds, Agri Mitra TE replies.

---

## 2. Proposed core glossary (for approval)

Approve or edit these before implementation.

| Concept | Approved English (proposed) | Approved Telugu (proposed) | Avoid |
| --- | --- | --- | --- |
| Farm worker (role) | Farm worker | వ్యవసాయ కార్మికుడు **OR** పొలం పని చేసేవారు | కూలీ, కూలీలు *(user forbid కార్మికుడు too — see §2.1)* |
| Farm workers (plural / hire) | Farm workers | పొలం పని వారు / పని మనుషులు | కూలీలు |
| Labour contractor | Labour contractor | పని కాంట్రాక్టర్ / గ్రూప్ కాంట్రాక్టర్ | కూలీ కాంట్రాక్టర్ |
| Service provider | Service provider | సేవా నిపుణుడు / సేవలు అందించేవారు | సేవా ప్రొవైడర్ (loanword) |
| Provider (short) | Provider | సేవా వ్యక్తి / సేవాదారు | ప్రొవైడర్ alone |
| My work (nav) | My work | నా ఖాతా **OR** నా పనులు | నా పని if too vague |
| Marketplace | Marketplace | వేదిక / మార్కెట్‌ప్లేస్ | మార్కెట్ alone when unclear |
| Explore marketplace | Explore marketplace | వేదికను చూడండి | మార్కెట్ అన్వేషించండి (stiff) |
| Farm jobs | Farm jobs | పొలం పనులు / వ్యవసాయ ఉద్యోగాలు | ఫార్మ్ జాబ్స్ |
| Crop deals | Crop deals | పంట అమ్మకపు ఒప్పందాలు | పంట డీల్స్ |
| Hold quantity | Hold quantity | పరిమాణం కాపాడండి / రిజర్వ్ చేయండి | హోల్డ్ చేయండి |
| Apply filters | Apply filters | వర్తింపజేయండి / శోధన వర్తించు | ఫిల్టర్లు వర్తింపజేయి |
| Staff review | Staff-reviewed | మా బృందం సమీక్షిస్తుంది | స్టాఫ్ సమీక్షలో |
| Purchase needs | Purchase needs | కొనుగోలు అవసరాలు | Buyers & Traders (already fixed in EN) |

### 2.1 Decision needed: farm worker Telugu

User instruction forbids **కూలీ** and also **కార్మికుడు / కార్మికులు**.

Please pick one worker-role Telugu standard:

| Option | Telugu | Tone |
| --- | --- | --- |
| **A (recommended)** | పొలం పని చేసేవారు (role label short: **పని వారు**) | Natural, respectful, TG/AP clear |
| **B** | వ్యవసాయ పని చేసేవారు | Slightly more formal |
| **C** | ఉద్యోగి / పని ఉద్యోగి | Too office-like for farm day labour |

**Default if you approve without comment:** Option **A**.

---

## 3. Phrase-by-phrase proposals

### 3.1 Roles & navigation

| Screen | Existing English | Existing Telugu | Proposed English | Proposed Telugu | Reason |
| --- | --- | --- | --- | --- | --- |
| Role badge / roles form | Worker | కూలీ | Farm worker | పొలం పని చేసేవారు *(or Option A short: పని వారు)* | Forbidden / disrespectful |
| Roles form | Labour contractor | కూలీ కాంట్రాక్టర్ | Labour contractor | పని కాంట్రాక్టర్ | Removes కూలీ |
| Roles / My work | Service provider | సేవా ప్రొవైడర్ | Service provider | సేవలు అందించేవారు | Less loanword |
| Header / bottom nav | My work | నా పని | My work | నా ఖాతా **alt:** నా పనులు | “నా పని” can mean “my job” vaguely |
| Explore title | Explore marketplace | మార్కెట్ అన్వేషించండి | Explore marketplace | వేదికను చూడండి **alt:** మార్కెట్‌ప్లేస్ చూడండి | Natural action wording |
| Nav marketplace section | Marketplace | మార్కెట్ | Marketplace | వేదిక **alt:** మార్కెట్‌ప్లేస్ | Clearer |

### 3.2 Homepage & search

| Screen | Existing English | Existing Telugu | Proposed English | Proposed Telugu | Reason |
| --- | --- | --- | --- | --- | --- |
| Home search placeholder | Tractor, labour, drip, jobs… | ట్రాక్టర్, కూలీ, డ్రిప్, ఉద్యోగాలు… | Tractor, farm workers, drip, jobs… | ట్రాక్టర్, పని వారు, డ్రిప్, ఉద్యోగాలు… | Removes కూలీ; clearer EN |
| Home CTA worker | Find farm jobs | ఫార్మ్ జాబ్స్ చూడండి | Find farm jobs | పొలం పనులు చూడండి | Drop English “jobs” loan |
| Home trust | Listings are staff-reviewed… | జాబితాలు స్టాఫ్ సమీక్షలో… | Listings are reviewed by our team… | జాబితాలను మా బృందం సమీక్షిస్తుంది… | Plain TE |
| Module farm services body | …labour… | …కూలీ… | …farm workers / labour services… | …పని వారు / కూలీ సేవలు → పని సేవలు… | Respectful |
| Module farm jobs body | Hire workers… | కూలీలను నియమించండి… | Hire farm workers… | పని వారిని నియమించండి… | Forbidden term |

### 3.3 Services

| Screen | Existing English | Existing Telugu | Proposed English | Proposed Telugu | Reason |
| --- | --- | --- | --- | --- | --- |
| Services search | Tractor, drip, labour… | ట్రాక్టర్, డ్రిప్, కూలీ… | Tractor, drip, farm workers… | ట్రాక్టర్, డ్రిప్, పని వారు… | Consistency |
| Verified only | Verified providers only | ధృవీకరించిన ప్రొవైడర్లు మాత్రమే | Verified service providers only | ధృవీకరించిన సేవాదారులు మాత్రమే | Less loanword |
| Apply filters | Apply filters | ఫిల్టర్లు వర్తింపజేయి | Apply filters | వడపోతలు వర్తింపజేయండి **alt:** శోధన వర్తించు | Natural verb form |
| Contact provider | Contact provider | ప్రొవైడర్‌ను సంప్రదించండి | Contact provider | సేవాదారుని సంప్రదించండి | Match glossary |
| About the provider | About the provider | ప్రొవైడర్ గురించి | About the provider | సేవాదారు గురించి | Inline TE |

### 3.4 Farm jobs & create hub

| Screen | Existing English | Existing Telugu | Proposed English | Proposed Telugu | Reason |
| --- | --- | --- | --- | --- | --- |
| Jobs CTA | Post a job | కొత్త జాబ్ | Post a farm job | కొత్త పొలం పని | Less “job” loan |
| Create card | Post a farm job / ఫార్మ్ జాబ్ | same | Post a farm job | పొలం పని పోస్ట్ చేయండి | Consistency |
| Create body | Hire workers… | కూలీలను నియమించడానికి… | Hire farm workers… | పని వారిని నియమించడానికి… | Forbidden |
| Create empty | …worker… | …కూలీ… | …farm worker… | …పొలం పని చేసేవారు… | Forbidden |
| Worker profile | Worker profile | కూలీ ప్రొఫైల్ | Farm worker profile | పని వారి ప్రొఫైల్ | Forbidden |
| Jobs subtitle | …as a worker | …కూలీగా దరఖాస్తు | …as a farm worker | …పని వారిగా దరఖాస్తు | Forbidden |
| Find jobs | Find farm jobs | ఫార్మ్ జాబ్స్ చూడండి | Find farm jobs | పొలం పనులు చూడండి | Loanword |

### 3.5 Crops & deals

| Screen | Existing English | Existing Telugu | Proposed English | Proposed Telugu | Reason |
| --- | --- | --- | --- | --- | --- |
| Hold quantity | Hold quantity | పరిమాణం హోల్డ్ చేయండి | Hold quantity | పరిమాణం కాపాడండి **alt:** పరిమాణం రిజర్వ్ చేయండి | Natural TE |
| Holding… | Holding… | హోల్డ్ అవుతోంది… | Holding… | కాపాడుతున్నాం… | Match |
| Crop deals | Crop deals | పంట డీల్స్ | Crop deals | పంట ఒప్పందాలు | Drop “డీల్” |
| Crops subtitle | Hold quantity to start a deal | …డీల్… హోల్డ్… | Hold quantity to start a deal | ఒప్పందం ప్రారంభించడానికి పరిమాణం కాపాడండి | Consistency |
| Role buyer desc | hold crop stock, and manage deals | …స్టాక్ హోల్డ్… డీల్స్… | hold crop stock, and manage deals | పంట నిల్వ కాపాడండి, ఒప్పందాలు నిర్వహించండి | Natural |

### 3.6 Auth & onboarding

| Screen | Existing English | Existing Telugu | Proposed English | Proposed Telugu | Reason |
| --- | --- | --- | --- | --- | --- |
| Login subtitle | …one-time login code | …వన్-టైమ్ కోడ్… | …one-time login code | …ఒకసారి వాడే కోడ్… **alt:** keep OTP as ఓటీపీ కోడ్ | Clearer for mixed literacy |
| Email hint | Magic links… Auth template… | Auth టెంప్లేట్… | We email a login code. | మేము లాగిన్ కోడ్ పంపుతాము. | Hide developer jargon from farmers |
| Roles subtitle | …worker, provider… | …కూలీ, ప్రొవైడర్… | …farm worker, service provider… | …పని వారు, సేవాదారు… | Glossary |
| Google error (login page) | …Google provider… | …Google ప్రొవైడర్… కాన్ఫిగర్… | Google sign-in is not available yet. | Google సైన్-ఇన్ ఇంప్పుడు అందుబాటులో లేదు. | Admin-facing detail → support, not farmer copy |

### 3.7 Agri Mitra (UI strings)

| Screen | Existing English | Existing Telugu | Proposed English | Proposed Telugu | Reason |
| --- | --- | --- | --- | --- | --- |
| Example chip | Need 10 workers for cotton | పత్తికి పది మంది కూలీలు | Need 10 farm workers for cotton | పత్తికి పది మంది పని వారు | Forbidden in UI |
| Placeholder | … | …కూలీలు కావాలి | … | …పని వారు కావాలి | Forbidden |
| Confirm kind | Publish farm job | ఫార్మ్ జాబ్ ప్రచురణ | Publish farm job | పొలం పని ప్రచురణ | Loanword |
| Explore link | Explore marketplace | మార్కెట్ అన్వేషించండి | Explore marketplace | వేదికను చూడండి | Match nav |

**Parser note:** `lib/agri-mitra/intent.ts` may keep `కూలీ` as an **input synonym** so users who type it still match — do not surface it in suggestions.

### 3.8 Database-backed category labels (display only)

| Screen | Existing English | Existing Telugu | Proposed English | Proposed Telugu | Reason |
| --- | --- | --- | --- | --- | --- |
| Service category seed `farm-labour` | Farm labour services | వ్యవసాయ కూలీలు | Farm labour services **alt:** Farm worker services | వ్యవసాయ పని సేవలు | Seed `name_te` update via migration; slug unchanged |

Other category seeds should be spot-checked in implementation for loanwords; list full seed rows in implementation report.

### 3.9 English-only polish (keep TE aligned)

| Screen | Existing English | Proposed English | Reason |
| --- | --- | --- | --- |
| Module farm services body | Tractors, labour, irrigation… | Tractors, farm workers, irrigation… | Clearer than “labour” alone |
| Role provider desc | Publish tractor, labour, irrigation… | Publish tractor, farm-worker, irrigation… | Consistency |
| statusLabel fallback | raw `snake_case` | Keep humanize via `statusLabel` only | Never show raw enums |
| Admin | Admin | Admin (staff-only OK) | Optional: “Staff” |

---

## 4. Sources beyond `locale.ts` (must update after approval)

| Area | Files | Issue type |
| --- | --- | --- |
| Create hub | `app/create/page.tsx` | కూలీ, ఫార్మ్ జాబ్ inline |
| Jobs / crops / buyers lists | `app/jobs/page.tsx`, etc. | Inline TE empty/filter copy |
| Services detail | `app/services/[id]/page.tsx` | ప్రొవైడర్ |
| Profile welcome | `app/profile/page.tsx` | ఫార్మ్ జాబ్ |
| Login errors | `app/login/page.tsx` | Config jargon |
| Agri Mitra UI | `components/agri-mitra-chat.tsx` | కూలీ examples |
| Agri Mitra tools | `lib/agri-mitra/tools.ts` | కూలీ in assistant replies |
| Intent parser | `lib/agri-mitra/intent.ts` | Keep synonym; hide from UI |
| Category seed | `supabase/migrations/…marketplace_foundation.sql` | `వ్యవసాయ కూలీలు` (needs **new** display migration) |
| Notification templates in SQL | trust workflows migration | డీల్ in TE titles — update via new migration if still live |

---

## 5. Architecture checklist

| Item | Status |
| --- | --- |
| EN/TE key parity in `messages` | Structurally paired today |
| Hardcoded UI strings | Many — migrate into `locale.ts` during implementation |
| Role IDs (`worker`, `service_provider`, …) | **Keep** |
| URLs (`/jobs`, `/buyers`, …) | **Keep** |
| Enums (`published`, `pending_review`, …) | **Keep**; display via `statusLabel` |
| Intent keyword `కూలీ` | **Keep in parser only** |

---

## 6. Approval checklist

Please confirm before implementation:

- [ ] Worker Telugu Option **A / B / C** (default A)
- [ ] Provider Telugu: **సేవాదారు** / **సేవలు అందించేవారు** (pick one)
- [ ] My work Telugu: **నా ఖాతా** vs **నా పనులు** vs keep **నా పని**
- [ ] Hold quantity: **కాపాడండి** vs **రిజర్వ్ చేయండి**
- [ ] Apply filters: **వడపోతలు వర్తింపజేయండి** vs **శోధన వర్తించు**
- [ ] Allow `కూలీ` as silent Agri Mitra understanding keyword: **Yes / No**
- [ ] New migration to fix category `name_te` for farm-labour: **Yes / No**

---

## 7. Next steps (after approval)

1. Create `docs/TERMINOLOGY_STANDARD.md` from approved glossary.  
2. Update `lib/locale.ts` systematically.  
3. Replace inline TE/EN in pages/components.  
4. Add display-only SQL migration for category (and notification) Telugu if approved.  
5. Deliver `docs/TERMINOLOGY_IMPLEMENTATION_REPORT.md` + EN/TE route smoke.

**No dictionary or UI replacements have been applied in this step.**
