import { STORY_TYPES, TYPE_LABELS, TYPE_COLORS, type StoryType } from '../storiesData'
import styles from './Step2StoryType.module.css'

// ── Props ─────────────────────────────────────────────

type Props = {
  types: StoryType[]
  onToggle: (type: StoryType) => void
}

// ── Per-type descriptions ────────────────────────────

const TYPE_DESCRIPTIONS: Record<StoryType, string> = {
  text:        'Write your story in your own words. Great for longer narratives with a clear arc.',
  audio:       'Record or upload a voice story. Powerful for tone, emotion, and personal voice.',
  brochure:    'Let AI shape key moments into a clean, shareable brochure.',
  journey:     'A timeline of key moments — perfect for showing how things changed over time.',
  infographic: 'Highlight themes, barriers, strengths, and numbers at a glance.',
  quotes:      'A collection of standout moments or short reflections.',
  wordcloud:   'The words that best describe your experience, sized by what mattered most.',
}

// ── Component ────────────────────────────────────────

export function Step2StoryType({ types, onToggle }: Props) {
  return (
    <div className={styles.step}>
      <p className={styles.intro}>
        Pick one or more formats for sharing your story. Different formats shine in different ways — go with what feels right.
      </p>

      <div className={styles.grid}>
        {STORY_TYPES.map((t) => {
          const isSelected = types.includes(t)
          const color = TYPE_COLORS[t]
          return (
            <button
              key={t}
              type="button"
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
              style={
                isSelected
                  ? { borderColor: color.color, background: color.bg }
                  : undefined
              }
              onClick={() => onToggle(t)}
              aria-pressed={isSelected}
            >
              <div className={styles.cardTop}>
                <div
                  className={styles.iconChip}
                  style={{ background: color.bg, color: color.color }}
                >
                  <TypeIcon type={t} />
                </div>
                <span className={styles.cardLabel}>{TYPE_LABELS[t]}</span>
              </div>
              <p className={styles.cardDesc}>{TYPE_DESCRIPTIONS[t]}</p>
              <span
                className={styles.cardCheck}
                aria-hidden={!isSelected}
                style={isSelected ? { background: color.color } : undefined}
              >
                <IconCheck />
              </span>
            </button>
          )
        })}
      </div>

      <p className={styles.selectionHint} aria-live="polite">
        {types.length === 0
          ? 'Pick at least one format to continue.'
          : `${types.length} format${types.length === 1 ? '' : 's'} selected`}
      </p>
    </div>
  )
}

// ── Icons ────────────────────────────────────────────

function TypeIcon({ type }: { type: StoryType }) {
  const p = {
    width: 24,
    height: 24,
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
