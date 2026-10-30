/**
 * Services security checks for B1 provider contact privacy.
 *
 * Requires:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
 *   SUPABASE_SERVICE_ROLE_KEY  (local/CI only — never ship to the browser)
 *
 * Run: node --env-file=.env.local scripts/rls-provider-contact-privacy.mjs
 */

import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function fail(message) {
  console.error(`FAIL: ${message}`);
  process.exitCode = 1;
}

function pass(message) {
  console.log(`PASS: ${message}`);
}

async function main() {
  if (!url || !anonKey) {
    fail("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY");
    return;
  }
  if (!serviceKey) {
    console.log(
      "SKIP: SUPABASE_SERVICE_ROLE_KEY not set. Add it to .env.local for automated RLS checks.",
    );
    return;
  }

  const admin = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const anon = createClient(url, anonKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  const stamp = Date.now();
  const providerEmail = `rls-provider-${stamp}@example.com`;
  const farmerEmail = `rls-farmer-${stamp}@example.com`;
  const password = `Test-${stamp}-Aa1!`;

  const { data: providerAuth, error: providerCreateError } =
    await admin.auth.admin.createUser({
      email: providerEmail,
      password,
      email_confirm: true,
    });
  if (providerCreateError || !providerAuth.user) {
    fail(`create provider: ${providerCreateError?.message}`);
    return;
  }
  const providerId = providerAuth.user.id;

  const { data: farmerAuth, error: farmerCreateError } =
    await admin.auth.admin.createUser({
      email: farmerEmail,
      password,
      email_confirm: true,
    });
  if (farmerCreateError || !farmerAuth.user) {
    fail(`create farmer: ${farmerCreateError?.message}`);
    return;
  }
  const farmerId = farmerAuth.user.id;

  try {
    await admin.from("user_roles").insert([
      { user_id: providerId, role: "service_provider" },
      { user_id: farmerId, role: "farmer" },
    ]);

    await admin.from("provider_profiles").upsert({
      user_id: providerId,
      business_name: "RLS Test Tractor",
      about: "security test",
      show_contact_publicly: false,
      phone: null,
      whatsapp: null,
    });

    await admin.from("provider_private_contacts").upsert({
      user_id: providerId,
      phone: "+919999000001",
      whatsapp: "+919999000002",
    });

    // 1) Anon must not read private contacts table.
    const { data: leakedRows, error: leakError } = await anon
      .from("provider_private_contacts")
      .select("phone, whatsapp")
      .eq("user_id", providerId);
    if (leakError && /permission|rls|policy/i.test(leakError.message)) {
      pass("anon cannot select provider_private_contacts (RLS/permission)");
    } else if (!leakedRows || leakedRows.length === 0) {
      pass("anon select on provider_private_contacts returns no rows");
    } else {
      fail(`anon leaked private contacts: ${JSON.stringify(leakedRows)}`);
    }

    // 2) Public profile columns must not expose numbers.
    const { data: publicProfile } = await anon
      .from("provider_profiles")
      .select("phone, whatsapp, show_contact_publicly")
      .eq("user_id", providerId)
      .maybeSingle();
    if (publicProfile?.phone || publicProfile?.whatsapp) {
      fail(
        `provider_profiles still exposes phone/whatsapp: ${JSON.stringify(publicProfile)}`,
      );
    } else {
      pass("provider_profiles phone/whatsapp are null for public read");
    }

    // 3) RPC hides numbers when show_contact_publicly is false.
    const { data: hiddenContact } = await anon.rpc("get_provider_contact", {
      p_provider_id: providerId,
    });
    const hidden = Array.isArray(hiddenContact) ? hiddenContact[0] : hiddenContact;
    if (hidden?.phone || hidden?.whatsapp) {
      fail(`RPC leaked contact while private: ${JSON.stringify(hidden)}`);
    } else {
      pass("get_provider_contact hides numbers when not public");
    }

    // 4) RPC reveals numbers when opted in publicly.
    await admin
      .from("provider_profiles")
      .update({ show_contact_publicly: true })
      .eq("user_id", providerId);
    const { data: publicContact } = await anon.rpc("get_provider_contact", {
      p_provider_id: providerId,
    });
    const revealed = Array.isArray(publicContact) ? publicContact[0] : publicContact;
    if (revealed?.phone === "+919999000001" && revealed?.whatsapp === "+919999000002") {
      pass("get_provider_contact returns numbers when show_contact_publicly=true");
    } else {
      fail(`RPC public reveal unexpected: ${JSON.stringify(revealed)}`);
    }

    // 5) Farmer with open enquiry can read contact even if not public.
    await admin
      .from("provider_profiles")
      .update({ show_contact_publicly: false })
      .eq("user_id", providerId);

    const { data: category } = await admin
      .from("service_categories")
      .select("id")
      .limit(1)
      .maybeSingle();
    if (!category) {
      fail("no service_categories available for booking/enquiry fixture");
      return;
    }

    const { data: listing, error: listingError } = await admin
      .from("service_listings")
      .insert({
        provider_id: providerId,
        category_id: category.id,
        title: "RLS privacy listing",
        description: "test",
        status: "published",
        moderation_status: "approved",
      })
      .select("id")
      .single();
    if (listingError || !listing) {
      fail(`create listing: ${listingError?.message}`);
      return;
    }

    await admin.from("enquiries").insert({
      sender_id: farmerId,
      recipient_id: providerId,
      service_listing_id: listing.id,
      message: "Need tractor tomorrow",
      status: "open",
    });

    const farmerClient = createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    });
    const { error: farmerLoginError } = await farmerClient.auth.signInWithPassword({
      email: farmerEmail,
      password,
    });
    if (farmerLoginError) {
      fail(`farmer login: ${farmerLoginError.message}`);
      return;
    }

    const { data: partyContact } = await farmerClient.rpc("get_provider_contact", {
      p_provider_id: providerId,
    });
    const party = Array.isArray(partyContact) ? partyContact[0] : partyContact;
    if (party?.phone === "+919999000001") {
      pass("enquiry counterparty can read provider contact via RPC");
    } else {
      fail(`counterparty RPC unexpected: ${JSON.stringify(party)}`);
    }
  } finally {
    await admin.auth.admin.deleteUser(providerId);
    await admin.auth.admin.deleteUser(farmerId);
  }

  if (process.exitCode) {
    console.error("Provider contact privacy RLS checks finished with failures.");
  } else {
    console.log("Provider contact privacy RLS checks finished successfully.");
  }
}

main().catch((error) => {
  fail(error instanceof Error ? error.message : String(error));
});
