import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { STORIES, ORGS, STORY_TYPES, STORY_CATEGORIES, TYPE_LABELS, TYPE_COLORS, type StoryType, type StoryCategory } from '../storiesData'
import styles from './UserStoriesPage.module.css'

export function UserStoriesPage() {
  const navigate = useNavigate()
  const [activeType, setActiveType] = useState<StoryType | 'all'>('all')
  const [activeCategory, setActiveCategory] = useState<StoryCategory | 'all'>('all')
  const [activeOrg, setActiveOrg] = useState<string>('all')
  const [copiedId, setCopiedId] = useState<number | null>(null)

  const filtered = useMemo(() => {
    return STORIES.filter((s) => {
      if (activeType !== 'all' && s.type !== activeType) return false
      if (activeCategory !== 'all' && !s.tags.includes(activeCategory)) return false
      if (activeOrg !== 'all' && s.org !== activeOrg) return false
      return true
    })
  }, [activeType, activeCategory, activeOrg])

  function handleShare(id: number) {
    const url = `${window.location.origin}/user-stories/${id}`
    navigator.clipboard.writeText(url).catch(() => {})
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>User Stories</h1>
          <p className={styles.subtitle}>Anonymous stories of recovery, resilience, and community — shared by people across Oregon.</p>
        </div>
        <button className={styles.createBtn} onClick={() => navigate('/user-stories/create')}>
          <IconPlus /> Create a Story
        </button>
      </div>

      {/* ── Filters ── */}
      <div className={styles.filters}>
        <div className={styles.typePills}>
          <button
            className={`${styles.pill} ${activeType === 'all' ? styles.pillActive : ''}`}
            onClick={() => setActiveType('all')}
          >
            All
          </button>
          {STORY_TYPES.map((t) => (
            <button
              key={t}
              className={`${styles.pill} ${activeType === t ? styles.pillActive : ''}`}
              onClick={() => setActiveType(t)}
              style={activeType === t ? { background: TYPE_COLORS[t].bg, color: TYPE_COLORS[t].color, borderColor: 'transparent' } : undefined}
            >
              <TypeIcon type={t} />
              {TYPE_LABELS[t]}
            </button>
          ))}
        </div>

        <div className={styles.dropdowns}>
          <select
            className={styles.select}
            value={activeCategory}
            onChange={(e) => setActiveCategory(e.target.value as StoryCategory | 'all')}
          >
            <option value="all">All Categories</option>
            {STORY_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          <select
            className={styles.select}
            value={activeOrg}
            onChange={(e) => setActiveOrg(e.target.value)}
          >
            <option value="all">All Organizations</option>
            {ORGS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>
      </div>

      {/* ── Results count ── */}
      <p className={styles.resultsCount}>
        {filtered.length} {filtered.length === 1 ? 'story' : 'stories'}
      </p>

      {/* ── Grid ── */}
      {filtered.length === 0 ? (
        <div className={styles.empty}>
          <p>No stories match your filters.</p>
          <button
            className={styles.clearBtn}
            onClick={() => { setActiveType('all'); setActiveCategory('all'); setActiveOrg('all') }}
          >
            Clear filters
          </button>
        </div>
      ) : (
        <div className={styles.grid}>
          {filtered.map((story) => {
            const tc = TYPE_COLORS[story.type]
            return (
              <div key={story.id} className={styles.card}>
                <div className={styles.cardTop}>
                  <span className={styles.typeBadge} style={{ background: tc.bg, color: tc.color }}>
                    <TypeIcon type={story.type} />
                    {TYPE_LABELS[story.type]}
                  </span>
                  <button
                    className={styles.shareBtn}
                    onClick={() => handleShare(story.id)}
                    aria-label="Share story"
                    title="Copy link"
                  >
                    {copiedId === story.id ? <IconCheck /> : <IconShare />}
                  </button>
                </div>

                <h2 className={styles.cardTitle}>{story.title}</h2>
                <p className={styles.cardSnippet}>{story.snippet}</p>

                <div className={styles.cardTags}>
                  {story.tags.map((tag) => (
                    <span key={tag} className={styles.cardTag}>{tag}</span>
                  ))}
                </div>

                <div className={styles.cardFooter}>
                  <span className={styles.cardOrg}>{story.org}</span>
                  <button className={styles.viewBtn} onClick={() => navigate(`/user-stories/${story.id}`)}>
                    View Story
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────

function TypeIcon({ type }: { type: StoryType }) {
  const p = { width: 13, height: 13, viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const }
  switch (type) {
    case 'text':        return <svg {...p}><line x1="3" y1="6" x2="21" y2="6" /><line x1="3" y1="12" x2="15" y2="12" /><line x1="3" y1="18" x2="18" y2="18" /></svg>
    case 'audio':       return <svg {...p}><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /></svg>
    case 'brochure':    return <svg {...p}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
    case 'journey':     return <svg {...p}><circle cx="5" cy="19" r="2" /><circle cx="19" cy="5" r="2" /><path d="M5 17V11a6 6 0 0 1 6-6h2" /></svg>
    case 'infographic': return <svg {...p}><line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" /></svg>
    case 'quotes':      return <svg {...p}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></svg>
    case 'wordcloud':   return <svg {...p}><path d="M18 10h-1.26A8 8 0 1 0 9 20h9a5 5 0 0 0 0-10z" /></svg>
  }
}

function IconShare() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
}

function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}

function IconPlus() {
  return <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
}
