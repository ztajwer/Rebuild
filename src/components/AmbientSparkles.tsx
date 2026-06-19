import { useEffect, useRef } from 'react'
import './AmbientSparkles.css'

interface Spark {
  x: number
  y: number
  size: number
  speed: number
  phase: number
  hue: number
  drift: number
}

export default function AmbientSparkles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let sparks: Spark[] = []
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
      const count = Math.floor((w * h) / 18000)
      sparks = Array.from({ length: Math.min(count, 55) }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        size: Math.random() * 2.4 + 0.4,
        speed: Math.random() * 0.006 + 0.002,
        phase: Math.random() * Math.PI * 2,
        hue: Math.random() > 0.35 ? 42 : 0,
        drift: (Math.random() - 0.5) * 0.3,
      }))
    }

    const drawDiamond = (
      cx: number,
      cy: number,
      r: number,
      alpha: number,
      hue: number,
    ) => {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.beginPath()
      ctx.moveTo(0, -r)
      ctx.lineTo(r * 0.55, 0)
      ctx.lineTo(0, r)
      ctx.lineTo(-r * 0.55, 0)
      ctx.closePath()
      ctx.fillStyle =
        hue === 0
          ? `rgba(255, 255, 255, ${alpha})`
          : `hsla(${hue}, 70%, 82%, ${alpha})`
      ctx.shadowColor = `hsla(${hue || 45}, 80%, 75%, ${alpha})`
      ctx.shadowBlur = 8
      ctx.fill()
      ctx.restore()
    }

    const animate = (time: number) => {
      ctx.clearRect(0, 0, w, h)

      for (const s of sparks) {
        const twinkle =
          (Math.sin(time * s.speed * 1000 + s.phase) + 1) / 2
        const alpha = 0.08 + twinkle * 0.55
        s.y -= s.drift * 0.15
        s.x += Math.sin(time * 0.0004 + s.phase) * 0.12

        if (s.y < -10) s.y = h + 10
        if (s.x < -10) s.x = w + 10
        if (s.x > w + 10) s.x = -10

        drawDiamond(s.x, s.y, s.size * (0.6 + twinkle * 0.5), alpha, s.hue)
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
