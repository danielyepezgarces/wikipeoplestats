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
        params: { scope: "" }
      },
      token: "https://meta.wikimedia.org/w/rest.php/oauth2/access_token",
      userinfo: "https://meta.wikimedia.org/w/rest.php/oauth2/resource/profile",
      clientId: process.env.WIKIPEDIA_CLIENT_ID!,
      clientSecret: process.env.WIKIPEDIA_CLIENT_SECRET!,
      profile(profile) {
        return {
          id: profile.sub,
          name: profile.username,
          username: profile.username,
        }
      },
    })
  ],
  callbacks: {
    async jwt({ token, account, profile }) {
      if (account) {
        token.accessToken = account.access_token
        token.wikiUsername = profile?.username
      }
      return token
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken
      session.user.wikiUsername = token.wikiUsername
      return session
    },
  },
})

export { handler as GET, handler as POST }