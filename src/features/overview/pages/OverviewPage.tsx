import styles from '../../_shared/PlaceholderPage.module.css'

export function OverviewPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Overview</h1>
        <p className={styles.subtitle}>Dashboard</p>
      </header>
      <div className={styles.canvas} aria-label="Overview placeholder">
        <span className={styles.hint}>Design goes here</span>
      </div>
    </div>
  )
}
