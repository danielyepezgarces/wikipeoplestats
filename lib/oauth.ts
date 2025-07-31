// lib/oauth.ts
import OAuth from 'oauth-1.0a'
import crypto from 'crypto'
import axios from 'axios'

export class WikipediaOAuth {
  private oauth: OAuth
  private baseUrl = 'https://meta.wikimedia.org/w/rest.php/oauth'
  
  constructor() {
    this.oauth = new OAuth({
      consumer: {
        key: process.env.WIKIPEDIA_CLIENT_ID!,
        secret: process.env.WIKIPEDIA_CLIENT_SECRET!
      },
      signature_method: 'HMAC-SHA1',
      hash_function(base_string, key) {
        return crypto.createHmac('sha1', key).update(base_string).digest('base64')
      }
    })
  }
  
  // Obtener URL de autorización
  async getAuthorizationUrl(originDomain: string): Promise<{ url: string; token: string; tokenSecret: string }> {
    const requestData = {
      url: `${this.baseUrl}/request_token`,
      method: 'POST',
      data: {
        oauth_callback: `https://${process.env.AUTH_DOMAIN}/api/auth/callback?origin=${encodeURIComponent(originDomain)}`
      }
    }
    
    const response = await axios.post(requestData.url, new URLSearchParams(requestData.data), {
      headers: this.oauth.toHeader(this.oauth.authorize(requestData))
    })
    
    const params = new URLSearchParams(response.data)
    const token = params.get('oauth_token')!
    const tokenSecret = params.get('oauth_token_secret')!
    
    const authUrl = `${this.baseUrl}/authorize?oauth_token=${token}&oauth_consumer_key=${process.env.WIKIPEDIA_CLIENT_ID}`
    
    return { url: authUrl, token, tokenSecret }
  }
  
  // Obtener token de acceso
  async getAccessToken(requestToken: string, requestTokenSecret: string, verifier: string) {
    const requestData = {
      url: `${this.baseUrl}/access_token`,
      method: 'POST',
      data: {
        oauth_token: requestToken,
        oauth_verifier: verifier
      }
    }
    
    const token = {
      key: requestToken,
      secret: requestTokenSecret
    }
    
    const response = await axios.post(requestData.url, new URLSearchParams(requestData.data), {
      headers: this.oauth.toHeader(this.oauth.authorize(requestData, token))
    })
    
    const params = new URLSearchParams(response.data)
    return {
      token: params.get('oauth_token')!,
      tokenSecret: params.get('oauth_token_secret')!
    }
  }
  
  // Obtener información del usuario
  async getUserInfo(accessToken: string, accessTokenSecret: string) {
    const requestData = {
      url: 'https://meta.wikimedia.org/w/api.php',
      method: 'GET',
      data: {
        action: 'query',
        meta: 'userinfo',
        uiprop: 'blockinfo|groups|groupmemberships|implicitgroups|rights|options|editcount|ratelimits|email',
        format: 'json'
      }
    }
    
    const token = {
      key: accessToken,
      secret: accessTokenSecret
    }
    
    const response = await axios.get(requestData.url, {
      params: requestData.data,
      headers: this.oauth.toHeader(this.oauth.authorize(requestData, token))
    })
    
    return response.data.query.userinfo
  }
}
