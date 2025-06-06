import NextAuth from "next-auth"
import WikipediaProvider from "next-auth/providers/wikipedia"

const handler = NextAuth({
  providers: [
    WikipediaProvider({
      clientId: process.env.WIKIPEDIA_CLIENT_ID!,
      clientSecret: process.env.WIKIPEDIA_CLIENT_SECRET!,
    }),
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