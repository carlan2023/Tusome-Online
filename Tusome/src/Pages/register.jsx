import Footer from './footer'
import './register.css'

function RegisterPage() {
  return (
    <main className="register-page">
      <header className="register-header">
        <a className="register-brand" href="#">
          Tusome Online
        </a>
        <nav className="register-nav" aria-label="Register page navigation">
          <a href="#explore">Explore</a>
          <a href="#pricing">Pricing</a>
          <a href="#about">About</a>
          <a className="register-login" href="#login">
            Log In
          </a>
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

          <form className="register-form">
            <div>
              <h2 id="register-title">Create Account</h2>
              <p>
                Already a member? <a href="#login">Log In</a>
              </p>
            </div>

            <div className="social-buttons">
              <button type="button">
                <span aria-hidden="true">▣</span>
                Google
              </button>
              <button type="button">
                <span aria-hidden="true">▣</span>
                LinkedIn
              </button>
            </div>

            <div className="divider">
              <span>or use email</span>
            </div>

            <label>
              Full Name
              <input type="text" placeholder="Enter your full name" />
            </label>

            <label>
              Email Address
              <input type="email" placeholder="example@email.com" />
            </label>

            <label>
              Password
              <span className="password-field">
                <input type="password" placeholder="At least 8 characters" />
                <button type="button" aria-label="Show password">
                  ◎
                </button>
              </span>
            </label>

            <label>
              Primary Learning Interest
              <select defaultValue="">
                <option value="" disabled>
                  Select an area of interest
                </option>
                <option>Data Science</option>
                <option>Artificial Intelligence</option>
                <option>Web Development</option>
                <option>Business Skills</option>
              </select>
            </label>

            <label className="terms-row">
              <input type="checkbox" />
              <span>
                I agree to the <a href="#terms">Terms of Service</a> and <a href="#privacy">Privacy Policy</a>.
              </span>
            </label>

            <a className="submit-button" href="#dashboard">
              Create Account
            </a>
          </form>
        </section>
      </section>

      <Footer />
    </main>
  )
}

export default RegisterPage
