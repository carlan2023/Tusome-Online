import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { API_BASE } from "../config/api";

export default function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get("token") || "";
  const identifier = params.get("identifier") || "";
  const otpMode = !token;

  const [code, setCode] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [errors, setErrors] = useState({});
  const [done, setDone] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (otpMode && !code.trim()) next.code = "Enter the 6-digit code we sent you.";
    if (!password) next.password = "Choose a new password (at least 8 characters).";
    else if (password.length < 8) next.password = "Password must be at least 8 characters.";
    if (password !== confirm) next.confirm = "Passwords do not match.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const body = otpMode
        ? { identifier, code: code.trim(), new_password: password }
        : { token, new_password: password };
      const res = await fetch(`${API_BASE}/auth/password/reset/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrors({
          general: data.detail || data.new_password?.[0] || "Reset failed. Please try again.",
        });
        return;
      }
      setDone(true);
    } catch {
      setErrors({ general: "Could not reach the server. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    return (
      <main className="auth-solo">
        <div className="tu-form" role="status">
          <h1>Password updated 🎉</h1>
          <p className="tu-lead">Your password has been changed. Log in with the new one.</p>
          <Link className="tu-submit tu-submit--brand tu-submit--link" to="/login">
            Go to login
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="auth-solo">
      <form className="tu-form" onSubmit={handleSubmit} noValidate>
        <h1>Choose a new password</h1>
        <p className="tu-lead">
          {otpMode
            ? `Enter the code we sent to ${identifier || "your phone"} and your new password.`
            : "Enter your new password below."}
        </p>

        {errors.general && <div className="tu-err" role="alert">{errors.general}</div>}

        {otpMode && (
          <div className={`tu-field${errors.code ? " tu-field--error" : ""}`}>
            <label htmlFor="code">Reset code</label>
            <input
              id="code"
              type="text"
              inputMode="numeric"
              maxLength={6}
              placeholder="6-digit code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
            />
            {errors.code && <p className="tu-field-msg" role="alert">{errors.code}</p>}
          </div>
        )}

        <div className={`tu-field${errors.password ? " tu-field--error" : ""}`}>
          <label htmlFor="new-password">New password</label>
          <input
            id="new-password"
            type="password"
            autoComplete="new-password"
            placeholder="At least 8 characters"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {errors.password && <p className="tu-field-msg" role="alert">{errors.password}</p>}
        </div>

        <div className={`tu-field${errors.confirm ? " tu-field--error" : ""}`}>
          <label htmlFor="confirm-password">Confirm new password</label>
          <input
            id="confirm-password"
            type="password"
            autoComplete="new-password"
            placeholder="Repeat the password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
          {errors.confirm && <p className="tu-field-msg" role="alert">{errors.confirm}</p>}
        </div>

        <button className="tu-submit tu-submit--brand" type="submit" disabled={loading}>
          {loading ? "Updating…" : "Update password"}
        </button>

        <p className="tu-foot">
          <Link to="/forgot-password">Request a new code</Link>
          {" · "}<Link to="/login">Back to login</Link>
        </p>
      </form>
    </main>
  );
}
