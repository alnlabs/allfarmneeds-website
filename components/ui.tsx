import Link from "next/link";
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
    <main className="mx-auto w-full max-w-7xl min-w-0 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="mb-6 flex flex-col gap-4 sm:mb-8 md:flex-row md:flex-wrap md:items-end md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-semibold tracking-tight text-accent-strong break-words sm:text-3xl">
            {title}
          </h1>
          {subtitle ? (
            <p className="mt-2 max-w-2xl break-words text-sm text-muted sm:text-base">
              {subtitle}
            </p>
          ) : null}
        </div>
        {actions ? (
          <div className="flex w-full min-w-0 shrink-0 flex-col gap-2 md:w-auto md:flex-row md:flex-wrap md:justify-end">
            {actions}
          </div>
        ) : null}
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

export function StatusBadge({
  children,
  tone = "neutral",
}: {
  children: ReactNode;
  tone?: "neutral" | "success" | "warning" | "danger";
}) {
  const styles =
    tone === "success"
      ? "border-green-200 bg-green-50 text-green-900"
      : tone === "warning"
        ? "border-amber-200 bg-amber-50 text-amber-950"
        : tone === "danger"
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-border bg-accent-soft text-foreground";
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium ${styles}`}
    >
      {children}
    </span>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <Panel>
      <p className="font-medium">{title}</p>
      {body ? <p className="mt-2 text-sm text-muted">{body}</p> : null}
      {action ? <div className="mt-4">{action}</div> : null}
    </Panel>
  );
}

export function ListingCard({
  href,
  eyebrow,
  title,
  description,
  meta,
  imageUrl,
}: {
  href: string;
  eyebrow?: ReactNode;
  title: string;
  description?: string;
  meta?: ReactNode;
  imageUrl?: string | null;
}) {
  return (
    <Link
      href={href}
      className="flex gap-3 rounded-2xl border border-border bg-white p-4 transition hover:border-accent sm:gap-4 sm:p-5"
    >
      {imageUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt=""
          className="h-16 w-16 shrink-0 rounded-xl object-cover sm:h-24 sm:w-24"
        />
      ) : null}
      <div className="min-w-0 flex-1">
        {eyebrow ? <div className="text-sm text-muted">{eyebrow}</div> : null}
        <h2 className="mt-0.5 text-lg font-semibold sm:text-xl">{title}</h2>
        {description ? (
          <p className="mt-2 line-clamp-2 text-sm text-muted">{description}</p>
        ) : null}
        {meta ? (
          <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 text-sm text-muted">
            {meta}
          </div>
        ) : null}
      </div>
    </Link>
  );
}
