import type { EventStats, Participant, ApiEventResponse } from "@/types/events"

export async function fetchEventData(eventId: number): Promise<ApiEventResponse | null> {
  try {
    const response = await fetch(`https://api.wikipeoplestats.org/v1/events/${eventId}`, {
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "User-Agent": "WikiPeopleStats/1.0",
      },
      next: { revalidate: 1800 }, // Cache for 30 minutes
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data
  } catch (error) {
    console.error("Error fetching event data:", error)
    return null
  }
}

export async function fetchEventStats(wikiproject: string, eventId: number): Promise<EventStats | null> {
  try {
    const response = await fetch(`https://api.wikipeoplestats.org/v1/events/stats/${wikiproject}/${eventId}`, {
      headers: {
        "User-Agent": "WikiPeopleStats/1.0",
      },
      next: { revalidate: 3600 }, // Cache for 1 hour
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()

    if (data.error) {
      return null
    }

    return {
      totalPeople: data.totalPeople || 0,
      totalWomen: data.totalWomen || 0,
      totalMen: data.totalMen || 0,
      otherGenders: data.otherGenders || 0,
      totalContributions: data.totalContributions || 0,
      lastUpdated: data.lastUpdated || "N/A",
      cachedUntil: data.cachedUntil || "N/A",
    }
  } catch (error) {
    console.error("Error fetching event stats:", error)
    return null
  }
}

export async function fetchEventParticipants(eventId: number): Promise<Participant[]> {
  try {
    const allParticipants: Participant[] = []
    let lastParticipantId: string | null = null

    do {
      const params = new URLSearchParams({
        include_private: "false",
        limit: "20",
      })

      if (lastParticipantId) {
        params.set("last_participant_id", lastParticipantId)
      }

      const response = await fetch(
        `https://meta.wikimedia.org/w/rest.php/campaignevents/v0/event_registration/${eventId}/participants?${params}`,
        {
          headers: {
            "User-Agent": "WikiPeopleStats/1.0",
          },
          next: { revalidate: 1800 }, // Cache for 30 minutes
        },
      )

      if (!response.ok) {
        break
      }

      const participants = await response.json()

      if (!Array.isArray(participants) || participants.length === 0) {
        break
      }

      allParticipants.push(...participants)

      const lastParticipant = participants[participants.length - 1]
      lastParticipantId = lastParticipant?.participant_id || null
    } while (lastParticipantId && allParticipants.length % 20 === 0)

    return allParticipants.filter((p) => p.user_name)
  } catch (error) {
    console.error("Error fetching participants:", error)
    return []
  }
}

export async function purgeCache(wikiproject: string): Promise<boolean> {
  try {
    const response = await fetch(`https://api.wikipeoplestats.org/v1/stats/${wikiproject}?action=purge`, {
      method: "GET",
      headers: {
        "User-Agent": "WikiStatsPeople/1.0",
      },
    })

    return response.ok
  } catch (error) {
    console.error("Error purging cache:", error)
    return false
  }
}
