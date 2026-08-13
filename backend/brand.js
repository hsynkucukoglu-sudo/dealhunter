// Merkherkenning is een whitelist, geen heuristiek.
//
// De oude fallback was `name.match(/^([A-Z][a-zA-Z]{2,})/)` — "het eerste woord
// met een hoofdletter is het merk". Daarmee werd elk bijvoeglijk naamwoord en
// elke productnaam een merk: /merk/gerookte ("gerookte zalm"), /merk/nectarines,
// /merk/pitloze, /merk/broccoli. Gemeten op de live API 2026-08-13: 427 merkslugs
// op 662 producten met een merkveld, waarvan de meerderheid geen merk was.
//
// De prijs van deze keuze is expliciet: een A-merk dat hier niet staat krijgt
// géén merkpagina meer. Dat is bewust — een gemist merk kost één pagina, een
// verzonnen merk kost vertrouwen (en /merk staat sinds 13-07-2026 onder verdenking
// bij de AdSense-afwijzing "laagwaardige content"). Nieuwe merken toevoegen is
// één regel; controleer eerst of het in de scrape-output daadwerkelijk voorkomt.
//
// Meerwoordsmerken staan gewoon in dezelfde lijst: er wordt op lengte gesorteerd
// zodat "Douwe Egberts" wint van een eventuele losse match en niet meer wordt
// afgekapt tot "Douwe" — dezelfde fout maakte van "Hertog Jan" het merk "Hertog"
// en van "Jil Sander" het merk "Jil".
const BRANDS = [
  // Schoonmaak & wasmiddel
  'Ariel', 'Persil', 'Robijn', 'Lenor', 'Bold', 'Dash', 'Dreft', 'Fairy', 'Omo',
  'Biotex', 'Glorix', 'Dettol', 'Sun', 'Finish', 'Andy', 'Cif', 'Ajax', 'Blue Wonder',
  'Swiffer', 'Vanish', 'Page', 'Zwitsal',
  // Verzorging
  'Nivea', 'Dove', 'Axe', 'Rexona', 'Vaseline', 'Gillette', 'Wilkinson', 'Sensodyne',
  'Colgate', 'Prodent', 'Aquafresh', 'Listerine', 'Oral-B', 'Head & Shoulders',
  'Pantene', 'Andrélon', 'Andrelon', 'Ambre Solaire', 'Gum', 'Always', 'Tampax',
  'Jil Sander', 'Hugo Boss', 'Calvin Klein',
  // Frisdrank, sap, water
  'Coca-Cola', 'Pepsi', 'Fanta', 'Sprite', 'Sisi', 'Royal Club', 'Schweppes',
  'Fernandes', 'Sourcy', 'Spa', 'Chocomel', 'Fristi', 'Dubbelfrisss', 'Appelsientje',
  'Coolbest', 'Innocent', 'Karvan Cévitam', 'Roosvicee', 'Raak', 'Crystal Clear',
  'Red Bull', 'Monster', 'Aquarius', 'Fuze Tea', 'Lipton', 'Pickwick',
  // Bier & wijn
  'Heineken', 'Amstel', 'Grolsch', 'Hertog Jan', 'Jupiler', 'Bavaria', 'Brand',
  'Leffe', 'Corona', 'Desperados', 'Tripel Karmeliet', 'Lowlander', 'Cornet',
  'Villa Cornaro',
  // Koffie & thee
  'Douwe Egberts', 'Nescafé', 'Senseo', 'Nespresso', 'Starbucks',
  // Zuivel
  'Campina', 'Melkunie', 'Arla', 'Optimel', 'Mona', 'Almhof', 'Danone', 'Activia',
  'Danio', 'Actimel', 'Alpro', 'Oatly', 'Beemster', 'Uniekaas', 'Old Amsterdam',
  'Philadelphia', 'President', 'Lurpak', 'Becel', 'Flora', 'Benecol', 'Friso',
  'Ehrmann', 'Salakis', 'Den Eelder',
  // Kruidenier
  'Knorr', 'Maggi', 'Conimex', 'Honig', 'Unox', 'Heinz', 'Calvé', 'Calve', 'Remia',
  'Hak', 'Bonduelle', 'Silvo', 'Verstegen', 'Bertolli', 'Grand Italia', 'De Cecco',
  'Grand’Italia', 'Zonnatura', 'Brinta', 'Quaker', 'Kellogg', 'Venz', 'Hero',
  // Snacks & zoet
  'Milka', 'Toblerone', 'Kinder', 'Ferrero', 'Haribo', 'Mentos', 'Tic Tac', 'Lay’s',
  'Lays', 'Pringles', 'Doritos', 'Duyvis', 'Wokkels', 'Bugles', 'Hamka’s', 'Chokotoff',
  'Verkade', 'Sultana', 'Bastogne', 'LU', 'Tuc', 'Oreo', 'Twix', 'Snickers', 'KitKat',
  'M&M’s', 'Tony’s Chocolonely', 'Ben & Jerry’s', 'Magnum', 'Cornetto', 'Ola', 'Calippo',
  // Diepvries & vlees/vega
  'Iglo', 'Mora', 'Mccain', 'McCain', 'Aviko', 'Dr. Oetker', 'Wagner', 'Vivera',
  'Quorn', 'Beyond Meat', 'Zespri', 'Bakker Bollebof',
  // Huisdier
  'Felix', 'Whiskas', 'Pedigree', 'Purina',
]

// Winkelnamen zijn geen merk: /merk/plus zou /supermarkt/plus dubbelen en Plus
// zet zijn eigen naam in het Brand-veld van de API (23 producten op 2026-08-13,
// plus varianten als "PLUS Kies & Mix" en "Biologisch PLUS" die promotielabels
// zijn, geen merken).
const STORE_NAMES = new Set([
  'plus', 'jumbo', 'albert heijn', 'ah', 'lidl', 'aldi', 'dirk', 'coop', 'vomar',
  'dekamarkt', 'hoogvliet', 'kruidvat', 'spar', 'nettorama', 'boni', 'poiesz',
])

function _escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

// Langste eerst: "Hertog Jan" moet winnen van "Hertog", "Red Bull" van "Red".
// De lookahead voorkomt dat een merk midden in een langer woord aanslaat
// ("Axe" in "Axel", "Page" in "Pagerank", "Brand" in "Brandnetel").
const BRAND_PATTERNS = [...BRANDS]
  .sort((a, b) => b.length - a.length)
  .map(b => ({ canonical: b, re: new RegExp(`^${_escapeRe(b)}(?![a-z0-9])`, 'i') }))

// Accepteert zowel een merkveld uit een API ("Pepsi," van Plus) als een hele
// productnaam ("Hertog Jan 0.0 Krat 24 flessen"); in beide gevallen telt alleen
// het begin. Geeft de canonieke schrijfwijze terug, zodat leestekens uit het
// bronveld niet meer in de URL belanden (/merk/pepsi, kwam daar vandaan).
function canonicalBrand(raw) {
  const s = (raw || '').trim()
  if (!s || STORE_NAMES.has(s.toLowerCase())) return null
  return BRAND_PATTERNS.find(b => b.re.test(s))?.canonical ?? null
}

function extractBrand(name) {
  return canonicalBrand(name)
}

export { BRANDS, canonicalBrand, extractBrand }
