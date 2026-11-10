# Birthday calendar export design QA

final result: passed

## Visual truth and scope

- Source visual: `C:\Users\omars\Downloads\Birthday Calendar.png` (1414 x 2000 pixels).
- Approved interpretation: `docs/superpowers/specs/2026-11-10-one-page-birthday-calendar-export-design.md`. The reference supplies hierarchy and a 3-by-4 month grid. Existing cream/navy/coral/gold/sky colors, serif/sans typography, the 62 approved records, and supplied logos remain authoritative. Reference names, dates, empty months, purple palette, and illustrations are not the data or brand specification.
- Route: `http://localhost:3001/`.
- Evidence directory: `C:\Users\omars\Documents\Codex\birthdates-page-export\.superpowers\sdd\2026-11-10-one-page-birthday-calendar-export\evidence`.

## Rendered evidence and normalization

All paths below are relative to the absolute evidence directory above.

| Evidence | Dimensions / state |
| --- | --- |
| `birthday-calendar-en.pdf` | Browser print-media output; one portrait A4 page, 594.96 x 841.92 pt, rotation 0; English, all 62 birthdays |
| `birthday-calendar-en.png` | Poppler render at 150 dpi, 1240 x 1754 pixels; complete A4 page |
| `comparison-full.png` | Source and PDF render together; each normalized to 707 x 1000 pixels, labels above; 1414 x 1030 total |
| `comparison-january.png` | Source and implementation January together; focused density/readability comparison, with the different approved record count called out |
| `comparison-footer.png` | Source and implementation QR/footer regions together, scaled to 1000px width |
| `focus-january.png` | Native render crop, 360 x 275 pixels |
| `focus-footer-qr.png` | Native render crop, 1125 x 255 pixels |
| `desktop-en-1440.png` | In-app browser, 1440 x 1000 CSS viewport, English default, unfiltered |
| `desktop-filtered-1440.png` | Same viewport, English search with no matches; print DOM still contains 62 entries |
| `mobile-nl-320.png` | Initial 320 x 800 CSS viewport, Dutch; evidence of the title wrapping issue |
| `mobile-nl-320-final.png` | Corrected 320 x 800 CSS viewport, Dutch |
| `mobile-nl-375.png` | Corrected 375 x 812 CSS viewport, Dutch |

Browser captures use the browser's default device density. Captured image bounds include its scrollbar and are 1 output pixel per viewport CSS pixel. No device frame or browser chrome was added. The reference and PDF have matching portrait A4 proportions; normalized full-view comparison removes their density difference. Focused comparisons judge readable type, grouping, and margins, not identical character positions: content, language, and approved brand styling intentionally differ from the source.

## Full-view comparison

Opened `comparison-full.png`, which places both actual images in one comparison input. The implementation preserves a prominent title/subtitle, twelve consistently spaced month cards in three columns/four rows, a cream paper background, and a compact QR/footer area. The supplied birthday logo provides the celebratory artwork. No replacement CSS/HTML/emoji illustration was created.

The existing Georgia heading and Trebuchet body pairing, navy text, alternating navy/coral/gold/sky month bands, pale card borders, and rounded corners are consistent with the approved app identity. Header, grid, QR/partners row, and footer share aligned edges and remain inside the page. All content is visible without clipping, extra pages, overlaps, dashboard controls, or browser headers/footers.

## Focused comparison

- Opened `comparison-january.png`. January's twelve approved day/name entries fit in two columns with clear date/name separation; both columns, the final Sara entry, and the card boundary remain visible. Other months retain a single column. March visibly keeps Erdem then Anna on day 05. The source's smaller/different dataset is intentionally superseded by the approved 62 records.
- Opened `comparison-footer.png`. The supplied QR retains its square modules and white quiet zone. The prompt, University of Antwerp logo, Linguapolis logo, positive footer phrase, and developer credit are sharp and separated. Both partner images preserve their aspect ratios. The logo artwork contains its original detail and is not stretched.
- Opened the native 150dpi full-page PDF render and mobile/desktop captures. The type remains readable, month borders align, and the QR/brand/footer regions do not overlap. PDF text extraction independently finds all 62 approved day/name pairs and all twelve month headings, with no printed placeholder year.

## Browser interactions and bilingual state

In the Codex in-app browser, switched English to Dutch and back, confirmed `Export PDF` / `PDF exporteren`, verified the visible `Developed by Omar` / `Ontwikkeld door Omar` header credit, and checked both controls at 320px and 375px. At 375px both buttons measure 44px high. At 320px document width remains 320px and controls fit. Verified the hidden calendar's Dutch title, month headings, QR prompt, and footer through the actual rendered DOM, with `aria-hidden="true"`. Searching for an absent name changes the screen to its empty state and leaves all 62 print entries intact. Console error/warning inspection returned no entries for the final interactive check.

The IAB native print click stalled its CDP input command; it exposes no print-media/PDF capability. After this specific limitation, the controller approved installed Chrome headless as a print-only fallback, using a fresh isolated profile and no Playwright. The PDF was generated from the live app with `--headless=new --no-pdf-header-footer --print-to-pdf`, then checked with `pdfinfo` and rendered using `pdftoppm`. The PDF skill's exact marker ran successfully once immediately before the first PDF authoring command. This fallback cost one failed click and a slow native-app AX inspection (about 81 seconds), plus a fresh browser tab. It did not change product code or dependencies. Vitest verifies that one user click invokes the actual `window.print` boundary exactly once; this report does not claim the IAB native save dialog completed.

## Iteration history

1. Initial print comparison: no actionable P0/P1/P2 print mismatch. The first PDF fit one A4 page with all records, images, and footer.
2. Initial responsive comparison: P2, the long Dutch hero title was clipped at 320px (`mobile-nl-320.png`). Added `overflow-wrap: anywhere` to the existing hero heading. This preserves its typography and lets long words stay within the screen.
3. Re-captured the same Dutch 320px state (`mobile-nl-320-final.png`) and the 375px state (`mobile-nl-375.png`). The complete title is now visible. Header credit and both actions remain usable. The print layout is unaffected by this screen-only heading rule. No actionable P0/P1/P2 findings remain.

## Follow-up polish and limits

- Optional P3: language-aware hyphenation could make the narrowest 320px Dutch title break more naturally; the complete text is currently visible.
- The verification PDF is English. Dutch copy and headings were checked in the real browser DOM and component tests; no second Dutch PDF was generated.
- Browser print settings remain user controlled. The verified output uses A4 portrait and disabled browser headers/footers. Physical printer margins and other engines are outside this verification.

final result: passed
