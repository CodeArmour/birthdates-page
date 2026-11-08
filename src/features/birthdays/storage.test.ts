import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { loadBirthdays, saveBirthdays } from "./storage";
import type { StudentBirthday } from "./types";

const STORAGE_KEY = "student-birthdays:v1";

describe("birthday storage", () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    window.localStorage.clear();
  });

  it("returns an empty list when no saved birthdays exist", () => {
    expect(loadBirthdays()).toEqual([]);
  });

  it("round-trips student birthdays through the versioned key", () => {
    const students: StudentBirthday[] = [
      {
        id: "ada:2012-04-18",
        name: "Ada Lovelace",
        birthDate: "2012-04-18",
        className: "Class 7A",
        message: "Have a brilliant day!",
      },
    ];

    saveBirthdays(students);

    expect(window.localStorage.getItem(STORAGE_KEY)).toBe(
      JSON.stringify(students),
    );
    expect(loadBirthdays()).toEqual(students);
  });

  it("returns an empty list for corrupt JSON", () => {
    window.localStorage.setItem(STORAGE_KEY, "not-json");

    expect(loadBirthdays()).toEqual([]);
  });

  it("returns an empty list when a restored student is invalid", () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([
        { id: "river", name: "River", birthDate: "2011-02-29" },
      ]),
    );

    expect(loadBirthdays()).toEqual([]);
  });

  it("is safe when browser storage is unavailable", () => {
    vi.spyOn(window, "localStorage", "get").mockImplementation(() => {
      throw new Error("Storage is unavailable");
    });

    expect(loadBirthdays()).toEqual([]);
    expect(() =>
      saveBirthdays([
        { id: "ada", name: "Ada", birthDate: "2012-04-18" },
      ]),
    ).not.toThrow();
  });

  it("is safe when rendered without a browser window", () => {
    vi.stubGlobal("window", undefined);

    expect(loadBirthdays()).toEqual([]);
    expect(() => saveBirthdays([])).not.toThrow();
  });
});
