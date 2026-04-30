import styles from '../../_shared/PlaceholderPage.module.css'

export function GuidedProcessPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>User Stories</h1>
        <p className={styles.subtitle}>Guided Process</p>
      </header>
      <div className={styles.canvas} aria-label="Guided process placeholder">
        <span className={styles.hint}>Design goes here</span>
      </div>
    </div>
  )
}
