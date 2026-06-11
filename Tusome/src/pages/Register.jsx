import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { API_BASE, PORTAL_ROUTES } from '../config/api'
import Footer from './footer'

function RegisterPage() {
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('student')
  const [agreed, setAgreed] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  // { fullName, email, password, terms, general }
  const [errors, setErrors] = useState({})

  function fieldClass(key) {
    return errors[key] ? 'has-error' : ''
  }

  function mapServerErrors(data) {
    const next = {}
    if (data?.full_name) next.fullName = [].concat(data.full_name)[0]
    if (data?.email) next.email = [].concat(data.email)[0]
    if (data?.password) next.password = [].concat(data.password)[0]
    if (!Object.keys(next).length) {
      next.general =
        typeof data?.detail === 'string'
          ? data.detail
          : 'Something went wrong. Please check your details and try again.'
    }
    return next
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const next = {}
    if (!fullName.trim()) next.fullName = 'Please enter your full name.'
    if (!email) next.email = 'Please enter your email address.'
    if (!password) next.password = 'Please enter a password.'
    else if (password.length < 8) next.password = 'Password must be at least 8 characters.'
    if (!agreed) next.terms = 'Please agree to the Terms of Service and Privacy Policy.'
    if (Object.keys(next).length) {
      setErrors(next)
      return
    }
    setErrors({})
    setLoading(true)
    try {
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ full_name: fullName.trim(), email, password, role }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrors(mapServerErrors(data))
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
      setErrors({ general: 'Could not reach the server. Please try again.' })
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

            {errors.general && (
              <div className="register-error" role="alert">
                {errors.general}
              </div>
            )}

            <label>
              Full Name
              <input
                type="text"
                autoComplete="name"
                className={fieldClass('fullName')}
                aria-invalid={Boolean(errors.fullName)}
                placeholder="Enter your full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
              {errors.fullName && <span className="field-msg" role="alert">{errors.fullName}</span>}
            </label>

            <label>
              Email Address
              <input
                type="email"
                autoComplete="email"
                className={fieldClass('email')}
                aria-invalid={Boolean(errors.email)}
                placeholder="example@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              {errors.email && <span className="field-msg" role="alert">{errors.email}</span>}
            </label>

            <label>
              Password
              <span className="password-field">
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  className={fieldClass('password')}
                  aria-invalid={Boolean(errors.password)}
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
              {errors.password && <span className="field-msg" role="alert">{errors.password}</span>}
            </label>

            <label>
              I want to join as
              <select value={role} onChange={(e) => setRole(e.target.value)}>
                <option value="student">Student</option>
                <option value="consultant">Consultant</option>
              </select>
            </label>

            <label className={`terms-row${errors.terms ? ' terms-row--error' : ''}`}>
              <input
                type="checkbox"
                checked={agreed}
                aria-invalid={Boolean(errors.terms)}
                onChange={(e) => setAgreed(e.target.checked)}
              />
              <span>
                I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
              </span>
            </label>
            {errors.terms && <span className="field-msg" role="alert">{errors.terms}</span>}

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
