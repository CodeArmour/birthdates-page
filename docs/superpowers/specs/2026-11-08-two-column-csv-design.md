# Two-Column Birthday CSV Design

## Intent

Make the CSV template and user-facing instructions use only `name` and `birthDate`, so preparing student data is simple.

## Approach

Use `name,birthDate` in the downloadable example, README, dashboard hint, and import-focused tests. Keep the parser backward compatible with existing files that include optional `className` or `message` columns; existing locally stored records remain valid.

## Alternatives considered

- Reject all extra columns: stricter, but would break previously valid files without improving the requested two-column workflow.
- Remove class and message fields throughout the application: larger and unrelated to simplifying the CSV template.

## Constraints

- `birthDate` remains an ISO date in `YYYY-MM-DD` format.
- Do not add dependencies or change storage behavior.
- Preserve notification, celebration, search, and date-validation behavior.
