"use client";

import { useEffect, useRef } from "react";
import { copy, type Language } from "./copy";

import styles from "./Celebration.module.css";
import type { StudentBirthday } from "./types";

interface CelebrationProps {
  onDismiss: () => void;
  students: StudentBirthday[];
  language?: Language;
}

export default function Celebration({
  onDismiss,
  students,
  language = "en",
}: CelebrationProps) {
  const text = copy[language];
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const previouslyFocused = document.activeElement;
    closeButtonRef.current?.focus();

    return () => {
      if (previouslyFocused instanceof HTMLElement) {
        previouslyFocused.focus();
      }
    };
  }, []);

  function handleKeyDown(event: React.KeyboardEvent<HTMLDivElement>) {
    if (event.key === "Escape") {
      event.preventDefault();
      onDismiss();
      return;
    }

    if (event.key === "Tab") {
      event.preventDefault();
      closeButtonRef.current?.focus();
    }
  }

  return (
    <div
      className={styles.overlay}
      role="dialog"
      aria-modal="true"
      aria-live="polite"
      aria-labelledby="celebration-title"
      aria-describedby="celebration-description"
      onKeyDown={handleKeyDown}
    >
      <div className={styles.confetti} aria-hidden="true">
        {Array.from({ length: 12 }, (_, index) => (
          <span key={index} />
        ))}
      </div>
      <section className={styles.panel}>
        <button
          ref={closeButtonRef}
          className={styles.closeButton}
          type="button"
          aria-label={text.closeCelebration}
          onClick={onDismiss}
        >
          ×
        </button>
        <p className={styles.eyebrow}>{text.celebrationEyebrow}</p>
        <h2 id="celebration-title">{text.celebrationTitle}</h2>
        <p id="celebration-description" className={styles.intro}>
          {text.celebrationDescription(students.length)}
        </p>
        <ul className={styles.students}>
          {students.map((student) => (
            <li key={student.id}>
              <strong>{student.name}</strong>
              {student.message ? <span>{student.message}</span> : null}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
