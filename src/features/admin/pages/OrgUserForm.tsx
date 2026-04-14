import { useState, useEffect, type FormEvent } from 'react'
import type { Organization, OrgUser } from './AdminPage'
import { IconArrowLeft, IconTrash, IconWarning } from '../adminIcons'
import styles from './OrgUserForm.module.css'

const OREGON_COUNTIES = [
  'Baker', 'Benton', 'Clackamas', 'Clatsop', 'Columbia', 'Coos', 'Crook', 'Curry',
  'Deschutes', 'Douglas', 'Gilliam', 'Grant', 'Harney', 'Hood River', 'Jackson',
  'Jefferson', 'Josephine', 'Klamath', 'Lake', 'Lane', 'Lincoln', 'Linn', 'Malheur',
  'Marion', 'Morrow', 'Multnomah', 'Polk', 'Sherman', 'Tillamook', 'Umatilla',
  'Union', 'Wallowa', 'Wasco', 'Washington', 'Wheeler', 'Yamhill',
]

type Props = {
  mode: 'add' | 'edit'
  org: Organization
  orgs: Organization[]
  initialData?: OrgUser
  onSave: (data: Omit<OrgUser, 'id'>) => void
  onCancel: () => void
  onDelete?: () => void
}

function Toggle({
  id,
  checked,
  onChange,
}: {
  id: string
  checked: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <label className={styles.toggleLabel} htmlFor={id}>
      <input
        id={id}
        type="checkbox"
        className={styles.toggleInput}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={styles.toggleSlider} />
    </label>
  )
}

export function OrgUserForm({ mode, org, orgs, initialData, onSave, onCancel, onDelete }: Props) {
  const [firstName, setFirstName] = useState(initialData?.firstName ?? '')
  const [lastName, setLastName] = useState(initialData?.lastName ?? '')
  const [email, setEmail] = useState(initialData?.email ?? '')
  const [county, setCounty] = useState(initialData?.county ?? (org.counties[0] ?? ''))
  const [orgId, setOrgId] = useState(initialData ? String(org.id) : String(org.id))
  const [isResearchParticipant, setIsResearchParticipant] = useState(initialData?.isResearchParticipant ?? true)
  const [authorizationCapacity, setAuthorizationCapacity] = useState(initialData?.authorizationCapacity ?? false)
  const [dataAccessUpload, setDataAccessUpload] = useState(initialData?.dataAccessUpload ?? false)
  const [isAdmin, setIsAdmin] = useState(initialData?.isAdmin ?? false)
  const [careJourneyAccess, setCareJourneyAccess] = useState(initialData?.careJourneyAccess ?? false)
  const [userStoriesAccess, setUserStoriesAccess] = useState(initialData?.userStoriesAccess ?? false)
  const [mapAccess, setMapAccess] = useState(initialData?.mapAccess ?? false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showToast, setShowToast] = useState(false)

  useEffect(() => {
    if (!showToast) return
    const timer = setTimeout(() => setShowToast(false), 4000)
    return () => clearTimeout(timer)
  }, [showToast])

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    onSave({ firstName, lastName, email, county, orgId, isResearchParticipant, authorizationCapacity, dataAccessUpload, isAdmin, careJourneyAccess, userStoriesAccess, mapAccess })
  }

  function handleDelete() {
    if (!confirmDelete) { setConfirmDelete(true); setShowToast(true); return }
    onDelete?.()
  }

  const title = mode === 'add' ? 'Add User' : 'Edit User'
  const submitLabel = mode === 'add' ? 'Add User' : 'Save Changes'

  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <button type="button" className={styles.backBtn} onClick={onCancel} aria-label="Go back">
          <IconArrowLeft />
          Back
        </button>
      </div>
      <h1 className={styles.title}>{title}</h1>
      <p className={styles.subtitle}>
        {org.name} · {org.counties.join(', ')} {org.counties.length === 1 ? 'County' : 'Counties'}
      </p>
      <hr className={styles.divider} />

      <form onSubmit={handleSubmit}>
        {/* ── Research Participant ── */}
        <section className={styles.section}>
          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Research Participant</span>
              <span className={styles.toggleDesc}>Participation in research</span>
            </div>
            <Toggle id="researchParticipant" checked={isResearchParticipant} onChange={setIsResearchParticipant} />
          </div>
        </section>

        <hr className={styles.divider} />

        {/* ── User Information ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>User Information</h2>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="firstName">First Name</label>
              <input id="firstName" className={styles.input} type="text" placeholder="First Name" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="lastName">Last Name</label>
              <input id="lastName" className={styles.input} type="text" placeholder="Last Name" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="email">Email</label>
            <input id="email" className={styles.input} type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="county">County</label>
              <select id="county" className={styles.select} value={county} onChange={(e) => setCounty(e.target.value)}>
                <option value="" disabled>Select County</option>
                {OREGON_COUNTIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="orgId">Organization</label>
              <select id="orgId" className={styles.select} value={orgId} onChange={(e) => setOrgId(e.target.value)}>
                {orgs.map((o) => <option key={o.id} value={String(o.id)}>{o.name}</option>)}
              </select>
            </div>
          </div>

        </section>

        <hr className={styles.divider} />

        {/* ── User Permissions ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>User Permissions</h2>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Authorization Capacity</span>
              <span className={styles.toggleDesc}>Approve users' submissions</span>
            </div>
            <Toggle id="authorizationCapacity" checked={authorizationCapacity} onChange={setAuthorizationCapacity} />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Data access/upload</span>
              <span className={styles.toggleDesc}>Access and upload data</span>
            </div>
            <Toggle id="dataAccessUpload" checked={dataAccessUpload} onChange={setDataAccessUpload} />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Admin</span>
              <span className={styles.toggleDesc}>Full administrative access</span>
            </div>
            <Toggle id="isAdmin" checked={isAdmin} onChange={setIsAdmin} />
          </div>
        </section>

        <hr className={styles.divider} />

        {/* ── Data Product Access ── */}
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Data Product Access</h2>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Care Journey Access</span>
              <span className={styles.toggleDesc}>Access to Care Journey data</span>
            </div>
            <Toggle id="careJourney" checked={careJourneyAccess} onChange={setCareJourneyAccess} />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>User Stories Access</span>
              <span className={styles.toggleDesc}>Access to User Stories data</span>
            </div>
            <Toggle id="userStories" checked={userStoriesAccess} onChange={setUserStoriesAccess} />
          </div>

          <div className={styles.toggleRow}>
            <div className={styles.toggleInfo}>
              <span className={styles.toggleTitle}>Map Access</span>
              <span className={styles.toggleDesc}>Access to Map data</span>
            </div>
            <Toggle id="mapAccess" checked={mapAccess} onChange={setMapAccess} />
          </div>
        </section>

        <hr className={styles.divider} />

        {/* ── Actions ── */}
        <div className={styles.actions}>
          <div className={styles.actionsLeft}>
            <button type="submit" className={styles.primaryBtn}>{submitLabel}</button>
            <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
          </div>
          {mode === 'edit' && onDelete && (
            <button type="button" className={confirmDelete ? styles.deleteConfirmBtn : styles.deleteBtn} onClick={handleDelete}>
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
          <button className={styles.toastClose} onClick={() => setShowToast(false)} aria-label="Dismiss">×</button>
        </div>
      )}
    </div>
  )
}

