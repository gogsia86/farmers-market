import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import { SpeedInsights } from "@vercel/speed-insights/next";
import "./globals.css";

// Force dynamic rendering for all pages to avoid prerendering issues
export const dynamic = "force-dynamic";

// Divine Site Configuration
const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
const siteConfig = {
  name: "Farmers Market - Divine Agricultural Platform",
  description:
    "Quantum agricultural marketplace connecting farmers and consumers with fresh, organic, biodynamic produce through divine software consciousness",
  url: baseUrl,
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

// Metadata values extracted at module level to avoid runtime serialization issues

export const metadata: Metadata = {
  metadataBase: new URL(baseUrl),
  title: {
    default: siteConfig.name,
    template: `%s - ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "farmers market",
    "local food",
    "organic produce",
    "farm fresh",
    "sustainable agriculture",
    "biodynamic farming",
  ],
  authors: [
    {
      name: "Farmers Market Team",
      url: baseUrl,
    },
  ],
  creator: "Farmers Market Platform",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: baseUrl,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${baseUrl}/og-image.jpg`,
        width: 1200,
        height: 630,
        alt: siteConfig.name,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteConfig.name,
    description: siteConfig.description,
    images: [`${baseUrl}/og-image.jpg`],
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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#22c55e" },
    { media: "(prefers-color-scheme: dark)", color: "#16a34a" },
  ],
};

export default function RootLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <html
      suppressHydrationWarning
      className={`${inter.variable} ${playfair.variable}`}
    >
      <head />
      <body className={`${inter.className} font-sans antialiased`}>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
