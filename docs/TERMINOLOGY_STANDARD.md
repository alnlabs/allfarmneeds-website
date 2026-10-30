# AllFarmNeeds — Terminology Standard (DRAFT — pending approval)

**Status:** Draft. Source of truth after product owner signs off on `docs/TERMINOLOGY_AUDIT_REPORT.md`.  
**Do not treat as final until approval checklist in the audit report is completed.**

---

## Purpose

One professional language experience in **English** and **Telugu** (Telangana / Andhra Pradesh) across every module, screen, notification, and future feature.

---

## Rules

1. **Respect first.** Never use కూలీ / కూలీలు (or కార్మికుడు / కార్మికులు if rejected) in UI, seeds, or assistant suggestions.
2. **Meaning over literal translation.** Prefer clear spoken Telugu over literary or machine style.
3. **One concept → one label** in each language. Do not mix “marketplace / మార్కెట్ / వేదిక” randomly.
4. **Farmer-facing copy avoids developer jargon** (Auth templates, providers as OAuth, raw enums).
5. **English loanwords in Telugu** only when the loanword is universal (WhatsApp, Google, Tractor brand names) or approved in the glossary.
6. **Identifiers stay English:** role keys, URLs, DB enums, API fields. Only display strings change.
7. **Agri Mitra** may understand deprecated/colloquial input synonyms; it must not *suggest* them.

---

## Glossary (proposed defaults — edit on approval)

| Concept | English | Telugu (default proposal) |
| --- | --- | --- |
| Platform | AllFarmNeeds | AllFarmNeeds |
| Marketplace | Marketplace | వేదిక |
| Farm services | Farm services | వ్యవసాయ సేవలు |
| Farm jobs | Farm jobs | పొలం పనులు |
| Sell crops | Sell crops / Sell produce | పంట అమ్మకం |
| Purchase needs | Purchase needs | కొనుగోలు అవసరాలు |
| Farmer | Farmer | రైతు |
| Farm worker | Farm worker | పొలం పని చేసేవారు (short: పని వారు) |
| Service provider | Service provider | సేవలు అందించేవారు (short: సేవాదారు) |
| Buyer | Buyer | కొనుగోలుదారు |
| Labour contractor | Labour contractor | పని కాంట్రాక్టర్ |
| My work | My work | నా ఖాతా *(pending choice)* |
| Hold quantity | Hold quantity | పరిమాణం కాపాడండి |
| Crop deal | Crop deal | పంట ఒప్పందం |
| Apply filters | Apply filters | శోధన వర్తించు |
| Staff review | Reviewed by our team | మా బృందం సమీక్షిస్తుంది |
| Agri Mitra | Agri Mitra | అగ్రి మిత్ర |

---

## Forbidden UI terms

| Language | Forbidden | Preferred |
| --- | --- | --- |
| te | కూలీ, కూలీలు, కూలీగా | పని వారు / పొలం పని చేసేవారు |
| te | కార్మికుడు, కార్మికులు | same as above *(if still banned)* |
| te | ఫార్మ్ జాబ్స్ | పొలం పనులు |
| te | పంట డీల్స్ | పంట ఒప్పందాలు |
| te | హోల్డ్ చేయండి (alone) | కాపాడండి / రిజర్వ్ చేయండి |
| te | స్టాఫ్ సమీక్ష | మా బృందం సమీక్ష |
| en | Coolie | Farm worker |
| en | Raw enum text in UI | `statusLabel()` / dictionary |

---

## Implementation sources

| Layer | Location |
| --- | --- |
| Dictionary | `lib/locale.ts` (`messages.en` / `messages.te`) |
| Helpers | `roleLabel`, `statusLabel`, `paymentModelLabel`, `categoryLabel` |
| Categories | DB `name_en` / `name_te` (display migrations only) |
| Prefer | No hardcoded user-facing strings in pages |

---

## Change process

1. Propose term in audit / PR.  
2. Update this standard.  
3. Update `locale.ts` + call sites + seeds.  
4. Keep Agri Mitra synonyms in sync for understanding only.

---

*After approval of the audit report, replace “DRAFT” with “Approved” and date the sign-off.*
