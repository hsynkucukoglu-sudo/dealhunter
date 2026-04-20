const CATEGORIES = [
  {
    id: 'groente-fruit',
    label: '🥦 Groente & Fruit',
    keywords: [
      'appel', 'peer', 'banaan', 'sinaasappel', 'citroen', 'druif', 'aardbei', 'framboos',
      'bosbes', 'mango', 'ananas', 'meloen', 'watermeloen', 'kiwi', 'pruim', 'perzik',
      'tomaat', 'komkommer', 'paprika', 'ui', 'knoflook', 'sla', 'andijvie', 'spinazie',
      'broccoli', 'bloemkool', 'wortel', 'courgette', 'aubergine', 'prei', 'selderij',
      'aardappel', 'zoete aardappel', 'asperge', 'spruitje', 'paddenstoel', 'avocado',
      'limoen', 'grapefruit', 'kers', 'nectarine', 'clementine', 'mandarijn', 'passievrucht',
      'groente', 'fruit', 'salade', 'ijsbergsla', 'rucola', 'veldsla', 'pitloos',
    ],
  },
  {
    id: 'zuivel',
    label: '🥛 Zuivel & Eieren',
    keywords: [
      'melk', 'boter', 'kaas', 'yoghurt', 'kwark', 'room', 'slagroom', 'vla', 'pudding',
      'skyr', 'kefir', 'hüttenkäse', 'cottage', 'mozzarella', 'brie', 'camembert', 'gouda',
      'edam', 'roomkaas', 'smeerkaas', 'ei', 'eieren', 'alpro', 'soja', 'haver', 'amandelmelk',
      'oatly', 'melkunie', 'danone', 'activia', 'danio', 'actimel', 'lurpak', 'arla',
      'zuivel', 'drinkyoghurt', 'halfvolle', 'volle', 'magere',
    ],
  },
  {
    id: 'vlees-vis',
    label: '🥩 Vlees, Vis & Vega',
    keywords: [
      'kip', 'rundvlees', 'varken', 'gehakt', 'biefstuk', 'hamburger', 'worst', 'spek',
      'ham', 'kipfilet', 'drumstick', 'dij', 'vleugel', 'entrecote', 'lam', 'kalkoen',
      'zalm', 'tonijn', 'kabeljauw', 'garnaal', 'makreel', 'haring', 'tilapia', 'vis',
      'vegan', 'vegetarisch', 'veggie', 'tofu', 'tempeh', 'quorn', 'rookworst',
      'vlees', 'filet', 'schnitzel', 'burger',
    ],
  },
  {
    id: 'dranken',
    label: '🍺 Dranken',
    keywords: [
      'bier', 'wijn', 'rode wijn', 'witte wijn', 'rosé', 'champagne', 'prosecco', 'cava',
      'frisdrank', 'cola', 'fanta', 'sprite', 'sap', 'jus', 'smoothie', 'water', 'spa',
      'koffie', 'thee', 'cappuccino', 'latte', 'espresso', 'starbucks', 'nescafé',
      'energy', 'red bull', 'monster', 'sportdrank', 'limonade', 'siroop', 'ijsthee',
      'drank', 'ijskoffie', 'frappuccino', 'whisky', 'rum', 'wodka', 'gin', 'alcohol',
    ],
  },
  {
    id: 'bakkerij',
    label: '🥖 Bakkerij & Ontbijt',
    keywords: [
      'brood', 'broodje', 'baguette', 'ciabatta', 'croissant', 'muffin', 'cake', 'taart',
      'koek', 'biscuit', 'crackers', 'beschuit', 'knäckebröd', 'muesli', 'granola', 'havermout',
      'cornflakes', 'ontbijtkoek', 'stroopwafel', 'boterkoek', 'wafels', 'pannenkoek',
      'pindakaas', 'jam', 'hagelslag', 'pasta', 'rijst', 'noodles', 'couscous',
      'bakkerij', 'bloem', 'suiker',
    ],
  },
  {
    id: 'snacks',
    label: '🍪 Snacks & Snoep',
    keywords: [
      'chips', 'popcorn', 'noten', 'amandel', 'cashew', 'pistache', 'mix', 'pinda',
      'chocolade', 'choco', 'snoep', 'drop', 'lolly', 'gummy', 'marshmallow', 'karamel',
      'ijs', 'ijsje', 'magnum', 'cornetto', 'twix', 'm&m', 'snickers', 'kitkat',
      'haribo', 'mentos', 'tic tac', 'reep', 'bonbon', 'stroopwafel',
    ],
  },
  {
    id: 'maaltijden',
    label: '🍳 Maaltijden & Kant-en-klaar',
    keywords: [
      'pizza', 'pasta', 'lasagne', 'soep', 'saus', 'curry', 'nasi', 'bami', 'wok',
      'maaltijd', 'stamppot', 'ovenschotel', 'quiche', 'wrap', 'tortilla', 'burrito',
      'sushi', 'salade', 'hummus', 'spread', 'dip', 'tzatziki', 'guacamole',
      'kant-en-klaar', 'diepvries', 'magnetron', 'ready meal',
    ],
  },
  {
    id: 'verzorging',
    label: '🧴 Verzorging & Hygiëne',
    keywords: [
      'shampoo', 'conditioner', 'douche', 'zeep', 'douchegel', 'deodorant', 'tandpasta',
      'tandenborstel', 'scheerschuim', 'scheermesje', 'bodylotion', 'gezichtscrème',
      'sunscreen', 'zonnebrand', 'parfum', 'lippenstift', 'mascara', 'foundation',
      'colgate', 'oral-b', 'dove', 'nivea', 'head & shoulders', 'pantene', 'axe',
      'verzorging', 'hygiene', 'maandverband', 'scheergel',
    ],
  },
  {
    id: 'huishouden',
    label: '🧹 Huishouden & Schoonmaak',
    keywords: [
      'wasmiddel', 'vaatwas', 'afwasmiddel', 'schoonmaakmiddel', 'bleek', 'ontvetter',
      'toiletpapier', 'keukenpapier', 'vuilniszak', 'ziplock', 'folie', 'aluminiumfolie',
      'wc', 'wasverzachter', 'stof', 'dweil', 'borstel', 'sponzen', 'droogdoek',
      'ariel', 'bold', 'fairy', 'domestos', 'dettol', 'mr. proper', 'ajax',
      'huishouden', 'schoonmaak', 'reiniger',
    ],
  },
]

export function categorize(name) {
  if (!name) return 'overig'
  const lower = name.toLowerCase()
  for (const cat of CATEGORIES) {
    if (cat.keywords.some(kw => lower.includes(kw))) return cat.id
  }
  return 'overig'
}

export const CATEGORY_LIST = [
  { id: 'all', label: '⚡ Alles' },
  ...CATEGORIES,
  { id: 'overig', label: '📦 Overig' },
]
