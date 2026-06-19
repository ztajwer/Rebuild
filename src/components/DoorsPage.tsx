import { useCallback, useEffect, useRef, useState } from 'react'
import './DoorsPage.css'

interface DoorsPageProps {
  onComplete: () => void
}

const SCROLL_SENSITIVITY = 0.0014
const LERP = 0.12
const COMPLETE_THRESHOLD = 0.985

export default function DoorsPage({ onComplete }: DoorsPageProps) {
  const [displayProgress, setDisplayProgress] = useState(0)
  const targetRef = useRef(0)
  const currentRef = useRef(0)
  const completedRef = useRef(false)
  const rafRef = useRef(0)
  const touchStartY = useRef(0)

  const bumpProgress = useCallback((delta: number) => {
    targetRef.current = Math.min(1, Math.max(0, targetRef.current + delta))
  }, [])

  useEffect(() => {
    const tick = () => {
      const diff = targetRef.current - currentRef.current
      if (Math.abs(diff) > 0.0004) {
        currentRef.current += diff * LERP
        setDisplayProgress(currentRef.current)
      } else if (currentRef.current !== targetRef.current) {
        currentRef.current = targetRef.current
        setDisplayProgress(currentRef.current)
      }

      if (
        !completedRef.current &&
        currentRef.current >= COMPLETE_THRESHOLD
      ) {
        completedRef.current = true
        currentRef.current = 1
        targetRef.current = 1
        setDisplayProgress(1)
        window.setTimeout(onComplete, 700)
      }

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [onComplete])

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      bumpProgress(event.deltaY * SCROLL_SENSITIVITY)
    }

    const onTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0]?.clientY ?? 0
    }

    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? touchStartY.current
      const delta = touchStartY.current - y
      if (Math.abs(delta) > 0.5) {
        event.preventDefault()
        bumpProgress(delta * 0.004)
        touchStartY.current = y
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault()
        bumpProgress(0.06)
      }
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchmove', onTouchMove, { passive: false })
    window.addEventListener('keydown', onKeyDown)

    return () => {
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchmove', onTouchMove)
      window.removeEventListener('keydown', onKeyDown)
    }
  }, [bumpProgress])

  const open = displayProgress
  const hintOpacity = Math.max(0, 1 - open * 4)

  return (
    <div
      className="doors-page"
      style={{ '--door-open': open } as React.CSSProperties}
      aria-label="Enter MAJ Boutique"
    >
      <div className="doors-page__interior" aria-hidden="true">
        <div className="doors-page__interior-glow" />
        <div className="doors-page__interior-vignette" />
      </div>

      <div className="doors-page__content">
        <img
          src="/wh_logo.png"
          alt=""
          className="doors-page__logo"
          width={120}
          height={120}
          draggable={false}
          aria-hidden="true"
        />
        <p className="doors-page__welcome">Welcome</p>
        <p className="doors-page__tagline">MAJ Boutique</p>
      </div>

      <div className="doors-page__frame">
        <div className="doors-page__arch" aria-hidden="true" />

        <div className="doors-page__door doors-page__door--left">
          <div className="doors-page__door-body">
            <div className="doors-page__door-frame" />
            <div className="doors-page__door-face">
              <div className="doors-page__door-inset doors-page__door-inset--top" />
              <div className="doors-page__door-inset doors-page__door-inset--mid" />
              <div className="doors-page__door-inset doors-page__door-inset--bottom" />
              <div className="doors-page__door-shimmer" />
            </div>
            <div className="doors-page__door-beading" />
            <div className="doors-page__hinge doors-page__hinge--1" />
            <div className="doors-page__hinge doors-page__hinge--2" />
            <div className="doors-page__hinge doors-page__hinge--3" />
            <div className="doors-page__handle doors-page__handle--left">
              <span className="doors-page__handle-plate" />
              <span className="doors-page__handle-knob" />
            </div>
          </div>
        </div>

        <div className="doors-page__door doors-page__door--right">
          <div className="doors-page__door-body">
            <div className="doors-page__door-frame" />
            <div className="doors-page__door-face">
              <div className="doors-page__door-inset doors-page__door-inset--top" />
              <div className="doors-page__door-inset doors-page__door-inset--mid" />
              <div className="doors-page__door-inset doors-page__door-inset--bottom" />
              <div className="doors-page__door-shimmer" />
            </div>
            <div className="doors-page__door-beading" />
            <div className="doors-page__hinge doors-page__hinge--1" />
            <div className="doors-page__hinge doors-page__hinge--2" />
            <div className="doors-page__hinge doors-page__hinge--3" />
            <div className="doors-page__handle doors-page__handle--right">
              <span className="doors-page__handle-plate" />
              <span className="doors-page__handle-knob" />
            </div>
          </div>
        </div>

        <div className="doors-page__seam" aria-hidden="true" />
        <div className="doors-page__threshold" aria-hidden="true" />
      </div>

      <div
        className="doors-page__hint"
        style={{ opacity: hintOpacity }}
        aria-hidden={open > 0.15}
      >
        <span className="doors-page__hint-text">Scroll to enter</span>
        <span className="doors-page__hint-chevron" />
      </div>
    </div>
  )
}
