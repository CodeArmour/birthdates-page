import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import Page from "./page";

describe("student birthdays page", () => {
  it("shows one primary heading and built-in birthdays without an import control", () => {
    const { container } = render(<Page />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Student birthdays" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 1 })).toHaveLength(1);
    expect(screen.getAllByRole("article")).toHaveLength(40);
    expect(screen.queryByRole("button", { name: /import|upload|replace data/i })).not.toBeInTheDocument();
    expect(container.querySelector('input[type="file"]')).toBeNull();
  });
});
