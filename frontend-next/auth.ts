import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { OAuth2Client } from 'google-auth-library'

const googleOAuthClient = new OAuth2Client()

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
    }),
    Credentials({
      id: 'google-native',
      name: 'Google Native',
      credentials: {
        idToken: { label: 'ID Token', type: 'text' },
      },
      async authorize(credentials) {
        const idToken = credentials?.idToken as string | undefined
        if (!idToken) return null
        try {
          const ticket = await googleOAuthClient.verifyIdToken({
            idToken,
            audience: process.env.AUTH_GOOGLE_ID,
          })
          const payload = ticket.getPayload()
          if (!payload?.email) return null
          return {
            id: payload.sub!,
            name: payload.name ?? null,
            email: payload.email,
            image: payload.picture ?? null,
          }
        } catch {
          return null
        }
      },
    }),
  ],
  callbacks: {
    session({ session, token }) {
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
  },
  pages: {
    signIn: '/login',
  },
})
