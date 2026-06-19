import { useEffect, useRef } from 'react'
import './AmbientSparkles.css'

interface Dust {
  x: number
  y: number
  size: number
  speed: number
  drift: number
  phase: number
  opacity: number
  twinkleSpeed: number
}

export default function AmbientSparkles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let dust: Dust[] = []
    let raf = 0
    let w = 0
    let h = 0

    const createDust = (): Dust[] =>
      Array.from({ length: 55 }, () => ({
        x: Math.random(),
        y: Math.random(),
        size: Math.random() * 2.4 + 0.4,
        speed: Math.random() * 0.00015 + 0.00004,
        drift: Math.random() * 0.0003 - 0.00015,
        phase: Math.random() * Math.PI * 2,
        opacity: Math.random() * 0.55 + 0.15,
        twinkleSpeed: Math.random() * 0.02 + 0.008,
      }))

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
      if (dust.length === 0) dust = createDust()
    }

    resize()
    window.addEventListener('resize', resize)

    let frame = 0
    const draw = () => {
      ctx.clearRect(0, 0, w, h)

      for (const p of dust) {
        p.y -= p.speed
        p.x += p.drift
        if (p.y < -0.02) {
          p.y = 1.02
          p.x = Math.random()
        }

        const twinkle =
          0.45 +
          0.55 *
            Math.sin(frame * p.twinkleSpeed + p.phase)

        const px = p.x * w
        const py = p.y * h
        const alpha = p.opacity * twinkle

        ctx.save()
        ctx.translate(px, py)
        ctx.rotate(Math.PI / 4)
        ctx.fillStyle = `rgba(255, 248, 225, ${alpha})`
        ctx.shadowColor = `rgba(212, 190, 150, ${alpha * 0.9})`
        ctx.shadowBlur = 8
        const s = p.size
        ctx.fillRect(-s * 0.3, -s, s * 0.6, s * 2)
        ctx.fillRect(-s, -s * 0.3, s * 2, s * 0.6)
        ctx.restore()
      }

      frame++
      raf = requestAnimationFrame(draw)
    }

    raf = requestAnimationFrame(draw)

    return () => {
      window.removeEventListener('resize', resize)
      cancelAnimationFrame(raf)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="ambient-sparkles"
      aria-hidden="true"
    />
  )
}
