import { useState } from 'react'
import { Link } from 'react-router-dom'
import cartIcon from '../assets/cart.svg'
import logo from '../assets/logo.jpeg'
import welcomeImg from '../assets/welcome.jpg'
import skillsImg from '../assets/skills.jpg'
import readingImg from '../assets/Reading.jpg'
import booksImg from '../assets/boooks.jpg'
import mubsImg from '../assets/Mubs.jpg'
import glowImg from '../assets/Glow.jpg'
import menImg from '../assets/Men.jpg'
import juliaImg from '../assets/Julia.jpg'
import ladyImg from '../assets/Ugandan Lady.jpg'
import greenShirtImg from '../assets/Green shirt.jpg'
import Footer from './footer'

const COURSES = [
  {
    title: 'Advanced Data Science & ML',
    image: readingImg,
    tag: 'Data Science',
    rating: '4.8',
    reviews: '2.4k reviews',
    description: 'Master Python, SQL, and Machine Learning models with hands-on projects and real datasets.',
    price: '$89.99',
  },
  {
    title: 'Generative AI Foundations',
    image: glowImg,
    tag: 'AI',
    rating: '4.9',
    reviews: '1.8k reviews',
    description: 'Explore the world of LLMs, Prompt Engineering, and building AI-powered applications.',
    price: '$94.00',
  },
  {
    title: 'Full-Stack Web Development',
    image: skillsImg,
    tag: 'Development',
    rating: '4.7',
    reviews: '3.1k reviews',
    description: 'Build responsive, scalable web applications using React, Node.js, and modern CSS frameworks.',
    price: '$75.50',
  },
  {
    title: 'Business Analytics Pro',
    image: booksImg,
    tag: 'Business',
    rating: '4.6',
    reviews: '980 reviews',
    description: 'Turn raw numbers into boardroom decisions with Excel, SQL, and storytelling dashboards.',
    price: '$69.00',
  },
  {
    title: 'Mobile App Development',
    image: menImg,
    tag: 'Development',
    rating: '4.7',
    reviews: '1.2k reviews',
    description: 'Ship cross-platform Android & iOS apps with React Native, from idea to app store.',
    price: '$82.00',
  },
  {
    title: 'Digital Marketing Mastery',
    image: mubsImg,
    tag: 'Business',
    rating: '4.5',
    reviews: '1.6k reviews',
    description: 'Grow brands with SEO, social campaigns, and analytics that prove what works.',
    price: '$59.99',
  },
]

const CATEGORIES = ['All', 'Data Science', 'AI', 'Development', 'Business']

const TESTIMONIALS = [
  {
    name: 'Julia Nankya',
    role: 'Data Analyst, Kampala',
    photo: juliaImg,
    quote:
      'Tusome took me from spreadsheets to machine learning in eight months. The mentors reply like friends, not robots — I landed my analyst role before finishing the course.',
  },
  {
    name: 'Amina Achen',
    role: 'Software Developer',
    photo: ladyImg,
    quote:
      "The full-stack track is the most practical course I've taken anywhere. Real projects, real code reviews, and a certificate employers actually recognized.",
  },
  {
    name: 'David Okello',
    role: 'Business Consultant',
    photo: greenShirtImg,
    quote:
      'I teach on Tusome and learn on it too. The verification process gives students confidence, and the community keeps every course honest.',
  },
]

const FAQS = [
  {
    q: 'How do I become a verified consultant?',
    a: 'Register as a consultant, upload your government ID, academic certificate, and a professional reference. Our team reviews applications within one business day — once approved, your consultant tools unlock.',
  },
  {
    q: 'Can I learn on my phone?',
    a: 'Yes. Every course, quiz, and live session works on mobile browsers, and you can register and log in with just a phone number — no email required.',
  },
  {
    q: 'Are the certificates recognized?',
    a: 'Tusome certificates carry verified instructor credentials and are recognized by a growing network of employers across East Africa and beyond.',
  },
  {
    q: 'What if I forget my password?',
    a: 'Use "Forgot password" on the login page — we send a reset link to your email or a 6-digit code to your phone, whichever you registered with.',
  },
]

function LandingPage() {
  const [category, setCategory] = useState('All')
  const [slide, setSlide] = useState(0)
  const [openFaq, setOpenFaq] = useState(0)

  const visibleCourses =
    category === 'All' ? COURSES.slice(0, 3) : COURSES.filter((c) => c.tag === category)

  const prev = () => setSlide((s) => (s - 1 + TESTIMONIALS.length) % TESTIMONIALS.length)
  const next = () => setSlide((s) => (s + 1) % TESTIMONIALS.length)
  const t = TESTIMONIALS[slide]

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
            <a href="#testimonials">Stories</a>
            <a href="#faq">FAQ</a>
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

            <div className="filter-row" role="tablist" aria-label="Course categories">
              {CATEGORIES.map((c) => (
                <button
                  key={c}
                  type="button"
                  role="tab"
                  aria-selected={category === c}
                  className={`filter-chip${category === c ? ' is-active' : ''}`}
                  onClick={() => setCategory(c)}
                >
                  {c}
                </button>
              ))}
            </div>

            <div className="course-grid">
              {visibleCourses.map((course) => (
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
            <div className="feature-split">
              <div className="feature-media">
                <img src={welcomeImg} alt="A Tusome student studying online" loading="lazy" />
              </div>
              <div className="feature-copy">
                <span className="kicker">Why Tusome</span>
                <h2>Everything you need to learn with confidence</h2>
                <ul className="feature-list">
                  <li>
                    <span className="why-icon chip-blue" aria-hidden="true">✦</span>
                    <div>
                      <h3>Expert Instructors</h3>
                      <p>Verified industry leaders bring real-world experience to your classroom.</p>
                    </div>
                  </li>
                  <li>
                    <span className="why-icon chip-orange" aria-hidden="true">◷</span>
                    <div>
                      <h3>Flexible Learning</h3>
                      <p>Study at your own pace, on any device, around your life.</p>
                    </div>
                  </li>
                  <li>
                    <span className="why-icon chip-teal" aria-hidden="true">▣</span>
                    <div>
                      <h3>Recognized Certificates</h3>
                      <p>Earn credentials valued by top employers across the region.</p>
                    </div>
                  </li>
                  <li>
                    <span className="why-icon chip-violet" aria-hidden="true">⚭</span>
                    <div>
                      <h3>Global Community</h3>
                      <p>Collaborate on projects and grow your network worldwide.</p>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="testimonials" id="testimonials">
          <div className="section">
            <div className="section-head">
              <span className="kicker">Learner Stories</span>
              <h2>People like you, futures like yours</h2>
            </div>
            <figure className="quote-card">
              <img className="quote-photo" src={t.photo} alt={t.name} />
              <blockquote>“{t.quote}”</blockquote>
              <figcaption>
                <strong>{t.name}</strong>
                <span>{t.role}</span>
              </figcaption>
              <div className="quote-nav">
                <button type="button" onClick={prev} aria-label="Previous story">←</button>
                <div className="quote-dots" aria-hidden="true">
                  {TESTIMONIALS.map((_, i) => (
                    <span key={i} className={i === slide ? 'is-active' : ''} />
                  ))}
                </div>
                <button type="button" onClick={next} aria-label="Next story">→</button>
              </div>
            </figure>
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
                <p>Sign up with your email or phone number in seconds.</p>
              </article>
              <article>
                <span>02</span>
                <h3>Start Learning</h3>
                <p>Pick a course and start your first lesson immediately.</p>
              </article>
              <article>
                <span>03</span>
                <h3>Get Certified</h3>
                <p>Complete your projects and earn a recognized certificate.</p>
              </article>
            </div>
          </div>
        </section>

        <section className="faq-section" id="faq">
          <div className="section">
            <div className="section-head">
              <span className="kicker">FAQ</span>
              <h2>Questions, answered</h2>
            </div>
            <div className="faq-list">
              {FAQS.map((item, i) => (
                <div className={`faq-item${openFaq === i ? ' is-open' : ''}`} key={item.q}>
                  <button
                    type="button"
                    className="faq-q"
                    aria-expanded={openFaq === i}
                    onClick={() => setOpenFaq(openFaq === i ? -1 : i)}
                  >
                    {item.q}
                    <span aria-hidden="true">{openFaq === i ? '−' : '+'}</span>
                  </button>
                  {openFaq === i && <p className="faq-a">{item.a}</p>}
                </div>
              ))}
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
