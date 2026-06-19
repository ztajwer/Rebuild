import { useState } from 'react'
import LoaderScreen from './components/LoaderScreen'
import './App.css'

export default function App() {
  const [loaded, setLoaded] = useState(false)

  if (!loaded) {
    return <LoaderScreen onComplete={() => setLoaded(true)} />
  }

  return (
    <main className="main-placeholder">
      <p>Welcome to MAJ Boutique</p>
    </main>
  )
}
