import { LoginForm } from "@/components/features/auth/LoginForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login | Farmers Market Platform",
  description: "Sign in to your Farmers Market account",
};

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <LoginForm />
    </main>
  );
}
