import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { authFetch, getStoredUser } from "../config/api";

const ACCEPT = ".pdf,.png,.jpg,.jpeg";

export default function ConsultantVerify() {
  const navigate = useNavigate();
  const [user] = useState(getStoredUser);
  const [application, setApplication] = useState(null); // null = loading
  const [idDocument, setIdDocument] = useState(null);
  const [certificate, setCertificate] = useState(null);
  const [referenceName, setReferenceName] = useState("");
  const [referenceContact, setReferenceContact] = useState("");
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user?.email || user.role !== "consultant") {
      navigate("/login", { replace: true });
      return;
    }
    authFetch("/consultant/application/")
      .then((res) => (res.ok ? res.json() : { status: "none" }))
      .then(setApplication)
      .catch(() => setApplication({ status: "none" }));
  }, [user, navigate]);

  async function handleSubmit(e) {
    e.preventDefault();
    const next = {};
    if (!idDocument) next.idDocument = "Please attach your government-issued ID.";
    if (!certificate) next.certificate = "Please attach your academic certificate.";
    if (!referenceName.trim()) next.referenceName = "Please name a professional reference.";
    if (!referenceContact.trim()) next.referenceContact = "Please add their email or phone.";
    if (Object.keys(next).length) {
      setErrors(next);
      return;
    }
    setErrors({});
    setLoading(true);
    try {
      const body = new FormData();
      body.append("id_document", idDocument);
      body.append("certificate", certificate);
      body.append("reference_name", referenceName.trim());
      body.append("reference_contact", referenceContact.trim());
      const res = await authFetch("/consultant/application/", { method: "POST", body });
      const data = await res.json();
      if (!res.ok) {
        setErrors({
          general:
            data.detail ||
            data.id_document?.[0] ||
            data.certificate?.[0] ||
            "Submission failed. Please check your files and try again.",
        });
        return;
      }
      setApplication(data);
    } catch {
      setErrors({ general: "Could not reach the server. Please try again." });
    } finally {
      setLoading(false);
    }
  }

  if (!user?.email || user.role !== "consultant") return null;
  if (application === null) return null; // still loading

  // ----- Already submitted: show status screen (Figma: "Application Submitted") -----
  if (application.status && application.status !== "none") {
    const copy = {
      pending: {
        icon: "✓",
        title: "Application Submitted Successfully!",
        body: "Our verification team will review your credentials. You'll be notified once a decision is made.",
      },
      approved: {
        icon: "★",
        title: "You're verified!",
        body: "Your credentials have been approved. Welcome aboard — your consultant tools are unlocked.",
      },
      rejected: {
        icon: "!",
        title: "Application not approved",
        body: "Your submission was reviewed and not approved. Contact support@tusome.online for details.",
      },
    }[application.status];

    return (
      <main className="cv-page">
        <div className="cv-done">
          <span className={`cv-done-icon cv-done-icon--${application.status}`}>{copy.icon}</span>
          <h1>{copy.title}</h1>
          <p>{copy.body}</p>
          <div className="cv-done-meta">
            <div>
              <span>Expected response</span>
              <strong>Within 1 day</strong>
            </div>
            <div>
              <span>Current status</span>
              <strong className={`cv-status cv-status--${application.status}`}>
                {application.status === "pending" ? "Under Review" : application.status}
              </strong>
            </div>
          </div>
          <Link className="btn primary" to="/consultant">
            Go to my portal
          </Link>
        </div>
      </main>
    );
  }

  // ----- Not submitted yet: the verification form -----
  return (
    <main className="cv-page">
      <header className="cv-header">
        <Link className="register-brand" to="/">Tusome Online</Link>
        <span className="cv-step">Consultant Registration · Verification</span>
      </header>

      <form className="cv-card" onSubmit={handleSubmit} noValidate>
        <div className="cv-intro">
          <h1>Identity &amp; Credentials Verification</h1>
          <p>
            To ensure the highest quality of education, we verify every
            consultant's identity and teaching credentials.
          </p>
        </div>

        {errors.general && <div className="register-error" role="alert">{errors.general}</div>}

        <div className="cv-grid">
          <section className="cv-block">
            <h2>Government-Issued ID</h2>
            <p>National ID, passport, or driver's license (PDF, PNG, or JPG — max 5 MB).</p>
            <label className="cv-upload">
              <input
                type="file"
                accept={ACCEPT}
                aria-label="Upload government-issued ID"
                onChange={(e) => setIdDocument(e.target.files[0] || null)}
              />
              <span>{idDocument ? idDocument.name : "Choose file…"}</span>
            </label>
            {errors.idDocument && <span className="field-msg" role="alert">{errors.idDocument}</span>}
          </section>

          <section className="cv-block">
            <h2>Academic Certificates</h2>
            <p>Your highest academic qualification or teaching certification.</p>
            <label className="cv-upload">
              <input
                type="file"
                accept={ACCEPT}
                aria-label="Upload academic certificate"
                onChange={(e) => setCertificate(e.target.files[0] || null)}
              />
              <span>{certificate ? certificate.name : "Choose file…"}</span>
            </label>
            {errors.certificate && <span className="field-msg" role="alert">{errors.certificate}</span>}
          </section>

          <section className="cv-block cv-block--wide">
            <h2>Professional Reference</h2>
            <p>Someone who can vouch for your teaching or professional experience.</p>
            <div className="cv-fields">
              <label>
                Reference name
                <input
                  type="text"
                  placeholder="e.g. Dr. Jane Doe"
                  value={referenceName}
                  onChange={(e) => setReferenceName(e.target.value)}
                />
                {errors.referenceName && <span className="field-msg" role="alert">{errors.referenceName}</span>}
              </label>
              <label>
                Reference contact
                <input
                  type="text"
                  placeholder="email or phone"
                  value={referenceContact}
                  onChange={(e) => setReferenceContact(e.target.value)}
                />
                {errors.referenceContact && <span className="field-msg" role="alert">{errors.referenceContact}</span>}
              </label>
            </div>
          </section>
        </div>

        <div className="cv-footer">
          <p className="cv-note">
            Your documents are reviewed by our verification team only and are
            never shared publicly.
          </p>
          <button className="submit-button cv-submit" type="submit" disabled={loading}>
            {loading ? "Submitting…" : "Submit Application"}
          </button>
        </div>
      </form>
    </main>
  );
}
