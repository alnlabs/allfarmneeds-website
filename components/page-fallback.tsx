import { PageShell, Panel } from "@/components/ui";

export function PageFallback({ title }: { title: string }) {
  return (
    <PageShell title={title}>
      <Panel>
        <p className="text-muted">Loading…</p>
      </Panel>
    </PageShell>
  );
}
