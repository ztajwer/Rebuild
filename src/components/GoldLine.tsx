import { useEffect, useRef } from 'react'
import './GoldLine.css'

interface GoldLineProps {
  progress: number
}

interface Spark {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
}

export default function GoldLine({ progress }: GoldLineProps) {
  const clamped = Math.max(0, Math.min(progress, 100))
  const scale = clamped / 100
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const progressRef = useRef(progress)
  const sparksRef = useRef<Spark[]>([])
  const rafRef = useRef(0)

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)

    const resize = () => {
      const { width, height } = container.getBoundingClientRect()
      canvas.width = width * dpr
      canvas.height = height * dpr
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    resize()
    const ro = new ResizeObserver(resize)
    ro.observe(container)

    const spawn = (w: number, h: number) => {
      const edge = (progressRef.current / 100) * w
      sparksRef.current.push({
        x: edge + (Math.random() - 0.5) * 16,
        y: h / 2 + (Math.random() - 0.5) * h * 4,
        vx: Math.random() * 1.2 + 0.2,
        vy: (Math.random() - 0.5) * 1.4,
        size: Math.random() * 2 + 0.6,
        life: 0,
        maxLife: Math.random() * 30 + 18,
      })
    }

    let frame = 0
    const animate = () => {
      const { width, height } = container.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)

      if (progressRef.current > 0 && frame % 2 === 0) {
        for (let i = 0; i < 2; i++) spawn(width, height)
      }

      sparksRef.current = sparksRef.current.filter((s) => {
        s.life++
        s.x += s.vx
        s.y += s.vy
        s.vy -= 0.02

        const t = s.life / s.maxLife
        const alpha = t < 0.2 ? t / 0.2 : t > 0.6 ? (1 - t) / 0.4 : 1

        if (alpha > 0.05) {
          ctx.save()
          ctx.translate(s.x, s.y)
          ctx.rotate(Math.PI / 4)
          ctx.globalAlpha = alpha * 0.85
          ctx.fillStyle = '#fffef8'
          ctx.shadowColor = 'rgba(255, 248, 230, 0.95)'
          ctx.shadowBlur = 8
          ctx.fillRect(-s.size * 0.3, -s.size, s.size * 0.6, s.size * 2)
          ctx.restore()
        }

        return s.life < s.maxLife
      })

      if (sparksRef.current.length > 80) {
        sparksRef.current = sparksRef.current.slice(-50)
      }

      frame++
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(rafRef.current)
      sparksRef.current = []
    }
  }, [])

  return (
    <div
      className="gold-line"
      ref={containerRef}
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="gold-line__aura" aria-hidden="true" />
      <div className="gold-line__track">
        <div className="gold-line__track-shine" />
      </div>
      <div className="gold-line__fill" style={{ transform: `scaleX(${scale})` }}>
        <div className="gold-line__shimmer gold-line__shimmer--a" />
        <div className="gold-line__shimmer gold-line__shimmer--b" />
      </div>
      {clamped > 0.5 && (
        <span
          className="gold-line__tip"
          style={{ left: `${clamped}%` }}
          aria-hidden="true"
        />
      )}
      <canvas ref={canvasRef} className="gold-line__sparkles" aria-hidden="true" />
    </div>
  )
}
