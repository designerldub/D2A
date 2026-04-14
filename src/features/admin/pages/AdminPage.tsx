import { useState, useMemo } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { IconEdit } from '../adminIcons'
import styles from './AdminPage.module.css'
import { SuperAdminForm } from './SuperAdminForm'
import { OrgForm } from './OrgForm'
import { OrgUsersPage } from './OrgUsersPage'
import { OrgUserForm } from './OrgUserForm'
import { ServiceIcon } from './serviceIcons'

// ── Types ────────────────────────────────────────────

export type SuperAdmin = {
  id: number
  firstName: string
  lastName: string
  email: string
}

export type Organization = {
  id: number
  name: string
  address: string
  counties: string[]
  category: string
  contactName: string
  contactEmail: string
  contactPhone: string
  hours: string
  description: string
  services: string[]
}

export type OrgUser = {
  id: number
  firstName: string
  lastName: string
  email: string
  county: string
  orgId: string
  isResearchParticipant: boolean
  authorizationCapacity: boolean
  dataAccessUpload: boolean
  isAdmin: boolean
  careJourneyAccess: boolean
  userStoriesAccess: boolean
  mapAccess: boolean
}

// ── Mock data ────────────────────────────────────────

const DATA_PRODUCTS = [
  { id: 'care-journey', name: 'Care Journey', status: 'Active' },
  { id: 'user-stories', name: 'User Stories', status: 'Active' },
  { id: 'map', name: 'Map', status: 'Active' },
]

const INITIAL_SUPER_ADMINS: SuperAdmin[] = [
  { id: 1, firstName: 'Brooke',  lastName: 'Reichel',    email: 'brooke@d2a.org' },
  { id: 2, firstName: 'Erik',    lastName: 'White',      email: 'erik@d2a.org' },
  { id: 3, firstName: 'Theresa', lastName: 'McCullough', email: 'theresa@d2a.org' },
]

function emptyContact() {
  return { contactName: '', contactEmail: '', contactPhone: '', hours: '', description: '' }
}

const INITIAL_ORGANIZATIONS: Organization[] = [
  { id: 1, name: 'Organization A', address: '', counties: ['Lane'],           category: 'Housing',                     services: ['Housing', 'Food Resources'],                             ...emptyContact() },
  { id: 2, name: 'Organization B', address: '', counties: ['Baker'],          category: 'Food Resources',              services: ['Food Resources'],                                        ...emptyContact() },
  { id: 3, name: 'Organization C', address: '', counties: ['Coos'],           category: 'Behavioral Health Resources', services: ['Behavioral Health Resources', 'stabilization center'],   ...emptyContact() },
  { id: 4, name: 'Organization D', address: '', counties: ['Douglas'],        category: 'Emergency Department',        services: ['Emergency Department', 'naloxone availability'],         ...emptyContact() },
  { id: 5, name: 'Organization E', address: '', counties: ['Baker'],          category: 'Food Resources',              services: ['Housing', 'Food Resources'],                             ...emptyContact() },
  { id: 6, name: 'Organization F', address: '', counties: ['Lane'],           category: 'stabilization center',        services: ['stabilization center'],                                  ...emptyContact() },
  { id: 7, name: 'Organization G', address: '', counties: ['Coos'],           category: 'Behavioral Health Resources', services: ['naloxone availability'],                                 ...emptyContact() },
  { id: 8, name: 'Organization H', address: '', counties: ['Baker', 'Coos'], category: 'Emergency Department',        services: ['Emergency Department', 'Food Resources'],                ...emptyContact() },
]

const INITIAL_ORG_USERS: Record<number, OrgUser[]> = {
  1: [
    { id: 101, firstName: 'Jane', lastName: 'Doe',    email: 'jane@lane.org',    county: 'Lane',    orgId: '1', isResearchParticipant: true,  authorizationCapacity: true,  dataAccessUpload: true,  isAdmin: true,  careJourneyAccess: true,  userStoriesAccess: true,  mapAccess: false },
    { id: 102, firstName: 'Tom',  lastName: 'Evans',  email: 'tom@lane.org',     county: 'Lane',    orgId: '1', isResearchParticipant: false, authorizationCapacity: false, dataAccessUpload: true,  isAdmin: false, careJourneyAccess: true,  userStoriesAccess: false, mapAccess: true  },
  ],
  3: [
    { id: 103, firstName: 'Mia',  lastName: 'Carter', email: 'mia@coos.org',     county: 'Coos',    orgId: '3', isResearchParticipant: true,  authorizationCapacity: false, dataAccessUpload: true,  isAdmin: false, careJourneyAccess: false, userStoriesAccess: true,  mapAccess: true  },
  ],
  4: [
    { id: 104, firstName: 'Luis', lastName: 'Reyes',  email: 'luis@douglas.org', county: 'Douglas', orgId: '4', isResearchParticipant: false, authorizationCapacity: true,  dataAccessUpload: true,  isAdmin: true,  careJourneyAccess: true,  userStoriesAccess: true,  mapAccess: true  },
  ],
}

// ── View state ───────────────────────────────────────

type View =
  | { type: 'list' }
  | { type: 'add-admin' }
  | { type: 'edit-admin'; admin: SuperAdmin }
  | { type: 'add-org' }
  | { type: 'edit-org'; org: Organization }
  | { type: 'org-users'; org: Organization }
  | { type: 'add-user'; org: Organization }
  | { type: 'edit-user'; org: Organization; user: OrgUser }

// ── Sort state ───────────────────────────────────────

type SortDir = 'asc' | 'desc'

type AdminSortField = 'name'
type OrgSortField = 'name' | 'county' | 'category' | 'services'

type AdminSort = { field: AdminSortField; dir: SortDir } | null
type OrgSort = { field: OrgSortField; dir: SortDir } | null

// ── Page ─────────────────────────────────────────────

export function AdminPage() {
  const { user } = useAuth()
  const isSuperAdmin = user?.isSuperAdmin ?? false
  const orgAdminIds = user?.orgAdminIds ?? []
  const isSingleOrgAdmin = !isSuperAdmin && orgAdminIds.length === 1
  const isMultiOrgAdmin = !isSuperAdmin && orgAdminIds.length > 1

  const [view, setView] = useState<View>(() => {
    if (!isSuperAdmin && orgAdminIds.length === 1) {
      const org = INITIAL_ORGANIZATIONS.find((o) => o.id === orgAdminIds[0])
      if (org) return { type: 'org-users', org }
    }
    return { type: 'list' }
  })
  const [admins, setAdmins] = useState<SuperAdmin[]>(INITIAL_SUPER_ADMINS)
  const [orgs, setOrgs] = useState<Organization[]>(INITIAL_ORGANIZATIONS)
  const [orgUsers, setOrgUsers] = useState<Record<number, OrgUser[]>>(INITIAL_ORG_USERS)
  const [adminSort, setAdminSort] = useState<AdminSort>(null)
  const [orgSort, setOrgSort] = useState<OrgSort>(null)

  function toggleAdminSort(field: AdminSortField) {
    setAdminSort((prev) =>
      prev?.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'asc' }
    )
  }

  function toggleOrgSort(field: OrgSortField) {
    setOrgSort((prev) =>
      prev?.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'asc' }
    )
  }

  const sortedAdmins = useMemo(() => {
    if (!adminSort) return admins
    return [...admins].sort((a, b) => {
      const aVal = `${a.firstName} ${a.lastName}`.toLowerCase()
      const bVal = `${b.firstName} ${b.lastName}`.toLowerCase()
      const cmp = aVal.localeCompare(bVal)
      return adminSort.dir === 'asc' ? cmp : -cmp
    })
  }, [admins, adminSort])

  const sortedOrgs = useMemo(() => {
    if (!orgSort) return orgs
    return [...orgs].sort((a, b) => {
      let aVal = ''
      let bVal = ''
      if (orgSort.field === 'name') { aVal = a.name.toLowerCase(); bVal = b.name.toLowerCase() }
      else if (orgSort.field === 'county') { aVal = a.counties.join(', ').toLowerCase(); bVal = b.counties.join(', ').toLowerCase() }
      else if (orgSort.field === 'category') { aVal = a.category.toLowerCase(); bVal = b.category.toLowerCase() }
      else if (orgSort.field === 'services') { aVal = a.services.join(', ').toLowerCase(); bVal = b.services.join(', ').toLowerCase() }
      const cmp = aVal.localeCompare(bVal)
      return orgSort.dir === 'asc' ? cmp : -cmp
    })
  }, [orgs, orgSort])

  // Super admin handlers
  function handleAddAdmin(data: Omit<SuperAdmin, 'id'>) {
    setAdmins((prev) => [...prev, { ...data, id: Date.now() }])
    setView({ type: 'list' })
  }

  function handleEditAdmin(data: Omit<SuperAdmin, 'id'>) {
    if (view.type !== 'edit-admin') return
    setAdmins((prev) =>
      prev.map((a) => (a.id === view.admin.id ? { ...data, id: view.admin.id } : a))
    )
    setView({ type: 'list' })
  }

  function handleDeleteAdmin() {
    if (view.type !== 'edit-admin') return
    setAdmins((prev) => prev.filter((a) => a.id !== view.admin.id))
    setView({ type: 'list' })
  }

  // Organization handlers
  function handleAddOrg(data: Omit<Organization, 'id'>) {
    setOrgs((prev) => [...prev, { ...data, id: Date.now() }])
    setView({ type: 'list' })
  }

  function handleEditOrg(data: Omit<Organization, 'id'>) {
    if (view.type !== 'edit-org') return
    setOrgs((prev) =>
      prev.map((o) => (o.id === view.org.id ? { ...data, id: view.org.id } : o))
    )
    setView({ type: 'list' })
  }

  function handleDeleteOrg() {
    if (view.type !== 'edit-org') return
    setOrgs((prev) => prev.filter((o) => o.id !== view.org.id))
    setView({ type: 'list' })
  }

  // Org user handlers
  function handleAddUser(data: Omit<OrgUser, 'id'>) {
    if (view.type !== 'add-user') return
    const orgId = view.org.id
    setOrgUsers((prev) => ({
      ...prev,
      [orgId]: [...(prev[orgId] ?? []), { ...data, id: Date.now() }],
    }))
    setView({ type: 'org-users', org: view.org })
  }

  function handleEditUser(data: Omit<OrgUser, 'id'>) {
    if (view.type !== 'edit-user') return
    const orgId = view.org.id
    setOrgUsers((prev) => ({
      ...prev,
      [orgId]: (prev[orgId] ?? []).map((u) =>
        u.id === view.user.id ? { ...data, id: view.user.id } : u
      ),
    }))
    setView({ type: 'org-users', org: view.org })
  }

  function handleDeleteUser() {
    if (view.type !== 'edit-user') return
    const orgId = view.org.id
    setOrgUsers((prev) => ({
      ...prev,
      [orgId]: (prev[orgId] ?? []).filter((u) => u.id !== view.user.id),
    }))
    setView({ type: 'org-users', org: view.org })
  }

  // ── Form views ───────────────────────────────────

  if (view.type === 'add-admin') {
    return (
      <div className={styles.page}>
        <SuperAdminForm mode="add" onSave={handleAddAdmin} onCancel={() => setView({ type: 'list' })} />
      </div>
    )
  }

  if (view.type === 'edit-admin') {
    return (
      <div className={styles.page}>
        <SuperAdminForm
          mode="edit"
          initialData={view.admin}
          onSave={handleEditAdmin}
          onCancel={() => setView({ type: 'list' })}
          onDelete={handleDeleteAdmin}
        />
      </div>
    )
  }

  if (view.type === 'add-org') {
    return (
      <div className={styles.page}>
        <OrgForm mode="add" onSave={handleAddOrg} onCancel={() => setView({ type: 'list' })} />
      </div>
    )
  }

  if (view.type === 'edit-org') {
    return (
      <div className={styles.page}>
        <OrgForm
          mode="edit"
          initialData={view.org}
          onSave={handleEditOrg}
          onCancel={() => setView({ type: 'list' })}
          onDelete={handleDeleteOrg}
        />
      </div>
    )
  }

  if (view.type === 'org-users') {
    return (
      <div className={styles.page}>
        <OrgUsersPage
          org={view.org}
          users={orgUsers[view.org.id] ?? []}
          onBack={isSingleOrgAdmin ? undefined : () => setView({ type: 'list' })}
          onAdd={() => setView({ type: 'add-user', org: view.org })}
          onEdit={(u) => setView({ type: 'edit-user', org: view.org, user: u })}
        />
      </div>
    )
  }

  if (view.type === 'add-user') {
    return (
      <div className={styles.page}>
        <OrgUserForm
          mode="add"
          org={view.org}
          orgs={orgs}
          onSave={handleAddUser}
          onCancel={() => setView({ type: 'org-users', org: view.org })}
        />
      </div>
    )
  }

  if (view.type === 'edit-user') {
    return (
      <div className={styles.page}>
        <OrgUserForm
          mode="edit"
          org={view.org}
          orgs={orgs}
          initialData={view.user}
          onSave={handleEditUser}
          onCancel={() => setView({ type: 'org-users', org: view.org })}
          onDelete={handleDeleteUser}
        />
      </div>
    )
  }

  // ── List view ────────────────────────────────────

  const visibleOrgs = isMultiOrgAdmin
    ? sortedOrgs.filter((o) => orgAdminIds.includes(o.id))
    : sortedOrgs

  return (
    <div className={styles.page}>
      {isSuperAdmin && (
        <div className={styles.topRow}>
          {/* Data Products */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Data Products</h2>
            </div>
            <ul className={styles.productList}>
              {DATA_PRODUCTS.map((p) => (
                <li key={p.id} className={styles.productRow}>
                  <span className={styles.productName}>{p.name}</span>
                  <span className={styles.statusActive}>{p.status}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Super Admins */}
          <div className={styles.card}>
            <div className={styles.cardHeader}>
              <h2 className={styles.cardTitle}>Super Admins</h2>
              <button className={styles.addBtn} onClick={() => setView({ type: 'add-admin' })}>
                <span>+</span> Add
              </button>
            </div>
            <div className={styles.tableWrapper}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th className={styles.thEdit}>Edit</th>
                    <th
                      className={`${styles.th} ${styles.thSortable} ${adminSort?.field === 'name' ? styles.thActive : ''}`}
                      onClick={() => toggleAdminSort('name')}
                    >
                      User's Name <IconSortIndicator dir={adminSort?.field === 'name' ? adminSort.dir : null} />
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sortedAdmins.map((admin) => (
                    <tr key={admin.id} className={styles.tr}>
                      <td className={styles.tdEdit}>
                        <button
                          className={styles.editBtn}
                          aria-label={`Edit ${admin.firstName} ${admin.lastName}`}
                          onClick={() => setView({ type: 'edit-admin', admin })}
                        >
                          <IconEdit />
                        </button>
                      </td>
                      <td className={styles.td}>{admin.firstName} {admin.lastName}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Organizations */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Organizations</h2>
          {isSuperAdmin && (
            <button className={styles.addBtn} onClick={() => setView({ type: 'add-org' })}>
              <span>+</span> Add
            </button>
          )}
        </div>
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                {isSuperAdmin && <th className={styles.thEdit}>Edit</th>}
                <th
                  className={`${styles.th} ${styles.thSortable} ${orgSort?.field === 'name' ? styles.thActive : ''}`}
                  onClick={() => toggleOrgSort('name')}
                >
                  Organization Name <IconSortIndicator dir={orgSort?.field === 'name' ? orgSort.dir : null} />
                </th>
                <th
                  className={`${styles.th} ${styles.thSortable} ${orgSort?.field === 'county' ? styles.thActive : ''}`}
                  onClick={() => toggleOrgSort('county')}
                >
                  County <IconSortIndicator dir={orgSort?.field === 'county' ? orgSort.dir : null} />
                </th>
                <th
                  className={`${styles.th} ${styles.thSortable} ${orgSort?.field === 'category' ? styles.thActive : ''}`}
                  onClick={() => toggleOrgSort('category')}
                >
                  Category <IconSortIndicator dir={orgSort?.field === 'category' ? orgSort.dir : null} />
                </th>
                <th
                  className={`${styles.th} ${styles.thSortable} ${orgSort?.field === 'services' ? styles.thActive : ''}`}
                  onClick={() => toggleOrgSort('services')}
                >
                  Services <IconSortIndicator dir={orgSort?.field === 'services' ? orgSort.dir : null} />
                </th>
              </tr>
            </thead>
            <tbody>
              {visibleOrgs.map((org) => (
                <tr key={org.id} className={styles.tr}>
                  {isSuperAdmin && (
                    <td className={styles.tdEdit}>
                      <button
                        className={styles.editBtn}
                        aria-label={`Edit ${org.name}`}
                        onClick={() => setView({ type: 'edit-org', org })}
                      >
                        <IconEdit />
                      </button>
                    </td>
                  )}
                  <td className={styles.td}>
                    <button className={styles.orgNameBtn} onClick={() => setView({ type: 'org-users', org })}>
                      {org.name}
                    </button>
                  </td>
                  <td className={styles.td}>{org.counties.join(', ')}</td>
                  <td className={styles.td}>{org.category}</td>
                  <td className={styles.serviceCell}>
                    {org.services.map((svc) => (
                      <span key={svc} className={styles.serviceChip}>
                        <ServiceIcon name={svc} size={12} />
                        {svc}
                      </span>
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function IconSortIndicator({ dir }: { dir: SortDir | null }) {
  if (dir === null) {
    return (
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle', opacity: 0.4 }}>
        <polyline points="6 9 12 15 18 9" />
      </svg>
    )
  }
  return (
    <svg
      width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      style={{ display: 'inline', marginLeft: '4px', verticalAlign: 'middle', transform: dir === 'asc' ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

