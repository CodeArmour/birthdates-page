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

## Final iOS-print and metadata regression - 2026-11-10

Verified production commit `52de3d9` with no application changes during this pass. Evidence paths below are relative to `C:\Users\omars\Documents\Codex\birthdates-page-export` and remain local, untracked QA artifacts.

### Quality gate

All commands ran from the repository root and exited 0:

```powershell
npm test -- --run
npm run lint
npm run build
```

Vitest: 20 files, 106 tests passed, zero failures (17:34:35 local; 31.83s). ESLint: no warnings/errors. Next.js 16.4.5: production compilation, TypeScript, and static generation passed, including `/`, `/manifest.webmanifest`, `/icon.png`, and `/apple-icon.png`. No dependencies were installed.

### Mobile browser evidence

Started the built app with `npm run start -- --port 3104 --hostname 127.0.0.1`. Used the existing Playwright CLI and installed Chrome: `playwright-cli -s=task4-mobile open http://127.0.0.1:3104 --browser=chrome --device="iPhone 15"`, then `playwright-cli -s=task4-mobile run-code --filename=.superpowers/sdd/2026-11-10-ios-print-and-metadata/task-4-browser-capture.txt`. Server/browser commands ran outside sandbox socket/process isolation.

`--browser=webkit --device="iPhone 15"` was attempted in both boundaries; the existing WebKit executable was absent. No browser was installed. The successful matrix therefore uses Chrome with the iPhone 15 mobile/touch/device configuration and iPhone Safari user-agent; it is not WebKit execution.

| Screenshots in `tmp/task-4/` | PNG dimensions | Verified state |
| --- | --- | --- |
| `mobile-320-en-browser.png`, `mobile-320-nl-browser.png` | 320 x 844 each | English/Dutch iOS browser fallback |
| `mobile-320-en-standalone.png`, `mobile-320-nl-standalone.png` | 320 x 844 each | English/Dutch home-screen fallback |
| `mobile-390-en-browser.png`, `mobile-390-nl-browser.png` | 390 x 844 each | English/Dutch iOS browser fallback |
| `mobile-390-en-standalone.png`, `mobile-390-nl-standalone.png` | 390 x 844 each | English/Dutch home-screen fallback |
| `mobile-320-en-before.png`, `mobile-390-en-before.png` | 320 x 844 / 390 x 844 | Initial state before export |

Inspected all eight fallback screenshots. Header controls, supplied birthday artwork, Omar credit/link, full fallback copy, and hero content are visible without horizontal clipping. Narrow Dutch words wrap within the available space. Every action is 44px high. At both widths, `innerWidth`, document scroll width, and body scroll width are equal (320/320/320 and 390/390/390). Header actions and fallback bounds stay within the viewport. Omar's link remains `https://omarcode.dev/`, with `Developed by Omar` / `Ontwikkeld door Omar`.

The harness sets `navigator.standalone` false/true before the real Export button handler runs and stubs `window.print` to a counter to avoid a blocking native dialog. Each click calls that boundary exactly once; one status paragraph shows the exact localized browser Share/Print advice or standalone Open-in-Safari advice. Switching language updates the existing callout. No page errors were captured. Raw geometry, actual user-agent, rendered head tags, and screenshot paths are in `tmp/task-4/browser-evidence.txt`. This verifies application detection/copy and layout, not successful native printing.

### Live rendered head and HTTP routes

Ran `node .superpowers/sdd/2026-11-10-ios-print-and-metadata/task-4-live-check.mjs` against `http://127.0.0.1:3104` outside socket isolation; exit 0. The helper adapts Task 3's full assertion script only by changing its local origin. Saved output: `tmp/task-4/live-http.txt`.

| Live route | HTTP | Content-Type | Decoded image |
| --- | --- | --- | --- |
| `/` | 200 | `text/html; charset=utf-8` | - |
| `/manifest.webmanifest` | 200 | `application/manifest+json` | - |
| `/icon.png?icon.1d8a8agu1ass7.png` | 200 | `image/png` | 32 x 32, alpha |
| `/apple-icon.png?apple-icon.03n7stqhvlun5.png` | 200 | `image/png` | 180 x 180, alpha |
| `/icons/birthday-calendar-192.png` | 200 | `image/png` | 192 x 192, alpha |
| `/icons/birthday-calendar-512.png` | 200 | `image/png` | 512 x 512, alpha |
| `/branding/birthday-calendar-logo.png` | 200 | `image/png` | 1254 x 1254, alpha |

Both actual HTTP HTML and the hydrated browser head contain Student Birthdates title/application identity, description, Omar author/creator/publisher, author portfolio, keywords, index/follow robots, manifest, responsive viewport, theme color, Apple installation title/status bar, telephone detection disabled, website Open Graph and Twitter large-image cards. Canonical/OG origin is `https://birthdates-page.vercel.app`; the social image has its real 1254 x 1254 dimensions, descriptive alt, and Dutch alternate locale. Discovered browser/Apple icon links have PNG types and correct sizes. The manifest has root scope/start, standalone display, cream/navy colors, education/lifestyle categories, 192px `any` and 512px `maskable` entries. These are successful local production HTTP checks, not a deployment or installed-device claim.

### Final A4 artifact verification

Reused Task 2's final normal and 7mm-margin constrained PDFs. `git diff 9f74fb3 HEAD -- src/features/birthdays/BirthdayPrintCalendar.tsx src/features/birthdays/BirthdayPrintCalendar.module.css src/features/birthdays/builtInBirthdays.ts src/features/birthdays/copy.ts` is empty: print implementation/data/copy are unchanged. No PDF was authored or edited in this pass, so no artifact-authoring marker was run.

All read/render verification commands exited 0:

```powershell
pdfinfo tmp/pdfs/task-2-normal.pdf
pdfinfo tmp/pdfs/task-2-constrained.pdf
pdftoppm -scale-to 1600 -png tmp/pdfs/task-2-normal.pdf tmp/task-4/final-normal
pdftoppm -scale-to 1600 -png tmp/pdfs/task-2-constrained.pdf tmp/task-4/final-constrained
& 'C:\Program Files\WindowsApps\OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt\dependencies\python\python.exe' tmp/pdfs/task-2-verify.py
& 'C:\Program Files\WindowsApps\OpenAI.CodexPrimaryRuntime.v26-1105-1297-0_26.1105.1297.0_x64__3k8sg7r9htsxt\dependencies\python\python.exe' .superpowers/sdd/2026-11-10-ios-print-and-metadata/task-4-pdf-check.py
```

Both PDFs independently reopen as exactly one portrait A4 page, 594.95996 x 841.91998 pt, rotation 0. Text checks find all 12 months, all 62 approved day/name pairs, positive footer phrase, and `Developed with love by Omar`; four embedded images preserve birthday logo, QR, and both institutions. Inspected new full-page renders `tmp/task-4/final-normal-1.png` and `tmp/task-4/final-constrained-1.png` (1131 x 1600 each). January has two readable columns with all 12 records; March/May last rows remain inside cards. No overlaps, clipping, blank second-page strip, or unwanted dashboard controls. QR quiet zone, institution logos, footer, and Omar credit are intact.

SHA-256: normal `16615dd6793192bfba0069f94685b373b8efc60ce50f257c9ff99166e32f1660`; constrained `37c79f9fb455f0c063cbe48f0c27b561a94e1d24ea0282eaa89f75fff3781482`.

The supplied `C:\Users\omars\Desktop\Student Birthdates-phone.pdf` remains the original failure evidence: `pdfinfo` confirms two A4 pages (595.276 x 841.89 pt), iOS 27.0.1 Quartz PDFContext, Creator Chrome. It is not a post-fix device test.

### Result and remaining external check

Final local regression result: passed. No production defect was found; only this QA record changed. Native iOS WebKit can block `window.print()`, especially from a home-screen app. A physical iPhone Safari/Chrome and installed-home-screen Share > Print/Save PDF re-test is still required to establish the on-device outcome. Chrome emulation and the 7mm constrained PDF do not guarantee arbitrary printer margins or iOS font/engine behavior; the constrained layout retains Task 2's small 1.55px minimum row clearance. The fallback correctly gives the user a manual route when programmatic printing is blocked.
