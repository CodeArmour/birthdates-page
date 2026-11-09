import { fireEvent, render, screen, within } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import BirthdayDashboard from "./BirthdayDashboard";

describe("birthday dashboard logo", () => {
  it("renders the decorative logo inside the localized home link", () => {
    const { container } = render(<BirthdayDashboard />);

    const homeLink = screen.getByRole("link", { name: "Student Birthdates home" });
    const logo = container.querySelector('img[src*="/branding/birthday-calendar-logo.png"]');

    expect(logo).not.toBeNull();
    expect(logo).toHaveAttribute("alt", "");
    expect(within(homeLink).queryByRole("img")).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Switch to Nederlands" }));
    expect(
      screen.getByRole("link", { name: "Startpagina verjaardagen van studenten" }),
    ).toBeInTheDocument();
  });
});
