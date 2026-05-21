import type { Metadata } from 'next'
import Script from 'next/script'
import { GoogleAnalytics } from '@next/third-parties/google'
import { ShoppingListProvider } from '@/context/ShoppingListContext'
import { LanguageProvider } from '@/context/LanguageContext'
import { CookieBanner } from '@/components/CookieBanner'
import { AdSenseScript } from '@/components/AdSenseScript'
import { FavoritesProvider } from '@/context/FavoritesContext'
import { PriceHistoryProvider } from '@/context/PriceHistoryContext'
import { SiteFooter } from '@/components/SiteFooter'
import { InstallPrompt } from '@/components/InstallPrompt'
import { SessionProvider } from 'next-auth/react'
import './globals.css'

export const metadata: Metadata = {
  metadataBase: new URL('https://www.dealhunter4u.nl'),
  title: 'DealHunter — Beste Supermarkt Aanbiedingen Nederland',
  description: 'Vergelijk wekelijkse aanbiedingen van Albert Heijn, Jumbo, Lidl, Dirk en meer. Bespaar op boodschappen met de beste supermarktdeals.',
  keywords: 'supermarkt aanbiedingen, albert heijn bonus, jumbo deals, lidl folder, dirk aanbiedingen, besparen boodschappen',
  other: { 'msvalidate.01': '10C38B79AA33FFA059F4EE4DC13FBC3C' },
  manifest: '/manifest.webmanifest',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'DealHunter',
  },
  openGraph: {
    title: 'DealHunter — Beste Supermarkt Aanbiedingen',
    description: 'Vergelijk wekelijkse aanbiedingen van alle grote supermarkten.',
    url: 'https://www.dealhunter4u.nl',
    siteName: 'DealHunter',
    locale: 'nl_NL',
    type: 'website',
  },
}

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'DealHunter',
  url: 'https://www.dealhunter4u.nl',
  logo: {
    '@type': 'ImageObject',
    url: 'https://www.dealhunter4u.nl/icon-512x512.png',
    width: 512,
    height: 512,
  },
  sameAs: ['https://www.dealhunter4u.nl'],
}


export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <meta name="msvalidate.01" content="10C38B79AA33FFA059F4EE4DC13FBC3C" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
        />
        <meta name="theme-color" content="#1A1A1A" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="apple-touch-icon" href="/icon-192x192.png" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@24,400,0..1,0&display=swap" rel="stylesheet" />
      </head>
      <body>
        <SessionProvider>
          <LanguageProvider>
            <PriceHistoryProvider>
            <FavoritesProvider>
              <ShoppingListProvider>
                {children}
                <SiteFooter />
                <CookieBanner />
                <AdSenseScript />
                <InstallPrompt />
              </ShoppingListProvider>
            </FavoritesProvider>
            </PriceHistoryProvider>
          </LanguageProvider>
        </SessionProvider>
      </body>
      <GoogleAnalytics gaId="G-Y253QH18ZH" />
      <Script
        id="clarity"
        strategy="afterInteractive"
        dangerouslySetInnerHTML={{
          __html: `(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);})(window,document,"clarity","script","wq9ux76fx9");`,
        }}
      />
    </html>
  )
}
