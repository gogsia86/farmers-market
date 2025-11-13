/**
 * 🌍 I18N CONFIGURATION - DIVINE AGRICULTURAL MULTI-LANGUAGE MASTERY
 *
 * Quantum-aligned internationalization supporting:
 * - Multiple language consciousness
 * - RTL/LTR awareness
 * - Agricultural domain translations
 * - Seasonal adaptation across cultures
 */

export type Locale = (typeof locales)[number];

export const locales = [
  "en",
  "es",
  "fr",
  "de",
  "zh",
  "ar",
  "hi",
  "pt",
  "hr",
  "sr",
] as const;
export const defaultLocale: Locale = "en";

/**
 * Language Configuration with Agricultural Consciousness
 */
export const languageConfig = {
  en: {
    name: "English",
    nativeName: "English",
    direction: "ltr",
    region: "North America",
    agriculturalContext: "temperate",
  },
  es: {
    name: "Spanish",
    nativeName: "Español",
    direction: "ltr",
    region: "Latin America",
    agriculturalContext: "tropical-temperate",
  },
  fr: {
    name: "French",
    nativeName: "Français",
    direction: "ltr",
    region: "Europe",
    agriculturalContext: "temperate",
  },
  de: {
    name: "German",
    nativeName: "Deutsch",
    direction: "ltr",
    region: "Europe",
    agriculturalContext: "temperate",
  },
  zh: {
    name: "Chinese",
    nativeName: "中文",
    direction: "ltr",
    region: "Asia",
    agriculturalContext: "diverse",
  },
  ar: {
    name: "Arabic",
    nativeName: "العربية",
    direction: "rtl",
    region: "Middle East",
    agriculturalContext: "arid",
  },
  hi: {
    name: "Hindi",
    nativeName: "हिन्दी",
    direction: "ltr",
    region: "South Asia",
    agriculturalContext: "tropical",
  },
  pt: {
    name: "Portuguese",
    nativeName: "Português",
    direction: "ltr",
    region: "South America",
    agriculturalContext: "tropical",
  },
  hr: {
    name: "Croatian",
    nativeName: "Hrvatski",
    direction: "ltr",
    region: "Southeast Europe",
    agriculturalContext: "mediterranean-temperate",
  },
  sr: {
    name: "Serbian",
    nativeName: "Српски",
    direction: "ltr",
    region: "Southeast Europe",
    agriculturalContext: "continental-temperate",
  },
} as const;

/**
 * Get language direction for proper layout
 */
export function getLanguageDirection(locale: Locale): "ltr" | "rtl" {
  return languageConfig[locale].direction;
}

/**
 * Check if locale is valid
 */
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

/**
 * Get locale from request or default
 */
export function getLocaleFromRequest(requestLocale?: string): Locale {
  if (requestLocale && isValidLocale(requestLocale)) {
    return requestLocale;
  }
  return defaultLocale;
}

/**
 * Currency mapping for different locales
 */
export const currencyByLocale: Record<Locale, string> = {
  en: "USD",
  es: "EUR",
  fr: "EUR",
  de: "EUR",
  zh: "CNY",
  ar: "AED",
  hi: "INR",
  pt: "BRL",
  hr: "EUR", // Croatian Kuna (HRK) or Euro
  sr: "RSD", // Serbian Dinar
};

/**
 * Date format preferences by locale
 */
export const dateFormatByLocale: Record<Locale, string> = {
  en: "MM/DD/YYYY",
  es: "DD/MM/YYYY",
  fr: "DD/MM/YYYY",
  de: "DD.MM.YYYY",
  zh: "YYYY年MM月DD日",
  ar: "DD/MM/YYYY",
  hi: "DD/MM/YYYY",
  pt: "DD/MM/YYYY",
  hr: "DD.MM.YYYY",
  sr: "DD.MM.YYYY",
};
