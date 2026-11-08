# Two-Column Birthday CSV Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make `name,birthDate` the only documented and templated CSV columns while preserving compatibility with older files.

**Architecture:** Keep the existing parser and student model unchanged because they already accept the requested two-column input. Update the public boundary—the example file, interface hint, README, and import tests—to establish the simpler format.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-11-08-two-column-csv-design.md`

## Global Constraints

- The documented CSV header is exactly `name,birthDate`.
- Birth dates continue to use `YYYY-MM-DD`.
- Existing CSV files with optional `className` or `message` columns remain accepted.
- No dependencies or storage changes.

## Review Focus

- A two-column file imports a real student and displays the student name.
- A missing `name` or `birthDate` header still produces the existing clear error.
- Optional legacy columns remain parseable for backward compatibility.
- The public example contains only the two documented columns.
- The dashboard no longer tells users to provide optional columns.

---

### Task 1: Simplify the public CSV contract

**Files:**
- Modify: `src/features/birthdays/BirthdayDashboard.test.tsx`
- Modify: `src/features/birthdays/BirthdayDashboard.tsx`
- Modify: `public/examples/student-birthdays.csv`
- Modify: `README.md`

**Interfaces:**
- Consumes: `parseStudentCsv(csvText: string): CsvImportResult`
- Produces: a documented `name,birthDate` CSV template with unchanged parser compatibility

- [ ] **Step 1: Write the failing dashboard import test**

Change the successful upload fixture to `name,birthDate\nNoah Williams,2013-11-14` and assert that the imported student is shown. Add an assertion that the CSV hint names only `name` and `birthDate`.

- [ ] **Step 2: Run the focused test to verify it fails**

Run: `npm test -- --run src/features/birthdays/BirthdayDashboard.test.tsx`

Expected: FAIL because the existing hint still includes `className` and `message`.

- [ ] **Step 3: Implement the minimal public-format changes**

Update the dashboard hint, `README.md`, and `public/examples/student-birthdays.csv` to use only `name,birthDate`. Do not change `parseStudentCsv` or the stored record type.

- [ ] **Step 4: Run focused and full verification**

Run:

```bash
npm test -- --run src/features/birthdays/BirthdayDashboard.test.tsx
npm test -- --run
npm run lint
npm run build
```

Expected: all commands exit 0, with the complete test suite reporting zero failures.

- [ ] **Step 5: Commit and push the PR branch**

```bash
git add README.md public/examples/student-birthdays.csv src/features/birthdays/BirthdayDashboard.tsx src/features/birthdays/BirthdayDashboard.test.tsx docs/superpowers/specs/2026-11-08-two-column-csv-design.md docs/superpowers/plans/2026-11-08-two-column-csv.md
git commit -m "fix: simplify birthday csv format"
git push origin feature/student-birthdates
```
