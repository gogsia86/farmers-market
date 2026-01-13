import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Reset Password | Farmers Market",
  description:
    "Forgot your password? Enter your email address and we'll send you instructions to reset your password and regain access to your account.",
};

export default function ForgotPasswordLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
