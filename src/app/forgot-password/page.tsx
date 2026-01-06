import { ForgotPasswordForm } from "@/components/features/auth/ForgotPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Forgot Password | Farmers Market Platform",
  description: "Reset your Farmers Market account password",
};

export default function ForgotPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ForgotPasswordForm />
    </main>
  );
}
