// Sıra önemli: daha spesifik kategoriler önce kontrol edilmeli
const CATEGORIES = [
  {
    id: 'verzorging',
    label: '🧴 Verzorging & Hygiëne',
    keywords: [
      'shampoo', 'conditioner', 'douchegel', 'douchecrème', 'badschuim', 'zeep',
      'deodorant', 'tandpasta', 'tandenborstel', 'mondwater', 'scheerschuim', 'scheergel',
      'scheermesje', 'bodylotion', 'handcrème', 'gezichtscrème', 'sunscreen', 'zonnebrand',
      'parfum', 'lippenstift', 'mascara', 'foundation', 'colgate', 'oral-b', 'dove',
      'nivea', 'head & shoulders', 'pantene', 'axe', 'rexona', 'always', 'tampax',
      'maandverband', 'scheerapparaat', 'gillette', 'wilkinson',
    ],
  },
  {
    id: 'huishouden',
    label: '🧹 Huishouden & Schoonmaak',
    keywords: [
      'wasmiddel', 'vaatwas', 'afwasmiddel', 'schoonmaakmiddel', 'bleek', 'ontvetter',
      'toiletpapier', 'toiletblok', 'keukenpapier', 'vuilniszak', 'aluminiumfolie', 'magnetronfolie',
      'wasverzachter', 'vlekverwijderaar', 'sponzen', 'schuurspons', 'dweil',
      'ariel', 'bold', 'fairy', 'domestos', 'dettol', 'mr. proper', 'ajax',
      'finish', 'dreft', 'robijn', 'lenor', 'omo',
    ],
  },
  {
    id: 'dranken',
    label: '🍺 Dranken',
    keywords: [
      'bier', 'heineken', 'amstel', 'grolsch', 'hertog jan', 'jupiler',
      'wijn', 'rosé', 'champagne', 'prosecco', 'cava', 'whisky', 'rum', 'wodka', 'gin',
      'frisdrank', 'coca-cola', 'cola light', 'cola zero', 'fanta', 'sprite', 'pepsi', '7up', 'limonade',
      'sap', 'jus d\'orange', 'smoothie', 'spa water', 'bruis', 'tonic', 'ginger ale', 'ginger beer',
      'royal club', 'schweppes', 'fernandes', 'sourcy', 'bar le duc',
      'koffie', 'thee', 'cappuccino', 'espresso', 'nescafé', 'douwe egberts',
      'energy drink', 'red bull', 'monster energy', 'sportdrank', 'aquarius',
      'ijsthee', 'ijskoffie', 'frappuccino', 'starbucks', 'vruchtenwijn', 'cider',
    ],
  },
  {
    id: 'zuivel',
    label: '🥛 Zuivel & Eieren',
    keywords: [
      'melk', 'halfvolle', 'volle melk', 'magere melk', 'karnemelk',
      'boter', 'roomboter', 'lurpak', 'margarine', 'halvarine',
      'kaas', 'gouda', 'edam', 'mozzarella', 'brie', 'camembert', 'cheddar',
      'smeerkaas', 'roomkaas', 'hüttenkäse', 'cottage cheese',
      'yoghurt', 'kwark', 'skyr', 'kefir', 'vla', 'pudding', 'slagroom', 'room',
      'activia', 'danio', 'danone', 'actimel', 'alpro', 'oatly', 'melkunie', 'arla',
      'eieren', 'ei dozen', 'kippenei',
      'soja yoghurt', 'amandelmelk', 'havermelk', 'rijstmelk',
    ],
  },
  {
    id: 'vlees-vis',
    label: '🥩 Vlees, Vis & Vega',
    keywords: [
      'kip', 'kipfilet', 'kipdrumstick', 'kippenvleugel', 'kippenbout',
      'rundvlees', 'biefstuk', 'entrecote', 'gehakt', 'rundergehakt',
      'varkensvlees', 'varkenshaas', 'spek', 'ham', 'rookworst', 'worst', 'salami',
      'hamburger', 'schnitzel', 'kalkoen', 'lam', 'lamskotelet',
      'zalm', 'tonijn', 'kabeljauw', 'garnalen', 'makreel', 'haring', 'tilapia',
      'vissticks', 'zeevruchten',
      'vegan burger', 'vegetarisch', 'veggie', 'tofu', 'tempeh', 'quorn',
    ],
  },
  {
    id: 'maaltijden',
    label: '🍳 Maaltijden & Kant-en-klaar',
    keywords: [
      'pizza', 'lasagne', 'soep', 'saus', 'tomatensaus', 'pastasaus',
      'curry', 'nasi', 'bami', 'wokschotel', 'stamppot', 'ovenschotel',
      'wrap', 'tortilla', 'burrito', 'taco', 'sushi',
      'hummus', 'tzatziki', 'guacamole', 'dip', 'spread',
      'kant-en-klaar', 'diepvries', 'magnetronmaaltijd', 'ready meal',
      'pasta', 'spaghetti', 'penne', 'rijst', 'noodles', 'couscous',
      'unox', 'knorr', 'campbells', 'erwtensoep', 'tomatensoep', 'kippensoep',
    ],
  },
  {
    id: 'groente-fruit',
    label: '🥦 Groente & Fruit',
    keywords: [
      'appel', 'appels', 'peer', 'banaan', 'bananen', 'sinaasappel', 'citroen',
      'druiven', 'aardbeien', 'frambozen', 'bosbessen', 'mango', 'ananas',
      'meloen', 'watermeloen', 'kiwi', 'pruim', 'perzik', 'nectarine',
      'clementine', 'mandarijn', 'grapefruit', 'limoen', 'kersen',
      'tomaten', 'komkommer', 'komkommers', 'sla', 'ijsbergsla', 'andijvie',
      'spinazie', 'broccoli', 'bloemkool', 'wortel', 'wortelen',
      'courgette', 'aubergine', 'prei', 'selderij', 'asperge', 'spruitjes',
      'paddenstoel', 'champignon', 'avocado', 'paprika\'s', 'rucola', 'veldsla',
      'aardappelen', 'zoete aardappel', 'ui', 'uien', 'knoflook',
      'groentepakket', 'fruitmix', 'saladekruiden',
    ],
  },
  {
    id: 'bakkerij',
    label: '🥖 Bakkerij & Ontbijt',
    keywords: [
      'brood', 'volkoren', 'witbrood', 'baguette', 'ciabatta', 'focaccia',
      'croissant', 'afbakbrood', 'boterkoek', 'ontbijtkoek', 'beschuit', 'knäckebröd',
      'muesli', 'granola', 'havermout', 'cornflakes', 'cereals', 'cruesli',
      'pindakaas', 'jam', 'hagelslag', 'speculoos', 'stroopwafel',
    ],
  },
  {
    id: 'snacks',
    label: '🍪 Snacks & Snoep',
    keywords: [
      'chips', 'paprikachips', 'popcorn', 'tortilla chips', 'noten', 'amandelen',
      'cashewnoten', 'pistache', 'pinda\'s', 'notenmix',
      'chocolade', 'chocoladereep', 'bonbon', 'truffels',
      'snoep', 'drop', 'lolly', 'gummies', 'marshmallow', 'karamel',
      'ijs', 'ijsje', 'magnum', 'cornetto', 'twix', 'm&m', 'snickers', 'kitkat',
      'haribo', 'mentos', 'tic tac', 'milka', 'toblerone',
      'koek', 'biscuit', 'crackers', 'wafels', 'muffin', 'cake',
    ],
  },
]

// Trefwoorden matchten eerder met een kale includes(), dus ook midden in een woord.
// "Kr(ui)dvat" viel daardoor onder uien en "(Sla)apknuffel" onder sla — 20 van de
// 107 Kruidvat-producten (pleisters, wattenschijfjes, een knuffel) stonden zo in
// groente-fruit. Alleen het BEGIN is nu een woordgrens, zodat Nederlandse
// samenstellingen blijven werken: 'appel' vangt nog appelmoes, 'kip' nog kipsaté.
//
// Deze korte woorden zijn óók het begin van iets heel anders (uitverkoop,
// slaapmutsje, lamp, hamster, ijzer, sappig) en moeten daarom heel staan.
const WHOLE_WORD_ONLY = new Set(['ui', 'sla', 'lam', 'ham', 'ijs', 'sap', 'axe'])

function toPattern(keyword) {
  const escaped = keyword.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return WHOLE_WORD_ONLY.has(keyword) ? `\\b${escaped}\\b` : `\\b${escaped}`
}

const CATEGORY_PATTERNS = CATEGORIES.map(cat => ({
  id: cat.id,
  re: new RegExp(cat.keywords.map(toPattern).join('|'), 'i'),
}))

export function categorize(name) {
  if (!name) return 'overig'
  for (const cat of CATEGORY_PATTERNS) {
    if (cat.re.test(name)) return cat.id
  }
  return 'overig'
}

// Marktspecifieke categorielabels → eigen slugs.
//
// Plus stuurt zijn eigen Nederlandse labels mee ("Aardappelen, groente, fruit").
// Die matchen nergens op de site, waardoor alle 133 Plus-producten buiten elk
// categoriefilter en elke /categorie/*-pagina vielen (gemeten op de live API,
// 2026-08-13: 17 groente-aanbiedingen onvindbaar).
//
// Dubbelzinnige Plus-labels staan hier bewust NIET in: "Kaas, vleeswaren, tapas"
// en "Diepvries" bevatten producten uit meerdere site-categorieën, die zijn per
// product beter via de naam te bepalen. "Wonen, bloemen, service" staat er wél
// in — als overig — omdat de naam daar juist misleidt ("fruitboxen" → fruit).
const CATEGORY_LABEL_MAP = {
  // Plus (plus.nl/aanbiedingen)
  'aardappelen, groente, fruit': 'groente-fruit',
  'zuivel, eieren, boter': 'zuivel',
  'vlees, kip, vis, vega': 'vlees-vis',
  'brood, gebak, bakproducten': 'bakkerij',
  'ontbijtgranen, broodbeleg, tussendoor': 'bakkerij',
  'snoep, koek, chocolade, chips, noten': 'snacks',
  'frisdrank, sappen, koffie, thee': 'dranken',
  'wijn, bier, sterke drank': 'dranken',
  'soepen, conserven, sauzen, smaakmakers': 'maaltijden',
  'pasta, rijst, internationale keuken': 'maaltijden',
  'verse kant-en-klaarmaaltijden': 'maaltijden',
  'baby, drogisterij': 'verzorging',
  'huishouden': 'huishouden',
  'wonen, bloemen, service': 'overig',
}

const VALID_IDS = new Set(CATEGORIES.map(c => c.id))

// Scrapers leveren drie soorten categorie: een geldige site-slug, een
// marktspecifiek label, of niets. Alleen de eerste is direct bruikbaar.
export function normalizeCategory(rawCategory, name) {
  const raw = (rawCategory || '').trim().toLowerCase()
  if (VALID_IDS.has(raw)) return raw
  return CATEGORY_LABEL_MAP[raw] || categorize(name)
}

export const CATEGORY_LIST = [
  { id: 'all', label: '⚡ Alles' },
  ...CATEGORIES,
  { id: 'overig', label: '📦 Overig' },
]
