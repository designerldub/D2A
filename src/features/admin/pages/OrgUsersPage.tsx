import { IconArrowLeft, IconEdit, IconCheck } from '../adminIcons'
import styles from './OrgUsersPage.module.css'
import type { Organization, OrgUser } from './AdminPage'

type Props = {
  org: Organization
  users: OrgUser[]
  onBack?: () => void
  onAdd: () => void
  onEdit: (user: OrgUser) => void
}

export function OrgUsersPage({ org, users, onBack, onAdd, onEdit }: Props) {
  const countyLabel =
    org.counties.length === 1
      ? `${org.counties[0]} County`
      : `${org.counties.join(', ')} Counties`

  return (
    <div className={styles.card}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          {onBack && (
            <button className={styles.backBtn} onClick={onBack}>
              <IconArrowLeft />
              Back
            </button>
          )}
          <div className={styles.headerInfo}>
            <h1 className={styles.orgName}>{org.name}</h1>
            <span className={styles.county}>{countyLabel}</span>
          </div>
        </div>
        <button className={styles.addBtn} onClick={onAdd}>
          <span>+</span> Add User
        </button>
      </div>

      <hr className={styles.divider} />

      {users.length === 0 ? (
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
                <th className={styles.th}>Research Participant</th>
              </tr>
            </thead>
            <tbody>
              {users.map((user) => {
                const hasAny = user.careJourneyAccess || user.userStoriesAccess || user.mapAccess
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
                          {user.userStoriesAccess && <span className={styles.chip}>User Stories</span>}
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
                    <td className={styles.td}>
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
      )}
    </div>
  )
}

