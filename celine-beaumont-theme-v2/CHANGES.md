# Cart drawer — trust signals (Celine Beaumont, V2 theme)

Store: celinebeaumont.com · Theme: **"Celine Beaumont — v2 (compacte header)"** (unpublished)
Goal: answer the three questions that stall shoppers in the cart drawer — *when does
it ship, can I return it, is paying here safe* — and fix the bundle bar so it drives a
real second purchase instead of a duplicate.

All changes are **additive and reversible**, mobile-first, use existing theme classes
and brand tokens, add no new fonts/colours/libraries, and leave existing functionality
intact. Customer-facing copy is English. No arrival-date promises (shipping time only).

## Files changed

### `snippets/cart-drawer.liquid` (modified)
1. **Trust block above the black CHECK OUT button** (under the total line): three compact
   rows, one line each, icon on the left, no frames/accent colours —
   *Ships within 1–2 business days* (stopwatch icon), *Free shipping on every order*
   (truck), *30-day returns* (return arrow). Only rendered when the cart has items so the
   checkout button stays above the fold on mobile.
2. **Payment logos directly under the checkout button**: centred, small, greyed. Renders
   `shop.enabled_payment_types` with Shopify's own SVGs via Dawn's `list-payment` markup,
   so it mirrors exactly what's enabled in Settings → Payments (Visa, Mastercard, Amex,
   PayPal, Shop Pay, Apple Pay, Google Pay, …).
3. **Total line**: heading changed from "Estimated total" to **"Total"**, and the default
   Dawn tax/duty note ("Taxes and shipping calculated at checkout") was removed — the store
   charges no tax and ships free, so it had nothing to calculate. (Left as a documented
   comment so it can be restored if a tax is ever configured.)
4. **Bundle bar kept, "People also bought" carousel added**: the tiered-discount progress
   bar stays. Below the cart items sits a **horizontally scrollable row of up to 4 different**
   available products from the same collection (skipping anything already in the cart), each
   card with image, was/now price and an AJAX **Add +** button. Cards are ~60% wide so the
   next one peeks, inviting the swipe (like the icon-amsterdam reference). Uses the theme's
   existing `<product-form>` (product-form.js) which adds to cart and re-renders the drawer
   in place — no page reload, no new library. Renders nothing if no suitable products exist.
   (This replaced the earlier single-product suggestion.)
5. **Compare-at ("was") price on cart line items**: when a variant has a compare-at price
   higher than its selling price, the cart now shows the old price struck through next to
   the current price (reusing Dawn's `cart-item__discounted-prices` / `cart-item__old-price`
   classes), reminding the shopper the item is on sale. No effect on items without a
   compare-at price or on items already showing a promo discount.

### `assets/celine-cart-trust.css` (also updated)
6. **Reachable bottom on shorter screens**: with the extra footer content the fixed
   (non-scrolling) parts of the drawer could exceed a phone viewport and clip the bottom
   (checkout button / payment logos). Dawn already flips the whole drawer to scroll at
   `max-height: 650px`; the threshold is raised to `900px` so the bottom stays reachable
   on typical phones. Taller screens keep the pinned-footer layout.

### `assets/celine-cart-trust.css` (new)
Scoped styles for the three additions above, using existing `--celine-*` tokens and Dawn
color-scheme variables. Loaded from `cart-drawer.liquid`. Delete this file + its
`stylesheet_tag` to fully revert the styling.

## Notes
- Customer copy is inlined in English (store serves the Canada / English market). It can be
  moved to `locales/*.json` under `celine.cart.*` later if multi-language is introduced.
- The discount percentages shown by the bundle bar still depend on matching automatic
  discounts configured in Shopify Admin → Discounts (unchanged, pre-existing behaviour).
