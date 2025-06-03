"use client"

import { useState } from "react"
import Link from "next/link"
import {
  Moon,
  Sun,
  Globe,
  Menu,
  X,
  ChevronDown,
  Home,
  Users,
  Flag,
  Calendar,
  Book,
  User,
  BookOpen,
  UserPlus,
  GlobeIcon,
  Code,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { LanguageSelector } from "./language-selector"
import { useI18n } from "@/hooks/use-i18n"

interface HeaderProps {
  currentLang: string
  onLanguageChange: (lang: string) => void
}

export function Header({ currentLang, onLanguageChange }: HeaderProps) {
  const { theme, setTheme } = useTheme()
  const [showLanguageSelector, setShowLanguageSelector] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { t } = useI18n(currentLang)

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  return (
    <>
      <header className="sticky top-0 z-50 w-full bg-gray-100 dark:bg-gray-800 shadow-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center transition-transform transform hover:scale-105">
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

            {/* Desktop Menu */}
            <nav className="hidden md:flex space-x-4">
              <Link
                href="/search/genders"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-2"
              >
                {t("genders")}
              </Link>
              <Link
                href="#"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-2"
              >
                {t("countries")}
              </Link>
              <Link
                href="/search/users"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-2"
              >
                {t("users")}
              </Link>
              <Link
                href="/events"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-2"
              >
                {t("events")}
              </Link>

              <div className="relative group">
                <button className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-2">
                  {t("rankings")}
                </button>
                <ul className="absolute left-0 hidden group-hover:block bg-white dark:bg-gray-900 shadow-lg rounded-md border border-gray-200 dark:border-gray-700">
                  <li>
                    <Link
                      href="/rankings/wikis"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {t("ranking_wikis")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/rankings/users"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {t("ranking_users")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/rankings/countries"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {t("ranking_countries")}
                    </Link>
                  </li>
                </ul>
              </div>

              <div className="relative group">
                <button className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-2">
                  {t("compare")}
                </button>
                <ul className="absolute left-0 hidden group-hover:block bg-white dark:bg-gray-900 shadow-lg rounded-md border border-gray-200 dark:border-gray-700">
                  <li>
                    <Link
                      href="/compare/wikis"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {t("compare_wikis")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/compare/users"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {t("compare_users")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/compare/countries"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                    >
                      {t("compare_countries")}
                    </Link>
                  </li>
                </ul>
              </div>

              <a
                href="https://github.com/danielyepezgarces/wikipeoplestats"
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors py-2"
              >
                {t("source_code")}
              </a>
            </nav>

            <div className="flex items-center space-x-4">
              {/* Language Selector Button for Desktop */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLanguageSelector(true)}
                className="hidden md:flex items-center space-x-2 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-300 dark:border-gray-600"
              >
                <Globe className="h-4 w-4" />
              </Button>

              {/* Dark/Light Mode Toggle for Desktop */}
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                className="hidden md:flex p-2 rounded-full bg-gray-200 dark:bg-gray-700"
              >
                {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
              </Button>

              {/* Mobile Menu Button */}
              <Button variant="ghost" size="icon" onClick={toggleMobileMenu} className="md:hidden">
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Menu */}
          <div
            className={`md:hidden ${mobileMenuOpen ? "block" : "hidden"} transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 shadow-lg rounded-md`}
          >
            <div className="px-4 pt-4 pb-3 space-y-2">
              <Link
                href="/"
                className="block px-3 py-2 rounded-md text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
              >
                <Home className="mr-2 h-5 w-5" />
                {t("home")}
              </Link>
              <Link
                href="/search/genders"
                className="block px-3 py-2 rounded-md text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
              >
                <Users className="mr-2 h-5 w-5" />
                {t("genders")}
              </Link>
              <Link
                href="#"
                className="block px-3 py-2 rounded-md text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
              >
                <Flag className="mr-2 h-5 w-5" />
                {t("countries")}
              </Link>
              <Link
                href="/search/users"
                className="block px-3 py-2 rounded-md text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
              >
                <Users className="mr-2 h-5 w-5" />
                {t("users")}
              </Link>
              <Link
                href="/events"
                className="block px-3 py-2 rounded-md text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
              >
                <Calendar className="mr-2 h-5 w-5" />
                {t("events")}
              </Link>

              {/* Dropdown for Rankings */}
              <details className="relative">
                <summary className="flex items-center justify-between px-3 py-2 rounded-md text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="flex items-center">
                    <Book className="mr-2 h-5 w-5" />
                    {t("rankings")}
                  </span>
                  <ChevronDown className="h-5 w-5" />
                </summary>
                <ul className="bg-white dark:bg-gray-800 shadow-lg rounded-md">
                  <li>
                    <Link
                      href="/rankings/wikis"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Book className="mr-2 h-4 w-4" />
                      {t("ranking_wikis")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/rankings/users"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <User className="mr-2 h-4 w-4" />
                      {t("ranking_users")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/rankings/countries"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <Flag className="mr-2 h-4 w-4" />
                      {t("ranking_countries")}
                    </Link>
                  </li>
                </ul>
              </details>

              {/* Dropdown for Compare */}
              <details className="relative">
                <summary className="flex items-center justify-between px-3 py-2 rounded-md text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors cursor-pointer">
                  <span className="flex items-center">
                    <BookOpen className="mr-2 h-5 w-5" />
                    {t("compare")}
                  </span>
                  <ChevronDown className="h-5 w-5" />
                </summary>
                <ul className="bg-white dark:bg-gray-800 shadow-lg rounded-md">
                  <li>
                    <Link
                      href="/compare/wikis"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <BookOpen className="mr-2 h-4 w-4" />
                      {t("compare_wikis")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/compare/users"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <UserPlus className="mr-2 h-4 w-4" />
                      {t("compare_users")}
                    </Link>
                  </li>
                  <li>
                    <Link
                      href="/compare/countries"
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                    >
                      <GlobeIcon className="mr-2 h-4 w-4" />
                      {t("compare_countries")}
                    </Link>
                  </li>
                </ul>
              </details>

              <a
                href="https://github.com/danielyepezgarces/wikipeoplestats"
                target="_blank"
                rel="noopener noreferrer"
                className="block px-3 py-2 rounded-md text-lg font-medium text-gray-700 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center"
              >
                <Code className="mr-2 h-5 w-5" />
                {t("source_code")}
              </a>
            </div>
          </div>
        </div>
      </header>

      <LanguageSelector
        isOpen={showLanguageSelector}
        onClose={() => setShowLanguageSelector(false)}
        currentLang={currentLang}
        onLanguageChange={onLanguageChange}
      />
    </>
  )
}
