import { Suspense } from "react";
import { redirect } from "next/navigation";
import { RolesForm } from "@/components/roles-form";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { createClient } from "@/utils/supabase/server";

async function RolesContent() {
  const user = await requireUser();
  if (!user) {
    redirect("/login");
  }

  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("profiles")
    .select("display_name")
    .eq("id", user.id)
    .maybeSingle();

  return (
    <PageShell
      title="Choose your roles"
      subtitle="One account can be both a farmer and a service provider."
    >
      <Panel>
        <RolesForm
          displayName={profile?.display_name ?? ""}
          roles={user.roles}
        />
      </Panel>
    </PageShell>
  );
}

export default function RolesPage() {
  return (
    <Suspense fallback={<PageFallback title="Choose your roles" />}>
      <RolesContent />
    </Suspense>
  );
}
