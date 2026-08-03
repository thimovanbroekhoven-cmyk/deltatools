# Celine Beaumont — Limited stock indicator + 2-pack bundle

Purchase module for the product page of the **Celine Beaumont — v2 (compacte header)**
theme (Shopify, Dawn-based). Recreates the "Beperkte voorraad. Wees snel!" reference —
in English, with an animated **red ping** — and adds a **2-pack bundle that is
pre-selected**, adding both chosen variants to the cart.

## What it does

- **Limited stock alert** — "Limited stock. Be quick!" with an animated red ping dot.
- **Single vs. 2-Pack options** — the 2-Pack card is pre-selected ("POPULAR").
- **Per-option dropdowns** — single shows 1 variant row, the bundle shows 2 rows,
  both seeded to the first available variant so 2 pieces are auto-selected.
- **Real add-to-cart** — adds both selected variants via `/cart/add.js` and opens the
  theme's cart drawer.
- **Urgency** — evergreen countdown (persisted per product) + "Only X left!".
- **Trust strip** — padlock + the store's enabled payment icons.

## Files

| Repo path | Theme path |
|---|---|
| `snippets/celine-limited-stock-bundle.liquid` | `snippets/celine-limited-stock-bundle.liquid` |
| `assets/celine-limited-stock-bundle.css` | `assets/celine-limited-stock-bundle.css` |
| `templates/product.json` | `templates/product.json` |

`product.json` swaps the native `price` / `variant_picker` / `quantity_selector` /
`buy_buttons` blocks for one `custom_liquid` block (`deal_bundle`) that renders the
snippet, so the page has a single, coherent purchase flow.

## Configuration

Edit the settings block at the top of the snippet:

- `bundle_discount_percent` (default **20**) — discount shown on the 2-pack.
- `stock_left` (default **7**), `timer_minutes` (default **15**) — urgency.
- Copy: `alert_text`, `bundle_label`, `popular_text`, `add_text`, etc.

> **Important — the discount is display-only.** The bundle price/"Save" badge is
> computed in the browser. Both variants are added to the cart at full price. To
> actually charge the lower 2-pack price at checkout, create a matching Shopify
> **automatic discount** (e.g. buy 2 → 20% off). Set `bundle_discount_percent` to 0
> to hide the saving until that discount is in place.

## Notes

- Removing `buy_buttons` also removes the native dynamic-checkout (Shop Pay / Apple
  Pay) buttons. Checkout still works via the cart drawer.
- Built and deployed to the unpublished theme `Celine Beaumont — v2 (compacte header)`
  (theme id `187533394248`).
