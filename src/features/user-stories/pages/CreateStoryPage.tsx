import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { StoryCategory, StoryType } from '../storiesData'
import { Step1Topic } from './Step1Topic'
import { Step2StoryType } from './Step2StoryType'
import { Step3Story, type StoryMethod } from './Step3Story'
import { Step4Review } from './Step4Review'
import { Step5Publish } from './Step5Publish'
import styles from './CreateStoryPage.module.css'

// ── Step config ───────────────────────────────────────

type StepDef = {
  num: number
  label: string
  short: string
}

const STEPS: StepDef[] = [
  { num: 1, label: 'Select a Category', short: 'Category' },
  { num: 2, label: 'Story Type',     short: 'Type'    },
  { num: 3, label: 'Story',          short: 'Story'   },
  { num: 4, label: 'Review',         short: 'Review'  },
  { num: 5, label: 'Publish',        short: 'Publish' },
]

// ── Story draft state ────────────────────────────────

type StoryDraft = {
  topic: StoryCategory | null
  types: StoryType[]
  method: StoryMethod | null
  uploads: File[]
  storyText: string
  guidedAnswers: Record<string, string>
  excludedTypes: StoryType[]
  consentOrg: boolean
  consentOnline: boolean
  signature: string
}

const INITIAL_DRAFT: StoryDraft = {
  topic: null,
  types: [],
  method: null,
  uploads: [],
  storyText: '',
  guidedAnswers: {},
  excludedTypes: [],
  consentOrg: false,
  consentOnline: false,
  signature: '',
}

// ── Page ──────────────────────────────────────────────

export function CreateStoryPage() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(1)
  const [draft, setDraft] = useState<StoryDraft>(INITIAL_DRAFT)
  const stepContainerRef = useRef<HTMLDivElement>(null)

  // Reset step container scroll to top whenever the step changes
  useEffect(() => {
    stepContainerRef.current?.scrollTo({ top: 0 })
  }, [currentStep])

  const isFirst = currentStep === 1
  const isLast = currentStep === STEPS.length
  const currentDef = STEPS[currentStep - 1]

  // ── Per-step validation ─────────────────────────────
  // Defensive against stale HMR state where new fields may be undefined.
  const canContinue = (() => {
    if (currentStep === 1) return draft.topic !== null
    if (currentStep === 2) return (draft.types?.length ?? 0) > 0
    if (currentStep === 3) {
      if (draft.method === 'upload') return (draft.uploads?.length ?? 0) > 0
      if (draft.method === 'write')  return (draft.storyText?.trim().length ?? 0) > 0
      if (draft.method === 'guided') {
        const answers = draft.guidedAnswers ?? {}
        return Object.values(answers).some((a) => a.trim().length > 0)
      }
      return false
    }
    if (currentStep === 4) {
      const types = draft.types ?? []
      const excluded = draft.excludedTypes ?? []
      return types.some((t) => !excluded.includes(t))
    }
    if (currentStep === 5) {
      const hasConsent = !!draft.consentOrg || !!draft.consentOnline
      const hasSignature = (draft.signature ?? '').trim().length > 0
      return hasConsent && hasSignature
    }
    return true
  })()

  function handleBack() {
    if (isFirst) {
      navigate('/user-stories')
    } else {
      setCurrentStep((s) => s - 1)
    }
  }

  function handleNext() {
    if (!canContinue) return
    if (isLast) {
      navigate('/user-stories')
    } else {
      setCurrentStep((s) => s + 1)
    }
  }

  function handleCancel() {
    navigate('/user-stories')
  }

  return (
    <div className={styles.page}>
      {/* ── Header ── */}
      <div className={styles.header}>
        <button className={styles.backLink} onClick={() => navigate('/user-stories')}>
          <IconArrowLeft /> User Stories
        </button>
        <div className={styles.headerText}>
          <h1 className={styles.title}>Create a Story</h1>
          <p className={styles.subtitle}>Share an anonymous story with your community in 5 steps.</p>
        </div>
      </div>

      {/* ── Progress indicator ── */}
      <ProgressIndicator currentStep={currentStep} />

      {/* ── Step content ── */}
      <div className={styles.stepContainer} ref={stepContainerRef}>
        {currentStep !== 1 && (
          <div className={styles.stepHeader}>
            <h2 className={styles.stepTitle}>{currentDef.label}</h2>
          </div>
        )}

        <div className={styles.stepBody}>
          {currentStep === 1 && (
            <Step1Topic
              topic={draft.topic}
              title={currentDef.label}
              onChange={(topic) => setDraft((d) => ({ ...d, topic }))}
            />
          )}
          {currentStep === 2 && (
            <Step2StoryType
              types={draft.types ?? []}
              onToggle={(type) =>
                setDraft((d) => {
                  const current = d.types ?? []
                  return {
                    ...d,
                    types: current.includes(type)
                      ? current.filter((t) => t !== type)
                      : [...current, type],
                  }
                })
              }
            />
          )}
          {currentStep === 3 && (
            <Step3Story
              method={draft.method ?? null}
              uploads={draft.uploads ?? []}
              storyText={draft.storyText ?? ''}
              guidedAnswers={draft.guidedAnswers ?? {}}
              onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            />
          )}
          {currentStep === 4 && (
            <Step4Review
              topic={draft.topic ?? null}
              types={draft.types ?? []}
              excludedTypes={draft.excludedTypes ?? []}
              method={draft.method ?? null}
              storyText={draft.storyText ?? ''}
              guidedAnswers={draft.guidedAnswers ?? {}}
              uploads={draft.uploads ?? []}
              onToggle={(type) =>
                setDraft((d) => {
                  const excluded = d.excludedTypes ?? []
                  return {
                    ...d,
                    excludedTypes: excluded.includes(type)
                      ? excluded.filter((t) => t !== type)
                      : [...excluded, type],
                  }
                })
              }
            />
          )}
          {currentStep === 5 && (
            <Step5Publish
              topic={draft.topic ?? null}
              types={draft.types ?? []}
              excludedTypes={draft.excludedTypes ?? []}
              consentOrg={!!draft.consentOrg}
              consentOnline={!!draft.consentOnline}
              signature={draft.signature ?? ''}
              onChange={(patch) => setDraft((d) => ({ ...d, ...patch }))}
            />
          )}
        </div>
      </div>

      {/* ── Nav ── */}
      <div className={styles.navRow}>
        <button className={styles.cancelBtn} onClick={handleCancel}>
          Cancel
        </button>
        <div className={styles.navRight}>
          {!isFirst && (
            <button className={styles.secondaryBtn} onClick={handleBack}>
              Back
            </button>
          )}
          <button
            className={styles.primaryBtn}
            onClick={handleNext}
            disabled={!canContinue}
          >
            {isLast ? 'Publish Story' : 'Continue'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Progress indicator ────────────────────────────────

function ProgressIndicator({ currentStep }: { currentStep: number }) {
  const current = STEPS[currentStep - 1]
  return (
    <div
      className={styles.progress}
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={STEPS.length}
      aria-valuenow={currentStep}
      aria-label={`Step ${currentStep} of ${STEPS.length}: ${current.label}`}
    >
      <div className={styles.progressCaption}>
        <span className={styles.progressStepNum}>Step {currentStep} of {STEPS.length}</span>
      </div>
      <div className={styles.progressTrack} aria-hidden="true">
        {STEPS.map((step) => {
          const state =
            step.num < currentStep ? 'done' : step.num === currentStep ? 'active' : 'upcoming'
          return (
            <div
              key={step.num}
              className={`${styles.progressSegment} ${styles[state]}`}
            />
          )
        })}
      </div>
    </div>
  )
}

// ── Icons ─────────────────────────────────────────────

function IconArrowLeft() {
  return <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>
}
