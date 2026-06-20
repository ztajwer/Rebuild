import { useCallback, useEffect, useRef, useState } from 'react'
import './DoorsPage.css'

const AUTO_OPEN_MS = 2600
const CHIME_SRC = '/Sparkling Chime Sound - Meinl Sonic Energy.mp3'
const TRIGGER_DELTA = 0.008

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3)
}

function DoorLeaf({ side }: { side: 'left' | 'right' }) {
  return (
    <div className={`doors-page__door doors-page__door--${side}`}>
      <div className="doors-page__door-inner">
        <div className="doors-page__door-face">
          <div className="doors-page__door-grid">
            {Array.from({ length: 12 }).map((_, i) => (
              <span key={i} className="doors-page__door-cell" />
            ))}
          </div>
          <div className="doors-page__door-handle">
            <span className="doors-page__door-handle-bar" />
          </div>
        </div>
      </div>
    </div>
  )
}

export default function DoorsPage() {
  const [displayProgress, setDisplayProgress] = useState(0)
  const autoStartRef = useRef<number | null>(null)
  const autoTriggeredRef = useRef(false)
  const rafRef = useRef(0)
  const touchStartY = useRef(0)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const fadeRafRef = useRef(0)

  const fadeOutChime = useCallback(() => {
    const audio = audioRef.current
    if (!audio) return

    cancelAnimationFrame(fadeRafRef.current)
    const startVol = audio.volume
    const start = performance.now()

    const fade = (now: number) => {
      const t = Math.min((now - start) / 800, 1)
      audio.volume = Math.max(0, startVol * (1 - t))
      if (t < 1) {
        fadeRafRef.current = requestAnimationFrame(fade)
      } else {
        audio.pause()
        audio.currentTime = 0
        audioRef.current = null
      }
    }

    fadeRafRef.current = requestAnimationFrame(fade)
  }, [])

  const startChime = useCallback(() => {
    if (audioRef.current) return
    const audio = new Audio(CHIME_SRC)
    audio.volume = 0.36
    audio.loop = true
    audioRef.current = audio
    audio.play().catch(() => {
      audioRef.current = null
    })
  }, [])

  const triggerAutoOpen = useCallback(() => {
    if (autoTriggeredRef.current) return
    autoTriggeredRef.current = true
    autoStartRef.current = performance.now()
    startChime()
  }, [startChime])

  const bumpScroll = useCallback(
    (delta: number) => {
      if (delta > TRIGGER_DELTA) triggerAutoOpen()
    },
    [triggerAutoOpen],
  )

  useEffect(() => {
    const tick = (now: number) => {
      if (autoStartRef.current !== null) {
        const elapsed = now - autoStartRef.current
        const raw = Math.min(elapsed / AUTO_OPEN_MS, 1)
        setDisplayProgress(easeOutCubic(raw))

        if (raw >= 1) {
          autoStartRef.current = null
          fadeOutChime()
        }
      }
      rafRef.current = requestAnimationFrame(tick)
    }

    rafRef.current = requestAnimationFrame(tick)
    return () => {
      cancelAnimationFrame(rafRef.current)
      cancelAnimationFrame(fadeRafRef.current)
      audioRef.current?.pause()
      audioRef.current = null
    }
  }, [fadeOutChime])

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      event.preventDefault()
      if (event.deltaY > 0) bumpScroll(event.deltaY * 0.001)
    }

    const onTouchStart = (event: TouchEvent) => {
      touchStartY.current = event.touches[0]?.clientY ?? 0
    }

    const onTouchMove = (event: TouchEvent) => {
      const y = event.touches[0]?.clientY ?? touchStartY.current
      const delta = touchStartY.current - y
      if (delta > 2) {
        event.preventDefault()
        bumpScroll(delta * 0.002)
        touchStartY.current = y
      }
    }

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'ArrowDown' || event.key === 'PageDown' || event.key === ' ') {
        event.preventDefault()
        triggerAutoOpen()
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
  }, [bumpScroll, triggerAutoOpen])

  const open = displayProgress
  const hintOpacity = Math.max(0, 1 - open * 3.5)

  return (
    <div
      className="doors-page"
      style={{ '--door-open': open } as React.CSSProperties}
      aria-label="Open doors"
    >
      <div className="doors-page__bg" aria-hidden="true" />

      <div className="doors-page__portal">
        <DoorLeaf side="left" />
        <DoorLeaf side="right" />
      </div>

      <div
        className="doors-page__hint"
        style={{ opacity: hintOpacity }}
        aria-hidden={open > 0.12}
      >
        <span className="doors-page__hint-text">Scroll to open</span>
        <span className="doors-page__hint-chevron" />
      </div>
    </div>
  )
}
