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
  rot: number
  spin: number
  life: number
  maxLife: number
  kind: 0 | 1 | 2
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

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

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
      const fillW = (progressRef.current / 100) * w
      const onEdge = Math.random() > 0.35
      const x = onEdge
        ? fillW + (Math.random() - 0.5) * 20
        : Math.random() * Math.max(fillW, 8)

      sparksRef.current.push({
        x,
        y: h / 2 + (Math.random() - 0.5) * 6,
        vx: (Math.random() - 0.3) * 1.6,
        vy: Math.random() * 1.8 + 0.4,
        size: Math.random() * 2.8 + 0.7,
        rot: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 0.08,
        life: 0,
        maxLife: Math.random() * 45 + 25,
        kind: (Math.floor(Math.random() * 3) as 0 | 1 | 2),
      })
    }

    const drawStar = (s: Spark, alpha: number) => {
      ctx.save()
      ctx.translate(s.x, s.y)
      ctx.rotate(s.rot)
      ctx.globalAlpha = alpha

      if (s.kind === 0) {
        const g = ctx.createLinearGradient(-s.size * 2.5, 0, s.size * 2.5, 0)
        g.addColorStop(0, 'rgba(212, 190, 150, 0)')
        g.addColorStop(0.35, 'rgba(255, 252, 240, 0.95)')
        g.addColorStop(0.5, 'rgba(255, 255, 255, 1)')
        g.addColorStop(0.65, 'rgba(245, 234, 214, 0.9)')
        g.addColorStop(1, 'rgba(212, 190, 150, 0)')
        ctx.fillStyle = g
        ctx.shadowColor = 'rgba(255, 248, 230, 0.95)'
        ctx.shadowBlur = 10
        ctx.fillRect(-s.size * 2.2, -s.size * 0.28, s.size * 4.4, s.size * 0.56)
      } else if (s.kind === 1) {
        ctx.beginPath()
        ctx.moveTo(0, -s.size)
        ctx.lineTo(s.size * 0.55, 0)
        ctx.lineTo(0, s.size)
        ctx.lineTo(-s.size * 0.55, 0)
        ctx.closePath()
        ctx.fillStyle = 'rgba(255, 252, 245, 0.95)'
        ctx.shadowColor = 'rgba(255, 248, 230, 0.9)'
        ctx.shadowBlur = 12
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.arc(0, 0, s.size * 0.5, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(255, 252, 240, 0.9)'
        ctx.shadowColor = 'rgba(255, 255, 255, 0.85)'
        ctx.shadowBlur = 8
        ctx.fill()
      }

      ctx.restore()
    }

    let frame = 0
    const animate = () => {
      const { width, height } = container.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)

      if (progressRef.current > 0) {
        const burst = progressRef.current > 80 ? 4 : 3
        for (let i = 0; i < burst; i++) spawn(width, height)
      }

      sparksRef.current = sparksRef.current.filter((s) => {
        s.life++
        s.x += s.vx + Math.sin(s.life * 0.06) * 0.12
        s.y += s.vy
        s.vy += 0.015
        s.rot += s.spin

        const t = s.life / s.maxLife
        const fade = t < 0.12 ? t / 0.12 : t > 0.65 ? (1 - t) / 0.35 : 1
        const twinkle = 0.6 + Math.sin(s.life * 0.15) * 0.4
        const alpha = fade * twinkle

        if (alpha > 0.04) drawStar(s, alpha * 0.9)

        return s.life < s.maxLife && s.y < height + 20
      })

      if (sparksRef.current.length > 120) {
        sparksRef.current = sparksRef.current.slice(-80)
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
        <div className="gold-line__facets" aria-hidden="true" />
        <div className="gold-line__shimmer gold-line__shimmer--a" />
        <div className="gold-line__shimmer gold-line__shimmer--b" />
        <div className="gold-line__shimmer gold-line__shimmer--c" />
        <div className="gold-line__glitter-dots" aria-hidden="true">
          <span /><span /><span /><span /><span />
        </div>
      </div>
      {clamped > 0.5 && (
        <>
          <span
            className="gold-line__tip"
            style={{ left: `${clamped}%` }}
            aria-hidden="true"
          />
          <span
            className="gold-line__tip-ring"
            style={{ left: `${clamped}%` }}
            aria-hidden="true"
          />
        </>
      )}
      <canvas ref={canvasRef} className="gold-line__sparkles" aria-hidden="true" />
    </div>
  )
}
