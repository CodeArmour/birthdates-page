# Public Built-In Birthdays Design

## Intent

Show the supplied group birthdays immediately on the public page without asking visitors to upload a CSV, while avoiding publication of full student identities or real birth years.

## Approved privacy model

- Publish first names only. The source contains 35 unique first names, so no disambiguating surname data is needed.
- Publish only birth month and day. Represent dates internally with the non-real leap-safe year `2000` so the existing birthday calculations remain reusable.
- Never copy the private source CSV, full names, or real birth years into the repository, browser storage, page markup, or documentation.

## Page behavior

- Load the sanitized built-in dataset directly when the page opens.
- Remove CSV upload and replacement controls from the public interface.
- Keep search, upcoming-birthday ordering, notifications, and celebrations.
- Hide the class filter when the built-in data has no class values.

## Compatibility and scope

- Keep the existing CSV parser and importer source files for possible future private/local reuse, but do not expose them in the public page.
- Do not add dependencies or change notification behavior.
