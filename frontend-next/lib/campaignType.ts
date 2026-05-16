export type CampaignType =
  | '1+1'
  | '2e-halve-prijs'
  | '3-halen-2-betalen'
  | 'combinatie'
  | 'tijdelijk'
  | 'hoge-korting'   // ≥40%
  | 'actie'
  | null

export interface CampaignInfo {
  type: CampaignType
  label: string
  color: string
  bg: string
}

const CAMPAIGN_RULES: Array<{
  type: Exclude<CampaignType, null>
  patterns: RegExp[]
  label: string
  color: string
  bg: string
}> = [
  {
    type: '1+1',
    patterns: [/1\s*\+\s*1/i, /1\s*plus\s*1/i, /buy\s*one\s*get\s*one/i, /bogo/i, /\bgratis\b.*\bex(tra)?\b/i],
    label: '1+1 Gratis',
    color: '#1B5E3B',
    bg: '#E8F5E9',
  },
  {
    type: '2e-halve-prijs',
    patterns: [/2e\s*(halve\s*prijs|helft|50%|gratis)/i, /tweede\s*(halve|gratis)/i, /half\s*price/i, /2de\s*(halve|gratis)/i],
    label: '2e Halve Prijs',
    color: '#1565C0',
    bg: '#E3F2FD',
  },
  {
    type: '3-halen-2-betalen',
    patterns: [/3\s*(halen|voor)\s*2/i, /3\s*halen.*2\s*betalen/i, /buy\s*3.*get\s*(1|one)\s*free/i],
    label: '3 Halen 2 Betalen',
    color: '#6A1B9A',
    bg: '#F3E5F5',
  },
  {
    type: 'combinatie',
    patterns: [/combinatie(voordeel)?/i, /combi\s*deal/i, /samen\s*goedkoper/i],
    label: 'Combinatievoordeel',
    color: '#E65100',
    bg: '#FFF3E0',
  },
  {
    type: 'tijdelijk',
    patterns: [/tijdelijk(\s*lager)?/i, /limited\s*time/i, /op\s*=\s*op/i],
    label: 'Tijdelijk Lager',
    color: '#00838F',
    bg: '#E0F7FA',
  },
  {
    type: 'actie',
    patterns: [/\bactie\b/i, /\bspecial\b/i, /\bpromo\b/i],
    label: 'Actie',
    color: '#C62828',
    bg: '#FFEBEE',
  },
]

export function detectCampaignType(
  name: string,
  discountPercent: number,
  storedType?: string | null,
): CampaignInfo {
  // Use stored campaignType from DB if available
  if (storedType) {
    const rule = CAMPAIGN_RULES.find(r => r.type === storedType)
    if (rule) return { type: rule.type, label: rule.label, color: rule.color, bg: rule.bg }
  }

  for (const rule of CAMPAIGN_RULES) {
    if (rule.patterns.some(re => re.test(name))) {
      return { type: rule.type, label: rule.label, color: rule.color, bg: rule.bg }
    }
  }

  if (discountPercent >= 40) {
    return {
      type: 'hoge-korting',
      label: `−${discountPercent}% Korting`,
      color: '#B71C1C',
      bg: '#FFEBEE',
    }
  }

  return { type: null, label: '', color: '', bg: '' }
}

export const CAMPAIGN_FILTERS: Array<{ type: CampaignType | 'all'; label: string; emoji: string }> = [
  { type: 'all', label: 'Alle acties', emoji: '🛒' },
  { type: '1+1', label: '1+1 Gratis', emoji: '🎁' },
  { type: '2e-halve-prijs', label: '2e Halve Prijs', emoji: '½' },
  { type: '3-halen-2-betalen', label: '3 Halen 2 Betalen', emoji: '3️⃣' },
  { type: 'hoge-korting', label: '≥40% Korting', emoji: '🔥' },
  { type: 'tijdelijk', label: 'Tijdelijk Lager', emoji: '⏱️' },
  { type: 'actie', label: 'Actie', emoji: '⚡' },
  { type: 'combinatie', label: 'Combinatie', emoji: '🤝' },
]
