"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";

import BirthdayCard from "./BirthdayCard";
import Celebration from "./Celebration";
import { BUILT_IN_BIRTHDAYS } from "./builtInBirthdays";
import { copy, type Language } from "./copy";
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
  const [language, setLanguage] = useState<Language>("en");
  const text = copy[language];
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

  return (
    <main className={styles.page} id="main-content" lang={language}>
      <span className={styles.confettiOne} aria-hidden="true" />
      <span className={styles.confettiTwo} aria-hidden="true" />
      <span className={styles.confettiThree} aria-hidden="true" />

      <header className={styles.header}>
        <a
          className={styles.brand}
          href="#main-content"
          aria-label={text.homeLabel}
        >
          <span className={styles.brandMark} aria-hidden="true">
            B
          </span>
          {text.brand}
        </a>
        <button
          className={styles.languageButton}
          type="button"
          aria-label={text.languageLabel}
          onClick={() => setLanguage(language === "en" ? "nl" : "en")}
        >
          <span lang={language === "en" ? "nl" : "en"}>{text.languageButton}</span>
        </button>
      </header>

      <section className={styles.hero} aria-labelledby="page-title">
        <p className={styles.eyebrow}>{text.eyebrow}</p>
        <h1 id="page-title">{text.title}</h1>
        <p className={styles.intro}>
          {text.intro}
        </p>
      </section>

      <section className={styles.partnerStrip} aria-labelledby="partners-title">
        <div className={styles.partnerHeading}>
          <p className={styles.eyebrow}>{text.partnersEyebrow}</p>
          <h2 id="partners-title">{text.partnersTitle}</h2>
        </div>
        <div className={styles.partnerLogos}>
          <div className={styles.partnerCard}>
            <Image
              className={styles.linguapolisLogo}
              src="/branding/linguapolis-logo.jpg"
              alt="University of Antwerp — Linguapolis"
              loading="eager"
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
        <aside className={styles.notificationPanel} aria-label={text.notificationLabel}>
          <div>
            <strong>{text.notificationTitle}</strong>
            <p aria-live="polite">{text.notificationMessages[notificationState ?? "checking"]}</p>
          </div>
          {notificationState === "default" || notificationState === "error" ? (
            <button type="button" onClick={enableNotifications}>
              {notificationState === "error"
                ? text.retryNotifications
                : text.enableNotifications}
            </button>
          ) : null}
        </aside>

        {todaysBirthdays.length > 0 ? (
          <section
            className={styles.todaySection}
            aria-labelledby="today-title"
            aria-label={text.todayTitle}
          >
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>{text.todayEyebrow}</p>
              <h2 id="today-title">{text.todayTitle}</h2>
            </div>
            <div className={styles.todayGrid}>
              {todaysBirthdays.map((student) => (
                <BirthdayCard
                  key={student.id}
                  now={now}
                  student={student}
                  language={language}
                  today
                />
              ))}
            </div>
          </section>
        ) : now ? (
          <p className={styles.quietToday}>{text.quietToday}</p>
        ) : null}

        <section
          className={styles.upcomingSection}
          aria-labelledby="upcoming-title"
          aria-label={text.upcomingTitle}
        >
          <div className={styles.upcomingHeading}>
            <div className={styles.sectionHeading}>
              <p className={styles.eyebrow}>{text.upcomingEyebrow}</p>
              <h2 id="upcoming-title">{text.upcomingTitle}</h2>
            </div>
            <div className={styles.filters} role="search">
              <label>
                <span>{text.search}</span>
                <input
                  type="search"
                  value={search}
                  placeholder={text.searchPlaceholder}
                  onChange={(event) => setSearch(event.currentTarget.value)}
                />
              </label>
            </div>
          </div>

          {filteredUpcoming.length > 0 ? (
            <div className={styles.cardGrid}>
              {filteredUpcoming.map((student) => (
                <BirthdayCard key={student.id} now={now} student={student} language={language} />
              ))}
            </div>
          ) : (
            <div className={styles.noResults}>
              {search.length === 0 ? (
                <>
                  <h3>{text.noUpcoming}</h3>
                  <p>{text.noUpcomingDescription}</p>
                </>
              ) : (
                <>
                  <h3>{text.noMatches}</h3>
                  <p>{text.noMatchesDescription}</p>
                </>
              )}
            </div>
          )}
        </section>
      </div>

      {celebrationOpen && todaysBirthdays.length > 0 ? (
        <Celebration
          students={todaysBirthdays}
          language={language}
          onDismiss={() => setDismissedCelebration(todaySignature)}
        />
      ) : null}
    </main>
  );
}
