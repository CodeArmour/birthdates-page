# Student Birthdates

A standalone Next.js page showing built-in student birthdays and upcoming celebrations.

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

## Public birthday data and privacy

The public page immediately shows 40 first-name birthday records. The dataset
contains first names and birthday month/day values only. First names may repeat;
each record has a unique ID that remains internal. Surnames and real birth
years are excluded. Internal dates use the leap-safe placeholder year `2000`;
this is not a student's birth year, and the page displays only month and day.

Visitors do not upload or replace data. The public dashboard does not load or
save birthday records in browser `localStorage`, and it ignores previously
imported records. The existing CSV parser and importer source remain available
for possible future private use but are not exposed on the public page.

Notification deduplication may store the date of the last reminder in browser
storage; it does not store birthday records.

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
