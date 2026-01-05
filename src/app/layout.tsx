import { Footer } from "@/components/layout/footer";
import { Header } from "@/components/layout/header";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farmers Market Platform",
  description: "Connect local farmers with customers - Fresh, local, sustainable",
  keywords: ["farmers market", "local produce", "organic food", "farm to table"],
};

const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || '';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Google Analytics */}
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
      </head>
      <body className="min-h-screen bg-white antialiased flex flex-col">
        <SessionProvider>
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
