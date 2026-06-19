import { useState } from 'react'
import LoaderScreen from './components/LoaderScreen'
import DoorsPage from './components/DoorsPage'
import './App.css'

type AppPhase = 'loader' | 'doors'

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('loader')
  const [showDoors, setShowDoors] = useState(false)

  return (
    <>
      {showDoors && <DoorsPage />}

      {phase === 'loader' && (
        <LoaderScreen
          onExitStart={() => setShowDoors(true)}
          onComplete={() => setPhase('doors')}
        />
      )}
    </>
  )
}
