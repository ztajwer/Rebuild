import { useEffect, useRef, useState, useCallback } from 'react'
import LuxeGlitter from './LuxeGlitter'
import GoldLine from './GoldLine'
import './LoaderScreen.css'

interface LoaderScreenProps {
  onComplete: () => void
  onReveal?: () => void
  duration?: number
}

type LoaderPhase = 'loading' | 'reveal' | 'exit'

const REVEAL_MS = 400
const COMPLETE_MS = 900

export default function LoaderScreen({
  onComplete,
  onReveal,
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

    const revealTimer = window.setTimeout(() => {
      setPhase('reveal')
      onReveal?.()
    }, 200)

    const exitTimer = window.setTimeout(() => setPhase('exit'), REVEAL_MS)
    const completeTimer = window.setTimeout(onComplete, COMPLETE_MS)

    return () => {
      window.clearTimeout(revealTimer)
      window.clearTimeout(exitTimer)
      window.clearTimeout(completeTimer)
    }
  }, [progress, onComplete, onReveal])

  return (
    <div
      className={`loader-screen loader-screen--${phase}`}
      aria-busy={phase !== 'exit'}
      aria-label="Loading MAJ Boutique"
    >
      <div className="loader-screen__bg" aria-hidden="true" />
      <LuxeGlitter />
      <div className="loader-screen__gold-reveal" aria-hidden="true" />

      <div className="loader-screen__content">
        <div className="loader-screen__brand">
          <div className="loader-screen__logo-stage">
            <div className="loader-screen__logo-outline" aria-hidden="true">
              <span className="loader-screen__logo-outline-glow" />
              <span className="loader-screen__logo-outline-outer" />
              <span className="loader-screen__logo-outline-shine" />
              <span className="loader-screen__logo-outline-inner" />
            </div>
            <div className="loader-screen__logo-circle">
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
