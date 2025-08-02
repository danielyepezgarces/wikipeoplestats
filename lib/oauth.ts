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

export async function exchangeCodeForToken(
  oauth_token: string,
  oauth_token_secret: string,
  oauth_verifier: string,
): Promise<AccessToken> {
  const oauthClient = createOAuthClient()
  const requestData = {
    url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/token`,
    method: "POST",
    data: { oauth_token, oauth_verifier },
  }

  const authHeader = oauthClient.toHeader(
    oauthClient.authorize(requestData, { key: oauth_token, secret: oauth_token_secret }),
  )

  const response = await fetch(requestData.url, {
    method: "POST",
    headers: {
      ...authHeader,
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "WikiPeopleStats/1.0",
    },
  })

  if (!response.ok) {
    throw new Error(`Token exchange failed: ${await response.text()}`)
  }

  const text = await response.text()
  const params = new URLSearchParams(text)

  return {
    oauth_token: params.get("oauth_token") || "",
    oauth_token_secret: params.get("oauth_token_secret") || "",
  }
}

export async function getWikipediaUserInfo(oauth_token: string, oauth_token_secret: string): Promise<UserInfo> {
  const oauthClient = createOAuthClient()
  const requestData = {
    url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/identify`,
    method: "POST",
  }

  const authHeader = oauthClient.toHeader(
    oauthClient.authorize(requestData, { key: oauth_token, secret: oauth_token_secret }),
  )

  const response = await fetch(requestData.url, {
    method: "POST",
    headers: {
      ...authHeader,
      "User-Agent": "WikiPeopleStats/1.0",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get user info: ${await response.text()}`)
  }

  const jwtEncoded = await response.text()
  const jwt = require("jsonwebtoken")
  const decoded: any = jwt.decode(jwtEncoded)

  if (!decoded || !decoded.sub || !decoded.username) {
    throw new Error("Invalid user info received")
  }

  return {
    sub: decoded.sub,
    username: decoded.username,
    email: decoded.email || undefined,
    editcount: decoded.editcount || 0,
    registration: decoded.registration || undefined,
  }
}

export async function getAuthorizationUrl(
  originDomain: string,
): Promise<{ url: string; token: string; tokenSecret: string }> {
  const oauthClient = createOAuthClient()
  const requestData = {
    url: `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/request_token`,
    method: "POST",
    data: {
      oauth_callback: `https://${process.env.AUTH_DOMAIN || "localhost:3000"}/api/auth/callback?origin=${encodeURIComponent(originDomain)}`,
    },
  }

  const response = await fetch(requestData.url, {
    method: "POST",
    headers: {
      ...oauthClient.toHeader(oauthClient.authorize(requestData)),
      "Content-Type": "application/x-www-form-urlencoded",
      "User-Agent": "WikiPeopleStats/1.0",
    },
  })

  if (!response.ok) {
    throw new Error(`Failed to get request token: ${await response.text()}`)
  }

  const text = await response.text()
  const params = new URLSearchParams(text)
  const token = params.get("oauth_token")!
  const tokenSecret = params.get("oauth_token_secret")!

  const authUrl = `${WIKIMEDIA_OAUTH_URL}?title=Special:OAuth/authorize&oauth_token=${token}&oauth_consumer_key=${process.env.WIKIPEDIA_CLIENT_ID}`

  return { url: authUrl, token, tokenSecret }
}
