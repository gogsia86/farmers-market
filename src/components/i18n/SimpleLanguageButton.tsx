/**
 * 🌍 SIMPLE LANGUAGE BUTTON - Works on all routes
 *
 * Simplified language selector that works without next-intl context
 */

"use client";

import { languageConfig, locales, type Locale } from "@/i18n/config";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useState } from "react";

const languageFlags: Record<Locale, string> = {
  en: "🇺🇸",
  es: "🇪🇸",
  fr: "🇫🇷",
  de: "🇩🇪",
  zh: "🇨🇳",
  ar: "🇸🇦",
  hi: "🇮🇳",
  pt: "🇧🇷",
  hr: "🇭🇷",
  sr: "🇷🇸",
};

export function SimpleLanguageButton() {
  const router = useRouter();
  const pathname = usePathname();
  const [currentLocale, setCurrentLocale] = useState<Locale>("en");

  // Detect current locale from pathname
  const detectedLocale =
    locales.find((loc) => pathname.startsWith(`/${loc}`)) || "en";

  const handleLanguageChange = (newLocale: Locale) => {
    setCurrentLocale(newLocale);

    // If we're on a locale route, replace the locale
    if (pathname.startsWith(`/${detectedLocale}`)) {
      const newPathname = pathname.replace(
        `/${detectedLocale}`,
        `/${newLocale}`,
      );
      router.push(newPathname);
    } else {
      // If we're on root route, navigate to locale home page
      router.push(`/${newLocale}`);
    }
  };

  const activeLocale = detectedLocale || currentLocale;
  const currentLanguage = languageConfig[activeLocale];
  const currentFlag = languageFlags[activeLocale];

  return (
    <Menu as="div" className="relative inline-block">
      <Menu.Button
        className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-agricultural-500"
        aria-label="Select language"
      >
        <span className="text-xl" aria-hidden="true">
          {currentFlag}
        </span>
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <ChevronDownIcon className="h-4 w-4" aria-hidden="true" />
      </Menu.Button>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none">
          <div className="p-2">
            <div className="mb-2 px-3 py-1 text-xs font-semibold text-gray-500 flex items-center gap-2">
              <GlobeAltIcon className="h-4 w-4" />
              Select Language
            </div>
            <div className="grid grid-cols-2 gap-1">
              {locales.map((loc) => {
                const lang = languageConfig[loc];
                const flag = languageFlags[loc];
                const isActive = loc === activeLocale;

                return (
                  <Menu.Item key={loc}>
                    {({ active }) => (
                      <button
                        onClick={() => handleLanguageChange(loc)}
                        className={`
                          ${active ? "bg-agricultural-50" : ""}
                          ${isActive ? "ring-2 ring-agricultural-500 bg-agricultural-50" : ""}
                          group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all
                        `}
                      >
                        <span className="text-xl" aria-hidden="true">
                          {flag}
                        </span>
                        <span
                          className={`${isActive ? "font-semibold text-agricultural-900" : "text-gray-700"}`}
                        >
                          {lang.nativeName}
                        </span>
                        {isActive && (
                          <span className="ml-auto text-agricultural-600">
                            ✓
                          </span>
                        )}
                      </button>
                    )}
                  </Menu.Item>
                );
              })}
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
