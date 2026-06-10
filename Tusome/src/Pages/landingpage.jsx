import cartIcon from '../assets/cart.svg'
import logo from '../assets/logo.jpeg'
import Footer from './footer'
import './landingpage.css'

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
      <section className="page-sheet">
        <header className="site-header">
          <a className="brand-mark" href="#">
            <img className="brand-logo" src={logo} alt="" />
            <span>Tusome Online</span>
          </a>
          <nav className="top-nav" aria-label="Primary navigation">
            <label className="header-search">
              <span aria-hidden="true">⌕</span>
              <input type="search" placeholder="Search Courses" aria-label="Search courses" />
            </label>
            <a href="#features">Teach with Tosome Online</a>
            <a href="#testimonials">Testimonials</a>
          </nav>
          <div className="header-actions">
            <a className="login-link" href="#start">
              Log In
            </a>
            <a className="header-link" href="#register">
              Sign Up
            </a>
          </div>
        </header>

        <section className="hero">
          <div className="hero-copy">
            <span className="eyebrow">
              <span className="eyebrow-dot" />
              Trusted by 50,000+ students worldwide
            </span>
            <h1>Empower Your Future with Tusome Online.</h1>
            <p>
              Unlock your potential with expert-led courses designed for everyone,
anywhere, anytime. High-quality accessible learning at your fingertips.
            </p>
            <div className="hero-actions">
              <a className="btn primary" href="#start">
                Get Started
              </a>
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

        <section className="why-section" id="features">
          <div className="why-heading">
            <h2>Explore Courses That Move Your Future Forward</h2>
            <p>
              Learn practical, career-ready skills through expert-led programs,
              hands-on projects, and flexible online lessons.
            </p>
          </div>

          <section className="courses-section" id="courses">
            <div className="section-heading">
              <div>
                <span>Popular Courses</span>
                <p>Start your journey with our most-enrolled specializations.</p>
              </div>
              <a href="#courses">Explore all courses ›</a>
            </div>
            <div className="course-grid">
              {courses.map((course) => (
                <article className="course-card" key={course.title}>
                  <div className="course-image">
                    <img src={course.image} alt="" />
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
          </section>

          <div className="why-heading why-heading-secondary">
            <h2>Why Learners Choose Tusome</h2>
            <p>
              Everything you need to stay supported, motivated, and confident
              as you build real skills for your next opportunity.
            </p>
          </div>

          <div className="why-grid">
            <article className="why-card expert-card">
              <span className="why-icon line-icon">☟</span>
              <div>
                <h3>Expert Instructors</h3>
                <p>
                  Learn from industry leaders and academic scholars who bring
                  real-world experience directly to your digital classroom.
                </p>
              </div>
              <span className="award-mark">★</span>
            </article>

            <article className="why-card flexible-card">
              <span className="why-icon clock-icon">○</span>
              <div>
                <h3>Flexible Learning</h3>
                <p>
                  Study at your own pace, on any device, and balance your
                  education with your personal life.
                </p>
              </div>
            </article>

            <article className="why-card certificate-card">
              <span className="why-icon cert-icon">▣</span>
              <div>
                <h3>Recognized Certificates</h3>
                <p>
                  Earn credentials that are valued by top employers and recognized
                  across the industry.
                </p>
              </div>
            </article>

            <article className="why-card community-card">
              <span className="community-icon">👥</span>
              <div>
                <h3>Global Community</h3>
                <p>
                  Join a network of thousands of learners. Collaborate on projects,
                  participate in forums, and grow your network globally.
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="steps-band">
          <h2>How Tusome Online Works</h2>
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
              <p>Complete your modules and projects to earn your industry- recognized certification.</p>
            </article>
          </div>
        </section>

        <section className="cta-panel" id="start">
          <h2>Ready to start your journey?</h2>
          <p>Join thousands of students who are already shaping their future with Tusome Online.</p>
          <div className="cta-form">
            <a className="btn primary" href="mailto:hello@tusome.online">
              Get Started Free
            </a>
            <input type="email" placeholder="Contact " aria-label="Parent email address" />
          </div>
        </section>

        <Footer />
      </section>
    </main>
  )
}

export default LandingPage
