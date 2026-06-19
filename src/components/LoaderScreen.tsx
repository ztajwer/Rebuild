import { useEffect, useRef, useState, useCallback } from 'react'
import GoldLine from './GoldLine'
import './LoaderScreen.css'

interface LoaderScreenProps {
  onComplete: () => void
  onReveal?: () => void
  duration?: number
}

type LoaderPhase = 'loading' | 'shine' | 'reveal' | 'exit'

const SHINE_MS = 320
const REVEAL_MS = 240
const COMPLETE_MS = 560

export default function LoaderScreen({
  onComplete,
  onReveal,
  duration = 750,
}: LoaderScreenProps) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<LoaderPhase>('loading')
  const [displayPercent, setDisplayPercent] = useState(0)
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
      setDisplayPercent(Math.round(eased * 100))

      if (raw < 1) rafId.current = requestAnimationFrame(tick)
    }

    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [duration, easeOutCubic])

  useEffect(() => {
    if (progress < 100 || completedRef.current) return
    completedRef.current = true

    setPhase('shine')

    const revealTimer = window.setTimeout(() => {
      setPhase('reveal')
      onReveal?.()
    }, SHINE_MS)

    const exitTimer = window.setTimeout(() => setPhase('exit'), SHINE_MS + REVEAL_MS)
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
      <div className="loader-screen__overlay" aria-hidden="true" />

      <div className="loader-screen__diamond-reflections" aria-hidden="true">
        <div className="loader-screen__diamond loader-screen__diamond--1" />
        <div className="loader-screen__diamond loader-screen__diamond--2" />
        <span className="loader-screen__sparkle loader-screen__sparkle--1" />
        <span className="loader-screen__sparkle loader-screen__sparkle--2" />
        <span className="loader-screen__sparkle loader-screen__sparkle--3" />
      </div>

      <div className="loader-screen__gold-reveal" aria-hidden="true" />

      <div className="loader-screen__content">
        <div className="loader-screen__brand">
          <div className="loader-screen__logo-wrap">
            <img
              src="/wh_logo.jpeg"
              alt="MAJ Boutique"
              className="loader-screen__logo"
              width={380}
              height={380}
              draggable={false}
              decoding="async"
              fetchPriority="high"
            />
          </div>

          <div className="loader-screen__typography">
            <h1 className="loader-screen__title">MAJ Boutique</h1>
            <p className="loader-screen__eyebrow">Fine Jewellery</p>
          </div>

          <div className="loader-screen__loading">
            <GoldLine progress={progress} />
            <p className="loader-screen__status" aria-live="polite">
              Loading <span className="loader-screen__status-num">{displayPercent}%</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
