import { Link } from "react-router-dom";
import "../styles/landing.css";

export default function LandingPage() {
  return (
    <div className="tu-land">
      <nav className="tu-nav">
        <div className="tu-brand"><span className="tu-mark" />Tusome Online</div>
        <div className="tu-links">
          <a href="#courses">Courses</a>
          <a href="#features">Features</a>
          <a href="#about">About</a>
        </div>
        <div className="tu-cta">
          <Link to="/login" className="tu-btn tu-ghost">Log In</Link>
          <Link to="/register" className="tu-btn tu-solid">Sign Up</Link>
        </div>
      </nav>

      <header className="tu-hero">
        <div>
          <span className="tu-eyebrow">Professional education, redefined</span>
          <h1>Empower your future with <em>Tusome</em> Online.</h1>
          <p className="tu-sub">
            High-quality, accessible learning at your fingertips — expert-led courses,
            live classes, and recognized certificates, built for learners across Uganda
            and East Africa.
          </p>
          <div className="tu-actions">
            <Link to="/register" className="tu-btn tu-gold">Get Started Free</Link>
            <a href="#courses" className="tu-btn tu-ghost">Browse Courses</a>
          </div>
          <div className="tu-trust">
            <div className="tu-dots"><span /><span /><span /><span /></div>
            Trusted by 50,000+ learners worldwide
          </div>
        </div>

        <div className="tu-card" id="courses">
          <div className="tu-coursehead">
            <span className="tu-pill">Best Seller · Data Science</span>
            <span className="tu-rating">★ 4.9</span>
          </div>
          <h3>Advanced Predictive Analytics</h3>
          <div className="tu-instr">Instructor: Dr. Sarah Jenkins · 12 weeks</div>
          <div className="tu-prog"><i /></div>
          <div className="tu-progrow"><span>Your progress</span><span>75%</span></div>
          <div className="tu-mini">
            <div><b>1,402</b><small>Enrolled</small></div>
            <div><b>12</b><small>Modules</small></div>
            <div><b>UGX 150k</b><small>Per course</small></div>
          </div>
        </div>
      </header>

      <section className="tu-feat" id="features">
        <div className="tu-f">
          <div className="tu-fi">✦</div>
          <h3>Flexible Learning</h3>
          <p>Study at your own pace, on any device, and balance education with your life and work.</p>
        </div>
        <div className="tu-f">
          <div className="tu-fi">◆</div>
          <h3>Expert Instructors</h3>
          <p>Learn from industry leaders and academic scholars who bring real-world experience to class.</p>
        </div>
        <div className="tu-f">
          <div className="tu-fi">✸</div>
          <h3>Recognized Certificates</h3>
          <p>Earn credentials valued by top employers and recognized across the industry.</p>
        </div>
      </section>

      <footer className="tu-foot" id="about">
        <div className="tu-brand"><span className="tu-mark" />Tusome Online</div>
        <div>© {new Date().getFullYear()} Tusome Online. Professional Education Redefined.</div>
      </footer>
    </div>
  );
}
