import { useEffect, useState } from 'react'
import LoaderScreen from './components/LoaderScreen'
import DoorsPage from './components/DoorsPage'
import './App.css'

type AppPhase = 'loader' | 'doors' | 'home'

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('loader')
  const [doorsMounted, setDoorsMounted] = useState(false)
  const [doorsActive, setDoorsActive] = useState(false)

  useEffect(() => {
    if (phase !== 'doors') return
    const timer = window.requestAnimationFrame(() => setDoorsActive(true))
    return () => window.cancelAnimationFrame(timer)
  }, [phase])

  return (
    <>
      {doorsMounted && phase !== 'loader' && (
        <DoorsPage
          active={doorsActive}
          onComplete={() => setPhase('home')}
        />
      )}

      {phase === 'loader' && (
        <LoaderScreen
          onReveal={() => setDoorsMounted(true)}
          onComplete={() => setPhase('doors')}
        />
      )}

      {phase === 'home' && (
        <main className="main-placeholder">
          <p>Welcome to MAJ Boutique</p>
        </main>
      )}
    </>
  )
}
