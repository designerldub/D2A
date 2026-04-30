import { useMemo, useState } from 'react'
import { IconEdit, IconCheck } from '../adminIcons'
import styles from './OrgUsersPage.module.css'
import { ServiceIcon } from './serviceIcons'
import { STATUS_LABEL, type Organization, type OrgUser, type ResourceOrg } from './AdminPage'

type Tab = 'users' | 'resources'

type SortDir = 'asc' | 'desc'
type ResourceSortField = 'name' | 'county' | 'category' | 'services'
type ResourceSort = { field: ResourceSortField; dir: SortDir } | null

type Props = {
  org: Organization
  users: OrgUser[]
  resources: ResourceOrg[]
  initialTab?: Tab
  onAdd: () => void
  onEdit: (user: OrgUser) => void
  onEditOrg?: () => void
  onAddResource?: () => void
  onEditResource?: (resource: ResourceOrg) => void
}

export function OrgUsersPage({ org, users, resources, initialTab, onAdd, onEdit, onEditOrg, onAddResource, onEditResource }: Props) {
  const [tab, setTab] = useState<Tab>(initialTab ?? 'users')
  const [resourceSort, setResourceSort] = useState<ResourceSort>(null)

  const countyLabel =
    org.counties.length === 1
      ? `${org.counties[0]} County`
      : `${org.counties.join(', ')} Counties`

  function toggleResourceSort(field: ResourceSortField) {
    setResourceSort((prev) =>
      prev?.field === field
        ? { field, dir: prev.dir === 'asc' ? 'desc' : 'asc' }
        : { field, dir: 'asc' }
    )
  }

  const sortedResources = useMemo(() => {
    if (!resourceSort) return resources
    return [...resources].sort((a, b) => {
      let cmp = 0
      if (resourceSort.field === 'name') cmp = a.name.localeCompare(b.name)
      else if (resourceSort.field === 'county') cmp = a.counties.join(', ').localeCompare(b.counties.join(', '))
      else if (resourceSort.field === 'category') cmp = a.category.localeCompare(b.category)
      else if (resourceSort.field === 'services') cmp = a.services.join(', ').localeCompare(b.services.join(', '))
      return resourceSort.dir === 'asc' ? cmp : -cmp
    })
  }, [resources, resourceSort])

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <div className={styles.headerInfo}>
            <div className={styles.orgNameRow}>
              <h1 className={styles.orgName}>{org.name}</h1>
              <span className={styles.orgStatus}>
                <span
                  className={`${styles.statusDot} ${styles[`statusDot_${org.status}`]}`}
                  aria-hidden="true"
                />
                {STATUS_LABEL[org.status]}
              </span>
              {onEditOrg && (
                <button
                  type="button"
                  className={styles.editOrgBtn}
                  onClick={onEditOrg}
                  aria-label={`Edit ${org.name}`}
                >
                  <IconEdit />
                  Edit
                </button>
              )}
            </div>
            <span className={styles.county}>{countyLabel}</span>
          </div>
        </div>
        {tab === 'users' && (
          <button className={styles.addBtn} onClick={onAdd}>
            <span>+</span> Add User
          </button>
        )}
        {tab === 'resources' && onAddResource && (
          <button className={styles.addBtn} onClick={onAddResource}>
            <span>+</span> Add Resource
          </button>
        )}
      </div>

      <div className={styles.tabs} role="tablist">
        <button
          role="tab"
          type="button"
          aria-selected={tab === 'users'}
          className={`${styles.tab} ${tab === 'users' ? styles.tabActive : ''}`}
          onClick={() => setTab('users')}
        >
          Users <span className={styles.tabCount}>({users.length})</span>
        </button>
        <button
          role="tab"
          type="button"
          aria-selected={tab === 'resources'}
          className={`${styles.tab} ${tab === 'resources' ? styles.tabActive : ''}`}
          onClick={() => setTab('resources')}
        >
          Resources <span className={styles.tabCount}>({resources.length})</span>
        </button>
      </div>

      {tab === 'users' ? (
        users.length === 0 ? (
          <p className={styles.empty}>No users yet. Click <strong>Add User</strong> to add the first user for this organization.</p>
        ) : (
          <div className={styles.tableWrapper}>
            <table className={styles.table}>
              <thead>
                <tr>
                  <th className={styles.thEdit}>Edit</th>
                  <th className={styles.th}>User Name</th>
                  <th className={styles.th}>Data Product Access</th>
                  <th className={styles.th}>Permissions</th>
                  <th className={`${styles.th} ${styles.thCenter}`}>Research Participant</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => {
                  const hasAny = user.careJourneyAccess || user.storyTemplateAccess || user.mapAccess
                  return (
                    <tr key={user.id} className={styles.tr}>
                      <td className={styles.tdEdit}>
                        <button
                          className={styles.editBtn}
                          aria-label={`Edit ${user.firstName} ${user.lastName}`}
                          onClick={() => onEdit(user)}
                        >
                          <IconEdit />
                        </button>
                      </td>
                      <td className={styles.td}>
                        <div className={styles.userName}>{user.firstName} {user.lastName}</div>
                        <div className={styles.userEmail}>{user.email}</div>
                      </td>
                      <td className={styles.td}>
                        {hasAny ? (
                          <div className={styles.chips}>
                            {user.careJourneyAccess && <span className={styles.chip}>Care Journey</span>}
                            {user.storyTemplateAccess && <span className={styles.chip}>Story Template</span>}
                            {user.mapAccess && <span className={styles.chip}>Map</span>}
                          </div>
                        ) : (
                          <span className={styles.none}>None</span>
                        )}
                      </td>
                      <td className={styles.td}>
                        <div className={styles.chips}>
                          {user.isAdmin && <span className={styles.roleAdmin}>Admin</span>}
                          {user.authorizationCapacity && <span className={styles.chip}>Authorization</span>}
                          {user.dataAccessUpload && <span className={styles.chip}>Data Upload</span>}
                          {!user.isAdmin && !user.authorizationCapacity && !user.dataAccessUpload && <span className={styles.none}>None</span>}
                        </div>
                      </td>
                      <td className={styles.tdCenter}>
                        {user.isResearchParticipant ? (
                          <span className={styles.participantYes} title="Research participant">
                            <IconCheck />
                          </span>
                        ) : (
                          <span className={styles.participantNo}>—</span>
                        )}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th
                  className={`${styles.th} ${styles.thSortable} ${resourceSort?.field === 'name' ? styles.thActive : ''}`}
                  onClick={() => toggleResourceSort('name')}
                >
                  Organization Name <IconSortIndicator dir={resourceSort?.field === 'name' ? resourceSort.dir : null} />
                </th>
                <th
                  className={`${styles.th} ${styles.thSortable} ${resourceSort?.field === 'county' ? styles.thActive : ''}`}
                  onClick={() => toggleResourceSort('county')}
                >
                  Counties <IconSortIndicator dir={resourceSort?.field === 'county' ? resourceSort.dir : null} />
                </th>
                <th
                  className={`${styles.th} ${styles.thSortable} ${resourceSort?.field === 'category' ? styles.thActive : ''}`}
                  onClick={() => toggleResourceSort('category')}
                >
                  Category <IconSortIndicator dir={resourceSort?.field === 'category' ? resourceSort.dir : null} />
                </th>
                <th
                  className={`${styles.th} ${styles.thSortable} ${resourceSort?.field === 'services' ? styles.thActive : ''}`}
                  onClick={() => toggleResourceSort('services')}
                >
                  Services <IconSortIndicator dir={resourceSort?.field === 'services' ? resourceSort.dir : null} />
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedResources.map((res) => (
                <tr key={res.id} className={styles.tr}>
                  <td className={styles.td}>
                    {onEditResource ? (
                      <button className={styles.resourceNameBtn} onClick={() => onEditResource(res)}>
                        {res.name}
                      </button>
                    ) : (
                      res.name
                    )}
                  </td>
                  <td className={styles.td}>{res.counties.join(', ')}</td>
                  <td className={styles.td}>{res.category}</td>
                  <td className={styles.serviceCell}>
                    {res.services.map((svc) => (
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
      )}
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

