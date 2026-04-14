import { Link } from 'react-router-dom'
import styles from './StatusPage.module.css'

export function NotFoundPage() {
  return (
    <div className={styles.page}>
      <div className={styles.code}>404</div>
      <h1 className={styles.title}>Page Not Found</h1>
      <p className={styles.body}>This page doesn't exist.</p>
      <Link to="/" className={styles.link}>Go home</Link>
    </div>
  )
}
