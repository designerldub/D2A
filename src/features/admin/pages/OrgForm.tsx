import { useState, useRef, useEffect, type FormEvent } from 'react'
import type { Organization } from './AdminPage'
import { IconArrowLeft, IconTrash, IconWarning, IconX } from '../adminIcons'
import styles from './OrgForm.module.css'
import { ServiceIcon } from './serviceIcons'

const OREGON_COUNTIES = [
  'Baker', 'Benton', 'Clackamas', 'Clatsop', 'Columbia', 'Coos', 'Crook', 'Curry',
  'Deschutes', 'Douglas', 'Gilliam', 'Grant', 'Harney', 'Hood River', 'Jackson',
  'Jefferson', 'Josephine', 'Klamath', 'Lake', 'Lane', 'Lincoln', 'Linn', 'Malheur',
  'Marion', 'Morrow', 'Multnomah', 'Polk', 'Sherman', 'Tillamook', 'Umatilla',
  'Union', 'Wallowa', 'Wasco', 'Washington', 'Wheeler', 'Yamhill',
]

const DEFAULT_SERVICE_TYPES = [
  'Emergency Department',
  'Behavioral Health Resources',
  'Housing',
  'Food Resources',
  'naloxone availability',
  'stabilization center',
]

type Props = {
  mode: 'add' | 'edit'
  initialData?: Organization
  onSave: (data: Omit<Organization, 'id'>) => void
  onCancel: () => void
  onDelete?: () => void
}

function CountySelect({
  selected,
  onChange,
}: {
  selected: string[]
  onChange: (val: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function toggle(county: string) {
    onChange(
      selected.includes(county) ? selected.filter((c) => c !== county) : [...selected, county]
    )
  }

  const label =
    selected.length === 0
      ? 'Select counties…'
      : selected.length === 1
      ? selected[0]
      : `${selected.length} counties selected`

  return (
    <div className={styles.multiSelect} ref={ref}>
      <button
        type="button"
        className={styles.multiSelectTrigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={selected.length === 0 ? styles.placeholder : undefined}>{label}</span>
        <IconChevron open={open} />
      </button>
      {open && (
        <div className={styles.multiSelectDropdown} role="listbox" aria-multiselectable="true">
          {OREGON_COUNTIES.map((county) => {
            const checked = selected.includes(county)
            return (
              <label key={county} className={styles.checkRow}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={checked}
                  onChange={() => toggle(county)}
                />
                {county}
              </label>
            )
          })}
        </div>
      )}
    </div>
  )
}

export function OrgForm({ mode, initialData, onSave, onCancel, onDelete }: Props) {
  const [name, setName] = useState(initialData?.name ?? '')
  const [address, setAddress] = useState(initialData?.address ?? '')
  const [counties, setCounties] = useState<string[]>(initialData?.counties ?? [])
  const [category, setCategory] = useState(initialData?.category ?? '')
  const [contactName, setContactName] = useState(initialData?.contactName ?? '')
  const [contactEmail, setContactEmail] = useState(initialData?.contactEmail ?? '')
  const [contactPhone, setContactPhone] = useState(initialData?.contactPhone ?? '')
  const [hours, setHours] = useState(initialData?.hours ?? '')
  const [description, setDescription] = useState(initialData?.description ?? '')
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [showToast, setShowToast] = useState(false)

  const initialCustomTypes = initialData
    ? initialData.services.filter((s) => !DEFAULT_SERVICE_TYPES.includes(s))
    : []
  const [serviceTypes, setServiceTypes] = useState<string[]>([
    ...DEFAULT_SERVICE_TYPES,
    ...initialCustomTypes,
  ])

  const [checkedServices, setCheckedServices] = useState<Set<string>>(
    new Set(initialData?.services ?? [])
  )

  const [addingCustom, setAddingCustom] = useState(false)
  const [customInput, setCustomInput] = useState('')
  const customInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (addingCustom) customInputRef.current?.focus()
  }, [addingCustom])

  useEffect(() => {
    if (!showToast) return
    const timer = setTimeout(() => setShowToast(false), 4000)
    return () => clearTimeout(timer)
  }, [showToast])

  function toggleService(typeName: string) {
    setCheckedServices((prev) => {
      const next = new Set(prev)
      if (next.has(typeName)) next.delete(typeName)
      else next.add(typeName)
      return next
    })
  }

  function commitCustomType() {
    const trimmed = customInput.trim()
    if (trimmed && !serviceTypes.includes(trimmed)) {
      setServiceTypes((prev) => [...prev, trimmed])
      setCheckedServices((prev) => new Set([...prev, trimmed]))
    }
    setCustomInput('')
    setAddingCustom(false)
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault()
    const services = serviceTypes.filter((t) => checkedServices.has(t))
    onSave({ name, address, counties, category, contactName, contactEmail, contactPhone, hours, description, services })
  }

  function handleDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true)
      setShowToast(true)
      return
    }
    onDelete?.()
  }

  const title = mode === 'add' ? 'Add Organization' : 'Edit Organization'
  const submitLabel = mode === 'add' ? 'Add Organization' : 'Save Changes'

  return (
    <div className={styles.card}>
      <div className={styles.titleRow}>
        <button type="button" className={styles.backBtn} onClick={onCancel} aria-label="Go back">
          <IconArrowLeft />
          Back
        </button>
      </div>
      <h1 className={styles.title}>{title}</h1>
      <hr className={styles.divider} />

      <form onSubmit={handleSubmit}>
        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Organization Information</h2>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="orgName">Organization Name</label>
            <input
              id="orgName"
              className={styles.input}
              type="text"
              placeholder="Organization Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="orgAddress">Address</label>
            <input
              id="orgAddress"
              className={styles.input}
              type="text"
              placeholder="Street address, city, state, ZIP"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className={styles.field}>
            <label className={styles.label}>County</label>
            <CountySelect selected={counties} onChange={setCounties} />
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="orgCategory">Category</label>
            <select
              id="orgCategory"
              className={styles.select}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="" disabled>Select a category…</option>
              {DEFAULT_SERVICE_TYPES.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="contactName">Contact Name</label>
              <input
                id="contactName"
                className={styles.input}
                type="text"
                placeholder="Contact Name"
                value={contactName}
                onChange={(e) => setContactName(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="contactEmail">Contact Email</label>
              <input
                id="contactEmail"
                className={styles.input}
                type="email"
                placeholder="email@example.com"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.twoCol}>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="contactPhone">Contact Phone</label>
              <input
                id="contactPhone"
                className={styles.input}
                type="tel"
                placeholder="(503) 555-0100"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
            <div className={styles.field}>
              <label className={styles.label} htmlFor="hours">Hours of Operation</label>
              <input
                id="hours"
                className={styles.input}
                type="text"
                placeholder="Mon–Fri 9am–5pm"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
              />
            </div>
          </div>

          <div className={styles.field}>
            <label className={styles.label} htmlFor="description">Description</label>
            <textarea
              id="description"
              className={styles.textarea}
              placeholder="Brief description of this organization…"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </section>

        <hr className={styles.divider} />

        <section className={styles.section}>
          <h2 className={styles.sectionTitle}>Services</h2>

          <div className={styles.serviceList}>
            {serviceTypes.map((typeName) => (
              <label key={typeName} className={styles.serviceCheckRow}>
                <input
                  type="checkbox"
                  className={styles.checkbox}
                  checked={checkedServices.has(typeName)}
                  onChange={() => toggleService(typeName)}
                />
                <span className={styles.serviceIcon}>
                  <ServiceIcon name={typeName} size={14} />
                </span>
                <span className={styles.serviceLabel}>{typeName}</span>
              </label>
            ))}
          </div>

          {addingCustom ? (
            <div className={styles.customTypeRow}>
              <input
                ref={customInputRef}
                className={styles.input}
                type="text"
                placeholder="New service type name"
                value={customInput}
                onChange={(e) => setCustomInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); commitCustomType() }
                  if (e.key === 'Escape') { setAddingCustom(false); setCustomInput('') }
                }}
              />
              <button type="button" className={styles.addTypeConfirmBtn} onClick={commitCustomType}>Add</button>
              <button type="button" className={styles.cancelBtn} onClick={() => { setAddingCustom(false); setCustomInput('') }}>Cancel</button>
            </div>
          ) : (
            <button type="button" className={styles.addTypeBtn} onClick={() => setAddingCustom(true)}>
              <span>+</span> Add service type
            </button>
          )}
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
              {confirmDelete ? 'Confirm delete' : 'Delete organization'}
            </button>
          )}
        </div>
      </form>

      {showToast && (
        <div className={styles.toast} role="alert">
          <span className={styles.toastIcon}>
            <IconWarning />
          </span>
          <span className={styles.toastMessage}>This action is permanent and cannot be undone.</span>
          <button className={styles.toastClose} onClick={() => setShowToast(false)} aria-label="Dismiss">
            <IconX />
          </button>
        </div>
      )}
    </div>
  )
}

function IconChevron({ open }: { open: boolean }) {
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s', flexShrink: 0 }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

