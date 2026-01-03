import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Farmers Market Platform",
  description: "Connect local farmers with customers - Fresh, local, sustainable",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-white antialiased">
        {children}
      </body>
    </html>
  );
}
