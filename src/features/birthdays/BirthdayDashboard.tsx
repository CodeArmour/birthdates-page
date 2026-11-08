"use client";

import { useEffect, useMemo, useState } from "react";

import BirthdayCard from "./BirthdayCard";
import Celebration from "./Celebration";
import CsvImporter from "./CsvImporter";
import {
  getTodaysBirthdays,
  sortByUpcomingBirthday,
} from "./date";
import { loadBirthdays, saveBirthdays } from "./storage";
import {
  getNotificationState,
  notifyBirthdays,
  requestBirthdayNotifications,
  type NotificationState,
} from "./notifications";
import styles from "./BirthdayDashboard.module.css";
import type { StudentBirthday } from "./types";

export default function BirthdayDashboard() {
  const [students, setStudents] = useState<StudentBirthday[]>([]);
  const [search, setSearch] = useState("");
  const [classFilter, setClassFilter] = useState("");
  const [now, setNow] = useState(() => new Date());
  const [notificationState, setNotificationState] =
    useState<NotificationState>(() => getNotificationState());
  const [dismissedCelebration, setDismissedCelebration] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setStudents(loadBirthdays());
      }
    });

    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    const currentTime = new Date();
    const nextMidnight = new Date(currentTime);
    nextMidnight.setHours(24, 0, 0, 0);
    const timer = window.setTimeout(() => {
      setNow(new Date());
    }, nextMidnight.getTime() - currentTime.getTime());

    return () => window.clearTimeout(timer);
  }, [now]);

  const todaysBirthdays = useMemo(
    () => getTodaysBirthdays(students, now),
    [now, students],
  );
  const todayIds = useMemo(
    () => new Set(todaysBirthdays.map((student) => student.id)),
    [todaysBirthdays],
  );
  const todaySignature = useMemo(
    () => todaysBirthdays.map((student) => student.id).join("|"),
    [todaysBirthdays],
  );
  const celebrationOpen =
    todaysBirthdays.length > 0 && dismissedCelebration !== todaySignature;
  const upcomingBirthdays = useMemo(
    () =>
      sortByUpcomingBirthday(
        students.filter((student) => !todayIds.has(student.id)),
        now,
      ),
    [now, students, todayIds],
  );
  const classNames = useMemo(
    () =>
      Array.from(
        new Set(
          students
            .map((student) => student.className)
            .filter((className): className is string => Boolean(className)),
        ),
      ).sort((left, right) => left.localeCompare(right)),
    [students],
  );
  const filteredUpcoming = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return upcomingBirthdays.filter((student) => {
      const matchesQuery =
        query.length === 0 ||
        student.name.toLocaleLowerCase().includes(query) ||
        student.className?.toLocaleLowerCase().includes(query);
      const matchesClass =
        classFilter.length === 0 || student.className === classFilter;
      return matchesQuery && matchesClass;
    });
  }, [classFilter, search, upcomingBirthdays]);

  useEffect(() => {
    if (notificationState === "granted") {
      notifyBirthdays(todaysBirthdays);
    }
  }, [notificationState, todaySignature, todaysBirthdays]);

  function acceptImport(accepted: StudentBirthday[]) {
    setStudents(accepted);
    setSearch("");
    setClassFilter("");
    return saveBirthdays(accepted);
  }

  async function enableNotifications() {
    const nextState = await requestBirthdayNotifications();
    setNotificationState(nextState);

    if (nextState === "granted") {
      notifyBirthdays(todaysBirthdays);
    }
  }

  function notificationMessage() {
    if (notificationState === "granted") {
      return "Birthday notifications are enabled while this page is open.";
    }

    if (notificationState === "denied") {
      return "Birthday notifications are blocked in your browser settings.";
    }

    if (notificationState === "unsupported") {
      return "Birthday notifications are not supported in this browser.";
    }

    if (notificationState === "error") {
      return "We couldn't enable birthday notifications. Try again or check your browser settings.";
    }

    return "Get a reminder for today's birthdays while this page is open.";
  }

  return (
    <main className={styles.page} id="main-content">
      <span className={styles.confettiOne} aria-hidden="true" />
      <span className={styles.confettiTwo} aria-hidden="true" />
      <span className={styles.confettiThree} aria-hidden="true" />

      <header className={styles.header}>
        <a
          className={styles.brand}
          href="#main-content"
          aria-label="Student Birthdates home"
        >
          <span className={styles.brandMark} aria-hidden="true">
            B
          </span>
          Birthday desk
        </a>
        <CsvImporter hasStudents={students.length > 0} onAccepted={acceptImport} />
      </header>

      <section className={styles.hero} aria-labelledby="page-title">
        <p className={styles.eyebrow}>The class celebration calendar</p>
        <h1 id="page-title">Student birthdays</h1>
        <p className={styles.intro}>
          Keep every special day in sight, from today&apos;s celebrations to
          the birthdays coming up next.
        </p>
      </section>

      {students.length === 0 ? (
        <section className={styles.emptyState} aria-labelledby="empty-title">
          <div className={styles.calendar} aria-hidden="true">
            <span className={styles.calendarRings} />
            <span className={styles.calendarHeart}>♥</span>
          </div>
          <div>
            <p className={styles.emptyLabel}>Your calendar is ready</p>
            <h2 id="empty-title">No birthdays yet</h2>
            <p>
              Import a CSV file to add your students and see who is
              celebrating today and next.
            </p>
          </div>
        </section>
      ) : (
        <div className={styles.dashboard}>
          <aside className={styles.notificationPanel} aria-label="Birthday notifications">
            <div>
              <strong>Birthday reminders</strong>
              <p aria-live="polite">{notificationMessage()}</p>
            </div>
            {notificationState === "default" || notificationState === "error" ? (
              <button type="button" onClick={enableNotifications}>
                {notificationState === "error"
                  ? "Try birthday notifications again"
                  : "Enable birthday notifications"}
              </button>
            ) : null}
          </aside>

          {todaysBirthdays.length > 0 ? (
            <section
              className={styles.todaySection}
              aria-labelledby="today-title"
              aria-label="Today's birthdays"
            >
              <div className={styles.sectionHeading}>
                <p className={styles.eyebrow}>Make some noise</p>
                <h2 id="today-title">Today&apos;s birthdays</h2>
              </div>
              <div className={styles.todayGrid}>
                {todaysBirthdays.map((student) => (
                  <BirthdayCard
                    key={student.id}
                    now={now}
                    student={student}
                    today
                  />
                ))}
              </div>
            </section>
          ) : (
            <p className={styles.quietToday}>No birthdays today — the next celebration is on its way.</p>
          )}

          <section
            className={styles.upcomingSection}
            aria-labelledby="upcoming-title"
            aria-label="Upcoming birthdays"
          >
            <div className={styles.upcomingHeading}>
              <div className={styles.sectionHeading}>
                <p className={styles.eyebrow}>Coming up next</p>
                <h2 id="upcoming-title">Upcoming birthdays</h2>
              </div>
              <div className={styles.filters} role="search">
                <label>
                  <span>Search students or classes</span>
                  <input
                    type="search"
                    value={search}
                    placeholder="Try a name or class"
                    onChange={(event) => setSearch(event.currentTarget.value)}
                  />
                </label>
                <label>
                  <span>Filter by class</span>
                  <select
                    value={classFilter}
                    onChange={(event) => setClassFilter(event.currentTarget.value)}
                  >
                    <option value="">All classes</option>
                    {classNames.map((className) => (
                      <option key={className} value={className}>
                        {className}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>

            {filteredUpcoming.length > 0 ? (
              <div className={styles.cardGrid}>
                {filteredUpcoming.map((student) => (
                  <BirthdayCard key={student.id} now={now} student={student} />
                ))}
              </div>
            ) : (
              <div className={styles.noResults}>
                {search.length === 0 && classFilter.length === 0 ? (
                  <>
                    <h3>No upcoming birthdays</h3>
                    <p>Today&apos;s celebrations are the only ones on the calendar.</p>
                  </>
                ) : (
                  <>
                    <h3>No matches found</h3>
                    <p>Try another name, class, or filter.</p>
                  </>
                )}
              </div>
            )}
          </section>
        </div>
      )}

      <p className={styles.csvHint}>
        CSV columns: <strong>name</strong>, <strong>birthDate</strong>, className,
        message
      </p>

      {celebrationOpen && todaysBirthdays.length > 0 ? (
        <Celebration
          students={todaysBirthdays}
          onDismiss={() => setDismissedCelebration(todaySignature)}
        />
      ) : null}
    </main>
  );
}
