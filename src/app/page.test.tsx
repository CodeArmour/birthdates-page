import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import Page from "./page";

afterEach(cleanup);

describe("student birthdays page", () => {
  it("introduces both collaborators between the hero and birthday dashboard", () => {
    render(<Page />);

    const partners = screen.getByRole("region", { name: "A shared celebration" });
    expect(within(partners).getByText("In collaboration with")).toBeInTheDocument();
    expect(
      within(partners).getByRole("img", { name: "University of Antwerp — Linguapolis" }),
    ).toHaveAttribute("loading", "eager");
    expect(
      within(partners).getByRole("img", { name: "Universiteit Antwerpen" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 1 }).compareDocumentPosition(partners),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(
      partners.compareDocumentPosition(
        screen.getByRole("complementary", { name: "Birthday notifications" }),
      ),
    ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
  });

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
