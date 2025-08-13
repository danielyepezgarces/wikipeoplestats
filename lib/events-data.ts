import type { WikiEvent } from "@/types/events"

export const events: WikiEvent[] = [
  {
    id: 1333,
    slug: "tiempo_feminista_para_editar_wikipedia",
    name: "Tiempo Feminista para Editar Wikipedia",
    event_image:
      "https://upload.wikimedia.org/wikipedia/commons/5/50/Banner_naranja_-_Gr%C3%A1fica_-_Tiempo_Feminista_2025_07.png",
    start_date: "2025-03-01",
    end_date: "2025-03-31",
    location: "Online",
    description: "Edit-a-thon focused on feminist topics",
    wikis: ["eswiki", "ptwiki", "wikidatawiki"],
    url: "https://feministeditathon.org",
  },
  {
    id: 1351,
    slug: "campana_mujeres_en_tiempos_de_guerra_2025",
    name: "Campaña mujeres en tiempos de guerra 2025",
    event_image:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7d/2025_Cabecera_campa%C3%B1a_mujeres_en_tiempos_de_guerra.png/950px-2025_Cabecera_campa%C3%B1a_mujeres_en_tiempos_de_guerra.png",
    start_date: "2025-03-14",
    end_date: "2025-03-31",
    location: "Online",
    description: "Annual gathering of Wikipedia contributors",
    wikis: ["astwiki", "cawiki", "eswiki", "glwiki", "wikidatawiki"],
    url: "https://wikiconference.org/2025",
  },
]

export function getEventBySlug(slug: string): WikiEvent | undefined {
  return events.find((event) => event.slug === slug)
}

export function getActiveEvents(wikiproject: string): WikiEvent[] {
  const currentDate = new Date().toISOString().split("T")[0]
  return events.filter(
    (event) => event.wikis.includes(wikiproject) && new Date(event.end_date) >= new Date(currentDate),
  )
}

export function getPastEvents(wikiproject: string): WikiEvent[] {
  const currentDate = new Date().toISOString().split("T")[0]
  return events.filter((event) => event.wikis.includes(wikiproject) && new Date(event.end_date) < new Date(currentDate))
}
