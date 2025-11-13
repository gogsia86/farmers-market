// import { CartProvider } from "@/components/cart/CartProvider";
import { PWAInstaller } from "@/components/pwa/PWAInstaller";
// import { AgriculturalConsciousnessProvider } from "@/providers/AgriculturalConsciousnessProvider";
// import { SeasonalContextProvider } from "@/providers/SeasonalContextProvider";
import type { Metadata, Viewport } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import "./globals.css";

// Force dynamic rendering for all pages to avoid prerendering issues
export const dynamic = "force-dynamic";

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

export const metadata: Metadata = {
  title: {
    template: "%s | Divine Agricultural Marketplace",
    default: "Farmers Market - Quantum Agricultural Platform",
  },
  description:
    "Divine agricultural platform manifesting sustainable connections between biodynamic farmers and conscious consumers through quantum commerce patterns",
  keywords: [
    "organic farming",
    "sustainable agriculture",
    "biodynamic",
    "farmers market",
    "divine consciousness",
    "quantum commerce",
  ],
  authors: [{ name: "Agricultural Quantum Collective" }],
  creator: "Divine Agricultural Platform",
  publisher: "Quantum Farming Initiative",
  metadataBase: new URL("https://farmers-market.divine-platform.app"),
  openGraph: {
    title: "Divine Agricultural Marketplace",
    description: "Quantum agricultural platform with biodynamic consciousness",
    type: "website",
    locale: "en_US",
    siteName: "Divine Farmers Market",
  },
  twitter: {
    card: "summary_large_image",
    title: "Divine Agricultural Marketplace",
    description: "Biodynamic farming consciousness meets quantum commerce",
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
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Farmers Market",
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
      <head>
        {/* Divine Agricultural Consciousness Meta */}
        <meta name="agricultural-consciousness" content="maximum" />
        <meta name="biodynamic-compliance" content="certified" />
        <meta name="quantum-coherence" content="optimal" />
        <meta name="seasonal-alignment" content="harmonic" />
      </head>
      <body className={`${inter.className} font-sans antialiased`}>
        <PWAInstaller />
        {children}
      </body>
    </html>
  );
}
