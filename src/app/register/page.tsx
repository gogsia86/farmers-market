/**
 * 🔄 REGISTER PAGE - Redirect to Signup
 * Redirects /register to /signup for consistency
 */

import { redirect } from "next/navigation";

export default function RegisterPage() {
  redirect("/signup");
}
