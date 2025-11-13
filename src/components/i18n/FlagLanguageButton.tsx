/**
 * 🌍 FLAG LANGUAGE BUTTON - VISUAL FLAG-BASED SELECTOR
 *
 * Eye-catching language selector with country flags
 */

"use client";

import { languageConfig, locales, type Locale } from "@/i18n/config";
import { Menu, Transition } from "@headlessui/react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useTransition } from "react";

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

export function FlagLanguageButton() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const currentLanguage = languageConfig[locale];
  const currentFlag = languageFlags[locale];

  const handleLanguageChange = (newLocale: Locale) => {
    startTransition(() => {
      const newPathname = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.replace(newPathname);
    });
  };

  return (
    <Menu as="div" className="relative inline-block">
      <Menu.Button
        className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 dark:bg-gray-800 dark:text-gray-200 dark:ring-gray-600 dark:hover:bg-gray-700"
        disabled={isPending}
      >
        <span className="text-xl">{currentFlag}</span>
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <ChevronDownIcon className="h-4 w-4" />
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
        <Menu.Items className="absolute right-0 z-50 mt-2 w-64 origin-top-right rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-gray-800">
          <div className="p-2">
            <div className="mb-2 px-3 py-1 text-xs font-semibold text-gray-500 dark:text-gray-400">
              Select Language
            </div>
            <div className="grid grid-cols-2 gap-1">
              {locales.map((loc) => {
                const lang = languageConfig[loc];
                const flag = languageFlags[loc];
                const isActive = loc === locale;

                return (
                  <Menu.Item key={loc}>
                    {({ active }) => (
                      <button
                        onClick={() => handleLanguageChange(loc)}
                        disabled={isPending}
                        className={`
                          ${active ? "bg-green-50 dark:bg-green-900/20" : ""}
                          ${isActive ? "ring-2 ring-green-500 bg-green-50 dark:bg-green-900/40" : ""}
                          group flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-all
                        `}
                      >
                        <span className="text-xl">{flag}</span>
                        <span
                          className={`${isActive ? "font-semibold text-green-900 dark:text-green-100" : "text-gray-700 dark:text-gray-300"}`}
                        >
                          {lang.nativeName}
                        </span>
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
