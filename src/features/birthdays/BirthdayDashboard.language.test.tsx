import { act, cleanup, fireEvent, render, screen, within } from "@testing-library/react";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import BirthdayDashboard from "./BirthdayDashboard";

describe("dashboard language switching", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Reflect.deleteProperty(window, "Notification");
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 10, 5, 12));
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it("starts in English on the server and translates the dashboard and celebration in both directions", async () => {
    const server = document.createElement("div");
    server.innerHTML = renderToString(<BirthdayDashboard />);
    expect(within(server).getByRole("main")).toHaveAttribute("lang", "en");
    expect(within(server).getByRole("heading", { name: "Student birthdays" })).toHaveTextContent("Student birthdays");
    expect(within(server).getByRole("button", { name: "Switch to Nederlands" })).toHaveTextContent("Nederlands");

    render(<BirthdayDashboard />);
    await screen.findByRole("dialog", { name: "Today's birthday celebration" });
    fireEvent.click(screen.getByRole("button", { name: "Switch to Nederlands" }));

    expect(screen.getByRole("main")).toHaveAttribute("lang", "nl");
    expect(screen.getByRole("button", { name: /^English — overschakelen naar Engels$/ })).toHaveTextContent("English");
    expect(screen.getByRole("heading", { name: "Verjaardagen van studenten" })).toBeInTheDocument();
    expect(screen.getByText("De feestkalender van de klas")).toBeInTheDocument();
    expect(screen.getByText("Houd elke bijzondere dag in het oog, van de verjaardagen van vandaag tot de volgende feestjes.")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Startpagina verjaardagen van studenten" })).toHaveTextContent("Verjaardagskalender");
    expect(screen.getByText("Ontwikkeld door", { exact: false, selector: "header p" })).toHaveTextContent("Ontwikkeld door Omar");
    expect(screen.getByText("© 2026 Verjaardagskalender")).toBeVisible();
    expect(screen.getByText("Met", { exact: false, selector: "footer p" })).toHaveTextContent(
      "Met ♥ ontwikkeld door Omar · Elke bijzondere dag verdient een klein feestje.",
    );
    expect(screen.getByText("In samenwerking met")).toBeInTheDocument();
    expect(screen.getByRole("region", { name: "Samen vieren" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "University of Antwerp — Linguapolis" })).toBeInTheDocument();
    expect(screen.getByRole("img", { name: "Universiteit Antwerpen" })).toBeInTheDocument();
    const notifications = screen.getByRole("complementary", { name: "Verjaardagsmeldingen" });
    expect(within(notifications).getByText("Verjaardagsherinneringen")).toBeInTheDocument();
    expect(within(notifications).getByText("Deze browser ondersteunt geen verjaardagsmeldingen.")).toBeInTheDocument();
    const today = screen.getByRole("region", { name: "Verjaardagen van vandaag" });
    expect(within(today).getByText("Noella")).toBeInTheDocument();
    expect(within(today).getByText("5 november")).toBeInTheDocument();
    expect(within(today).getByText("Vandaag")).toBeInTheDocument();
    const upcoming = screen.getByRole("region", { name: "Komende verjaardagen" });
    expect(within(upcoming).getByText("7 november")).toBeInTheDocument();
    expect(within(upcoming).getByText("Over 2 dagen")).toBeInTheDocument();
    const celebration = screen.getByRole("dialog", { name: "Verjaardagsfeest van vandaag" });
    expect(within(celebration).getByText("Vandaag is het tijd voor confetti")).toBeInTheDocument();
    expect(celebration).toHaveAccessibleDescription("Vandaag viert één geweldige student zijn of haar verjaardag!");
    expect(within(celebration).getByRole("button", { name: "Feestvenster sluiten" })).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Probeer een voornaam")).toHaveAccessibleName("Studenten zoeken");
    fireEvent.change(screen.getByRole("searchbox", { name: "Studenten zoeken" }), { target: { value: "no match" } });
    expect(screen.getByRole("heading", { name: "Geen resultaten gevonden" })).toBeInTheDocument();
    expect(screen.getByText("Probeer een andere voornaam.")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^English — overschakelen naar Engels$/ }));
    expect(screen.getByRole("main")).toHaveAttribute("lang", "en");
    expect(screen.getByRole("heading", { name: "Student birthdays" })).toBeInTheDocument();
    expect(screen.getByText("Developed by", { exact: false })).toHaveTextContent("Developed by Omar");
    expect(screen.getByText("© 2026 Birthday desk")).toBeVisible();
    expect(screen.getByText("Developed with", { exact: false })).toHaveTextContent(
      "Developed with ♥ by Omar · Every special day deserves a little celebration.",
    );
    expect(screen.getByRole("dialog", { name: "Today's birthday celebration" })).toHaveAccessibleDescription("One brilliant student is celebrating today!");
    expect(screen.getByRole("button", { name: "Close celebration" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "No matches found" })).toBeInTheDocument();
    fireEvent.change(screen.getByRole("searchbox", { name: "Search students" }), { target: { value: "" } });
    expect(screen.getByText("November 7")).toBeInTheDocument();
    expect(screen.getByText("In 2 days")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Switch to Nederlands" })).toBeInTheDocument();
  });

  it("uses the Dutch singular countdown and quiet-day copy", async () => {
    vi.setSystemTime(new Date(2026, 10, 4, 12));
    render(<BirthdayDashboard />);
    await act(async () => {});
    fireEvent.click(screen.getByRole("button", { name: "Switch to Nederlands" }));

    expect(screen.getByText("Over 1 dag")).toBeInTheDocument();
    expect(screen.getByText("Vandaag zijn er geen verjaardagen — het volgende feestje komt eraan.")).toBeInTheDocument();
    expect(screen.getByText("Binnenkort aan de beurt")).toBeInTheDocument();
  });

  it("keeps user-initiated notification permission and retry statuses translated", async () => {
    let attempts = 0;
    class BrowserNotification {
      static permission = "default";
      static async requestPermission() {
        attempts += 1;
        if (attempts === 1) throw new Error("Permission unavailable");
        return "granted";
      }
    }
    Object.defineProperty(window, "Notification", { configurable: true, value: BrowserNotification });
    render(<BirthdayDashboard />);
    await act(async () => {});
    fireEvent.click(screen.getByRole("button", { name: "Switch to Nederlands" }));
    expect(attempts).toBe(0);
    expect(screen.getByText("Ontvang een herinnering voor de verjaardagen van vandaag zolang deze pagina open is.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Verjaardagsmeldingen inschakelen" }));
    expect(await screen.findByText("We konden verjaardagsmeldingen niet inschakelen. Probeer opnieuw of controleer je browserinstellingen.")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Verjaardagsmeldingen opnieuw proberen" }));
    expect(await screen.findByText("Verjaardagsmeldingen zijn ingeschakeld zolang deze pagina open is.")).toBeInTheDocument();
    expect(attempts).toBe(2);
  });
});
