import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import Credentials from 'next-auth/providers/credentials'
import { verifyTransferToken } from '@/lib/auth-transfer'

export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
      checks: ['state'], // disable PKCE — WebView drops pkce cookie across redirect
    }),
    Credentials({
      id: 'app-transfer',
      name: 'App Transfer',
      credentials: {
        transferToken: { label: 'Transfer Token', type: 'text' },
      },
      async authorize(credentials) {
        const token = credentials?.transferToken as string | undefined
        if (!token) return null
        const user = verifyTransferToken(token)
        if (!user) return null
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
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
