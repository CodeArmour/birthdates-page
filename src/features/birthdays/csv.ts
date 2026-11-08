import type {
  CsvImportResult,
  CsvRowError,
  StudentBirthday,
} from "./types";

const REQUIRED_HEADERS = ["name", "birthDate"] as const;

type CsvRowsResult =
  | { rows: string[][]; syntaxError?: never }
  | { rows?: never; syntaxError: CsvRowError };

function readCsvRows(csvText: string): CsvRowsResult {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let state: "unquoted" | "quoted" | "afterQuote" = "unquoted";
  let rowNumber = 1;
  let quotedFieldRow = 1;

  for (let index = 0; index < csvText.length; index += 1) {
    const character = csvText[index];

    if (state === "quoted") {
      if (character === '"') {
        if (csvText[index + 1] === '"') {
          field += '"';
          index += 1;
        } else {
          state = "afterQuote";
        }
      } else {
        field += character;
        if (character === "\n" || character === "\r") {
          rowNumber += 1;
          if (character === "\r" && csvText[index + 1] === "\n") {
            field += "\n";
            index += 1;
          }
        }
      }
      continue;
    }

    if (state === "afterQuote") {
      if (character === ",") {
        row.push(field);
        field = "";
        state = "unquoted";
      } else if (character === "\n" || character === "\r") {
        row.push(field);
        rows.push(row);
        row = [];
        field = "";
        state = "unquoted";
        rowNumber += 1;

        if (character === "\r" && csvText[index + 1] === "\n") {
          index += 1;
        }
      } else if (character !== " " && character !== "\t") {
        return {
          syntaxError: {
            row: rowNumber,
            message: "Unexpected text after a closing quote.",
          },
        };
      }
      continue;
    }

    if (character === '"' && field.length === 0) {
      state = "quoted";
      quotedFieldRow = rowNumber;
    } else if (character === ",") {
      row.push(field);
      field = "";
    } else if (character === "\n" || character === "\r") {
      row.push(field);
      rows.push(row);
      row = [];
      field = "";
      rowNumber += 1;

      if (character === "\r" && csvText[index + 1] === "\n") {
        index += 1;
      }
    } else {
      field += character;
    }
  }

  if (state === "quoted") {
    return {
      syntaxError: {
        row: quotedFieldRow,
        message: "Quoted field is not closed.",
      },
    };
  }

  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }

  return { rows };
}

function normalizeName(name: string): string {
  return name.normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase();
}

function studentId(normalizedName: string, birthDate: string): string {
  return `${encodeURIComponent(normalizedName)}:${birthDate}`;
}

function isRealIsoDate(value: string): "format" | "calendar" | "valid" {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return "format";
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const isLeapYear = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const daysInMonth = [
    31,
    isLeapYear ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];

  if (month < 1 || month > 12 || day < 1 || day > daysInMonth[month - 1]) {
    return "calendar";
  }

  return "valid";
}

function optionalValue(row: string[], index: number | undefined) {
  if (index === undefined) {
    return undefined;
  }

  return row[index]?.trim() || undefined;
}

export function parseStudentCsv(csvText: string): CsvImportResult {
  if (csvText.trim().length === 0) {
    return {
      accepted: [],
      rejected: [{ row: 1, message: "The CSV file is empty." }],
    };
  }

  const rowsResult = readCsvRows(csvText);
  if (rowsResult.syntaxError) {
    return { accepted: [], rejected: [rowsResult.syntaxError] };
  }

  const rows = rowsResult.rows;
  const headers = rows[0].map((header, index) =>
    (index === 0 ? header.replace(/^\uFEFF/, "") : header).trim(),
  );
  const headerIndexes = new Map(
    headers.map((header, index) => [header, index] as const),
  );
  const missingHeaderErrors: CsvRowError[] = REQUIRED_HEADERS.filter(
    (header) => !headerIndexes.has(header),
  ).map((header) => ({
    row: 1,
    message: `Missing required header "${header}".`,
  }));

  if (missingHeaderErrors.length > 0) {
    return { accepted: [], rejected: missingHeaderErrors };
  }

  if (rows.length === 1) {
    return {
      accepted: [],
      rejected: [{ row: 1, message: "The CSV file has no student rows." }],
    };
  }

  const nameIndex = headerIndexes.get("name")!;
  const birthDateIndex = headerIndexes.get("birthDate")!;
  const classNameIndex = headerIndexes.get("className");
  const messageIndex = headerIndexes.get("message");
  const accepted: StudentBirthday[] = [];
  const rejected: CsvRowError[] = [];
  const seenStudents = new Set<string>();

  rows.slice(1).forEach((row, index) => {
    const rowNumber = index + 2;
    const name = row[nameIndex]?.trim() ?? "";
    const birthDate = row[birthDateIndex]?.trim() ?? "";

    if (!name) {
      rejected.push({ row: rowNumber, message: "name is required." });
      return;
    }

    if (!birthDate) {
      rejected.push({ row: rowNumber, message: "birthDate is required." });
      return;
    }

    const dateValidity = isRealIsoDate(birthDate);
    if (dateValidity === "format") {
      rejected.push({
        row: rowNumber,
        message: "birthDate must use the YYYY-MM-DD format.",
      });
      return;
    }

    if (dateValidity === "calendar") {
      rejected.push({
        row: rowNumber,
        message: "birthDate must be a real date.",
      });
      return;
    }

    const normalizedName = normalizeName(name);
    const duplicateKey = `${normalizedName}\u0000${birthDate}`;
    if (seenStudents.has(duplicateKey)) {
      rejected.push({
        row: rowNumber,
        message: "Duplicate student and birth date.",
      });
      return;
    }
    seenStudents.add(duplicateKey);

    const student: StudentBirthday = {
      id: studentId(normalizedName, birthDate),
      name,
      birthDate,
    };
    const className = optionalValue(row, classNameIndex);
    const message = optionalValue(row, messageIndex);
    if (className) {
      student.className = className;
    }
    if (message) {
      student.message = message;
    }

    accepted.push(student);
  });

  return { accepted, rejected };
}
