import { useEffect, useRef, useState, useCallback } from 'react'
import GoldenGlitter from './GoldenGlitter'
import GoldLine from './GoldLine'
import './LoaderScreen.css'

interface LoaderScreenProps {
  onComplete: () => void
  onReveal?: () => void
  duration?: number
}

type LoaderPhase = 'loading' | 'shine' | 'reveal' | 'exit'

const TAGLINES = [
  'Luxury Crafted',
  'Timeless Elegance',
  'Fine Jewellery Collection',
  'Welcome to MAJ Boutique',
] as const

const SHINE_MS = 280
const REVEAL_MS = 220
const COMPLETE_MS = 520

function getTaglineIndex(progress: number) {
  if (progress >= 75) return 3
  if (progress >= 50) return 2
  if (progress >= 25) return 1
  return 0
}

export default function LoaderScreen({
  onComplete,
  onReveal,
  duration = 700,
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
      const next = eased * 100

      setProgress(next)
      setDisplayPercent(Math.round(next))

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

  const taglineIndex = getTaglineIndex(progress)

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
      </div>

      <GoldenGlitter />
      <div className="loader-screen__gold-reveal" aria-hidden="true" />

      <div className="loader-screen__content">
        <div className="loader-screen__brand">
          <div className="loader-screen__logo-medallion">
            <div className="loader-screen__logo-glow" aria-hidden="true" />
            <div className="loader-screen__logo-circle">
              <img
                src="/wh_logo.jpeg"
                alt="MAJ Boutique"
                className="loader-screen__logo"
                width={300}
                height={300}
                draggable={false}
                decoding="async"
                fetchPriority="high"
              />
              <div className="loader-screen__logo-shine" aria-hidden="true" />
            </div>
          </div>

          <div className="loader-screen__typography">
            <p className="loader-screen__eyebrow">Fine Jewellery</p>
            <h1 className="loader-screen__title">MAJ Boutique</h1>
          </div>

          <div className="loader-screen__loading">
            <GoldLine progress={progress} />

            <div className="loader-screen__meta">
              <div className="loader-screen__tagline-slot">
                <p key={taglineIndex} className="loader-screen__tagline">
                  {TAGLINES[taglineIndex]}
                </p>
              </div>
              <span className="loader-screen__percent" aria-live="polite">
                {displayPercent}
                <span className="loader-screen__percent-sign">%</span>
              </span>
            </div>

            <p className="loader-screen__loading-label">Loading</p>
          </div>
        </div>
      </div>
    </div>
  )
}
