# Investigation: Why unsuitable Telugu still appears on `/onboarding/roles`

**Date:** 2026-10-30  
**Status:** Investigation complete — **display text not changed yet** (awaiting term approval)  
**Page under test:** `/onboarding/roles` (role selection / onboarding)

---

## 1. Root cause (why the screenshot still looks wrong)

| Hypothesis | Result |
| --- | --- |
| Stale build / cache serving old JS | **Not the cause.** Live source still contains the old Telugu. |
| Hardcoded Telugu on the roles page bypassing the dictionary | **Not for role names.** Role labels come from `messages.te` via `copy.*`. |
| Database-seeded role labels | **Not used.** Role checkboxes use `lib/locale.ts` keys, not DB role display names. |
| Latest commit fixed terminology but UI ignored it | **False.** Commit `acf2254` only added docs (`TERMINOLOGY_AUDIT_REPORT.md`, `TERMINOLOGY_STANDARD.md`). **`lib/locale.ts` was never updated.** |
| Wrong locale (English dictionary while UI looks Telugu) | Unlikely if screenshot shows Telugu; when `locale === "te"`, `t("te")` / `useLocale().copy` resolves to `messages.te`. |

**Verdict:** The onboarding page is correctly wired to the translation dictionary. The unsuitable words are still the **current** values in `messages.te` (and a few related hardcodes elsewhere). Documentation alone cannot change the rendered page.

```
Rendered path for role "Worker":

  cookie/header locale → getRequestLocale / LocaleProvider
       → messages.te.roleWorker = "కూలీ"   ← still live in source
       → RolesForm shows copy.roleWorker
```

Checkbox `name="worker"` (form field / DB role id) is unrelated to the label string and must stay `worker`.

---

## 2. String source map — this exact page

### 2.1 Page chrome (server)

| Visible UI | Source file | Mechanism | Current EN | Current TE | Notes |
| --- | --- | --- | --- | --- | --- |
| Page heading | `app/onboarding/roles/page.tsx` → `copy.rolesTitle` | `t(locale)` from `lib/locale.ts` | Choose your roles | మీ పాత్రలు ఎంచుకోండి | Dictionary |
| Page subtitle | same → `copy.rolesSubtitle` | same | One account can be farmer, worker, provider and buyer… | …రైతు, **కూలీ**, **ప్రొవైడర్**… | **Needs rewrite** |
| Suspense fallback title | `page.tsx` literal | Hardcoded EN only | Choose your roles | *(English until hydrate)* | Minor; should use locale later |

### 2.2 Form (`components/roles-form.tsx` via `useLocale().copy`)

| Visible UI | Dictionary key | Current EN | Current TE | Issue |
| --- | --- | --- | --- | --- |
| Name label | `yourName` | Your name | మీ పేరు | OK |
| Name placeholder | `yourNamePlaceholder` | Your name or farm / business name | మీ పేరు లేదా పొలం / వ్యాపారం పేరు | OK |
| Role section heading | `howUse` | How will you use AllFarmNeeds? | AllFarmNeedsను మీరు ఎలా వాడతారు? | Brand OK; TE slightly stiff |
| Farmer name | `roleFarmer` | Farmer | రైతు | OK |
| Farmer description | `roleFarmerDesc` | Find services, post farm jobs… | …**ఫార్మ్ జాబ్స్** పోస్ట్… | Loanword |
| Worker name | `roleWorker` | Worker | **కూలీ** | **Critical** |
| Worker description | `roleWorkerDesc` | Browse farm jobs… | **ఫార్మ్ జాబ్స్** చూసి… | Loanword |
| Provider name | `roleProvider` | Service provider | **సేవా ప్రొవైడర్** | Awkward loanword |
| Provider description | `roleProviderDesc` | Publish tractor, labour… | …**కూలీ**, నీటిపారుదల… | **కూలీ** + labour |
| Buyer name | `roleBuyer` | Buyer | కొనుగోలుదారు | OK |
| Buyer description | `roleBuyerDesc` | Post purchase needs, hold crop stock… | …స్టాక్ **హోల్డ్**… **డీల్స్**… | Loanwords |
| Farmer location block | `farmerLocation`, `district`, `mandal`, `village`, `aboutFarm`, `selectLocation` | … | జిల్లా / మండలం / … | Mostly OK; location **names** from DB (`districts`/`mandals`/`villages`) |
| Continue / Saving | `continue` / `saving` | Continue / Saving… | కొనసాగించండి / సేవ్ అవుతోంది… | “సేవ్” is mild loanword |
| Validation error | `app/actions/roles.ts` hardcoded bilingual | Choose at least one role… | కనీసం ఒక పాత్ర ఎంచుకోండి | Not from `locale.ts` |
| Supabase errors | `error.message` | English DB/API text | may show English | Not localized |

### 2.3 Header / bottom nav / footer (same layout shell)

| Visible UI | Source | Current TE | Issue |
| --- | --- | --- | --- |
| Bottom: Home / Explore / Create / Messages / My work | `site-bottom-nav.tsx` → `copy.nav*` | హోమ్ / అన్వేషించండి / సృష్టించండి / సందేశాలు / **నా పని** | “నా పని” ambiguous |
| Header My work, Roles, marketplace links | `site-header.tsx` → `copy.*` | includes **కూలీ ప్రొఫైల్**, **ప్రొవైడర్** *, **పంట డీల్స్** when menus open | Same dictionary |
| Footer tagline | `copy.tagline` | రైతులకు కావాల్సినవన్నీ. ఒకే వేదిక. | OK |
| Footer TG/AP line | **Hardcoded** in `site-footer.tsx` | తెలంగాణ మొదట — … | OK; not in dictionary |
| Footer Explore / Account headings | `navExplore` / `navAccount` | అన్వేషించండి / **నా పని** | Ambiguous account label |
| Footer module link titles | `modules.*.title` | వ్యవసాయ సేవలు / ఉద్యోగాలు / … | Titles OK; module **bodies** elsewhere still have కూలీ |

**Not on this page:** service category seeds (`వ్యవసాయ కూలీలు` in SQL). Those affect services browse, not role checkboxes.

---

## 3. Full codebase inventory of `కూలీ` (user-facing vs non-UI)

### 3.1 User-facing (must change after approval)

| File | Snippet |
| --- | --- |
| `lib/locale.ts` | `roleWorker`, `roleLabourContractor`, `workerProfile`, search placeholders, module bodies, `rolesSubtitle`, provider/worker descs, jobs subtitle, etc. |
| `app/create/page.tsx` | Inline TE: కూలీ / కూలీలు / ప్రొవైడర్ |
| `components/agri-mitra-chat.tsx` | Example chips / placeholder |
| `lib/agri-mitra/tools.ts` | Assistant TE replies (“కూలీలు: …”) |
| DB seed `service_categories` `farm-labour` | `name_te = 'వ్యవసాయ కూలీలు'` |

### 3.2 Keep for understanding only (non-display), if approved

| File | Role |
| --- | --- |
| `lib/agri-mitra/intent.ts` | Regex synonyms so typed “కూలీ” still matches intent |

### 3.3 Docs / product plan (not runtime UI)

| File | Note |
| --- | --- |
| `docs/TERMINOLOGY_*.md` | Mentions forbidden term |
| `AllFarmNeeds_Product_Business_Technical_Plan.md` | Example quote |

---

## 4. Context-specific alternatives for **this page** (review — do not auto-pick blindly)

### Role: Worker (`roleWorker`) — checkbox title

| Option | Telugu | Fit |
| --- | --- | --- |
| **A** | పొలం పని చేసేవారు | Clear, respectful, a bit long for a checkbox |
| **B** (recommended short) | పని వారు | Natural TG/AP; pairs with “పొలం పనులు” |
| **C** | వ్యవసాయ పని చేసేవారు | More formal |
| Avoid | కూలీ, కార్మికుడు | Per product rules |

**EN proposal:** `Farm worker` (clearer than bare “Worker” on a farmer platform).

### Role description: Worker (`roleWorkerDesc`)

| Option | Telugu |
| --- | --- |
| **A** | మీ దగ్గర ఉన్న పొలం పనులు చూసి దరఖాస్తు చేయండి. |
| **B** | పొలం పనులు చూసి, చెల్లింపు పనికి దరఖాస్తు చేయండి. |

**EN:** Keep “Browse farm jobs and apply for paid work near you.” or “Browse farm jobs near you and apply.”

### Role: Service provider (`roleProvider`)

| Option | Telugu |
| --- | --- |
| **A** (recommended) | సేవలు అందించేవారు |
| **B** (short) | సేవాదారు |
| **C** | సేవా నిపుణుడు |
| Avoid | సేవా ప్రొవైడర్ |

**EN:** Keep “Service provider”.

### Provider description (`roleProviderDesc`)

| Option | Telugu |
| --- | --- |
| **A** | ట్రాక్టర్, పని వారు, నీటిపారుదల వంటి వ్యవసాయ సేవలు ప్రచురించండి. |
| **B** | ట్రాక్టర్, నీటిపారుదల మరియు ఇతర పొలం సేవలు ప్రచురించండి. *(avoids naming workers in provider blurb)* |

### Subtitle (`rolesSubtitle`)

| Option | Telugu |
| --- | --- |
| **A** | ఒకే ఖాతాలో రైతు, పని వారు, సేవాదారు మరియు కొనుగోలుదారు పాత్రలు ఉండవచ్చు. |
| **B** | ఒకే ఖాతాతో రైతు, పొలం పని, సేవలు, కొనుగోలు — అన్నీ వాడవచ్చు. |

### Farmer description (`roleFarmerDesc`)

| Option | Telugu |
| --- | --- |
| **A** | సేవలు కనుగొనండి, పొలం పనులు పోస్ట్ చేయండి, పంటలు అమ్మండి. |

### Buyer description (`roleBuyerDesc`)

| Option | Telugu |
| --- | --- |
| **A** | కొనుగోలు అవసరాలు పోస్ట్ చేయండి, పంట నిల్వ కాపాడండి, ఒప్పందాలు నిర్వహించండి. |
| **B** | …పంట నిల్వ **రిజర్వ్** చేయండి… *(if “కాపాడండి” feels unclear)* |

### Page title / howUse / continue

| Key | Current TE | Alternatives |
| --- | --- | --- |
| `rolesTitle` | మీ పాత్రలు ఎంచుకోండి | **A** keep · **B** మీరు ఎలా వాడతారు? *(merge with howUse)* |
| `howUse` | AllFarmNeedsను మీరు ఎలా వాడతారు? | **A** keep · **B** మీకు ఏ పాత్రలు కావాలి? |
| `saving` | సేవ్ అవుతోంది… | **A** భద్రపరుస్తున్నాం… · **B** keep సేవ్ |

### Chrome on this page (header/footer/bottom)

| Key | Current TE | Alternatives |
| --- | --- | --- |
| `navProfile` / `navAccount` | నా పని | **A** నా ఖాతా · **B** నా పనులు · **C** keep |
| `workerProfile` (menu) | కూలీ ప్రొఫైల్ | పని వారి ప్రొఫైల్ / పొలం పని ప్రొఫైల్ |
| `providerBookings` | ప్రొవైడర్ బుకింగ్‌లు | సేవా బుకింగ్‌లు / నా సేవా బుకింగ్‌లు |

---

## 5. What was *not* done (intentionally)

- No edit to `lib/locale.ts` display values in this investigation step.  
- No mass find-replace of కూలీ.  
- No claim that docs commits “fixed” the UI.  
- TypeScript / production build / mobile–desktop visual verification of **new** strings: **blocked until term approval**, then required before calling the task done.

---

## 6. Approval gate (reply with choices)

For onboarding + global worker/provider labels:

1. Worker short label: **A / B / C** (§4)  
2. Provider label: **A / B / C**  
3. Hold / stock wording: **కాపాడండి** vs **రిజర్వ్**  
4. My work nav: **నా ఖాతా** / **నా పనులు** / keep  
5. Keep `కూలీ` only in Agri Mitra **intent** parser: **Yes / No**  
6. Also update create hub + Agri Mitra **visible** chips in the same change set: **Yes / No**  
7. DB migration for category `farm-labour` `name_te`: **Yes / No**

After approval: implement dictionary + hardcodes + optional migration → `tsc` + `next build` → verify `/onboarding/roles` in TE at mobile and desktop actually shows the new strings (view-source / DOM check, not dictionary-only).
