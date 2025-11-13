/**
 * ⚡ DIVINE SLUG UTILITY
 * Generates URL-safe slugs with agricultural consciousness
 */

/**
 * Generate a URL-safe slug from a string
 * @param text - Text to slugify
 * @param options - Slug generation options
 * @returns URL-safe slug
 */
export function generateSlug(
  text: string,
  options: {
    lowercase?: boolean;
    separator?: string;
    maxLength?: number;
  } = {},
): string {
  const { lowercase = true, separator = "-", maxLength = 100 } = options;

  let slug = text.toString();

  // Convert to lowercase if requested
  if (lowercase) {
    slug = slug.toLowerCase();
  }

  // Replace spaces and special characters
  slug = slug
    .trim()
    .replace(/[\s_]+/g, separator) // Replace spaces and underscores
    .replace(/[^\w\-]+/g, "") // Remove non-word chars except hyphens
    .replace(/\-\-+/g, separator) // Replace multiple hyphens with single
    .replace(/^-+/, "") // Trim hyphens from start
    .replace(/-+$/, ""); // Trim hyphens from end

  // Truncate to max length
  if (slug.length > maxLength) {
    slug = slug.substring(0, maxLength).replace(/-+$/, "");
  }

  return slug;
}

/**
 * Generate a unique slug by appending a number if needed
 * @param text - Base text for slug
 * @param existingSlugs - Array of existing slugs to check against
 * @returns Unique slug
 */
export function generateUniqueSlug(
  text: string,
  existingSlugs: string[],
): string {
  const baseSlug = generateSlug(text);
  let slug = baseSlug;
  let counter = 1;

  // Keep incrementing counter until we find a unique slug
  while (existingSlugs.includes(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
}

/**
 * Validate if a string is a valid slug
 * @param slug - String to validate
 * @returns True if valid slug
 */
export function isValidSlug(slug: string): boolean {
  // Valid slug: lowercase alphanumeric with hyphens, no spaces
  const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
  return slugRegex.test(slug);
}

/**
 * Convert slug back to readable text
 * @param slug - Slug to convert
 * @returns Human-readable text
 */
export function slugToText(slug: string): string {
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

/**
 * Generate agricultural-conscious slug
 * Preserves farming-specific terminology
 * @param text - Text to slugify
 * @returns Agricultural slug
 */
export function generateAgriculturalSlug(text: string): string {
  // Preserve important agricultural terms
  const preserveTerms = [
    "organic",
    "heirloom",
    "non-gmo",
    "biodynamic",
    "farm-fresh",
    "locally-grown",
  ];

  let slug = generateSlug(text);

  // Ensure agricultural terms are preserved
  preserveTerms.forEach((term) => {
    const termSlug = generateSlug(term);
    if (text.toLowerCase().includes(term)) {
      // Term already in slug, ensure proper format
      slug = slug.replace(new RegExp(termSlug, "g"), termSlug);
    }
  });

  return slug;
}

/**
 * Generate farm product slug with category
 * Format: category-product-name
 * @param productName - Name of the product
 * @param category - Product category
 * @returns Categorized slug
 */
export function generateProductSlug(
  productName: string,
  category: string,
): string {
  const categorySlug = generateSlug(category);
  const productSlug = generateSlug(productName);

  return `${categorySlug}-${productSlug}`;
}

/**
 * Generate farm slug with location
 * Format: farm-name-city-state
 * @param farmName - Name of the farm
 * @param city - City location
 * @param state - State location (optional)
 * @returns Location-aware farm slug
 */
export function generateFarmSlug(
  farmName: string,
  city: string,
  state?: string,
): string {
  const nameSlug = generateSlug(farmName);
  const citySlug = generateSlug(city);
  const stateSlug = state ? generateSlug(state) : "";

  return stateSlug
    ? `${nameSlug}-${citySlug}-${stateSlug}`
    : `${nameSlug}-${citySlug}`;
}
