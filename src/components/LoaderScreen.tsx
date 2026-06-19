import { useEffect, useRef, useState, useCallback } from 'react'
import AmbientSparkles from './AmbientSparkles'
import SparkleBar from './SparkleBar'
import './LoaderScreen.css'

interface LoaderScreenProps {
  onComplete: () => void
  duration?: number
}

const LOADING_CHARS = 'Loading'.split('')

export default function LoaderScreen({
  onComplete,
  duration = 4800,
}: LoaderScreenProps) {
  const [progress, setProgress] = useState(0)
  const [fadeOut, setFadeOut] = useState(false)
  const startTime = useRef<number | null>(null)
  const rafId = useRef<number>(0)

  const easeOutQuart = useCallback((t: number) => 1 - Math.pow(1 - t, 4), [])

  useEffect(() => {
    const tick = (now: number) => {
      if (startTime.current === null) startTime.current = now
      const elapsed = now - startTime.current
      const raw = Math.min(elapsed / duration, 1)
      const eased = easeOutQuart(raw)

      setProgress(eased * 100)

      if (raw < 1) {
        rafId.current = requestAnimationFrame(tick)
      } else {
        setFadeOut(true)
        setTimeout(onComplete, 1100)
      }
    }

    rafId.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafId.current)
  }, [duration, easeOutQuart, onComplete])

  return (
    <div className={`loader-screen${fadeOut ? ' loader-screen--exit' : ''}`}>
      <div className="loader-screen__bg" aria-hidden="true" />
      <div className="loader-screen__overlay" aria-hidden="true" />
      <div className="loader-screen__light-sweep" aria-hidden="true" />
      <AmbientSparkles />

      <div className="loader-screen__content">
        <div className="loader-screen__brand">
          <div className="loader-screen__logo-medallion">
            <div className="loader-screen__orbit loader-screen__orbit--outer" />
            <div className="loader-screen__orbit loader-screen__orbit--inner" />
            <div className="loader-screen__ring-glow" />
            <div className="loader-screen__logo-circle">
              <img
                src="/wh_logo.jpeg"
                alt="MAJ Boutique"
                className="loader-screen__logo"
                draggable={false}
              />
              <div className="loader-screen__logo-shine" />
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
            <SparkleBar progress={progress} />
            <div className="loader-screen__meta">
              <span className="loader-screen__label" aria-label="Loading">
                {LOADING_CHARS.map((char, i) => (
                  <span
                    key={i}
                    className="loader-screen__label-char"
                    style={{ animationDelay: `${i * 0.12}s` }}
                  >
                    {char}
                  </span>
                ))}
                <span className="loader-screen__label-dots">
                  <span />
                  <span />
                  <span />
                </span>
              </span>
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
