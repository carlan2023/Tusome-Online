import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE, PORTAL_ROUTES } from "../config/api";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  // { email, password, credentials, general }
  const [errors, setErrors] = useState({});

  const emailInvalid = Boolean(errors.email || errors.credentials);
  const passwordInvalid = Boolean(errors.password || errors.credentials);

  async function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!email) next.email = "Please enter your email address.";
    if (!password) next.password = "Please enter your password.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const res = await fetch(`${API_BASE}/auth/login/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({ credentials: data.detail || "Incorrect email or password." });
        return;
      }
      localStorage.setItem("tu_access", data.access);
      localStorage.setItem("tu_refresh", data.refresh);
      localStorage.setItem("tu_user", JSON.stringify(data.user || {}));
      const role = data.user?.role || "student";
      navigate(PORTAL_ROUTES[role] || "/dashboard");
    } catch {
      setErrors({ general: "Could not reach the server. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="tu-auth tu-auth--login">
      <aside className="tu-aside">
        <Link className="tu-brand" to="/"><span className="tu-mark" />Tusome Online</Link>
        <div>
          <h2>Welcome back to your learning journey.</h2>
          <p>Pick up where you left off — your classes, live sessions, and progress are waiting.</p>
        </div>
        <blockquote className="tu-quote">
          "The most comprehensive platform for professional learning I've used — accessible, expert-led, and built for our region."
        </blockquote>
      </aside>

      <main className="tu-panel">
        <form className="tu-form" onSubmit={handleSubmit} noValidate>
          <h1>Log in</h1>
          <p className="tu-lead">Please enter your details to access your portal.</p>

          {errors.general && <div className="tu-err" role="alert">{errors.general}</div>}

          <div className={`tu-field${emailInvalid ? " tu-field--error" : ""}`}>
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              aria-invalid={emailInvalid}
              placeholder="e.g. student@tusome.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            {errors.email && <p className="tu-field-msg" role="alert">{errors.email}</p>}
          </div>
          <div className={`tu-field${passwordInvalid ? " tu-field--error" : ""}`}>
            <label htmlFor="password">Password</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              aria-invalid={passwordInvalid}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            {(errors.password || errors.credentials) && (
              <p className="tu-field-msg" role="alert">
                {errors.password || errors.credentials}
              </p>
            )}
          </div>

          <div className="tu-row">
            <label><input type="checkbox" disabled /> Remember me (coming soon)</label>
            <span className="tu-muted">Forgot password? (coming soon)</span>
          </div>

          <button className="tu-submit" type="submit" disabled={loading}>
            {loading ? "Signing in…" : "Log In"}
          </button>

          <p className="tu-foot">
            Don't have an account? <Link to="/register">Sign up</Link>
          </p>
        </form>
      </main>
    </div>
  );
}
