import type { ReactNode } from "react";

export function PageShell({
  title,
  subtitle,
  children,
  actions,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  actions?: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-accent-strong">
            {title}
          </h1>
          {subtitle ? <p className="mt-2 max-w-2xl text-muted">{subtitle}</p> : null}
        </div>
        {actions}
      </div>
      {children}
    </main>
  );
}

export function Panel({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      className={`rounded-2xl border border-border bg-white p-5${className ? ` ${className}` : ""}`}
    >
      {children}
    </section>
  );
}

export function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: ReactNode;
  hint?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm font-medium">{label}</span>
      {children}
      {hint ? <span className="block text-xs text-muted">{hint}</span> : null}
    </label>
  );
}

export function TextInput(props: React.ComponentProps<"input">) {
  return (
    <input
      {...props}
      className={`w-full rounded-xl border border-border bg-white px-3 py-2 outline-none ring-accent focus:ring-2 ${props.className ?? ""}`}
    />
  );
}

export function TextArea(props: React.ComponentProps<"textarea">) {
  return (
    <textarea
      {...props}
      className={`w-full rounded-xl border border-border bg-white px-3 py-2 outline-none ring-accent focus:ring-2 ${props.className ?? ""}`}
    />
  );
}

export function Select(props: React.ComponentProps<"select">) {
  return (
    <select
      {...props}
      className={`w-full rounded-xl border border-border bg-white px-3 py-2 outline-none ring-accent focus:ring-2 ${props.className ?? ""}`}
    />
  );
}

export function PrimaryButton(props: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`rounded-xl bg-accent px-4 py-2.5 font-medium text-white hover:bg-accent-strong disabled:opacity-60 ${props.className ?? ""}`}
    />
  );
}

export function SecondaryButton(props: React.ComponentProps<"button">) {
  return (
    <button
      {...props}
      className={`rounded-xl border border-border bg-white px-4 py-2.5 hover:bg-accent-soft disabled:opacity-60 ${props.className ?? ""}`}
    />
  );
}

export function Notice({
  tone = "info",
  children,
}: {
  tone?: "info" | "error" | "success";
  children: ReactNode;
}) {
  const styles =
    tone === "error"
      ? "border-red-200 bg-red-50 text-red-900"
      : tone === "success"
        ? "border-green-200 bg-green-50 text-green-900"
        : "border-border bg-accent-soft text-foreground";

  return (
    <div className={`rounded-xl border px-3 py-2 text-sm ${styles}`}>{children}</div>
  );
}
