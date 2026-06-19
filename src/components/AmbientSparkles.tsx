import { useEffect, useRef } from 'react'
import './AmbientSparkles.css'

interface Dust {
  x: number
  y: number
  size: number
  phase: number
  speed: number
  drift: number
}

export default function AmbientSparkles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let dust: Dust[] = []
    let raf = 0
    let w = 0
    let h = 0

    const resize = () => {
      w = window.innerWidth
      h = window.innerHeight
      canvas.width = w * dpr
      canvas.height = h * dpr
      canvas.style.width = `${w}px`
      canvas.style.height = `${h}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    const seed = () => {
      const density = w < 640 ? 22000 : 14000
      const count = Math.min(Math.floor((w * h) / density), w < 640 ? 28 : 42)
      dust = Array.from({ length: count }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 1.2 + 0.3,
        phase: Math.random() * Math.PI * 2,
        speed: Math.random() * 0.004 + 0.001,
        drift: Math.random() * 0.08 + 0.02,
      }))
    }

    const animate = (time: number) => {
      ctx.clearRect(0, 0, w, h)

      for (const d of dust) {
        const twinkle = (Math.sin(time * d.speed * 1000 + d.phase) + 1) * 0.5
        const alpha = 0.04 + twinkle * 0.22

        d.y -= d.drift
        if (d.y < -4) {
          d.y = h + 4
          d.x = Math.random() * w
        }

        ctx.beginPath()
        ctx.arc(d.x, d.y, d.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(212, 190, 150, ${alpha})`
        ctx.fill()
      }

      raf = requestAnimationFrame(animate)
    }

    resize()
    seed()
    raf = requestAnimationFrame(animate)

    const onResize = () => {
      resize()
      seed()
    }
    window.addEventListener('resize', onResize)

    return () => {
      window.removeEventListener('resize', onResize)
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
