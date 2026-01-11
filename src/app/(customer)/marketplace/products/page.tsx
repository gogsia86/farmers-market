/**
 * Marketplace Products Page
 *
 * Redirects to the main products page
 *
 * @route /marketplace/products
 */

import { redirect } from "next/navigation";

export default async function MarketplaceProductsPage({
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
  const redirectUrl = queryString ? `/products?${queryString}` : "/products";

  redirect(redirectUrl);
}

export const metadata = {
  title: "Products | Farmers Market Platform",
  description: "Browse all fresh, locally-grown produce from verified farmers",
};
