export interface WikiEvent {
  id: number
  slug: string
  name: string
  event_image?: string
  start_date: string
  end_date: string
  location: string
  description: string
  wikis: string[]
  url: string
}

export interface EventStats {
  totalPeople: number
  totalWomen: number
  totalMen: number
  otherGenders: number
  totalContributions: number
  lastUpdated: string
  cachedUntil: string
}

export interface Participant {
  participant_id: string
  user_name: string
  user_page: {
    path: string
  }
  user_registered_at: string
}

export interface EventStatus {
  status: "not_started" | "in_progress" | "ended"
  countdownDate?: string
}
