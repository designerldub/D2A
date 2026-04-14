import styles from '../../_shared/PlaceholderPage.module.css'

export function VisualizationPage() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <h1 className={styles.title}>Care Journey</h1>
        <p className={styles.subtitle}>Visualization</p>
      </header>
      <div className={styles.canvas} aria-label="Visualization placeholder">
        <span className={styles.hint}>Design goes here</span>
      </div>
    </div>
  )
}
