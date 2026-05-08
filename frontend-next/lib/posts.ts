export interface BlogPost {
  slug: string
  title: string
  description: string
  date: string
  readTime: number
  category: string
  content: string
}

export const POSTS: BlogPost[] = [
  {
    slug: 'wie-is-dealhunter4u',
    title: 'Wie is DealHunter4U? Ons verhaal en onze missie',
    description: 'DealHunter4U vergelijkt elke dag de aanbiedingen van alle grote Nederlandse supermarkten. Ontdek waarom we dit bouwen en hoe het werkt.',
    date: '2026-05-08',
    readTime: 3,
    category: 'Over ons',
    content: `
<p class="lead">Elke week geven Nederlanders miljoenen euro's te veel uit aan boodschappen — simpelweg omdat ze niet weten welke supermarkt op dat moment de beste prijs heeft. Dat wilden wij veranderen.</p>

<h2>Hoe het begon</h2>
<p>DealHunter4U is ontstaan uit een eenvoudige frustratie: de folders vergelijken kost tijd, apps werken per supermarkt afzonderlijk, en de beste deal vind je pas als je ze allemaal naast elkaar zet. We dachten: dit kan beter.</p>
<p>We begonnen met het automatisch verzamelen van weekaanbiedingen van <strong>Albert Heijn, Jumbo, Lidl, Aldi en Dirk</strong>. Elke dag worden de prijzen opgehaald en vergeleken, zodat jij dat niet meer hoeft te doen.</p>

<h2>Wat we doen</h2>
<p>DealHunter4U haalt dagelijks de actuele aanbiedingen op van de grootste supermarkten in Nederland. We tonen:</p>
<ul>
  <li>Het <strong>kortingspercentage</strong> per product — zodat je in één oogopslag ziet hoe groot de aanbieding is</li>
  <li>De <strong>eenheidsprijs</strong> (prijs per 100g of per liter) — zodat grote en kleine verpakkingen eerlijk te vergelijken zijn</li>
  <li>Een <strong>prijsvergelijking</strong> voor populaire producten — wie is goedkoopst op dit moment?</li>
  <li>De <strong>top 5 beste deals</strong> van de week — de absolute uitschieters qua korting</li>
</ul>

<h2>Gratis, altijd</h2>
<p>DealHunter4U is en blijft gratis. We verdienen een kleine commissie als je via onze site naar een supermarkt doorklikt en een aankoop doet — zo houden we de service draaiende zonder kosten door te berekenen aan gebruikers.</p>

<h2>Onze belofte</h2>
<p>We laten je nooit voor de gek houden door nep-kortingen of misleidende vergelijkingen. Alle prijzen komen rechtstreeks van de supermarkten zelf. Als een "aanbieding" eigenlijk geen echte besparing is, laten we dat zien.</p>
<p>Heb je vragen of suggesties? Stuur ons een bericht via de <a href="/contact">contactpagina</a>. We lezen alles.</p>

<p><strong>Bespaar slim. Koop bewust. Dat is DealHunter4U.</strong></p>
    `.trim(),
  },
  {
    slug: '10-tips-goedkoper-boodschappen-doen-2026',
    title: '10 tips om goedkoper boodschappen te doen in 2026',
    description: 'Bespaar elke week tientallen euro\'s op je boodschappen met deze bewezen tips. Van 1+1 gratis acties tot het slim combineren van supermarktaanbiedingen.',
    date: '2026-05-07',
    readTime: 5,
    category: 'Bespaartips',
    content: `
<p class="lead">De gemiddelde Nederlander geeft ruim <strong>€4.200 per jaar</strong> uit aan boodschappen. Met een paar slimme gewoontes kun je daar makkelijk <strong>€500 tot €1.000</strong> per jaar op besparen — zonder in te leveren op kwaliteit.</p>

<h2>1. Vergelijk aanbiedingen vóór je naar de supermarkt gaat</h2>
<p>De grootste fout die mensen maken: ze gaan naar hun vaste supermarkt zonder te weten wat er in de aanbieding is. Albert Heijn, Jumbo, Lidl en Aldi hebben allemaal andere acties. Op <a href="https://www.dealhunter4u.nl">DealHunter4U</a> zie je in één oogopslag de beste deals van alle supermarkten.</p>

<h2>2. Gebruik 1+1 gratis acties strategisch</h2>
<p>Bij een <strong>1+1 gratis actie</strong> betaal je effectief 50% korting. Koop producten die lang houdbaar zijn (pasta, rijst, ingeblikte groenten, toiletartikelen) altijd dubbel als ze in de aanbieding zijn. Dit scheelt op jaarbasis tientallen euro's.</p>

<h2>3. Let op "2e halve prijs" — het is niet altijd voordelig</h2>
<p>Bij <strong>2e halve prijs</strong> betaal je voor twee producten 75% van de normale prijs per stuk. Dat is 25% korting — alleen interessant als je het product sowieso nodig hebt. Vergelijk altijd met de prijs bij een andere supermarkt.</p>

<h2>4. Koop A-merken alleen in de aanbieding</h2>
<p>Coca-Cola, Calvé, Unox — deze merken gaan regelmatig in de aanbieding met 30–50% korting. Koop ze nooit voor de volle prijs. Houd de weekaanbiedingen bij en sla in als de prijs klopt.</p>

<h2>5. Kies voor huismerken bij basisproducten</h2>
<p>Melk, eieren, pasta, rijst, bloem — bij basisproducten is het verschil tussen A-merk en huismerk minimaal. AH Basis, Jumbo Huismerk en Lidl-eigen merken zijn tot 40% goedkoper en hebben vergelijkbare kwaliteit.</p>

<h2>6. Shop op woensdag of donderdag</h2>
<p>De meeste supermarkten starten hun nieuwe weekaanbiedingen op <strong>woensdag</strong>. Dan is de voorraad nog compleet. Wacht je tot zaterdag of zondag, dan zijn populaire aanbiedingen vaak uitverkocht.</p>

<h2>7. Maak een boodschappenlijst — en houd je eraan</h2>
<p>Impulsaankopen kosten de gemiddelde Nederlander <strong>€25 per bezoek</strong> extra. Maak thuis een lijstje, koop alleen wat erop staat. Gebruik een app zoals onze <a href="https://www.dealhunter4u.nl">DealHunter boodschappenlijst</a> om deals direct toe te voegen.</p>

<h2>8. Let op de eenheidsprijs</h2>
<p>Een grote verpakking is niet altijd goedkoper per gram of milliliter. Vergelijk altijd de <strong>prijs per 100g of per liter</strong>. Op DealHunter4U zie je de eenheidsprijs automatisch naast elke deal.</p>

<h2>9. Combineer supermarkten</h2>
<p>Ga niet altijd naar één supermarkt. Koop vlees bij Lidl (vaak goedkoper), zuivel bij AH (bonus), en droge kruidenierswaren bij Aldi. Het klinkt als meer moeite, maar met de juiste planning scheelt het €15–30 per week.</p>

<h2>10. Meld je aan voor aanbiedingsmeldingen</h2>
<p>Wil je nooit een aanbieding missen? Zet pushmeldingen aan op <a href="https://www.dealhunter4u.nl">DealHunter4U</a>. Je krijgt automatisch een melding zodra er nieuwe deals zijn van jouw favoriete supermarkt.</p>

<h2>Conclusie</h2>
<p>Besparen op boodschappen hoeft geen kunst te zijn. Vergelijk aanbiedingen, koop in bulk tijdens acties en maak gebruik van tools zoals DealHunter4U om altijd de beste prijs te vinden. Kleine aanpassingen in je boodschappenroutine kunnen op jaarbasis honderden euro's schelen.</p>

<p><strong>Bekijk deze week de beste deals →</strong> <a href="https://www.dealhunter4u.nl">www.dealhunter4u.nl</a></p>
    `.trim(),
  },
  {
    slug: 'albert-heijn-vs-jumbo-vs-lidl-wie-is-goedkoper',
    title: 'Albert Heijn vs Jumbo vs Lidl: wie is goedkoper in 2026?',
    description: 'We vergelijken de wekelijkse aanbiedingen van de drie grootste supermarkten van Nederland. Wie wint op prijs, kwaliteit en aanbod?',
    date: '2026-05-05',
    readTime: 4,
    category: 'Vergelijking',
    content: `
<p class="lead">Albert Heijn, Jumbo en Lidl domineren samen meer dan <strong>60% van de Nederlandse supermarktmarkt</strong>. Maar welke is nu echt het goedkoopst? We zetten de aanbiedingen naast elkaar.</p>

<h2>Bonusprogramma's vergeleken</h2>
<p><strong>Albert Heijn Bonus</strong> biedt wekelijks tientallen producten met kortingen tot 50%. De AH-app toont persoonlijke aanbiedingen op basis van je koopgedrag — handig, maar je betaalt basisprijs als je de app niet gebruikt.</p>
<p><strong>Jumbo</strong> focust op "Altijd de laagste prijs"-garantie. Als je elders goedkoper vindt, vergoedt Jumbo het verschil. In de praktijk zijn hun weekaanbiedingen iets minder diep dan die van AH.</p>
<p><strong>Lidl</strong> heeft geen traditioneel loyaliteitsprogramma maar compenseert met structureel lage basisprijzen en sterke weekaanbiedingen op vers vlees en zuivel.</p>

<h2>Wie wint op verse producten?</h2>
<p>Lidl wint regelmatig bij verse producten: vlees, groenten en fruit zijn vaak 20–30% goedkoper dan bij AH of Jumbo. De kwaliteit is vergelijkbaar.</p>

<h2>Wie wint op huismerken?</h2>
<p>Aldi en Lidl hebben de goedkoopste huismerken. AH Basis is een goede middenweg. Jumbo Huismerk zit qua prijs dicht bij AH.</p>

<h2>Conclusie</h2>
<p>Voor de beste aanbiedingen van alle drie: gebruik <a href="https://www.dealhunter4u.nl">DealHunter4U</a> om elke week te zien welke supermarkt de beste deal heeft op jouw favoriete producten.</p>
    `.trim(),
  },
]

export function getPost(slug: string): BlogPost | undefined {
  return POSTS.find(p => p.slug === slug)
}

export function getAllPosts(): BlogPost[] {
  return [...POSTS].sort((a, b) => b.date.localeCompare(a.date))
}
