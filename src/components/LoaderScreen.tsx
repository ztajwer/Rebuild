import { useEffect, useRef, useState, useCallback } from 'react'
import AmbientSparkles from './AmbientSparkles'
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

function getTaglineIndex(progress: number) {
  if (progress >= 75) return 3
  if (progress >= 50) return 2
  if (progress >= 25) return 1
  return 0
}

export default function LoaderScreen({
  onComplete,
  onReveal,
  duration = 5000,
}: LoaderScreenProps) {
  const [progress, setProgress] = useState(0)
  const [phase, setPhase] = useState<LoaderPhase>('loading')
  const [displayPercent, setDisplayPercent] = useState(0)
  const startTime = useRef<number | null>(null)
  const rafId = useRef<number>(0)
  const completedRef = useRef(false)

  const easeOutQuart = useCallback((t: number) => 1 - Math.pow(1 - t, 4), [])

  useEffect(() => {
    const tick = (now: number) => {
      if (startTime.current === null) startTime.current = now
      const elapsed = now - startTime.current
      const raw = Math.min(elapsed / duration, 1)
      const eased = easeOutQuart(raw)

      const next = eased * 100
      setProgress(next)
      setDisplayPercent(Math.round(next))

      if (raw < 1) {
        rafId.current = requestAnimationFrame(tick)
      }
    }

    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [duration, easeOutQuart])

  useEffect(() => {
    if (progress < 100 || completedRef.current) return
    completedRef.current = true

    setPhase('shine')

    const revealTimer = window.setTimeout(() => {
      setPhase('reveal')
      onReveal?.()
    }, 1000)

    const exitTimer = window.setTimeout(() => setPhase('exit'), 1800)

    const completeTimer = window.setTimeout(onComplete, 2600)

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

      <AmbientSparkles />

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
                width={210}
                height={210}
                draggable={false}
              />
              <div className="loader-screen__logo-shine" aria-hidden="true" />
            </div>
          </div>

          <div className="loader-screen__typography">
            <p className="loader-screen__eyebrow">Fine Jewellery</p>
            <h1 className="loader-screen__title">MAJ Boutique</h1>
            <div className="loader-screen__divider">
              <span className="loader-screen__divider-gem" />
            </div>
          </div>

          <div className="loader-screen__loading">
            <GoldLine progress={progress} />

            <div className="loader-screen__meta">
              <div className="loader-screen__tagline-slot">
                <p
                  key={taglineIndex}
                  className="loader-screen__tagline"
                >
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
