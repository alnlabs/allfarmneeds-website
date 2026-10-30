import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ProductForm } from "@/components/product-form";
import { PageFallback } from "@/components/page-fallback";
import { PageShell, Panel } from "@/components/ui";
import { requireUser } from "@/lib/auth";
import { getProductFormOptions } from "@/lib/locations";

async function NewCropContent() {
  const user = await requireUser();
  if (!user) redirect("/login");
  if (!user.roles.includes("farmer")) {
    redirect("/onboarding/roles?next=/crops/new");
  }
  const options = await getProductFormOptions();
  return (
    <PageShell
      title="Sell produce"
      subtitle="Publish quantity, price and photos. Staff approve listings before buyers can reserve stock."
    >
      <Panel>
        <ProductForm {...options} />
      </Panel>
    </PageShell>
  );
}

export default function NewCropPage() {
  return (
    <Suspense fallback={<PageFallback title="Sell produce" />}>
      <NewCropContent />
    </Suspense>
  );
}
