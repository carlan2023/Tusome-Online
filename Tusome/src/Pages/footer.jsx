import './footer.css'

function Footer() {
  return (
    <footer className="footer" id="contact">
      <div className="footer-main">
        <div className="footer-brand">
          <a className="brand-mark" href="#">
            <span>Tusome Online</span>
          </a>
          <p>Empowering learners globally through high-quality, accessible, and affordable online education.</p>
        </div>
        <div className="footer-group">
          <h3>Quick Links</h3>
          <a href="#courses">Courses Catalog</a>
          <a href="#features">About Us</a>
          <a href="#instructor">Instructors</a>
          <a href="#pricing">Pricing Plans</a>
        </div>
        <div className="footer-group">
          <h3>Support</h3>
          <a href="mailto:hello@tusome.online">Help Center</a>
          <a href="#contact">Contact Support</a>
          <a href="#privacy">Privacy Policy</a>
          <a href="#privacy">Terms of Service</a>
        </div>
        <div className="footer-group">
          <h3>Stay Updated</h3>
          <p>Subscribe to our newsletter for new course alerts.</p>
          <label className="newsletter-form">
            <input type="email" placeholder="Email address" />
            <button type="button" aria-label="Subscribe">
              &gt;
            </button>
          </label>
        </div>
      </div>
      <div className="footer-bottom">
        <p>&copy; 2026 Tusome Online Education Platform. All rights reserved.</p>
        <div>
          <a href="#privacy">Privacy Policy</a>
          <a href="#language">Language: English (US)</a>
        </div>
      </div>
    </footer>
  )
}

export default Footer
