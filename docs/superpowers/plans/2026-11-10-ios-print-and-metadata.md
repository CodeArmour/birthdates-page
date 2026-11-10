# iOS Print and Site Metadata Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make birthday-calendar export reliable on iPhone, preserve a single A4 page, and publish complete install/social metadata with the supplied birthday logo.

**Architecture:** Keep browser-native `window.print()` as the export boundary. Add a small testable iOS environment detector and bilingual fallback guidance, replace WebKit-fragile print columns with CSS Grid, size the print sheet from the available page width, and use Next.js metadata file conventions plus a typed manifest.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, CSS Modules, Vitest, Testing Library, browser print CSS.

**Spec:** `docs/superpowers/specs/2026-11-10-ios-print-and-metadata-design.md`

## Global Constraints

- Keep the project frontend-only and add no runtime or development dependency.
- Continue using browser Print / Save as PDF; do not generate PDF bytes in application code.
- Keep all 62 approved birthdays on exactly one portrait A4 page.
- Preserve English and Dutch copy, birthday data, QR code, institution logos, birthday logo, and Omar branding.
- Use `https://birthdates-page.vercel.app` as the canonical production origin.
- Never claim programmatic printing is guaranteed when iOS WebKit blocks `window.print()`.

## Review Focus

- iPhone browser versus installed standalone mode: both must receive accurate fallback instructions and the desktop must not show them.
- A blocked `window.print()` call must not crash or hide the fallback; the call remains directly inside the export click.
- January's 12 entries must remain two columns and must not overlap April.
- Browser-imposed print margins must shrink the inner sheet instead of creating a blank second page.
- Every icon and social metadata URL must resolve from the production origin, with Apple touch and 192/512 manifest sizes explicitly declared.

---

### Task 1: Add the iOS export fallback

**Files:**
- Create: `src/features/birthdays/printEnvironment.ts`
- Create: `src/features/birthdays/printEnvironment.test.ts`
- Modify: `src/features/birthdays/BirthdayDashboard.tsx`
- Modify: `src/features/birthdays/BirthdayDashboard.module.css`
- Modify: `src/features/birthdays/BirthdayDashboard.print.test.tsx`
- Modify: `src/features/birthdays/copy.ts`

**Interfaces:**
- Consumes: `window.navigator.userAgent`, optional `navigator.standalone`, and `window.matchMedia("(display-mode: standalone)")`.
- Produces: `detectPrintEnvironment(input: PrintEnvironmentInput): "default" | "ios-browser" | "ios-standalone"` and bilingual fallback UI rendered by `BirthdayDashboard`.

- [ ] **Step 1: Write the pure detector tests**

Add tests proving iPhone/iPad user agents return `ios-browser`, either standalone signal returns `ios-standalone`, and desktop/Android return `default`.

- [ ] **Step 2: Run the detector test and verify RED**

Run: `npm test -- --run src/features/birthdays/printEnvironment.test.ts`

Expected: FAIL because `printEnvironment.ts` does not exist.

- [ ] **Step 3: Implement `detectPrintEnvironment`**

Define:

```ts
export type PrintEnvironmentInput = Readonly<{
  displayModeStandalone: boolean;
  navigatorStandalone?: boolean;
  userAgent: string;
}>;

export function detectPrintEnvironment(
  input: PrintEnvironmentInput,
): "default" | "ios-browser" | "ios-standalone";
```

Treat `iPhone`, `iPad`, and `iPod` as iOS. Standalone wins only for iOS; other platforms remain `default`.

- [ ] **Step 4: Run the detector test and verify GREEN**

Run: `npm test -- --run src/features/birthdays/printEnvironment.test.ts`

Expected: PASS.

- [ ] **Step 5: Write failing dashboard export tests**

In `BirthdayDashboard.print.test.tsx`, add focused tests that:

- override the user agent and `matchMedia` to simulate iOS browser and standalone modes;
- click `Export PDF` and prove `window.print()` is still called exactly once;
- assert the English browser fallback contains `Share` and `Print`;
- assert standalone copy says to open in Safari first;
- switch to Dutch and assert the fallback is translated;
- assert a desktop click shows no fallback notice.

- [ ] **Step 6: Run the dashboard print tests and verify RED**

Run: `npm test -- --run src/features/birthdays/BirthdayDashboard.print.test.tsx`

Expected: FAIL because no iOS fallback UI or copy exists.

- [ ] **Step 7: Implement the fallback UI**

Add exact English and Dutch copy keys for the browser and standalone messages. In the existing click handler, calculate the environment, reveal the matching accessible `role="status"` notice, then call `window.print()` synchronously. Style the notice as a compact branded callout below the header actions without changing the desktop header layout.

- [ ] **Step 8: Run focused and full tests**

Run: `npm test -- --run src/features/birthdays/printEnvironment.test.ts src/features/birthdays/BirthdayDashboard.print.test.tsx`

Expected: both files pass.

Run: `npm test -- --run`

Expected: all tests pass with zero failures.

- [ ] **Step 9: Commit**

```bash
git add src/features/birthdays/printEnvironment.ts src/features/birthdays/printEnvironment.test.ts src/features/birthdays/BirthdayDashboard.tsx src/features/birthdays/BirthdayDashboard.module.css src/features/birthdays/BirthdayDashboard.print.test.tsx src/features/birthdays/copy.ts
git commit -m "fix: add resilient iOS print fallback"
```

### Task 2: Make the one-page print layout WebKit-safe

**Files:**
- Create: `src/features/birthdays/BirthdayPrintCalendar.css.test.ts`
- Modify: `src/features/birthdays/BirthdayPrintCalendar.module.css`

**Interfaces:**
- Consumes: the existing `[data-print-calendar]` DOM and 12-month/62-birthday component output.
- Produces: a print stylesheet whose dense list uses two-column Grid and whose `.sheet` scales to the browser's available page width while preserving the A4 ratio.

- [ ] **Step 1: Write the failing stylesheet contract test**

Read `BirthdayPrintCalendar.module.css` as text and assert:

- `.dense` uses `display: grid` and `grid-template-columns: repeat(2, minmax(0, 1fr))`;
- `.dense` no longer uses `column-count`;
- `.sheet` uses `width: 100%`, `max-width: 210mm`, `height: auto`, and `aspect-ratio: 210 / 297`;
- `.sheet` no longer forces `width: 210mm` plus `height: 297mm`.

- [ ] **Step 2: Run the stylesheet test and verify RED**

Run: `npm test -- --run src/features/birthdays/BirthdayPrintCalendar.css.test.ts`

Expected: FAIL against the current fixed-size sheet and multi-column dense list.

- [ ] **Step 3: Implement the minimal print CSS fix**

Replace the exact A4 width/height pair with available-width sizing and the A4 aspect ratio. Center the sheet, retain `box-sizing: border-box`, and keep the existing internal grid rows/padding. Replace multi-column rules with a two-column CSS Grid and keep each birthday row unbroken.

- [ ] **Step 4: Run focused and full tests**

Run: `npm test -- --run src/features/birthdays/BirthdayPrintCalendar.css.test.ts src/features/birthdays/BirthdayPrintCalendar.test.tsx`

Expected: both files pass.

Run: `npm test -- --run`

Expected: all tests pass with zero failures.

- [ ] **Step 5: Generate and inspect verification PDFs**

Run the production app locally, create a normal Chrome print PDF with browser headers/footers disabled, and create a second constrained-width print capture that simulates browser-imposed mobile margins. Use `pdfinfo` to require one A4 portrait page for each. Render each PDF with `pdftoppm` and visually inspect January/April, the QR/logo row, and the footer for overlap or clipping.

- [ ] **Step 6: Commit**

```bash
git add src/features/birthdays/BirthdayPrintCalendar.css.test.ts src/features/birthdays/BirthdayPrintCalendar.module.css
git commit -m "fix: keep mobile birthday export on one page"
```

### Task 3: Add install icons, manifest, and complete metadata

**Files:**
- Create: `src/app/manifest.ts`
- Create: `src/app/manifest.test.ts`
- Create mechanically from the supplied logo: `src/app/icon.png`
- Create mechanically from the supplied logo: `src/app/apple-icon.png`
- Create mechanically from the supplied logo: `public/icons/birthday-calendar-192.png`
- Create mechanically from the supplied logo: `public/icons/birthday-calendar-512.png`
- Modify: `src/app/layout.tsx`
- Modify: `src/app/layout.test.ts`

**Interfaces:**
- Consumes: `public/branding/birthday-calendar-logo.png` and the canonical origin `https://birthdates-page.vercel.app`.
- Produces: Next.js `metadata`, a typed `MetadataRoute.Manifest`, file-based browser/Apple icon tags, and manifest icon assets.

- [ ] **Step 1: Write failing manifest tests**

Assert the manifest exports:

- `name: "Student Birthdates"` and `short_name: "Birthdays"`;
- `start_url: "/"`, `scope: "/"`, `display: "standalone"`;
- `background_color: "#fff8e9"` and `theme_color: "#172a46"`;
- PNG icon entries for exact `192x192` and `512x512` files, with the 512 icon also suitable for maskable use.

- [ ] **Step 2: Run the manifest test and verify RED**

Run: `npm test -- --run src/app/manifest.test.ts`

Expected: FAIL because `manifest.ts` does not exist.

- [ ] **Step 3: Implement `manifest(): MetadataRoute.Manifest`**

Return the exact values above plus the existing site description, categories `education` and `lifestyle`, and icon purposes that preserve a safe logo border.

- [ ] **Step 4: Run the manifest test and verify GREEN**

Run: `npm test -- --run src/app/manifest.test.ts`

Expected: PASS.

- [ ] **Step 5: Expand the failing root metadata contract**

In `layout.test.ts`, assert:

- `metadataBase` equals `https://birthdates-page.vercel.app/` and canonical is `/`;
- application name, description, keywords, author, creator, publisher, and robots are present;
- manifest is `/manifest.webmanifest`;
- Apple web-app title/capability/status bar style and `formatDetection.telephone: false` are present;
- Open Graph uses type `website`, locale `en_US`, the canonical URL, title/description, and the supplied logo;
- Twitter uses `summary_large_image` with matching title/description/logo;
- `viewport` exports the navy theme color and device-width scale settings.

- [ ] **Step 6: Run the layout test and verify RED**

Run: `npm test -- --run src/app/layout.test.ts`

Expected: FAIL because the current metadata only defines title, description, and one generic icon.

- [ ] **Step 7: Implement the metadata and viewport exports**

Use Next.js `Metadata` and `Viewport` types. Prefer file-based `icon.png` and `apple-icon.png` discovery; do not duplicate those generated URLs manually. Point social images to `/branding/birthday-calendar-logo.png` and keep all public copy accurate to this birthday calendar.

- [ ] **Step 8: Generate the four icon files mechanically**

Resize the existing square logo without cropping or changing transparency:

- `src/app/icon.png`: 32x32;
- `src/app/apple-icon.png`: 180x180;
- `public/icons/birthday-calendar-192.png`: 192x192;
- `public/icons/birthday-calendar-512.png`: 512x512.

Verify every file's pixel dimensions and PNG format after writing.

- [ ] **Step 9: Run focused and full verification**

Run: `npm test -- --run src/app/layout.test.ts src/app/manifest.test.ts`

Expected: both files pass.

Run: `npm test -- --run`

Expected: all tests pass.

Run: `npm run lint`

Expected: exit 0 with no lint errors.

Run: `npm run build`

Expected: production build succeeds and lists `/manifest.webmanifest`, `/icon.png`, and `/apple-icon.png` metadata routes.

- [ ] **Step 10: Inspect generated browser metadata**

Start the production build and verify the rendered `<head>` contains canonical, manifest, Apple touch icon, Open Graph, Twitter, robots, and theme-color tags. Fetch `/manifest.webmanifest` and each icon URL; require HTTP 200 and the declared MIME type/dimensions.

- [ ] **Step 11: Commit**

```bash
git add src/app/layout.tsx src/app/layout.test.ts src/app/manifest.ts src/app/manifest.test.ts src/app/icon.png src/app/apple-icon.png public/icons/birthday-calendar-192.png public/icons/birthday-calendar-512.png
git commit -m "feat: add complete birthday app metadata"
```

### Task 4: Final regression and delivery verification

**Files:**
- Modify if needed: `design-qa.md`

**Interfaces:**
- Consumes: all three completed tasks and the supplied `Student Birthdates-phone.pdf` failure evidence.
- Produces: a clean branch with recorded mobile-print and metadata verification.

- [ ] **Step 1: Run the complete quality gate**

Run: `npm test -- --run`, `npm run lint`, and `npm run build`.

Expected: every command exits 0.

- [ ] **Step 2: Verify the complete mobile story**

At 320px and 390px widths, verify English and Dutch header controls, the Omar credit, the iOS fallback callout, and no horizontal overflow. Verify the installed-app icon assets and manifest responses. Render the latest PDF evidence and confirm one page, 12 months, 62 birthdays, QR, both institution logos, and footer.

- [ ] **Step 3: Update the design QA record**

Append exact commands, PDF page count/dimensions, screenshots, metadata checks, known iOS `window.print()` limitation, and final pass/fail result to `design-qa.md`.

- [ ] **Step 4: Commit final evidence**

```bash
git add design-qa.md
git commit -m "docs: record iOS export and metadata QA"
```

