import { RegisterForm } from "@/components/features/auth/RegisterForm";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Register | Farmers Market Platform",
  description: "Create your Farmers Market account - Join our agricultural community",
};

export default function RegisterPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <RegisterForm />
    </main>
  );
}
