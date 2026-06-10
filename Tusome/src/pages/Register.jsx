import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE, PORTAL_ROUTES } from '../config/api'
import Footer from './footer'
import './register.css'

function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [agreed, setAgreed] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  function firstError(data) {
    if (!data) return 'Something went wrong. Please try again.'
    if (typeof data.detail === 'string') return data.detail
    const key = Object.keys(data)[0]
    const val = Array.isArray(data[key]) ? data[key][0] : data[key]
    return typeof val === 'string' ? val : 'Please check your details and try again.'
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    if (!fullName || !email || !password) {
      setError('Please fill in your name, email, and password.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }
    if (!agreed) {
      setError('Please agree to the Terms of Service and Privacy Policy.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName, email, password, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(firstError(data))
        return
      }

      // Auto-login after successful registration.
      const loginRes = await fetch(`${API_BASE}/auth/login/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })
      const loginData = await loginRes.json()
      if (!loginRes.ok) {
        navigate('/login')
        return
      }
      localStorage.setItem('tu_access', loginData.access)
      localStorage.setItem('tu_refresh', loginData.refresh)
      localStorage.setItem('tu_user', JSON.stringify(loginData.user || {}))
      const userRole = loginData.user?.role || 'student'
      navigate(PORTAL_ROUTES[userRole] || '/dashboard')
    } catch {
      setError('Could not reach the server. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="register-page">
      <header className="register-header">
        <Link className="register-brand" to="/">
          Tusome Online
        </Link>
        <nav className="register-nav" aria-label="Register page navigation">
          <Link to="/">Explore</Link>
          <Link className="register-login" to="/login">
            Log In
          </Link>
        </nav>
      </header>

      <section className="register-shell">
        <section className="register-card" aria-labelledby="register-title">
          <div className="register-panel">
            <span className="register-pill">Join 50k+ Learners</span>
            <h1>Start Your Mastery Journey Today.</h1>
            <p>Unlock professional-grade courses designed to elevate your skills and future-proof your career.</p>

            <div className="register-benefits">
              <span>
                <strong aria-hidden="true">◎</strong>
                Accredited Learning Paths
              </span>
              <span>
                <strong aria-hidden="true">♟</strong>
                Expert-led Community Mentorship
              </span>
            </div>
          </div>

          <form className="register-form" onSubmit={handleSubmit} noValidate>
            <div>
              <h2 id="register-title">Create Account</h2>
              <p>
                Already a member? <Link to="/login">Log In</Link>
              </p>
            </div>

            {error && (
              <div className="register-error" role="alert">
                {error}
              </div>
            )}

            <label>
              Full Name
              <input
                type="text"
                autoComplete="name"
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </label>

            <label>
              Email Address
              <input
                type="email"
                autoComplete="email"
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>

            <label>
              Password
              <span className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="At least 8 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((v) => !v)}
                >
                  ◎
                </button>
              </span>
            </label>

            <label>
              I want to join as
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="consultant">Consultant</option>
              </select>
            </label>

            <label className="terms-row">
              <input
                type="checkbox"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
              </span>
            </label>

            <button className="submit-button" type="submit" disabled={loading}>
              {loading ? 'Creating account…' : 'Create Account'}
            </button>
          </form>
        </section>
      </section>

      <Footer />
    </main>
  )
}

export default RegisterPage
