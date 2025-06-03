"use client"

import { useState } from "react"
import { X, Check } from "lucide-react"
import { Button } from "@/components/ui/button"
import { languages } from "@/lib/languages"

interface LanguageSelectorProps {
  isOpen: boolean
  onClose: () => void
  currentLang: string
  onLanguageChange: (lang: string) => void
}

export function LanguageSelector({ isOpen, onClose, currentLang, onLanguageChange }: LanguageSelectorProps) {
  const [globalUsage, setGlobalUsage] = useState(false)

  if (!isOpen) return null

  const handleLanguageSelect = (langCode: string) => {
    onLanguageChange(langCode)

    if (globalUsage) {
      // Set cookies for global usage
      document.cookie = `global_usage=true; path=/; max-age=${60 * 60 * 24 * 365}`
      document.cookie = `user_language=${langCode}; path=/; max-age=${60 * 60 * 24 * 365}`
    }

    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4 max-h-96 overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">Select Language</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <div className="mb-4">
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={globalUsage}
              onChange={(e) => setGlobalUsage(e.target.checked)}
              className="rounded"
            />
            <span className="text-sm text-gray-700 dark:text-gray-300">Use this language globally</span>
          </label>
        </div>

        <div className="space-y-2">
          {languages.map((lang) => (
            <button
              key={lang.code}
              onClick={() => handleLanguageSelect(lang.code)}
              className="w-full flex items-center justify-between p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center space-x-3">
                <span className="text-2xl">{lang.flag}</span>
                <span className="text-gray-900 dark:text-gray-100">{lang.name}</span>
              </div>
              {currentLang === lang.code && <Check className="h-5 w-5 text-green-500" />}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
