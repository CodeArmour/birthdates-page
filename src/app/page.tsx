import styles from "./page.module.css";

export default function Home() {
  return (
    <main className={styles.page} id="main-content">
      <span className={styles.confettiOne} aria-hidden="true" />
      <span className={styles.confettiTwo} aria-hidden="true" />
      <span className={styles.confettiThree} aria-hidden="true" />

      <header className={styles.header}>
        <a className={styles.brand} href="#main-content" aria-label="Student Birthdates home">
          <span className={styles.brandMark} aria-hidden="true">
            B
          </span>
          Birthday desk
        </a>
        <button className={styles.importButton} type="button">
          <span aria-hidden="true">+</span>
          Import CSV
        </button>
      </header>

      <section className={styles.hero} aria-labelledby="page-title">
        <p className={styles.eyebrow}>The class celebration calendar</p>
        <h1 id="page-title">Student birthdays</h1>
        <p className={styles.intro}>
          Keep every special day in sight, from today&apos;s celebrations to
          the birthdays coming up next.
        </p>
      </section>

      <section className={styles.emptyState} aria-labelledby="empty-title">
        <div className={styles.calendar} aria-hidden="true">
          <span className={styles.calendarRings} />
          <span className={styles.calendarHeart}>♥</span>
        </div>
        <div>
          <p className={styles.emptyLabel}>Your calendar is ready</p>
          <h2 id="empty-title">No birthdays yet</h2>
          <p>
            Import a CSV file to add your students and see who is celebrating
            today and next.
          </p>
        </div>
      </section>

      <p className={styles.csvHint}>
        CSV columns: <strong>name</strong>, <strong>birthDate</strong>, className,
        message
      </p>
    </main>
  );
}
