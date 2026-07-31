# Cart & checkout optimalisatie — Celine Beaumont (theme v2)

Winkel: **Celine Beaumont Toronto** (celinebeaumont.com) · Shopify Basic · CAD
Theme: **Celine Beaumont — v2 (compacte header)** — `gid://shopify/OnlineStoreTheme/187533394248` (UNPUBLISHED / preview)
Datum: 2026-07-31

## 1. Vraag van de klant

> "Waarom staat de COMEBACK-korting onderaan automatisch aan? Maak de cart in orde.
> Veel klanten haken af in de winkelwagen of checkout, dit moet beter. Pas aan in v2."

## 2. Diagnose — waarom staat COMEBACK10 "aan"?

Het thema **forceert de korting niet**. In `snippets/cart-drawer.liquid` staat één blok dat
simpelweg *elke op de cart toegepaste korting* toont:

```liquid
{%- for discount in cart.cart_level_discount_applications -%}
  <li>{{ discount.title | escape }} (-{{ discount.total_allocated_amount | money }})</li>
{%- endfor -%}
```

- **COMEBACK10** is een kortings*code* (geen automatische korting), 10%, geldig voor `All customers`.
- Codes komen niet vanzelf in een cart. Hij zit in de sessie omdat er ooit via een
  `/discount/COMEBACK10`-link is binnengekomen of hij handmatig is toegepast tijdens testen.
  Shopify plakt de code dan aan de winkelmandsessie tot afrekenen of legen.
- **Een verse bezoeker ziet 'm dus normaal niet**, tenzij COMEBACK10 in een ad/e-maillink zit.

## 3. Het échte probleem (belangrijker dan de weergave)

COMEBACK10 staat op **niet-combineerbaar**:

```
combinesWith: { orderDiscounts: false, productDiscounts: false, shippingDiscounts: false }
```

De winkel heeft óók 3 automatische staffelkortingen — precies waar de progressiebalk in de cart
omheen is gebouwd:

| Aantal items | Automatische korting |
|---|---|
| 2 | 10% |
| 3 | 15% |
| 4+ | 20% |

Omdat COMEBACK10 niet combineert, **schakelt die code de staffel uit** zodra hij in de cart zit.
Een klant met COMEBACK10 die een 4e item toevoegt krijgt géén 20% maar blijft op 10% — precies de
belofte-die-niet-uitkomt bij het afrekenen die tot afhaken leidt.

## 4. Onderzoek — waarom klanten wél kopen in cart/checkout

- Gem. **~70%** cart-abandonment (mobiel ~80%). Grootste beïnvloedbare redenen: **onverwachte/
  onduidelijke kosten** (#1), gedwongen account, te lang/complex, geen totaal vooraf, te weinig
  vertrouwen, trage levering. — Baymard
- **Gratis-verzending-/progressiebalk verhoogt AOV 10–20%** (mits de belofte klopt). — Foursixty
- **Express/1-klik checkout** (Shop Pay, PayPal, Google Pay) = een van de grootste snelle winsten. — Growth Suite
- Transparantie + trust-signalen (retour, gratis verzending, betaal-iconen) behouden. — Social Intents

Bronnen:
- https://baymard.com/blog/ecommerce-checkout-usability-report-and-benchmark
- https://foursixty.com/blog/how-to-reduce-shopping-cart-abandonment/
- https://www.growthsuite.net/resources/shopify-upsell-cross-sell/cart-drawer-upsell
- https://www.socialintents.com/blog/how-to-reduce-cart-abandonment/

## 5. Doorgevoerd in v2 (2026-07-31)

**Express / accelerated checkout-knoppen geprobeerd en weer teruggedraaid.**

- Eerst een op zichzelf staand `{% form 'cart', cart %}` met
  `{{ content_for_additional_checkout_buttons }}` onder de checkout-knop toegevoegd
  (Shop Pay / Apple Pay / PayPal / Google Pay).
- Renderden correct, maar op mobiel gaven de vier volle gekleurde balken een rommelig,
  overladen beeld. Op verzoek van de eigenaar weer verwijderd — alleen de enkele
  **CHECK OUT**-knop + "Continue shopping"-link blijven over.
- `snippets/cart-drawer.liquid` staat nu byte-identiek aan het origineel
  (MD5 `a937d9b22564346ecfef7492472a66ee`, 42830 bytes). Geen Liquid-fouten.

> Leerpunt: `{% form 'cart' %}` moet het cart-object meekrijgen (`{% form 'cart', cart %}`),
> anders volgt "cart form must be given a cart".

> Preview-theme, dus niet live — veilig te testen via de theme-preview.

## 6. Openstaande beslissing (marge/marketing — aan de eigenaar)

De kortingsstrategie is bewust **niet** eenzijdig gewijzigd op winkelniveau. Kies een richting:

1. **Staffel = motor (aanbevolen).** COMEBACK10 reserveren voor win-back e-mails/ads en op
   *combineerbaar* zetten, zodat de 10/15/20%-ladder overal blijft kloppen.
2. **Vaste 10% voor iedereen.** COMEBACK10 als welkomstkorting houden en de staffel-progressiebalk
   uit de cart halen (voorkomt de misleidende belofte).
3. **Alles stapelbaar (tot 30%).** COMEBACK10 op combineerbaar zetten zodat code + staffel samen
   kunnen — hoogste korting, laagste marge.

## 7. Optionele vervolg-verbeteringen (op akkoord)

- Subtiel, ingeklapt kortingscode-veld in de cart (voor e-mail/ad-codes, zonder coupon-jagen uit te lokken).
- Verwijder-knopje naast een toegepaste korting.
- Doortrekken van dezelfde verbeteringen naar de live theme zodra v2 wordt gepubliceerd.
