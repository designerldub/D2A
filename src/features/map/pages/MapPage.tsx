import styles from '../../_shared/PlaceholderPage.module.css'

export function MapPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Map</h1>
        <p className={styles.subtitle}>Interactive Map</p>
      </header>
      <div className={styles.canvas} aria-label="Map placeholder">
        <span className={styles.hint}>Design goes here</span>
      </div>
    </div>
  )
}
