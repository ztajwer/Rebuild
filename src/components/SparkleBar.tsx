import { useEffect, useRef } from 'react'
import './SparkleBar.css'

interface SparkleBarProps {
  progress: number
}

interface Particle {
  x: number
  y: number
  vx: number
  vy: number
  size: number
  life: number
  maxLife: number
  hue: number
  alpha: number
  type: 'star' | 'diamond'
}

export default function SparkleBar({ progress }: SparkleBarProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const particlesRef = useRef<Particle[]>([])
  const progressRef = useRef(progress)
  const rafRef = useRef<number>(0)

  useEffect(() => {
    progressRef.current = progress
  }, [progress])

  useEffect(() => {
    const canvas = canvasRef.current
    const container = containerRef.current
    if (!canvas || !container) return

    const ctx = canvas.getContext('2d')
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

    const spawnParticle = (barWidth: number, barHeight: number) => {
      const edge = (progressRef.current / 100) * barWidth
      const trail = Math.random() * edge * 0.85
      const spread = 28

      particlesRef.current.push({
        x: trail + (Math.random() - 0.5) * spread,
        y: barHeight / 2 + (Math.random() - 0.5) * barHeight * 3,
        vx: (Math.random() - 0.2) * 2.4,
        vy: (Math.random() - 0.5) * 2,
        size: Math.random() * 3 + 0.8,
        life: 0,
        maxLife: Math.random() * 50 + 30,
        hue: Math.random() > 0.3 ? 42 + Math.random() * 8 : 0,
        alpha: Math.random() * 0.7 + 0.3,
        type: Math.random() > 0.45 ? 'diamond' : 'star',
      })
    }

    const drawStar = (
      cx: number,
      cy: number,
      r: number,
      alpha: number,
      hue: number,
    ) => {
      ctx.save()
      ctx.translate(cx, cy)
      ctx.rotate(Math.PI / 4 + performance.now() * 0.002)
      const color =
        hue === 0
          ? `rgba(255, 255, 255, ${alpha})`
          : `hsla(${hue}, 90%, 80%, ${alpha})`
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = 10
      ctx.fillRect(-r * 0.3, -r, r * 0.6, r * 2)
      ctx.fillRect(-r, -r * 0.3, r * 2, r * 0.6)
      ctx.restore()
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
      ctx.rotate(performance.now() * 0.001)
      ctx.beginPath()
      ctx.moveTo(0, -r)
      ctx.lineTo(r * 0.6, 0)
      ctx.lineTo(0, r)
      ctx.lineTo(-r * 0.6, 0)
      ctx.closePath()
      const color =
        hue === 0
          ? `rgba(255, 252, 248, ${alpha})`
          : `hsla(${hue}, 85%, 78%, ${alpha})`
      ctx.fillStyle = color
      ctx.shadowColor = color
      ctx.shadowBlur = 12
      ctx.fill()
      ctx.restore()
    }

    let frame = 0
    const animate = () => {
      const { width, height } = container.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)

      if (progressRef.current > 1) {
        const burst = progressRef.current > 85 ? 4 : 3
        for (let i = 0; i < burst; i++) spawnParticle(width, height)
      }

      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.02
        p.vx *= 0.995

        const t = p.life / p.maxLife
        const fade = t < 0.15 ? t / 0.15 : t > 0.65 ? (1 - t) / 0.35 : 1
        const alpha = p.alpha * fade

        if (alpha > 0.04) {
          if (p.type === 'diamond') {
            drawDiamond(p.x, p.y, p.size, alpha, p.hue)
          } else {
            drawStar(p.x, p.y, p.size, alpha, p.hue)
          }
        }

        return p.life < p.maxLife
      })

      if (particlesRef.current.length > 160) {
        particlesRef.current = particlesRef.current.slice(-100)
      }

      frame++
      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)

    return () => {
      ro.disconnect()
      cancelAnimationFrame(rafRef.current)
      particlesRef.current = []
    }
  }, [])

  return (
    <div className="sparkle-bar" ref={containerRef}>
      <div className="sparkle-bar__aura" aria-hidden="true" />

      <div className="sparkle-bar__track">
        <div className="sparkle-bar__track-shine" />
        <div
          className="sparkle-bar__fill"
          style={{ width: `${progress}%` }}
        >
          <div className="sparkle-bar__facets" />
          <div className="sparkle-bar__shimmer sparkle-bar__shimmer--a" />
          <div className="sparkle-bar__shimmer sparkle-bar__shimmer--b" />
          <div className="sparkle-bar__glow" />
          <div className="sparkle-bar__trail" />
          <div className="sparkle-bar__edge">
            <div className="sparkle-bar__edge-core" />
            <div className="sparkle-bar__edge-ring" />
          </div>
        </div>
      </div>

      <canvas
        ref={canvasRef}
        className="sparkle-bar__canvas"
        aria-hidden="true"
      />
    </div>
  )
}
