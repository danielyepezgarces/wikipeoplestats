import crypto from "crypto"

interface TokenResponse {
  access_token: string
  token_type: string
  expires_in: number
}

interface UserInfo {
  sub: string
  username: string
  email?: string
  avatar_url?: string
  registration_date?: string
}

export class OAuthService {
  private static readonly CLIENT_ID = process.env.OAUTH_CLIENT_ID!
  private static readonly CLIENT_SECRET = process.env.OAUTH_CLIENT_SECRET!
  private static readonly REDIRECT_URI = process.env.OAUTH_REDIRECT_URI!
  private static readonly AUTHORIZATION_URL = "https://meta.wikimedia.org/w/rest.php/oauth2/authorize"
  private static readonly TOKEN_URL = "https://meta.wikimedia.org/w/rest.php/oauth2/access_token"
  private static readonly USER_INFO_URL = "https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile"

  static generateAuthUrl(state?: string): string {
    const params = new URLSearchParams({
      response_type: "code",
      client_id: this.CLIENT_ID,
      redirect_uri: this.REDIRECT_URI,
      scope: "basic",
      state: state || crypto.randomBytes(16).toString("hex"),
    })

    return `${this.AUTHORIZATION_URL}?${params.toString()}`
  }

  static async exchangeCodeForToken(code: string): Promise<TokenResponse | null> {
    try {
      const response = await fetch(this.TOKEN_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          Accept: "application/json",
        },
        body: new URLSearchParams({
          grant_type: "authorization_code",
          client_id: this.CLIENT_ID,
          client_secret: this.CLIENT_SECRET,
          redirect_uri: this.REDIRECT_URI,
          code,
        }),
      })

      if (!response.ok) {
        console.error("Token exchange failed:", response.status, response.statusText)
        return null
      }

      return await response.json()
    } catch (error) {
      console.error("Error exchanging code for token:", error)
      return null
    }
  }

  static async getUserInfo(accessToken: string): Promise<UserInfo | null> {
    try {
      const response = await fetch(this.USER_INFO_URL, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          Accept: "application/json",
        },
      })

      if (!response.ok) {
        console.error("User info request failed:", response.status, response.statusText)
        return null
      }

      const data = await response.json()

      return {
        sub: data.sub,
        username: data.username,
        email: data.email,
        avatar_url: data.avatar_url,
        registration_date: data.registration_date,
      }
    } catch (error) {
      console.error("Error getting user info:", error)
      return null
    }
  }
}

// Exportar funciones individuales para compatibilidad
export async function exchangeCodeForToken(oauth_token: string, oauth_token_secret: string, oauth_verifier: string) {
  // Esta función mantiene compatibilidad con el sistema anterior
  // En el nuevo sistema OAuth2, solo necesitamos el código
  return OAuthService.exchangeCodeForToken(oauth_verifier)
}

export async function getWikipediaUserInfo(access_token: string, access_token_secret: string) {
  // Mantener compatibilidad con el sistema anterior
  return OAuthService.getUserInfo(access_token)
}
