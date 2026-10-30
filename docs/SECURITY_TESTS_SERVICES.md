# Services security tests — provider contact privacy (B1)

## Automated script

```bash
# Add service role to .env.local (never commit; never NEXT_PUBLIC_*)
# SUPABASE_SERVICE_ROLE_KEY=...

npm run test:rls:contacts
```

Checks:

1. Anon cannot read `provider_private_contacts`.
2. `provider_profiles.phone` / `whatsapp` stay null for public reads.
3. `get_provider_contact` hides numbers when `show_contact_publicly = false`.
4. RPC reveals numbers when public opt-in is true.
5. Open enquiry counterparty can read contact via RPC while public opt-in is false.

## Manual checklist

| Case | Expected |
| --- | --- |
| Anonymous opens `/services/[id]` with public contact off | No Call/WhatsApp; Network tab has no phone numbers in listing JSON |
| Provider opts in public contact | Call/WhatsApp appear |
| Provider edits own profile | Sees own phone fields |
| Unrelated logged-in user | No numbers unless public opt-in |
| Farmer with open enquiry/booking | RPC returns numbers; listing UI shows Call/WhatsApp when RPC returns values |

Privacy is enforced in `get_provider_contact`, not only in the UI.
