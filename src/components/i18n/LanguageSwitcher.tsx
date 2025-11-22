/**
 * 🌍 LANGUAGE SWITCHER COMPONENT - DIVINE MULTI-LANGUAGE CONSCIOUSNESS
 *
 * Quantum-aware language selector with:
 * - Agricultural consciousness preservation
 * - Smooth locale transitions
 * - Divine UI patterns
 */

"use client";

import { languageConfig, locales, type Locale } from "@/i18n/config";
import { Menu, Transition } from "@headlessui/react";
import { GlobeAltIcon } from "@heroicons/react/24/outline";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useTransition } from "react";

export function LanguageSwitcher() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const currentLanguage = languageConfig[locale];

  const handleLanguageChange = (newLocale: Locale) => {
    startTransition(() => {
      // Navigate to the new locale path
      const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
      router.replace(newPath);
    });
  };

  return (
    <Menu as="div" className="relative inline-block text-left">
      <div>
        <Menu.Button
          className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700"
          disabled={isPending}
        >
          <GlobeAltIcon className="h-5 w-5" aria-hidden="true" />
          <span>{currentLanguage.nativeName}</span>
        </Menu.Button>
      </div>

      <Transition
        as={Fragment}
        enter="transition ease-out duration-100"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-75"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-lg bg-white shadow-xl ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-gray-700 dark:bg-gray-800 dark:ring-gray-700">
          <div className="p-2">
            {locales.map((loc) => {
              const lang = languageConfig[loc];
              const isActive = loc === locale;

              return (
                <Menu.Item key={loc}>
                  {({ active }) => (
                    <button
                      onClick={() => handleLanguageChange(loc)}
                      className={`
                        ${active ? "bg-green-50 dark:bg-green-900/20" : ""}
                        ${isActive ? "bg-green-100 text-green-900 dark:bg-green-900/40 dark:text-green-100" : "text-gray-700 dark:text-gray-300"}
                        group flex w-full items-center rounded-lg px-3 py-2 text-sm transition-colors
                      `}
                      disabled={isPending}
                    >
                      <div className="flex w-full items-center justify-between">
                        <div className="flex flex-col items-start">
                          <span className="font-medium">{lang.nativeName}</span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {lang.name}
                          </span>
                        </div>
                        {isActive && (
                          <span className="text-green-600 dark:text-green-400">
                            ✓
                          </span>
                        )}
                      </div>
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>

          <div className="p-2 text-xs text-gray-500 dark:text-gray-400">
            <div className="px-3 py-2">
              <p className="font-semibold">🌾 Agricultural Consciousness</p>
              <p className="mt-1">
                Context: {currentLanguage.agriculturalContext}
              </p>
            </div>
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
