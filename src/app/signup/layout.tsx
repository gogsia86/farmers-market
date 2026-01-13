import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Sign Up | Farmers Market",
  description:
    "Create your account to buy fresh produce from local farms or sell your farm products directly to customers. Join our community today.",
};

export default function SignupLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
