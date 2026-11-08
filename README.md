# Student Birthdates

A standalone Next.js page for importing student birthdays and highlighting upcoming celebrations.

## Local setup

Use Node.js `^22.22.2`, `^24.15.0`, or `>=26.0.0`. The included `.nvmrc`
selects Node.js 24.15.0 when using a compatible Node version manager.

```bash
nvm use
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

For day-to-day development, `npm run dev` starts the local Next.js server.
Use `npm run build` to make a production build and `npm start` to run that
build.

## CSV format

Import a CSV file with `name` and `birthDate` columns. Dates must use the
`YYYY-MM-DD` format. The `className` and `message` columns are optional.

```csv
name,birthDate,className,message
Mira Sunfield,2012-04-18,Class 7A,Have a fantastic birthday!
```

A fictional sample file is available at
[`public/examples/student-birthdays.csv`](public/examples/student-birthdays.csv).

Importing a new valid CSV replaces the currently saved student list. The page
stores imported birthdays only in this browser's `localStorage`; nothing is
sent to a server. Anyone who uses the same shared browser profile can view the
stored student data. To clear the list, clear this site's browser storage. To
replace it, use **Replace data** and select another valid CSV.

## Birthday notifications

The page asks for notification permission only when you press **Enable
birthday notifications**. If permission is blocked, change it from your
browser's site settings. Notifications are frontend-only: they are checked
while this page is open and cannot arrive after the page or browser is closed.

## Checks

```bash
npm test -- --run
npm run lint
npm run build
```
