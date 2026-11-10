# One-Page Birthday Calendar Export Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a bilingual header export action that opens the browser print dialog and prints every approved birthday as one polished portrait A4 calendar page.

**Architecture:** Keep `BirthdayDashboard` as the client owner of language and the `window.print()` action. Add a focused print-only component that groups the existing `BUILT_IN_BIRTHDAYS` by month, renders the 3×4 calendar, and is hidden from screen users while dashboard content is hidden under print media. Use local public assets and CSS Modules; add no dependencies.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript 6, CSS Modules, Vitest, Testing Library, browser print CSS.

**Spec:** `docs/superpowers/specs/2026-11-10-one-page-birthday-calendar-export-design.md`

## Global Constraints

- The export must use the browser's native print / Save as PDF dialog through `window.print()`.
- The output must be exactly one portrait A4 page containing all twelve months and every approved birthday.
- The print component must consume the existing `BUILT_IN_BIRTHDAYS`; do not create a second birthday dataset.
- Anna's approved birth date is `2000-03-05`.
- `Maria.B`, `Maria.O`, `Ali.H`, and `Ali.R` are approved public names.
- The internal placeholder year `2000` must never appear in printed text.
- The print page must follow the current English or Dutch website language.
- Reuse supplied QR and brand assets; do not add generated or code-drawn replacements.
- Add no dependency, backend, upload flow, or direct-download PDF library.
- Preserve the visible mobile `Developed by Omar` branding and all existing dashboard behavior.

## Review Focus

- Dense January data: the component test must prove all January records render once and visual PDF inspection must confirm none are clipped.
- Same-day birthdays: the component test must prove source order is preserved when day values match.
- Language switch before export: the integration test must prove the button and print headings change to Dutch while names remain unchanged.
- Screen/print separation: the integration test must prove the print calendar is assistive-technology-hidden on screen; browser print inspection must show only the A4 calendar.
- One-page constraint: the browser-generated verification PDF must report exactly one A4 portrait page.

---

### Task 1: Restore the approved birthday-data test baseline

**Files:**
- Modify: `src/features/birthdays/builtInBirthdays.test.ts`
- Modify: `src/features/birthdays/BirthdayDashboard.test.tsx`

**Interfaces:**
- Consumes: `BUILT_IN_BIRTHDAYS` from `src/features/birthdays/builtInBirthdays.ts`.
- Produces: A green, explicit test contract for the already-approved production data without changing production records.

- [ ] **Step 1: Update the already-failing exact dataset expectation**

In `builtInBirthdays.test.ts`, set Anna to `2000-03-05` and use `Maria.B`, `Maria.O`, `Ali.H`, and `Ali.R` at their existing IDs and dates.

- [ ] **Step 2: Update the name-shape contract for approved disambiguators**

Rename the test to describe public single-token names with optional dot initials and assert the literal rule `^\p{L}+(?:\.\p{L}+)?$` with the Unicode flag.

- [ ] **Step 3: Update the birthday-order expectation**

In `BirthdayDashboard.test.tsx`, preserve date and same-day source ordering while expecting Anna after Erdem on March 5 and the four approved dotted names in their current positions.

- [ ] **Step 4: Run focused tests**

Run: `npm test -- --run src/features/birthdays/builtInBirthdays.test.ts src/features/birthdays/BirthdayDashboard.test.tsx`

Expected: both files pass with zero failures.

- [ ] **Step 5: Run the complete baseline suite**

Run: `npm test -- --run`

Expected: 15 test files and 75 tests pass with zero failures.

- [ ] **Step 6: Commit**

```bash
git add src/features/birthdays/builtInBirthdays.test.ts src/features/birthdays/BirthdayDashboard.test.tsx
git commit -m "test: align birthday expectations with approved data"
```

### Task 2: Build the bilingual one-page print calendar

**Files:**
- Create: `public/branding/birthday-calendar-qr.png`
- Create: `src/features/birthdays/BirthdayPrintCalendar.tsx`
- Create: `src/features/birthdays/BirthdayPrintCalendar.module.css`
- Create: `src/features/birthdays/BirthdayPrintCalendar.test.tsx`
- Modify: `src/features/birthdays/copy.ts`

**Interfaces:**
- Consumes: `StudentBirthday`, `Language`, the matching `copy[language]`, and local assets under `/branding/`.
- Produces: `BirthdayPrintCalendar({ students, language }: { students: readonly StudentBirthday[]; language: Language }): JSX.Element`, rooted at `[data-print-calendar]` and hidden from the screen/accessibility tree.

- [ ] **Step 1: Write the failing component tests**

Add tests that render `BirthdayPrintCalendar` with `BUILT_IN_BIRTHDAYS` and assert:

- the root has `data-print-calendar` and `aria-hidden="true"`;
- English renders 12 literal month headings and all 62 birthday list items;
- January includes its complete literal name/day sequence exactly once;
- same-day records retain source order, including Erdem before Anna on March 5;
- no rendered birthday text contains `2000`;
- Dutch renders `Onze klas`, `Verjaardagenkalender`, `Januari`, `Maart`, and the Dutch QR/footer copy;
- the QR and three brand images use their exact `/branding/` sources.

- [ ] **Step 2: Run the component test and verify RED**

Run: `npm test -- --run src/features/birthdays/BirthdayPrintCalendar.test.tsx`

Expected: FAIL because the component and print-copy fields do not exist.

- [ ] **Step 3: Copy the supplied QR asset unchanged**

Copy `C:\Users\omars\Downloads\birthdates.png` to `public/branding/birthday-calendar-qr.png`. Preserve the full image and quiet zone.

- [ ] **Step 4: Add bilingual print copy**

Extend both entries in `copy.ts` with matching typed fields for export label, print eyebrow, title, subtitle, 12 month labels, QR prompt, footer phrase, and print developer credit. Use the approved English/Dutch wording from the spec and visual direction.

- [ ] **Step 5: Implement `BirthdayPrintCalendar`**

Create the exact prop interface above. Parse month/day from each ISO placeholder date without constructing local-time dates, group months `0..11`, sort by day with original input index as the tie-breaker, render all names and two-digit days, and use the current language copy.

- [ ] **Step 6: Implement the A4 print design**

In the CSS Module, hide the component under screen media. Under print media, use `@page { size: A4 portrait; margin: 0; }`, a `210mm × 297mm` sheet, a 3×4 month grid, two internal columns only for dense months, exact print colors, real raster assets, compact decoration, and overflow-safe typography. Do not use CSS/HTML drawings, emoji, or placeholder graphics for visible reference assets.

- [ ] **Step 7: Run the component test and verify GREEN**

Run: `npm test -- --run src/features/birthdays/BirthdayPrintCalendar.test.tsx`

Expected: PASS.

- [ ] **Step 8: Run the complete suite**

Run: `npm test -- --run`

Expected: all tests pass.

- [ ] **Step 9: Commit**

```bash
git add public/branding/birthday-calendar-qr.png src/features/birthdays/BirthdayPrintCalendar.tsx src/features/birthdays/BirthdayPrintCalendar.module.css src/features/birthdays/BirthdayPrintCalendar.test.tsx src/features/birthdays/copy.ts
git commit -m "feat: add one-page birthday print calendar"
```

### Task 3: Integrate, visually verify, and quality-gate the export flow

**Files:**
- Create: `src/features/birthdays/BirthdayDashboard.print.test.tsx`
- Modify: `src/features/birthdays/BirthdayDashboard.tsx`
- Modify: `src/features/birthdays/BirthdayDashboard.module.css`
- Modify: `src/features/birthdays/BirthdayDashboard.language.test.tsx`
- Create: `design-qa.md`

**Interfaces:**
- Consumes: `BirthdayPrintCalendar`, `BUILT_IN_BIRTHDAYS`, `language`, and `copy[language].exportPdf`.
- Produces: A bilingual accessible header button whose click calls `window.print()` exactly once, plus print media that hides the interactive page and reveals only the one-page calendar.

- [ ] **Step 1: Write failing integration tests**

Add tests that stub the real browser boundary `window.print` and assert:

- English exposes an `Export PDF` button and one click calls `window.print()` exactly once;
- switching to Dutch exposes `PDF exporteren`, preserves the visible `Ontwikkeld door Omar` header credit, and changes the print calendar headings to Dutch;
- the calendar is fed all 62 built-in records regardless of current search text;
- the screen main/footer remain present and the print root remains `aria-hidden="true"` before printing.

- [ ] **Step 2: Run focused integration tests and verify RED**

Run: `npm test -- --run src/features/birthdays/BirthdayDashboard.print.test.tsx src/features/birthdays/BirthdayDashboard.language.test.tsx`

Expected: FAIL because the export action and integrated print calendar do not exist.

- [ ] **Step 3: Integrate the export action**

Import and render `BirthdayPrintCalendar` with the unchanged `students` array and current `language`. Add `handlePrint()` that calls `window.print()` only from the button click. Group export and language buttons in a header action container while keeping the developer credit visible.

- [ ] **Step 4: Add screen and print separation styles**

Style the export button to match the existing tactile controls. Keep both header actions usable from 320px upward. Under print media, remove page padding/background, hide all screen-only content, and reveal only `[data-print-calendar]` without changing its A4 dimensions.

- [ ] **Step 5: Run focused tests and verify GREEN**

Run: `npm test -- --run src/features/birthdays/BirthdayDashboard.print.test.tsx src/features/birthdays/BirthdayDashboard.language.test.tsx`

Expected: PASS.

- [ ] **Step 6: Run automated project checks**

Run:

```bash
npm test -- --run
npm run lint
npm run build
```

Expected: every command exits 0 with no test, lint, TypeScript, or build failure.

- [ ] **Step 7: Verify the real browser flow and one-page PDF**

Start the app locally, open it in the Codex in-app browser, test English/Dutch switching and the export button boundary, emulate print media, and capture the rendered A4 page. Before the first temporary PDF-generation command, run the PDF artifact-operation marker required by the PDF workflow. Generate one verification PDF with browser print settings, confirm with `pdfinfo` that it has exactly one portrait A4 page, render it to PNG with `pdftoppm`, and visually inspect the full page plus dense January and footer/QR regions.

- [ ] **Step 8: Run design QA against the approved reference**

Open `C:\Users\omars\Downloads\Birthday Calendar.png` and the implementation capture together. Record evidence for typography, spacing/grid rhythm, colors, supplied image quality, and bilingual copy in `design-qa.md`. Fix every P0/P1/P2 mismatch and repeat capture/comparison until `final result: passed`; list only optional P3 polish as follow-up.

- [ ] **Step 9: Commit**

```bash
git add src/features/birthdays/BirthdayDashboard.print.test.tsx src/features/birthdays/BirthdayDashboard.tsx src/features/birthdays/BirthdayDashboard.module.css src/features/birthdays/BirthdayDashboard.language.test.tsx design-qa.md
git commit -m "feat: add browser PDF export flow"
```

## Plan Self-Review

- Spec coverage: all interaction, one-page, bilingual, data, asset, branding, accessibility, and verification requirements are assigned to a task.
- Step scan: each step has one checkable action; production behavior is preceded by a failing test.
- Type consistency: `BirthdayPrintCalendar` takes the same readonly student list and `Language` type used by `BirthdayDashboard`.
- Review focus: every listed risk has an automated or browser/PDF verification owner.
- Proportion: three independently reviewable tasks cover baseline repair, isolated component construction, and integration/visual verification without unrelated refactoring.
