"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  LOCALE_COOKIE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_MANUAL_COOKIE,
  LOCATION_COOKIE,
  localeFromCoordinates,
  messages,
  t,
  type Locale,
} from "@/lib/locale";

type LocaleContextValue = {
  locale: Locale;
  locationLabel: string | null;
  detecting: boolean;
  setLocale: (locale: Locale, options?: { manual?: boolean }) => void;
  copy: ReturnType<typeof t>;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

function writeCookie(name: string, value: string) {
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${LOCALE_COOKIE_MAX_AGE}; samesite=lax`;
}

async function reverseGeocode(lat: number, lng: number) {
  const url = new URL("https://nominatim.openstreetmap.org/reverse");
  url.searchParams.set("format", "jsonv2");
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lng));
  url.searchParams.set("zoom", "10");
  url.searchParams.set("addressdetails", "1");

  const response = await fetch(url.toString(), {
    headers: {
      Accept: "application/json",
    },
  });
  if (!response.ok) return null;
  const data = (await response.json()) as {
    address?: {
      city?: string;
      town?: string;
      village?: string;
      county?: string;
      state?: string;
      state_district?: string;
      country_code?: string;
    };
    display_name?: string;
  };
  const address = data.address ?? {};
  const place =
    address.city ||
    address.town ||
    address.village ||
    address.county ||
    address.state_district ||
    null;
  const state = address.state || null;
  const label = [place, state].filter(Boolean).join(", ");
  return {
    label: label || data.display_name || null,
    state,
    countryCode: address.country_code?.toUpperCase() ?? null,
  };
}

async function ipFallbackLocation() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    if (!response.ok) return null;
    const data = (await response.json()) as {
      city?: string;
      region?: string;
      region_code?: string;
      country_code?: string;
      latitude?: number;
      longitude?: number;
      error?: boolean;
    };
    if (data.error) return null;
    return data;
  } catch {
    return null;
  }
}

export function LocaleProvider({
  initialLocale,
  initialLocationLabel,
  initialManual,
  children,
}: {
  initialLocale: Locale;
  initialLocationLabel: string | null;
  initialManual: boolean;
  children: ReactNode;
}) {
  const router = useRouter();
  const [locale, setLocaleState] = useState<Locale>(initialLocale);
  const [locationLabel, setLocationLabel] = useState<string | null>(
    initialLocationLabel,
  );
  const [manual, setManual] = useState(initialManual);
  const [detecting, setDetecting] = useState(true);

  const setLocale = useCallback(
    (next: Locale, options?: { manual?: boolean }) => {
      const isManual = options?.manual ?? true;
      setLocaleState(next);
      writeCookie(LOCALE_COOKIE, next);
      if (isManual) {
        setManual(true);
        writeCookie(LOCALE_MANUAL_COOKIE, "1");
      }
      document.documentElement.lang = next === "te" ? "te" : "en";
      router.refresh();
    },
    [router],
  );

  useEffect(() => {
    document.documentElement.lang = locale === "te" ? "te" : "en";
  }, [locale]);

  useEffect(() => {
    let cancelled = false;

    async function detect() {
      setDetecting(true);

      const applyLocation = (label: string | null, nextLocale: Locale | null) => {
        if (cancelled) return;
        if (label) {
          setLocationLabel(label);
          writeCookie(LOCATION_COOKIE, label);
        }
        if (!manual && nextLocale) {
          setLocaleState(nextLocale);
          writeCookie(LOCALE_COOKIE, nextLocale);
          document.documentElement.lang = nextLocale === "te" ? "te" : "en";
          router.refresh();
        }
      };

      const onCoords = async (lat: number, lng: number) => {
        const inferred = localeFromCoordinates(lat, lng);
        try {
          const geo = await reverseGeocode(lat, lng);
          if (geo?.state) {
            const state = geo.state.toLowerCase();
            const teluguState =
              state.includes("telangana") || state.includes("andhra");
            applyLocation(geo.label, teluguState ? "te" : inferred);
            return;
          }
          applyLocation(geo?.label ?? null, inferred);
        } catch {
          applyLocation(null, inferred);
        }
      };

      if (!navigator.geolocation) {
        const ip = await ipFallbackLocation();
        if (ip) {
          const label = [ip.city, ip.region].filter(Boolean).join(", ");
          let next: Locale | null = null;
          if (ip.latitude != null && ip.longitude != null) {
            next = localeFromCoordinates(ip.latitude, ip.longitude);
          } else if (ip.country_code === "IN") {
            const code = (ip.region_code ?? "").toUpperCase();
            next = ["TG", "TS", "AP", "AD"].includes(code) ? "te" : "en";
          } else if (ip.country_code) {
            next = "en";
          }
          applyLocation(label || null, next);
        }
        if (!cancelled) setDetecting(false);
        return;
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          await onCoords(position.coords.latitude, position.coords.longitude);
          if (!cancelled) setDetecting(false);
        },
        async () => {
          const ip = await ipFallbackLocation();
          if (ip) {
            const label = [ip.city, ip.region].filter(Boolean).join(", ");
            let next: Locale | null = null;
            if (ip.latitude != null && ip.longitude != null) {
              next = localeFromCoordinates(ip.latitude, ip.longitude);
            } else if (ip.country_code === "IN") {
              const code = (ip.region_code ?? "").toUpperCase();
              next = ["TG", "TS", "AP", "AD"].includes(code) ? "te" : "en";
            } else if (ip.country_code) {
              next = "en";
            }
            applyLocation(label || null, next);
          }
          if (!cancelled) setDetecting(false);
        },
        { enableHighAccuracy: false, timeout: 8000, maximumAge: 600_000 },
      );
    }

    void detect();
    return () => {
      cancelled = true;
    };
  }, [manual, router]);

  const value = useMemo<LocaleContextValue>(
    () => ({
      locale,
      locationLabel,
      detecting,
      setLocale,
      copy: messages[locale],
    }),
    [locale, locationLabel, detecting, setLocale],
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

export function useLocale() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }
  return context;
}
