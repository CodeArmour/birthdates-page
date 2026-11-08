import { daysUntilBirthday } from "./date";
import styles from "./BirthdayDashboard.module.css";
import type { StudentBirthday } from "./types";

interface BirthdayCardProps {
  now: Date | null;
  student: StudentBirthday;
  today?: boolean;
}

function displayBirthday(birthDate: string) {
  const [, month, day] = birthDate.split("-").map(Number);
  return new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
  }).format(new Date(2000, month - 1, day));
}

export default function BirthdayCard({
  now,
  student,
  today = false,
}: BirthdayCardProps) {
  const daysUntil = now ? daysUntilBirthday(student, now) : null;
  const countdown =
    daysUntil === null
      ? null
      : daysUntil === 0
        ? "Today"
        : `In ${daysUntil} ${daysUntil === 1 ? "day" : "days"}`;

  return (
    <article className={`${styles.card} ${today ? styles.todayCard : ""}`}>
      <div className={styles.cardTopline}>
        <time dateTime={student.birthDate}>{displayBirthday(student.birthDate)}</time>
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
