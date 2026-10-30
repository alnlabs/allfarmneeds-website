export function getSiteUrl() {
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL.replace(/\/$/, "");
  }
  if (process.env.VERCEL_URL) {
    return `https://${process.env.VERCEL_URL.replace(/\/$/, "")}`;
  }
  return "http://localhost:2200";
}

export const PRICE_UNITS = [
  { value: "acre", label: "Per acre" },
  { value: "hour", label: "Per hour" },
  { value: "day", label: "Per day" },
  { value: "half_day", label: "Half day" },
  { value: "job", label: "Per job" },
  { value: "kilometre", label: "Per kilometre" },
] as const;

export const LISTING_STATUSES = [
  { value: "draft", label: "Draft" },
  { value: "published", label: "Published" },
  { value: "paused", label: "Paused" },
  { value: "closed", label: "Closed" },
] as const;
