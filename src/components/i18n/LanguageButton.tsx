/**
 * 🌍 COMPACT LANGUAGE BUTTON - MINIMAL DROPDOWN SELECTOR
 *
 * A clean, compact language selector button perfect for navigation bars
 */

"use client";

import { languageConfig, locales, type Locale } from "@/i18n/config";
import { Menu, Transition } from "@headlessui/react";
import { CheckIcon, GlobeAltIcon } from "@heroicons/react/24/outline";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "next/navigation";
import { Fragment, useTransition } from "react";

export function LanguageButton() {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const currentLanguage = languageConfig[locale];

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
        <GlobeAltIcon className="h-5 w-5" aria-hidden="true" />
        <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
        <span className="sm:hidden">{locale.toUpperCase()}</span>
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
        <Menu.Items className="absolute right-0 z-50 mt-2 w-56 origin-top-right divide-y divide-gray-100 rounded-lg bg-white shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:divide-gray-700 dark:bg-gray-800">
          <div className="p-1">
            {locales.map((loc) => {
              const lang = languageConfig[loc];
              const isActive = loc === locale;

              return (
                <Menu.Item key={loc}>
                  {({ active }) => (
                    <button
                      onClick={() => handleLanguageChange(loc)}
                      disabled={isPending}
                      className={`
                        ${active ? "bg-green-50 dark:bg-green-900/20" : ""}
                        ${isActive ? "bg-green-100 font-semibold text-green-900 dark:bg-green-900/40 dark:text-green-100" : "text-gray-700 dark:text-gray-300"}
                        group flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors
                      `}
                    >
                      <span>{lang.nativeName}</span>
                      {isActive && (
                        <CheckIcon className="h-4 w-4 text-green-600 dark:text-green-400" />
                      )}
                    </button>
                  )}
                </Menu.Item>
              );
            })}
          </div>
        </Menu.Items>
      </Transition>
    </Menu>
  );
}
