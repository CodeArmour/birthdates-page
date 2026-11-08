import { describe, expect, it } from "vitest";

import { parseStudentCsv } from "./csv";

describe("parseStudentCsv", () => {
  it("imports required and optional headers with trimmed header names", () => {
    const result = parseStudentCsv(
      [
        " name , birthDate , className , message ",
        "Ada Lovelace,2012-12-10,Class 7A,Have a brilliant day!",
      ].join("\n"),
    );

    expect(result).toEqual({
      accepted: [
        {
          id: "ada-lovelace-2012-12-10",
          name: "Ada Lovelace",
          birthDate: "2012-12-10",
          className: "Class 7A",
          message: "Have a brilliant day!",
        },
      ],
      rejected: [],
    });
  });

  it("imports a file containing only the required headers", () => {
    expect(parseStudentCsv("name,birthDate\nGrace Hopper,2011-12-09")).toEqual({
      accepted: [
        {
          id: "grace-hopper-2011-12-09",
          name: "Grace Hopper",
          birthDate: "2011-12-09",
        },
      ],
      rejected: [],
    });
  });

  it("parses quoted commas, escaped quotes, and CRLF line endings", () => {
    const result = parseStudentCsv(
      'name,birthDate,className,message\r\n"River, Quinn",2013-01-05,Class 6B,"Have a ""stellar"" birthday!"\r\n',
    );

    expect(result.accepted).toEqual([
      {
        id: "river-quinn-2013-01-05",
        name: "River, Quinn",
        birthDate: "2013-01-05",
        className: "Class 6B",
        message: 'Have a "stellar" birthday!',
      },
    ]);
    expect(result.rejected).toEqual([]);
  });

  it("rejects an empty file", () => {
    expect(parseStudentCsv("  \r\n")).toEqual({
      accepted: [],
      rejected: [{ row: 1, message: "The CSV file is empty." }],
    });
  });

  it("rejects a header-only file", () => {
    expect(parseStudentCsv("name,birthDate,className,message\n")).toEqual({
      accepted: [],
      rejected: [{ row: 1, message: "The CSV file has no student rows." }],
    });
  });

  it("reports missing required headers", () => {
    expect(parseStudentCsv("name,className\nNora Reed,Class 7A")).toEqual({
      accepted: [],
      rejected: [
        { row: 1, message: 'Missing required header "birthDate".' },
      ],
    });
  });

  it("rejects dates that do not use the YYYY-MM-DD format", () => {
    const result = parseStudentCsv("name,birthDate\nMilo Stone,04/18/2012");

    expect(result).toEqual({
      accepted: [],
      rejected: [
        { row: 2, message: "birthDate must use the YYYY-MM-DD format." },
      ],
    });
  });

  it("rejects calendar dates that do not exist", () => {
    const result = parseStudentCsv("name,birthDate\nSage Turner,2011-02-29");

    expect(result).toEqual({
      accepted: [],
      rejected: [{ row: 2, message: "birthDate must be a real date." }],
    });
  });

  it.each([
    {
      label: "name",
      csv: "name,birthDate\n,2012-04-18",
      message: "name is required.",
    },
    {
      label: "birthDate",
      csv: "name,birthDate\nNova Wells,",
      message: "birthDate is required.",
    },
  ])("rejects a row with a missing $label", ({ csv, message }) => {
    expect(parseStudentCsv(csv)).toEqual({
      accepted: [],
      rejected: [{ row: 2, message }],
    });
  });

  it("imports a normalized name/date pair only once", () => {
    const result = parseStudentCsv(
      [
        "name,birthDate,className,message",
        "Avery   Lane,2012-04-18,Class 7A,First message",
        "  avery lane  ,2012-04-18,Class 7B,Duplicate message",
      ].join("\n"),
    );

    expect(result.accepted).toEqual([
      {
        id: "avery-lane-2012-04-18",
        name: "Avery   Lane",
        birthDate: "2012-04-18",
        className: "Class 7A",
        message: "First message",
      },
    ]);
    expect(result.rejected).toEqual([
      { row: 3, message: "Duplicate student and birth date." },
    ]);
  });
});
