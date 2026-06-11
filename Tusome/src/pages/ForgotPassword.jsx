import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { API_BASE } from "../config/api";

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!identifier.trim()) {
      setError("Enter the email or phone number you registered with.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await fetch(`${API_BASE}/auth/password/forgot/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: identifier.trim() }),
      });
      if (identifier.includes("@")) {
        setSent(true); // email: reset link is on its way
      } else {
        // phone: an OTP was sent — go straight to the reset form
        navigate(`/reset-password?identifier=${encodeURIComponent(identifier.trim())}`);
      }
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  if (sent) {
    return (
      <main className="auth-solo">
        <div className="tu-form" role="status">
          <h1>Check your inbox</h1>
          <p className="tu-lead">
            If an account exists for <strong>{identifier}</strong>, we've sent a
            password reset link. It expires in 1 hour.
          </p>
          <p className="tu-foot">
            Wrong address? <button type="button" className="link-btn" onClick={() => setSent(false)}>Try again</button>
            {" · "}<Link to="/login">Back to login</Link>
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-solo">
      <form className="tu-form" onSubmit={handleSubmit} noValidate>
        <h1>Forgot password?</h1>
        <p className="tu-lead">
          Enter your email or phone number and we'll send you a reset link or code.
        </p>

        <div className={`tu-field${error ? " tu-field--error" : ""}`}>
          <label htmlFor="identifier">Email or phone number</label>
          <input
            id="identifier"
            type="text"
            autoComplete="username"
            placeholder="you@example.com or +2567…"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
          />
          {error && <p className="tu-field-msg" role="alert">{error}</p>}
        </div>

        <button className="tu-submit tu-submit--brand" type="submit" disabled={loading}>
          {loading ? "Sending…" : "Send reset instructions"}
        </button>

        <p className="tu-foot">
          Remembered it? <Link to="/login">Log in</Link>
        </p>
      </form>
    </main>
  );
}
