import { daysUntilBirthday } from "./date";
import { copy, type Language } from "./copy";
import styles from "./BirthdayDashboard.module.css";
import type { StudentBirthday } from "./types";

interface BirthdayCardProps {
  now: Date | null;
  student: StudentBirthday;
  today?: boolean;
  language?: Language;
}

function displayBirthday(birthDate: string, locale: string) {
  const [, month, day] = birthDate.split("-").map(Number);
  return new Intl.DateTimeFormat(locale, {
    month: "long",
    day: "numeric",
  }).format(new Date(2000, month - 1, day));
}

export default function BirthdayCard({
  now,
  student,
  today = false,
  language = "en",
}: BirthdayCardProps) {
  const text = copy[language];
  const daysUntil = now ? daysUntilBirthday(student, now) : null;
  const countdown =
    daysUntil === null
      ? null
      : daysUntil === 0
        ? text.today
        : text.countdown(daysUntil);

  return (
    <article className={`${styles.card} ${today ? styles.todayCard : ""}`}>
      <div className={styles.cardTopline}>
        <time dateTime={student.birthDate}>{displayBirthday(student.birthDate, text.locale)}</time>
        {countdown ? <span className={styles.countdown}>{countdown}</span> : null}
      </div>
      <h3>{student.name}</h3>
      {student.className ? (
        <p className={styles.className}>{student.className}</p>
      ) : null}
      {student.message ? (
        <p className={styles.message}>&ldquo;{student.message}&rdquo;</p>
      ) : null}
    </article>
  );
}
