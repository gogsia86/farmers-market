/**
 * 🌍 I18N UTILITY FUNCTIONS - DIVINE AGRICULTURAL LOCALIZATION HELPERS
 *
 * Quantum-aligned helpers for:
 * - Number formatting
 * - Currency conversion
 * - Date/time localization
 * - Agricultural term translation
 */

import { type Locale, currencyByLocale, dateFormatByLocale } from "./config";

/**
 * Format a number according to locale
 */
export function formatNumber(value: number, locale: Locale): string {
  return new Intl.NumberFormat(locale).format(value);
}

/**
 * Format currency according to locale
 */
export function formatCurrency(
  amount: number,
  locale: Locale,
  options?: Intl.NumberFormatOptions,
): string {
  const currency = currencyByLocale[locale];

  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    ...options,
  }).format(amount);
}

/**
 * Format date according to locale
 */
export function formatDate(
  date: Date | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    ...options,
  }).format(dateObj);
}

/**
 * Format date and time according to locale
 */
export function formatDateTime(
  date: Date | string,
  locale: Locale,
  options?: Intl.DateTimeFormatOptions,
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;

  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  }).format(dateObj);
}

/**
 * Format relative time (e.g., "2 days ago")
 */
export function formatRelativeTime(
  date: Date | string,
  locale: Locale,
): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - dateObj.getTime()) / 1000);

  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: "auto" });

  if (diffInSeconds < 60) {
    return rtf.format(-diffInSeconds, "second");
  } else if (diffInSeconds < 3600) {
    return rtf.format(-Math.floor(diffInSeconds / 60), "minute");
  } else if (diffInSeconds < 86400) {
    return rtf.format(-Math.floor(diffInSeconds / 3600), "hour");
  } else if (diffInSeconds < 2592000) {
    return rtf.format(-Math.floor(diffInSeconds / 86400), "day");
  } else if (diffInSeconds < 31536000) {
    return rtf.format(-Math.floor(diffInSeconds / 2592000), "month");
  } else {
    return rtf.format(-Math.floor(diffInSeconds / 31536000), "year");
  }
}

/**
 * Format percentage according to locale
 */
export function formatPercentage(
  value: number,
  locale: Locale,
  decimals: number = 0,
): string {
  return new Intl.NumberFormat(locale, {
    style: "percent",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}

/**
 * Format weight/mass according to locale (metric vs imperial)
 */
export function formatWeight(grams: number, locale: Locale): string {
  // US uses pounds/ounces, others use kg/g
  const isImperial = locale === "en";

  if (isImperial) {
    const pounds = grams / 453.592;
    if (pounds >= 1) {
      return `${pounds.toFixed(2)} lbs`;
    } else {
      const ounces = grams / 28.3495;
      return `${ounces.toFixed(2)} oz`;
    }
  } else {
    if (grams >= 1000) {
      return `${(grams / 1000).toFixed(2)} kg`;
    } else {
      return `${grams.toFixed(0)} g`;
    }
  }
}

/**
 * Format distance according to locale (metric vs imperial)
 */
export function formatDistance(kilometers: number, locale: Locale): string {
  const isImperial = locale === "en";

  if (isImperial) {
    const miles = kilometers * 0.621371;
    return `${miles.toFixed(1)} mi`;
  } else {
    return `${kilometers.toFixed(1)} km`;
  }
}

/**
 * Format temperature according to locale (Celsius vs Fahrenheit)
 */
export function formatTemperature(celsius: number, locale: Locale): string {
  const isImperial = locale === "en";

  if (isImperial) {
    const fahrenheit = (celsius * 9) / 5 + 32;
    return `${fahrenheit.toFixed(1)}°F`;
  } else {
    return `${celsius.toFixed(1)}°C`;
  }
}

/**
 * Get date format pattern for locale
 */
export function getDateFormat(locale: Locale): string {
  return dateFormatByLocale[locale];
}

/**
 * Parse user input date according to locale
 */
export function parseLocalizedDate(
  dateString: string,
  locale: Locale,
): Date | null {
  try {
    const format = dateFormatByLocale[locale];
    // Simple parsing - in production, use date-fns or similar
    const parts = dateString.split(/[/\-.]/);

    if (parts.length !== 3 || parts.some((p: any) => !p)) {
      return null;
    }

    if (format.startsWith("MM")) {
      // MM/DD/YYYY
      return new Date(
        parseInt(parts[2]!, 10),
        parseInt(parts[0]!, 10) - 1,
        parseInt(parts[1]!, 10),
      );
    } else if (format.startsWith("DD")) {
      // DD/MM/YYYY or DD.MM.YYYY
      return new Date(
        parseInt(parts[2]!, 10),
        parseInt(parts[1]!, 10) - 1,
        parseInt(parts[0]!, 10),
      );
    } else {
      // YYYY-MM-DD or similar
      return new Date(
        parseInt(parts[0]!, 10),
        parseInt(parts[1]!, 10) - 1,
        parseInt(parts[2]!, 10),
      );
    }
  } catch {
    return null;
  }
}

/**
 * Get list formatter for locale (e.g., "apples, oranges, and bananas")
 */
export function formatList(
  items: string[],
  locale: Locale,
  type: "conjunction" | "disjunction" = "conjunction",
): string {
  return new Intl.ListFormat(locale, { type }).format(items);
}

/**
 * Sort strings according to locale collation rules
 */
export function sortByLocale(strings: string[], locale: Locale): string[] {
  return [...strings].sort((a, b) => a.localeCompare(b, locale));
}

/**
 * Get plural rules for locale
 */
export function getPluralRule(
  count: number,
  locale: Locale,
): Intl.LDMLPluralRule {
  const pr = new Intl.PluralRules(locale);
  return pr.select(count);
}

/**
 * Format phone number according to locale
 * (Basic implementation - extend as needed)
 */
export function formatPhoneNumber(phone: string, locale: Locale): string {
  // Remove non-digits
  const digits = phone.replace(/\D/g, "");

  // Format based on locale
  if (locale === "en") {
    // US format: (555) 123-4567
    if (digits.length === 10) {
      return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
    }
  } else if (locale === "es" || locale === "pt") {
    // Spain/Brazil format: +XX XXX XXX XXX
    if (digits.length >= 9) {
      return `+${digits.slice(0, 2)} ${digits.slice(2, 5)} ${digits.slice(5, 8)} ${digits.slice(8)}`;
    }
  }

  // Default: just add spaces every 3 digits
  return digits.replace(/(\d{3})(?=\d)/g, "$1 ");
}

/**
 * Get first day of week for locale (Sunday=0, Monday=1)
 */
export function getFirstDayOfWeek(locale: Locale): number {
  // US starts on Sunday, most others on Monday
  return locale === "en" ? 0 : 1;
}

/**
 * Agricultural consciousness level translator
 */
export const agriculturalConsciousnessLevels = {
  en: {
    low: "Conventional",
    medium: "Organic",
    high: "Biodynamic",
    maximum: "Regenerative",
  },
  es: {
    low: "Convencional",
    medium: "Orgánico",
    high: "Biodinámico",
    maximum: "Regenerativo",
  },
  fr: {
    low: "Conventionnel",
    medium: "Biologique",
    high: "Biodynamique",
    maximum: "Régénératif",
  },
  hr: {
    low: "Konvencionalno",
    medium: "Organsko",
    high: "Biodinamičko",
    maximum: "Regenerativno",
  },
  sr: {
    low: "Konvencionalno",
    medium: "Organsko",
    high: "Biodinamičko",
    maximum: "Regenerativno",
  },
} as const;

/**
 * Get agricultural consciousness label
 */
export function getAgriculturalConsciousnessLabel(
  level: keyof (typeof agriculturalConsciousnessLevels)["en"],
  locale: Locale,
): string {
  const labels =
    agriculturalConsciousnessLevels[
      locale as keyof typeof agriculturalConsciousnessLevels
    ];
  return labels?.[level] || agriculturalConsciousnessLevels.en[level];
}
