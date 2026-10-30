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
    notifications: "Notifications",
    myListings: "My listings",
    providerBookings: "Provider bookings",
    providerProfile: "Provider profile",
    moderation: "Moderation",
    roles: "Roles",
    signOut: "Sign out",
    signIn: "Sign in",
    signInRegister: "Sign in / Register",
    homeSubtitle:
      "Telangana first. One platform for farm services, jobs, crops and buyers — with Andhra Pradesh also supported.",
    browseServices: "Browse Farm Services",
    agriMitra: "Agri Mitra",
    agriMitraBody:
      "Text assistant with optional browser voice. Confirm before anything is published.",
    serviceCategories: "Service categories",
    comingNext: "Coming next.",
    navHome: "Home",
    navExplore: "Explore",
    navCreate: "Create",
    navMessages: "Messages",
    navProfile: "Profile",
    navMarketplace: "Marketplace",
    navAccount: "Account",
    myJobs: "My jobs",
    myCrops: "My crops",
    cropDeals: "Crop deals",
    myRequirements: "My requirements",
    buyerProfile: "Buyer profile",
    applications: "Applications",
    workerProfile: "Worker profile",
    filters: "Filters",
    selectMandalFirst: "Select a mandal to choose village / town",
    exploreTitle: "Explore marketplace",
    exploreSubtitle: "All four modules in one place — Telangana first.",
    createTitle: "Create",
    createSubtitle: "Post work, services, produce or purchase needs for your roles.",
    profileTitle: "Your profile",
    profileSubtitle: "Manage roles and jump to your dashboards.",
    modules: {
      farmServices: {
        title: "Farm Services",
        te: "వ్యవసాయ సేవలు",
        body: "Tractors, labour, irrigation and more near your village.",
      },
      farmJobs: {
        title: "Farm Jobs",
        te: "వ్యవసాయ ఉద్యోగాలు",
        body: "Hire workers or apply for paid farm work near your village.",
      },
      cropMarketplace: {
        title: "Crop Marketplace",
        te: "పంట మార్కెట్",
        body: "Sell produce or reserve approved crop stock near your village.",
      },
      buyersTraders: {
        title: "Buyers & Traders",
        te: "కొనుగోలుదారులు & వ్యాపారులు",
        body: "Post purchase needs or offer supply to approved buyers.",
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
    notifications: "నోటిఫికేషన్లు",
    myListings: "నా జాబితాలు",
    providerBookings: "ప్రొవైడర్ బుకింగ్‌లు",
    providerProfile: "ప్రొవైడర్ ప్రొఫైల్",
    moderation: "మోడరేషన్",
    roles: "పాత్రలు",
    signOut: "సైన్ అవుట్",
    signIn: "సైన్ ఇన్",
    signInRegister: "సైన్ ఇన్ / నమోదు",
    homeSubtitle:
      "తెలంగాణ మొదట. సేవలు, ఉద్యోగాలు, పంటలు, కొనుగోలుదారులు — ఆంధ్రప్రదేశ్ కూడా మద్దతు.",
    browseServices: "వ్యవసాయ సేవలు చూడండి",
    agriMitra: "అగ్రి మిత్ర",
    agriMitraBody:
      "టెక్స్ట్ సహాయకుడు; బ్రౌజర్ వాయిస్ ఐచ్ఛికం. ప్రచురణకు ముందు నిర్ధారణ తప్పనిసరి.",
    serviceCategories: "సేవా వర్గాలు",
    comingNext: "త్వరలో.",
    navHome: "హోమ్",
    navExplore: "అన్వేషించండి",
    navCreate: "సృష్టించండి",
    navMessages: "సందేశాలు",
    navProfile: "ప్రొఫైల్",
    navMarketplace: "మార్కెట్",
    navAccount: "ఖాతా",
    myJobs: "నా ఉద్యోగాలు",
    myCrops: "నా పంటలు",
    cropDeals: "పంట డీల్స్",
    myRequirements: "నా అవసరాలు",
    buyerProfile: "కొనుగోలుదారు ప్రొఫైల్",
    applications: "దరఖాస్తులు",
    workerProfile: "కూలీ ప్రొఫైల్",
    filters: "ఫిల్టర్లు",
    selectMandalFirst: "గ్రామం ఎంచుకోవడానికి ముందు మండలం ఎంచుకోండి",
    exploreTitle: "మార్కెట్ అన్వేషించండి",
    exploreSubtitle: "నాలుగు మాడ్యూల్స్ ఒకే చోట — తెలంగాణ మొదట.",
    createTitle: "సృష్టించండి",
    createSubtitle: "మీ పాత్రలకు సేవలు, ఉద్యోగాలు, పంటలు లేదా అవసరాలు పోస్ట్ చేయండి.",
    profileTitle: "మీ ప్రొఫైల్",
    profileSubtitle: "పాత్రలు నిర్వహించండి మరియు డాష్‌బోర్డ్‌లకు వెళ్లండి.",
    modules: {
      farmServices: {
        title: "వ్యవసాయ సేవలు",
        te: "Farm Services",
        body: "మీ ఊరు దగ్గర ట్రాక్టర్, కూలీ, నీటిపారుదల సేవలు.",
      },
      farmJobs: {
        title: "వ్యవసాయ ఉద్యోగాలు",
        te: "Farm Jobs",
        body: "కూలీలను నియమించండి లేదా పొలం పనులకు దరఖాస్తు చేయండి.",
      },
      cropMarketplace: {
        title: "పంట మార్కెట్",
        te: "Crop Marketplace",
        body: "పంటలు అమ్మండి లేదా ఆమోదించిన స్టాక్ రిజర్వ్ చేయండి.",
      },
      buyersTraders: {
        title: "కొనుగోలుదారులు & వ్యాపారులు",
        te: "Buyers & Traders",
        body: "కొనుగోలు అవసరాలు పోస్ట్ చేయండి లేదా సరఫరా ఆఫర్ పంపండి.",
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
