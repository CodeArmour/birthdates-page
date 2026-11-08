import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Page from "./page";

describe("student birthdays page", () => {
  it("shows one primary heading and the CSV import control", () => {
    render(<Page />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Student birthdays" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(
      screen.getByRole("button", { name: "Import CSV" }),
    ).toBeInTheDocument();
  });
});
