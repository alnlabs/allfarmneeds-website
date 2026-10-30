# Marketplace security & role smoke tests (Phase 7)

Use **separate browser profiles** (or private windows) per role. Prefer real OTP/Google accounts with only the intended `user_roles`.

Roles under test: `anon`, `farmer`, `worker`, `service_provider`, `buyer`, `administrator`/`moderator`.

---

## Cross-cutting

| Case | Expected |
| --- | --- |
| Anon opens `/bookings`, `/messages`, `/notifications`, `/admin` | Redirect to login or home; no private rows |
| User A cannot update User B’s listing/job/deal via forged form `id` | RLS/error; no change |
| Pending moderation content | Hidden from public browse; visible to owner + staff |
| Staff `/admin` | Pending counts load; open queues work |
| Report submit | Creates `reports` row; `/admin/reports` shows it |
| Notification triggers | Enquiry/booking/application/deal creates unread row for counterparty |

---

## Services

| Case | Expected |
| --- | --- |
| Anon browse `/services` | Only published + approved |
| Provider creates draft vs published | Draft private; published pending until staff approve |
| Farmer books / enquires | Rows created; provider notified |
| Contact privacy | Follow [SECURITY_TESTS_SERVICES.md](./SECURITY_TESTS_SERVICES.md) |
| Completed booking | Review form appears once; second insert blocked by unique |

---

## Jobs

| Case | Expected |
| --- | --- |
| Anon `/jobs` | Approved published only |
| Non-farmer `/jobs/new` | Redirect to roles |
| Worker applies | Farmer sees application; worker cannot select themselves |
| Farmer selects / declines | Worker notified; worker can only withdraw |
| Cross-user application update | Blocked by guard trigger / RLS |

---

## Crops

| Case | Expected |
| --- | --- |
| Anon `/crops` | Approved published / partially_sold only |
| Seller publishes | `moderation_status=pending` until staff approve |
| Two buyers reserve overlapping qty | Second fails or cannot oversell (`create_product_deal_reservation`) |
| Cancel/reject deal | Quantity released via `transition_product_deal` |
| Buyer cannot accept own listing | RPC error |
| Photos | Upload under `{user_id}/…` in `product-photos` only |

---

## Buyers

| Case | Expected |
| --- | --- |
| Anon `/buyers` | Approved published requirements only |
| Non-buyer `/buyers/new` | Redirect to roles / profile |
| Farmer offers on requirement | Offer visible to buyer; seller cannot accept |
| Buyer accept/decline | Seller notified; unique (requirement, seller) |
| Offer on unapproved requirement | Insert denied by RLS |

---

## Messaging & trust

| Case | Expected |
| --- | --- |
| Enquiry reply | Only parties; closed enquiry rejects reply |
| Unrelated user `/messages/[id]` | 404 / not found |
| Review without completed/selected/accepted entity | Insert rejected by trigger |
| Hide review as staff | Public no longer sees it |

---

## Agri Mitra

| Case | Expected |
| --- | --- |
| Unsigned `/agri-mitra` | Login redirect |
| Draft job/product | Creates **pending** confirmation only — no listing yet |
| Cancel confirmation | Status `cancelled`; no publish |
| Confirm without farmer role | Failed confirmation + assistant error |
| Confirm with farmer role | Listing/job created with `moderation_status=pending` |
| Other user’s `session_id` | Not readable under RLS |
| Voice | Optional browser STT; no audio stored server-side |

---

## Sign-off

| Tester | Date | Notes |
| --- | --- | --- |
| | | |

Automated Services contact script (when service role available locally):

```bash
npm run test:rls:contacts
```
