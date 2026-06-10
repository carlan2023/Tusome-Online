import { useEffect, useState } from 'react'
import './App.css'
import DashboardPage from './Pages/dashboard'
import LandingPage from './Pages/landingpage'
import RegisterPage from './Pages/register'

function getCurrentPage() {
  if (window.location.hash === '#register') {
    return 'register'
  }

  if (window.location.hash === '#dashboard') {
    return 'dashboard'
  }

  return 'landing'
}

function App() {
  const [page, setPage] = useState(getCurrentPage)

  useEffect(() => {
    function handleHashChange() {
      setPage(getCurrentPage())
      window.scrollTo(0, 0)
    }

    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  return (
    <div className="app-root">
      {page === 'dashboard' && <DashboardPage />}
      {page === 'register' && <RegisterPage />}
      {page === 'landing' && <LandingPage />}
    </div>
  )
}

export default App
