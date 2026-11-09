import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import BirthdayDashboard from "./BirthdayDashboard";

const STORAGE_KEY = "student-birthdays:v1";

function installNotification(
  permission: NotificationPermission,
  requestedPermission: NotificationPermission = permission,
  requestError?: Error,
) {
  const notifications: Array<{ body?: string; title: string }> = [];
  const requestPermission = requestError
    ? vi.fn().mockRejectedValue(requestError)
    : vi.fn().mockResolvedValue(requestedPermission);

  class FakeNotification {
    static permission = permission;
    static requestPermission = requestPermission;

    constructor(title: string, options?: NotificationOptions) {
      notifications.push({ title, body: options?.body });
    }
  }

  Object.defineProperty(window, "Notification", {
    configurable: true,
    value: FakeNotification,
  });

  return { notifications, requestPermission };
}

describe("birthday dashboard", () => {
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

  it("immediately renders all 39 built-in birthdays without an upload", () => {
    render(<BirthdayDashboard />);

    expect(screen.getAllByRole("article")).toHaveLength(39);
    expect(screen.getByRole("heading", { name: "Noella" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Omar" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "No birthdays yet" })).not.toBeInTheDocument();
  });

  it("has no public CSV, replace-data, or class controls", () => {
    const { container } = render(<BirthdayDashboard />);

    expect(container.querySelector('input[type="file"]')).toBeNull();
    expect(screen.queryByLabelText(/choose csv/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /import|upload|replace data/i })).not.toBeInTheDocument();
    expect(screen.queryByText(/csv/i)).not.toBeInTheDocument();
    expect(screen.queryByRole("combobox")).not.toBeInTheDocument();
  });

  it("ignores previously saved birthdays and never reads or writes birthday records", async () => {
    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify([{ id: "old", name: "Legacy", birthDate: "2000-11-05" }]),
    );
    const getItem = vi.spyOn(Storage.prototype, "getItem");
    const setItem = vi.spyOn(Storage.prototype, "setItem");
    const { notifications } = installNotification("granted");
    render(<BirthdayDashboard />);

    await act(async () => {});
    expect(screen.getAllByRole("article")).toHaveLength(39);
    expect(screen.queryByText("Legacy")).not.toBeInTheDocument();
    expect(getItem).not.toHaveBeenCalledWith(STORAGE_KEY);
    expect(getItem.mock.calls).toEqual([
      ["student-birthdays:last-notified-local-date:v1"],
    ]);
    expect(setItem.mock.calls).toEqual([
      ["student-birthdays:last-notified-local-date:v1", "2026-11-05"],
    ]);
    expect(setItem.mock.calls.every(([key]) => key !== STORAGE_KEY)).toBe(true);
    expect(setItem.mock.calls.every(([, value]) => !value.includes("birthDate"))).toBe(true);
    expect(notifications).toEqual([
      { title: "A birthday today! 🎉", body: "Noella is celebrating today." },
    ]);
  });

  it("searches upcoming birthdays by first name regardless of case or surrounding spaces", async () => {
    render(<BirthdayDashboard />);
    await screen.findByRole("region", { name: "Today's birthdays" });

    const search = screen.getByRole("searchbox", { name: "Search students" });
    fireEvent.change(search, { target: { value: "  oMaR  " } });
    const upcoming = screen.getByRole("region", { name: "Upcoming birthdays" });
    expect(within(upcoming).getAllByRole("article")).toHaveLength(1);
    expect(within(upcoming).getByRole("heading", { name: "Omar" })).toBeInTheDocument();
    expect(within(upcoming).queryByRole("heading", { name: "Kadhim" })).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "" } });
    expect(within(upcoming).getAllByRole("article")).toHaveLength(38);
  });

  it("highlights today's built-in birthdays without displaying birth years", async () => {
    const { container } = render(<BirthdayDashboard />);

    const today = await screen.findByRole("region", { name: "Today's birthdays" });
    expect(within(today).getByRole("heading", { name: "Noella" })).toBeInTheDocument();
    expect(within(today).getByText("Today")).toBeInTheDocument();
    expect(within(today).getByText("November 5")).toBeInTheDocument();
    for (const time of container.querySelectorAll("time")) {
      expect(time.getAttribute("datetime")).toMatch(/^2000-/);
      expect(time).not.toHaveTextContent(/\d{4}/);
    }
  });

  it("requests notification permission only after the enable action", async () => {
    const { requestPermission } = installNotification("default", "granted");
    render(<BirthdayDashboard />);

    const enableButton = await screen.findByRole("button", {
      name: "Enable birthday notifications",
    });
    expect(requestPermission).not.toHaveBeenCalled();

    fireEvent.click(enableButton);

    expect(requestPermission).toHaveBeenCalledTimes(1);
    expect(
      await screen.findByText(
        "Birthday notifications are enabled while this page is open.",
      ),
    ).toBeInTheDocument();
  });

  it("shows a retryable status when notification permission rejects", async () => {
    const { requestPermission } = installNotification(
      "default",
      "default",
      new Error("Permission prompt failed"),
    );
    render(<BirthdayDashboard />);

    fireEvent.click(
      await screen.findByRole("button", {
        name: "Enable birthday notifications",
      }),
    );

    expect(
      await screen.findByText(
        "We couldn't enable birthday notifications. Try again or check your browser settings.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", {
        name: "Try birthday notifications again",
      }),
    ).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search students" })).toBeEnabled();
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });

  it.each([
    [
      "denied",
      "Birthday notifications are blocked in your browser settings.",
    ],
    [
      "unsupported",
      "Birthday notifications are not supported in this browser.",
    ],
  ] as const)("keeps the dashboard usable when notifications are %s", async (state, message) => {
    if (state === "denied") {
      installNotification("denied");
    }
    render(<BirthdayDashboard />);

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search students" })).toBeEnabled();
  });

  it("shows an accessible celebration that closes with its focused button", async () => {
    render(<BirthdayDashboard />);

    const celebration = await screen.findByRole("dialog", {
      name: "Today's birthday celebration",
    });
    expect(celebration).toHaveAttribute("aria-live", "polite");
    expect(celebration).toHaveAttribute("aria-modal", "true");
    expect(within(celebration).getByText("Noella")).toBeInTheDocument();
    const close = within(celebration).getByRole("button", { name: "Close celebration" });
    await waitFor(() => expect(close).toHaveFocus());

    fireEvent.click(close);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("dismisses the celebration with Escape", async () => {
    render(<BirthdayDashboard />);

    fireEvent.keyDown(
      await screen.findByRole("dialog", { name: "Today's birthday celebration" }),
      { key: "Escape" },
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("refreshes today's and upcoming birthdays across local midnight", async () => {
    vi.setSystemTime(new Date(2026, 2, 4, 23, 59, 30));
    render(<BirthdayDashboard />);

    expect(screen.queryByRole("region", { name: "Today's birthdays" })).not.toBeInTheDocument();
    expect(await screen.findByText(/No birthdays today/)).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_001);
    });

    const today = screen.getByRole("region", { name: "Today's birthdays" });
    expect(
      within(today).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(["Erdem", "Anna"]);
    const upcoming = screen.getByRole("region", { name: "Upcoming birthdays" });
    expect(within(upcoming).queryByRole("heading", { name: "Erdem" })).not.toBeInTheDocument();
    expect(within(upcoming).queryByRole("heading", { name: "Anna" })).not.toBeInTheDocument();
    expect(within(upcoming).getAllByRole("article")).toHaveLength(37);
  });

  it("orders upcoming birthdays by next celebration date and keeps same-day source order", async () => {
    vi.setSystemTime(new Date(2026, 0, 30, 12));
    render(<BirthdayDashboard />);
    await act(async () => {});

    const upcoming = screen.getByRole("region", { name: "Upcoming birthdays" });
    expect(
      within(upcoming).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
    ).toEqual([
      "Sara", "Peter", "Birgit", "Lieve", "Omar", "Maria", "Akim", "Erdem", "Anna", "Duru", "Lee",
      "Victory", "Defne", "Johans", "Celine", "Charbel", "Edgem", "Amanda", "Emaan",
      "Hajar", "Liza", "Mohammed", "Eva", "Fren", "Eureolle", "Trawat", "Nidal",
      "Maks", "Els", "Ali", "Saja", "Noella", "Kadhim", "Trinity", "Ginny", "Nabila", "Bill",
      "Eva", "Guerin",
    ]);
  });

  it("shows a useful no-results state and keeps today's celebration visible", async () => {
    render(<BirthdayDashboard />);
    await screen.findByRole("region", { name: "Today's birthdays" });
    fireEvent.change(
      screen.getByRole("searchbox", { name: "Search students" }),
      { target: { value: "not a student" } },
    );

    expect(screen.getByRole("heading", { name: "No matches found" })).toBeInTheDocument();
    const today = screen.getByRole("region", { name: "Today's birthdays" });
    expect(within(today).getByRole("heading", { name: "Noella" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "No upcoming birthdays" })).not.toBeInTheDocument();
  });
});
