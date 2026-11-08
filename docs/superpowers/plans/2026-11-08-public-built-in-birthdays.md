# Public Built-In Birthdays Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace the public CSV-upload workflow with a privacy-safe built-in birthday dataset derived from the supplied group file.

**Architecture:** Add a static birthday-data module containing only unique first names and month/day values encoded with placeholder year `2000`. Render that data directly in the dashboard, remove public import controls, and retain the existing date, notification, celebration, and search logic.

**Tech Stack:** Next.js 16, React 19, TypeScript, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-11-08-public-built-in-birthdays-design.md`

## Global Constraints

- Never commit the source file `C:\Users\omars\Downloads\group_1_birthdays.csv`.
- Never publish surnames or real birth years.
- The built-in dataset contains exactly 35 records with unique first names and `2000-MM-DD` internal dates.
- The public page has no CSV upload, replace-data control, or CSV format hint.
- Search, birthday ordering, notifications, and celebrations remain functional.
- No new dependencies and no changes to notification behavior.
- Preserve and do not commit the unrelated existing `package-lock.json` key-order change.

## Review Focus

- No full name or real year from the private source appears in the committed diff.
- The page starts with all 35 built-in records without localStorage or an upload action.
- February 29 remains representable because the placeholder year is 2000.
- The class filter is absent when no records contain class values.
- Existing notification and celebration tests remain green.

---

### Task 1: Add sanitized built-in birthdays and remove public upload controls

**Files:**
- Create: `src/features/birthdays/builtInBirthdays.ts`
- Create: `src/features/birthdays/builtInBirthdays.test.ts`
- Modify: `src/features/birthdays/BirthdayDashboard.tsx`
- Modify: `src/features/birthdays/BirthdayDashboard.test.tsx`
- Modify: `README.md`

**Interfaces:**
- Produces: `BUILT_IN_BIRTHDAYS: readonly StudentBirthday[]`
- Consumes: existing `StudentBirthday`, date, notification, and celebration interfaces

- [ ] **Step 1: Write failing privacy and dashboard tests**

Add dataset tests asserting 35 records, unique single-token first names, `2000-MM-DD` dates, and absence of `className`/`message`. Update dashboard tests to assert built-in records render immediately and that upload, replace-data, CSV hint, and class combobox controls are absent.

- [ ] **Step 2: Verify RED**

Run the focused dataset and dashboard tests. Expected: failure because the built-in module and public no-upload behavior do not exist.

- [ ] **Step 3: Implement the minimal built-in-data page**

Create the static sanitized dataset from the supplied file without copying surnames or real years. Initialize the dashboard from `BUILT_IN_BIRTHDAYS`, remove the importer and local birthday-record persistence path from the rendered page, and conditionally omit the class filter when there are no class names. Update README privacy and data-source guidance.

- [ ] **Step 4: Verify**

Run focused tests, the full suite, lint, build, and `git diff --check`. All commands must exit 0.

- [ ] **Step 5: Commit**

Commit only scoped code, tests, README, spec, and plan with message `feat: add privacy-safe built-in birthdays`. Do not push.
