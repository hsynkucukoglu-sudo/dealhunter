import { signIn } from '@/auth'
import { redirect } from 'next/navigation'
import { auth } from '@/auth'

export default async function LoginPage() {
  const session = await auth()
  if (session) redirect('/')

  return (
    <main style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#f8f8f8',
    }}>
      <div style={{
        background: '#fff',
        borderRadius: '16px',
        padding: '48px 40px',
        boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
        textAlign: 'center',
        maxWidth: '400px',
        width: '100%',
      }}>
        <div style={{ fontSize: '48px', marginBottom: '12px' }}>🛍️</div>
        <h1 style={{ fontSize: '24px', fontWeight: 800, marginBottom: '8px' }}>Inloggen</h1>
        <p style={{ color: '#666', marginBottom: '32px', fontSize: '15px' }}>
          Log in om persoonlijke dealwaarschuwingen in te stellen.
        </p>

        <form action={async () => {
          'use server'
          await signIn('google', { redirectTo: '/' })
        }}>
          <button
            type="submit"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              width: '100%',
              padding: '14px 24px',
              border: '1.5px solid #e0e0e0',
              borderRadius: '12px',
              background: '#fff',
              fontSize: '15px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'box-shadow 0.2s',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 48 48">
              <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/>
              <path fill="#FF3D00" d="m6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/>
              <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/>
              <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/>
            </svg>
            Doorgaan met Google
          </button>
        </form>

        <p style={{ marginTop: '24px', fontSize: '12px', color: '#999' }}>
          Door in te loggen ga je akkoord met ons{' '}
          <a href="/privacy" style={{ color: '#C41230' }}>privacybeleid</a>.
        </p>
      </div>
    </main>
  )
}
