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
      "Telangana first. One platform for farm services, jobs, crops and purchase needs — Andhra Pradesh also supported.",
    homeHeadline: "Everything your farm needs, in one place.",
    homeSearchLabel: "What do you need?",
    homeSearchPlaceholder: "Search tractors, chilli, harvest…",
    homePrimaryGuest: "Get started",
    homePrimaryFarmer: "Find a farm service",
    homePrimaryWorker: "Find farm jobs",
    homePrimaryProvider: "Manage my listings",
    homePrimaryBuyer: "Post a purchase need",
    homePrimaryDefault: "Go to My work",
    homeSecondaryExplore: "Explore marketplace",
    homeMarketplaceTitle: "Categories",
    homeMoreDetails: "More details",
    homeAgriMitraTitle: "Agri Mitra Voice Assistant",
    homeAgriMitraEyebrow: "Ask in Telugu or English about rates, rentals, or farm work",
    homeAgriMitraCta: "Ask Mitra",
    homeCategoriesTitle: "Popular service categories",
    homeSeeAllCategories: "See all",
    homeListingsTitle: "Verified listings",
    homeListingsEmpty: "New listings appear here after staff review.",
    homeSeeAllServices: "See all services",
    homeSeeAllCrops: "See all crops",
    homeContact: "Contact",
    homeTrending: "Trending",
    homeTrendTractor: "Tractors",
    homeTrendChilli: "Teja Chilli",
    homeTrendHarvester: "Harvester",
    homeModuleServicesShort: "Tractors, drones & harvest help",
    homeModuleJobsShort: "Daily picking crews & farm work",
    homeModuleCropsShort: "Chilli, paddy & cotton sales",
    homeModuleBuyersShort: "Direct mandi & mill buyers",
    homeBadgeLive: "Live",
    homeBadgeUrgent: "Urgent",
    homeBadgeBestPrice: "Best Price",
    homeBadgeBulk: "Bulk Deals",
    homeHowTitle: "How it works",
    homeHowStep1: "Search or post what you need",
    homeHowStep2: "Talk directly with the other party",
    homeHowStep3: "Confirm the deal and complete the work",
    homePostAdTitle: "Have equipment or crops to sell?",
    homePostAd: "Post free ad",
    homeTrustTitle: "Verified for trust",
    homeTrustBody:
      "Listings are reviewed by our team. Free help when you need it.",
    homeHelplineLabel: "Farmer helpline",
    homeHelplineNumber: "1800-120-FARM",
    homeCallNow: "Call now",
    homeMandiLive: "Mandi live",
    navServices: "Services",
    navSell: "Sell crops",
    navAgriMitraShort: "Agri Mitra",
    browseServices: "Browse Farm Services",
    agriMitra: "Agri Mitra",
    agriMitraBody:
      "Ask in Telugu or English. Optional browser voice. Nothing is published until you confirm.",
    serviceCategories: "Service categories",
    comingNext: "Coming next.",
    navHome: "Home",
    navExplore: "Explore",
    navCreate: "Create",
    navMessages: "Messages",
    navProfile: "My work",
    navMarketplace: "Marketplace",
    navAccount: "My work",
    navMore: "More",
    menu: "Menu",
    menuMain: "Main",
    menuOverview: "Overview",
    menuActivity: "Activity",
    menuYourWork: "Your work",
    menuSettings: "Account settings",
    close: "Close",
    openMenu: "Open menu",
    closeMenu: "Close menu",
    showFilters: "Show",
    hideFilters: "Hide",
    loading: "Loading…",
    admin: "Admin",
    myJobs: "My jobs",
    myCrops: "My crops",
    cropDeals: "Crop deals",
    myRequirements: "My requirements",
    buyerProfile: "Buyer profile",
    applications: "Applications",
    workerProfile: "Farm worker profile",
    findJobs: "Find farm jobs",
    findJobsBody: "Browse open farm jobs near your village and apply.",
    filters: "Filters",
    selectMandalFirst: "Select a mandal to choose village / town",
    exploreTitle: "Explore marketplace",
    exploreSubtitle:
      "Choose a marketplace: services, jobs, crops or purchase needs.",
    exploreSearchHint: "Search farm services",
    createTitle: "Create",
    createSubtitle: "Actions available for your roles. Add more roles anytime.",
    profileTitle: "My work",
    profileSubtitle:
      "Your activity and role dashboards in one place.",
    noRolesYet: "No roles yet — choose roles to unlock dashboards.",
    roleFarmer: "Farmer",
    roleWorker: "Farm worker",
    roleProvider: "Service provider",
    roleBuyer: "Buyer",
    roleRetailer: "Retailer",
    roleLabourContractor: "Labour contractor",
    roleAdmin: "Administrator",
    roleModerator: "Moderator",
    statusOpen: "Open",
    statusClosed: "Closed",
    statusPending: "Pending review",
    statusApproved: "Approved",
    statusRejected: "Rejected",
    statusPublished: "Published",
    statusDraft: "Draft",
    modules: {
      farmServices: {
        title: "Farm Services",
        te: "వ్యవసాయ సేవలు",
        body: "Tractors, farm workers, irrigation and more near your village.",
      },
      farmJobs: {
        title: "Farm Jobs",
        te: "పొలం పనులు",
        body: "Hire farm workers or apply for paid farm work near your village.",
      },
      cropMarketplace: {
        title: "Sell Crops",
        te: "పంట అమ్మకం",
        body: "Sell produce or reserve approved crop stock near your village.",
      },
      buyersTraders: {
        title: "Purchase needs",
        te: "కొనుగోలు అవసరాలు",
        body: "Post what you need to buy, or offer supply to approved needs.",
      },
    },
    servicesTitle: "Agricultural services",
    servicesSubtitle:
      "Search approved services by category and location. Contact providers by call, WhatsApp, booking request or enquiry.",
    search: "Search",
    searchPlaceholder: "Tractor, drip, farm workers…",
    category: "Category",
    allCategories: "All categories",
    district: "District",
    allDistricts: "All districts",
    mandal: "Mandal",
    allMandals: "All mandals",
    towns: "Towns",
    village: "Village / town",
    allVillages: "All villages",
    verifiedOnly: "Verified service providers only",
    applyFilters: "Apply filters",
    noServices:
      "No published services match these filters yet. Providers can add listings after signing in.",
    language: "Language",
    english: "English",
    telugu: "తెలుగు",
    detectingLocation: "Detecting nearest location…",
    nearYou: "Near you",
    locationUnknown: "Location not set",
    priceOnEnquiry: "Price on enquiry",
    areaNotSet: "Area not set",
    provider: "Service provider",
    verified: "Verified",
    notVerified: "Not verified yet",
    workers: "workers",
    farmer: "Farmer",
    seller: "Seller",
    buyer: "Buyer",
    expectedPrice: "Expected price",
    availableQty: "Available",
    paymentDaily: "Per day",
    paymentHourly: "Per hour",
    paymentLumpsum: "Lump sum",
    paymentPiece: "Per unit / piece",
    browseMarketplace: "Browse marketplace",
    contactProvider: "Contact provider",
    callProvider: "Call",
    whatsappProvider: "WhatsApp",
    requestBooking: "Request booking",
    requestBookingHint:
      "Send your preferred date. The provider will update the status.",
    enquire: "Send a message",
    enquireHint: "Ask a question without booking yet.",
    signInToBook: "Sign in to book",
    signInToEnquire: "Sign in to enquire",
    yourListing: "This is your listing.",
    moreContactOptions: "Booking and messages",
    holdQuantity: "Reserve quantity",
    holdQuantityHint:
      "We reserve this stock for you so another buyer cannot take the same amount. You can cancel later to release it.",
    holdingQuantity: "Reserving…",
    signInToHold: "Sign in to reserve quantity",
    manageMyListings: "Manage my listings",
    addRoleToHold: "Add buyer or farmer role to reserve stock",
    messageToSeller: "Message to seller",
    cropsBrowseSubtitle:
      "Browse approved crop listings. Reserve quantity to start a deal with the seller.",
    jobsBrowseSubtitle:
      "Browse approved farm jobs and apply as a farm worker.",
    buyersBrowseSubtitle:
      "Browse approved purchase needs and offer supply if you are a farmer.",
    offerSupply: "Offer supply",
    loginTitle: "Sign in",
    loginSubtitle:
      "Continue with Google, or use email for a one-time login code.",
    continueGoogle: "Continue with Google",
    orUseEmail: "or use email",
    emailLabel: "Email",
    emailHint: "We email a one-time login code.",
    sendLoginCode: "Send login code",
    sendingCode: "Sending…",
    oneTimeCode: "One-time code",
    oneTimeCodeHint: "Enter the 6-digit code from your email.",
    verifyContinue: "Verify and continue",
    verifying: "Verifying…",
    loginCodeSent: "Check your email for a login code or magic link.",
    rolesTitle: "Choose your roles",
    rolesSubtitle:
      "One account can be farmer, farm worker, service provider and buyer at the same time.",
    yourName: "Your name",
    yourNamePlaceholder: "Your name or farm / business name",
    howUse: "How will you use AllFarmNeeds?",
    roleFarmerDesc:
      "Find services, post farm jobs, and sell produce.",
    roleWorkerDesc: "Browse farm jobs and apply for paid work near you.",
    roleProviderDesc:
      "Publish tractor, farm-worker, irrigation and other farm services.",
    roleBuyerDesc:
      "Post purchase needs, reserve crop stock, and manage deals.",
    farmerLocation: "Farmer location",
    aboutFarm: "About your farm (optional)",
    selectLocation: "Select location",
    continue: "Continue",
    saving: "Saving…",
    welcomeTitle: "You’re ready — next steps",
    welcomeBody:
      "Use My work for role dashboards. Notifications alert you about bookings and deals. Messages are for listing enquiries.",
    inboxExplainer:
      "Notifications: bookings, applications and deals. Messages: listing enquiries and replies.",
    markAllRead: "Mark all read",
    openNotification: "Open",
    noNotifications: "No notifications yet.",
    notificationNew: "new",
  },
  te: {
    tagline: "రైతులకు కావాల్సినవన్నీ. ఒకే వేదిక.",
    farmServices: "వ్యవసాయ సేవలు",
    bookings: "బుకింగ్‌లు",
    messages: "సందేశాలు",
    notifications: "నోటిఫికేషన్లు",
    myListings: "నా జాబితాలు",
    providerBookings: "సేవా బుకింగ్‌లు",
    providerProfile: "సేవాదారు ప్రొఫైల్",
    moderation: "సమీక్ష",
    roles: "పాత్రలు",
    signOut: "సైన్ అవుట్",
    signIn: "సైన్ ఇన్",
    signInRegister: "సైన్ ఇన్ / నమోదు",
    homeSubtitle:
      "తెలంగాణ మొదట. సేవలు, పొలం పనులు, పంటలు, కొనుగోలు అవసరాలు — ఆంధ్రప్రదేశ్ కూడా మద్దతు.",
    homeHeadline: "మీ పొలానికి కావాల్సినవన్నీ, ఒకే చోట.",
    homeSearchLabel: "మీకు ఏమి కావాలి?",
    homeSearchPlaceholder: "ట్రాక్టర్, మిరప, కోత వెతకండి…",
    homePrimaryGuest: "ప్రారంభించండి",
    homePrimaryFarmer: "వ్యవసాయ సేవ కనుగొనండి",
    homePrimaryWorker: "పొలం పనులు చూడండి",
    homePrimaryProvider: "నా జాబితాలు నిర్వహించండి",
    homePrimaryBuyer: "కొనుగోలు అవసరం పోస్ట్ చేయండి",
    homePrimaryDefault: "నా పనులకు వెళ్లండి",
    homeSecondaryExplore: "వేదికను చూడండి",
    homeMarketplaceTitle: "వర్గాలు",
    homeMoreDetails: "మరిన్ని వివరాలు",
    homeAgriMitraTitle: "అగ్రి మిత్ర వాయిస్ సహాయం",
    homeAgriMitraEyebrow: "ధరలు, అద్దె, పొలం పనులు — తెలుగు లేదా ఇంగ్లీష్‌లో అడగండి",
    homeAgriMitraCta: "మిత్రను అడగండి",
    homeCategoriesTitle: "ప్రముఖ సేవా వర్గాలు",
    homeSeeAllCategories: "అన్నీ చూడండి",
    homeListingsTitle: "ధృవీకరించిన జాబితాలు",
    homeListingsEmpty: "సమీక్ష తర్వాత కొత్త జాబితాలు ఇక్కడ కనిపిస్తాయి.",
    homeSeeAllServices: "అన్ని సేవలు",
    homeSeeAllCrops: "అన్ని పంటలు",
    homeContact: "సంప్రదించండి",
    homeTrending: "ట్రెండింగ్",
    homeTrendTractor: "ట్రాక్టర్లు",
    homeTrendChilli: "తేజా మిరప",
    homeTrendHarvester: "హార్వెస్టర్",
    homeModuleServicesShort: "ట్రాక్టర్, డ్రోన్ మరియు కోత సహాయం",
    homeModuleJobsShort: "పొలం పని వారు మరియు దరఖాస్తులు",
    homeModuleCropsShort: "మిరప, వరి మరియు పత్తి అమ్మకం",
    homeModuleBuyersShort: "మండి మరియు మిల్లు కొనుగోలుదారులు",
    homeBadgeLive: "లైవ్",
    homeBadgeUrgent: "అత్యవసరం",
    homeBadgeBestPrice: "మంచి ధర",
    homeBadgeBulk: "పెద్ద ఒప్పందాలు",
    homeHowTitle: "ఇలా పని చేస్తుంది",
    homeHowStep1: "వెతకండి లేదా అవసరం పోస్ట్ చేయండి",
    homeHowStep2: "నేరుగా మరొక వ్యక్తితో మాట్లాడండి",
    homeHowStep3: "ఒప్పందం నిర్ధారించి పని పూర్తి చేయండి",
    homePostAdTitle: "యంత్రాలు లేదా పంటలు ఉన్నాయా?",
    homePostAd: "ఉచితంగా పోస్ట్ చేయండి",
    homeTrustTitle: "నమ్మకం కోసం ధృవీకరణ",
    homeTrustBody:
      "జాబితాలను మా బృందం సమీక్షిస్తుంది. అవసరమైతే ఉచిత సహాయం.",
    homeHelplineLabel: "రైతు హెల్ప్‌లైన్",
    homeHelplineNumber: "1800-120-FARM",
    homeCallNow: "ఇప్పుడు కాల్ చేయండి",
    homeMandiLive: "మండి లైవ్",
    navServices: "సేవలు",
    navSell: "పంట అమ్మకం",
    navAgriMitraShort: "అగ్రి మిత్ర",
    browseServices: "వ్యవసాయ సేవలు చూడండి",
    agriMitra: "అగ్రి మిత్ర",
    agriMitraBody:
      "తెలుగు లేదా ఇంగ్లీష్‌లో అడగండి. బ్రౌజర్ వాయిస్ ఐచ్ఛికం. మీరు నిర్ధారించే వరకు ప్రచురణ ఉండదు.",
    serviceCategories: "సేవా వర్గాలు",
    comingNext: "త్వరలో.",
    navHome: "హోమ్",
    navExplore: "అన్వేషించండి",
    navCreate: "సృష్టించండి",
    navMessages: "సందేశాలు",
    navProfile: "నా పనులు",
    navMarketplace: "వేదిక",
    navAccount: "నా పనులు",
    navMore: "మరిన్ని",
    menu: "మెనూ",
    menuMain: "ప్రధానం",
    menuOverview: "అవలోకనం",
    menuActivity: "కార్యకలాపాలు",
    menuYourWork: "మీ పనులు",
    menuSettings: "ఖాతా సెట్టింగ్‌లు",
    close: "మూసివేయి",
    openMenu: "మెనూ తెరవండి",
    closeMenu: "మెనూ మూసివేయి",
    showFilters: "చూపించు",
    hideFilters: "దాచు",
    loading: "లోడ్ అవుతోంది…",
    admin: "అడ్మిన్",
    myJobs: "నా పొలం పనులు",
    myCrops: "నా పంటలు",
    cropDeals: "పంట ఒప్పందాలు",
    myRequirements: "నా అవసరాలు",
    buyerProfile: "కొనుగోలుదారు ప్రొఫైల్",
    applications: "దరఖాస్తులు",
    workerProfile: "పని వారి ప్రొఫైల్",
    findJobs: "పొలం పనులు చూడండి",
    findJobsBody: "మీ ఊరు దగ్గర తెరిచి ఉన్న పొలం పనులు చూసి దరఖాస్తు చేయండి.",
    filters: "వడపోతలు",
    selectMandalFirst: "గ్రామం ఎంచుకోవడానికి ముందు మండలం ఎంచుకోండి",
    exploreTitle: "వేదికను చూడండి",
    exploreSubtitle:
      "సేవలు, పొలం పనులు, పంటలు లేదా కొనుగోలు అవసరాలు ఎంచుకోండి.",
    exploreSearchHint: "వ్యవసాయ సేవలు వెతకండి",
    createTitle: "సృష్టించండి",
    createSubtitle: "మీ పాత్రలకు అందుబాటులో ఉన్న చర్యలు. ఎప్పుడైనా పాత్రలు జోడించండి.",
    profileTitle: "నా పనులు",
    profileSubtitle:
      "మీ కార్యకలాపాలు మరియు పాత్ర డాష్‌బోర్డ్‌లు ఒకే చోట.",
    noRolesYet: "ఇంకా పాత్రలు లేవు — డాష్‌బోర్డ్‌ల కోసం పాత్రలు ఎంచుకోండి.",
    roleFarmer: "రైతు",
    roleWorker: "పని వారు",
    roleProvider: "సేవాదారు",
    roleBuyer: "కొనుగోలుదారు",
    roleRetailer: "రిటైలర్",
    roleLabourContractor: "పని కాంట్రాక్టర్",
    roleAdmin: "అడ్మినిస్ట్రేటర్",
    roleModerator: "మోడరేటర్",
    statusOpen: "తెరిచి ఉంది",
    statusClosed: "మూసివేయబడింది",
    statusPending: "సమీక్షలో",
    statusApproved: "ఆమోదించబడింది",
    statusRejected: "తిరస్కరించబడింది",
    statusPublished: "ప్రచురించబడింది",
    statusDraft: "డ్రాఫ్ట్",
    modules: {
      farmServices: {
        title: "వ్యవసాయ సేవలు",
        te: "Farm Services",
        body: "మీ ఊరు దగ్గర ట్రాక్టర్, పని వారు, నీటిపారుదల సేవలు.",
      },
      farmJobs: {
        title: "పొలం పనులు",
        te: "Farm Jobs",
        body: "పని వారిని నియమించండి లేదా పొలం పనులకు దరఖాస్తు చేయండి.",
      },
      cropMarketplace: {
        title: "పంట అమ్మకం",
        te: "Sell Crops",
        body: "పంటలు అమ్మండి లేదా ఆమోదించిన నిల్వను కాపాడండి.",
      },
      buyersTraders: {
        title: "కొనుగోలు అవసరాలు",
        te: "Purchase needs",
        body: "కొనుగోలు అవసరాలు పోస్ట్ చేయండి లేదా సరఫరా ఆఫర్ పంపండి.",
      },
    },
    servicesTitle: "వ్యవసాయ సేవలు",
    servicesSubtitle:
      "వర్గం మరియు ప్రాంతం ఆధారంగా ఆమోదించిన సేవలు వెతకండి. కాల్, WhatsApp, బుకింగ్ లేదా సందేశం ద్వారా సంప్రదించండి.",
    search: "వెతకండి",
    searchPlaceholder: "ట్రాక్టర్, డ్రిప్, పని వారు…",
    category: "వర్గం",
    allCategories: "అన్ని వర్గాలు",
    district: "జిల్లా",
    allDistricts: "అన్ని జిల్లాలు",
    mandal: "మండలం",
    allMandals: "అన్ని మండలాలు",
    towns: "పట్టణాలు",
    village: "గ్రామం / పట్టణం",
    allVillages: "అన్ని గ్రామాలు",
    verifiedOnly: "ధృవీకరించిన సేవాదారులు మాత్రమే",
    applyFilters: "శోధన వర్తించు",
    noServices:
      "ఈ శోధనకు సరిపోయే సేవలు ఇంకా లేవు. సేవాదారులు సైన్ ఇన్ చేసి జాబితాలు జోడించవచ్చు.",
    language: "భాష",
    english: "English",
    telugu: "తెలుగు",
    detectingLocation: "సమీప ప్రాంతం కనుగొంటున్నాం…",
    nearYou: "మీ దగ్గర",
    locationUnknown: "ప్రాంతం సెట్ కాలేదు",
    priceOnEnquiry: "విచారణపై ధర",
    areaNotSet: "ప్రాంతం సెట్ కాలేదు",
    provider: "సేవాదారు",
    verified: "ధృవీకరించబడింది",
    notVerified: "ఇంకా ధృవీకరణ కాలేదు",
    workers: "మంది",
    farmer: "రైతు",
    seller: "అమ్మకందారు",
    buyer: "కొనుగోలుదారు",
    expectedPrice: "ఆశించిన ధర",
    availableQty: "అందుబాటులో",
    paymentDaily: "రోజుకు",
    paymentHourly: "గంటకు",
    paymentLumpsum: "మొత్తం",
    paymentPiece: "యూనిట్ / ముక్కకు",
    browseMarketplace: "వేదిక చూడండి",
    contactProvider: "సేవాదారుని సంప్రదించండి",
    callProvider: "కాల్",
    whatsappProvider: "WhatsApp",
    requestBooking: "బుకింగ్ అభ్యర్థన",
    requestBookingHint:
      "మీకు కావాల్సిన తేదీ పంపండి. సేవాదారు స్థితి అప్‌డేట్ చేస్తారు.",
    enquire: "సందేశం పంపండి",
    enquireHint: "బుకింగ్ లేకుండా ప్రశ్న అడగండి.",
    signInToBook: "బుక్ చేయడానికి సైన్ ఇన్",
    signInToEnquire: "సందేశానికి సైన్ ఇన్",
    yourListing: "ఇది మీ జాబితా.",
    moreContactOptions: "బుకింగ్ మరియు సందేశాలు",
    holdQuantity: "పరిమాణం కాపాడండి",
    holdQuantityHint:
      "ఈ నిల్వ మీ కోసం కాపాడబడుతుంది — మరొక కొనుగోలుదారు అదే పరిమాణం తీసుకోలేరు. తర్వాత రద్దు చేసి విడుదల చేయవచ్చు.",
    holdingQuantity: "కాపాడుతున్నాం…",
    signInToHold: "కాపాడడానికి సైన్ ఇన్",
    manageMyListings: "నా జాబితాలు నిర్వహించండి",
    addRoleToHold: "నిల్వ కాపాడడానికి కొనుగోలుదారు లేదా రైతు పాత్ర జోడించండి",
    messageToSeller: "అమ్మకందారుకు సందేశం",
    cropsBrowseSubtitle:
      "ఆమోదించిన పంట జాబితాలు చూడండి. ఒప్పందం ప్రారంభించడానికి పరిమాణం కాపాడండి.",
    jobsBrowseSubtitle:
      "ఆమోదించిన పొలం పనులు చూసి పని వారిగా దరఖాస్తు చేయండి.",
    buyersBrowseSubtitle:
      "ఆమోదించిన కొనుగోలు అవసరాలు చూడండి. రైతు అయితే సరఫరా ఆఫర్ పంపండి.",
    offerSupply: "సరఫరా ఆఫర్",
    loginTitle: "సైన్ ఇన్",
    loginSubtitle:
      "Googleతో కొనసాగించండి, లేదా ఇమెయిల్ ద్వారా ఒకసారి వాడే కోడ్ పొందండి.",
    continueGoogle: "Googleతో కొనసాగించండి",
    orUseEmail: "లేదా ఇమెయిల్ వాడండి",
    emailLabel: "ఇమెయిల్",
    emailHint: "మేము ఒకసారి వాడే లాగిన్ కోడ్ పంపుతాము.",
    sendLoginCode: "లాగిన్ కోడ్ పంపండి",
    sendingCode: "పంపుతున్నాం…",
    oneTimeCode: "ఒకసారి వాడే కోడ్",
    oneTimeCodeHint: "ఇమెయిల్‌లోని 6 అంకెల కోడ్ నమోదు చేయండి.",
    verifyContinue: "నిర్ధారించి కొనసాగండి",
    verifying: "నిర్ధారిస్తున్నాం…",
    loginCodeSent: "లాగిన్ కోడ్ లేదా మ్యాజిక్ లింక్ కోసం ఇమెయిల్ చూడండి.",
    rolesTitle: "మీ పాత్రలు ఎంచుకోండి",
    rolesSubtitle:
      "ఒకే ఖాతాలో రైతు, పని వారు, సేవాదారు మరియు కొనుగోలుదారు పాత్రలు ఉండవచ్చు.",
    yourName: "మీ పేరు",
    yourNamePlaceholder: "మీ పేరు లేదా పొలం / వ్యాపారం పేరు",
    howUse: "AllFarmNeedsను మీరు ఎలా వాడతారు?",
    roleFarmerDesc:
      "సేవలు కనుగొనండి, పొలం పనులు పోస్ట్ చేయండి, పంటలు అమ్మండి.",
    roleWorkerDesc: "పొలం పనులు చూసి దగ్గర పనులకు దరఖాస్తు చేయండి.",
    roleProviderDesc:
      "ట్రాక్టర్, పని వారు, నీటిపారుదల వంటి సేవలు ప్రచురించండి.",
    roleBuyerDesc:
      "కొనుగోలు అవసరాలు పోస్ట్ చేయండి, పంట నిల్వ కాపాడండి, ఒప్పందాలు నిర్వహించండి.",
    farmerLocation: "రైతు ప్రాంతం",
    aboutFarm: "మీ పొలం గురించి (ఐచ్ఛికం)",
    selectLocation: "ప్రాంతం ఎంచుకోండి",
    continue: "కొనసాగించండి",
    saving: "భద్రపరుస్తున్నాం…",
    welcomeTitle: "సిద్ధం — తర్వాతి అడుగులు",
    welcomeBody:
      "పాత్ర డాష్‌బోర్డ్‌లకు నా పనులు వాడండి. నోటిఫికేషన్లు బుకింగ్/ఒప్పందం అలర్ట్‌లు. సందేశాలు జాబితా సంప్రదింపులు.",
    inboxExplainer:
      "నోటిఫికేషన్లు: బుకింగ్‌లు, దరఖాస్తులు, ఒప్పందాలు. సందేశాలు: జాబితా విచారణలు మరియు ప్రత్యుత్తరాలు.",
    markAllRead: "అన్నీ చదివినవిగా",
    openNotification: "తెరవండి",
    noNotifications: "నోటిఫికేషన్లు లేవు.",
    notificationNew: "కొత్త",
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

const ROLE_LABEL_KEYS = {
  farmer: "roleFarmer",
  worker: "roleWorker",
  service_provider: "roleProvider",
  buyer: "roleBuyer",
  retailer: "roleRetailer",
  labour_contractor: "roleLabourContractor",
  administrator: "roleAdmin",
  moderator: "roleModerator",
} as const;

export function roleLabel(locale: Locale, role: string) {
  const copy = t(locale);
  const key = ROLE_LABEL_KEYS[role as keyof typeof ROLE_LABEL_KEYS];
  return key ? copy[key] : role;
}

export function statusLabel(locale: Locale, status: string) {
  const copy = t(locale);
  const normalized = status.toLowerCase();
  if (normalized === "open") return copy.statusOpen;
  if (normalized === "closed" || normalized === "cancelled") {
    return copy.statusClosed;
  }
  if (
    normalized === "pending" ||
    normalized === "pending_review" ||
    normalized === "in_review"
  ) {
    return copy.statusPending;
  }
  if (normalized === "approved") return copy.statusApproved;
  if (normalized === "rejected") return copy.statusRejected;
  if (normalized === "published" || normalized === "active") {
    return copy.statusPublished;
  }
  if (normalized === "draft") return copy.statusDraft;
  return status.replaceAll("_", " ");
}

export function paymentModelLabel(locale: Locale, model?: string | null) {
  if (!model) return "";
  const copy = t(locale);
  const normalized = model.toLowerCase();
  if (normalized.includes("day") || normalized === "daily") {
    return copy.paymentDaily;
  }
  if (normalized.includes("hour")) return copy.paymentHourly;
  if (normalized.includes("lump") || normalized.includes("fixed")) {
    return copy.paymentLumpsum;
  }
  if (
    normalized.includes("piece") ||
    normalized.includes("unit") ||
    normalized.includes("quintal")
  ) {
    return copy.paymentPiece;
  }
  return model.replaceAll("_", " ");
}

export function statusTone(
  status: string,
): "neutral" | "success" | "warning" | "danger" {
  const normalized = status.toLowerCase();
  if (
    normalized === "approved" ||
    normalized === "published" ||
    normalized === "active" ||
    normalized === "open"
  ) {
    return "success";
  }
  if (
    normalized === "pending" ||
    normalized === "pending_review" ||
    normalized === "in_review" ||
    normalized === "draft"
  ) {
    return "warning";
  }
  if (normalized === "rejected" || normalized === "cancelled") {
    return "danger";
  }
  return "neutral";
}
