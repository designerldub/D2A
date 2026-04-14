import { Link } from 'react-router-dom'
import styles from './StatusPage.module.css'

export function UnauthorizedPage() {
  return (
    <div className={styles.page}>
      <div className={styles.code}>403</div>
      <h1 className={styles.title}>Access Restricted</h1>
      <p className={styles.body}>You don't have access to this product.</p>
      <Link to="/" className={styles.link}>Go home</Link>
    </div>
  )
}
