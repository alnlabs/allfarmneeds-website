import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import { LocaleProvider } from "@/components/locale-provider";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/lib/auth";
import type { Locale } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { createClient } from "@/utils/supabase/server";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AllFarmNeeds",
  description: "Everything farmers need. One platform.",
};

async function Header() {
  const user = await requireUser();
  let unreadNotifications = 0;
  if (user) {
    const supabase = await createClient();
    const { count } = await supabase
      .from("notifications")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .is("read_at", null);
    unreadNotifications = count ?? 0;
  }
  return (
    <SiteHeader
      email={user?.email}
      roles={user?.roles ?? []}
      unreadNotifications={unreadNotifications}
    />
  );
}

function AppChrome({
  locale,
  locationLabel,
  manual,
  children,
}: {
  locale: Locale;
  locationLabel: string | null;
  manual: boolean;
  children: ReactNode;
}) {
  return (
    <LocaleProvider
      initialLocale={locale}
      initialLocationLabel={locationLabel}
      initialManual={manual}
    >
      <Suspense fallback={<SiteHeader />}>
        <Header />
      </Suspense>
      <div className="flex-1 bg-background">{children}</div>
    </LocaleProvider>
  );
}

async function LocaleChrome({ children }: { children: ReactNode }) {
  const { locale, locationLabel, manual } = await getRequestLocale();
  return (
    <AppChrome locale={locale} locationLabel={locationLabel} manual={manual}>
      {children}
    </AppChrome>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Suspense
          fallback={
            <AppChrome locale="en" locationLabel={null} manual={false}>
              {children}
            </AppChrome>
          }
        >
          <LocaleChrome>{children}</LocaleChrome>
        </Suspense>
      </body>
    </html>
  );
}
