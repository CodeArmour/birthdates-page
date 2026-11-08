import { describe, expect, it } from "vitest";

import {
  daysUntilBirthday,
  getNextBirthday,
  getTodaysBirthdays,
  sortByUpcomingBirthday,
} from "./date";
import type { StudentBirthday } from "./types";

function student(
  id: string,
  name: string,
  birthDate: string,
): StudentBirthday {
  return { id, name, birthDate };
}

describe("getNextBirthday", () => {
  it("returns the start of today when the birthday is today", () => {
    const ada = student("ada", "Ada", "2012-04-18");

    expect(getNextBirthday(ada, new Date(2026, 3, 18, 23, 45))).toEqual(
      new Date(2026, 3, 18),
    );
  });

  it("rolls a birthday that has passed into the next year", () => {
    const grace = student("grace", "Grace", "2011-12-09");

    expect(getNextBirthday(grace, new Date(2026, 11, 10, 8))).toEqual(
      new Date(2027, 11, 9),
    );
  });

  it("keeps February 29 in a leap year", () => {
    const river = student("river", "River", "2012-02-29");

    expect(getNextBirthday(river, new Date(2024, 1, 28, 20))).toEqual(
      new Date(2024, 1, 29),
    );
  });

  it("celebrates February 29 on February 28 in a non-leap year", () => {
    const river = student("river", "River", "2012-02-29");

    expect(getNextBirthday(river, new Date(2023, 1, 28, 20))).toEqual(
      new Date(2023, 1, 28),
    );
  });
});

describe("daysUntilBirthday", () => {
  it("counts local calendar days across a year boundary", () => {
    const nora = student("nora", "Nora", "2012-01-01");

    expect(daysUntilBirthday(nora, new Date(2026, 11, 31, 23, 59))).toBe(1);
  });
});

describe("getTodaysBirthdays", () => {
  it("returns only birthdays celebrated on the supplied local date", () => {
    const leapDay = student("leap", "Leap", "2012-02-29");
    const ordinary = student("ordinary", "Ordinary", "2012-02-28");
    const later = student("later", "Later", "2012-03-01");

    expect(
      getTodaysBirthdays(
        [leapDay, ordinary, later],
        new Date(2023, 1, 28, 22),
      ),
    ).toEqual([leapDay, ordinary]);
  });
});

describe("sortByUpcomingBirthday", () => {
  it("orders upcoming birthdays without changing equal-date input order", () => {
    const later = student("later", "Later", "2012-01-05");
    const firstTie = student("first-tie", "First tie", "2012-01-02");
    const today = student("today", "Today", "2012-12-30");
    const secondTie = student("second-tie", "Second tie", "2013-01-02");
    const students = [later, firstTie, today, secondTie];

    expect(
      sortByUpcomingBirthday(students, new Date(2026, 11, 30, 16)),
    ).toEqual([today, firstTie, secondTie, later]);
    expect(students).toEqual([later, firstTie, today, secondTie]);
  });
});
