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
    homeHeadline: "Farm help near your village",
    homeSearchLabel: "What do you need?",
    homeSearchPlaceholder: "Tractor, labour, drip, jobs…",
    homePrimaryGuest: "Get started",
    homePrimaryFarmer: "Find a farm service",
    homePrimaryWorker: "Find farm jobs",
    homePrimaryProvider: "Manage my listings",
    homePrimaryBuyer: "Post a purchase need",
    homePrimaryDefault: "Go to My work",
    homeSecondaryExplore: "Explore marketplace",
    homeMarketplaceTitle: "What can you do here?",
    homeAgriMitraEyebrow: "Talk or type — Telugu and English",
    homeCategoriesTitle: "Popular service categories",
    homeSeeAllCategories: "See all categories",
    homeTrustTitle: "Built for trust",
    homeTrustBody:
      "Listings are staff-reviewed. Agri Mitra never publishes until you confirm.",
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
    workerProfile: "Worker profile",
    findJobs: "Find farm jobs",
    findJobsBody: "Browse open jobs near your village and apply.",
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
      "Notifications, bookings and dashboards for every role you use.",
    noRolesYet: "No roles yet — choose roles to unlock dashboards.",
    roleFarmer: "Farmer",
    roleWorker: "Worker",
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
        body: "Tractors, labour, irrigation and more near your village.",
      },
      farmJobs: {
        title: "Farm Jobs",
        te: "వ్యవసాయ ఉద్యోగాలు",
        body: "Hire workers or apply for paid farm work near your village.",
      },
      cropMarketplace: {
        title: "Sell Crops",
        te: "పంట అమ్మకం",
        body: "Sell produce or hold approved crop stock near your village.",
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
    priceOnEnquiry: "Price on enquiry",
    areaNotSet: "Area not set",
    provider: "Provider",
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
    holdQuantity: "Hold quantity",
    holdQuantityHint:
      "We hold this stock for you so another buyer cannot take the same amount. You can cancel later to release it.",
    holdingQuantity: "Holding…",
    signInToHold: "Sign in to hold quantity",
    manageMyListings: "Manage my listings",
    addRoleToHold: "Add buyer or farmer role to hold stock",
    messageToSeller: "Message to seller",
    cropsBrowseSubtitle:
      "Browse approved crop listings. Hold quantity to start a deal with the seller.",
    jobsBrowseSubtitle:
      "Browse approved farm jobs and apply as a worker.",
    buyersBrowseSubtitle:
      "Browse approved purchase needs and offer supply if you are a farmer.",
    offerSupply: "Offer supply",
    loginTitle: "Sign in",
    loginSubtitle:
      "Continue with Google, or use email for a one-time login code.",
    continueGoogle: "Continue with Google",
    orUseEmail: "or use email",
    emailLabel: "Email",
    emailHint:
      "We email a one-time code. Magic links also work when your Auth template includes them.",
    sendLoginCode: "Send login code",
    sendingCode: "Sending…",
    oneTimeCode: "One-time code",
    oneTimeCodeHint: "Enter the 6-digit code from your email.",
    verifyContinue: "Verify and continue",
    verifying: "Verifying…",
    loginCodeSent: "Check your email for a login code or magic link.",
    rolesTitle: "Choose your roles",
    rolesSubtitle:
      "One account can be farmer, worker, provider and buyer at the same time.",
    yourName: "Your name",
    yourNamePlaceholder: "Your name or farm / business name",
    howUse: "How will you use AllFarmNeeds?",
    roleFarmerDesc:
      "Find services, post farm jobs, and sell produce.",
    roleWorkerDesc: "Browse farm jobs and apply for paid work near you.",
    roleProviderDesc:
      "Publish tractor, labour, irrigation and other farm services.",
    roleBuyerDesc:
      "Post purchase needs, hold crop stock, and manage deals.",
    farmerLocation: "Farmer location",
    aboutFarm: "About your farm (optional)",
    selectLocation: "Select location",
    continue: "Continue",
    saving: "Saving…",
    welcomeTitle: "You’re ready — next steps",
    welcomeBody:
      "Use My work for dashboards. Notifications alert you about bookings and deals. Messages are for listing enquiries.",
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
    providerBookings: "ప్రొవైడర్ బుకింగ్‌లు",
    providerProfile: "ప్రొవైడర్ ప్రొఫైల్",
    moderation: "మోడరేషన్",
    roles: "పాత్రలు",
    signOut: "సైన్ అవుట్",
    signIn: "సైన్ ఇన్",
    signInRegister: "సైన్ ఇన్ / నమోదు",
    homeSubtitle:
      "తెలంగాణ మొదట. సేవలు, ఉద్యోగాలు, పంటలు, కొనుగోలు అవసరాలు — ఆంధ్రప్రదేశ్ కూడా మద్దతు.",
    homeHeadline: "మీ ఊరు దగ్గర వ్యవసాయ సహాయం",
    homeSearchLabel: "మీకు ఏమి కావాలి?",
    homeSearchPlaceholder: "ట్రాక్టర్, కూలీ, డ్రిప్, ఉద్యోగాలు…",
    homePrimaryGuest: "ప్రారంభించండి",
    homePrimaryFarmer: "వ్యవసాయ సేవ కనుగొనండి",
    homePrimaryWorker: "ఫార్మ్ జాబ్స్ చూడండి",
    homePrimaryProvider: "నా జాబితాలు నిర్వహించండి",
    homePrimaryBuyer: "కొనుగోలు అవసరం పోస్ట్ చేయండి",
    homePrimaryDefault: "నా పనికి వెళ్లండి",
    homeSecondaryExplore: "మార్కెట్ అన్వేషించండి",
    homeMarketplaceTitle: "ఇక్కడ మీరు ఏమి చేయవచ్చు?",
    homeAgriMitraEyebrow: "మాట్లాడండి లేదా టైప్ చేయండి — తెలుగు మరియు ఇంగ్లీష్",
    homeCategoriesTitle: "ప్రముఖ సేవా వర్గాలు",
    homeSeeAllCategories: "అన్ని వర్గాలు చూడండి",
    homeTrustTitle: "నమ్మకం కోసం",
    homeTrustBody:
      "జాబితాలు స్టాఫ్ సమీక్షలో ఉంటాయి. అగ్రి మిత్ర మీ నిర్ధారణ లేకుండా ప్రచురించదు.",
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
    navProfile: "నా పని",
    navMarketplace: "మార్కెట్",
    navAccount: "నా పని",
    navMore: "మరిన్ని",
    menu: "మెనూ",
    close: "మూసివేయి",
    openMenu: "మెనూ తెరవండి",
    closeMenu: "మెనూ మూసివేయి",
    showFilters: "చూపించు",
    hideFilters: "దాచు",
    loading: "లోడ్ అవుతోంది…",
    admin: "అడ్మిన్",
    myJobs: "నా ఉద్యోగాలు",
    myCrops: "నా పంటలు",
    cropDeals: "పంట డీల్స్",
    myRequirements: "నా అవసరాలు",
    buyerProfile: "కొనుగోలుదారు ప్రొఫైల్",
    applications: "దరఖాస్తులు",
    workerProfile: "కూలీ ప్రొఫైల్",
    findJobs: "ఫార్మ్ జాబ్స్ చూడండి",
    findJobsBody: "ఓపెన్ ఉద్యోగాలు చూసి దరఖాస్తు చేయండి.",
    filters: "ఫిల్టర్లు",
    selectMandalFirst: "గ్రామం ఎంచుకోవడానికి ముందు మండలం ఎంచుకోండి",
    exploreTitle: "మార్కెట్ అన్వేషించండి",
    exploreSubtitle:
      "సేవలు, ఉద్యోగాలు, పంటలు లేదా కొనుగోలు అవసరాలు ఎంచుకోండి.",
    exploreSearchHint: "వ్యవసాయ సేవలు వెతకండి",
    createTitle: "సృష్టించండి",
    createSubtitle: "మీ పాత్రలకు అందుబాటులో ఉన్న చర్యలు. ఎప్పుడైనా పాత్రలు జోడించండి.",
    profileTitle: "నా పని",
    profileSubtitle:
      "నోటిఫికేషన్లు, బుకింగ్‌లు మరియు మీ పాత్రల డాష్‌బోర్డ్‌లు.",
    noRolesYet: "ఇంకా పాత్రలు లేవు — డాష్‌బోర్డ్‌ల కోసం పాత్రలు ఎంచుకోండి.",
    roleFarmer: "రైతు",
    roleWorker: "కూలీ",
    roleProvider: "సేవా ప్రొవైడర్",
    roleBuyer: "కొనుగోలుదారు",
    roleRetailer: "రిటైలర్",
    roleLabourContractor: "కూలీ కాంట్రాక్టర్",
    roleAdmin: "అడ్మినిస్ట్రేటర్",
    roleModerator: "మోడరేటర్",
    statusOpen: "ఓపెన్",
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
        body: "మీ ఊరు దగ్గర ట్రాక్టర్, కూలీ, నీటిపారుదల సేవలు.",
      },
      farmJobs: {
        title: "వ్యవసాయ ఉద్యోగాలు",
        te: "Farm Jobs",
        body: "కూలీలను నియమించండి లేదా పొలం పనులకు దరఖాస్తు చేయండి.",
      },
      cropMarketplace: {
        title: "పంట అమ్మకం",
        te: "Sell Crops",
        body: "పంటలు అమ్మండి లేదా ఆమోదించిన స్టాక్ హోల్డ్ చేయండి.",
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
    priceOnEnquiry: "విచారణపై ధర",
    areaNotSet: "ప్రాంతం సెట్ కాలేదు",
    provider: "ప్రొవైడర్",
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
    browseMarketplace: "మార్కెట్ చూడండి",
    contactProvider: "ప్రొవైడర్‌ను సంప్రదించండి",
    callProvider: "కాల్",
    whatsappProvider: "WhatsApp",
    requestBooking: "బుకింగ్ అభ్యర్థన",
    requestBookingHint:
      "మీకు కావాల్సిన తేదీ పంపండి. ప్రొవైడర్ స్థితి అప్‌డేట్ చేస్తారు.",
    enquire: "సందేశం పంపండి",
    enquireHint: "బుకింగ్ లేకుండా ప్రశ్న అడగండి.",
    signInToBook: "బుక్ చేయడానికి సైన్ ఇన్",
    signInToEnquire: "సందేశానికి సైన్ ఇన్",
    yourListing: "ఇది మీ జాబితా.",
    moreContactOptions: "బుకింగ్ మరియు సందేశాలు",
    holdQuantity: "పరిమాణం హోల్డ్ చేయండి",
    holdQuantityHint:
      "ఈ స్టాక్ మీ కోసం హోల్డ్ అవుతుంది — మరొక కొనుగోలుదారు అదే పరిమాణం తీసుకోలేరు. తర్వాత రద్దు చేసి విడుదల చేయవచ్చు.",
    holdingQuantity: "హోల్డ్ అవుతోంది…",
    signInToHold: "హోల్డ్ చేయడానికి సైన్ ఇన్",
    manageMyListings: "నా జాబితాలు నిర్వహించండి",
    addRoleToHold: "స్టాక్ హోల్డ్ చేయడానికి కొనుగోలుదారు లేదా రైతు పాత్ర జోడించండి",
    messageToSeller: "అమ్మకందారుకు సందేశం",
    cropsBrowseSubtitle:
      "ఆమోదించిన పంట జాబితాలు చూడండి. డీల్ ప్రారంభించడానికి పరిమాణం హోల్డ్ చేయండి.",
    jobsBrowseSubtitle:
      "ఆమోదించిన పొలం పనులు చూసి కూలీగా దరఖాస్తు చేయండి.",
    buyersBrowseSubtitle:
      "ఆమోదించిన కొనుగోలు అవసరాలు చూడండి. రైతు అయితే సరఫరా ఆఫర్ పంపండి.",
    offerSupply: "సరఫరా ఆఫర్",
    loginTitle: "సైన్ ఇన్",
    loginSubtitle:
      "Googleతో కొనసాగించండి, లేదా ఇమెయిల్ ద్వారా వన్-టైమ్ కోడ్ పొందండి.",
    continueGoogle: "Googleతో కొనసాగించండి",
    orUseEmail: "లేదా ఇమెయిల్ వాడండి",
    emailLabel: "ఇమెయిల్",
    emailHint:
      "మేము వన్-టైమ్ కోడ్ పంపుతాము. Auth టెంప్లేట్‌లో ఉంటే మ్యాజిక్ లింక్ కూడా పని చేస్తుంది.",
    sendLoginCode: "లాగిన్ కోడ్ పంపండి",
    sendingCode: "పంపుతున్నాం…",
    oneTimeCode: "వన్-టైమ్ కోడ్",
    oneTimeCodeHint: "ఇమెయిల్‌లోని 6 అంకెల కోడ్ నమోదు చేయండి.",
    verifyContinue: "నిర్ధారించి కొనసాగండి",
    verifying: "నిర్ధారిస్తున్నాం…",
    loginCodeSent: "లాగిన్ కోడ్ లేదా మ్యాజిక్ లింక్ కోసం ఇమెయిల్ చూడండి.",
    rolesTitle: "మీ పాత్రలు ఎంచుకోండి",
    rolesSubtitle:
      "ఒకే ఖాతాలో రైతు, కూలీ, ప్రొవైడర్ మరియు కొనుగోలుదారు పాత్రలు ఉండవచ్చు.",
    yourName: "మీ పేరు",
    yourNamePlaceholder: "మీ పేరు లేదా పొలం / వ్యాపారం పేరు",
    howUse: "AllFarmNeedsను మీరు ఎలా వాడతారు?",
    roleFarmerDesc:
      "సేవలు కనుగొనండి, ఫార్మ్ జాబ్స్ పోస్ట్ చేయండి, పంటలు అమ్మండి.",
    roleWorkerDesc: "ఫార్మ్ జాబ్స్ చూసి దగ్గర పనులకు దరఖాస్తు చేయండి.",
    roleProviderDesc:
      "ట్రాక్టర్, కూలీ, నీటిపారుదల వంటి సేవలు ప్రచురించండి.",
    roleBuyerDesc:
      "కొనుగోలు అవసరాలు పోస్ట్ చేయండి, పంట స్టాక్ హోల్డ్ చేయండి, డీల్స్ నిర్వహించండి.",
    farmerLocation: "రైతు ప్రాంతం",
    aboutFarm: "మీ పొలం గురించి (ఐచ్ఛికం)",
    selectLocation: "ప్రాంతం ఎంచుకోండి",
    continue: "కొనసాగించండి",
    saving: "సేవ్ అవుతోంది…",
    welcomeTitle: "సిద్ధం — తర్వాతి అడుగులు",
    welcomeBody:
      "డాష్‌బోర్డ్‌లకు నా పని వాడండి. నోటిఫికేషన్లు బుకింగ్/డీల్ అలర్ట్‌లు. సందేశాలు జాబితా సంప్రదింపులు.",
    inboxExplainer:
      "నోటిఫికేషన్లు: బుకింగ్‌లు, దరఖాస్తులు, డీల్స్. సందేశాలు: జాబితా విచారణలు మరియు ప్రత్యుత్తరాలు.",
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
