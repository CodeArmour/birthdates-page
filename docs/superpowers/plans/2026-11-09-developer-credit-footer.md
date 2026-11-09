# Developer Credit and Footer Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Omar's portfolio credit to the header at every viewport and a bilingual finishing footer.

**Architecture:** Extend the existing typed copy map with the new English/Dutch strings, render the same portfolio URL in the header and footer, and style both additions in the existing CSS Module. Keep the work inside `BirthdayDashboard` because the page already owns language state and global layout.

**Tech Stack:** Next.js 16, React, TypeScript, CSS Modules, Vitest, Testing Library

**Spec:** `docs/superpowers/specs/2026-11-09-developer-credit-footer-design.md`

## Global Constraints

- Portfolio URL: `https://omarcode.dev/`.
- Header credit remains visible on mobile and must not crowd the language button.
- New copy switches with the existing English/Dutch toggle.
- External links use `target="_blank"` and `rel="noreferrer"` or an equally safe `noopener noreferrer` value.
- Preserve current data and behavior; add no dependencies.

## Review Focus

- At 390px width, credit, logo, and language button remain visible without horizontal overflow.
- Both header and footer links use the exact portfolio URL and safe new-tab attributes.
- Dutch mode translates all new surrounding copy while leaving `Omar` unchanged.
- Footer is semantic and follows the dashboard rather than interrupting card content.
- Keyboard focus on portfolio links remains visible.

---

### Task 1: Bilingual developer credit and footer

**Files:**
- Modify: `src/features/birthdays/copy.ts`
- Modify: `src/features/birthdays/BirthdayDashboard.tsx`
- Modify: `src/features/birthdays/BirthdayDashboard.module.css`
- Create: `src/features/birthdays/BirthdayDashboard.branding.test.tsx`
- Modify: `src/features/birthdays/BirthdayDashboard.language.test.tsx`

**Interfaces:**
- Consumes: existing `copy[language]`, header layout, and page container.
- Produces: two visible portfolio links, localized header/footer copy, and semantic footer markup.

- [ ] **Step 1: Write failing branding tests**

Assert that the English render contains `Developed by Omar`, a semantic footer, two `Omar` links with exact URL and safe new-tab attributes, the exact copyright/tagline copy, and that the header credit is not marked hidden.

- [ ] **Step 2: Run the focused branding test and verify RED**

Run: `npm.cmd test -- --run src/features/birthdays/BirthdayDashboard.branding.test.tsx`

Expected: FAIL because the credit and footer do not exist.

- [ ] **Step 3: Add failing Dutch translation assertions**

Extend the language test to assert `Ontwikkeld door Omar`, `© 2026 Verjaardagskalender`, and `Met ♥ ontwikkeld door Omar · Elke bijzondere dag verdient een klein feestje.` after switching to Dutch.

- [ ] **Step 4: Implement minimal localized markup and styling**

Use a shared `PORTFOLIO_URL` constant, keep the header credit beneath the brand group on desktop/mobile, add a semantic footer after the dashboard, and add visible hover/focus treatment. Do not change unrelated data or behavior.

- [ ] **Step 5: Verify GREEN and the complete suite**

Run focused branding/language tests, then `npm.cmd test -- --run`, `npm.cmd run lint`, `npm.cmd run build`, and `git diff --check`.

- [ ] **Step 6: Verify responsive behavior**

At 1280×900 and 390×844, confirm both credits are visible, the mobile header does not overlap or overflow, the language toggle still works, and the footer divider/copy are legible.

- [ ] **Step 7: Commit**

Commit message: `Add developer credit and bilingual footer`.
