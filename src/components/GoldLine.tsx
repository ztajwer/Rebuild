import './GoldLine.css'

interface GoldLineProps {
  progress: number
}

export default function GoldLine({ progress }: GoldLineProps) {
  const clamped = Math.max(0, Math.min(progress, 100))
  const scale = clamped / 100

  return (
    <div
      className="gold-line"
      role="progressbar"
      aria-valuenow={Math.round(clamped)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div className="gold-line__track" />
      <div className="gold-line__fill" style={{ transform: `scaleX(${scale})` }}>
        <div className="gold-line__shimmer" />
      </div>
      {clamped > 1 && (
        <span
          className="gold-line__tip-glow"
          style={{ left: `${clamped}%` }}
          aria-hidden="true"
        />
      )}
    </div>
  )
}
