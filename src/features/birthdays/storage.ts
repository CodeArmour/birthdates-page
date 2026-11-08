import type { StudentBirthday } from "./types";

const STORAGE_KEY = "student-birthdays:v1";

export type SaveBirthdaysResult = { saved: true } | { saved: false };

function isValidBirthDate(value: unknown): value is string {
  if (typeof value !== "string") {
    return false;
  }

  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) {
    return false;
  }

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const isLeapYear =
    year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
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

  return (
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= daysInMonth[month - 1]
  );
}

function isStudentBirthday(value: unknown): value is StudentBirthday {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const student = value as Record<string, unknown>;

  return (
    typeof student.id === "string" &&
    student.id.trim().length > 0 &&
    typeof student.name === "string" &&
    student.name.trim().length > 0 &&
    isValidBirthDate(student.birthDate) &&
    (student.className === undefined || typeof student.className === "string") &&
    (student.message === undefined || typeof student.message === "string")
  );
}

export function loadBirthdays(): StudentBirthday[] {
  try {
    if (typeof window === "undefined") {
      return [];
    }

    const storedValue = window.localStorage.getItem(STORAGE_KEY);
    if (storedValue === null) {
      return [];
    }

    const parsedValue: unknown = JSON.parse(storedValue);
    if (
      !Array.isArray(parsedValue) ||
      !parsedValue.every(isStudentBirthday)
    ) {
      return [];
    }

    return parsedValue;
  } catch {
    return [];
  }
}

export function saveBirthdays(
  students: StudentBirthday[],
): SaveBirthdaysResult {
  try {
    if (typeof window === "undefined") {
      return { saved: false };
    }

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
    return { saved: true };
  } catch {
    return { saved: false };
  }
}
