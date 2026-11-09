import Image from "next/image";
import type { JSX } from "react";

import { copy, type Language } from "./copy";
import type { StudentBirthday } from "./types";
import styles from "./BirthdayPrintCalendar.module.css";

export default function BirthdayPrintCalendar({
  students,
  language,
}: {
  students: readonly StudentBirthday[];
  language: Language;
}): JSX.Element {
  const text = copy[language];
  const birthdays = students.map((student, index) => ({
    ...student,
    index,
    month: Number(student.birthDate.slice(5, 7)) - 1,
    day: student.birthDate.slice(8, 10),
  }));
  const months = Array.from({ length: 12 }, (_, month) =>
    birthdays
      .filter((student) => student.month === month)
      .sort((a, b) => Number(a.day) - Number(b.day) || a.index - b.index),
  );

  return (
    <div className={styles.sheet} data-print-calendar aria-hidden="true" lang={language}>
      <header className={styles.header}>
        <Image
          className={styles.birthdayLogo}
          src="/branding/birthday-calendar-logo.png"
          alt="Birthday desk"
          width={1254}
          height={1254}
          loading="eager"
          unoptimized
        />
        <div className={styles.heading}>
          <p className={styles.eyebrow}>{text.printEyebrow}</p>
          <h1 className={styles.title}>{text.printTitle}</h1>
          <p className={styles.subtitle}>{text.printSubtitle}</p>
        </div>
      </header>

      <div className={styles.monthGrid}>
        {months.map((birthdays, month) => (
          <section className={styles.month} key={month}>
            <h2 className={styles.monthTitle}>{text.printMonths[month]}</h2>
            <ul className={`${styles.birthdays}${birthdays.length > 9 ? ` ${styles.dense}` : ""}`}>
              {birthdays.map((student) => (
                <li className={styles.birthday} key={student.id}>
                  <span className={styles.day}>{student.day}</span>{" "}
                  <span className={styles.name}>{student.name}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
      </div>

      <div className={styles.bottomRow}>
        <div className={styles.qrCallout}>
          <Image
            className={styles.qr}
            src="/branding/birthday-calendar-qr.png"
            alt=""
            width={3000}
            height={3000}
            loading="eager"
            unoptimized
          />
          <p className={styles.qrPrompt}>{text.printQrPrompt}</p>
        </div>
        <div className={styles.partners}>
          <Image
            className={styles.universityLogo}
            src="/branding/university-of-antwerp-logo.png"
            alt="University of Antwerp"
            width={738}
            height={243}
            loading="eager"
            unoptimized
          />
          <Image
            className={styles.linguapolisLogo}
            src="/branding/linguapolis-logo.jpg"
            alt="Linguapolis"
            width={1624}
            height={425}
            loading="eager"
            unoptimized
          />
        </div>
      </div>

      <footer className={styles.footer}>
        <p className={styles.footerPhrase}>{text.printFooter}</p>
        <p className={styles.credit}>{text.printDeveloperCredit}</p>
      </footer>
    </div>
  );
}
