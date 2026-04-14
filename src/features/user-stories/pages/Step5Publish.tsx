import { TYPE_LABELS, type StoryCategory, type StoryType } from '../storiesData'
import styles from './Step5Publish.module.css'

// ── Props ─────────────────────────────────────────────

type Props = {
  topic: StoryCategory | null
  types: StoryType[]
  excludedTypes: StoryType[]
  consentOrg: boolean
  consentOnline: boolean
  signature: string
  onChange: (patch: {
    consentOrg?: boolean
    consentOnline?: boolean
    signature?: string
  }) => void
}

// ── Component ────────────────────────────────────────

export function Step5Publish({
  topic,
  types,
  excludedTypes,
  consentOrg,
  consentOnline,
  signature,
  onChange,
}: Props) {
  const includedTypes = types.filter((t) => !excludedTypes.includes(t))
  const summary = buildSummary(includedTypes, topic)

  return (
    <div className={styles.step}>
      {/* ── Warm thank-you ── */}
      <div className={styles.thankYou}>
        <div className={styles.heartBadge} aria-hidden="true">
          <IconHeart />
        </div>
        <h2 className={styles.thankTitle}>Thank you for sharing your story</h2>
        <p className={styles.thankBody}>
          The community grows stronger every time someone is brave enough to speak.
          Your words will help others feel less alone on their own journey.
        </p>
      </div>

      {/* ── Summary ── */}
      <div className={styles.summary}>
        <IconSparkle />
        <p>{summary}</p>
      </div>

      {/* ── Consent ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>How would you like to share?</h3>
        <p className={styles.sectionHint}>Check at least one. You&apos;re always in control.</p>

        <div className={styles.consentList}>
          <ConsentRow
            checked={consentOrg}
            onChange={(v) => onChange({ consentOrg: v })}
            title="Share within my organization"
            description="Only members and staff of your organization will see this story."
          />
          <ConsentRow
            checked={consentOnline}
            onChange={(v) => onChange({ consentOnline: v })}
            title="Share online and with community partners"
            description="Your story may appear on this portal and be shared with trusted community partners across Oregon."
          />
        </div>
      </section>

      {/* ── Signature ── */}
      <section className={styles.section}>
        <h3 className={styles.sectionTitle}>Sign to confirm</h3>
        <p className={styles.sectionHint}>
          Type your full name below to digitally sign and publish your story.
        </p>

        <div className={styles.signatureWrap}>
          <input
            type="text"
            className={styles.signatureInput}
            value={signature}
            onChange={(e) => onChange({ signature: e.target.value })}
            placeholder="Your full name"
            aria-label="Digital signature"
            autoComplete="off"
          />
          <div className={styles.signatureLine} aria-hidden="true" />
        </div>

        <p className={styles.signatureNote}>
          By signing, you confirm that this story is your own. Your name won&apos;t be shared publicly
          &mdash; stories are published anonymously.
        </p>
      </section>
    </div>
  )
}

// ── Consent row ──────────────────────────────────────

function ConsentRow({
  checked,
  onChange,
  title,
  description,
}: {
  checked: boolean
  onChange: (v: boolean) => void
  title: string
  description: string
}) {
  return (
    <label className={`${styles.consentRow} ${checked ? styles.consentRowChecked : ''}`}>
      <input
        type="checkbox"
        className={styles.srOnly}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className={`${styles.checkbox} ${checked ? styles.checkboxChecked : ''}`} aria-hidden="true">
        {checked && <IconCheck />}
      </span>
      <span className={styles.consentText}>
        <span className={styles.consentTitle}>{title}</span>
        <span className={styles.consentDesc}>{description}</span>
      </span>
    </label>
  )
}

// ── Helpers ──────────────────────────────────────────

function buildSummary(includedTypes: StoryType[], topic: StoryCategory | null): string {
  if (includedTypes.length === 0) {
    return "You haven't selected any formats to publish. Go back to Review to include at least one."
  }

  const formatList = includedTypes.map((t) => TYPE_LABELS[t])
  const formatText =
    formatList.length === 1
      ? formatList[0]
      : formatList.length === 2
      ? `${formatList[0]} and ${formatList[1]}`
      : `${formatList.slice(0, -1).join(', ')}, and ${formatList[formatList.length - 1]}`

  const topicText = topic ? ` on the topic of ${topic}` : ''
  const plural = includedTypes.length === 1 ? 'format' : 'formats'
  return `You're about to publish ${includedTypes.length} ${plural} (${formatText})${topicText}.`
}

// ── Icons ────────────────────────────────────────────

function IconHeart() {
  return <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" /></svg>
}

function IconSparkle() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="M6 6l2.5 2.5" /><path d="M15.5 15.5L18 18" /><path d="M6 18l2.5-2.5" /><path d="M15.5 8.5L18 6" /></svg>
}

function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}
