"use client"

import Link from "next/link"
import Image from "next/image"
import { Moon, Sun, Globe, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { useState } from "react"
import { LanguageSelector } from "./language-selector"
import { useI18n } from "@/hooks/use-i18n"

interface FooterProps {
  currentLang: string
  onLanguageChange: (lang: string) => void
}

export function Footer({ currentLang, onLanguageChange }: FooterProps) {
  const { theme, setTheme } = useTheme()
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const { t } = useI18n(currentLang)

  return (
    <>
      <footer className="mx-auto w-full max-w-container px-4 sm:px-6 lg:px-8">
        <div className="border-t border-slate-900/5 py-10">
          {/* Logo */}
          <div className="flex items-center justify-center mb-6 transition-transform transform hover:scale-105">
            <Link
              href="/"
              className="text-2xl font-bold text-primary-600 dark:text-primary-400"
              style={{ fontFamily: "'Montserrat', sans-serif" }}
            >
              {t("sitename")}
            </Link>
            <span
              className="ml-2 inline-flex items-center justify-center px-2 py-1 text-xs font-semibold text-white bg-blue-500 rounded-md uppercase"
              style={{ lineHeight: 1 }}
            >
              Beta
            </span>
          </div>

          <div className="flex flex-col items-center">
            <p className="text-center text-sm leading-6 dark:text-white text-slate-500">
              © {new Date().getFullYear()} - {t("license_info")}
            </p>

            <div className="flex items-center dark:text-white justify-center space-x-4 text-sm font-semibold leading-6 text-slate-700 mt-4">
              <Link href="/privacy-policy">{t("privacy_policy")}</Link>
              <div className="h-4 w-px bg-slate-500/20"></div>
              <Link href="/terms-of-use">{t("terms_of_use")}</Link>
              <div className="h-4 w-px bg-slate-500/20"></div>
              <a href="https://github.com/danielyepezgarces/wikipeoplestats" target="_blank" rel="noopener noreferrer">
                {t("source_code")}
              </a>
            </div>
          </div>

          <div className="flex justify-center mt-6 space-x-4 flex-wrap">
            {/* Badge: Powered by Wikimedia */}
            <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-2 sm:px-3 sm:py-2 shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 mb-4 sm:mb-0">
              <a
                href="https://wikitech.wikimedia.org/wiki/Help:Cloud_Services_introduction"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/3/3d/Wikimedia_Cloud_Services_logo.svg"
                  alt="Wikimedia Cloud Services Logo"
                  width={32}
                  height={32}
                  className="h-10 sm:h-8 mr-2"
                />
                <div className="flex flex-col items-center sm:items-start text-center w-full">
                  <span className="text-xs sm:text-sm font-normal text-gray-800 dark:text-gray-200">Powered by</span>
                  <span className="text-xs sm:text-sm font-semibold font-montserrat text-gray-800 dark:text-white">
                    Wikimedia
                  </span>
                  <span className="text-xs sm:text-sm font-normal text-gray-800 dark:text-gray-200">
                    Cloud Services
                  </span>
                </div>
              </a>
            </div>

            {/* Badge: Data from Wikidata */}
            <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-2 sm:px-3 sm:py-2 shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 mb-4 sm:mb-0">
              <a
                href="https://www.wikidata.org"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <Image
                  src="https://upload.wikimedia.org/wikipedia/commons/7/71/Wikidata.svg"
                  alt="Wikidata Logo"
                  width={32}
                  height={32}
                  className="h-10 sm:h-8 mr-2"
                />
                <div className="flex flex-col items-center sm:items-start text-center w-full">
                  <span className="text-xs sm:text-sm font-normal text-gray-800 dark:text-gray-200">Data from</span>
                  <span className="text-xs sm:text-sm font-semibold font-montserrat text-gray-800 dark:text-white">
                    Wikidata
                  </span>
                </div>
              </a>
            </div>

            {/* Badge: Data queried via QLever */}
            <div className="inline-flex items-center bg-gray-100 dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 rounded-xl p-2 sm:px-3 sm:py-2 shadow-md hover:bg-gray-200 dark:hover:bg-gray-700 mb-4 sm:mb-0">
              <a
                href="https://qlever.cs.uni-freiburg.de/wikidata"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center"
              >
                <div className="flex items-center justify-center h-10 sm:h-8 w-10 sm:w-8 mr-2">
                  <Zap className="text-[#82B36F] h-6 w-6" />
                </div>
                <div className="flex flex-col items-center sm:items-start text-center w-full">
                  <span className="text-xs sm:text-sm font-normal text-gray-800 dark:text-gray-200">Data queried</span>
                  <span className="text-xs sm:text-sm font-semibold font-montserrat text-gray-800 dark:text-white">
                    via QLever
                  </span>
                </div>
              </a>
            </div>
          </div>

          {/* Mobile Footer Options */}
          <div className="flex items-center justify-center md:hidden mt-6 space-x-[10px]">
            {/* Language Selector */}
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowLanguageSelector(true)}
              className="flex items-center space-x-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
            >
              <Globe className="h-4 w-4" />
            </Button>

            {/* Dark/Light Mode Toggle */}
            <Button
              variant="outline"
              size="icon"
              onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700"
            >
              {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </Button>
          </div>
        </div>
      </footer>

      <LanguageSelector
        isOpen={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
        currentLang={currentLang}
        onLanguageChange={onLanguageChange}
      />
    </>
  )
}
