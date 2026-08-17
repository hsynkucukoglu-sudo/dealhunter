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
      // 'siroop' staat hier en niet bij groente-fruit: "Sinaasappel- of
      // frambozensiroop" belandde op groente-fruit omdat 'sinaasappel' matcht.
      // Dranken wordt eerder gecontroleerd, dus dit wint.
      'siroop',
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
      // Ontbraken tot 2026-08-17: Aldi's eigen categorie zette Sperziebonen,
      // Paksoi en Spitskool onder "Aardappels, groente en fruit" terwijl onze
      // naamherkenning ze op 'overig' gooide. De rest hieronder zijn Nederlandse
      // basisgroenten uit dezelfde blinde vlek. Samengestelde koolnamen voluit,
      // want 'kool' als prefix vangt ook koolzuur/koolhydraten.
      // Enkelvoud én meervoud: het Nederlandse meervoud van -boon is -bonen met
      // één o, dus de prefix 'sperzieboon' vangt "Sperziebonen" juist NIET.
      'sperzieboon', 'sperziebonen', 'snijboon', 'snijbonen',
      'paksoi', 'spitskool', 'boerenkool', 'rodekool',
      'witlof', 'venkel', 'radijs', 'peultjes', 'doperwt',
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

// Nederlandse samenstellingen zijn HOOFD-FINAAL: het laatste deel zegt wát het
// product is, de rest is bepaling. "Frambozensiroop" is siroop (drank), geen
// framboos. Onze patronen zoeken een woordgrens aan het BEGIN, dus ze pakken
// juist de bepaling — daardoor stond siroop onder groente-fruit en boterhamworst
// onder zuivel.
//
// Deze lijst draait dat om voor kernwoorden die alleen als SAMENSTELLINGSDEEL
// voorkomen (vandaar de verplichte letter ervoor: een los "Siroop" wordt gewoon
// door de normale trefwoordscan afgehandeld).
//
// BEWUST WEGGELATEN — hier liegt het hoofd, gemeten op de live catalogus:
//   kaas   → "pindakaas" is broodbeleg, geen zuivel (6 producten)
//   pasta  → "tandpasta" is verzorging (5), "hazelnootpasta" is broodbeleg
//   taart  → "LEGO 40815 Verjaardagstaart" is speelgoed
//   koek   → "ontbijtkoek" hoort al bij bakkerij
//   melk   → "Nutrilon" is babyvoeding, geen zuivelschap
// Een blinde "laatste deel wint"-regel zou die vijf allemaal stukmaken.
const COMPOUND_HEADS = [
  ['dranken', ['siroop', 'limonade', 'koffie', 'thee', 'bier', 'drank']],
  ['zuivel', ['yoghurt', 'kwark', 'vla']],
  ['bakkerij', ['brood', 'broodje', 'stroop']],
  ['vlees-vis', ['worst', 'filet', 'spek', 'gehakt']],
  ['maaltijden', ['salade', 'saus', 'soep']],
  ['snacks', ['zoutjes']],
]

const COMPOUND_HEAD_PATTERNS = COMPOUND_HEADS.map(([id, heads]) => ({
  id,
  re: new RegExp(heads.map(h => `[a-z]${h}(?![a-z])`).join('|'), 'i'),
}))

export function categorize(name) {
  if (!name) return 'overig'
  // Hoofd van de samenstelling gaat vóór de bepaling.
  for (const cat of COMPOUND_HEAD_PATTERNS) {
    if (cat.re.test(name)) return cat.id
  }
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

  // Aldi (hierarchicalCategories.lvl0). Let op: Aldi schrijft het nét anders
  // dan Plus ("Aardappels, groente en fruit" vs "aardappelen, groente, fruit"),
  // dus beide varianten moeten hier staan.
  'aardappels, groente en fruit': 'groente-fruit',
  'vlees, vis en vega': 'vlees-vis',
  'zuivel, eieren en boter': 'zuivel',
  'brood, bakkerij en bakken': 'bakkerij',
  'bier, mixdranken, aperitieven en likeuren': 'dranken',
  'maaltijden en salades': 'maaltijden',
  'borrelhapjes': 'snacks',
  // Bewust NIET gemapt: "ALDI merken", "Speciaal assortiment",
  // "Winnaarsproducten", "Paasassortiment", "Diepvries", "Kaas en vleeswaren".
  // Dat zijn dwarsdoorsnedes, geen productcategorieën — "Blauwe kaas" staat
  // onder Winnaarsproducten en "Gegrilde beenham" onder Kaas en vleeswaren.
  // Ze blijven onvertaald zodat pickCategoryLabel doorloopt naar het volgende
  // label of terugvalt op de productnaam.
}

const VALID_IDS = new Set(CATEGORIES.map(c => c.id))

/**
 * Kiest uit een lijst marktlabels het eerste dat we kennen.
 *
 * Aldi levert lvl0 als array en de eerste is niet altijd de echte categorie:
 * "Blauwe kaas" komt binnen als ["Winnaarsproducten", "Kaas en vleeswaren"].
 * Daarom doorlopen we de hele lijst i.p.v. blind [0] te pakken.
 *
 * @param {string[]} labels
 * @returns {string|undefined} marktlabel dat normalizeCategory kan vertalen
 */
export function pickCategoryLabel(labels) {
  if (!Array.isArray(labels)) return undefined
  return labels.find(l => CATEGORY_LABEL_MAP[String(l || '').trim().toLowerCase()])
}

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
