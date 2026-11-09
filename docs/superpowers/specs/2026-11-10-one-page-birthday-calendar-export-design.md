# One-Page Birthday Calendar Export Design

## Goal

Add a public, frontend-only export option that opens the browser print dialog and produces a polished birthday calendar containing every approved birthday on one portrait A4 page.

## Approved Visual Direction

- Use the supplied `Birthday Calendar.png` as the composition reference: a large celebratory title, a 3-by-4 month grid, playful birthday decoration, and a compact QR callout.
- Keep the existing Birthday Desk palette and visual identity: cream paper, navy, coral, gold, sky blue, and the current serif/sans-serif pairing.
- Do not copy the reference image into the product or recreate it pixel-for-pixel. Translate its hierarchy and density into the existing website design.
- Use real supplied assets for the birthday logo, University of Antwerp logo, Linguapolis logo, and QR code. Do not substitute placeholders, CSS drawings, emoji, or generated logos for those assets.

## Export Interaction

- Add an accessible header button labeled `Export PDF` in English and `PDF exporteren` in Dutch.
- Clicking the button calls `window.print()` from the user interaction and opens the browser's native print / Save as PDF dialog.
- Do not add a PDF library, server endpoint, download service, or backend.
- Keep the export action usable on mobile without hiding or crowding the existing `Developed by Omar` credit or language switch.

## Print Layout

- Print only the calendar; do not print the interactive dashboard, notifications, search, birthday cards, celebration dialog, or website footer.
- Use one portrait A4 page (`210mm × 297mm`) with print-safe margins and no page break.
- The page contains:
  - Birthday Desk logo and bilingual title/subtitle.
  - Twelve month cards in a 3-column × 4-row grid.
  - Every approved name and month/day from `BUILT_IN_BIRTHDAYS`, grouped by month and sorted by day while preserving source order for same-day birthdays.
  - Compact party decorations that do not obscure names.
  - Supplied QR image with bilingual scan copy.
  - University of Antwerp and Linguapolis branding.
  - A short bilingual positive footer line and `Developed with love by Omar` credit.
- Dense months may use two internal name columns. Names and dates must stay readable and must not overflow or be clipped.
- Apply exact print colors with `print-color-adjust` and avoid relying on animations or interactive state.

## Language

- The print page follows the current website language.
- English and Dutch title, subtitle, month names, QR copy, export button, and footer text live in the existing `copy.ts` translation source.
- Names and dates remain unchanged between languages; only month and supporting copy change.

## Data Contract

- The calendar consumes the same `BUILT_IN_BIRTHDAYS` array as the public dashboard. There is no second birthday dataset.
- Anna's approved birth date is March 5 (`2000-03-05`).
- The manually disambiguated public names are approved: `Maria.B`, `Maria.O`, `Ali.H`, and `Ali.R`.
- The existing placeholder year `2000` remains internal and must never be printed.

## Assets

- Copy `C:\Users\omars\Downloads\birthdates.png` to `public/branding/birthday-calendar-qr.png` without modifying its QR modules or cropping its quiet zone.
- Reuse:
  - `public/branding/birthday-calendar-logo.png`
  - `public/branding/linguapolis-logo.jpg`
  - `public/branding/university-of-antwerp-logo.png`

## Accessibility and Quality

- The export button must have a clear accessible name and normal keyboard focus behavior.
- The screen-hidden print calendar must not add duplicate navigable content for assistive technology.
- Existing interactive dashboard behavior and translations must remain unchanged.
- Verify with focused component tests, the complete Vitest suite, lint, production build, and a browser-rendered A4 PDF inspection confirming exactly one page.

## Out of Scope

- Direct PDF download without the browser dialog.
- Editing birthday data on the public site.
- Uploading CSV/XLSX data.
- Server-side PDF generation.
- Changing the approved birthday records.
