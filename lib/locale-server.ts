import { cookies, headers } from "next/headers";
import {
  LOCALE_COOKIE,
  LOCALE_MANUAL_COOKIE,
  LOCATION_COOKIE,
  localeFromAcceptLanguage,
  localeFromGeoHeaders,
  parseLocale,
  type Locale,
} from "@/lib/locale";

export async function getRequestLocale(): Promise<{
  locale: Locale;
  locationLabel: string | null;
  manual: boolean;
}> {
  const cookieStore = await cookies();
  const manual = cookieStore.get(LOCALE_MANUAL_COOKIE)?.value === "1";
  const stored = parseLocale(cookieStore.get(LOCALE_COOKIE)?.value);
  const locationLabel = cookieStore.get(LOCATION_COOKIE)?.value
    ? decodeURIComponent(cookieStore.get(LOCATION_COOKIE)!.value)
    : null;

  if (stored) {
    return { locale: stored, locationLabel, manual };
  }

  const requestHeaders = await headers();
  const country = requestHeaders.get("x-vercel-ip-country");
  const region = requestHeaders.get("x-vercel-ip-country-region");
  const city = requestHeaders.get("x-vercel-ip-city");

  const fromGeo = localeFromGeoHeaders({ country, region, city });
  const fromLanguage = localeFromAcceptLanguage(
    requestHeaders.get("accept-language"),
  );

  const locale = fromGeo ?? fromLanguage ?? "en";
  const inferredLocation = [city, region, country === "IN" ? "India" : country]
    .filter(Boolean)
    .join(", ");

  return {
    locale,
    locationLabel: locationLabel ?? (inferredLocation || null),
    manual: false,
  };
}
