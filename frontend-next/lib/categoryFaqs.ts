export interface FAQ {
  question: string
  answer: string
}

export const CATEGORY_FAQS: Record<string, FAQ[]> = {
  'groente-fruit': [
    {
      question: 'Welke supermarkt heeft de goedkoopste groente en fruit aanbiedingen?',
      answer: 'Lidl en Aldi hebben doorgaans de scherpste prijzen op groente en fruit — gemiddeld 20-30% goedkoper dan Albert Heijn of Jumbo. Dirk van den Broek en Hoogvliet bieden ook wekelijks sterke verse aanbiedingen. Op DealHunter vergelijk je alle actuele groente & fruit aanbiedingen van alle supermarkten in één overzicht.',
    },
    {
      question: 'Wanneer zijn groente en fruit aanbiedingen het voordeligst?',
      answer: 'Groente en fruit aanbiedingen wisselen wekelijks: bij AH en Jumbo start de nieuwe week op woensdag, bij Lidl en Aldi op maandag, bij Dirk op zondag. Aan het einde van de week kun je soms extra korting vinden op producten die bijna over datum zijn. DealHunter werkt alle verse aanbiedingen dagelijks bij.',
    },
    {
      question: 'Zijn groente & fruit aanbiedingen ook biologisch?',
      answer: 'Ja, steeds meer supermarkten bieden biologische groente en fruit met korting aan. PLUS en Albert Heijn hebben een breed biologisch assortiment dat regelmatig in de weekaanbiedingen voorkomt. Op DealHunter kun je filteren op supermarkt om de biologische aanbiedingen snel te vinden.',
    },
  ],
  'zuivel': [
    {
      question: 'Welke supermarkt heeft de beste zuivel aanbiedingen?',
      answer: 'Albert Heijn, Jumbo en Lidl hebben wekelijks sterke zuivel aanbiedingen — denk aan 1+1 gratis op yoghurt, kaas of melk, of 2e halve prijs op boter en kwark. Aldi en Lidl bieden zuivel-huismerken aan die 15-25% goedkoper zijn dan A-merken. DealHunter vergelijkt alle zuivel aanbiedingen van de week.',
    },
    {
      question: 'Wanneer wisselen de zuivel aanbiedingen?',
      answer: 'De meeste zuivel weekaanbiedingen starten op woensdag (AH, Jumbo, Hoogvliet, Vomar, DekaMarkt) of maandag (Lidl, Aldi). Dirk begint op zondag. Via DealHunter zie je altijd de actuele zuivel deals van alle supermarkten tegelijk, met vervaldatum per aanbieding.',
    },
    {
      question: 'Zijn zuivel aanbiedingen ook voor lactosevrije producten?',
      answer: 'Ja, lactosevrije zuivelproducten zoals melk, yoghurt en kaas komen steeds vaker voor in weekaanbiedingen, met name bij Albert Heijn en PLUS. Het aanbod wisselt wekelijks. Op DealHunter zoek je snel op "lactosevrij" om actuele aanbiedingen te vinden.',
    },
  ],
  'vlees-vis': [
    {
      question: 'Welke supermarkt heeft de goedkoopste vlees aanbiedingen?',
      answer: 'Dirk van den Broek staat bekend als de goedkoopste voor vlees — de laagste vleesprijzen van alle grote Nederlandse supermarkten. Aldi en Lidl volgen met scherpe weekdeals op kipfilet, gehakt en varkenshaas. Op DealHunter vergelijk je alle actuele vlees aanbiedingen per supermarkt.',
    },
    {
      question: 'Wanneer zijn vis aanbiedingen het voordeligst?',
      answer: 'Vis aanbiedingen wisselen wekelijks bij alle supermarkten. Albert Heijn en Jumbo hebben regelmatig kortingen op zalmfilet, garnalen en kibbeling. Lidl biedt weekelijks verse vis aan. DealHunter toont alle actuele vis- en vleesaanbiedingen in één overzicht, inclusief kortingspercentage.',
    },
    {
      question: 'Is aangeboden vlees van goede kwaliteit?',
      answer: 'Ja, vlees in supermarktaanbiedingen heeft dezelfde kwaliteitsnormen als niet-aanbieding vlees. Wees wel alert op de houdbaarheidsdatum — producten in de aanbieding liggen soms dichter bij de THT-datum. Via DealHunter zie je de vervaldatum van aanbiedingen, zodat je goed geïnformeerd kunt kopen.',
    },
  ],
  'dranken': [
    {
      question: 'Welke supermarkt heeft de beste bier aanbiedingen?',
      answer: 'Dirk van den Broek heeft structureel de scherpste bier-aanbiedingen: Heineken, Grolsch en Jupiler 24-pack zijn bij Dirk gemiddeld €2-4 goedkoper dan bij AH of Jumbo. DekaMarkt heeft ook sterke bier combi-deals. DealHunter vergelijkt alle bier aanbiedingen van de week in één overzicht.',
    },
    {
      question: 'Zijn er ook aanbiedingen op frisdrank en water?',
      answer: 'Ja, frisdrank (Coca-Cola, Fanta, Pepsi) en bronwater staan wekelijks in de aanbieding bij meerdere supermarkten. AH en Jumbo bieden regelmatig 1+1 gratis of meerpakskorting aan. Bij Aldi en Lidl zijn huismerk frisdrankjes tot 50% goedkoper. DealHunter toont alle actuele dranken aanbiedingen dagelijks bijgewerkt.',
    },
    {
      question: 'Wanneer zijn dranken aanbiedingen het goedkoopst?',
      answer: 'Dranken aanbiedingen (bier, wijn, frisdrank) zijn vaak het goedkoopst in de zomer (barbecue-seizoen) en rond feestdagen (kerst, oud en nieuw). Wekelijks wisselen de deals bij alle supermarkten. DealHunter vergelijkt alle actuele dranken deals zodat je altijd het laagste krat-prijs vindt.',
    },
  ],
  'bakkerij': [
    {
      question: 'Welke supermarkt heeft de beste brood aanbiedingen?',
      answer: 'Albert Heijn, Jumbo en Dirk hebben wekelijks brood- en bakkerijproducten in de aanbieding. Lidl biedt vers brood en croissants soms tot 30% korting aan. DekaMarkt staat bekend om scherpe broodprijzen. Via DealHunter zie je alle actuele bakkerij aanbiedingen van alle supermarkten tegelijk.',
    },
    {
      question: 'Zijn er aanbiedingen op ontbijt- en bakproducten?',
      answer: 'Ja, ontbijtproducten (cornflakes, muesli, haverbrood) en bakproducten (bloem, suiker, gist) komen regelmatig voor in weekaanbiedingen. Vooral rond feestdagen (Pasen, kerst) zijn er extra acties op bakbenodigdheden. Op DealHunter filtreer je eenvoudig op de categorie "bakkerij" voor een compleet overzicht.',
    },
  ],
  'snacks': [
    {
      question: 'Welke supermarkt heeft de goedkoopste chips en snack aanbiedingen?',
      answer: 'Lidl en Aldi hebben de scherpste prijzen op chips en snacks door hun huismerken, die tot 40% goedkoper zijn dan Lay\'s of Pringles. AH en Jumbo bieden populaire A-merk chips regelmatig met 1+1 gratis of 2e halve prijs aan. DealHunter vergelijkt alle actuele snack aanbiedingen per supermarkt.',
    },
    {
      question: 'Zijn er aanbiedingen op gezonde snacks?',
      answer: 'Ja, noten, dried fruit, repen en rijstwafels staan regelmatig in de weekaanbiedingen bij AH, Jumbo en PLUS. Biologische snacks krijgen bij PLUS en DekaMarkt ook regelmatig korting. Gebruik DealHunter om te filteren op "snacks" voor een overzicht van alle actuele gezonde en gewone snack-deals.',
    },
  ],
  'maaltijden': [
    {
      question: 'Welke supermarkt heeft de beste maaltijd aanbiedingen?',
      answer: 'Albert Heijn, Jumbo en Lidl hebben wekelijks aanbiedingen op kant-en-klaarmaaltijden, sauzen en pasta. Lidl heeft scherpe weekdeals op Italiaanse en Aziatische maaltijden. AH-huismerk maaltijden staan regelmatig met 1+1 gratis of 30% korting in de bonus. DealHunter vergelijkt alle actuele maaltijden deals.',
    },
    {
      question: 'Zijn er aanbiedingen op pizza en diepvries maaltijden?',
      answer: 'Ja, diepvriesmaaltijden en pizza staan wekelijks in de aanbieding bij meerdere supermarkten. Lidl heeft scherpe prijzen op Dr. Oetker en eigen merk pizza. AH en Jumbo bieden 1+1 gratis op populaire maaltijden. DealHunter toont alle actuele pizza- en diepvries aanbiedingen in één overzicht.',
    },
  ],
  'verzorging': [
    {
      question: 'Welke winkel heeft de beste verzorging aanbiedingen?',
      answer: 'Kruidvat en Etos zijn de goedkoopste voor verzorgingsproducten — tot 50% korting op shampoo, douchegel, tandpasta en huidverzorging. Albert Heijn en Jumbo bieden ook regelmatig 1+1 gratis of 2e halve prijs op populaire merken zoals Dove, Head & Shoulders en Oral-B. DealHunter vergelijkt alle actuele verzorging aanbiedingen.',
    },
    {
      question: 'Zijn er aanbiedingen op zonnebrand en huidverzorging?',
      answer: 'Ja, zonnebrand en huidverzorging zijn in de zomer zeer regelmatig in de aanbieding bij Kruidvat, AH en Jumbo. Buiten de zomer zijn dagcrèmes, bodylotion en serum de populairste aanbiedingen. Op DealHunter vind je alle actuele huidverzorging deals inclusief kortingspercentage.',
    },
  ],
  'huishouden': [
    {
      question: 'Welke supermarkt heeft de beste huishoud aanbiedingen?',
      answer: 'Kruidvat, AH en Jumbo bieden wekelijks aanbiedingen op wasmiddel, afwasmiddel, schoonmaakmiddelen en keukenpapier. Lidl en Aldi hebben scherpe huismerk-alternatieven op vaatwastabletten en waspoeders die 30-50% goedkoper zijn dan Ariel of Dreft. DealHunter vergelijkt alle actuele huishoud aanbiedingen.',
    },
    {
      question: 'Zijn er aanbiedingen op wasmiddel en schoonmaakmiddelen?',
      answer: 'Ja, wasmiddel (Ariel, Robijn, Persil) en schoonmaakmiddelen (Dettol, Mr. Proper) staan regelmatig in de weekaanbiedingen bij AH, Jumbo en Kruidvat. Lidl en Aldi bieden krachtige huismerk-alternatieven aan tot 50% korting. Gebruik DealHunter om alle actuele wasmiddel- en schoonmaakdeals te vergelijken.',
    },
  ],
}
