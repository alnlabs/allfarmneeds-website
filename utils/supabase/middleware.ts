import { createServerClient } from "@supabase/ssr";
import { type NextRequest, NextResponse } from "next/server";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCATION_COOKIE,
  localeFromAcceptLanguage,
  localeFromGeoHeaders,
  parseLocale,
} from "@/lib/locale";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

export const updateSession = async (request: NextRequest) => {
  let supabaseResponse = NextResponse.next({
    request: {
      headers: request.headers,
    },
  });

  const supabase = createServerClient(
    supabaseUrl!,
    supabaseKey!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet, headers) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
          Object.entries(headers).forEach(([key, value]) => {
            supabaseResponse.headers.set(key, value)
          })
        },
      },
    },
  );

  // Must run immediately after the client is created so expired sessions
  // are refreshed and the new cookies are written onto the response.
  await supabase.auth.getClaims()

  if (!parseLocale(request.cookies.get(LOCALE_COOKIE)?.value)) {
    const country = request.headers.get("x-vercel-ip-country");
    const region = request.headers.get("x-vercel-ip-country-region");
    const city = request.headers.get("x-vercel-ip-city");
    const locale =
      localeFromGeoHeaders({ country, region, city }) ??
      localeFromAcceptLanguage(request.headers.get("accept-language")) ??
      "en";

    supabaseResponse.cookies.set(LOCALE_COOKIE, locale, {
      path: "/",
      maxAge: LOCALE_COOKIE_MAX_AGE,
      sameSite: "lax",
    });

    const locationLabel = [city, region].filter(Boolean).join(", ");
    if (locationLabel && !request.cookies.get(LOCATION_COOKIE)?.value) {
      supabaseResponse.cookies.set(LOCATION_COOKIE, locationLabel, {
        path: "/",
        maxAge: LOCALE_COOKIE_MAX_AGE,
        sameSite: "lax",
      });
    }
  }

  return supabaseResponse
};
