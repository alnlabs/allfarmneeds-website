import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Suspense } from "react";
import { SiteHeader } from "@/components/site-header";
import { requireUser } from "@/lib/auth";
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
  return <SiteHeader email={user?.email} roles={user?.roles ?? []} />;
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <Suspense fallback={<SiteHeader />}>
          <Header />
        </Suspense>
        <div className="flex-1 bg-background">{children}</div>
      </body>
    </html>
  );
}
