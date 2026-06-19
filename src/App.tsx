import { useState } from 'react'
import LoaderScreen from './components/LoaderScreen'
import DoorsPage from './components/DoorsPage'
import './App.css'

type AppPhase = 'loader' | 'doors'

export default function App() {
  const [phase, setPhase] = useState<AppPhase>('loader')
  const [doorsVisible, setDoorsVisible] = useState(false)

  return (
    <>
      {doorsVisible && phase === 'doors' && <DoorsPage />}

      {phase === 'loader' && (
        <LoaderScreen
          onExitStart={() => setDoorsVisible(true)}
          onComplete={() => setPhase('doors')}
        />
      )}
    </>
  )
}
