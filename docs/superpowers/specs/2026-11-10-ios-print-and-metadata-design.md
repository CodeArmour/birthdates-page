# iOS Print and Site Metadata Design

## Intent

Make the public birthday calendar export reliably from iPhone browsers, keep the calendar on one portrait A4 page, and give the installed home-screen app the supplied birthday logo instead of a generated letter icon.

## Goals

- Keep all 62 approved birthdays on one A4 portrait page without overlaps or a blank second page.
- Preserve the current branded calendar design in English and Dutch.
- Keep the export action useful in Safari, Chrome on iOS, and installed home-screen mode.
- Add complete public-site metadata for the canonical URL `https://birthdates-page.vercel.app`.
- Use the supplied birthday calendar logo for browser, Apple touch, manifest, and social-preview branding.

## Non-goals

- Do not add a backend or server-side PDF generator.
- Do not add a PDF-generation dependency.
- Do not change birthday data or the interactive dashboard layout.
- Do not promise that iOS can always open its native print dialog programmatically when WebKit blocks `window.print()`.

## Constraints

- The project remains a frontend-only Next.js App Router application.
- Export continues to use browser printing and Save as PDF.
- The print result must remain one A4 portrait page.
- The existing QR code, institution logos, birthday logo, and Omar branding remain unchanged.

## Approaches considered

### Selected: resilient native print with an iOS fallback

Keep `window.print()` for browsers that support it. Replace the fragile dense-month CSS columns with a two-column grid, size the print sheet against the available printable page instead of forcing a second full A4 box inside it, and provide an iOS/standalone fallback message that tells the visitor to use Safari's Share menu and Print when automatic printing is blocked. This keeps the project dependency-free and matches the existing Save as PDF workflow.

### Rejected: client-side PDF library

This could bypass the native print dialog, but it would add a dependency, duplicate layout logic, increase the bundle, and work against the earlier no-new-dependency decision.

### Rejected: server-generated PDF

This would be the most controlled output, but it would add backend infrastructure and operational cost to a public static frontend.

## Implementation outline

1. Add focused failing tests for mobile-safe print CSS, the iOS fallback behavior, the manifest, and complete root metadata.
2. Change dense birthday lists to CSS Grid so January stays within its month card in WebKit.
3. Make the print sheet fill the browser's printable page and cap its dimensions so iOS margins do not create a blank second page.
4. Add a small bilingual export fallback notice for iPhone and standalone mode. The normal button still calls `window.print()` directly from the user gesture; the fallback explains Share -> Print if WebKit does nothing.
5. Add dedicated app icons at Apple touch, 192px, and 512px sizes from the supplied logo.
6. Add `manifest.ts`, canonical metadata, Apple web-app metadata, theme colors, Open Graph, Twitter card, robots, keywords, author/creator/publisher, and format-detection metadata.
7. Verify unit tests, lint, production build, generated metadata, desktop print PDF, and a mobile-constrained print PDF rendered back to images.

## Success criteria

- Automated tests prove the new export fallback and metadata contracts.
- The rendered print PDF has exactly one A4 portrait page.
- January remains two columns with no overlap into April.
- No birthday, QR code, logo, footer, or developer credit is clipped.
- The generated HTML advertises an Apple touch icon and manifest.
- The manifest advertises 192px and 512px icons and standalone display.

