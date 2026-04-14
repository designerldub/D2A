import { useEffect, useState, type ReactNode } from 'react'
import { STORY_CATEGORIES, type StoryCategory } from '../storiesData'
import styles from './Step1Topic.module.css'

// ── Props ─────────────────────────────────────────────

type Props = {
  topic: StoryCategory | null
  onChange: (topic: StoryCategory) => void
}

// ── Topic metadata (icon per topic) ───────────────────

const TOPIC_ICONS: Record<StoryCategory, ReactNode> = {
  'Recovery':                             <IconSprout />,
  'Recovery progress report':             <IconChartUp />,
  'Service access':                       <IconDoor />,
  'Service experience':                   <IconHandHeart />,
  'Interaction with first responders':    <IconShield />,
  'Experiences with housing instability': <IconHome />,
  'Experiences with employment':          <IconBriefcase />,
  'Other':                                <IconSparkle />,
}

// ── Tip data ─────────────────────────────────────────
// Rephrased as gentle, friendly nudges — not rules.

type Tip = {
  icon: ReactNode
  title: string
  body: string
  hue: string  // CSS gradient color
}

const TIPS: Tip[] = [
  {
    icon: <IconHourglass />,
    title: 'Take your time',
    body: 'Share whatever feels right — nothing more, nothing less. You set the pace, always.',
    hue: 'peach',
  },
  {
    icon: <IconCompass />,
    title: 'You\'re in the driver\'s seat',
    body: 'Pause, save, or step away whenever you need to. Your story will be here waiting.',
    hue: 'sky',
  },
  {
    icon: <IconQuote />,
    title: 'Speak in your own voice',
    body: '"I felt." "I learned." "I found." Your words, your way — that\'s where the magic lives.',
    hue: 'mint',
  },
  {
    icon: <IconFootsteps />,
    title: 'Follow the feeling',
    body: 'Moments and emotions tend to land harder than the details. Lean into the journey.',
    hue: 'lilac',
  },
  {
    icon: <IconLeaf />,
    title: 'Be gentle with yourself after',
    body: 'Storytelling can stir things up. Call a friend, take a walk, make some tea. You\'ve earned it.',
    hue: 'rose',
  },
]

// ── Component ────────────────────────────────────────

export function Step1Topic({ topic, onChange }: Props) {
  return (
    <div className={styles.step}>
      <p className={styles.intro}>
        Pick the topic that best fits the story you&apos;d like to share. You can always change your mind later.
      </p>

      <TipsCarousel />

      <div className={styles.grid}>
        {STORY_CATEGORIES.map((cat) => {
          const isSelected = topic === cat
          return (
            <button
              key={cat}
              type="button"
              className={`${styles.card} ${isSelected ? styles.cardSelected : ''}`}
              onClick={() => onChange(cat)}
              aria-pressed={isSelected}
            >
              <span className={styles.cardIcon}>{TOPIC_ICONS[cat]}</span>
              <span className={styles.cardLabel}>{cat}</span>
              <span className={styles.cardCheck} aria-hidden={!isSelected}>
                <IconCheck />
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ── Tips carousel ────────────────────────────────────

function TipsCarousel() {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  useEffect(() => {
    if (paused) return
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % TIPS.length)
    }, 5500)
    return () => window.clearInterval(id)
  }, [paused, index])

  const tip = TIPS[index]

  return (
    <div
      className={styles.tips}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {paused && <span className={styles.tipsPaused}>paused</span>}

      <div className={`${styles.tipCard} ${styles[tip.hue]}`} key={index}>
        <div className={styles.tipIcon}>{tip.icon}</div>
        <div className={styles.tipBody}>
          <strong className={styles.tipTitle}>{tip.title}</strong>
          <p className={styles.tipText}>{tip.body}</p>
        </div>
      </div>

      <div className={styles.tipDots} role="tablist" aria-label="Tip navigation">
        {TIPS.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-selected={i === index}
            aria-label={`Tip ${i + 1} of ${TIPS.length}`}
            className={`${styles.tipDot} ${i === index ? styles.tipDotActive : ''}`}
            onClick={() => setIndex(i)}
          />
        ))}
      </div>
    </div>
  )
}

// ── Icons: topics ────────────────────────────────────

function IconSprout() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M7 20h10" /><path d="M12 20V10" /><path d="M12 10C12 7 14 5 17 5c0 3-2 5-5 5z" /><path d="M12 13C12 11 10 9 7 9c0 3 2 4 5 4z" /></svg>
}

function IconChartUp() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 17 9 11 13 15 21 7" /><polyline points="15 7 21 7 21 13" /></svg>
}

function IconDoor() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 20V5a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v15" /><line x1="4" y1="20" x2="20" y2="20" /><circle cx="14.5" cy="12.5" r="0.7" fill="currentColor" /></svg>
}

function IconHandHeart() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 14h6a2 2 0 0 1 0 4h-7l-4 2v-9a3 3 0 0 1 3-3h4" /><path d="M16 3.5c1.2-1 3-1 4 0 1.2 1.2 1 3-0.5 4.2L16 11l-3.5-3.3c-1.5-1.2-1.7-3-0.5-4.2 1-1 2.8-1 4 0z" /></svg>
}

function IconShield() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11z" /><polyline points="9 12 11 14 15 10" /></svg>
}

function IconHome() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6h-6v6H4a1 1 0 0 1-1-1z" /></svg>
}

function IconBriefcase() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><line x1="2" y1="13" x2="22" y2="13" /></svg>
}

function IconSparkle() {
  return <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 3v4" /><path d="M12 17v4" /><path d="M3 12h4" /><path d="M17 12h4" /><path d="M6 6l2.5 2.5" /><path d="M15.5 15.5L18 18" /><path d="M6 18l2.5-2.5" /><path d="M15.5 8.5L18 6" /></svg>
}

// ── Icons: tips ──────────────────────────────────────

function IconHourglass() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M6 2h12" /><path d="M6 22h12" /><path d="M6 2v4a6 6 0 0 0 12 0V2" /><path d="M6 22v-4a6 6 0 0 1 12 0v4" /></svg>
}

function IconCompass() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
}

function IconQuote() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></svg>
}

function IconFootsteps() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><ellipse cx="7" cy="7" rx="3" ry="4" /><ellipse cx="16" cy="15" rx="3" ry="4" /><path d="M5 14c0 1 .5 2 2 2" /><path d="M14 22c0 1 .5 2 2 2" /></svg>
}

function IconLeaf() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M11 20A7 7 0 0 1 4 13c0-6 5-10 16-10-1 9-4 16-9 17z" /><path d="M4 20c4-6 8-9 12-11" /></svg>
}

function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}
