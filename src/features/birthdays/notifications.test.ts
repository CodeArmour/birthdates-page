import { beforeEach, describe, expect, it, vi } from "vitest";

import type { StudentBirthday } from "./types";

const students: StudentBirthday[] = [
  {
    id: "maya:2012-11-08",
    name: "Maya Chen",
    birthDate: "2012-11-08",
  },
  {
    id: "sam:2013-11-08",
    name: "Sam Rivera",
    birthDate: "2013-11-08",
  },
];

interface InstalledNotification {
  notifications: Array<{ body?: string; title: string }>;
  requestPermission: ReturnType<typeof vi.fn>;
}

function installNotification(
  permission: NotificationPermission,
  requestedPermission: NotificationPermission = permission,
): InstalledNotification {
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

describe("birthday notifications", () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.resetModules();
    vi.useRealTimers();
    Reflect.deleteProperty(window, "Notification");
  });

  it("reports unsupported when the browser has no notification API", async () => {
    const { getNotificationState } = await import("./notifications");

    expect(getNotificationState()).toBe("unsupported");
  });

  it.each(["default", "granted", "denied"] as const)(
    "reports the browser's %s permission state without requesting permission",
    async (permission) => {
      const { requestPermission } = installNotification(permission);
      const { getNotificationState } = await import("./notifications");

      expect(getNotificationState()).toBe(permission);
      expect(requestPermission).not.toHaveBeenCalled();
    },
  );

  it("requests permission only when the request action is called", async () => {
    const { requestPermission } = installNotification("default", "granted");
    const { getNotificationState, requestBirthdayNotifications } = await import(
      "./notifications"
    );

    getNotificationState();
    expect(requestPermission).not.toHaveBeenCalled();

    await expect(requestBirthdayNotifications()).resolves.toBe("granted");
    expect(requestPermission).toHaveBeenCalledTimes(1);
  });

  it("summarizes multiple birthdays in one notification", async () => {
    const { notifications } = installNotification("granted");
    const { notifyBirthdays } = await import("./notifications");

    notifyBirthdays(students);

    expect(notifications).toHaveLength(1);
    expect(notifications[0].title).toContain("2 birthdays today");
    expect(notifications[0].body).toContain("Maya Chen");
    expect(notifications[0].body).toContain("Sam Rivera");
  });

  it("does not repeat a notification on rerender or reload on the same local date", async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 10, 8, 9));
    const { notifications } = installNotification("granted");
    const firstModule = await import("./notifications");

    firstModule.notifyBirthdays(students);
    firstModule.notifyBirthdays(students);
    vi.resetModules();
    const reloadedModule = await import("./notifications");
    reloadedModule.notifyBirthdays(students);

    expect(notifications).toHaveLength(1);
    expect(
      window.localStorage.getItem(
        "student-birthdays:last-notified-local-date:v1",
      ),
    ).toBe("2026-11-08");
  });
});
