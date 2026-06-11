import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authFetch, clearAuth, getStoredUser, PORTAL_LABELS, PORTAL_ROUTES } from "../config/api";

const VERIFY_COPY = {
  none: { label: "Not started", cta: "Start verification" },
  pending: { label: "Under review", cta: "View status" },
  approved: { label: "Verified ✓", cta: "View status" },
  rejected: { label: "Not approved", cta: "View details" },
};

export default function Portal({ role }) {
  const navigate = useNavigate();
  // Lazy initializer: read once on mount, no setState-in-effect needed.
  const [user] = useState(getStoredUser);
  const [verifyStatus, setVerifyStatus] = useState(null);
  const wrongPortal = user?.email && user.role !== role;

  useEffect(() => {
    if (!user?.email) {
      navigate("/login", { replace: true });
    } else if (user.role !== role) {
      navigate(PORTAL_ROUTES[user.role] || "/dashboard", { replace: true });
    } else if (role === "consultant") {
      authFetch("/consultant/application/")
        .then((res) => (res.ok ? res.json() : { status: "none" }))
        .then((data) => setVerifyStatus(data.status || "none"))
        .catch(() => setVerifyStatus("none"));
    }
  }, [user, role, navigate]);

  function handleLogout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  if (!user?.email || wrongPortal) return null;

  return (
    <div className="tu-portal">
      <header className="tu-portal-nav">
        <h1>{PORTAL_LABELS[role]}</h1>
        <button type="button" onClick={handleLogout}>Log out</button>
      </header>
      <main className="tu-portal-main">
        <h2>Welcome, {user.full_name || user.email}</h2>
        <p>
          Your {role} portal is ready. Course management, live classes, and progress tracking
          will appear here as those features are built out.
        </p>
        <div className="tu-portal-card">
          <p><strong>Email:</strong> {user.email}</p>
          <p><strong>Role:</strong> {user.role}</p>
        </div>
        <Link className="tu-portal-home" to="/">← Back to home</Link>
      </main>
    </div>
  );
}
