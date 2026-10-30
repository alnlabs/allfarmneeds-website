export type Locale = "en" | "te";

export const LOCALE_COOKIE = "afn_locale";
export const LOCALE_MANUAL_COOKIE = "afn_locale_manual";
export const LOCATION_COOKIE = "afn_location";

export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

/** Approximate bounding box covering Telangana and Andhra Pradesh. */
export function isTeluguRegionCoordinates(lat: number, lng: number) {
  return lat >= 12.5 && lat <= 20.1 && lng >= 76.5 && lng <= 85.2;
}

export function localeFromCoordinates(lat: number, lng: number): Locale {
  return isTeluguRegionCoordinates(lat, lng) ? "te" : "en";
}

export function localeFromGeoHeaders(input: {
  country?: string | null;
  region?: string | null;
  city?: string | null;
}): Locale | null {
  const country = (input.country ?? "").toUpperCase();
  const region = (input.region ?? "").toUpperCase();
  const city = (input.city ?? "").toLowerCase();

  if (country && country !== "IN") {
    return "en";
  }

  // Vercel / ISO-ish region codes for Telugu states.
  if (["TG", "TS", "AP", "AD"].includes(region)) {
    return "te";
  }

  const regionName = `${region} ${city}`.toLowerCase();
  if (
    regionName.includes("telangana") ||
    regionName.includes("andhra") ||
    regionName.includes("hyderabad") ||
    regionName.includes("vijayawada") ||
    regionName.includes("visakhapatnam") ||
    regionName.includes("warangal") ||
    regionName.includes("guntur") ||
    regionName.includes("tirupati")
  ) {
    return "te";
  }

  if (country === "IN") {
    return null;
  }

  return null;
}

export function localeFromAcceptLanguage(header?: string | null): Locale | null {
  if (!header) return null;
  const preferred = header.toLowerCase().split(",")[0]?.trim() ?? "";
  if (preferred.startsWith("te")) return "te";
  if (preferred.startsWith("en")) return "en";
  return null;
}

export function parseLocale(value?: string | null): Locale | null {
  if (value === "en" || value === "te") return value;
  return null;
}

export type Messages = typeof messages.en;

export const messages = {
  en: {
    tagline: "Everything farmers need. One platform.",
    farmServices: "Farm Services",
    bookings: "Bookings",
    messages: "Messages",
    myListings: "My listings",
    providerBookings: "Provider bookings",
    providerProfile: "Provider profile",
    moderation: "Moderation",
    roles: "Roles",
    signOut: "Sign out",
    signIn: "Sign in",
    signInRegister: "Sign in / Register",
    homeSubtitle:
      "Everything farmers need. One platform. Find agricultural services across Telangana and Andhra Pradesh.",
    browseServices: "Browse Farm Services",
    serviceCategories: "Service categories",
    comingNext: "Coming next.",
    modules: {
      farmServices: {
        title: "Farm Services",
        te: "వ్యవసాయ సేవలు",
        body: "Tractors, labour, irrigation and more near your village.",
      },
      farmJobs: {
        title: "Farm Jobs",
        te: "వ్యవసాయ ఉద్యోగాలు",
        body: "Hire and find farm workers. Coming next.",
      },
      cropMarketplace: {
        title: "Crop Marketplace",
        te: "పంట మార్కెట్",
        body: "Buy and sell crops. Coming next.",
      },
      buyersTraders: {
        title: "Buyers & Traders",
        te: "కొనుగోలుదారులు & వ్యాపారులు",
        body: "Connect with traders and buyers. Coming next.",
      },
    },
    servicesTitle: "Agricultural services",
    servicesSubtitle:
      "Search approved services by category and location. Contact providers by call, WhatsApp, booking request or enquiry.",
    search: "Search",
    searchPlaceholder: "Tractor, drip, labour…",
    category: "Category",
    allCategories: "All categories",
    district: "District",
    allDistricts: "All districts",
    mandal: "Mandal",
    allMandals: "All mandals",
    village: "Village / town",
    allVillages: "All villages",
    verifiedOnly: "Verified providers only",
    applyFilters: "Apply filters",
    noServices:
      "No published services match these filters yet. Providers can add listings after signing in.",
    language: "Language",
    english: "English",
    telugu: "తెలుగు",
    detectingLocation: "Detecting nearest location…",
    nearYou: "Near you",
    locationUnknown: "Location not set",
  },
  te: {
    tagline: "రైతులకు కావాల్సినవన్నీ. ఒకే వేదిక.",
    farmServices: "వ్యవసాయ సేవలు",
    bookings: "బుకింగ్‌లు",
    messages: "సందేశాలు",
    myListings: "నా జాబితాలు",
    providerBookings: "ప్రొవైడర్ బుకింగ్‌లు",
    providerProfile: "ప్రొవైడర్ ప్రొఫైల్",
    moderation: "మోడరేషన్",
    roles: "పాత్రలు",
    signOut: "సైన్ అవుట్",
    signIn: "సైన్ ఇన్",
    signInRegister: "సైన్ ఇన్ / నమోదు",
    homeSubtitle:
      "రైతులకు కావాల్సినవన్నీ. ఒకే వేదిక. తెలంగాణ మరియు ఆంధ్రప్రదేశ్‌లో వ్యవసాయ సేవలు కనుగొనండి.",
    browseServices: "వ్యవసాయ సేవలు చూడండి",
    serviceCategories: "సేవా వర్గాలు",
    comingNext: "త్వరలో.",
    modules: {
      farmServices: {
        title: "వ్యవసాయ సేవలు",
        te: "Farm Services",
        body: "మీ ఊరు దగ్గర ట్రాక్టర్, కూలీ, నీటిపారుదల సేవలు.",
      },
      farmJobs: {
        title: "వ్యవసాయ ఉద్యోగాలు",
        te: "Farm Jobs",
        body: "పొలం పని కూలీలను కనుగొనండి. త్వరలో.",
      },
      cropMarketplace: {
        title: "పంట మార్కెట్",
        te: "Crop Marketplace",
        body: "పంటలు కొనండి, అమ్మండి. త్వరలో.",
      },
      buyersTraders: {
        title: "కొనుగోలుదారులు & వ్యాపారులు",
        te: "Buyers & Traders",
        body: "వ్యాపారులు మరియు కొనుగోలుదారులతో కనెక్ట్ అవ్వండి. త్వరలో.",
      },
    },
    servicesTitle: "వ్యవసాయ సేవలు",
    servicesSubtitle:
      "వర్గం మరియు ప్రాంతం ఆధారంగా ఆమోదించిన సేవలు వెతకండి. కాల్, WhatsApp, బుకింగ్ లేదా సందేశం ద్వారా సంప్రదించండి.",
    search: "వెతకండి",
    searchPlaceholder: "ట్రాక్టర్, డ్రిప్, కూలీ…",
    category: "వర్గం",
    allCategories: "అన్ని వర్గాలు",
    district: "జిల్లా",
    allDistricts: "అన్ని జిల్లాలు",
    mandal: "మండలం",
    allMandals: "అన్ని మండలాలు",
    village: "గ్రామం / పట్టణం",
    allVillages: "అన్ని గ్రామాలు",
    verifiedOnly: "ధృవీకరించిన ప్రొవైడర్లు మాత్రమే",
    applyFilters: "ఫిల్టర్లు వర్తింపజేయి",
    noServices:
      "ఈ ఫిల్టర్లకు సరిపోయే సేవలు ఇంకా లేవు. ప్రొవైడర్లు సైన్ ఇన్ చేసి జాబితాలు జోడించవచ్చు.",
    language: "భాష",
    english: "English",
    telugu: "తెలుగు",
    detectingLocation: "సమీప ప్రాంతం కనుగొంటున్నాం…",
    nearYou: "మీ దగ్గర",
    locationUnknown: "ప్రాంతం సెట్ కాలేదు",
  },
} as const;

export function t(locale: Locale) {
  return messages[locale];
}

export function categoryLabel(
  locale: Locale,
  category: { name_en: string; name_te: string },
) {
  return locale === "te"
    ? { primary: category.name_te, secondary: category.name_en }
    : { primary: category.name_en, secondary: category.name_te };
}
