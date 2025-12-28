/**
 * PUBLIC ROUTE GROUP LAYOUT
 * Layout for public marketing pages (about, contact, help, etc.)
 */

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PublicLayout({
  children,
}: {
  readonly children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-white">{children}</main>
      <Footer />
    </>
  );
}
