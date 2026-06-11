import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authFetch, clearAuth, getStoredUser } from "../config/api";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [user] = useState(getStoredUser);
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadData = useCallback(async () => {
    try {
      const [statsRes, usersRes, appsRes] = await Promise.all([
        authFetch("/admin/stats/"),
        authFetch("/admin/users/"),
        authFetch("/admin/applications/?status=pending"),
      ]);
      if (!statsRes.ok || !usersRes.ok || !appsRes.ok) {
        setError("Could not load dashboard data. Are you signed in as an admin?");
        return;
      }
      setStats(await statsRes.json());
      setUsers(await usersRes.json());
      setApplications(await appsRes.json());
      setError("");
    } catch {
      setError("Could not reach the server. Please try again.");
    }
  }, []);

  useEffect(() => {
    if (!user?.email || user.role !== "admin") {
      navigate("/login", { replace: true });
      return;
    }
    // Data fetch on mount: state updates happen after awaits, not synchronously.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadData();
  }, [user, navigate, loadData]);

  async function decide(id, decision) {
    setBusyId(id);
    try {
      const res = await authFetch(`/admin/applications/${id}/${decision}/`, {
        method: "POST",
      });
      if (res.ok) await loadData();
    } finally {
      setBusyId(null);
    }
  }

  function handleLogout() {
    clearAuth();
    navigate("/login", { replace: true });
  }

  if (!user?.email || user.role !== "admin") return null;

  const firstName = (user.full_name || "Admin").split(" ")[0];

  return (
    <div className="ad-shell">
      <aside className="ad-sidebar">
        <Link className="ad-brand" to="/">Tusome Online</Link>
        <span className="ad-brand-sub">Admin Console</span>
        <nav className="ad-nav" aria-label="Admin navigation">
          <a className="is-active" href="#overview">Dashboard</a>
          <a href="#approvals">Approvals</a>
          <a href="#users">Users</a>
        </nav>
        <button className="ad-logout" type="button" onClick={handleLogout}>
          Log out
        </button>
      </aside>

      <main className="ad-main" id="overview">
        <header className="ad-header">
          <div>
            <h1>Good morning, {firstName}.</h1>
            <p>Here's a live overview of the platform.</p>
          </div>
        </header>

        {error && <div className="ad-error" role="alert">{error}</div>}

        <section className="ad-stats" aria-label="Platform statistics">
          <article className="ad-stat">
            <span>Total Users</span>
            <strong>{stats ? stats.total_users : "—"}</strong>
            <small>{stats ? `+${stats.new_this_week} this week` : ""}</small>
          </article>
          <article className="ad-stat">
            <span>Students</span>
            <strong>{stats ? stats.students : "—"}</strong>
          </article>
          <article className="ad-stat">
            <span>Consultants</span>
            <strong>{stats ? stats.consultants : "—"}</strong>
            <small>{stats ? `${stats.verified_consultants} verified` : ""}</small>
          </article>
          <article className="ad-stat ad-stat--accent">
            <span>Pending Approvals</span>
            <strong>{stats ? stats.pending_applications : "—"}</strong>
          </article>
        </section>

        <section className="ad-panel" id="approvals" aria-labelledby="approvals-title">
          <div className="ad-panel-head">
            <h2 id="approvals-title">Pending Approvals</h2>
            {stats?.pending_applications > 0 && (
              <span className="ad-badge">{stats.pending_applications} urgent</span>
            )}
          </div>
          {applications.length === 0 ? (
            <p className="ad-empty">No applications waiting for review. 🎉</p>
          ) : (
            <ul className="ad-approvals">
              {applications.map((app) => (
                <li key={app.id}>
                  <div className="ad-applicant">
                    <strong>{app.full_name || app.email}</strong>
                    <span>{app.email}</span>
                    <span className="ad-docs">
                      <a href={app.id_document} target="_blank" rel="noreferrer">ID document</a>
                      {" · "}
                      <a href={app.certificate} target="_blank" rel="noreferrer">Certificate</a>
                      {" · ref: "}{app.reference_name}
                    </span>
                  </div>
                  <div className="ad-actions">
                    <button
                      type="button"
                      className="ad-approve"
                      disabled={busyId === app.id}
                      onClick={() => decide(app.id, "approve")}
                    >
                      Approve
                    </button>
                    <button
                      type="button"
                      className="ad-reject"
                      disabled={busyId === app.id}
                      onClick={() => decide(app.id, "reject")}
                    >
                      Reject
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="ad-panel" id="users" aria-labelledby="users-title">
          <div className="ad-panel-head">
            <h2 id="users-title">Registered Users</h2>
            <span className="ad-muted">{users.length} total</span>
          </div>
          <div className="ad-table-wrap">
            <table className="ad-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id}>
                    <td>{u.full_name || "—"}</td>
                    <td>{u.email}</td>
                    <td><span className={`ad-role ad-role--${u.role}`}>{u.role}</span></td>
                    <td>
                      {u.role === "consultant"
                        ? (u.is_verified ? "Verified ✓" : "Unverified")
                        : (u.is_active ? "Active" : "Disabled")}
                    </td>
                    <td>{new Date(u.date_joined).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
