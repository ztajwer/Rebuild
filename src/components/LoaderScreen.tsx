import { useEffect, useRef, useState, useCallback } from 'react'
import SparkleBar from './SparkleBar'
import './LoaderScreen.css'

interface LoaderScreenProps {
  onComplete: () => void
  duration?: number
}

export default function LoaderScreen({
  onComplete,
  duration = 4200,
}: LoaderScreenProps) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  const startTime = useRef<number | null>(null)
  const rafId = useRef<number>(0)

  const easeOutCubic = useCallback((t: number) => 1 - Math.pow(1 - t, 3), [])

  useEffect(() => {
    const tick = (now: number) => {
      if (startTime.current === null) startTime.current = now
      const elapsed = now - startTime.current
      const raw = Math.min(elapsed / duration, 1)
      const eased = easeOutCubic(raw)

      setProgress(eased * 100)

      if (raw < 1) {
        rafId.current = requestAnimationFrame(tick)
      } else {
        setFadeOut(true)
        setTimeout(onComplete, 900)
      }
    }

    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [duration, easeOutCubic, onComplete])

  return (
    <div className={`loader-screen${fadeOut ? ' loader-screen--exit' : ''}`}>
      <div className="loader-screen__bg" aria-hidden="true" />
      <div className="loader-screen__overlay" aria-hidden="true" />

      <div className="loader-screen__content">
        <div className="loader-screen__brand">
          <img
            src="/wh_logo.jpeg"
            alt="MAJ Boutique"
            className="loader-screen__logo"
            draggable={false}
          />

          <div className="loader-screen__loading">
            <SparkleBar progress={progress} />
            <div className="loader-screen__meta">
              <span className="loader-screen__label">Loading</span>
              <span className="loader-screen__percent">
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
