/**
 * 🌍 SIMPLE LANGUAGE TOGGLE - QUICK 2-LANGUAGE SWITCHER
 *
 * Perfect for bilingual sites or quick switching between two main languages
 */

"use client";

import { languageConfig, type Locale } from "@/i18n/config";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";

interface SimpleLanguageToggleProps {
  languages?: Locale[];
}

export function SimpleLanguageToggle({
  languages = ["en", "es"] as Locale[],
}: SimpleLanguageToggleProps) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const handleToggle = () => {
    const currentIndex = languages.indexOf(locale);
    const nextIndex = (currentIndex + 1) % languages.length;
    const nextLocale = languages[nextIndex];

    startTransition(() => {
      const newPathname = pathname.replace(`/${locale}`, `/${nextLocale}`);
      router.replace(newPathname);
    });
  };

  const currentLang = languageConfig[locale];
  const otherLangs = languages
    .filter((l) => l !== locale)
    .map((l) => languageConfig[l].nativeName)
    .join(" / ");

  return (
    <button
      onClick={handleToggle}
      disabled={isPending}
      className="group relative inline-flex items-center gap-2 rounded-md bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-700"
      title={`Switch to ${otherLangs}`}
    >
      <span className="font-semibold">{currentLang.nativeName}</span>
      <svg
        className="h-4 w-4 transition-transform group-hover:rotate-180"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
        />
      </svg>
    </button>
  );
}
