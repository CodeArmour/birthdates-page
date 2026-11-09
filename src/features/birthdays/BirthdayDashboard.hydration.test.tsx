import { act, within } from "@testing-library/react";
import { hydrateRoot, type Root } from "react-dom/client";
import { renderToString } from "react-dom/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import BirthdayDashboard from "./BirthdayDashboard";

function serverMarkupAt(date: Date) {
  vi.setSystemTime(date);
  const browserWindow = window;
  vi.stubGlobal("window", undefined);
  try {
    return renderToString(<BirthdayDashboard />);
  } finally {
    vi.stubGlobal("window", browserWindow);
  }
}

async function hydrateDashboard(markup: string, check: (container: HTMLDivElement) => void) {
  const container = document.createElement("div");
  container.innerHTML = markup;
  document.body.append(container);
  const errors: unknown[] = [];
  let root: Root | undefined;
  try {
    await act(async () => {
      root = hydrateRoot(container, <BirthdayDashboard />, {
        onRecoverableError: (error) => errors.push(error),
      });
    });
    expect(errors).toEqual([]);
    check(container);
  } finally {
    await act(async () => root?.unmount());
    container.remove();
  }
}

describe("birthday dashboard hydration", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Reflect.deleteProperty(window, "Notification");
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it.each([
    ["default", "Get a reminder for today's birthdays while this page is open."],
    ["granted", "Birthday notifications are enabled while this page is open."],
    ["denied", "Birthday notifications are blocked in your browser settings."],
  ] as const)("hydrates without recovery when the browser supports %s notifications", async (permission, message) => {
    const markup = serverMarkupAt(new Date(2026, 0, 30, 12));
    const requestPermission = vi.fn();
    class BrowserNotification {
      static permission = permission;
      static requestPermission = requestPermission;
    }
    Object.defineProperty(window, "Notification", {
      configurable: true,
      value: BrowserNotification,
    });

    await hydrateDashboard(markup, (container) => {
      expect(within(container).getByText(message)).toBeInTheDocument();
      expect(within(container).getAllByRole("article")).toHaveLength(39);
      expect(requestPermission).not.toHaveBeenCalled();
      const enable = within(container).queryByRole("button", { name: "Enable birthday notifications" });
      if (permission === "default") {
        expect(enable).toBeInTheDocument();
      } else {
        expect(enable).not.toBeInTheDocument();
      }
    });
  });

  it("renders the same initial cards on different server dates, then uses the visitor's date", async () => {
    const januaryMarkup = serverMarkupAt(new Date(2026, 0, 30, 12));
    const novemberMarkup = serverMarkupAt(new Date(2026, 10, 5, 12));
    expect(januaryMarkup).toBe(novemberMarkup);
    const initialContainer = document.createElement("div");
    initialContainer.innerHTML = januaryMarkup;
    expect(within(initialContainer).getAllByRole("article")).toHaveLength(39);
    expect(within(initialContainer).queryByRole("dialog")).not.toBeInTheDocument();
    expect(within(initialContainer).queryByText(/^In \d+ days?$/)).not.toBeInTheDocument();

    await hydrateDashboard(januaryMarkup, (container) => {
      const today = within(container).getByRole("region", { name: "Today's birthdays" });
      expect(within(today).getByRole("heading", { name: "Noella" })).toBeInTheDocument();
      const upcoming = within(container).getByRole("region", { name: "Upcoming birthdays" });
      expect(within(upcoming).getAllByRole("heading", { level: 3 })[0]).toHaveTextContent("Kadhim");
      expect(within(upcoming).getByText("In 19 days")).toBeInTheDocument();
      expect(within(container).getByRole("dialog", { name: "Today's birthday celebration" })).toBeInTheDocument();
    });
  });
});
