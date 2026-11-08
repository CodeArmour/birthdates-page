import type { StudentBirthday } from "./types";

export type NotificationState =
  | "unsupported"
  | "default"
  | "granted"
  | "denied"
  | "error";

const LAST_NOTIFIED_LOCAL_DATE_KEY =
  "student-birthdays:last-notified-local-date:v1";

let lastNotifiedLocalDateInMemory: string | null = null;

function localDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function notificationApi(): typeof Notification | null {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return null;
  }

  return window.Notification;
}

function namesForSentence(students: StudentBirthday[]): string {
  const names = students.map((student) => student.name);

  if (names.length === 1) {
    return names[0];
  }

  if (names.length === 2) {
    return names.join(" and ");
  }

  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)}`;
}

export function getNotificationState(): NotificationState {
  const api = notificationApi();
  return api ? api.permission : "unsupported";
}

export async function requestBirthdayNotifications(): Promise<NotificationState> {
  const api = notificationApi();
  if (!api) {
    return "unsupported";
  }

  if (api.permission !== "default") {
    return api.permission;
  }

  try {
    return await api.requestPermission();
  } catch {
    return "error";
  }
}

export function notifyBirthdays(students: StudentBirthday[]): void {
  const api = notificationApi();
  if (!api || api.permission !== "granted" || students.length === 0) {
    return;
  }

  const today = localDateKey(new Date());
  let storedDate: string | null = null;

  try {
    storedDate = window.localStorage.getItem(LAST_NOTIFIED_LOCAL_DATE_KEY);
  } catch {
    // Notifications can still be deduplicated for this page session.
  }

  if (storedDate === today || lastNotifiedLocalDateInMemory === today) {
    return;
  }

  lastNotifiedLocalDateInMemory = today;
  try {
    window.localStorage.setItem(LAST_NOTIFIED_LOCAL_DATE_KEY, today);
  } catch {
    // Browser storage is optional; the in-memory guard still prevents repeats.
  }

  const count = students.length;
  const title =
    count === 1 ? "A birthday today! 🎉" : `${count} birthdays today! 🎉`;
  const verb = count === 1 ? "is" : "are";

  try {
    new api(title, {
      body: `${namesForSentence(students)} ${verb} celebrating today.`,
      tag: `student-birthdays-${today}`,
    });
  } catch {
    // A granted browser may still decline to display a system notification.
  }
}
