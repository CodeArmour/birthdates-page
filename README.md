# Student Birthdates

A standalone Next.js page for importing student birthdays and highlighting upcoming celebrations.

## Local setup

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## CSV format

Import a CSV file with `name` and `birthDate` columns. Dates must use the
`YYYY-MM-DD` format. The `className` and `message` columns are optional.

```csv
name,birthDate,className,message
Mira Sunfield,2012-04-18,Class 7A,Have a fantastic birthday!
```

A fictional sample file is available at
[`public/examples/student-birthdays.csv`](public/examples/student-birthdays.csv).

## Checks

```bash
npm test -- --run
npm run lint
npm run build
```
