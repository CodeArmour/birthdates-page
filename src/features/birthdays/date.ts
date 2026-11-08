import type { StudentBirthday } from "./types";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function isLeapYear(year: number): boolean {
  return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
}

function startOfLocalDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function birthdayInYear(student: StudentBirthday, year: number): Date {
  const [, monthText, dayText] = student.birthDate.split("-");
  const month = Number(monthText);
  const day = Number(dayText);

  if (month === 2 && day === 29 && !isLeapYear(year)) {
    return new Date(year, 1, 28);
  }

  return new Date(year, month - 1, day);
}

function calendarDayNumber(date: Date): number {
  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
}

export function getNextBirthday(
  student: StudentBirthday,
  now: Date,
): Date {
  const today = startOfLocalDay(now);
  const thisYearsBirthday = birthdayInYear(student, today.getFullYear());

  if (thisYearsBirthday.getTime() >= today.getTime()) {
    return thisYearsBirthday;
  }

  return birthdayInYear(student, today.getFullYear() + 1);
}

export function daysUntilBirthday(
  student: StudentBirthday,
  now: Date,
): number {
  const today = startOfLocalDay(now);
  const nextBirthday = getNextBirthday(student, today);

  return (
    (calendarDayNumber(nextBirthday) - calendarDayNumber(today)) /
    MILLISECONDS_PER_DAY
  );
}

export function getTodaysBirthdays(
  students: StudentBirthday[],
  now: Date,
): StudentBirthday[] {
  return students.filter((student) => daysUntilBirthday(student, now) === 0);
}

export function sortByUpcomingBirthday(
  students: StudentBirthday[],
  now: Date,
): StudentBirthday[] {
  return students
    .map((student, index) => ({
      student,
      index,
      daysUntil: daysUntilBirthday(student, now),
    }))
    .sort(
      (left, right) =>
        left.daysUntil - right.daysUntil || left.index - right.index,
    )
    .map(({ student }) => student);
}
