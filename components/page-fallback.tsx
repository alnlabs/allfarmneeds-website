import { PageShell, Panel } from "@/components/ui";

export function PageFallback({
  title,
  loadingLabel = "Loading…",
}: {
  title: string;
  loadingLabel?: string;
}) {
  return (
    <PageShell title={title}>
      <Panel>
        <p className="text-muted">{loadingLabel}</p>
      </Panel>
    </PageShell>
  );
}
