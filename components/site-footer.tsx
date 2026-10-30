"use client";

import Link from "next/link";
import { useLocale } from "@/components/locale-provider";

export function SiteFooter() {
  const { copy, locale } = useLocale();

  return (
    <footer className="mt-auto border-t border-border bg-white">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-8 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <p className="text-lg font-semibold text-accent-strong">AllFarmNeeds</p>
          <p className="mt-2 text-sm text-muted">{copy.tagline}</p>
          <p className="mt-3 text-sm text-muted">
            {locale === "te"
              ? "తెలంగాణ మొదట — ఆంధ్రప్రదేశ్ కూడా మద్దతు."
              : "Telangana first — Andhra Pradesh also supported."}
          </p>
        </div>
        <div>
          <p className="text-sm font-medium">{copy.navExplore}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/services" className="hover:text-accent-strong">
                {copy.modules.farmServices.title}
              </Link>
            </li>
            <li>
              <Link href="/jobs" className="hover:text-accent-strong">
                {copy.modules.farmJobs.title}
              </Link>
            </li>
            <li>
              <Link href="/crops" className="hover:text-accent-strong">
                {copy.modules.cropMarketplace.title}
              </Link>
            </li>
            <li>
              <Link href="/buyers" className="hover:text-accent-strong">
                {copy.modules.buyersTraders.title}
              </Link>
            </li>
            <li>
              <Link href="/agri-mitra" className="hover:text-accent-strong">
                {copy.agriMitra}
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-medium">{copy.navAccount}</p>
          <ul className="mt-3 space-y-2 text-sm text-muted">
            <li>
              <Link href="/login" className="hover:text-accent-strong">
                {copy.signInRegister}
              </Link>
            </li>
            <li>
              <Link href="/onboarding/roles" className="hover:text-accent-strong">
                {copy.roles}
              </Link>
            </li>
            <li>
              <Link href="/messages" className="hover:text-accent-strong">
                {copy.messages}
              </Link>
            </li>
            <li>
              <Link href="/create" className="hover:text-accent-strong">
                {copy.navCreate}
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="border-t border-border px-4 py-3 text-center text-xs text-muted sm:px-6 lg:px-8">
        © AllFarmNeeds
      </div>
    </footer>
  );
}
