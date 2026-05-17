import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DealHunter4U — Supermarkt Aanbiedingen',
    short_name: 'DealHunter',
    description: 'Vergelijk wekelijkse aanbiedingen van Albert Heijn, Jumbo, Lidl, Aldi en Dirk op één plek.',
    start_url: '/',
    display: 'standalone',
    background_color: '#F5EDE3',
    theme_color: '#1A1A1A',
    orientation: 'portrait-primary',
    lang: 'nl',
    categories: ['shopping', 'food'],
    icons: [
      {
        src: '/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'maskable',
      },
    ],
    shortcuts: [
      {
        name: 'Alle deals',
        url: '/deals',
        description: 'Bekijk alle actuele supermarktaanbiedingen',
      },
      {
        name: 'Albert Heijn',
        url: '/supermarkt/albert-heijn',
        description: 'Albert Heijn bonus aanbiedingen',
      },
      {
        name: 'Jumbo',
        url: '/supermarkt/jumbo',
        description: 'Jumbo weekaanbiedingen',
      },
    ],
    screenshots: [],
  }
}
