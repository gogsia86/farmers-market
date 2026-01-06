import { ResetPasswordForm } from "@/components/features/auth/ResetPasswordForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Farmers Market Platform",
  description: "Create a new password for your Farmers Market account",
};

export default function ResetPasswordPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <ResetPasswordForm />
    </main>
  );
}
