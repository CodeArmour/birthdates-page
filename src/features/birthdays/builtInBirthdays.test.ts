import { describe, expect, it } from "vitest";

import { BUILT_IN_BIRTHDAYS } from "./builtInBirthdays";

describe("public built-in birthdays", () => {
  it("contains exactly the 39 approved sanitized records", () => {
    expect(BUILT_IN_BIRTHDAYS).toEqual([
      { id: "builtin-01", name: "Omar", birthDate: "2000-02-13" },
      { id: "builtin-02", name: "Defne", birthDate: "2000-03-21" },
      { id: "builtin-03", name: "Eureolle", birthDate: "2000-08-02" },
      { id: "builtin-04", name: "Erdem", birthDate: "2000-03-05" },
      { id: "builtin-05", name: "Anna", birthDate: "2000-03-05" },
      { id: "builtin-06", name: "Kadhim", birthDate: "2000-11-24" },
      { id: "builtin-07", name: "Celine", birthDate: "2000-04-17" },
      { id: "builtin-08", name: "Mohammed", birthDate: "2000-07-03" },
      { id: "builtin-09", name: "Johans", birthDate: "2000-04-12" },
      { id: "builtin-10", name: "Charbel", birthDate: "2000-04-21" },
      { id: "builtin-11", name: "Maria", birthDate: "2000-02-25" },
      { id: "builtin-12", name: "Eva", birthDate: "2000-07-11" },
      { id: "builtin-13", name: "Duru", birthDate: "2000-03-11" },
      { id: "builtin-14", name: "Victory", birthDate: "2000-03-16" },
      { id: "builtin-15", name: "Liza", birthDate: "2000-05-15" },
      { id: "builtin-16", name: "Amanda", birthDate: "2000-04-30" },
      { id: "builtin-17", name: "Peter", birthDate: "2000-02-01" },
      { id: "builtin-18", name: "Ali", birthDate: "2000-10-11" },
      { id: "builtin-19", name: "Nabila", birthDate: "2000-01-16" },
      { id: "builtin-20", name: "Bill", birthDate: "2000-01-18" },
      { id: "builtin-22", name: "Guerin", birthDate: "2000-01-21" },
      { id: "builtin-23", name: "Sara", birthDate: "2000-01-31" },
      { id: "builtin-24", name: "Trinity", birthDate: "2000-01-03" },
      { id: "builtin-25", name: "Akim", birthDate: "2000-02-25" },
      { id: "builtin-26", name: "Lee", birthDate: "2000-03-11" },
      { id: "builtin-27", name: "Edgem", birthDate: "2000-04-28" },
      { id: "builtin-28", name: "Emaan", birthDate: "2000-05-04" },
      { id: "builtin-29", name: "Hajar", birthDate: "2000-05-07" },
      { id: "builtin-30", name: "Fren", birthDate: "2000-07-20" },
      { id: "builtin-31", name: "Trawat", birthDate: "2000-08-15" },
      { id: "builtin-32", name: "Maks", birthDate: "2000-09-10" },
      { id: "builtin-33", name: "Nidal", birthDate: "2000-09-06" },
      { id: "builtin-34", name: "Saja", birthDate: "2000-10-30" },
      { id: "builtin-35", name: "Noella", birthDate: "2000-11-05" },
      { id: "builtin-36", name: "Els", birthDate: "2000-09-30" },
      { id: "builtin-37", name: "Ginny", birthDate: "2000-01-07" },
      { id: "builtin-38", name: "Eva", birthDate: "2000-01-19" },
      { id: "builtin-39", name: "Birgit", birthDate: "2000-02-09" },
      { id: "builtin-40", name: "Lieve", birthDate: "2000-02-12" },
    ]);
  });

  it("uses unique IDs and single-token first names that may repeat", () => {
    expect(BUILT_IN_BIRTHDAYS).toHaveLength(39);
    expect(new Set(BUILT_IN_BIRTHDAYS.map(({ id }) => id)).size).toBe(39);
    for (const student of BUILT_IN_BIRTHDAYS) {
      expect(student.name).toMatch(/^\p{L}+$/u);
      expect(Object.keys(student).sort()).toEqual(["birthDate", "id", "name"]);
    }
  });

  it("keeps both Eva birthdays as separate records", () => {
    expect(BUILT_IN_BIRTHDAYS.filter(({ name }) => name === "Eva")).toEqual([
      { id: "builtin-12", name: "Eva", birthDate: "2000-07-11" },
      { id: "builtin-38", name: "Eva", birthDate: "2000-01-19" },
    ]);
  });

  it("uses valid month/day values with the leap-safe placeholder year 2000", () => {
    for (const { birthDate } of BUILT_IN_BIRTHDAYS) {
      expect(birthDate).toMatch(/^2000-\d{2}-\d{2}$/);
      const date = new Date(`${birthDate}T00:00:00Z`);
      expect(date.toISOString().slice(0, 10)).toBe(birthDate);
      expect(new Date(Date.UTC(date.getUTCFullYear(), 1, 29)).getUTCMonth()).toBe(1);
    }
  });
});
