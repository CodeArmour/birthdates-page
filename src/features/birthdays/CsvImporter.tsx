"use client";

import { useRef, useState } from "react";

import { parseStudentCsv } from "./csv";
import type { SaveBirthdaysResult } from "./storage";
import styles from "./BirthdayDashboard.module.css";
import type { CsvImportResult, StudentBirthday } from "./types";

interface CsvImporterProps {
  hasStudents: boolean;
  onAccepted: (students: StudentBirthday[]) => SaveBirthdaysResult;
}

function plural(count: number, singular: string, pluralForm: string) {
  return count === 1 ? singular : pluralForm;
}

export default function CsvImporter({
  hasStudents,
  onAccepted,
}: CsvImporterProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<CsvImportResult | null>(null);
  const [persistenceFailed, setPersistenceFailed] = useState(false);

  async function handleFile(file: File | undefined) {
    if (!file) {
      return;
    }

    let nextResult: CsvImportResult;
    try {
      nextResult = parseStudentCsv(await file.text());
    } catch {
      nextResult = {
        accepted: [],
        rejected: [{ row: 1, message: "The selected file could not be read." }],
      };
    }

    setResult(nextResult);
    if (nextResult.accepted.length > 0) {
      setPersistenceFailed(!onAccepted(nextResult.accepted).saved);
    }
  }

  const rejectedRowCount = result
    ? new Set(result.rejected.map((error) => error.row)).size
    : 0;
  const summary = result
    ? result.accepted.length > 0
      ? `Imported ${result.accepted.length} ${plural(result.accepted.length, "student", "students")}. Rejected ${rejectedRowCount} ${plural(rejectedRowCount, "row", "rows")}.`
      : `No students were imported. Rejected ${rejectedRowCount} ${plural(rejectedRowCount, "row", "rows")}.`
    : null;

  return (
    <div className={styles.importer}>
      <input
        ref={inputRef}
        className={styles.fileInput}
        type="file"
        accept=".csv,text/csv"
        aria-label="Choose CSV file"
        onChange={(event) => {
          void handleFile(event.currentTarget.files?.[0]);
          event.currentTarget.value = "";
        }}
      />
      <button
        className={styles.importButton}
        type="button"
        onClick={() => inputRef.current?.click()}
      >
        <span aria-hidden="true">+</span>
        {hasStudents ? "Replace data" : "Import CSV"}
      </button>

      {result && summary ? (
        <div className={styles.importFeedback} role="status" aria-live="polite">
          <p>{summary}</p>
          {persistenceFailed ? (
            <p>
              Your imported data is available for this session, but it could
              not be saved in this browser.
            </p>
          ) : null}
          {result.rejected.length > 0 ? (
            <details>
              <summary>Review rejected rows</summary>
              <ul>
                {result.rejected.map((error, index) => (
                  <li key={`${error.row}-${error.message}-${index}`}>
                    Row {error.row}: {error.message}
                  </li>
                ))}
              </ul>
            </details>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
