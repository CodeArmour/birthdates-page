import {
  act,
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import BirthdayDashboard from "./BirthdayDashboard";
import type { StudentBirthday } from "./types";

const STORAGE_KEY = "student-birthdays:v1";

function installNotification(
  permission: NotificationPermission,
  requestedPermission: NotificationPermission = permission,
) {
  const notifications: Array<{ body?: string; title: string }> = [];
  const requestPermission = vi.fn().mockResolvedValue(requestedPermission);

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

function storeStudents(students: StudentBirthday[]) {
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(students));
}

function csvFile(contents: string) {
  const file = new File([contents], "birthdays.csv", { type: "text/csv" });
  Object.defineProperty(file, "text", {
    value: vi.fn().mockResolvedValue(contents),
  });
  return file;
}

function uploadCsv(contents: string) {
  fireEvent.change(screen.getByLabelText("Choose CSV file"), {
    target: { files: [csvFile(contents)] },
  });
}

const todayStudent: StudentBirthday = {
  id: "maya:2012-11-08",
  name: "Maya Chen",
  birthDate: "2012-11-08",
  className: "Class 7A",
  message: "Have a brilliant birthday!",
};

const futureStudents: StudentBirthday[] = [
  {
    id: "zoe:2013-12-02",
    name: "Zoe Bell",
    birthDate: "2013-12-02",
    className: "Class 7B",
  },
  {
    id: "ari:2012-11-09",
    name: "Ari Singh",
    birthDate: "2012-11-09",
    className: "Class 7A",
  },
  {
    id: "leo:2012-11-20",
    name: "Leo Park",
    birthDate: "2012-11-20",
    className: "Class 8A",
  },
];

describe("birthday dashboard", () => {
  beforeEach(() => {
    window.localStorage.clear();
    Reflect.deleteProperty(window, "Notification");
    vi.useFakeTimers({ shouldAdvanceTime: true });
    vi.setSystemTime(new Date(2026, 10, 8, 12));
  });

  afterEach(() => {
    cleanup();
    vi.useRealTimers();
  });

  it("replaces stored birthdays after importing a CSV with valid rows", async () => {
    storeStudents([todayStudent]);
    render(<BirthdayDashboard />);

    uploadCsv(
      "name,birthDate,className,message\nNoah Williams,2013-11-14,Class 7C,Enjoy your day!",
    );

    expect(await screen.findByText("Imported 1 student. Rejected 0 rows.")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Noah Williams" })).toBeInTheDocument();
    expect(screen.queryByText("Maya Chen")).not.toBeInTheDocument();
    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]")).toEqual([
      expect.objectContaining({ name: "Noah Williams", className: "Class 7C" }),
    ]);
  });

  it.each([
    ["invalid", "name,birthDate\n,not-a-date"],
    ["header-only", "name,birthDate"],
    ["empty", ""],
  ])(
    "preserves stored birthdays after a %s import",
    async (_case, csvContents) => {
      storeStudents([todayStudent]);
      render(<BirthdayDashboard />);

      uploadCsv(csvContents);

      expect(
        await screen.findByText("No students were imported. Rejected 1 row."),
      ).toBeInTheDocument();
      expect(
        screen.getByRole("heading", { name: "Maya Chen" }),
      ).toBeInTheDocument();
      expect(
        JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? "[]"),
      ).toEqual([todayStudent]);
    },
  );

  it("shows accepted and rejected counts with row-specific feedback", async () => {
    render(<BirthdayDashboard />);

    uploadCsv(
      "name,birthDate,className\nSam Rivera,2012-11-18,Class 7A\nTaylor Reed,18/11/2012,Class 7B",
    );

    expect(await screen.findByText("Imported 1 student. Rejected 1 row.")).toBeInTheDocument();
    expect(screen.getByText("Row 3: birthDate must use the YYYY-MM-DD format.")).toBeInTheDocument();
  });

  it("counts multiple validation errors on one CSV row as one rejected row", async () => {
    render(<BirthdayDashboard />);

    uploadCsv("className,message\nClass 7A,Hello");

    expect(
      await screen.findByText("No students were imported. Rejected 1 row."),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("No students were imported. Rejected 2 rows."),
    ).not.toBeInTheDocument();
  });

  it("searches upcoming birthdays by student name or class", async () => {
    storeStudents(futureStudents);
    render(<BirthdayDashboard />);

    const search = await screen.findByRole("searchbox", {
      name: "Search students or classes",
    });
    fireEvent.change(search, { target: { value: "ari" } });
    expect(screen.getByRole("heading", { name: "Ari Singh" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Zoe Bell" })).not.toBeInTheDocument();

    fireEvent.change(search, { target: { value: "class 7b" } });
    expect(screen.getByRole("heading", { name: "Zoe Bell" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Ari Singh" })).not.toBeInTheDocument();
  });

  it("filters upcoming birthdays with the class selector", async () => {
    storeStudents(futureStudents);
    render(<BirthdayDashboard />);

    fireEvent.change(
      await screen.findByRole("combobox", { name: "Filter by class" }),
      {
        target: { value: "Class 8A" },
      },
    );

    expect(screen.getByRole("heading", { name: "Leo Park" })).toBeInTheDocument();
    expect(screen.queryByRole("heading", { name: "Ari Singh" })).not.toBeInTheDocument();
  });

  it("highlights today's birthdays and their personal messages", async () => {
    storeStudents([todayStudent, ...futureStudents]);
    render(<BirthdayDashboard />);

    const today = await screen.findByRole("region", {
      name: "Today's birthdays",
    });
    expect(within(today).getByRole("heading", { name: "Maya Chen" })).toBeInTheDocument();
    expect(
      within(today).getByText(/Have a brilliant birthday!/),
    ).toBeInTheDocument();
    expect(within(today).getByText("Today")).toBeInTheDocument();
  });

  it("requests notification permission only after the enable action", async () => {
    storeStudents([todayStudent]);
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
    storeStudents(futureStudents);
    if (state === "denied") {
      installNotification("denied");
    }
    render(<BirthdayDashboard />);

    expect(await screen.findByText(message)).toBeInTheDocument();
    expect(screen.getByRole("searchbox", { name: "Search students or classes" })).toBeEnabled();
  });

  it("shows an accessible celebration that closes with its button", async () => {
    storeStudents([todayStudent]);
    render(<BirthdayDashboard />);

    const celebration = await screen.findByRole("dialog", {
      name: "Today's birthday celebration",
    });
    expect(celebration).toHaveAttribute("aria-live", "polite");
    expect(within(celebration).getByText("Maya Chen")).toBeInTheDocument();
    expect(
      within(celebration).getByText("Have a brilliant birthday!"),
    ).toBeInTheDocument();

    fireEvent.click(
      within(celebration).getByRole("button", { name: "Close celebration" }),
    );

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("dismisses the celebration with Escape", async () => {
    storeStudents([todayStudent]);
    render(<BirthdayDashboard />);

    const celebration = await screen.findByRole("dialog", {
      name: "Today's birthday celebration",
    });
    fireEvent.keyDown(celebration, { key: "Escape" });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("removes celebration motion when reduced motion is requested", () => {
    const styles = readFileSync(
      resolve(
        process.cwd(),
        "src/features/birthdays/Celebration.module.css",
      ),
      "utf8",
    );
    const reducedMotionRule = styles.match(
      /@media\s*\(prefers-reduced-motion:\s*reduce\)\s*\{([\s\S]*)\}\s*$/,
    )?.[1];

    expect(reducedMotionRule).toMatch(/animation:\s*none/);
  });

  it("refreshes today's and upcoming birthdays across local midnight", async () => {
    vi.setSystemTime(new Date(2026, 10, 8, 23, 59, 30));
    storeStudents([todayStudent, futureStudents[1]]);
    render(<BirthdayDashboard />);

    const beforeMidnight = await screen.findByRole("region", {
      name: "Today's birthdays",
    });
    expect(
      within(beforeMidnight).getByRole("heading", { name: "Maya Chen" }),
    ).toBeInTheDocument();

    await act(async () => {
      await vi.advanceTimersByTimeAsync(30_001);
    });

    const afterMidnight = screen.getByRole("region", {
      name: "Today's birthdays",
    });
    expect(
      within(afterMidnight).getByRole("heading", { name: "Ari Singh" }),
    ).toBeInTheDocument();
    expect(
      within(afterMidnight).queryByRole("heading", { name: "Maya Chen" }),
    ).not.toBeInTheDocument();

    const upcoming = screen.getByRole("region", {
      name: "Upcoming birthdays",
    });
    expect(
      within(upcoming).getByRole("heading", { name: "Maya Chen" }),
    ).toBeInTheDocument();
    expect(
      within(upcoming).queryByRole("heading", { name: "Ari Singh" }),
    ).not.toBeInTheDocument();
  });

  it("orders upcoming birthdays by the next celebration date", async () => {
    storeStudents(futureStudents);
    render(<BirthdayDashboard />);

    const upcoming = await screen.findByRole("region", {
      name: "Upcoming birthdays",
    });
    expect(
      within(upcoming).getAllByRole("heading", { level: 3 }).map((heading) => heading.textContent),
    ).toEqual(["Ari Singh", "Leo Park", "Zoe Bell"]);
  });

  it("shows useful empty and no-results states", async () => {
    const { unmount } = render(<BirthdayDashboard />);
    expect(screen.getByRole("heading", { name: "No birthdays yet" })).toBeInTheDocument();
    unmount();

    storeStudents(futureStudents);
    render(<BirthdayDashboard />);
    fireEvent.change(
      await screen.findByRole("searchbox", {
        name: "Search students or classes",
      }),
      {
        target: { value: "not in this class" },
      },
    );

    await waitFor(() => {
      expect(screen.getByRole("heading", { name: "No matches found" })).toBeInTheDocument();
    });
  });

  it("says there are no upcoming birthdays when only today's records exist", async () => {
    storeStudents([todayStudent]);
    render(<BirthdayDashboard />);

    const upcoming = await screen.findByRole("region", {
      name: "Upcoming birthdays",
    });
    expect(
      within(upcoming).getByRole("heading", {
        name: "No upcoming birthdays",
      }),
    ).toBeInTheDocument();
    expect(
      within(upcoming).queryByRole("heading", { name: "No matches found" }),
    ).not.toBeInTheDocument();
  });
});
