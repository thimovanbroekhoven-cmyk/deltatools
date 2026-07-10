---
name: meta-ads
description: Schrijf, beoordeel, test en schaal Meta (Facebook/Instagram) advertenties volgens de principes van Ben Heath (Heath Media, beheerder van 300M+ dollar aan ad spend). Gebruik wanneer de gebruiker Meta-, Facebook- of Instagram-advertenties wil schrijven of beoordelen, wil weten hoe te targeten, testen of opschalen, vraagt naar "learning limited", of "/meta-ads" typt.
---

# Meta Ads volgens Ben Heath

Deze skill is gedistilleerd uit 20 publieke YouTube-video's van Ben Heath (kanaal
`youtube.com/@BenHeath`, bureau Heath Media). De volledige transcripties staan in
`youtube-kennis/Ben Heath/` in deze repo — raadpleeg die map (grep/lees) voor extra
detail, exacte quotes of voorbeelden die hieronder niet genoemd worden. Verzin nooit
principes die niet in de transcripties staan.

## De testing-hiërarchie (grote dingen eerst)

De meest voorkomende fout: adverteerders testen kleine dingen (primary text, headline,
CTA-knop, achtergrondkleur) die zelden meer dan 10% verschil maken. Test in deze volgorde,
en ga pas naar de volgende stap als de vorige "genoeg" gevalideerd is:

1. **Offer** — niet alleen het product/de dienst, maar garanties, urgency/scarcity,
   kortingen, bundels. Een zwak aanbod wordt nooit gered door een goede campagne; een
   matige campagne overleeft wél op een sterk aanbod. Bij weinig/geen leads of sales is
   het bijna altijd een offer-probleem — fix dat eerst.
2. **Angle** — de reden waarom iemand zou kopen (resultaat, tijd besparen, status, angst/
   twijfel wegnemen, prijs/waarde). De meeste producten hebben meerdere angles; test één
   angle per advertentie, meng ze niet in dezelfde ad.
3. **Style** — het soort creative: UGC, influencer/partnership ads, founder-led video,
   demonstratie, klanttestimonial, animatie. Adverteerders blijven te vaak in hun
   comfortzone (bv. alleen statics) — juist de stap eruit levert de grootste winst op.
   Influencer/partnership-ads zijn het meest genegeerde maar krachtigste advies: hogere
   hook rate én hogere conversie omdat de aanbeveling gewicht heeft.
4. **Hook** — de eerste ~3 seconden van een video-ad. Bepaalt of iemand doorkijkt.
   Bereken hook rate zelf in Ads Manager als custom metric: *3-second video plays ÷
   impressions*. Krachtige techniek: zoek de ad met de beste hook rate (goede hook, matige
   resultaten) en de ad met de beste cost-per-result (zwakke hook, sterke rest van de
   video), en knip de beste hook op de beste "body" — dat combineert vaak tot de
   best presterende ad.
5. **Kleine variabelen** — pas hierna: primary text, headlines, CTA-knop, achtergrondkleur.

Verwacht dat de meeste tests falen — dat is normaal (denk als een VC: veel kleine bets,
de ene winnaar betaalt alle mislukkingen 100x terug). Geef een test genoeg tijd om door de
learning phase heen te komen voor je oordeelt; niet meteen killen bij een eerste dip.

## Scaling: twee geldige methodes

Kies op basis van persoonlijkheid — kan de gebruiker met rust blijven bij fluctuaties?

- **Optie 1 — automated rules (klein & vaak).** Voor wie geneigd is te tinkeren. Zet een
  automated rule: verhoog dagbudget met ~3% per dag zolang cost-per-result/ROAS over de
  laatste 7 dagen binnen doel blijft (gebruik géén langere periode dan 7-14 dagen, en zeker
  niet de maximale 37 maanden — dat vertroebelt recente underperformance). Zet er een
  spiegel-regel tegenover die budget met 3% verlaagt als resultaten verslechteren, met een
  buffer tussen de twee drempels.
- **Optie 2 — manueel (groot & minder vaak).** Voor wie kalm blijft bij schommelingen.
  Verdubbel budget bij lage bedragen (bv. €50→€100), wacht 5-10 dagen (afhankelijk van
  conversievolume), beoordeel, ga door. Verklein het percentage naarmate budget groeit
  (bv. €800→€1.000 is maar +20%) — Meta kan grote sprongen bij hoge bedragen slecht aan.
  Zo ontdek je je "scaling ceiling": het budgetniveau waarboven resultaten onder je
  doel-ROAS zakken.

**Nooit doen:** een identieke campagne dupliceren naast de originele (auction overlap,
Meta kan de impression-planning niet meer combineren) of budget in één keer 5-10x
verhogen (Meta's systeem kan de sprong niet bijbenen, je leert ook niets over je
scaling ceiling). Als resultaten meteen instorten bij het opschalen: de ads converteren
waarschijnlijk warm/hyper-responsief publiek prima, maar niet koud publiek op schaal —
de oplossing is een beter aanbod/betere creative, niet meer budget.

## Targeting: value rules i.p.v. handmatige beperking

Laat Meta breed/open targeten (dat presteert doorgaans beter dan smalle interesse-targeting),
maar stuur bij met **value rules**: verhoog/verlaag het bod voor een segment (leeftijd,
geslacht, locatie, device, plaatsing, conversie-locatie) waarvan jouw eigen data (CRM) laat
zien dat het meer/minder waard is over de klantlevensduur. Reden: Meta's attributievenster
(vaak max. 7 dagen) ziet geen lifetime value, refund rates, of lead→klant-conversie — dat
weet jij wél uit je CRM, dus vul dat aan. Wees je ervan bewust dat een value rule de
cost-per-result kan verhogen; dat is vaak een goede trade als het gewenste segment
substantieel waardevoller is.

## Learning phase & "learning limited"

Meta wil circa 50 resultaten per week op het geoptimaliseerde event om goed te leren;
minder kan (niet gegarandeerd) leiden tot de status "learning limited" — niet fataal, maar
suboptimaal. Fixes, in volgorde van voorkeur:
1. **Verbeter eerst de campagne** (offer/creative) i.p.v. blind meer geld erin te pompen —
   vooral als de ROAS nog niet winstgevend is.
2. **Consolideer** campagnes/ad sets tot minder, grotere eenheden zodat conversiedata
   samenkomt — vaak genoeg om learning limited helemaal te voorkomen.
3. Optimaliseer eventueel voor een event **hoger in de funnel** (bv. add-to-cart i.p.v.
   purchase) als 50/week op het einddoel structureel onrealistisch is — test dit, het is
   geen garantie.
4. **Stop met tinkeren**: wijzig een ad set niet vaker dan ~1x per week; batch nieuwe
   creatives in plaats van dagelijks toe te voegen. Elke significante wijziging reset de
   learning phase en verstoort Meta's impression-planning richting individuen.

## Kwaliteitskader voor bestaande campagnes: de 5 levels

Gebruik dit als checklist bij het beoordelen van een klant/eigen account:
- **Level 1** — hergebruikte tv/andere-platform ads, vage of ontbrekende CTA, hashtags in
  de tekst (nooit gebruiken op Meta). Duidelijk geen Meta-specifieke aanpak.
- **Level 2** — decente ads, maar de landingspagina is niet congruent (andere kleur/foto
  dan de ad, of een verwarrende catalogus-pagina i.p.v. een pagina over het geadverteerde
  product). Fix: gebruik dedicated landingspagina's per aanbod.
- **Level 3** — één sterke creative-stijl, weinig variatie, zwakke/vage CTA.
- **Level 4** — brede creative-mix (UGC + high-production + testimonials + creator-
  partnerships), maar nog één aanbod/CTA voor iedereen i.p.v. aanbod en landingspagina
  per klant-avatar/segment.
- **Level 5 (gold standard)** — grote variatie in formats én invalshoeken, elk segment
  krijgt een eigen boodschap + landingspagina, zelfs kostbare micro-demografische targeting
  waar het renderabel is.

## Algemeen terugkerend advies

- **Consolideer** campagnes/ad sets waar mogelijk — betere data, minder auction overlap,
  snellere beslissingen.
- Gebruik **dagbudgetten**, niet lifetime budgets — flexibeler om te schalen/aan te passen.
- **Ken je cijfers**: cost-per-result-doel, ROAS-doel, marges — zonder dat kun je geen
  goede scale/stop-beslissingen nemen.

## Werkwijze bij een opdracht

- **Advertentietekst schrijven** → vraag (of leid af) het aanbod, de garantie/urgency, de
  belangrijkste angle en het formaat. Schrijf hook en body als aparte, herbruikbare
  bouwstenen zodat ze later te recombineren zijn. Geen hashtags, wel een duidelijke CTA.
- **Bestaande campagne/ads beoordelen** → loop het 5-levels-kader langs (creative-variatie,
  landingspagina-congruentie, CTA, aanbod-per-segment) en de testing-hiërarchie (is het
  offer al gevalideerd voor er op stijl/hook getest wordt?).
- **Vraag over targeting** → leg value rules uit i.p.v. smalle interesse-targeting;
  vraag naar CRM-data over welk segment waardevoller is.
- **Vraag over opschalen** → vraag naar het huidige budget, resultaten, en of de gebruiker
  geneigd is te tinkeren; adviseer optie 1 (automated, klein/vaak) of optie 2
  (manueel, groot/minder vaak) op basis daarvan.
- **"Learning limited" of instabiele resultaten** → loop de fix-volgorde langs: eerst
  campagne verbeteren, dan consolideren, dan evt. hogere-in-de-funnel event, dan stoppen
  met tinkeren (wijzigingen batchen, max 1x/week).

Voor diepgaandere quotes, exacte voorbeelden of cijfers: grep/lees de bronbestanden in
`youtube-kennis/Ben Heath/`.
