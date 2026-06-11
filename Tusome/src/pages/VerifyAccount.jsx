import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { API_BASE, authFetch, getStoredUser } from "../config/api";

/**
 * Two jobs:
 * 1. /verify-account?token=…  — landing page for the emailed confirmation
 *    link (works logged out).
 * 2. /verify-account          — right after registration: shows the email
 *    notice and/or the OTP input for phone confirmation.
 */
export default function VerifyAccount() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const token = params.get("token") || "";

  const [user] = useState(getStoredUser);
  const [emailResult, setEmailResult] = useState(null); // 'ok' | 'fail' | null
  const [code, setCode] = useState("");
  const [otpDone, setOtpDone] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [loading, setLoading] = useState(false);

  // Mode 1: email link clicked — confirm the token.
  useEffect(() => {
    if (!token) return;
    fetch(`${API_BASE}/auth/verify/email/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((res) => setEmailResult(res.ok ? "ok" : "fail"))
      .catch(() => setEmailResult("fail"));
  }, [token]);

  // Mode 2 requires a logged-in user.
  useEffect(() => {
    if (!token && !user?.email && !user?.phone) {
      navigate("/login", { replace: true });
    }
  }, [token, user, navigate]);

  async function submitOtp(e) {
    e.preventDefault();
    if (!code.trim()) {
      setError("Enter the 6-digit code we sent by SMS.");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const res = await authFetch("/auth/verify/otp/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code.trim() }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "That code didn't work. Try again.");
        return;
      }
      setOtpDone(true);
    } catch {
      setError("Could not reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  async function resend(channel) {
    setNotice("");
    try {
      const res = await authFetch("/auth/verify/resend/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel }),
      });
      if (res.ok) setNotice(channel === "email" ? "Verification email re-sent." : "New code sent by SMS.");
    } catch {
      setNotice("Could not resend right now.");
    }
  }

  function continueOn() {
    navigate(user?.role === "consultant" ? "/consultant/verify" : "/dashboard");
  }

  // ---- Mode 1 rendering: emailed link ----
  if (token) {
    return (
      <main className="auth-solo">
        <div className="tu-form" role="status">
          {emailResult === null && <h1>Confirming…</h1>}
          {emailResult === "ok" && (
            <>
              <h1>Email confirmed ✓</h1>
              <p className="tu-lead">
                Your email address is verified. Welcome to Tusome Online!
              </p>
              <Link className="tu-submit tu-submit--brand tu-submit--link" to="/login">
                Continue to login
              </Link>
            </>
          )}
          {emailResult === "fail" && (
            <>
              <h1>Link expired</h1>
              <p className="tu-lead">
                This verification link is invalid or has expired. Log in and
                request a new one from your portal.
              </p>
              <Link className="tu-submit tu-submit--brand tu-submit--link" to="/login">
                Back to login
              </Link>
            </>
          )}
        </div>
      </main>
    );
  }

  // ---- Mode 2 rendering: post-registration ----
  if (!user?.email && !user?.phone) return null;

  return (
    <main className="auth-solo">
      <div className="tu-form">
        <h1>Confirm it's you</h1>
        <p className="tu-lead">One quick step to secure your new account.</p>

        {notice && <div className="tu-ok" role="status">{notice}</div>}

        {user.email && (
          <div className="verify-block">
            <h2>📬 Check your email</h2>
            <p>
              We sent a confirmation link to <strong>{user.email}</strong>.
              You can keep using Tusome while you wait.
            </p>
            <button type="button" className="link-btn" onClick={() => resend("email")}>
              Resend email
            </button>
          </div>
        )}

        {user.phone && !otpDone && (
          <form className="verify-block" onSubmit={submitOtp} noValidate>
            <h2>📱 Enter your SMS code</h2>
            <p>
              We sent a 6-digit code to <strong>{user.phone}</strong>.
            </p>
            <div className={`tu-field${error ? " tu-field--error" : ""}`}>
              <label htmlFor="otp">Verification code</label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="e.g. 482913"
                value={code}
                onChange={(e) => setCode(e.target.value)}
              />
              {error && <p className="tu-field-msg" role="alert">{error}</p>}
            </div>
            <button className="tu-submit tu-submit--brand" type="submit" disabled={loading}>
              {loading ? "Checking…" : "Verify phone"}
            </button>
            <button type="button" className="link-btn" onClick={() => resend("phone")}>
              Resend code
            </button>
          </form>
        )}

        {user.phone && otpDone && (
          <div className="verify-block" role="status">
            <h2>✅ Phone verified</h2>
            <p>Your phone number is confirmed.</p>
          </div>
        )}

        <button type="button" className="tu-submit tu-submit--ghost" onClick={continueOn}>
          Continue to my portal →
        </button>
      </div>
    </main>
  );
}
