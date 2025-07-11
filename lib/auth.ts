import { cookies } from 'next/headers'

export async function getCurrentUser() {
  const cookieStore = cookies()
  const cookie = cookieStore.getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join('; ')

  const authDomain = process.env.NEXT_PUBLIC_AUTH_DOMAIN || 'https://auth.wikipeoplestats.org'

  try {
    const res = await fetch(`${authDomain}/api/auth/verify`, {
      headers: {
        Cookie: cookie,
      },
      cache: 'no-store',
    })

    if (!res.ok) return null

    const data = await res.json()
    return data.user || null
  } catch (err) {
    console.error('[getCurrentUser] error', err)
    return null
  }
}
