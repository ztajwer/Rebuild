import { useEffect, useRef } from 'react'
import './LuxeGlitter.css'

interface Particle {
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
  alpha: number
}

export default function LuxeGlitter() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let particles: Particle[] = []
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

    const spawn = (): Particle => ({
      x: Math.random() * w,
      y: -Math.random() * h * 0.3,
      vx: (Math.random() - 0.5) * 0.5,
      vy: Math.random() * 1.4 + 0.6,
      size: Math.random() * 3.2 + 0.9,
      rot: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.05,
      life: 0,
      maxLife: Math.random() * 180 + 120,
      kind: (Math.floor(Math.random() * 3) as 0 | 1 | 2),
      alpha: Math.random() * 0.5 + 0.35,
    })

    const seed = () => {
      const cap = w < 640 ? 85 : 130
      particles = Array.from({ length: cap }, spawn)
    }

    const drawSpark = (p: Particle, a: number) => {
      ctx.save()
      ctx.translate(p.x, p.y)
      ctx.rotate(p.rot)
      ctx.globalAlpha = a

      if (p.kind === 0) {
        const g = ctx.createLinearGradient(-p.size * 2, 0, p.size * 2, 0)
        g.addColorStop(0, 'rgba(212, 190, 150, 0)')
        g.addColorStop(0.4, 'rgba(255, 252, 240, 0.95)')
        g.addColorStop(0.5, 'rgba(255, 255, 255, 1)')
        g.addColorStop(0.6, 'rgba(245, 234, 214, 0.9)')
        g.addColorStop(1, 'rgba(212, 190, 150, 0)')
        ctx.fillStyle = g
        ctx.fillRect(-p.size * 2.2, -p.size * 0.25, p.size * 4.4, p.size * 0.5)
      } else if (p.kind === 1) {
        ctx.beginPath()
        ctx.moveTo(0, -p.size)
        ctx.lineTo(p.size * 0.5, 0)
        ctx.lineTo(0, p.size)
        ctx.lineTo(-p.size * 0.5, 0)
        ctx.closePath()
        ctx.fillStyle = 'rgba(255, 252, 245, 0.9)'
        ctx.shadowColor = 'rgba(255, 248, 230, 0.9)'
        ctx.shadowBlur = 8
        ctx.fill()
      } else {
        ctx.beginPath()
        ctx.arc(0, 0, p.size * 0.45, 0, Math.PI * 2)
        ctx.fillStyle = 'rgba(245, 234, 214, 0.85)'
        ctx.shadowColor = 'rgba(255, 255, 255, 0.8)'
        ctx.shadowBlur = 6
        ctx.fill()
      }

      ctx.restore()
    }

    const animate = () => {
      ctx.clearRect(0, 0, w, h)

      for (const p of particles) {
        p.life++
        p.x += p.vx + Math.sin(p.life * 0.02) * 0.15
        p.y += p.vy
        p.rot += p.spin

        const t = p.life / p.maxLife
        const fade = t < 0.1 ? t / 0.1 : t > 0.75 ? (1 - t) / 0.25 : 1
        const twinkle = 0.65 + Math.sin(p.life * 0.08) * 0.35
        const alpha = p.alpha * fade * twinkle

        if (alpha > 0.04) drawSpark(p, alpha)

        if (p.y > h + 10 || p.life > p.maxLife) {
          Object.assign(p, spawn())
          p.y = -6
        }
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

  return <canvas ref={canvasRef} className="luxe-glitter" aria-hidden="true" />
}
