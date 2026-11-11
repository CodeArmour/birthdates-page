import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

import BirthdayDashboard from "./BirthdayDashboard";
import { BUILT_IN_BIRTHDAYS } from "./builtInBirthdays";

const originalStandalone = Object.getOwnPropertyDescriptor(window.navigator, "standalone");

afterEach(() => {
  cleanup();
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
  if (originalStandalone) {
    Object.defineProperty(window.navigator, "standalone", originalStandalone);
  } else {
    Reflect.deleteProperty(window.navigator, "standalone");
  }
});

function simulateIos(standalone: "browser" | "display-mode" | "navigator" = "browser") {
  vi.spyOn(window.navigator, "userAgent", "get").mockReturnValue(
    "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15",
  );
  Object.defineProperty(window.navigator, "standalone", {
    configurable: true,
    value: standalone === "navigator",
  });
  vi.stubGlobal("matchMedia", (query: string): MediaQueryList => ({
    matches: query === "(display-mode: standalone)" && standalone === "display-mode",
    media: query,
    onchange: null,
    addListener() {},
    removeListener() {},
    addEventListener() {},
    removeEventListener() {},
    dispatchEvent() { return true; },
  }));
}

describe("dashboard PDF export", () => {
  it("opens browser printing exactly once only after an export click", async () => {
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    render(<BirthdayDashboard />);
    await act(async () => {});

    expect(print).not.toHaveBeenCalled();
    fireEvent.click(screen.getByRole("button", { name: "Export PDF" }));
    expect(print).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });

  it("keeps printing synchronous and shows manual Share/Print guidance on iOS", async () => {
    simulateIos();
    let handlingClick = false;
    let printedDuringClick = false;
    const print = vi.spyOn(window, "print").mockImplementation(() => {
      printedDuringClick = handlingClick;
    });
    render(<BirthdayDashboard />);
    await act(async () => {});

    expect(screen.queryByRole("status")).not.toBeInTheDocument();
    handlingClick = true;
    fireEvent.click(screen.getByRole("button", { name: "Export PDF" }));
    handlingClick = false;

    expect(print).toHaveBeenCalledTimes(1);
    expect(printedDuringClick).toBe(true);
    expect(screen.getByRole("status")).toHaveTextContent(
      "If the print dialog did not open, tap Share, then choose Print.",
    );
  });

  it.each(["display-mode", "navigator"] as const)("shows conditional recovery guidance in iOS standalone via %s", async (signal) => {
    simulateIos(signal);
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    render(<BirthdayDashboard />);
    await act(async () => {});

    fireEvent.click(screen.getByRole("button", { name: "Export PDF" }));

    expect(print).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status").textContent).toBe(
      "If the print options did not open, open this page in Safari, then tap Share and choose Print.",
    );
  });

  it.each([
    ["browser", "Als het afdrukvenster niet opent, tik op Delen en kies daarna Druk af."],
    ["display-mode", "Als de afdrukopties niet zijn geopend, open deze pagina in Safari, tik op Delen en kies daarna Druk af."],
    ["navigator", "Als de afdrukopties niet zijn geopend, open deze pagina in Safari, tik op Delen en kies daarna Druk af."],
  ] as const)("translates existing %s guidance when switched to Dutch", async (signal, message) => {
    simulateIos(signal);
    const print = vi.spyOn(window, "print").mockImplementation(() => {});
    render(<BirthdayDashboard />);
    await act(async () => {});
    fireEvent.click(screen.getByRole("button", { name: "Export PDF" }));
    fireEvent.click(screen.getByRole("button", { name: "Switch to Nederlands" }));

    expect(print).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("status").textContent).toBe(message);
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
