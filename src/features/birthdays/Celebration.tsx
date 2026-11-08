"use client";

import { useEffect, useRef } from "react";

import styles from "./Celebration.module.css";
import type { StudentBirthday } from "./types";

interface CelebrationProps {
  onDismiss: () => void;
  students: StudentBirthday[];
}

export default function Celebration({
  onDismiss,
  students,
}: CelebrationProps) {
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
          aria-label="Close celebration"
          onClick={onDismiss}
        >
          ×
        </button>
        <p className={styles.eyebrow}>Today calls for confetti</p>
        <h2 id="celebration-title">Today&apos;s birthday celebration</h2>
        <p id="celebration-description" className={styles.intro}>
          {students.length === 1
            ? "One brilliant student is celebrating today!"
            : `${students.length} brilliant students are celebrating today!`}
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
