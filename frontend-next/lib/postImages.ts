export interface CategoryStyle {
  emoji: string
  accent: string
  bg: string
}

export const CATEGORY_STYLE: Record<string, CategoryStyle> = {
  'Supermarkt gids': { emoji: '🏪', accent: '#00A0E2', bg: '#EBF7FD' },
  'Vergelijking':    { emoji: '⚖️', accent: '#E33D26', bg: '#FDF0EE' },
  'Bespaartips':     { emoji: '💰', accent: '#1B9E4B', bg: '#EBF7EF' },
  'Aanbiedingen':    { emoji: '🎯', accent: '#C41230', bg: '#FDF0EE' },
  'Categorie gids':  { emoji: '🛒', accent: '#8B5CF6', bg: '#F3EFFD' },
  'Over ons':        { emoji: '👋', accent: '#1A1A1A', bg: '#F0EBE5' },
}

export function getCategoryStyle(category: string): CategoryStyle {
  return CATEGORY_STYLE[category] ?? CATEGORY_STYLE['Supermarkt gids']
}
