import type { ReactNode } from 'react'
import logo from '../assets/logo.png'
import authBg from '../assets/auth-bg.jpg'
import styles from './AuthShell.module.css'

interface Props {
  children: ReactNode
}

export function AuthShell({ children }: Props) {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <img src={logo} alt="Data2Action Oregon" className={styles.logo} />
      </header>
      <div className={styles.separator} />
      <div className={styles.filterBar} />

      <div className={styles.body}>
        <img src={authBg} alt="" aria-hidden className={styles.bgPhoto} />
        <div className={styles.bgGradient} />
        <div className={styles.bgBlur} />

        <div className={styles.card}>
          {children}
        </div>
      </div>
    </div>
  )
}
