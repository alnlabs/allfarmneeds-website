import type { Locale } from "@/lib/locale";

export type AgriIntent =
  | "search_services"
  | "draft_farm_job"
  | "draft_product_listing"
  | "search_buyers"
  | "read_inbox"
  | "help"
  | "unknown";

export type ParsedIntent = {
  intent: AgriIntent;
  localeHint: Locale | null;
  query: string;
  quantity: number | null;
  workers: number | null;
  serviceHint: string | null;
  cropHint: string | null;
  jobHint: string | null;
};

function detectLocaleHint(text: string): Locale | null {
  if (/[\u0C00-\u0C7F]/.test(text)) return "te";
  if (/[a-z]/i.test(text)) return "en";
  return null;
}

function extractNumber(text: string, patterns: RegExp[]): number | null {
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const value = Number(match[1]);
      if (Number.isFinite(value) && value > 0) return value;
    }
  }
  return null;
}

function detectServiceHint(lower: string): string | null {
  if (/tractor|ట్రాక్టర్/.test(lower)) return "tractor-rental";
  if (/drone|డ్రోన్/.test(lower)) return "drone-spraying";
  if (/drip|sprinkler|డ్రిప్|స్ప్రింక్లర్/.test(lower)) return "drip-sprinkler";
  if (/irrigation|నీటిపారుదల/.test(lower)) return "irrigation";
  if (
    /labour|labor|farm.?worker|పని\s*వారు|పనివారు|పని\s*మనుషులు/.test(lower) &&
    /service|సేవ/.test(lower)
  ) {
    return "farm-labour";
  }
  if (/harvester|హార్వెస్టర్/.test(lower)) return "harvester";
  if (/jcb|జెసీబీ/.test(lower)) return "earthmoving";
  return null;
}

function detectCropHint(lower: string): string | null {
  if (/paddy|rice|వరి|బియ్యం|sona/.test(lower)) return "paddy";
  if (/cotton|పత్తి/.test(lower)) return "cotton";
  if (/maize|మొక్కజొన్న/.test(lower)) return "maize";
  if (/chilli|chili|మిరప/.test(lower)) return "chilli";
  if (/turmeric|పసుపు/.test(lower)) return "turmeric";
  if (/groundnut|వేరుశనగ/.test(lower)) return "groundnuts";
  if (/vegetable|కూరగాయ/.test(lower)) return "vegetables";
  if (/fruit|పండు|పండ్లు/.test(lower)) return "fruits";
  return null;
}

function detectJobHint(lower: string): string | null {
  if (/cotton|పత్తి/.test(lower)) return "cotton-picking";
  if (/paddy|వరి/.test(lower)) return "paddy-harvesting";
  if (/harvest|కోత/.test(lower)) return "harvesting";
  if (/plant|నాట్|నాట్లు/.test(lower)) return "planting";
  if (/weed|కలుపు/.test(lower)) return "weeding";
  return "other";
}

export function parseAgriIntent(raw: string): ParsedIntent {
  const text = raw.trim();
  const lower = text.toLowerCase();
  const localeHint = detectLocaleHint(text);
  const quantity = extractNumber(lower, [
    /(\d+(?:\.\d+)?)\s*(?:quintal|qtl|క్వింటాల్)/i,
    /(\d+(?:\.\d+)?)\s*(?:kg|కిలో)/i,
    /(\d+(?:\.\d+)?)\s*(?:tonne|ton|టన్ను)/i,
  ]);
  const workers = extractNumber(lower, [
    /(\d+)\s*(?:workers?|people|మంది|పని\s*వారు|పనివారు)/i,
    /(?:workers?|people|మంది|పని\s*వారు|పనివారు)\s*(\d+)/i,
  ]);

  const serviceHint = detectServiceHint(lower);
  const cropHint = detectCropHint(lower);
  const jobHint = detectJobHint(lower);

  const wantsSell =
    /sell|selling|అమ్మ|అమ్మడానికి|అమ్మాలి|produce listing|crop listing/.test(lower);
  const wantsJob =
    /job|hire workers|need workers|farm workers?|పని\s*వారు\s*కావాలి|పనివారు\s*కావాలి|ఉద్యోగం|పనికి మనుషులు|పొలం పని|workers for/.test(
      lower,
    ) ||
    (workers != null &&
      /worker|మంది|పని\s*వారు|పనివారు|పని\s*మనుషులు/.test(lower));
  const wantsService =
    /find|need|looking for|search|సేవ|కావాలి|దగ్గర|near/.test(lower) &&
    (serviceHint != null ||
      /service|tractor|drone|drip|irrigation|ట్రాక్టర్|డ్రోన్|డ్రిప్/.test(lower));
  const wantsBuyers =
    /buyer|traders?|looking for cotton|కొనుగోలు|వ్యాపారి|requirement/.test(lower) &&
    !wantsSell;
  const wantsInbox =
    /message|enquiry|booking|application|inbox|సందేశ|బుకింగ్|దరఖాస్తు|applied/.test(
      lower,
    );
  const wantsHelp = /help|what can you|సహాయం|ఏమి చేయగలవు|menu/.test(lower);

  let intent: AgriIntent = "unknown";
  if (wantsInbox) intent = "read_inbox";
  else if (wantsSell || (cropHint && /sell|అమ్మ|quintal|క్వింటాల్/.test(lower))) {
    intent = "draft_product_listing";
  } else if (wantsJob) intent = "draft_farm_job";
  else if (wantsBuyers) intent = "search_buyers";
  else if (wantsService) intent = "search_services";
  else if (wantsHelp) intent = "help";
  else if (serviceHint) intent = "search_services";
  else if (cropHint) intent = "draft_product_listing";

  return {
    intent,
    localeHint,
    query: text,
    quantity,
    workers,
    serviceHint,
    cropHint,
    jobHint,
  };
}
