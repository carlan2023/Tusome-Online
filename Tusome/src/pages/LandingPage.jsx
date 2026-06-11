import { Link } from 'react-router-dom'
import cartIcon from '../assets/cart.svg'
import logo from '../assets/logo.jpeg'
import Footer from './footer'

const courses = [
  {
    title: 'Advanced Data Science & ML',
    image:
      'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=900&q=85',
    tag: 'Data Science',
    rating: '4.8',
    reviews: '2.4k reviews',
    description: 'Master Python, SQL, and Machine Learning models with hands-on projects and real datasets.',
    price: '$89.99',
  },
  {
    title: 'Generative AI Foundations',
    image:
      'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=900&q=85',
    tag: 'Artificial Intelligence',
    rating: '4.9',
    reviews: '1.8k reviews',
    description: 'Explore the world of LLMs, Prompt Engineering, and building AI-powered applications.',
    price: '$94.00',
  },
  {
    title: 'Full-Stack Web Development',
    image:
      'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=85',
    tag: 'Development',
    rating: '4.7',
    reviews: '3.1k reviews',
    description: 'Build responsive, scalable web applications using React, Node.js, and modern CSS frameworks.',
    price: '$75.50',
  },
]

function LandingPage() {
  return (
    <main className="landing-page">
      <div className="page-sheet">
        <header className="site-header">
          <Link className="brand-mark" to="/">
            <img className="brand-logo" src={logo} alt="" />
            <span>Tusome Online</span>
          </Link>
          <nav className="top-nav" aria-label="Primary navigation">
            <label className="header-search">
              <span aria-hidden="true">⌕</span>
              <input type="search" placeholder="Search courses" aria-label="Search courses" />
            </label>
            <a href="#courses">Courses</a>
            <a href="#features">Why Tusome</a>
            <a href="#how">How it Works</a>
          </nav>
          <div className="header-actions">
            <Link className="login-link" to="/login">
              Log In
            </Link>
            <Link className="header-link" to="/register">
              Sign Up
            </Link>
          </div>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Trusted by 50,000+ students worldwide
            </span>
            <h1>Empower your future with Tusome Online.</h1>
            <p>
              Unlock your potential with expert-led courses designed for everyone,
              anywhere, anytime. High-quality accessible learning at your fingertips.
            </p>
            <div className="hero-actions">
              <Link className="btn primary" to="/register">
                Get Started <span aria-hidden="true">→</span>
              </Link>
              <a className="btn secondary" href="#courses">
                Browse Courses
              </a>
            </div>
          </div>
          <div className="hero-photo" aria-label="Students learning online">
            <div className="rating-card" aria-label="4.9 out of 5 rating based on 12 thousand reviews">
              <span className="rating-icon">★</span>
              <span>
                <strong>4.9/5 Rating</strong>
                <small>Based on 12k reviews</small>
              </span>
            </div>
          </div>
        </section>

        <section className="stats-band" aria-label="Tusome in numbers">
          <div className="stats">
            <div className="stat">
              <strong>50k+</strong>
              <span>Active learners</span>
            </div>
            <div className="stat">
              <strong>200+</strong>
              <span>Expert-led courses</span>
            </div>
            <div className="stat">
              <strong>4.9</strong>
              <span>Average course rating</span>
            </div>
            <div className="stat">
              <strong>95%</strong>
              <span>Completion success</span>
            </div>
          </div>
        </section>

        <section className="courses-section" id="courses">
          <div className="section">
            <div className="section-head">
              <span className="kicker">Popular Courses</span>
              <h2>Explore courses that move your future forward</h2>
              <p>
                Learn practical, career-ready skills through expert-led programs,
                hands-on projects, and flexible online lessons.
              </p>
            </div>
            <div className="section-heading">
              <div>
                <span>Most-enrolled specializations</span>
                <p>Start your journey with our highest-rated programs.</p>
              </div>
              <a href="#courses">Explore all courses ›</a>
            </div>
            <div className="course-grid">
              {courses.map((course) => (
                <article className="course-card" key={course.title}>
                  <div className="course-image">
                    <img src={course.image} alt="" loading="lazy" />
                    <span>{course.tag}</span>
                  </div>
                  <div className="course-content">
                    <p className="course-rating">
                      <strong>★ {course.rating}</strong> ({course.reviews})
                    </p>
                    <h3>{course.title}</h3>
                    <p>{course.description}</p>
                    <div className="course-footer">
                      <strong>{course.price}</strong>
                      <button type="button" aria-label={`Add ${course.title} to cart`}>
                        <img src={cartIcon} alt="" />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section id="features">
          <div className="section">
            <div className="section-head">
              <span className="kicker">Why Tusome</span>
              <h2>Everything you need to learn with confidence</h2>
              <p>
                Stay supported, motivated, and confident as you build real skills
                for your next opportunity.
              </p>
            </div>
            <div className="why-grid">
              <article className="why-card">
                <span className="why-icon chip-blue" aria-hidden="true">✦</span>
                <h3>Expert Instructors</h3>
                <p>
                  Learn from industry leaders and academic scholars who bring
                  real-world experience to your classroom.
                </p>
              </article>

              <article className="why-card">
                <span className="why-icon chip-orange" aria-hidden="true">◷</span>
                <h3>Flexible Learning</h3>
                <p>
                  Study at your own pace, on any device, and balance your
                  education with your personal life.
                </p>
              </article>

              <article className="why-card">
                <span className="why-icon chip-teal" aria-hidden="true">▣</span>
                <h3>Recognized Certificates</h3>
                <p>
                  Earn credentials that are valued by top employers and
                  recognized across the industry.
                </p>
              </article>

              <article className="why-card">
                <span className="why-icon chip-violet" aria-hidden="true">⚭</span>
                <h3>Global Community</h3>
                <p>
                  Join thousands of learners. Collaborate on projects, join
                  forums, and grow your network globally.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="steps-band" id="how">
          <div className="section">
            <div className="section-head">
              <span className="kicker">How it works</span>
              <h2>Start learning in three simple steps</h2>
            </div>
            <div className="steps">
              <article>
                <span>01</span>
                <h3>Create Account</h3>
                <p>Sign up in seconds and choose your learning path based on your goals.</p>
              </article>
              <article>
                <span>02</span>
                <h3>Start Learning</h3>
                <p>Access your dashboard, pick a course, and start your first lesson immediately.</p>
              </article>
              <article>
                <span>03</span>
                <h3>Get Certified</h3>
                <p>Complete your modules and projects to earn your industry-recognized certification.</p>
              </article>
            </div>
          </div>
        </section>

        <div className="cta-wrap" id="start">
          <section className="cta-panel">
            <h2>Ready to start your journey?</h2>
            <p>Join thousands of students who are already shaping their future with Tusome Online.</p>
            <div className="cta-form">
              <input type="email" placeholder="Enter your email address" aria-label="Email address" />
              <Link className="btn primary" to="/register">
                Get Started Free <span aria-hidden="true">→</span>
              </Link>
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </main>
  )
}

export default LandingPage

