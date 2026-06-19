import { useCallback, useEffect, useRef, useState } from 'react'
import './DoorsPage.css'

const SCROLL_SENSITIVITY = 0.0014
const LERP = 0.12

export default function DoorsPage() {
  const [displayProgress, setDisplayProgress] = useState(0)
  const targetRef = useRef(0)
  const currentRef = useRef(0)
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

      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [])

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
      aria-label="Enter"
    >
      <div className="doors-page__blank" aria-hidden="true" />

      <div className="doors-page__frame">
        <div className="doors-page__header" aria-hidden="true" />

        <div className="doors-page__door doors-page__door--left">
          <div className="doors-page__door-surface">
            <div className="doors-page__door-panel doors-page__door-panel--top" />
            <div className="doors-page__door-panel doors-page__door-panel--main" />
            <div className="doors-page__door-panel doors-page__door-panel--bottom" />
            <div className="doors-page__door-handle" />
          </div>
        </div>

        <div className="doors-page__door doors-page__door--right">
          <div className="doors-page__door-surface">
            <div className="doors-page__door-panel doors-page__door-panel--top" />
            <div className="doors-page__door-panel doors-page__door-panel--main" />
            <div className="doors-page__door-panel doors-page__door-panel--bottom" />
            <div className="doors-page__door-handle" />
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
