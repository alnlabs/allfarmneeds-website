"use client";

import { useLocale } from "@/components/locale-provider";

export function LanguageSwitcher() {
  const { locale, setLocale, locationLabel, detecting, copy } = useLocale();

  const locationText = detecting
    ? copy.detectingLocation
    : locationLabel
      ? `${copy.nearYou}: ${locationLabel}`
      : copy.locationUnknown;

  return (
    <div className="flex max-w-full items-center gap-2 text-sm">
      <span
        className="hidden max-w-[10rem] truncate text-muted md:inline lg:max-w-[16rem]"
        title={locationLabel ?? locationText}
      >
        {locationText}
      </span>
      <div
        className="inline-flex shrink-0 rounded-lg border border-border bg-white p-0.5"
        role="group"
        aria-label={copy.language}
      >
        <button
          type="button"
          className={`min-h-9 rounded-md px-2.5 py-1.5 ${
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
          className={`min-h-9 rounded-md px-2.5 py-1.5 ${
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
