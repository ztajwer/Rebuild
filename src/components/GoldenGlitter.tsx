import { useEffect, useRef } from 'react'
import './GoldenGlitter.css'

interface Flake {
  x: number
  y: number
  size: number
  speed: number
  sway: number
  swaySpeed: number
  rotation: number
  spin: number
  opacity: number
  kind: 0 | 1
}

export default function GoldenGlitter() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    const dpr = Math.min(window.devicePixelRatio || 1, 2)
    let flakes: Flake[] = []
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

    const spawn = (): Flake => ({
      x: Math.random() * w,
      y: Math.random() * h - h,
      size: Math.random() * 3.2 + 1.2,
      speed: Math.random() * 1.4 + 0.6,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: Math.random() * 0.018 + 0.008,
      rotation: Math.random() * Math.PI,
      spin: (Math.random() - 0.5) * 0.04,
      opacity: Math.random() * 0.45 + 0.35,
      kind: Math.random() > 0.55 ? 1 : 0,
    })

    const seed = () => {
      const cap = w < 640 ? 48 : 72
      flakes = Array.from({ length: cap }, spawn)
    }

    const drawFlake = (f: Flake, alpha: number) => {
      ctx.save()
      ctx.translate(f.x, f.y)
      ctx.rotate(f.rotation)
      ctx.globalAlpha = alpha

      if (f.kind === 0) {
        const g = ctx.createLinearGradient(-f.size, 0, f.size, 0)
        g.addColorStop(0, 'rgba(196, 168, 130, 0)')
        g.addColorStop(0.35, 'rgba(255, 248, 235, 0.95)')
        g.addColorStop(0.5, 'rgba(255, 255, 255, 1)')
        g.addColorStop(0.65, 'rgba(245, 234, 214, 0.9)')
        g.addColorStop(1, 'rgba(196, 168, 130, 0)')
        ctx.fillStyle = g
        ctx.fillRect(-f.size * 1.8, -f.size * 0.22, f.size * 3.6, f.size * 0.44)
      } else {
        ctx.beginPath()
        ctx.moveTo(0, -f.size)
        ctx.lineTo(f.size * 0.55, 0)
        ctx.lineTo(0, f.size)
        ctx.lineTo(-f.size * 0.55, 0)
        ctx.closePath()
        ctx.fillStyle = 'rgba(255, 252, 245, 0.85)'
        ctx.shadowColor = 'rgba(212, 190, 150, 0.8)'
        ctx.shadowBlur = 6
        ctx.fill()
      }

      ctx.restore()
    }

    const animate = (time: number) => {
      ctx.clearRect(0, 0, w, h)

      for (const f of flakes) {
        f.y += f.speed
        f.sway += f.swaySpeed
        f.x += Math.sin(f.sway) * 0.35
        f.rotation += f.spin

        const twinkle = (Math.sin(time * 0.004 + f.sway * 2) + 1) * 0.5
        const alpha = f.opacity * (0.55 + twinkle * 0.45)

        if (f.y > h + 12) {
          Object.assign(f, spawn())
          f.y = -8
        }

        drawFlake(f, alpha)
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
    <canvas ref={canvasRef} className="golden-glitter" aria-hidden="true" />
  )
}
