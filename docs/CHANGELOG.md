# AllFarmNeeds website — changelog

## 2026-10-30 — Marketplace verticals + Agri Mitra

### Live modules

- **Farm Services** — browse, book, enquire; provider privacy RPC; moderation.
- **Farm Jobs** — post/apply/select; worker profiles; job moderation.
- **Crop Marketplace** — listings, `product-photos`, atomic deals (B5), moderation.
- **Buyers & Traders** — buyer profile, requirements, seller offers, moderation.
- **Shared trust** — notifications, reports queue, reviews, enquiry replies, `/admin` hub.
- **Agri Mitra** — EN/TE intent demo, Web Speech STT/TTS, confirmation-gated publish.

### Migrations added (additive + RLS)

| File | Concern |
| --- | --- |
| `20261030100000_provider_contact_privacy.sql` | B1 private contacts + RPC |
| `20261030102000_farm_jobs_moderation.sql` | B7 jobs |
| `20261030110000_crop_marketplace_deals.sql` | B5 deals + B7 products + product-photos |
| `20261030120000_buyer_requirements_moderation.sql` | B7 buyers |
| `20261030130000_shared_trust_workflows.sql` | B3 notifications, B4 reviews, B6 enquiry_messages |
| `20261030140000_agri_mitra.sql` | B8 sessions / messages / confirmations |

### Deferred

- B2 `media_assets` (keep `photo_urls[]`)
- Cloud STT/TTS and outbound email/SMS

### Homepage

All four marketplace cards link to real routes; Agri Mitra has header + home entry.
