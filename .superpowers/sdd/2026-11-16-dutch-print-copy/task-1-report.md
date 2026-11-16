# Task 1 Report: Correct Dutch PDF wording

## Changed files
- `src/features/birthdays/copy.ts`: changed the Dutch print title to `Verjaardagskalender` and footer slogan to `Samen vieren, samen groeien`. English copy, site brand, and ordinary footer copyright were left intact.
- `src/features/birthdays/BirthdayPrintCalendar.test.tsx`: updated Dutch print expectations and asserted the old strings are absent. The existing English slogan expectation remains unchanged.
- `src/features/birthdays/BirthdayDashboard.print.test.tsx`: updated the dashboard print title expectation.

## RED evidence
Before changing production copy, ran:

`npm test -- --run src/features/birthdays/BirthdayPrintCalendar.test.tsx src/features/birthdays/BirthdayDashboard.print.test.tsx`

Result: expected failure, 2 test files failed and 2 tests failed / 13 passed. Both failures showed the PDF print title still rendered as `Verjaardagenkalender` instead of `Verjaardagskalender`.

## GREEN evidence
After the production copy change, the focused command passed: 2 test files, 15 tests passed. Existing test coverage still checks English `Happier people, brighter tomorrows`.

## Full verification
- `npm test -- --run`: passed, 20 files / 108 tests. Vitest emitted its jsdom startup performance notice.
- `npm run lint`: passed.
- `npm run build`: passed; Next.js compiled, typechecked, and generated static pages.
- Product working-tree `git diff --check` passed before commit; Git printed a line-ending normalization warning for the edited test file. The final commit-range check later found trailing blank lines in this report; those are corrected below.

## Commit
56c471745acf6959cee86e218cc62a6abfea9212 (`Fix Dutch birthday print calendar copy`).

## Concerns
No functional concerns. Existing untracked `tmp/` directory was preserved.

## Fix-wave note
- Trimmed trailing blank lines and clarified the earlier working-tree check versus the final commit-range check. The final range check is recorded after the docs-only fix commit.
