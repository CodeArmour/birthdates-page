import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";

import BirthdayDashboard from "./BirthdayDashboard";

afterEach(cleanup);

describe("dashboard developer branding", () => {
  // Catches missing or hidden header/footer credits, a non-semantic footer,
  // and incorrect portfolio destinations or unsafe new-tab attributes.
  it("shows the header credit and a semantic footer after the dashboard", () => {
    const { container } = render(<BirthdayDashboard />);
    const header = container.querySelector("header")!;
    const headerCredit = within(header).getByText("Developed by", { exact: false });
    expect(headerCredit).toHaveTextContent("Developed by Omar");
    expect(headerCredit).toBeVisible();
    expect(headerCredit.closest('[hidden], [aria-hidden="true"]')).toBeNull();

    const footer = container.querySelector("footer");
    expect(footer).not.toBeNull();
    expect(footer).toBeVisible();
    expect(within(footer!).getByText("© 2026 Birthday desk")).toBeVisible();
    expect(within(footer!).getByText("Developed with", { exact: false })).toHaveTextContent(
      "Developed with ♥ by Omar · Every special day deserves a little celebration.",
    );
    expect(screen.getByRole("region", { name: "Upcoming birthdays" }).compareDocumentPosition(footer!))
      .toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    expect(within(footer!).getByText("♥")).toHaveAttribute("aria-hidden", "true");
  });

  it("links both visible Omar credits to the exact portfolio in safe new tabs", () => {
    render(<BirthdayDashboard />);
    const links = screen.getAllByRole("link", { name: /^Omar$/ });
    expect(links).toHaveLength(2);
    for (const link of links) {
      expect(link).toBeVisible();
      expect(link).toHaveAttribute("href", "https://omarcode.dev/");
      expect(link).toHaveAttribute("target", "_blank");
      expect(link.getAttribute("rel")?.split(/\s+/)).toContain("noreferrer");
    }
  });
});
