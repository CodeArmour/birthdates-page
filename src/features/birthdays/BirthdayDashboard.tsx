"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import BirthdayCard from "./BirthdayCard";
import Celebration from "./Celebration";
import { BUILT_IN_BIRTHDAYS } from "./builtInBirthdays";
import {
  getTodaysBirthdays,
  sortByUpcomingBirthday,
} from "./date";
import {
  getNotificationState,
  notifyBirthdays,
  requestBirthdayNotifications,
  type NotificationState,
} from "./notifications";
import styles from "./BirthdayDashboard.module.css";
import type { StudentBirthday } from "./types";

export default function BirthdayDashboard() {
  const [students] = useState<StudentBirthday[]>(() => [...BUILT_IN_BIRTHDAYS]);
  const [search, setSearch] = useState("");
  // Match server HTML before reading the visitor's date and browser permissions.
  const [now, setNow] = useState<Date | null>(null);
  const [notificationState, setNotificationState] =
    useState<NotificationState | null>(null);
  const [dismissedCelebration, setDismissedCelebration] = useState<string | null>(
    null,
  );

  useEffect(() => {
    let cancelled = false;
    queueMicrotask(() => {
      if (!cancelled) {
        setNow(new Date());
        setNotificationState(getNotificationState());
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!now) {
      return;
    }
    const currentTime = new Date();
    const nextMidnight = new Date(currentTime);
    nextMidnight.setHours(24, 0, 0, 0);
    const timer = window.setTimeout(() => {
      setNow(new Date());
    }, nextMidnight.getTime() - currentTime.getTime());

    return () => window.clearTimeout(timer);
  }, [now]);

  const todaysBirthdays = useMemo(
    () => now ? getTodaysBirthdays(students, now) : [],
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
      now ? sortByUpcomingBirthday(
        students.filter((student) => !todayIds.has(student.id)),
        now,
      ) : students,
    [now, students, todayIds],
  );
  const filteredUpcoming = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();

    return upcomingBirthdays.filter(
      (student) =>
        query.length === 0 ||
        student.name.toLocaleLowerCase().includes(query),
    );
  }, [search, upcomingBirthdays]);

  useEffect(() => {
    if (notificationState === "granted") {
      notifyBirthdays(todaysBirthdays);
    }
  }, [notificationState, todaySignature, todaysBirthdays]);

  async function enableNotifications() {
    const nextState = await requestBirthdayNotifications();
    setNotificationState(nextState);

    if (nextState === "granted") {
      notifyBirthdays(todaysBirthdays);
    }
  }

  function notificationMessage() {
    if (notificationState === null) {
      return "Checking birthday reminders...";
    }

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
      </header>

      <section className={styles.hero} aria-labelledby="page-title">
        <p className={styles.eyebrow}>The class celebration calendar</p>
        <h1 id="page-title">Student birthdays</h1>
        <p className={styles.intro}>
          Keep every special day in sight, from today&apos;s celebrations to
          the birthdays coming up next.
        </p>
      </section>

      <section className={styles.partnerStrip} aria-labelledby="partners-title">
        <div className={styles.partnerHeading}>
          <p className={styles.eyebrow}>In collaboration with</p>
          <h2 id="partners-title">A shared celebration</h2>
        </div>
        <div className={styles.partnerLogos}>
          <div className={styles.partnerCard}>
            <Image
              className={styles.linguapolisLogo}
              src="/branding/linguapolis-logo.jpg"
              alt="University of Antwerp — Linguapolis"
              width={1624}
              height={425}
              sizes="(max-width: 600px) 80vw, (max-width: 760px) 40vw, 352px"
            />
          </div>
          <div className={styles.partnerCard}>
            <Image
              className={styles.universityLogo}
              src="/branding/university-of-antwerp-logo.png"
              alt="Universiteit Antwerpen"
              width={738}
              height={243}
              sizes="(max-width: 600px) 75vw, (max-width: 760px) 36vw, 272px"
            />
          </div>
        </div>
      </section>

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
        ) : now ? (
          <p className={styles.quietToday}>No birthdays today — the next celebration is on its way.</p>
        ) : null}

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
                <span>Search students</span>
                <input
                  type="search"
                  value={search}
                  placeholder="Try a first name"
                  onChange={(event) => setSearch(event.currentTarget.value)}
                />
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
              {search.length === 0 ? (
                <>
                  <h3>No upcoming birthdays</h3>
                  <p>Today&apos;s celebrations are the only ones on the calendar.</p>
                </>
              ) : (
                <>
                  <h3>No matches found</h3>
                  <p>Try another first name.</p>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      {celebrationOpen && todaysBirthdays.length > 0 ? (
        <Celebration
          students={todaysBirthdays}
          onDismiss={() => setDismissedCelebration(todaySignature)}
        />
      ) : null}
    </main>
  );
}
