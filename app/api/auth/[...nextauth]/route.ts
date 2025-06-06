import NextAuth from "next-auth"
import type { AuthOptions } from "next-auth"
import { OAuth } from "next-auth/providers"

const handler = NextAuth({
  providers: [
    OAuth({
      id: "wikipedia",
      name: "Wikipedia",
      type: "oauth",
      authorization: {
        url: "https://meta.wikimedia.org/w/rest.php/oauth2/authorize",
        params: {
          scope: ["basic", "editpage", "createeditmovepage"].join(" "),
          response_type: "code",
        }
      },
      token: {
        url: "https://meta.wikimedia.org/w/rest.php/oauth2/access_token",
        params: { grant_type: "authorization_code" }
      },
      userinfo: {
        url: "https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile",
        async request({ tokens, provider }) {
          const response = await fetch(provider.userinfo?.url as string, {
            headers: {
              Authorization: `Bearer ${tokens.access_token}`,
              "User-Agent": "WikiPeopleStats/1.0"
            }
          })
          const profile = await response.json()
          return profile
        }
      },
      clientId: process.env.WIKIPEDIA_CLIENT_ID!,
      clientSecret: process.env.WIKIPEDIA_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.username,
          username: profile.username,
          email: null,
          groups: profile.groups || [],
          rights: profile.rights || [],
          grants: profile.grants || [],
          editcount: profile.editcount || 0,
          confirmed_email: profile.confirmed_email || false,
          blocked: profile.blocked || false,
          registered: profile.registered || null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.wikiUsername = profile?.username
        token.groups = profile?.groups
        token.rights = profile?.rights
        token.grants = profile?.grants
        token.editcount = profile?.editcount
        token.registered = profile?.registered
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.user.wikiUsername = token.wikiUsername
      session.user.groups = token.groups
      session.user.rights = token.rights
      session.user.grants = token.grants
      session.user.editcount = token.editcount
      session.user.registered = token.registered
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  }
})

export { handler as GET, handler as POST }