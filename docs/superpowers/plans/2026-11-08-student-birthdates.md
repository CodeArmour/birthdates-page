# Student Birthdates Page Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a standalone Next.js frontend that imports student birthdays from CSV, presents today's and upcoming birthdays, and provides in-page celebrations and browser notifications.

**Architecture:** Use the Next.js App Router with a client-side dashboard. Keep CSV parsing, validation, duplicate detection, and birthday calculations in pure TypeScript modules; keep persistence and notification access behind browser adapters. UI components consume those interfaces and never parse files or access storage directly.

**Tech Stack:** Next.js, React, TypeScript, CSS Modules, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-11-08-student-birthdates-design.md`

## Global Constraints

- The project lives at `C:\dev\birthdates-page`.
- Use the Next.js App Router, TypeScript, ESLint, a `src` directory, and CSS Modules.
- Keep all student data in the browser; do not add a backend or database.
- Require `name` and ISO `birthDate`; allow optional `className` and `message`.
- Request notification permission only from a user-initiated action.
- Treat February 29 birthdays as February 28 in non-leap years.
- Do not include real student records in source control.

## Review Focus

- Empty, malformed, or header-only CSV files show useful feedback and do not replace valid stored data.
- Quoted commas, escaped quotes, and Windows line endings parse correctly.
- Invalid dates, missing required values, and duplicates produce correct row results.
- December-to-January ordering and February 29 calculations remain correct.
- Denied or unsupported notification permission leaves the dashboard usable and explains the limitation.

---

### Task 1: Application foundation and test harness

**Files:**
- Create: `package.json`
- Create: `package-lock.json`
- Create: `tsconfig.json`
- Create: `next.config.ts`
- Create: `next-env.d.ts`
- Create: `eslint.config.mjs`
- Create: `src/app/layout.tsx`
- Create: `src/app/page.tsx`
- Create: `src/app/globals.css`
- Create: `src/app/page.module.css`
- Create: `src/test/setup.ts`
- Create: `vitest.config.ts`
- Create: `.gitignore`
- Create: `README.md`

**Interfaces:**
- Consumes: None.
- Produces: Next.js App Router shell and `npm run test`, `npm run lint`, and `npm run build` commands.

- [ ] **Step 1: Scaffold the approved Next.js project in place**

Initialize Git, create the standard App Router configuration files listed above, and add scripts for `dev`, `build`, `start`, `lint`, and `test`. Install current stable `next`, `react`, and `react-dom` packages plus the standard TypeScript, React type, and ESLint development packages. Do not replace or remove the existing `docs` directory.

- [ ] **Step 2: Add the test harness dependencies and configuration**

Add Vitest, jsdom, Testing Library, and jest-dom as development dependencies. Configure `vitest.config.ts` for the `@/` alias, jsdom, and `src/test/setup.ts`.

- [ ] **Step 3: Write the initial page smoke test**

Create `src/app/page.test.tsx` asserting the page has one `h1` named “Student birthdays” and an “Import CSV” control.

- [ ] **Step 4: Run the smoke test and verify it fails**

Run `npm test -- --run src/app/page.test.tsx`. Expected: FAIL because the approved page shell does not exist yet.

- [ ] **Step 5: Implement the semantic application shell**

Create the layout metadata, skip link, main landmark, heading, import action, and initial empty-state copy. Establish the cream/navy/coral/gold CSS tokens, visible focus states, and reduced-motion defaults.

- [ ] **Step 6: Verify the foundation**

Run `npm test -- --run src/app/page.test.tsx`, `npm run lint`, and `npm run build`. Expected: all pass.

- [ ] **Step 7: Commit**

Commit as `chore: scaffold student birthdates app`.

### Task 2: CSV parsing and validation

**Files:**
- Create: `src/features/birthdays/types.ts`
- Create: `src/features/birthdays/csv.ts`
- Create: `src/features/birthdays/csv.test.ts`
- Create: `public/examples/student-birthdays.csv`

**Interfaces:**
- Consumes: Browser-provided CSV text.
- Produces: `StudentBirthday`, `CsvRowError`, `CsvImportResult`, and `parseStudentCsv(csvText: string): CsvImportResult`.

- [ ] **Step 1: Write failing parser tests**

Test valid required/optional headers, quoted commas, escaped quotes, CRLF input, empty files, missing headers, invalid ISO dates, impossible dates, missing required fields, and duplicate normalized name/date pairs.

- [ ] **Step 2: Run parser tests and verify they fail**

Run `npm test -- --run src/features/birthdays/csv.test.ts`. Expected: FAIL because `parseStudentCsv` is not implemented.

- [ ] **Step 3: Define the data interfaces**

Define `StudentBirthday` with `id`, `name`, `birthDate`, optional `className`, and optional `message`; define row-numbered errors and the accepted/rejected import result.

- [ ] **Step 4: Implement `parseStudentCsv(csvText: string): CsvImportResult`**

Use a small state-machine parser that supports commas, quoted values, doubled quotes, LF/CRLF line endings, trimmed headers, strict calendar validation, and stable IDs derived from normalized name/date values.

- [ ] **Step 5: Add the non-personal sample CSV**

Use fictional records matching the approved headers and document the format in the README.

- [ ] **Step 6: Verify the parser**

Run `npm test -- --run src/features/birthdays/csv.test.ts`. Expected: all parser tests pass.

- [ ] **Step 7: Commit**

Commit as `feat: parse and validate birthday csv files`.

### Task 3: Birthday calculations and browser persistence

**Files:**
- Create: `src/features/birthdays/date.ts`
- Create: `src/features/birthdays/date.test.ts`
- Create: `src/features/birthdays/storage.ts`
- Create: `src/features/birthdays/storage.test.ts`

**Interfaces:**
- Consumes: `StudentBirthday[]` from Task 2 and a supplied reference `Date`.
- Produces: `getNextBirthday(student, now): Date`, `daysUntilBirthday(student, now): number`, `getTodaysBirthdays(students, now): StudentBirthday[]`, `sortByUpcomingBirthday(students, now): StudentBirthday[]`, `loadBirthdays(): StudentBirthday[]`, and `saveBirthdays(students): void`.

- [ ] **Step 1: Write failing date and storage tests**

Cover same-day birthdays, year rollover, stable ordering, February 29 in leap years, February 29 on February 28 in non-leap years, absent storage, corrupt storage, and storage round trips.

- [ ] **Step 2: Run the tests and verify they fail**

Run `npm test -- --run src/features/birthdays/date.test.ts src/features/birthdays/storage.test.ts`. Expected: FAIL because the modules do not exist.

- [ ] **Step 3: Implement the pure date functions**

Use local calendar dates and compare at start-of-day so time-of-day and daylight-saving changes cannot shift birthday results.

- [ ] **Step 4: Implement guarded localStorage access**

Use the versioned key `student-birthdays:v1`; validate parsed values and return an empty array for unavailable or invalid storage.

- [ ] **Step 5: Verify calculations and persistence**

Run `npm test -- --run src/features/birthdays/date.test.ts src/features/birthdays/storage.test.ts`. Expected: all pass.

- [ ] **Step 6: Commit**

Commit as `feat: calculate and store upcoming birthdays`.

### Task 4: Import flow and birthday dashboard

**Files:**
- Create: `src/features/birthdays/BirthdayDashboard.tsx`
- Create: `src/features/birthdays/BirthdayDashboard.module.css`
- Create: `src/features/birthdays/BirthdayDashboard.test.tsx`
- Create: `src/features/birthdays/CsvImporter.tsx`
- Create: `src/features/birthdays/BirthdayCard.tsx`
- Modify: `src/app/page.tsx`

**Interfaces:**
- Consumes: parser, date, and storage interfaces from Tasks 2 and 3.
- Produces: CSV import/replace flow, row-error summary, today's birthday hero, upcoming list, name/class search, and locally persisted dashboard state.

- [ ] **Step 1: Write failing dashboard interaction tests**

Test importing a valid file, preserving existing data after an invalid file, showing rejected-row feedback, searching by student or class, rendering today's birthdays, ordering upcoming birthdays, and empty/no-results states.

- [ ] **Step 2: Run dashboard tests and verify they fail**

Run `npm test -- --run src/features/birthdays/BirthdayDashboard.test.tsx`. Expected: FAIL because the components do not exist.

- [ ] **Step 3: Implement the CSV importer**

Read the selected file with `File.text()`, call `parseStudentCsv`, show accepted/rejected counts, and replace saved data only when at least one valid row is present.

- [ ] **Step 4: Implement the dashboard components**

Render the hero, search field, class filter, responsive birthday cards, days-until labels, optional class/message fields, and a replace-data action.

- [ ] **Step 5: Apply the approved visual direction**

Use paper-like cards, restrained confetti details, strong type hierarchy, AA contrast, keyboard focus states, 44px minimum touch targets, and mobile layouts without horizontal scrolling.

- [ ] **Step 6: Verify the dashboard**

Run `npm test -- --run src/features/birthdays/BirthdayDashboard.test.tsx`. Expected: all pass.

- [ ] **Step 7: Commit**

Commit as `feat: add birthday csv dashboard`.

### Task 5: Notifications, celebration, and final verification

**Files:**
- Create: `src/features/birthdays/notifications.ts`
- Create: `src/features/birthdays/notifications.test.ts`
- Create: `src/features/birthdays/Celebration.tsx`
- Create: `src/features/birthdays/Celebration.module.css`
- Modify: `src/features/birthdays/BirthdayDashboard.tsx`
- Modify: `README.md`

**Interfaces:**
- Consumes: today's birthdays from Task 3 and dashboard state from Task 4.
- Produces: `getNotificationState(): NotificationState`, `requestBirthdayNotifications(): Promise<NotificationState>`, and `notifyBirthdays(students): void`, plus an accessible celebration overlay.

- [ ] **Step 1: Write failing notification and celebration tests**

Test unsupported, default, granted, and denied notification states; ensure permission requests occur only after the enable action; ensure one notification summarizes multiple birthdays; and verify the overlay has a dismiss button and respects reduced motion.

- [ ] **Step 2: Run the tests and verify they fail**

Run `npm test -- --run src/features/birthdays/notifications.test.ts src/features/birthdays/BirthdayDashboard.test.tsx`. Expected: FAIL because notification behavior is not implemented.

- [ ] **Step 3: Implement guarded browser notifications**

Never access `window` or `Notification` during server rendering. Store the last notified local date so rerenders do not repeat the same birthday notification.

- [ ] **Step 4: Implement the celebration overlay**

Show today's names and messages, use CSS-only confetti, announce the celebration politely, provide a visible close button, and remove nonessential motion under `prefers-reduced-motion`.

- [ ] **Step 5: Complete documentation**

Document installation, development commands, CSV columns, local-only storage, notification limitations, sample-data location, and how to clear or replace imported data.

- [ ] **Step 6: Run complete verification**

Run `npm test -- --run`, `npm run lint`, and `npm run build`. Expected: all commands pass with no skipped tests.

- [ ] **Step 7: Perform responsive and keyboard checks**

Verify the import-to-celebration path at 375px and 1280px widths, tab through every control, confirm no horizontal overflow, and confirm the page remains usable when notifications are denied.

- [ ] **Step 8: Commit**

Commit as `feat: celebrate and notify student birthdays`.
