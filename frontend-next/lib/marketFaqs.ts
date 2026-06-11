export interface FAQ {
  question: string
  answer: string
}

export const MARKET_FAQS: Record<string, FAQ[]> = {
  'albert-heijn': [
    {
      question: 'Wanneer worden de AH Bonus aanbiedingen bijgewerkt?',
      answer: 'De Albert Heijn Bonus aanbiedingen wisselen elke woensdag. De nieuwe weekdeals zijn vanaf woensdag geldig en lopen tot en met dinsdag. Op DealHunter worden alle AH aanbiedingen dagelijks bijgewerkt, zodat je altijd de actuele Bonus deals ziet en maximaal kunt besparen op je boodschappen.',
    },
    {
      question: 'Is de Bonuskaart nodig voor AH aanbiedingen?',
      answer: 'Ja, voor de meeste Albert Heijn Bonus kortingen heb je een Bonuskaart nodig. Met de Bonuskaart profiteer je van acties zoals 1+1 gratis, 2e halve prijs en procentuele kortingen. De kaart is gratis aan te vragen via de AH-app of in de winkel. Zonder Bonuskaart betaal je de normale prijs.',
    },
    {
      question: 'Wat betekent "1+1 gratis" bij Albert Heijn?',
      answer: 'Bij een 1+1 gratis aanbieding bij Albert Heijn koop je twee producten en betaal je er slechts één. Dit is effectief 50% korting op twee stuks. Je hebt hiervoor wel een Bonuskaart nodig. Dit type aanbieding is een van de populairste manieren om goedkoop boodschappen te doen bij AH.',
    },
    {
      question: 'Hoe kan ik het meest besparen bij Albert Heijn?',
      answer: 'De beste manieren om te besparen bij Albert Heijn: combineer je Bonuskaart met de weekaanbiedingen, check de AH app voor extra digitale kortingen, let op 1+1 gratis en halve prijs deals, en koop huismerkproducten (AH Excellent, AH Basic). Via DealHunter zie je alle actuele AH Bonus deals overzichtelijk op één plek.',
    },
    {
      question: 'Hoe lang zijn AH Bonus aanbiedingen geldig?',
      answer: 'Albert Heijn Bonus aanbiedingen zijn doorgaans één week geldig – van woensdag tot en met dinsdag. Sommige acties lopen meerdere weken, en incidenteel zijn er ook dagaanbiedingen. DealHunter toont altijd de vervaldatum per aanbieding, zodat je nooit een deal mist.',
    },
  ],
  'jumbo': [
    {
      question: 'Wanneer beginnen de Jumbo weekaanbiedingen?',
      answer: 'Jumbo weekaanbiedingen starten elke woensdag en zijn geldig t/m dinsdag. Zo heeft Jumbo altijd verse, actuele deals. DealHunter werkt de Jumbo aanbiedingen wekelijks bij zodat je de beste weekdeals direct kunt vergelijken en besparen op je boodschappen.',
    },
    {
      question: 'Heeft Jumbo ook 1+1 gratis aanbiedingen?',
      answer: 'Ja, Jumbo biedt regelmatig 1+1 gratis acties aan op populaire producten zoals zuivel, vlees, dranken en verzorging. Daarnaast heeft Jumbo ook "2e halve prijs" deals en procentuele kortingen. Check de actuele Jumbo folder op DealHunter voor alle lopende 1+1 en andere weekdeals.',
    },
    {
      question: 'Hoe kan ik goedkoop boodschappen doen bij Jumbo?',
      answer: 'Slim besparen bij Jumbo doe je door: de weekaanbiedingen te combineren met de Jumbo klantenkaart, gebruik te maken van 1+1 gratis en halve prijs acties, producten uit het Jumbo huismerk te kiezen, en de online folder te checken vóór je naar de winkel gaat. DealHunter toont alle actuele Jumbo deals op één overzichtelijke pagina.',
    },
    {
      question: 'Heeft Jumbo een online folder of app?',
      answer: 'Ja, de Jumbo folder is online beschikbaar via de Jumbo website en de Jumbo app. Alle huidige Jumbo aanbiedingen zijn ook te vinden op DealHunter, inclusief vergelijking met andere supermarkten zoals Albert Heijn en Lidl – handig als je wil weten waar je het voordeligst kunt winkelen.',
    },
  ],
  'lidl': [
    {
      question: 'Wanneer wisselen de Lidl aanbiedingen?',
      answer: 'Lidl heeft twee wisselingsmomenten per week: maandag starten de nieuwe weekaanbiedingen en donderdag komen er verse "Vers van de Week" deals bij, voornamelijk op groente, fruit en vlees. DealHunter werkt de Lidl aanbiedingen wekelijks bij zodat je altijd de actuele folder en kortingen kunt bekijken.',
    },
    {
      question: 'Hoe kan ik extra goedkoop boodschappen doen bij Lidl?',
      answer: 'Besparen bij Lidl doe je door: de Lidl Plus app te gebruiken voor extra digitale kortingen en cashback, Lidl-huismerken te kiezen (vaak 20-40% goedkoper), de weekdeals te combineren met de "Vers van de Week" aanbiedingen, en vroeg in de week te shoppen voor het beste aanbod. Alle actuele Lidl kortingen vind je op DealHunter.',
    },
    {
      question: 'Heeft Lidl een loyaliteitsprogramma?',
      answer: 'Ja, Lidl heeft de Lidl Plus app. Hiermee ontvang je wekelijks extra kortingscoupons, cashback en speciale aanbiedingen die niet beschikbaar zijn voor andere klanten. De app is gratis te downloaden. Combineer de Lidl Plus voordelen met de weekaanbiedingen op DealHunter voor maximale besparing.',
    },
    {
      question: 'Is Lidl goedkoper dan Albert Heijn?',
      answer: 'Over het algemeen liggen de prijzen bij Lidl gemiddeld 15-25% lager dan bij Albert Heijn, met name voor huismerken en basisproducten. Lidl scoort goed op prijs-kwaliteitverhouding. Via DealHunter kun je de actuele aanbiedingen van Lidl en AH direct vergelijken en zo altijd de goedkoopste deal vinden.',
    },
    {
      question: 'Heeft Lidl een deal van de dag?',
      answer: 'Lidl biedt geen vaste "deal van de dag" zoals webshops, maar heeft wel dagelijks wisselende aanbiedingen. Nieuwe weekdeals starten op maandag en donderdag komen er verse "Vers van de Week" aanbiedingen bij op vlees, groente en fruit — die soms maar een paar dagen geldig zijn. Op DealHunter vind je elke dag de actuele Lidl deals overzichtelijk bij elkaar.',
    },
  ],
  'dirk': [
    {
      question: 'Wanneer beginnen de Dirk aanbiedingen?',
      answer: 'Dirk van den Broek aanbiedingen starten elke zondag en zijn geldig t/m zaterdag. Zo heb je elke week nieuwe deals op groente, fruit, vlees, dranken en meer. DealHunter werkt de Dirk acties wekelijks bij, zodat je altijd de meest actuele folder en kortingen kunt bekijken.',
    },
    {
      question: 'Is Dirk van den Broek een goedkope supermarkt?',
      answer: 'Ja, Dirk van den Broek staat bekend als een van de betaalbaardere supermarkten in Nederland. Met een scherpe prijsstelling op versproducten, dranken en huishoudproducten is Dirk een populaire keuze voor bewust besparen. Check de wekelijkse Dirk aanbiedingen op DealHunter voor de beste deals.',
    },
    {
      question: 'Heeft Dirk een klantenkaart of app?',
      answer: 'Dirk heeft een eigen app waarmee je de folder kunt bekijken, boodschappenlijstjes maakt en actuele aanbiedingen ziet. Er is geen traditionele spaarkaart, maar via de app ontvang je soms extra kortingen. Op DealHunter vind je alle actuele Dirk acties overzichtelijk gebundeld.',
    },
    {
      question: 'Wat zijn de beste deals bij Dirk van den Broek?',
      answer: 'Dirk biedt wekelijks scherpe kortingen op versproducten (groente, fruit, vlees), dranken en diepvries. Populaire acties zijn procentuele kortingen tot 50% en meerpaks voordelen. Vergelijk de huidige Dirk aanbiedingen op DealHunter en bespaar direct op je boodschappen.',
    },
    {
      question: 'Heeft Dirk van den Broek de laagste vleesprijzen?',
      answer: 'Ja, Dirk van den Broek staat bekend om structureel de laagste vleesprijzen van alle grote Nederlandse supermarkten. Met name rund-, varkens- en kipvlees zijn bij Dirk regelmatig goedkoper dan bij AH, Jumbo of Lidl. DealHunter vergelijkt wekelijks de vlees-aanbiedingen zodat je altijd de beste deal vindt.',
    },
  ],
  'aldi': [
    {
      question: 'Wanneer gaan de nieuwe Aldi aanbiedingen in?',
      answer: 'De Aldi weekaanbiedingen starten elke maandag en lopen t/m zondag. Aldi biedt zowel food als non-food aanbiedingen. Non-food deals (kleding, elektronica, tuin) zijn vaak een week geldig en op = op. DealHunter werkt de actuele Aldi kortingen wekelijks bij.',
    },
    {
      question: 'Is Aldi goedkoper dan andere supermarkten?',
      answer: 'Aldi behoort tot de goedkoopste supermarkten van Nederland. Door een slim concept met voornamelijk huismerken en een beperkt assortiment kan Aldi scherpe prijzen hanteren. Onderzoeken tonen aan dat Aldi gemiddeld 20-30% goedkoper is dan reguliere supermarkten. Bekijk de actuele Aldi acties op DealHunter.',
    },
    {
      question: 'Heeft Aldi een loyaliteitsprogramma of app?',
      answer: 'Aldi heeft de myALDI app, waarmee je de folder kunt bekijken, boodschappenlijsten aanmaakt en exclusieve aanbiedingen ontvangt. Er is geen traditioneel spaarsysteem, maar de app biedt soms extra digitale kortingen. Combineer de Aldi app met DealHunter voor een compleet overzicht van alle actuele Aldi aanbiedingen.',
    },
    {
      question: 'Wat zijn de populairste Aldi aanbiedingen?',
      answer: 'Populaire Aldi deals zijn weekaanbiedingen op groente en fruit (vaak 20-40% korting), vlees, zuivel en dranken. Aldi staat bekend om scherp geprijsde huismerken en verrassende non-food acties. Op DealHunter vind je alle actuele Aldi food-aanbiedingen inclusief kortingspercentages overzichtelijk weergegeven.',
    },
  ],
  'hoogvliet': [
    {
      question: 'Wanneer wisselen de Hoogvliet aanbiedingen?',
      answer: 'Hoogvliet aanbiedingen wisselen elke woensdag. De nieuwe weekdeals zijn van woensdag t/m dinsdag geldig. DealHunter werkt de Hoogvliet folder en aanbiedingen wekelijks bij zodat je altijd de actuele kortingen kunt bekijken en vergelijken.',
    },
    {
      question: 'Heeft Hoogvliet een klantenkaart?',
      answer: 'Ja, Hoogvliet heeft de Hoogvliet klantenkaart. Met deze kaart profiteer je van extra kortingen en spaarpunten bij geselecteerde aanbiedingen. De kaart is gratis aan te vragen. Combineer de klantenkaartvoordelen met de weekdeals op DealHunter voor maximale besparing bij Hoogvliet.',
    },
    {
      question: 'In welke regio\'s is Hoogvliet te vinden?',
      answer: 'Hoogvliet supermarkten zijn voornamelijk gevestigd in Zuid-Holland, Noord-Holland en Utrecht. De keten telt meer dan 70 filialen in de Randstad. Via de Hoogvliet-website kun je je dichtstbijzijnde winkel vinden. Op DealHunter vind je alle actuele Hoogvliet aanbiedingen, ongeacht welk filiaal je bezoekt.',
    },
  ],
  'vomar': [
    {
      question: 'Wanneer wisselen de Vomar aanbiedingen?',
      answer: 'Vomar aanbiedingen wisselen elke woensdag. De nieuwe weekdeals zijn geldig van woensdag t/m dinsdag. Vomar staat bekend om scherpe aanbiedingen op dagelijkse boodschappen. DealHunter werkt de actuele Vomar deals wekelijks bij.',
    },
    {
      question: 'Heeft Vomar een klantenkaart of spaarprogram?',
      answer: 'Vomar biedt een eigen spaarsysteem aan. Met de Vomar klantenkaart of app profiteer je van extra kortingen en eventuele spaaracties. Bekijk de meest actuele Vomar aanbiedingen en folder deals op DealHunter.',
    },
    {
      question: 'In welke regio\'s heeft Vomar winkels?',
      answer: 'Vomar heeft filialen voornamelijk in Noord-Holland en Flevoland. De keten staat bekend als een betaalbare supermarkt met een goed aanbod aan lokale producten. Alle actuele Vomar weekaanbiedingen en deals zijn te vinden op DealHunter.',
    },
  ],
  'dekamarkt': [
    {
      question: 'Wanneer worden DekaMarkt aanbiedingen bijgewerkt?',
      answer: 'DekaMarkt wisselt zijn weekaanbiedingen elke week. De actuele deals zijn te vinden op de aanbiedingenpagina van DekaMarkt. Op DealHunter worden alle DekaMarkt deals dagelijks bijgewerkt, zodat je altijd de nieuwste kortingen en acties in één overzicht ziet.',
    },
    {
      question: 'Wat voor soort aanbiedingen heeft DekaMarkt?',
      answer: 'DekaMarkt biedt wekelijkse acties op verse producten, kruidenierswaren, dranken en huishoudelijke artikelen. Populaire actietypes zijn kortingsacties (bijv. ACTIE! €4,99), combi-deals en 1+1 gratis aanbiedingen. De deals zijn zichtbaar op DealHunter zonder dat je door de folder hoeft te bladeren.',
    },
    {
      question: 'Heeft DekaMarkt een klantenkaart?',
      answer: 'Ja, DekaMarkt heeft een eigen loyaliteitsprogramma. Informeer bij je dichtstbijzijnde DekaMarkt filiaal of via de website voor de actuele spaarmogelijkheden en extra kortingen voor kaarthouders.',
    },
    {
      question: 'In welke regio\'s zijn DekaMarkt winkels te vinden?',
      answer: 'DekaMarkt heeft filialen verspreid door Nederland, met name in Noord-Holland, Utrecht en omstreken. De keten staat bekend om verse producten en een breed assortiment. Bekijk alle actuele DekaMarkt aanbiedingen en weekdeals op DealHunter.',
    },
    {
      question: 'Hoe bespaar ik het meest bij DekaMarkt?',
      answer: 'Bespaar bij DekaMarkt door wekelijks de actuele acties te checken op DealHunter, te profiteren van combi-aanbiedingen en verse producten in de aanbieding te kopen. Let ook op 1+1 gratis en ACTIE!-prijzen voor de grootste kortingen op je boodschappen.',
    },
  ],
}
