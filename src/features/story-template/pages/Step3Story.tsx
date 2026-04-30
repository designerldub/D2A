import { useRef, useState, type ChangeEvent, type DragEvent, type ReactNode } from 'react'
import styles from './Step3Story.module.css'

// ── Types ────────────────────────────────────────────

export type StoryMethod = 'upload' | 'write' | 'guided'

type Props = {
  method: StoryMethod | null
  uploads: File[]
  storyText: string
  guidedAnswers: Record<string, string>
  onChange: (patch: {
    method?: StoryMethod | null
    uploads?: File[]
    storyText?: string
    guidedAnswers?: Record<string, string>
  }) => void
}

// ── Guided question bank ─────────────────────────────

const GUIDED_QUESTIONS = [
  { id: 'beginning', label: 'Where does your story begin?',       hint: 'What was life like before the moments you want to share?' },
  { id: 'change',    label: 'What changed?',                       hint: 'A turning point, a decision, or an unexpected event.' },
  { id: 'support',   label: 'Who or what helped along the way?',   hint: 'People, places, services, or habits that made a difference.' },
  { id: 'insight',   label: 'What did you learn about yourself?',  hint: 'Surprises, insights, or realizations from the experience.' },
  { id: 'now',       label: 'Where are you now, and what\u2019s next?', hint: 'Your current chapter and what you\u2019re looking forward to.' },
] as const

// ── Component ────────────────────────────────────────

export function Step3Story({ method, uploads, storyText, guidedAnswers, onChange }: Props) {
  return (
    <div className={styles.step}>
      <p className={styles.intro}>
        Choose how you&apos;d like to share your story. You can always come back and try a different way.
      </p>

      <MethodPicker method={method} onChange={(m) => onChange({ method: m })} />

      {method === null && <EmptyHint />}
      {method === 'upload' && (
        <UploadArea files={uploads} onFilesChange={(f) => onChange({ uploads: f })} />
      )}
      {method === 'write' && (
        <WriteArea text={storyText} onTextChange={(t) => onChange({ storyText: t })} />
      )}
      {method === 'guided' && (
        <GuidedArea answers={guidedAnswers} onChange={(a) => onChange({ guidedAnswers: a })} />
      )}
    </div>
  )
}

// ── Method picker ────────────────────────────────────

type MethodOption = {
  key: StoryMethod
  title: string
  desc: string
  icon: ReactNode
}

const METHOD_OPTIONS: MethodOption[] = [
  { key: 'upload', title: 'Upload',         desc: 'Bring your own text, audio, or video file.',   icon: <IconUpload /> },
  { key: 'write',  title: 'Write or speak', desc: 'Start typing, or use your voice.',              icon: <IconPencil /> },
  { key: 'guided', title: 'Guided',         desc: 'Answer a few questions to shape your story.',   icon: <IconCompass /> },
]

function MethodPicker({
  method,
  onChange,
}: {
  method: StoryMethod | null
  onChange: (m: StoryMethod) => void
}) {
  return (
    <div className={styles.picker}>
      {METHOD_OPTIONS.map((opt) => {
        const active = method === opt.key
        return (
          <button
            key={opt.key}
            type="button"
            className={`${styles.methodCard} ${active ? styles.methodCardActive : ''}`}
            onClick={() => onChange(opt.key)}
            aria-pressed={active}
          >
            <div className={styles.methodIcon}>{opt.icon}</div>
            <div className={styles.methodText}>
              <span className={styles.methodTitle}>{opt.title}</span>
              <span className={styles.methodDesc}>{opt.desc}</span>
            </div>
            <span className={styles.methodCheck} aria-hidden={!active}>
              <IconCheck />
            </span>
          </button>
        )
      })}
    </div>
  )
}

// ── Empty state ──────────────────────────────────────

function EmptyHint() {
  return (
    <div className={styles.emptyHint}>
      <p>Pick a method above to get started.</p>
    </div>
  )
}

// ── Upload ───────────────────────────────────────────

function UploadArea({
  files,
  onFilesChange,
}: {
  files: File[]
  onFilesChange: (f: File[]) => void
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  function addFiles(list: FileList | null) {
    if (!list || list.length === 0) return
    onFilesChange([...files, ...Array.from(list)])
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragActive(false)
    addFiles(e.dataTransfer.files)
  }

  function handleInput(e: ChangeEvent<HTMLInputElement>) {
    addFiles(e.target.files)
    e.target.value = ''
  }

  function removeAt(idx: number) {
    onFilesChange(files.filter((_, i) => i !== idx))
  }

  return (
    <div className={styles.contentCard}>
      <div
        className={`${styles.dropzone} ${dragActive ? styles.dropzoneActive : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        onClick={() => inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
      >
        <div className={styles.dropIcon}><IconCloudUpload /></div>
        <p className={styles.dropTitle}>
          {dragActive ? 'Release to upload' : 'Drop files here, or click to browse'}
        </p>
        <p className={styles.dropHint}>
          Text (.txt, .docx, .pdf) · audio (.mp3, .m4a, .wav) · video (.mp4, .mov)
        </p>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept=".txt,.docx,.pdf,audio/*,video/*"
          onChange={handleInput}
          style={{ display: 'none' }}
        />
      </div>

      {files.length > 0 && (
        <ul className={styles.fileList}>
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className={styles.fileItem}>
              <span className={styles.fileIcon}><IconFile /></span>
              <span className={styles.fileName}>{f.name}</span>
              <span className={styles.fileSize}>{formatSize(f.size)}</span>
              <button
                type="button"
                className={styles.fileRemove}
                onClick={() => removeAt(i)}
                aria-label={`Remove ${f.name}`}
              >
                <IconX />
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}

// ── Write or speak ───────────────────────────────────

function WriteArea({
  text,
  onTextChange,
}: {
  text: string
  onTextChange: (t: string) => void
}) {
  return (
    <div className={styles.contentCard}>
      <StoryTextarea
        value={text}
        onChange={onTextChange}
        placeholder="Type or tap the microphone button to share your story."
        rows={10}
      />
    </div>
  )
}

// ── Shared textarea with voice-input toolbar ─────────

function StoryTextarea({
  id,
  value,
  onChange,
  placeholder,
  rows = 5,
}: {
  id?: string
  value: string
  onChange: (v: string) => void
  placeholder?: string
  rows?: number
}) {
  const [listening, setListening] = useState(false)
  return (
    <div className={styles.textareaWrap}>
      <textarea
        id={id}
        className={styles.textarea}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
      />
      <div className={styles.textareaToolbar}>
        <button
          type="button"
          className={`${styles.voiceBtn} ${listening ? styles.voiceBtnActive : ''}`}
          onClick={() => setListening((v) => !v)}
          aria-pressed={listening}
          aria-label={listening ? 'Stop voice input' : 'Start voice input'}
        >
          {listening ? (
            <>
              <span className={styles.voiceDot} aria-hidden="true" />
              Listening&hellip;
            </>
          ) : (
            <>
              <IconMic />
              Voice input
            </>
          )}
        </button>
        <span className={styles.charCount}>
          {value.length} character{value.length === 1 ? '' : 's'}
        </span>
      </div>
    </div>
  )
}

// ── Guided questions ─────────────────────────────────

function GuidedArea({
  answers,
  onChange,
}: {
  answers: Record<string, string>
  onChange: (a: Record<string, string>) => void
}) {
  return (
    <div className={styles.contentCard}>
      <p className={styles.guidedIntro}>
        No pressure to answer every question &mdash; skip any that don&apos;t feel right.
      </p>
      <ol className={styles.questionList}>
        {GUIDED_QUESTIONS.map((q, i) => (
          <li key={q.id} className={styles.questionItem}>
            <div className={styles.questionHeader}>
              <span className={styles.questionNumber}>{i + 1}</span>
              <div className={styles.questionText}>
                <label htmlFor={`q-${q.id}`} className={styles.questionLabel}>{q.label}</label>
                <span className={styles.questionHint}>{q.hint}</span>
              </div>
            </div>
            <div className={styles.questionTextareaWrap}>
              <StoryTextarea
                id={`q-${q.id}`}
                value={answers[q.id] ?? ''}
                onChange={(v) => onChange({ ...answers, [q.id]: v })}
                placeholder="Take your time&hellip;"
                rows={3}
              />
            </div>
          </li>
        ))}
      </ol>
    </div>
  )
}

// ── Helpers ──────────────────────────────────────────

function formatSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

// ── Icons ────────────────────────────────────────────

function IconUpload() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
}

function IconPencil() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20h9" /><path d="M16.5 3.5a2.121 2.121 0 1 1 3 3L7 19l-4 1 1-4L16.5 3.5z" /></svg>
}

function IconCompass() {
  return <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" /></svg>
}

function IconCloudUpload() {
  return <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d="M20 16.58A5 5 0 0 0 18 7h-1.26A8 8 0 1 0 4 15.25" /><polyline points="16 16 12 12 8 16" /><line x1="12" y1="12" x2="12" y2="21" /></svg>
}

function IconFile() {
  return <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
}

function IconX() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
}

function IconMic() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>
}

function IconCheck() {
  return <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
}
