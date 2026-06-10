import Footer from './footer'
import './dashboard.css'

const stats = [
  { value: '85%', label: 'Attendance', color: '#078171' },
  { value: '62%', label: 'Homework', color: '#9f613f' },
  { value: '4.9', label: 'Rating', color: '#7c7224' },
  { value: '12', label: 'Classes Completed', color: '#55c7bd' },
]

const classes = [
  {
    title: 'Advanced Thermodynamics',
    lessons: '24h Left',
    image: 'https://images.unsplash.com/photo-1534996858221-380b92700493?auto=format&fit=crop&w=700&q=80',
    progress: '78%',
  },
  {
    title: 'Data Structures & Algos',
    lessons: 'Assignment Due',
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=700&q=80',
    progress: '45%',
  },
  {
    title: 'Modern World History',
    lessons: '3 Videos New',
    image: 'https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=700&q=80',
    progress: '92%',
  },
]

function DashboardPage() {
  return (
    <main className="dashboard-page">
      <aside className="dashboard-sidebar">
        <a className="dashboard-logo" href="#">
          Tusome Online
        </a>
        <span>Student Portal</span>

        <nav className="dashboard-menu" aria-label="Learner dashboard navigation">
          <a className="active" href="#dashboard">
            <span aria-hidden="true">[]</span>
            Dashboard
          </a>
          <a href="#classes">
            <span aria-hidden="true">O</span>
            My Classes
          </a>
          <a href="#assignments">
            <span aria-hidden="true">A</span>
            Assignments
          </a>
          <a href="#schedule">
            <span aria-hidden="true">S</span>
            Schedule
          </a>
          <a href="#profile">
            <span aria-hidden="true">P</span>
            Profile
          </a>
          <a href="#settings">
            <span aria-hidden="true">*</span>
            Settings
          </a>
        </nav>
      </aside>

      <section className="dashboard-main">
        <header className="dashboard-topbar">
          <label className="dashboard-search">
            <span aria-hidden="true">Q</span>
            <input type="search" defaultValue="Data Science" aria-label="Search dashboard" />
          </label>

          <div className="dashboard-actions">
            <button type="button" aria-label="Notifications">
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
            </button>
            <button type="button" aria-label="Messages">
              <svg aria-hidden="true" viewBox="0 0 24 24">
                <path d="M21 15a4 4 0 0 1-4 4H8l-5 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4z" />
              </svg>
            </button>
            <div className="learner-profile">
              <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&q=80" alt="" />
              <span>
                <strong>Eric</strong>
                <small>Undergraduate</small>
              </span>
            </div>
          </div>
        </header>

        <section className="dashboard-welcome">
          <div>
            <h1>Hello, Eric!</h1>
            <p>It's a beautiful day to learn something new. Monday, 24 October 2023.</p>
          </div>
          <button type="button">
            <span aria-hidden="true">+</span>
            1,249 Achievement Points
          </button>
        </section>

        <section className="dashboard-grid">
          <div className="dashboard-left">
            <section className="stats-grid" aria-label="Learner stats">
              {stats.map((stat) => (
                <article className="stat-card" key={stat.label} style={{ '--stat-color': stat.color }}>
                  <div className="stat-ring">
                    <strong>{stat.value}</strong>
                  </div>
                  <span>{stat.label}</span>
                </article>
              ))}
            </section>

            <section className="schedule-card" id="schedule">
              <div className="card-heading">
                <h2>Academic Schedule</h2>
                <div>
                  <button type="button" aria-label="Previous month">
                    {'<'}
                  </button>
                  <button type="button" aria-label="Next month">
                    {'>'}
                  </button>
                </div>
              </div>

              <div className="schedule-content">
                <div className="calendar-box">
                  <h3>October 2023</h3>
                  <div className="calendar-grid">
                    {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, index) => (
                      <span className="calendar-day" key={`${day}-${index}`}>
                        {day}
                      </span>
                    ))}
                    {Array.from({ length: 31 }, (_, index) => (
                      <span className={index + 1 === 24 ? 'selected' : ''} key={index + 1}>
                        {index + 1}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="upcoming-card">
                  <span>Upcoming Today</span>
                  <article>
                    <strong>Advanced Thermodynamics</strong>
                    <small>10:00 AM - 11:30 AM</small>
                  </article>
                  <article>
                    <strong>Digital Humanities 101</strong>
                    <small>01:00 PM - 02:30 PM</small>
                  </article>
                  <article>
                    <strong>Calculus II Workshop</strong>
                    <small>04:00 PM - 05:00 PM</small>
                  </article>
                </div>
              </div>
            </section>
          </div>

          <aside className="dashboard-right">
            <section className="ai-card">
              <span>Next Webinar</span>
              <h2>Future of AI in Edu</h2>
              <p>Join Dr. Sarah Chen for a deep-dive into neural networks.</p>
              <button type="button">Remind Me</button>
            </section>

            <section className="teachers-card">
              <div className="card-heading">
                <h2>My Teachers</h2>
                <a href="#teachers">View All</a>
              </div>
              <div className="teachers-list">
                {['Dr. Sarah', 'Prof. Mike', 'Ms. Elena'].map((name, index) => (
                  <span key={name}>
                    <img
                      src={`https://images.unsplash.com/photo-${['1494790108377-be9c29b29330', '1507003211169-0a1dd7228f2d', '1438761681033-6461ffad8d80'][index]}?auto=format&fit=crop&w=120&q=80`}
                      alt=""
                    />
                    <small>{name}</small>
                  </span>
                ))}
                <span className="more-teachers">
                  <strong>+8</strong>
                  <small>More</small>
                </span>
              </div>
            </section>
          </aside>
        </section>

        <section className="classes-section" id="classes">
          <div className="classes-heading">
            <h2>My Classes</h2>
            <div>
              <button className="active" type="button">
                Ongoing
              </button>
              <button type="button">Completed</button>
            </div>
          </div>

          <div className="dashboard-class-grid">
            {classes.map((course) => (
              <article className="dashboard-class-card" key={course.title}>
                <div className="class-image">
                  <img src={course.image} alt="" />
                  <span>{course.lessons}</span>
                </div>
                <div className="class-body">
                  <h3>{course.title}</h3>
                  <div className="progress-row">
                    <span>Progress</span>
                    <strong>{course.progress}</strong>
                  </div>
                  <div className="progress-track">
                    <span style={{ width: course.progress }} />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>

      <Footer />
    </main>
  )
}

export default DashboardPage
