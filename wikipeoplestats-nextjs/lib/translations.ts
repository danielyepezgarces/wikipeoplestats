export interface Translations {
  [key: string]: string
}

// English translations as fallback
export const enTranslations: Translations = {
  sitename: "WikiPeopleStats",
  site_description: "Statistics about people on Wikimedia projects",
  site_keywords: "wikipedia, statistics, gender, diversity",
  welcome_message: "Welcome to WikiPeopleStats",
  main_home_content: "Discover statistics about people on %s and other Wikimedia projects",
  total_people: "Total People",
  total_women: "Women",
  total_men: "Men",
  other_genders: "Other Genders",
  total_editors: "Total Editors",
  coming_soon_tracking_wiki: "Coming soon: tracking for this wiki",
  homepage_stats_credits: "Statistics from %s",
  cached_version_message: "Cached version. Updates in %s",
  purge_cache_button: "Purge Cache",
  cache_purged_successfully: "Cache purged successfully",
  cache_purge_failed: "Failed to purge cache",
  cache_update_message: "Cache will be updated soon",
  hours: "hours",
  minutes: "minutes",
  seconds: "seconds",
  project_wikidata: "Wikidata",
  project_wikipedia: "Wikipedia",
  project_wikiquote: "Wikiquote",
  project_wikisource: "Wikisource",
}

// Spanish translations
export const esTranslations: Translations = {
  sitename: "WikiPeopleStats",
  site_description: "Estadísticas sobre personas en proyectos de Wikimedia",
  site_keywords: "wikipedia, estadísticas, género, diversidad",
  welcome_message: "Bienvenido a WikiPeopleStats",
  main_home_content: "Descubre estadísticas sobre personas en %s y otros proyectos de Wikimedia",
  total_people: "Total de Personas",
  total_women: "Mujeres",
  total_men: "Hombres",
  other_genders: "Otros Géneros",
  total_editors: "Total de Editores",
  coming_soon_tracking_wiki: "Próximamente: seguimiento para esta wiki",
  homepage_stats_credits: "Estadísticas de %s",
  cached_version_message: "Versión en caché. Se actualiza en %s",
  purge_cache_button: "Limpiar Caché",
  cache_purged_successfully: "Caché limpiado exitosamente",
  cache_purge_failed: "Error al limpiar caché",
  cache_update_message: "El caché se actualizará pronto",
  hours: "horas",
  minutes: "minutos",
  seconds: "segundos",
  project_wikidata: "Wikidata",
  project_wikipedia: "Wikipedia",
  project_wikiquote: "Wikiquote",
  project_wikisource: "Wikisource",
}

export function getTranslations(langCode: string): Translations {
  switch (langCode) {
    case "es":
      return esTranslations
    case "en":
    default:
      return enTranslations
  }
}

export function translate(key: string, langCode: string, ...args: string[]): string {
  const translations = getTranslations(langCode)
  let translation = translations[key] || enTranslations[key] || key

  // Replace %s placeholders with arguments
  args.forEach((arg) => {
    translation = translation.replace("%s", arg)
  })

  return translation
}
