import { useState, useRef, useEffect, useCallback } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { STORIES, TYPE_LABELS, TYPE_COLORS, type Story, type StoryType } from '../storiesData'
import styles from './StoryPage.module.css'

export function StoryPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const story = STORIES.find((s) => s.id === Number(id))

  const [copied, setCopied] = useState(false)
  const [showContact, setShowContact] = useState(false)

  if (!story) {
    return (
      <div className={styles.notFound}>
        <p>Story not found.</p>
        <button className={styles.backLink} onClick={() => navigate('/story-template')}>← Back to Story Template</button>
      </div>
    )
  }

  function handleShare() {
    navigator.clipboard.writeText(window.location.href).catch(() => {})
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const tc = TYPE_COLORS[story.type]

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <div className={styles.headerNav}>
          <button className={styles.backBtn} onClick={() => navigate('/story-template')}>
            <IconArrowLeft /> Story Template
          </button>
          <div className={styles.headerActions}>
            <button className={styles.actionBtn} onClick={handleShare}>
              {copied ? <><IconCheck /> Copied!</> : <><IconShare /> Share</>}
            </button>
            <button className={styles.contactBtn} onClick={() => setShowContact(true)}>
              <IconMail /> Contact Author
            </button>
          </div>
        </div>

        <span className={styles.typeBadge} style={{ background: tc.bg, color: tc.color }}>
          <TypeIcon type={story.type} />
          {TYPE_LABELS[story.type]}
        </span>

        <h1 className={styles.title}>{story.title}</h1>

        <div className={styles.headerFooter}>
          <span className={styles.org}>{story.org}</span>
          <div className={styles.tags}>
            {story.tags.map((tag) => (
              <span key={tag} className={styles.tag}>{tag}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Story content ── */}
      <div className={styles.content}>
        {story.type === 'text'        && <TextStory story={story} />}
        {story.type === 'audio'       && <AudioStory story={story} />}
        {story.type === 'journey'     && <JourneyStory story={story} />}
        {story.type === 'infographic' && <InfographicStory story={story} />}
        {story.type === 'quotes'      && <QuotesStory story={story} />}
        {story.type === 'wordcloud'   && <WordCloudStory story={story} />}
        {story.type === 'brochure'    && <BrochureStory story={story} />}
      </div>

      {/* ── Contact modal ── */}
      {showContact && <ContactModal onClose={() => setShowContact(false)} />}
    </div>
  )
}

// ── Text ──────────────────────────────────────────────

function TextStory({ story }: { story: Story }) {
  return (
    <div className={styles.textStory}>
      {story.pullQuote && (
        <blockquote className={styles.pullQuote}>
          <IconQuoteMark />
          {story.pullQuote}
        </blockquote>
      )}
      {story.paragraphs?.map((p, i) => (
        <p key={i} className={styles.paragraph}>{p}</p>
      ))}
    </div>
  )
}

// ── Audio ─────────────────────────────────────────────

function AudioStory({ story }: { story: Story }) {
  const [playing, setPlaying] = useState(false)
  const [progress, setProgress] = useState(0)
  const [elapsedSecs, setElapsedSecs] = useState(0)
  const [showTranscript, setShowTranscript] = useState(false)
  const [voicesReady, setVoicesReady] = useState(false)

  const uttRef = useRef<SpeechSynthesisUtterance | null>(null)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const startTimeRef = useRef(0)    // wall-clock ms when play started
  const elapsedAtPauseRef = useRef(0) // seconds elapsed when paused

  const transcript = story.transcript ?? ''

  // SpeechSynthesis voices load asynchronously in some browsers
  useEffect(() => {
    const load = () => setVoicesReady(speechSynthesis.getVoices().length > 0)
    load()
    speechSynthesis.addEventListener('voiceschanged', load)
    return () => speechSynthesis.removeEventListener('voiceschanged', load)
  }, [])

  function fmt(secs: number) {
    const m = Math.floor(secs / 60)
    const s = Math.floor(secs % 60)
    return `${m}:${s.toString().padStart(2, '0')}`
  }

  function pickVoice() {
    const voices = speechSynthesis.getVoices()
    // Prefer a natural-sounding English voice
    const prefer = ['Samantha', 'Karen', 'Moira', 'Alex', 'Daniel', 'Google US English', 'Microsoft Aria']
    for (const name of prefer) {
      const v = voices.find(v => v.name.includes(name))
      if (v) return v
    }
    return voices.find(v => v.lang.startsWith('en')) ?? voices[0] ?? null
  }

  // Estimate total duration from word count (~140 wpm at 0.9x rate)
  const wordCount = transcript.split(/\s+/).length
  const estDurationSecs = Math.round((wordCount / 140) * 60 * (1 / 0.88))

  const stopTicker = useCallback(() => {
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null }
  }, [])

  const startTicker = useCallback((fromSecs: number) => {
    startTimeRef.current = Date.now() - fromSecs * 1000
    intervalRef.current = setInterval(() => {
      const elapsed = (Date.now() - startTimeRef.current) / 1000
      const clamped = Math.min(elapsed, estDurationSecs)
      setElapsedSecs(clamped)
      setProgress((clamped / estDurationSecs) * 100)
    }, 80)
  }, [estDurationSecs])

  function doStop() {
    speechSynthesis.cancel()
    stopTicker()
  }

  function togglePlay() {
    if (playing) {
      speechSynthesis.pause()
      elapsedAtPauseRef.current = elapsedSecs
      stopTicker()
      setPlaying(false)
    } else {
      if (speechSynthesis.paused && uttRef.current) {
        // Resume where we left off
        speechSynthesis.resume()
        startTicker(elapsedAtPauseRef.current)
        setPlaying(true)
      } else {
        // Fresh start (or after scrub)
        speechSynthesis.cancel()
        const utt = new SpeechSynthesisUtterance(transcript)
        utt.rate = 0.88
        utt.pitch = 1.0
        const voice = pickVoice()
        if (voice) utt.voice = voice

        utt.onend = () => {
          stopTicker()
          setProgress(100)
          setElapsedSecs(estDurationSecs)
          setPlaying(false)
          elapsedAtPauseRef.current = 0
        }
        utt.onerror = () => {
          stopTicker()
          setPlaying(false)
        }

        uttRef.current = utt
        speechSynthesis.speak(utt)
        startTicker(elapsedAtPauseRef.current)
        setPlaying(true)
      }
    }
  }

  function handleScrub(val: number) {
    // SpeechSynthesis can't seek into text, so restart from beginning on scrub
    doStop()
    const secs = (val / 100) * estDurationSecs
    elapsedAtPauseRef.current = secs
    setProgress(val)
    setElapsedSecs(secs)
    setPlaying(false)
    uttRef.current = null
  }

  useEffect(() => () => doStop(), [])

  const bars = story.waveform ?? []
  const playedIdx = Math.floor((progress / 100) * bars.length)

  return (
    <div className={styles.audioStory}>
      {!voicesReady && (
        <p className={styles.audioNote}>Loading voice synthesis…</p>
      )}
      <div className={styles.audioPlayer}>
        <button className={styles.playBtn} onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'} disabled={!voicesReady}>
          {playing ? <IconPause /> : <IconPlay />}
        </button>

        <div className={styles.waveformWrap}>
          <div className={styles.waveform} aria-hidden="true">
            {bars.map((h, i) => (
              <div
                key={i}
                className={[
                  styles.waveBar,
                  i < playedIdx ? styles.waveBarPlayed : '',
                  playing && i === playedIdx ? styles.waveBarCursor : '',
                ].join(' ')}
                style={{ height: `${h * 10}%` }}
              />
            ))}
          </div>
          <input
            type="range" className={styles.scrubber}
            min={0} max={100} step={0.1} value={progress}
            onChange={(e) => handleScrub(Number(e.target.value))}
            aria-label="Playback position"
          />
        </div>

        <div className={styles.timeInfo}>
          <span className={styles.timeCurrent}>{fmt(elapsedSecs)}</span>
          <span className={styles.timeSep}>/</span>
          <span className={styles.timeTotal}>{fmt(estDurationSecs)}</span>
        </div>
      </div>

      <p className={styles.audioNote}>Voice narration powered by your browser's built-in speech engine.</p>

      <button className={styles.transcriptToggle} onClick={() => setShowTranscript(v => !v)}>
        {showTranscript ? 'Hide' : 'Read'} transcript
        <IconChevron open={showTranscript} />
      </button>

      {showTranscript && story.transcript && (
        <div className={styles.transcript}>
          {story.transcript.split('\n\n').map((para, i) => (
            <p key={i}>{para}</p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Visual Journey ────────────────────────────────────

const STEP_GRADIENTS = [
  'linear-gradient(150deg, #1e1b4b 0%, #312e81 100%)',
  'linear-gradient(150deg, #431407 0%, #9a3412 100%)',
  'linear-gradient(150deg, #064e3b 0%, #0d9488 100%)',
  'linear-gradient(150deg, #7f1d1d 0%, #dc2626 100%)',
  'linear-gradient(150deg, #1e3a5f 0%, #2563eb 100%)',
  'linear-gradient(150deg, #14532d 0%, #16a34a 100%)',
  'linear-gradient(150deg, #065f46 0%, #2a9d8f 100%)',
]

const MOOD_STYLES = {
  positive: { dot: '#16a34a', badge: '#dcfce7', text: '#15803d', label: '↑ Positive' },
  negative: { dot: '#dc2626', badge: '#fee2e2', text: '#b91c1c', label: '↓ Difficult' },
  neutral:  { dot: '#6b7280', badge: '#f3f4f6', text: '#374151', label: '→ Navigating' },
}

function JourneyStory({ story }: { story: Story }) {
  const steps = story.steps ?? []
  const W = 760
  const H = 72
  const moodY: Record<string, number> = { positive: 12, neutral: 36, negative: 60 }
  const pts = steps.map((s, i) => ({
    x: steps.length < 2 ? W / 2 : (i / (steps.length - 1)) * W,
    y: moodY[s.mood ?? 'neutral'],
  }))

  let linePath = ''
  let fillPath = ''
  if (pts.length >= 2) {
    linePath = `M ${pts[0].x} ${pts[0].y}`
    for (let i = 1; i < pts.length; i++) {
      const cp = (pts[i - 1].x + pts[i].x) / 2
      linePath += ` C ${cp} ${pts[i - 1].y} ${cp} ${pts[i].y} ${pts[i].x} ${pts[i].y}`
    }
    fillPath = linePath + ` L ${pts[pts.length - 1].x} ${H} L 0 ${H} Z`
  }

  return (
    <div className={styles.journeyStory}>
      {/* Mood arc */}
      <div className={styles.arcContainer}>
        <div className={styles.arcYLabels}>
          <span style={{ color: '#16a34a' }}>Positive</span>
          <span style={{ color: '#9ca3af' }}>Neutral</span>
          <span style={{ color: '#dc2626' }}>Difficult</span>
        </div>
        <div className={styles.arcSvgWrap}>
          <svg className={styles.moodArc} viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none">
            <defs>
              <linearGradient id="arcFillGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"   stopColor="#22c55e" stopOpacity="0.3" />
                <stop offset="50%"  stopColor="#9ca3af" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#ef4444" stopOpacity="0.3" />
              </linearGradient>
            </defs>
            {fillPath && <path d={fillPath} fill="url(#arcFillGrad)" />}
            {linePath && <path d={linePath} fill="none" stroke="#d1d5db" strokeWidth="2" />}
            {pts.map((pt, i) => {
              const mood = steps[i]?.mood ?? 'neutral'
              return <circle key={i} cx={pt.x} cy={pt.y} r="6" fill={MOOD_STYLES[mood].dot} stroke="white" strokeWidth="2.5" />
            })}
          </svg>
          <div className={styles.arcStepLabels}>
            {steps.map((s, i) => (
              <span key={i} className={styles.arcStepLabel}>{s.period}</span>
            ))}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className={styles.journeyTimeline}>
        {steps.map((step, i) => {
          const mood = step.mood ?? 'neutral'
          const ms = MOOD_STYLES[mood]
          return (
            <div key={i} className={styles.journeyStep}>
              <div className={styles.journeyLeft}>
                <div className={styles.journeyDot} style={{ background: ms.dot }} />
                {i < steps.length - 1 && <div className={styles.journeyLine} />}
              </div>
              <div className={styles.journeyCard}>
                <div className={styles.journeyPhoto} style={{ background: STEP_GRADIENTS[i % STEP_GRADIENTS.length] }}>
                  <span className={styles.journeyPeriodBadge}>{step.period}</span>
                </div>
                <div className={styles.journeyCardBody}>
                  <h3 className={styles.journeyTitle}>{step.title}</h3>
                  <p className={styles.journeyDesc}>{step.description}</p>
                  <span className={styles.journeyMoodBadge} style={{ background: ms.badge, color: ms.text }}>{ms.label}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Infographic ───────────────────────────────────────

const BARRIER_WIDTHS  = [100, 82, 67, 54, 42]
const STRENGTH_WIDTHS = [100, 88, 76, 64, 53]

function InfographicStory({ story }: { story: Story }) {
  const themeColors = ['#1d4ed8', '#0e7490', '#6d28d9', '#065f46', '#b45309', '#9d174d']
  const themeSizes  = ['1.3rem', '1.6rem', '1.1rem', '1.4rem', '1rem', '1.2rem']

  return (
    <div className={styles.infographicStory}>
      {/* Hero stats */}
      {story.infographicStats && (
        <div className={styles.infoStatRow}>
          {story.infographicStats.map((stat) => (
            <div key={stat.label} className={styles.statCard} style={{ borderTopColor: stat.color }}>
              <div className={styles.statValue} style={{ color: stat.color }}>{stat.value}</div>
              <div className={styles.statLabel}>{stat.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Themes */}
      <div className={styles.infoThemeBlock}>
        <h3 className={styles.infoBlockHeader}><IconTag size={13} /> Key Themes</h3>
        <div className={styles.themeBubbles}>
          {story.themes?.map((t, i) => (
            <span key={t} className={styles.themeBubble}
              style={{ fontSize: themeSizes[i % themeSizes.length], color: themeColors[i % themeColors.length], borderColor: themeColors[i % themeColors.length] + '50' }}>
              {t}
            </span>
          ))}
        </div>
      </div>

      {/* Bars */}
      <div className={styles.infoBarsGrid}>
        <div className={styles.infoBarCol}>
          <h3 className={styles.infoBarHeader} style={{ color: '#dc2626' }}>
            <IconBarrier size={13} /> Barriers
          </h3>
          {story.barriers?.map((b, i) => (
            <div key={b} className={styles.infoBarRow}>
              <div className={styles.infoBarTrack}>
                <div className={styles.infoBarFill} style={{ width: `${BARRIER_WIDTHS[i] ?? 40}%`, background: `hsl(0 72% ${52 + i * 7}%)` }} />
              </div>
              <span className={styles.infoBarLabel}>{b}</span>
            </div>
          ))}
        </div>

        <div className={styles.infoBarCol}>
          <h3 className={styles.infoBarHeader} style={{ color: '#16a34a' }}>
            <IconStrength size={13} /> Strengths
          </h3>
          {story.strengths?.map((s, i) => (
            <div key={s} className={styles.infoBarRow}>
              <div className={styles.infoBarTrack}>
                <div className={styles.infoBarFill} style={{ width: `${STRENGTH_WIDTHS[i] ?? 40}%`, background: `hsl(142 71% ${32 + i * 7}%)` }} />
              </div>
              <span className={styles.infoBarLabel}>{s}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Takeaway */}
      <div className={styles.infoTakeaway}>
        <div className={styles.infoTakeawayIcon}><IconTakeaway size={18} /></div>
        <div>
          <div className={styles.infoTakeawayLabel}>Takeaway</div>
          <p className={styles.takeawayText}>{story.takeaway}</p>
        </div>
      </div>
    </div>
  )
}

// ── Quotes ────────────────────────────────────────────

function QuotesStory({ story }: { story: Story }) {
  return (
    <div className={styles.quotesStory}>
      {story.quotes?.map((q, i) => (
        <div key={i} className={styles.quoteCard}>
          <span className={styles.quoteMark}>"</span>
          <p className={styles.quoteText}>{q}</p>
        </div>
      ))}
    </div>
  )
}

// ── Word Cloud ────────────────────────────────────────

const WORD_SIZES  = ['0.85rem', '1rem', '1.2rem', '1.5rem', '1.9rem']
const WORD_COLORS = ['#374151', '#6b7280', '#0e7490', '#065f46', '#1d4ed8', '#6d28d9', '#9d174d', '#b45309']

function WordCloudStory({ story }: { story: Story }) {
  return (
    <div className={styles.wordCloudStory}>
      <div className={styles.wordCloud}>
        {story.words?.map(({ word, weight }, i) => (
          <span
            key={word}
            className={styles.cloudWord}
            style={{
              fontSize: WORD_SIZES[weight - 1],
              color: WORD_COLORS[i % WORD_COLORS.length],
              fontWeight: weight >= 4 ? 700 : weight === 3 ? 600 : 400,
            }}
          >
            {word}
          </span>
        ))}
      </div>
      <p className={styles.cloudNote}>Words are sized by how frequently or meaningfully they appeared in this person's experience.</p>
    </div>
  )
}

// ── AI Brochure ───────────────────────────────────────

const SECTION_PHOTOS = [
  'linear-gradient(150deg, #7c3aed 0%, #db2777 100%)',
  'linear-gradient(150deg, #0e7490 0%, #0369a1 100%)',
  'linear-gradient(150deg, #059669 0%, #0d9488 100%)',
  'linear-gradient(150deg, #d97706 0%, #b45309 100%)',
]

function BrochureStory({ story }: { story: Story }) {
  return (
    <div className={styles.brochureOuter}>
      <div className={styles.brochurePrintBar}>
        <span className={styles.brochureAiBadge}><IconSparkle /> AI Generated</span>
        <button className={styles.printBtn} onClick={() => window.print()}><IconPrint /> Print Brochure</button>
      </div>

      <div className={styles.brochurePaper}>
        {/* Top band */}
        <div className={styles.brochureBand}>
          <div>
            <span className={styles.brochureOrgLabel}>{story.org}</span>
            <span className={styles.brochureProgLabel}>Community Recovery Services</span>
          </div>
          <span className={styles.brochureYear}>Oregon · {new Date().getFullYear()}</span>
        </div>

        {/* Hero */}
        <div className={styles.brochureHeroImg}>
          <div className={styles.brochureHeroContent}>
            <h1 className={styles.brochureMainTitle}>{story.title}</h1>
            <div className={styles.brochureHeroDivider} />
            <p className={styles.brochureMainSub}>{story.brochureHero}</p>
            <div className={styles.brochureHeroTags}>
              {story.tags.map(t => <span key={t} className={styles.brochureHeroTag}>{t}</span>)}
            </div>
          </div>
        </div>

        {/* Body sections */}
        <div className={styles.brochureBody}>
          {story.brochureSections?.map((section, i) => (
            <div key={i} className={`${styles.brochureSection} ${i % 2 === 1 ? styles.brochureSectionReverse : ''}`}>
              <div className={styles.brochureInlinePhoto} style={{ background: SECTION_PHOTOS[i % SECTION_PHOTOS.length] }}>
                <span className={styles.brochurePhotoCaption}>{section.label}</span>
              </div>
              <div className={styles.brochureSectionText}>
                <div className={styles.brochureSectionNum}>{i + 1}</div>
                <h2 className={styles.brochureSectionHead}>{section.label}</h2>
                <p className={styles.brochureSectionBody}>{section.content}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Pull quote */}
        <div className={styles.brochureCallout}>
          <span className={styles.brochureCalloutMark}>"</span>
          <p className={styles.brochureCalloutText}>Recovery is not a destination. It's a way of traveling — forward, with people who believe you can.</p>
        </div>

        {/* Footer */}
        <div className={styles.brochureFooter}>
          <div>
            <strong>{story.org}</strong>
            <span> · Oregon Recovery Services Network</span>
          </div>
          <span className={styles.brochurePageNum}>1</span>
        </div>
      </div>

      <p className={styles.brochureDisclaimer}>Content generated by AI based on a community member's story. Reviewed for accuracy and privacy.</p>
    </div>
  )
}

// ── Contact Modal ─────────────────────────────────────

function ContactModal({ onClose }: { onClose: () => void }) {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [sent, setSent] = useState(false)

  function handleSend(e: React.FormEvent) {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className={styles.overlay} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Contact story author">
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Contact this Story Author</h2>
          <button className={styles.modalClose} onClick={onClose} aria-label="Close">
            <IconX />
          </button>
        </div>

        {sent ? (
          <div className={styles.sentState}>
            <div className={styles.sentIcon}><IconCheck /></div>
            <h3 className={styles.sentTitle}>Message sent</h3>
            <p className={styles.sentDesc}>The author will receive your message anonymously. If they'd like to connect, they'll reach out directly.</p>
            <button className={styles.sentClose} onClick={onClose}>Done</button>
          </div>
        ) : (
          <>
            <p className={styles.modalSubtitle}>They will reply to you directly if desired.</p>
            <form className={styles.modalForm} onSubmit={handleSend}>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="contactEmail">Email Address</label>
                <input
                  id="contactEmail"
                  className={styles.modalInput}
                  type="email"
                  placeholder="your@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className={styles.modalField}>
                <label className={styles.modalLabel} htmlFor="contactMessage">Message</label>
                <textarea
                  id="contactMessage"
                  className={styles.modalTextarea}
                  placeholder="Write your message here..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  required
                  rows={5}
                />
              </div>
              <button type="submit" className={styles.sendBtn}>Send Message</button>
            </form>
            <p className={styles.privacyNote}>Your privacy is important to us. Messages are sent securely.</p>
          </>
        )}
      </div>
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

function IconArrowLeft() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 12H5M12 5l-7 7 7 7" /></svg>
}
function IconShare() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="18" cy="5" r="3" /><circle cx="6" cy="12" r="3" /><circle cx="18" cy="19" r="3" /><line x1="8.59" y1="13.51" x2="15.42" y2="17.49" /><line x1="15.41" y1="6.51" x2="8.59" y2="10.49" /></svg>
}
function IconMail() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" /></svg>
}
function IconCheck() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}
function IconX() {
  return <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
}
function IconPlay() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="5 3 19 12 5 21 5 3" /></svg>
}
function IconPause() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" /><rect x="14" y="4" width="4" height="16" /></svg>
}
function IconChevron({ open }: { open: boolean }) {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: open ? 'rotate(180deg)' : 'none', transition: 'transform 0.15s' }}><polyline points="6 9 12 15 18 9" /></svg>
}
function IconQuoteMark() {
  return <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor" stroke="none" style={{ opacity: 0.12, flexShrink: 0 }}><path d="M3 21c3 0 7-1 7-8V5c0-1.25-.756-2.017-2-2H4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2 1 0 1 0 1 1v1c0 1-1 2-2 2s-1 .008-1 1.031V20c0 1 0 1 1 1z" /><path d="M15 21c3 0 7-1 7-8V5c0-1.25-.757-2.017-2-2h-4c-1.25 0-2 .75-2 1.972V11c0 1.25.75 2 2 2h.75c0 2.25.25 4-2.75 4v3c0 1 0 1 1 1z" /></svg>
}
function IconTag({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" /><line x1="7" y1="7" x2="7.01" y2="7" /></svg>
}
function IconBarrier({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="4.93" y1="4.93" x2="19.07" y2="19.07" /></svg>
}
function IconStrength({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}
function IconTakeaway({ size = 16 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>
}
function IconSparkle() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" /></svg>
}
function IconPrint() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9" /><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" /><rect x="6" y="14" width="12" height="8" /></svg>
}
