import { useEffect, useRef, useState, useCallback } from 'react'
import GoldLine from './GoldLine'
import './LoaderScreen.css'

interface LoaderScreenProps {
  onComplete: () => void
  onExitStart?: () => void
  duration?: number
}

type LoaderPhase = 'loading' | 'exit'

const EXIT_MS = 380

export default function LoaderScreen({
  onComplete,
  onExitStart,
  duration = 4000,
}: LoaderScreenProps) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<LoaderPhase>('loading')
  const startTime = useRef<number | null>(null)
  const rafId = useRef<number>(0)
  const completedRef = useRef(false)

  const easeOutCubic = useCallback((t: number) => 1 - Math.pow(1 - t, 3), [])

  useEffect(() => {
    const tick = (now: number) => {
      if (startTime.current === null) startTime.current = now
      const elapsed = now - startTime.current
      const raw = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(raw)

      setProgress(eased * 100)

      if (raw < 1) rafId.current = requestAnimationFrame(tick)
    }

    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [duration, easeOutCubic])

  useEffect(() => {
    if (progress < 100 || completedRef.current) return
    completedRef.current = true

    setPhase('exit')
    onExitStart?.()
    const completeTimer = window.setTimeout(onComplete, EXIT_MS)

    return () => window.clearTimeout(completeTimer)
  }, [progress, onComplete, onExitStart])

  return (
    <div
      className={`loader-screen loader-screen--${phase}`}
      aria-busy={phase !== 'exit'}
      aria-label="Loading MAJ Boutique"
    >
      <div className="loader-screen__bg" aria-hidden="true" />
      <div className="loader-screen__scrim" aria-hidden="true" />

      <div className="loader-screen__content">
        <div className="loader-screen__brand">
          <div className="loader-screen__logo-stage">
            <div className="loader-screen__logo-circle">
              <div className="loader-screen__logo-ring" aria-hidden="true" />
              <img
                src="/wh_logo.png"
                alt="MAJ Boutique"
                className="loader-screen__logo"
                width={360}
                height={360}
                draggable={false}
                decoding="async"
                fetchPriority="high"
              />
            </div>
          </div>

          <div className="loader-screen__loading">
            <GoldLine progress={progress} />
            <div className="loader-screen__percent" aria-live="polite">
              <span className="loader-screen__percent-label">Loading</span>
              <span className="loader-screen__percent-value">
                {Math.round(progress)}
                <span className="loader-screen__percent-sign">%</span>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
