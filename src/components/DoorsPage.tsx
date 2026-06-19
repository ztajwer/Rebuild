import './DoorsPage.css'

interface DoorsPageProps {
  active: boolean
  onComplete: () => void
}

export default function DoorsPage({ active, onComplete }: DoorsPageProps) {
  return (
    <div className={`doors-page${active ? ' doors-page--open' : ''}`}>
      <div className="doors-page__frame">
        <div className="doors-page__door doors-page__door--left">
          <div className="doors-page__panel" />
          <div className="doors-page__trim" />
        </div>
        <div className="doors-page__door doors-page__door--right">
          <div className="doors-page__panel" />
          <div className="doors-page__trim" />
        </div>
        <div className="doors-page__center-glow" aria-hidden="true" />
      </div>

      <div className="doors-page__content">
        <img
          src="/wh_logo.jpeg"
          alt=""
          className="doors-page__logo"
          width={120}
          height={120}
          draggable={false}
          aria-hidden="true"
        />
        <p className="doors-page__welcome">Welcome</p>
        <button
          type="button"
          className="doors-page__enter"
          onClick={onComplete}
        >
          Enter Boutique
        </button>
      </div>
    </div>
  )
}
