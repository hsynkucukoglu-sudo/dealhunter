import type { Metadata } from 'next'
import { ShoppingListProvider } from '@/context/ShoppingListContext'
import { LanguageProvider } from '@/context/LanguageContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'DealHunter — Beste Supermarkt Aanbiedingen Nederland',
  description: 'Vergelijk wekelijkse aanbiedingen van Albert Heijn, Jumbo, Lidl, Dirk en meer. Bespaar op boodschappen met de beste supermarktdeals.',
  keywords: 'supermarkt aanbiedingen, albert heijn bonus, jumbo deals, lidl folder, dirk aanbiedingen, besparen boodschappen',
  openGraph: {
    title: 'DealHunter — Beste Supermarkt Aanbiedingen',
    description: 'Vergelijk wekelijkse aanbiedingen van alle grote supermarkten.',
    url: 'https://dealhunter4u.nl',
    siteName: 'DealHunter',
    locale: 'nl_NL',
    type: 'website',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700;800&family=Playfair+Display:wght@700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" rel="stylesheet" />
      </head>
      <body>
        <LanguageProvider>
          <ShoppingListProvider>
            {children}
          </ShoppingListProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
