import { useState, useEffect, type FormEvent } from 'react'
import type { SuperAdmin } from './AdminPage'
import { IconTrash, IconWarning, IconX } from '../adminIcons'
import styles from './SuperAdminForm.module.css'

type Props = {
  mode: 'add' | 'edit'
  initialData?: SuperAdmin
  onSave: (data: Omit<SuperAdmin, 'id'>) => void
  onCancel: () => void
  onDelete?: () => void
}

export function SuperAdminForm({ mode, initialData, onSave, onCancel, onDelete }: Props) {
  const [firstName, setFirstName] = useState(initialData?.firstName ?? '')
  const [lastName, setLastName]   = useState(initialData?.lastName ?? '')
  const [email, setEmail]         = useState(initialData?.email ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (!showToast) return
    const timer = setTimeout(() => setShowToast(false), 4000)
    return () => clearTimeout(timer)
  }, [showToast])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSave({ firstName, lastName, email })
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setShowToast(true)
      return
    }
    onDelete?.()
  }

  const title = mode === 'add' ? 'Add Super Admin' : 'Edit Super Admin'
  const submitLabel = mode === 'add' ? 'Add User' : 'Save Changes'

  return (
    <div className={styles.card}>
      <h1 className={styles.title}>{title}</h1>
      <hr className={styles.divider} />

      <form onSubmit={handleSubmit}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>User Information</h2>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="firstName">First Name</label>
              <input
                id="firstName"
                className={styles.input}
                type="text"
                placeholder="First Name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                required
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="lastName">Last Name</label>
              <input
                id="lastName"
                className={styles.input}
                type="text"
                placeholder="Last Name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                required
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input
              id="email"
              className={styles.input}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </section>

        <hr className={styles.divider} />

        <div className={styles.actions}>
          <div className={styles.actionsLeft}>
            <button type="submit" className={styles.primaryBtn}>{submitLabel}</button>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          </div>

          {mode === 'edit' && onDelete && (
            <button
              type="button"
              className={confirmDelete ? styles.deleteConfirmBtn : styles.deleteBtn}
              onClick={handleDelete}
            >
              <IconTrash size={14} />
              {confirmDelete ? 'Confirm delete' : 'Delete user'}
            </button>
          )}
        </div>
      </form>

      {showToast && (
        <div className={styles.toast} role="alert">
          <span className={styles.toastIcon}><IconWarning /></span>
          <span className={styles.toastMessage}>This action is permanent and cannot be undone.</span>
          <button className={styles.toastClose} onClick={() => setShowToast(false)} aria-label="Dismiss">
            <IconX />
          </button>
        </div>
      )}
    </div>
  )
}
