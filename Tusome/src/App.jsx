<<<<<<< HEAD
import { Routes, Route } from "react-router-dom";
import "./App.css";
import LandingPage from "./pages/LandingPage";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Portal from "./pages/Portal";
=======
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
>>>>>>> refs/remotes/origin/main

export default function App() {
  return (
<<<<<<< HEAD
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/dashboard" element={<Portal role="student" />} />
      <Route path="/consultant" element={<Portal role="consultant" />} />
      <Route path="/admin" element={<Portal role="admin" />} />
    </Routes>
  );
=======
    <div className="app-root">
      {page === 'dashboard' && <DashboardPage />}
      {page === 'register' && <RegisterPage />}
      {page === 'landing' && <LandingPage />}
    </div>
  )
>>>>>>> refs/remotes/origin/main
}
