import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import { auth } from "@/lib/auth";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Farmers Market Platform - Fresh Local Produce Direct from Farms",
    template: "%s | Farmers Market Platform",
  },
  description:
    "Connect local farmers with customers - Fresh, local, sustainable produce delivered from farm to table. Support local agriculture and organic farming.",
  keywords: [
    "farmers market",
    "local produce",
    "organic food",
    "farm to table",
    "local farms",
    "fresh vegetables",
    "organic fruits",
    "sustainable agriculture",
    "farm direct",
    "local food",
  ],
  authors: [{ name: "Farmers Market Platform" }],
  creator: "Farmers Market Platform",
  publisher: "Farmers Market Platform",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL ||
      "https://farmers-market-platform.vercel.app",
  ),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    siteName: "Farmers Market Platform",
    title: "Farmers Market Platform - Fresh Local Produce Direct from Farms",
    description:
      "Connect with local farmers and get fresh, organic produce delivered directly from farm to table. Support sustainable agriculture in your community.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Farmers Market Platform - Farm to Table",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Farmers Market Platform - Fresh Local Produce",
    description:
      "Connect with local farmers and get fresh, organic produce delivered directly from farm to table.",
    images: ["/og-image.png"],
    creator: "@farmersmarket",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION,
  },
};

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || "";

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Fetch session on server to prevent hydration mismatch
  const session = await auth();

  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased flex flex-col">
        {/* Google Analytics - Scripts in body to avoid hydration issues */}
        {GA_TRACKING_ID && (
          <>
            <Script
              strategy="afterInteractive"
              src={`https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`}
            />
            <Script
              id="google-analytics"
              strategy="afterInteractive"
              dangerouslySetInnerHTML={{
                __html: `
                  window.dataLayer = window.dataLayer || [];
                  function gtag(){dataLayer.push(arguments);}
                  gtag('js', new Date());
                  gtag('config', '${GA_TRACKING_ID}', {
                    page_path: window.location.pathname,
                    agricultural_consciousness: 'active',
                    platform: 'farmers-market',
                  });
                `,
              }}
            />
          </>
        )}
        <SessionProvider session={session}>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
