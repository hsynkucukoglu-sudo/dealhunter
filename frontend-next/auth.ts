import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

// Not: build sırasında (Docker) env var'lar bulunmaz, bu yüzden burada throw etmiyoruz.
// Runtime'da (Railway) değerler mevcut; eksikse OAuth çağrısı başarısız olur.
export const { handlers, signIn, signOut, auth } = NextAuth({
  trustHost: true,
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? '',
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? '',
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
