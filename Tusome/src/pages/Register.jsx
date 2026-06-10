import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";
import "../styles/register.css";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ full_name: "", email: "", password: "", role: "student" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  const set = (key) => (e) => setForm({ ...form, [key]: e.target.value });

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setOk("");
    if (!form.full_name || !form.email || !form.password) {
      setError("Please fill in all fields.");
      return;
    }
    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/register/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) {
        const msg = data.email?.[0] || data.password?.[0] || data.role?.[0] || data.detail || "Registration failed.";
        setError(msg);
        return;
      }
      setOk("Account created! Redirecting to login…");
      setTimeout(() => navigate("/login"), 1200);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tu-auth tu-auth--register">
      <aside className="tu-aside">
        <div className="tu-brand"><span className="tu-mark" />Tusome Online</div>
        <div>
          <h2>Start your mastery journey today.</h2>
          <p>Join a community of 50,000+ learners mastering new skills with expert guidance.</p>
        </div>
        <ul className="tu-list">
          <li><b>✦</b><span>Access expert-led courses and live classes</span></li>
          <li><b>◆</b><span>Track progress, earn badges, and stay motivated</span></li>
          <li><b>✸</b><span>Earn recognized, shareable certificates</span></li>
        </ul>
      </aside>

      <main className="tu-panel">
        <form className="tu-form" onSubmit={handleSubmit}>
          <h1>Create your account</h1>
          <p className="tu-lead">It's a beautiful day to learn something new.</p>

          {error && <div className="tu-err">{error}</div>}
          {ok && <div className="tu-ok">{ok}</div>}

          <div className="tu-field">
            <label>I am joining as</label>
          </div>
          <div className="tu-roles">
            <button
              type="button"
              className={form.role === "student" ? "on" : ""}
              onClick={() => setForm({ ...form, role: "student" })}
            >
              Student
            </button>
            <button
              type="button"
              className={form.role === "consultant" ? "on" : ""}
              onClick={() => setForm({ ...form, role: "consultant" })}
            >
              Consultant / Instructor
            </button>
          </div>

          <div className="tu-field">
            <label htmlFor="name">Full Name</label>
            <input
              id="name"
              type="text"
              autoComplete="name"
              placeholder="Enter your full name"
              value={form.full_name}
              onChange={set("full_name")}
            />
          </div>
          <div className="tu-field">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="e.g. student@tusome.com"
              value={form.email}
              onChange={set("email")}
            />
          </div>
          <div className="tu-field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="At least 8 characters"
              value={form.password}
              onChange={set("password")}
            />
          </div>

          <button className="tu-submit" type="submit" disabled={loading}>
            {loading ? "Creating account…" : "Create Account"}
          </button>

          <p className="tu-foot">
            Already a member? <Link to="/login">Log In</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
