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
6970021 (`Fix Dutch birthday print calendar copy`, rebased onto `041e87d`).

## Concerns
No functional concerns. Existing untracked `tmp/` directory was preserved.

## Fix-wave note
- Trimmed trailing blank lines and clarified the earlier working-tree check versus the final commit-range check. After commit `f93b4ce`, `git diff --check fda72be359ccede69748430e84d4f128244d82ca..HEAD` passed with exit code 0.
## Rebase integration alignment
- After safely rebasing onto `041e87d`, updated the strict built-in birthday fixture for Jomana from `2000-09-30` to the approved `2000-10-22`.
- Updated the frozen-January upcoming-birthday order expectation to place Jomana after Manef, matching the new October 22 date.
- Focused integration tests passed: 2 files / 18 tests. Full suite passed: 20 files / 108 tests. Lint and production build passed.
- `git diff --check origin/feature/student-birthdates..HEAD` will be run after the integration alignment commit.
