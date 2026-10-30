"use client";

import { useLocale } from "@/components/locale-provider";

export function LanguageSwitcher() {
  const { locale, setLocale, locationLabel, detecting, copy } = useLocale();

  return (
    <div className="flex flex-wrap items-center gap-2 text-sm">
      <span className="hidden text-muted sm:inline" title={locationLabel ?? undefined}>
        {detecting
          ? copy.detectingLocation
          : locationLabel
            ? `${copy.nearYou}: ${locationLabel}`
            : copy.locationUnknown}
      </span>
      <div
        className="inline-flex rounded-lg border border-border bg-white p-0.5"
        role="group"
        aria-label={copy.language}
      >
        <button
          type="button"
          className={`rounded-md px-2.5 py-1 ${
            locale === "en"
              ? "bg-accent text-white"
              : "text-foreground hover:bg-accent-soft"
          }`}
          onClick={() => setLocale("en")}
          aria-pressed={locale === "en"}
        >
          {copy.english}
        </button>
        <button
          type="button"
          className={`rounded-md px-2.5 py-1 ${
            locale === "te"
              ? "bg-accent text-white"
              : "text-foreground hover:bg-accent-soft"
          }`}
          onClick={() => setLocale("te")}
          aria-pressed={locale === "te"}
        >
          {copy.telugu}
        </button>
      </div>
    </div>
  );
}
