import type { Metadata } from "next";
import { Geist_Mono, Inter, Plus_Jakarta_Sans } from "next/font/google";
import { Suspense, type ReactNode } from "react";
import { HomeChromeGate } from "@/components/home-chrome-gate";
import { LocaleProvider } from "@/components/locale-provider";
import { SiteBottomNav } from "@/components/site-bottom-nav";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/lib/auth";
import type { Locale } from "@/lib/locale";
import { getRequestLocale } from "@/lib/locale-server";
import { createClient } from "@/utils/supabase/server";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AllFarmNeeds",
  description: "Everything your farm needs, in one place.",
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
    <HomeChromeGate>
      <SiteHeader
        email={user?.email}
        roles={user?.roles ?? []}
        unreadNotifications={unreadNotifications}
      />
    </HomeChromeGate>
  );
}

async function ChromeExtras() {
  const user = await requireUser();
  const signedIn = Boolean(user);
  return (
    <HomeChromeGate>
      <SiteFooter signedIn={signedIn} />
      <SiteBottomNav signedIn={signedIn} />
    </HomeChromeGate>
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
      <Suspense fallback={null}>
        <Header />
      </Suspense>
      <div className="flex-1 bg-background lg:pb-0">{children}</div>
      <Suspense fallback={null}>
        <ChromeExtras />
      </Suspense>
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
      className={`${jakarta.variable} ${inter.variable} ${geistMono.variable} h-full antialiased`}
    >
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0,0&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="flex min-h-full flex-col bg-background font-sans text-foreground">
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
