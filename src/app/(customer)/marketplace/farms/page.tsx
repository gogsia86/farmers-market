/**
 * Marketplace Farms Page
 *
 * Redirects to the main farms page
 *
 * @route /marketplace/farms
 */

import { redirect } from "next/navigation";

export default async function MarketplaceFarmsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  // Await searchParams (Next.js 15+)
  const params = await searchParams;

  // Build query string from search params
  const urlParams = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      if (Array.isArray(value)) {
        value.forEach((v) => urlParams.append(key, v));
      } else {
        urlParams.append(key, value);
      }
    }
  });

  const queryString = urlParams.toString();
  const redirectUrl = queryString ? `/farms?${queryString}` : "/farms";

  redirect(redirectUrl);
}

export const metadata = {
  title: "Farms | Farmers Market Platform",
  description:
    "Explore local farms and meet the farmers bringing fresh food to your table",
};
