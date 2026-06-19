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
      const spread = 18

      particlesRef.current.push({
        x: edge + (Math.random() - 0.5) * spread,
        y: barHeight / 2 + (Math.random() - 0.5) * barHeight * 1.6,
        vx: (Math.random() - 0.3) * 1.8,
        vy: (Math.random() - 0.5) * 1.4,
        size: Math.random() * 2.2 + 0.6,
        life: 0,
        maxLife: Math.random() * 40 + 25,
        hue: Math.random() > 0.5 ? 42 : 48,
        alpha: Math.random() * 0.6 + 0.4,
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
      ctx.rotate(Math.PI / 4)
      ctx.fillStyle = `hsla(${hue}, 85%, 78%, ${alpha})`
      ctx.shadowColor = `hsla(${hue}, 90%, 70%, ${alpha * 0.8})`
      ctx.shadowBlur = 6
      ctx.fillRect(-r * 0.35, -r, r * 0.7, r * 2)
      ctx.fillRect(-r, -r * 0.35, r * 2, r * 0.7)
      ctx.restore()
    }

    let frame = 0
    const animate = () => {
      const { width, height } = container.getBoundingClientRect()
      ctx.clearRect(0, 0, width, height)

      if (frame % 2 === 0 && progressRef.current > 2) {
        const count = progressRef.current > 90 ? 1 : 2
        for (let i = 0; i < count; i++) spawnParticle(width, height)
      }

      particlesRef.current = particlesRef.current.filter((p) => {
        p.life++
        p.x += p.vx
        p.y += p.vy
        p.vy -= 0.015

        const t = p.life / p.maxLife
        const fade = t < 0.2 ? t / 0.2 : t > 0.7 ? (1 - t) / 0.3 : 1
        const alpha = p.alpha * fade

        if (alpha > 0.05) {
          drawStar(p.x, p.y, p.size, alpha, p.hue)
        }

        return p.life < p.maxLife
      })

      if (particlesRef.current.length > 120) {
        particlesRef.current = particlesRef.current.slice(-80)
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
      <div className="sparkle-bar__track">
        <div
          className="sparkle-bar__fill"
          style={{ width: `${progress}%` }}
        >
          <div className="sparkle-bar__shimmer" />
          <div className="sparkle-bar__glow" />
          <div className="sparkle-bar__edge" />
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
