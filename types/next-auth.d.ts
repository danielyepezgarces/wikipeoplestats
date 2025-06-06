import "next-auth"

declare module "next-auth" {
  interface Session {
    accessToken?: string
    user: {
      wikiUsername?: string
      groups?: string[]
      rights?: string[]
      grants?: string[]
      editcount?: number
      registered?: string
    } & DefaultSession["user"]
  }

  interface JWT {
    accessToken?: string
    wikiUsername?: string
    groups?: string[]
    rights?: string[]
    grants?: string[]
    editcount?: number
    registered?: string
  }
}