# Developer Credit and Footer Design

## Intent

Give Omar visible, tasteful authorship credit in the header at every viewport and add a small finishing footer that makes the public birthday page feel complete.

## Approved approach

- Keep the existing logo/home link and language control.
- Place a compact `Developed by Omar` credit directly beneath the brand group. `Omar` links to `https://omarcode.dev/`, opens in a new tab, and uses safe external-link attributes.
- On mobile, keep the credit visible beneath the logo instead of hiding or squeezing it beside the language button.
- Add a centered footer after the birthday dashboard with a thin navy divider, copyright, a heart-led development credit, and a short celebration-focused tagline.
- Translate all new surrounding copy with the existing English/Dutch toggle while keeping `Omar` unchanged.

## Copy

- English header: `Developed by Omar`
- Dutch header: `Ontwikkeld door Omar`
- English footer: `© 2026 Birthday desk` and `Developed with ♥ by Omar · Every special day deserves a little celebration.`
- Dutch footer: `© 2026 Verjaardagskalender` and `Met ♥ ontwikkeld door Omar · Elke bijzondere dag verdient een klein feestje.`

## Constraints

- The portfolio URL is exactly `https://omarcode.dev/`.
- Header attribution must remain visible at mobile widths without crowding the language button.
- Preserve the existing birthday data, university logos, notifications, search, celebrations, and language behavior.
- Add no dependencies.
- Use semantic `footer` markup, visible keyboard focus, and decorative treatment for the heart.

## Approaches considered

1. **Credit below the brand group (selected):** keeps authorship close to the logo, remains visible on mobile, and preserves a separate language-control target.
2. Credit beside the language button: more compact vertically but crowds narrow headers and weakens the connection to the site brand.
3. Footer-only credit: visually simple but fails the explicit requirement for header branding.

## Verification

- Focused tests prove the exact URL, safe external-link attributes, semantic footer, English copy, and Dutch translation.
- Responsive browser checks at desktop and 390px mobile confirm the credit is visible, the language button remains usable, and no horizontal overflow appears.
