import { getRequestConfig } from "next-intl/server";

// Supported locales for the Farmers Market platform
export const locales = ["en", "hr"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number]

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  if (!locales.includes(locale as any)) {
    return {
      messages: (await import(`../messages/en.json`)).default,
    };
  }

  return {
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
