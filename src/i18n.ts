import { getRequestConfig } from "next-intl/server";

// Supported locales for the Farmers Market platform
export const locales = ["en", "hr"] as const;
export const defaultLocale = "en" as const;

export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Validate that the incoming `locale` parameter is valid
  const validatedLocale = (
    locales.includes(locale as any) ? locale : defaultLocale
  ) as string;

  return {
    locale: validatedLocale,
    messages: (await import(`../messages/${validatedLocale}.json`)).default,
  };
});
