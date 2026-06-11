import logo from '../assets/logo.jpeg'

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-main">
        <div className="footer-brand">
          <a className="brand-mark" href="#top">
            <img className="brand-logo" src={logo} alt="" />
            <span>Tusome Online</span>
          </a>
          <p>
            Empowering learners globally through high-quality, accessible,
            and affordable online education.
          </p>
          <div className="social-links" aria-label="Social media">
            <a href="#twitter" aria-label="Twitter / X">𝕏</a>
            <a href="#linkedin" aria-label="LinkedIn">in</a>
            <a href="#youtube" aria-label="YouTube">▶</a>
          </div>
        </div>
        <div className="footer-group">
          <h3>Quick Links</h3>
          <a href="#courses">Courses Catalog</a>
          <a href="#features">About Us</a>
          <a href="#how">How it Works</a>
          <a href="#pricing">Pricing Plans</a>
        </div>
        <div className="footer-group">
          <h3>Support</h3>
          <a href="mailto:hello@tusome.online">Help Center</a>
          <a href="#contact">Contact Support</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
        </div>
        <div className="footer-group">
          <h3>Stay Updated</h3>
          <p>Subscribe to our newsletter for new course alerts.</p>
          <label className="newsletter-form">
            <input type="email" placeholder="Email address" aria-label="Email address" />
            <button type="button" aria-label="Subscribe">
              →
            </button>
          </label>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Tusome Online Education Platform. All rights reserved.</p>
        <div>
          <a href="#privacy">Privacy Policy</a>
          <a href="#language">English (US)</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
