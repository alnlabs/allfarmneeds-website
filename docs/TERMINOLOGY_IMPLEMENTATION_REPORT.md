# Terminology implementation report

**Date:** 2026-10-30  
**Defaults applied** (from audit recommended options):

| Concept | English | Telugu |
| --- | --- | --- |
| Farm worker | Farm worker | పని వారు |
| Service provider | Service provider | సేవాదారు |
| My account | My account | నా ఖాతా |
| Marketplace | Marketplace | వేదిక |
| Farm jobs | Farm jobs | పొలం పనులు |
| Hold / reserve | Reserve quantity | పరిమాణం కాపాడండి |
| Crop deals | Crop deals | పంట ఒప్పందాలు |

## Why production still showed కూలీ before this change

Deployed code still had `messages.te.roleWorker = "కూలీ"`. Docs-only commits did not change the dictionary. Onboarding page correctly read that dictionary.

## Sources updated

| Source | Change |
| --- | --- |
| `lib/locale.ts` | EN polish + full TE glossary rewrite for roles, nav, modules, hold, filters |
| `app/create/page.tsx` | Inline TE without కూలీ / ప్రొవైడర్ / ఫార్మ్ జాబ్ |
| `components/agri-mitra-chat.tsx` | Examples / placeholder / explore CTA |
| `lib/agri-mitra/tools.ts` | Assistant TE replies |
| `app/profile`, `services/[id]`, list empty states, login | Remaining hardcodes |
| Migration `20261030170000_terminology_display_labels.sql` | `farm-labour` category display labels |
| `lib/agri-mitra/intent.ts` | Synonyms use పని వారు / farm worker (no కూలీ) |
| Foundation seed `farm-labour` | `వ్యవసాయ పని సేవలు` / Farm worker services |

## Onboarding page string verification (source)

| UI | Key / source | New TE |
| --- | --- | --- |
| Heading | `rolesTitle` | మీ పాత్రలు ఎంచుకోండి |
| Subtitle | `rolesSubtitle` | …రైతు, **పని వారు**, **సేవాదారు**… |
| Worker | `roleWorker` | **పని వారు** |
| Provider | `roleProvider` | **సేవాదారు** |
| Farmer desc | `roleFarmerDesc` | …పొలం పనులు పోస్ట్… |
| Worker desc | `roleWorkerDesc` | …పొలం పనులు… |
| Provider desc | `roleProviderDesc` | …పని వారు… *(no కూలీ)* |
| Buyer desc | `roleBuyerDesc` | …నిల్వ కాపాడండి, ఒప్పందాలు… |
| Nav | `navProfile` | నా ఖాతా |

## Deploy note

Vercel will keep showing old copy until this commit is **pushed and deployed**. Apply the SQL migration on Supabase for category labels.
