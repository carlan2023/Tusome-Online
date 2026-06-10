import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { clearAuth, getStoredUser, PORTAL_LABELS, PORTAL_ROUTES } from "../config/api";

export default function Portal({ role }) {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const stored = getStoredUser();
    if (!stored?.email) {
      navigate("/login", { replace: true });
      return;
    }
    if (stored.role !== role) {
      navigate(PORTAL_ROUTES[stored.role] || "/dashboard", { replace: true });
      return;
    }
    setUser(stored);
  }, [role, navigate]);

  function handleLogout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  if (!user) return null;

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
