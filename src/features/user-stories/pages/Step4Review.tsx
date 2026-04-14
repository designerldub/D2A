import { TYPE_LABELS, TYPE_COLORS, type StoryCategory, type StoryType } from '../storiesData'
import type { StoryMethod } from './Step3Story'
import landingStyles from './UserStoriesPage.module.css'
import stepStyles from './Step4Review.module.css'

// ── Props ─────────────────────────────────────────────

type Props = {
  topic: StoryCategory | null
  types: StoryType[]
  excludedTypes: StoryType[]
  method: StoryMethod | null
  storyText: string
  guidedAnswers: Record<string, string>
  uploads: File[]
  onToggle: (type: StoryType) => void
}

// ── Component ────────────────────────────────────────

export function Step4Review({
  topic,
  types,
  excludedTypes,
  method,
  storyText,
  guidedAnswers,
  uploads,
  onToggle,
}: Props) {
  const preview = deriveStoryPreview({ method, storyText, guidedAnswers, uploads })
  const tags = topic ? [topic] : []
  const selectedCount = types.filter((t) => !excludedTypes.includes(t)).length

  if (types.length === 0) {
    return (
      <div className={stepStyles.step}>
        <p className={stepStyles.empty}>
          No story formats chosen. Go back to Step 2 to pick at least one format.
        </p>
      </div>
    )
  }

  return (
    <div className={stepStyles.step}>
      <p className={stepStyles.intro}>
        Here&apos;s how your story will appear in each format you chose. Tap a card to include or exclude it from publishing.
      </p>

      <div className={stepStyles.grid}>
        {types.map((type) => {
          const isSelected = !excludedTypes.includes(type)
          const tc = TYPE_COLORS[type]
          return (
            <div
              key={type}
              className={`${landingStyles.card} ${stepStyles.reviewCard} ${isSelected ? stepStyles.selected : stepStyles.deselected}`}
              onClick={() => onToggle(type)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  onToggle(type)
                }
              }}
              role="button"
              tabIndex={0}
              aria-pressed={isSelected}
              aria-label={`${isSelected ? 'Exclude' : 'Include'} ${TYPE_LABELS[type]} version`}
            >
              <div className={landingStyles.cardTop}>
                <span className={landingStyles.typeBadge} style={{ background: tc.bg, color: tc.color }}>
                  <TypeIcon type={type} />
                  {TYPE_LABELS[type]}
                </span>
                <span
                  className={`${stepStyles.selectBadge} ${isSelected ? stepStyles.selectBadgeActive : ''}`}
                  aria-hidden="true"
                >
                  {isSelected ? <IconCheck /> : <IconPlus />}
                </span>
              </div>

              <h2 className={landingStyles.cardTitle}>{preview.title}</h2>
              <p className={landingStyles.cardSnippet}>{preview.snippet}</p>

              {tags.length > 0 && (
                <div className={landingStyles.cardTags}>
                  {tags.map((tag) => (
                    <span key={tag} className={landingStyles.cardTag}>{tag}</span>
                  ))}
                </div>
              )}

              <div className={landingStyles.cardFooter}>
                <span className={landingStyles.cardOrg}>{preview.org}</span>
                <span className={`${stepStyles.statusLabel} ${isSelected ? stepStyles.statusIncluded : stepStyles.statusExcluded}`}>
                  {isSelected ? 'Will publish' : 'Excluded'}
                </span>
              </div>
            </div>
          )
        })}
      </div>

      <p className={stepStyles.countHint} aria-live="polite">
        {selectedCount === 0
          ? 'Select at least one format to continue.'
          : `${selectedCount} of ${types.length} format${types.length === 1 ? '' : 's'} will be published.`}
      </p>
    </div>
  )
}

// ── Preview derivation ───────────────────────────────

type DeriveInput = {
  method: StoryMethod | null
  storyText: string
  guidedAnswers: Record<string, string>
  uploads: File[]
}

function deriveStoryPreview({ method, storyText, guidedAnswers, uploads }: DeriveInput) {
  const org = 'Your Organization'

  if (method === 'write') {
    const text = (storyText ?? '').trim()
    return {
      title: extractTitle(text),
      snippet: extractSnippet(text),
      org,
    }
  }

  if (method === 'guided') {
    const answers = Object.values(guidedAnswers ?? {})
      .map((a) => a.trim())
      .filter(Boolean)
    const combined = answers.join(' ').trim()
    return {
      title: extractTitle(combined),
      snippet: extractSnippet(combined),
      org,
    }
  }

  if (method === 'upload') {
    const files = uploads ?? []
    const first = files[0]
    if (!first) {
      return { title: 'Untitled Story', snippet: 'No files uploaded yet.', org }
    }
    const baseName = first.name.replace(/\.[^.]+$/, '')
    const others = files.length > 1 ? ` and ${files.length - 1} more` : ''
    return {
      title: baseName,
      snippet: `Uploaded file${files.length === 1 ? '' : 's'}: ${files.map((f) => f.name).join(', ')}${others ? '' : ''}`,
      org,
    }
  }

  return { title: 'Untitled Story', snippet: 'Nothing to preview yet.', org }
}

function extractTitle(text: string): string {
  if (!text) return 'Untitled Story'
  const firstSentence = text.split(/[.!?\n]/)[0].trim()
  const source = firstSentence || text.trim()
  if (source.length <= 50) return source
  return `${source.slice(0, 47).trimEnd()}\u2026`
}

function extractSnippet(text: string): string {
  if (!text) return ''
  if (text.length <= 180) return text
  return `${text.slice(0, 177).trimEnd()}\u2026`
}

// ── Type icon (duplicated to match landing page visually) ──

function TypeIcon({ type }: { type: StoryType }) {
  const p = {
    width: 13,
    height: 13,
    viewBox: '0 0 24 24',
    fill: 'none',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round' as const,
    strokeLinejoin: 'round' as const,
  }
  switch (type) {
    case 'text':
      return <svg {...p}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" /></svg>
    case 'audio':
      return <svg {...p}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></svg>
    case 'brochure':
      return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
    case 'journey':
      return <svg {...p}><circle cx="5" cy="19" r="2" /><circle cx="19" cy="5" r="2" /><path d="M5 17V11a6 6 0 0 1 6-6h2" /></svg>
    case 'infographic':
      return <svg {...p}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
    case 'quotes':
      return <svg {...p}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></svg>
    case 'wordcloud':
      return <svg {...p}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>
  }
}

function IconCheck() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}

function IconPlus() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
}
