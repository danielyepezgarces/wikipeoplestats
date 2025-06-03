"use client"

import { useI18n } from "@/hooks/use-i18n"

export function NoticeBanner() {
  const { t } = useI18n()

  return (
    <div className="bg-blue-100 text-blue-900 dark:bg-blue-900 dark:text-blue-100 text-center py-4 px-4 sm:px-6 sm:py-3 shadow-md">
      <div className="flex items-center justify-start sm:justify-center space-x-3">
        <span className="text-lg sm:text-xl font-bold flex-shrink-0 ml-2">⚠️</span>
        <p className="text-sm sm:text-base font-medium text-left">{t("migration_db_notice")}</p>
      </div>
    </div>
  )
}
