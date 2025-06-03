export interface Language {
  code: string
  name: string
  flag: string
  text_direction: "ltr" | "rtl"
}

export interface Wiki {
  code: string
  wiki: string
  creation_date: string
}

export const languages: Language[] = [
  { code: "en", name: "English", flag: "🇬🇧", text_direction: "ltr" },
  { code: "es", name: "Spanish", flag: "🇪🇸", text_direction: "ltr" },
  { code: "fr", name: "French", flag: "🇫🇷", text_direction: "ltr" },
  { code: "de", name: "German", flag: "🇩🇪", text_direction: "ltr" },
  { code: "it", name: "Italian", flag: "🇮🇹", text_direction: "ltr" },
  { code: "pt", name: "Portuguese", flag: "🇧🇷", text_direction: "ltr" },
  { code: "ru", name: "Russian", flag: "🇷🇺", text_direction: "ltr" },
  { code: "ja", name: "Japanese", flag: "🇯🇵", text_direction: "ltr" },
  { code: "zh", name: "Chinese", flag: "🇨🇳", text_direction: "ltr" },
  { code: "ar", name: "Arabic", flag: "🇸🇦", text_direction: "rtl" },
  // Add more languages as needed
]

export const wikis: Wiki[] = [
  { code: "en", wiki: "enwiki", creation_date: "2001-10-16" },
  { code: "es", wiki: "eswiki", creation_date: "2001-10-16" },
  { code: "fr", wiki: "frwiki", creation_date: "2001-10-16" },
  { code: "de", wiki: "dewiki", creation_date: "2001-10-16" },
  // Add more wikis as needed
]

export function getProject(domain: string): string {
  const parts = domain.split(".")

  if (parts.length < 3) {
    return "wikidatawiki"
  }

  const lang = parts[0]
  const projectType = parts[1]

  if (domain === "www.wikipeoplestats.org") {
    return "wikidatawiki"
  }

  const language = languages.find((l) => l.code === lang)
  if (language) {
    if (projectType === "wikipeoplestats") {
      return lang + "wiki"
    }
    if (projectType === "quote") {
      return lang + "wikiquote"
    }
    if (projectType === "source") {
      return lang + "wikisource"
    }
  }

  return "wikidatawiki"
}

export function getOriginalDomain(domain: string): string {
  if (domain === "www.wikipeoplestats.org") {
    return "www.wikidata.org"
  }

  const parts = domain.split(".")
  const lang = parts[0]
  const projectType = parts[1]

  if (projectType === "wikipeoplestats") {
    return `${lang}.wikipedia.org`
  } else if (projectType === "quote") {
    return `${lang}.wikiquote.org`
  } else if (projectType === "source") {
    return `${lang}.wikisource.org`
  }

  return "wikidata.org"
}

export function getLanguageByCode(code: string): Language | null {
  return languages.find((lang) => lang.code === code) || null
}
