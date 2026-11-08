# Student Birthdates Page Design

## Intent

Create a cheerful, easy-to-use page for viewing student birthdays, highlighting birthdays that are close or happening today, and showing a personal celebration message.

## Goals

- Import student records from a CSV file supplied by the user later.
- Show today's birthdays and an ordered list of upcoming birthdays.
- Search and filter the student list.
- Show an accessible celebration overlay and message for today's birthdays.
- Offer browser notifications after a clear user action.
- Keep imported data in the current browser so a page refresh does not lose it.
- Work well on desktop and mobile.

## Non-goals

- No backend, database, user accounts, email, SMS, or remote push service.
- No reliable notification when the browser is closed.
- No editing of the source CSV from inside the application in the first version.

## Selected approach

Use a standalone Next.js application with the App Router, TypeScript, and CSS Modules. Data is parsed in the browser and stored in `localStorage`. Birthday calculations and CSV parsing remain pure TypeScript modules so they can be tested without a browser.

Vanilla HTML/JavaScript was considered but rejected at the user's request. A backend-powered application was also considered, but it adds infrastructure that is not needed for the approved frontend-only first version.

## Data contract

The initial CSV template uses these headers:

```csv
name,birthDate,className,message
Alex Morgan,2012-04-18,Class 7A,Have a fantastic birthday!
```

- `name` and `birthDate` are required.
- `birthDate` uses `YYYY-MM-DD`.
- `className` and `message` are optional.
- Invalid rows are rejected with row-specific, plain-language feedback.
- Duplicate records with the same normalized name and birth date are imported once.

## Experience and visual direction

Use a warm classroom-celebration style: cream background, deep navy text, coral and golden accents, rounded paper-like cards, and small confetti details. The page includes an import state, a birthday dashboard, upcoming-birthday cards, search/filter controls, notification controls, and a reduced-motion-friendly celebration overlay.

Browser notification permission is requested only after the user presses an enable button. Notifications are checked while the page is running. A February 29 birthday is celebrated on February 28 in non-leap years.

## Constraints

- Project location: `C:\dev\birthdates-page`.
- Use Next.js App Router, TypeScript, and CSS Modules.
- Keep the first version frontend-only.
- Do not hardcode real student data.
- Provide a sample CSV and setup instructions.
- Include focused automated tests for parsing and birthday calculations.
