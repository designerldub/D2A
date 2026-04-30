import { useState, useMemo } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import { IconArrowLeft, IconEdit } from '../adminIcons'
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

export type OrgStatus = 'green' | 'yellow' | 'red' | 'na'

export type ResourceOrg = {
  id: number
  name: string
  address: string
  website: string
  counties: string[]
  category: string
  contactName: string
  contactEmail: string
  contactPhone: string
  hours: string
  description: string
  services: string[]
}

export const STATUS_RANK: Record<OrgStatus, number> = { green: 0, yellow: 1, red: 2, na: 3 }
export const STATUS_LABEL: Record<OrgStatus, string> = { green: 'Green', yellow: 'Yellow', red: 'Red', na: 'N/A' }
export const STATUS_OPTIONS: OrgStatus[] = ['green', 'yellow', 'red', 'na']

export type Organization = {
  id: number
  name: string
  address: string
  website: string
  counties: string[]
  category: string
  contactName: string
  contactEmail: string
  contactPhone: string
  hours: string
  description: string
  services: string[]
  status: OrgStatus
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
  storyTemplateAccess: boolean
  mapAccess: boolean
}

// ── Mock data ────────────────────────────────────────

const DATA_PRODUCTS = [
  { id: 'care-journey', name: 'Care Journey', status: 'Active' },
  { id: 'story-template', name: 'Story Template', status: 'Active' },
  { id: 'map', name: 'Map', status: 'Active' },
]

const INITIAL_SUPER_ADMINS: SuperAdmin[] = [
  { id: 1, firstName: 'Brooke',  lastName: 'Reichel',    email: 'brooke@d2a.org' },
  { id: 2, firstName: 'Erik',    lastName: 'White',      email: 'erik@d2a.org' },
  { id: 3, firstName: 'Theresa', lastName: 'McCullough', email: 'theresa@d2a.org' },
]

function emptyContact() {
  return { contactName: '', contactEmail: '', contactPhone: '', hours: '', description: '', website: '' }
}

const INITIAL_ORGANIZATIONS: Organization[] = [
  { id: 1, name: 'Organization A', address: '', counties: ['Lane', 'Linn'],         category: 'Housing',                     services: ['Housing', 'Food Resources'],                             status: 'green',  ...emptyContact() },
  { id: 2, name: 'Organization B', address: '', counties: ['Baker'],                category: 'Food Resources',              services: ['Food Resources'],                                        status: 'yellow', ...emptyContact() },
  { id: 3, name: 'Organization C', address: '', counties: ['Coos', 'Curry'],        category: 'Behavioral Health Resources', services: ['Behavioral Health Resources', 'stabilization center'],   status: 'green',  ...emptyContact() },
  { id: 4, name: 'Organization D', address: '', counties: ['Douglas'],              category: 'Emergency Department',        services: ['Emergency Department', 'naloxone availability'],         status: 'red',    ...emptyContact() },
  { id: 5, name: 'Organization E', address: '', counties: ['Baker', 'Union'],       category: 'Food Resources',              services: ['Housing', 'Food Resources'],                             status: 'green',  ...emptyContact() },
  { id: 6, name: 'Organization F', address: '', counties: ['Lane'],                 category: 'stabilization center',        services: ['stabilization center'],                                  status: 'yellow', ...emptyContact() },
  { id: 7, name: 'Organization G', address: '', counties: ['Coos', 'Douglas'],      category: 'Behavioral Health Resources', services: ['naloxone availability'],                                 status: 'green',  ...emptyContact() },
  { id: 8, name: 'Organization H', address: '', counties: ['Baker', 'Coos', 'Union'], category: 'Emergency Department',      services: ['Emergency Department', 'Food Resources'],                status: 'red',    ...emptyContact() },
]

const INITIAL_RESOURCE_ORGS: ResourceOrg[] = [
  { id: 1001, name: 'Mercy Recovery Services',  address: '', counties: ['Lane'],            category: 'Behavioral Health Resources', services: ['Behavioral Health Resources', 'stabilization center'], ...emptyContact() },
  { id: 1002, name: 'Riverbend Food Bank',      address: '', counties: ['Lane', 'Linn'],    category: 'Food Resources',              services: ['Food Resources'],                                       ...emptyContact() },
  { id: 1003, name: 'Hopewell Housing Trust',   address: '', counties: ['Coos', 'Curry'],   category: 'Housing',                     services: ['Housing'],                                              ...emptyContact() },
  { id: 1004, name: 'Cascade Crisis Center',    address: '', counties: ['Douglas'],         category: 'stabilization center',        services: ['stabilization center', 'naloxone availability'],        ...emptyContact() },
  { id: 1005, name: 'Northgate Naloxone Co-op', address: '', counties: ['Baker', 'Union'],  category: 'Emergency Department',        services: ['naloxone availability', 'Emergency Department'],        ...emptyContact() },
]

const INITIAL_ORG_USERS: Record<number, OrgUser[]> = {
  1: [
    { id: 101, firstName: 'Jane',  lastName: 'Doe',     email: 'jane@lane.org',    county: 'Lane',    orgId: '1', isResearchParticipant: true,  authorizationCapacity: true,  dataAccessUpload: true,  isAdmin: true,  careJourneyAccess: true,  storyTemplateAccess: true,  mapAccess: false },
    { id: 102, firstName: 'Tom',   lastName: 'Evans',   email: 'tom@lane.org',     county: 'Lane',    orgId: '1', isResearchParticipant: false, authorizationCapacity: false, dataAccessUpload: true,  isAdmin: false, careJourneyAccess: true,  storyTemplateAccess: false, mapAccess: true  },
    { id: 105, firstName: 'Sara',  lastName: 'Nguyen',  email: 'sara@lane.org',    county: 'Linn',    orgId: '1', isResearchParticipant: true,  authorizationCapacity: false, dataAccessUpload: true,  isAdmin: false, careJourneyAccess: true,  storyTemplateAccess: true,  mapAccess: true  },
  ],
  2: [
    { id: 106, firstName: 'Ron',   lastName: 'Patel',   email: 'ron@baker.org',    county: 'Baker',   orgId: '2', isResearchParticipant: false, authorizationCapacity: true,  dataAccessUpload: false, isAdmin: false, careJourneyAccess: false, storyTemplateAccess: true,  mapAccess: false },
  ],
  3: [
    { id: 103, firstName: 'Mia',   lastName: 'Carter',  email: 'mia@coos.org',     county: 'Coos',    orgId: '3', isResearchParticipant: true,  authorizationCapacity: false, dataAccessUpload: true,  isAdmin: false, careJourneyAccess: false, storyTemplateAccess: true,  mapAccess: true  },
    { id: 107, firstName: 'Devon', lastName: 'Park',    email: 'devon@coos.org',   county: 'Curry',   orgId: '3', isResearchParticipant: false, authorizationCapacity: true,  dataAccessUpload: true,  isAdmin: true,  careJourneyAccess: true,  storyTemplateAccess: true,  mapAccess: true  },
  ],
  4: [
    { id: 104, firstName: 'Luis',  lastName: 'Reyes',   email: 'luis@douglas.org', county: 'Douglas', orgId: '4', isResearchParticipant: false, authorizationCapacity: true,  dataAccessUpload: true,  isAdmin: true,  careJourneyAccess: true,  storyTemplateAccess: true,  mapAccess: true  },
    { id: 108, firstName: 'Priya', lastName: 'Shah',    email: 'priya@douglas.org',county: 'Douglas', orgId: '4', isResearchParticipant: true,  authorizationCapacity: false, dataAccessUpload: true,  isAdmin: true,  careJourneyAccess: true,  storyTemplateAccess: false, mapAccess: true  },
    { id: 109, firstName: 'Sam',   lastName: 'Lee',     email: 'sam@douglas.org',  county: 'Douglas', orgId: '4', isResearchParticipant: false, authorizationCapacity: false, dataAccessUpload: true,  isAdmin: false, careJourneyAccess: true,  storyTemplateAccess: false, mapAccess: false },
  ],
  5: [
    { id: 110, firstName: 'Casey', lastName: 'Kim',     email: 'casey@baker.org',  county: 'Union',   orgId: '5', isResearchParticipant: true,  authorizationCapacity: true,  dataAccessUpload: true,  isAdmin: false, careJourneyAccess: false, storyTemplateAccess: true,  mapAccess: false },
  ],
}

// ── View state ───────────────────────────────────────

type Tab = 'users' | 'resources'

type View =
  | { type: 'list' }
  | { type: 'add-admin' }
  | { type: 'edit-admin'; admin: SuperAdmin }
  | { type: 'add-org' }
  | { type: 'edit-org'; org: Organization }
  | { type: 'org-users'; org: Organization; tab?: Tab }
  | { type: 'add-user'; org: Organization }
  | { type: 'edit-user'; org: Organization; user: OrgUser }
  | { type: 'add-resource'; org: Organization }
  | { type: 'edit-resource'; org: Organization; resource: ResourceOrg }

// ── Sort state ───────────────────────────────────────

type SortDir = 'asc' | 'desc'

type AdminSortField = 'name'
type OrgSortField = 'name' | 'status' | 'county' | 'category' | 'services'

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
  const [resources, setResources] = useState<ResourceOrg[]>(INITIAL_RESOURCE_ORGS)
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

  const orgUserCounts = useMemo(() => {
    const counts: Record<number, { admins: number; general: number }> = {}
    for (const org of orgs) {
      const list = orgUsers[org.id] ?? []
      counts[org.id] = {
        admins: list.filter((u) => u.isAdmin).length,
        general: list.filter((u) => !u.isAdmin).length,
      }
    }
    return counts
  }, [orgs, orgUsers])

  const sortedOrgs = useMemo(() => {
    if (!orgSort) return orgs
    return [...orgs].sort((a, b) => {
      let cmp = 0
      if (orgSort.field === 'name') cmp = a.name.localeCompare(b.name)
      else if (orgSort.field === 'status') cmp = STATUS_RANK[a.status] - STATUS_RANK[b.status]
      else if (orgSort.field === 'county') cmp = a.counties.join(', ').localeCompare(b.counties.join(', '))
      else if (orgSort.field === 'category') cmp = a.category.localeCompare(b.category)
      else if (orgSort.field === 'services') cmp = a.services.join(', ').localeCompare(b.services.join(', '))
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

  // Resource handlers — `data` may include `status` (form is shared with OrgForm); drop it.
  function handleAddResource(data: Omit<Organization, 'id'>) {
    if (view.type !== 'add-resource') return
    const { status: _status, ...rest } = data
    setResources((prev) => [...prev, { ...rest, id: Date.now() }])
    setView({ type: 'org-users', org: view.org, tab: 'resources' })
  }

  function handleEditResource(data: Omit<Organization, 'id'>) {
    if (view.type !== 'edit-resource') return
    const { status: _status, ...rest } = data
    setResources((prev) =>
      prev.map((r) => (r.id === view.resource.id ? { ...rest, id: view.resource.id } : r))
    )
    setView({ type: 'org-users', org: view.org, tab: 'resources' })
  }

  function handleDeleteResource() {
    if (view.type !== 'edit-resource') return
    setResources((prev) => prev.filter((r) => r.id !== view.resource.id))
    setView({ type: 'org-users', org: view.org, tab: 'resources' })
  }

  // ── Form views ───────────────────────────────────

  if (view.type === 'add-admin') {
    return (
      <div className={styles.page}>
        <BackLink label="Admin" onClick={() => setView({ type: 'list' })} />
        <SuperAdminForm mode="add" onSave={handleAddAdmin} onCancel={() => setView({ type: 'list' })} />
      </div>
    )
  }

  if (view.type === 'edit-admin') {
    return (
      <div className={styles.page}>
        <BackLink label="Admin" onClick={() => setView({ type: 'list' })} />
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
        <BackLink label="Admin" onClick={() => setView({ type: 'list' })} />
        <OrgForm mode="add" showStatus onSave={handleAddOrg} onCancel={() => setView({ type: 'list' })} />
      </div>
    )
  }

  if (view.type === 'edit-org') {
    return (
      <div className={styles.page}>
        <BackLink label="Admin" onClick={() => setView({ type: 'list' })} />
        <OrgForm
          mode="edit"
          showStatus
          initialData={view.org}
          onSave={handleEditOrg}
          onCancel={() => setView({ type: 'list' })}
          onDelete={handleDeleteOrg}
        />
      </div>
    )
  }

  if (view.type === 'org-users') {
    const orgAdminsForOrg = (orgUsers[view.org.id] ?? []).filter((u) => u.isAdmin)
    const sortedOrgAdmins = adminSort
      ? [...orgAdminsForOrg].sort((a, b) => {
          const aVal = `${a.firstName} ${a.lastName}`.toLowerCase()
          const bVal = `${b.firstName} ${b.lastName}`.toLowerCase()
          const cmp = aVal.localeCompare(bVal)
          return adminSort.dir === 'asc' ? cmp : -cmp
        })
      : orgAdminsForOrg
    return (
      <div className={styles.page}>
        {!isSingleOrgAdmin && (
          <BackLink label="Admin" onClick={() => setView({ type: 'list' })} />
        )}
        {!isSuperAdmin && (
          <div className={styles.topRow}>
            {/* Data Products */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Data Products <span className={styles.cardCount}>({DATA_PRODUCTS.length})</span></h2>
              </div>
              <div className={styles.productHeader} aria-hidden="true" />
              <ul className={styles.productList}>
                {DATA_PRODUCTS.map((p) => (
                  <li key={p.id} className={styles.productRow}>
                    <span className={styles.productName}>{p.name}</span>
                    <span className={styles.statusActive}>{p.status}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Org Admins */}
            <div className={styles.card}>
              <div className={styles.cardHeader}>
                <h2 className={styles.cardTitle}>Org Admins <span className={styles.cardCount}>({orgAdminsForOrg.length})</span></h2>
              </div>
              <div className={styles.tableWrapper}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th
                        className={`${styles.th} ${styles.thSortable} ${adminSort?.field === 'name' ? styles.thActive : ''}`}
                        onClick={() => toggleAdminSort('name')}
                      >
                        User's Name <IconSortIndicator dir={adminSort?.field === 'name' ? adminSort.dir : null} />
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedOrgAdmins.length === 0 ? (
                      <tr><td className={styles.td} style={{ color: '#9ca3af' }}>No admins yet</td></tr>
                    ) : (
                      sortedOrgAdmins.map((admin) => (
                        <tr key={admin.id} className={styles.tr}>
                          <td className={styles.td}>
                            <div className={styles.adminName}>{admin.firstName} {admin.lastName}</div>
                            <div className={styles.adminEmail}>{admin.email}</div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
        <OrgUsersPage
          org={view.org}
          users={orgUsers[view.org.id] ?? []}
          resources={resources}
          initialTab={view.tab}
          onAdd={() => setView({ type: 'add-user', org: view.org })}
          onEdit={(u) => setView({ type: 'edit-user', org: view.org, user: u })}
          onEditOrg={isSuperAdmin ? () => setView({ type: 'edit-org', org: view.org }) : undefined}
          onAddResource={!isSuperAdmin ? () => setView({ type: 'add-resource', org: view.org }) : undefined}
          onEditResource={!isSuperAdmin ? (r) => setView({ type: 'edit-resource', org: view.org, resource: r }) : undefined}
        />
      </div>
    )
  }

  if (view.type === 'add-resource') {
    return (
      <div className={styles.page}>
        <BackLink label={view.org.name} onClick={() => setView({ type: 'org-users', org: view.org, tab: 'resources' })} />
        <OrgForm
          mode="add"
          entityName="Resource"
          onSave={handleAddResource}
          onCancel={() => setView({ type: 'org-users', org: view.org, tab: 'resources' })}
        />
      </div>
    )
  }

  if (view.type === 'edit-resource') {
    return (
      <div className={styles.page}>
        <BackLink label={view.org.name} onClick={() => setView({ type: 'org-users', org: view.org, tab: 'resources' })} />
        <OrgForm
          mode="edit"
          entityName="Resource"
          initialData={view.resource}
          onSave={handleEditResource}
          onCancel={() => setView({ type: 'org-users', org: view.org, tab: 'resources' })}
          onDelete={handleDeleteResource}
        />
      </div>
    )
  }

  if (view.type === 'add-user') {
    return (
      <div className={styles.page}>
        <BackLink label={view.org.name} onClick={() => setView({ type: 'org-users', org: view.org })} />
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
        <BackLink label={view.org.name} onClick={() => setView({ type: 'org-users', org: view.org })} />
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
              <h2 className={styles.cardTitle}>Data Products <span className={styles.cardCount}>({DATA_PRODUCTS.length})</span></h2>
            </div>
            <div className={styles.productHeader} aria-hidden="true" />
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
              <h2 className={styles.cardTitle}>Super Admins <span className={styles.cardCount}>({admins.length})</span></h2>
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
                      <td className={styles.td}>
                        <div className={styles.adminName}>{admin.firstName} {admin.lastName}</div>
                        <div className={styles.adminEmail}>{admin.email}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Participating Organizations */}
      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <h2 className={styles.cardTitle}>Participating Organizations <span className={styles.cardCount}>({visibleOrgs.length})</span></h2>
          {isSuperAdmin && (
            <button className={styles.addBtn} onClick={() => setView({ type: 'add-org' })}>
              <span>+</span> Add
            </button>
          )}
        </div>
        <div className={`${styles.tableWrapper} ${isMultiOrgAdmin ? styles.tableWrapperAuto : ''}`}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th
                  className={`${styles.th} ${styles.thSortable} ${orgSort?.field === 'name' ? styles.thActive : ''}`}
                  onClick={() => toggleOrgSort('name')}
                >
                  Organization Name <IconSortIndicator dir={orgSort?.field === 'name' ? orgSort.dir : null} />
                </th>
                <th
                  className={`${styles.th} ${styles.thSortable} ${orgSort?.field === 'status' ? styles.thActive : ''}`}
                  onClick={() => toggleOrgSort('status')}
                >
                  Status <IconSortIndicator dir={orgSort?.field === 'status' ? orgSort.dir : null} />
                </th>
                <th
                  className={`${styles.th} ${styles.thSortable} ${orgSort?.field === 'county' ? styles.thActive : ''}`}
                  onClick={() => toggleOrgSort('county')}
                >
                  Counties <IconSortIndicator dir={orgSort?.field === 'county' ? orgSort.dir : null} />
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
              {visibleOrgs.map((org) => {
                const counts = orgUserCounts[org.id] ?? { admins: 0, general: 0 }
                return (
                  <tr key={org.id} className={styles.tr}>
                    <td className={styles.td}>
                      <button className={styles.orgNameBtn} onClick={() => setView({ type: 'org-users', org })}>
                        {org.name}
                      </button>
                      <div className={styles.orgCounts}>
                        <span className={styles.countToken}>Admins: {counts.admins}</span>
                        <span className={styles.countToken}>Users: {counts.general}</span>
                      </div>
                    </td>
                    <td className={styles.td}>
                      <span className={styles.statusCell}>
                        <span
                          className={`${styles.statusDot} ${styles[`statusDot_${org.status}`]}`}
                          aria-hidden="true"
                        />
                        {STATUS_LABEL[org.status]}
                      </span>
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
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

function BackLink({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button type="button" className={styles.backLink} onClick={onClick}>
      <IconArrowLeft />
      {label}
    </button>
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

