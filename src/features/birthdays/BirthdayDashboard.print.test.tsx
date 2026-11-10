import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import BirthdayDashboard from "./BirthdayDashboard";
import { BUILT_IN_BIRTHDAYS } from "./builtInBirthdays";

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
});

describe("dashboard PDF export", () => {
  it("opens browser printing exactly once only after an export click", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    render(<BirthdayDashboard />);
    await act(async () => {});

    expect(print).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Export PDF" }));
    expect(print).toHaveBeenCalledTimes(1);
  });

  it("exports every built-in birthday even when the screen search has no matches", async () => {
    const { container } = render(<BirthdayDashboard />);
    await act(async () => {});
    fireEvent.change(screen.getByRole("searchbox", { name: "Search students" }), {
      target: { value: "no matching student" },
    });

    expect(screen.getByRole("heading", { name: "No matches found" })).toBeInTheDocument();
    const calendar = container.querySelector("[data-print-calendar]");
    expect(calendar).not.toBeNull();
    expect(calendar?.querySelectorAll("li")).toHaveLength(62);
    for (const student of BUILT_IN_BIRTHDAYS) {
      expect(within(calendar as HTMLElement).getAllByText(student.name).length).toBeGreaterThan(0);
    }
    expect(calendar).toHaveAttribute("aria-hidden", "true");
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
  });

  it("translates the export action and print calendar while keeping the header credit", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    const { container } = render(<BirthdayDashboard />);
    await act(async () => {});
    fireEvent.click(screen.getByRole("button", { name: "Switch to Nederlands" }));

    expect(screen.getByText("Ontwikkeld door", { exact: false, selector: "header p" })).toHaveTextContent("Ontwikkeld door Omar");
    const calendar = container.querySelector("[data-print-calendar]") as HTMLElement;
    expect(calendar).not.toBeNull();
    expect(calendar).toHaveAttribute("lang", "nl");
    expect(within(calendar).getByText("Verjaardagenkalender")).toBeInTheDocument();
    expect(within(calendar).getByText("Januari")).toBeInTheDocument();
    expect(within(calendar).getByText("December")).toBeInTheDocument();
    expect(print).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "PDF exporteren" }));
    expect(print).toHaveBeenCalledTimes(1);
  });
});
