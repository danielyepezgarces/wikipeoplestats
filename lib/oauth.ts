import crypto from "crypto"

const oauth = require("oauth-1.0a")

const WIKIMEDIA_OAUTH_URL = "https://meta.wikimedia.org/w/index.php"

interface AccessToken {
  oauth_token: string
  oauth_token_secret: string
}

interface UserInfo {
  sub: string
  username: string
  email?: string
  editcount?: number
  registration?: string
}

function createOAuthClient() {
  return oauth({
    consumer: {
      key: process.env.WIKIPEDIA_CLIENT_ID || "",
      secret: process.env.WIKIPEDIA_CLIENT_SECRET || "",
    },
    signature_method: "HMAC-SHA1",
    hash_function(base_string: string, key: string) {
      return crypto.createHmac("sha1", key).update(base_string).digest("base64")
    },
  })
}

/**
 * Intercambia el código de autorización por un token de acceso
 */
export async function exchangeCodeForToken(
  oauth_token: string,
  oauth_token_secret: string,
  oauth_verifier: string,
): Promise<AccessToken | null> {
  const oauthClient = createOAuthClient()
  const requestData = {
    url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/token`,
    method: "POST",
    data: { oauth_token, oauth_verifier },
  }

  const authHeader = oauthClient.toHeader(
    oauthClient.authorize(requestData, { key: oauth_token, secret: oauth_token_secret }),
  )

  try {
    const response = await fetch(requestData.url, {
      method: "POST",
      headers: {
        ...authHeader,
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "WikiPeopleStats/1.0",
      },
    })

    if (!response.ok) {
      console.error("❌ Token exchange failed:", await response.text())
      return null
    }

    const text = await response.text()
    const params = new URLSearchParams(text)

    return {
      oauth_token: params.get("oauth_token") || "",
      oauth_token_secret: params.get("oauth_token_secret") || "",
    }
  } catch (error) {
    console.error("❌ Error in exchangeCodeForToken:", error)
    return null
  }
}

/**
 * Obtiene información del usuario de Wikipedia
 */
export async function getWikipediaUserInfo(oauth_token: string, oauth_token_secret: string): Promise<UserInfo | null> {
  const oauthClient = createOAuthClient()
  const requestData = {
    url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/identify`,
    method: "POST",
  }

  const authHeader = oauthClient.toHeader(
    oauthClient.authorize(requestData, { key: oauth_token, secret: oauth_token_secret }),
  )

  try {
    const response = await fetch(requestData.url, {
      method: "POST",
      headers: {
        ...authHeader,
        "User-Agent": "WikiPeopleStats/1.0",
      },
    })

    if (!response.ok) {
      console.error("❌ Failed to get user identity:", await response.text())
      return null
    }

    const jwtEncoded = await response.text()

    // Decodificar el JWT sin verificar (Wikipedia ya lo firmó)
    const payload = jwtEncoded.split(".")[1]
    const decoded = JSON.parse(Buffer.from(payload, "base64").toString())

    if (!decoded || !decoded.sub || !decoded.username) return null

    return {
      sub: decoded.sub,
      username: decoded.username,
      email: decoded.email || undefined,
      editcount: decoded.editcount || 0,
      registration: decoded.registration || undefined,
    }
  } catch (error) {
    console.error("❌ Error in getWikipediaUserInfo:", error)
    return null
  }
}

/**
 * Inicia el flujo de autenticación OAuth
 */
export async function initiateOAuthFlow(): Promise<{ authUrl: string; oauth_token_secret: string } | null> {
  const oauthClient = createOAuthClient()
  const requestData = {
    url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/initiate`,
    method: "POST",
    data: {
      oauth_callback: process.env.OAUTH_CALLBACK_URL || "https://auth.wikipeoplestats.org/api/auth/callback",
    },
  }

  try {
    const response = await fetch(requestData.url, {
      method: "POST",
      headers: {
        ...oauthClient.toHeader(oauthClient.authorize(requestData)),
        "Content-Type": "application/x-www-form-urlencoded",
        "User-Agent": "WikiPeopleStats/1.0",
      },
      body: new URLSearchParams(requestData.data).toString(),
    })

    if (!response.ok) {
      console.error("❌ OAuth initiation failed:", await response.text())
      return null
    }

    const text = await response.text()
    const params = new URLSearchParams(text)
    const oauth_token = params.get("oauth_token")
    const oauth_token_secret = params.get("oauth_token_secret")

    if (!oauth_token || !oauth_token_secret) {
      console.error("❌ Missing OAuth tokens in response")
      return null
    }

    const authUrl = `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/authorize&oauth_token=${oauth_token}&oauth_consumer_key=${process.env.WIKIPEDIA_CLIENT_ID}`

    return {
      authUrl,
      oauth_token_secret,
    }
  } catch (error) {
    console.error("❌ Error initiating OAuth flow:", error)
    return null
  }
}
