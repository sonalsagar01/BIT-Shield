
import { useEffect, useState } from "react";
import EmergencyContacts from "./EmergencyContacts";
import EmergencyMap from "./EmergencyMap";
import "./App.css";

const TRUSTED_CONTACT_KEY = "bit-shield-trusted-contact";
const CAMPUS_SECURITY_NUMBER = "0101010101";

function sanitizePhoneNumber(value) {
  return String(value ?? "").replace(/[\s()-]/g, "");
}

function readTrustedContacts() {
  try {
    const saved = JSON.parse(localStorage.getItem(TRUSTED_CONTACT_KEY) || "null");
    const contacts = Array.isArray(saved) ? saved : saved ? [saved] : [];

    return contacts
      .slice(0, 3)
      .filter((contact) => contact && typeof contact.name === "string" && typeof contact.phone === "string")
      .map((contact) => ({
        name: contact.name.trim(),
        phone: sanitizePhoneNumber(contact.phone),
      }))
      .filter((contact) => contact.name && /^\+?\d{7,15}$/.test(contact.phone));
  } catch {
    return [];
  }
}

const API = import.meta.env.VITE_API_URL
  || (import.meta.env.DEV ? "http://127.0.0.1:8000" : "https://bit-shield-1.onrender.com");

const emptyForm = {
  category: "Unsafe Location",
  location: "",
  description: "",
  contact: "",
};

function App() {
  const [page, setPage] = useState("home");
  const [form, setForm] = useState(emptyForm);
  const [reports, setReports] = useState([]);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [trustedContacts, setTrustedContacts] = useState(readTrustedContacts);
  const [trustedContactDrafts, setTrustedContactDrafts] = useState(() => {
    const saved = readTrustedContacts();
    return Array.from({ length: 3 }, (_, index) => saved[index] || { name: "", phone: "" });
  });
  const [sosActive, setSosActive] = useState(false);
  const primaryTrustedContact = trustedContacts[0];
  const sosHref = primaryTrustedContact
    ? `tel:${primaryTrustedContact.phone}`
    : `tel:${CAMPUS_SECURITY_NUMBER}`;

  function saveTrustedContact(event) {
    event.preventDefault();
    const contacts = [];

    for (const [index, draft] of trustedContactDrafts.entries()) {
      const name = draft.name.trim();
      const phone = sanitizePhoneNumber(draft.phone);

      if (!name && !phone) continue;
      if (!name || !/^\+?\d{7,15}$/.test(phone)) {
        setMessage(`Complete both fields for trusted contact ${index + 1}, or leave both blank.`);
        return;
      }
      contacts.push({ name, phone });
    }

    if (!contacts.length) {
      setMessage("Add at least one trusted contact, or SOS will call Campus Security.");
      return;
    }

    try {
      localStorage.setItem(TRUSTED_CONTACT_KEY, JSON.stringify(contacts));
      setTrustedContacts(contacts);
      setMessage(`${contacts.length} trusted contact${contacts.length === 1 ? "" : "s"} saved on this device.`);
    } catch {
      setMessage("Could not save the trusted contact in this browser.");
    }
  }

  async function loadReports() {
    try {
      const response = await fetch(`${API}/reports`);
      if (!response.ok) throw new Error("Could not load reports.");
      setReports(await response.json());
    } catch (error) {
      setMessage(error.message || "Backend unavailable. Check the backend terminal.");
    }
  }

  useEffect(() => {
    sessionStorage.removeItem("bit-shield-session");
    let active = true;

    fetch(`${API}/reports`)
      .then((response) => {
        if (!response.ok) throw new Error("Could not load reports.");
        return response.json();
      })
      .then((data) => {
        if (active) setReports(data);
      })
      .catch((error) => {
        if (active) setMessage(error.message || "Backend unavailable. Check the backend terminal.");
      });

    return () => {
      active = false;
    };
  }, []);

  function changePage(nextPage) {
    setPage(nextPage);
    setMessage("");

    if (nextPage === "admin") {
      loadReports();
    }
  }

  async function submitReport(event) {
    event.preventDefault();
    setLoading(true);
    setMessage("");

    const payload = {
      ...form,
      latitude: selectedLocation?.lat ?? null,
      longitude: selectedLocation?.lng ?? null,
    };

    try {
      const response = await fetch(`${API}/reports`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          typeof data.detail === "string"
            ? data.detail
            : "Please check the form and try again."
        );
      }

      setForm(emptyForm);
      setSelectedLocation(null);
      setMessage(`Report #${data.id} submitted successfully.`);
      await loadReports();
    } catch (error) {
      setMessage(error.message || "Could not submit report.");
    } finally {
      setLoading(false);
    }
  }

  async function updateStatus(id, status) {
    try {
      const response = await fetch(
        `${API}/reports/${id}?status=${encodeURIComponent(status)}`,
        { method: "PATCH" }
      );

      if (!response.ok) throw new Error("Could not update status");

      await loadReports();
      setMessage(`Report #${id} updated to ${status}.`);
    } catch (error) {
      setMessage(error.message);
    }
  }

  const sosWidget = (
    <aside className="sos-widget">
      {sosActive && (
        <div className="sos-panel" role="status" aria-live="polite">
          <strong>Emergency call opened</strong>
          <p>Confirm the call in your phone app.{primaryTrustedContact ? ` SOS called ${primaryTrustedContact.name}.` : " SOS is calling Campus Security."}</p>
          {trustedContacts.slice(1).map((contact) => <a key={contact.phone} href={`tel:${contact.phone}`}>Call {contact.name}</a>)}
          {primaryTrustedContact && <a href={`tel:${CAMPUS_SECURITY_NUMBER}`}>Call Campus Security</a>}
          <button type="button" className="sos-panel-close" onClick={() => setSosActive(false)} aria-label="Dismiss SOS message">Close</button>
        </div>
      )}
      <a className="sos-button" href={sosHref} onClick={() => setSosActive(true)}
        aria-label={primaryTrustedContact ? `SOS: Call trusted contact ${primaryTrustedContact.name}` : "SOS: Call Campus Security"}>
        {primaryTrustedContact ? "SOS" : "SOS - Security"}
      </a>
    </aside>
  );

  return (
    <div className="app">
      <header className="topbar">
       <button className="brand" onClick={() => changePage("home")}>
  <span className="brand-icon">🛡️
    {/* <img src="/bit_logo.png" alt="BIT Shield Logo" /> */}
  </span>
  <span className="brand-text">
    <strong>BIT Shield</strong>
    <small>Campus Safety</small>
  </span>
</button>

     <nav className="main-nav">

  <button
    className={page === "home" ? "nav-active" : ""}
    onClick={() => changePage("home")}
  >
    🏠 Home
  </button>

  <button
    className={page === "report" ? "nav-active" : ""}
    onClick={() => changePage("report")}
  >
    🚨 Report
  </button>

  <button
    className={page === "map" ? "nav-active" : ""}
    onClick={() => changePage("map")}
  >
    📍 Safety Map
  </button>

  <button
    className={page === "admin" ? "nav-active" : ""}
    onClick={() => changePage("admin")}
  >
    📊 Dashboard
  </button>

</nav>
      </header>

      <main>
      

        {page === "home" && (
          <>
            <section className="hero">
              <div>
                <p className="eyebrow">YOUR CAMPUS. YOUR SAFETY.</p>
                <div className="safety-status">
                <span className="status-dot"></span>
                   CAMPUS SAFETY SYSTEM ACTIVE
                 </div>
                <h1>
                  A safer campus
                  <br />
                  starts with <span>one action.</span>
                </h1>
                <p className="hero-copy">
                  Access emergency resources, report unsafe campus
                  conditions, and help staff track follow-up.
                </p>

       <div className="hero-actions">

  <button
    className="hero-primary"
    onClick={() => changePage("report")}
  >
    🚨 Report a Concern
    <span>→</span>
  </button>

  <button
    className="hero-secondary"
    onClick={() => changePage("map")}
  >
    📍 Open Safety Map
  </button>

</div>
              </div>

<div className="hero-card">

  <div className="urgent-icon">
    🚨
  </div>

  <div className="urgent-status">
    ● EMERGENCY SUPPORT
  </div>

  <h2>Need urgent help?</h2>

  <p>
    Access verified emergency contacts and
    campus safety resources instantly.
  </p>

  <button
    className="urgent-button"
    onClick={() =>
      document
        .getElementById("emergency-contacts")
        ?.scrollIntoView({ behavior: "smooth" })
    }
  >
    View Emergency Contacts →
  </button>

</div>
            </section>

            <div id="emergency-contacts">
              <section className="trusted-contact-setup">
                <p className="eyebrow">SOS SETUP</p>
                <h2>Set up trusted contacts</h2>
                <p>Add up to three trusted people. SOS calls the first saved contact; the others are available as fallback options. If none are saved, SOS calls Campus Security.</p>
                <form className="trusted-contact-form" onSubmit={saveTrustedContact}>
                  {trustedContactDrafts.map((contact, index) => (
                    <fieldset className="trusted-contact-card" key={index}>
                      <legend>Trusted contact {index + 1}{index === 0 ? " - SOS primary" : ""}</legend>
                      <label>Contact name
                        <input maxLength={80} value={contact.name}
                          onChange={(event) => setTrustedContactDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, name: event.target.value } : item))}
                          placeholder="e.g. Alex" />
                      </label>
                      <label>Phone number
                        <input type="tel" maxLength={24} value={contact.phone}
                          onChange={(event) => setTrustedContactDrafts((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, phone: event.target.value } : item))}
                          placeholder="e.g. +91 98765 43210" />
                      </label>
                    </fieldset>
                  ))}
                  <button className="primary" type="submit">Save Trusted Contacts</button>
                </form>
                <p className="small-note">Contacts are stored only in this browser on this device. Tapping SOS opens your phone app to confirm the call.</p>
              </section>
              <EmergencyContacts />
            </div>
            {/* Psychiatrist Section */}
<section className="psychiatrist-section">
  <div className="psychiatrist-icon">🧠</div>

  <div className="psychiatrist-content">
    <p className="eyebrow">MENTAL HEALTH SUPPORT</p>

    <h2>Psychiatrist</h2>

    <p>
      Connect with qualified mental-health support when you need
      someone to talk to about emotional or psychological concerns.
    </p>

   <a
  href="tel:0000000000"
  className="psychiatrist-call-button"
>
  📞 Call Mental Health Support
</a>
  </div>
</section>

            <section className="section">
              <p className="eyebrow">CAMPUS CARE</p>
              <h2>How Shield helps</h2>

             <div className="cards">

             <article className="card feature-card">

             <span className="card-icon">🚨</span>  

             <span className="feature-number">01</span>
 
             <h3>Report an issue</h3>           

    <p>
      Quickly report an unsafe location,
      broken facility, or campus concern.
    </p>

    <button onClick={() => changePage("report")}>
      Create Report →
    </button>

  </article>


  <article className="card feature-card">

    <span className="card-icon">📍</span>

    <span className="feature-number">02</span>

    <h3>Mark a location</h3>

    <p>
      Pin the exact incident location
      using the interactive safety map.
    </p>

    <button onClick={() => changePage("map")}>
      Open Safety Map →
    </button>

  </article>


  <article className="card feature-card">

    <span className="card-icon">📊</span>

    <span className="feature-number">03</span>

    <h3>Track follow-up</h3>

    <p>
      Help authorized staff monitor
      reports from received to resolved.
    </p>

    <button onClick={() => changePage("admin")}>Staff Dashboard →</button>

  </article>

</div>
            </section>
          </>
        )}

        {page === "map" && (
          <>
            <EmergencyMap
              selectedLocation={selectedLocation}
              onSelectLocation={setSelectedLocation}
            />

            <button
              className="primary"
              onClick={() => changePage("report")}
            >
              Report at Selected Location →
            </button>

            <EmergencyContacts />
          </>
        )}

        {page === "report" && (
          <section className="panel">
            <p className="eyebrow">STUDENT SUPPORT</p>
            <h1>Report a campus concern</h1>

            <p className="muted">
              Provide enough information for authorized staff to understand
              the issue. Avoid unnecessary personal details.
            </p>

            {selectedLocation && (
              <div className="selected-location">
                <strong>Incident spot selected on map</strong>
                <p>Latitude: {selectedLocation.lat.toFixed(5)}</p>
                <p>Longitude: {selectedLocation.lng.toFixed(5)}</p>
                <button
                  type="button"
                  className="secondary"
                  onClick={() => changePage("map")}
                >
                  Change location
                </button>
              </div>
            )}

            <form onSubmit={submitReport}>
              <label>
                Incident category
                <select
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                >
                   <option>Unsafe Location</option>
                  <option>Broken / Poor Lighting</option>
                  <option>Harassment / Stalking</option>
                  <option>Medical Emergency</option>
                  <option>Suspicious Activity</option>
                  <option>Fire / Smoke Hazard</option>
                  <option>Electrical Hazard</option>
                  <option>Infrastructure / Physical Hazard</option>
                  <option>Lift / Elevator Issue</option>
                  <option>Security / Access Issue</option>
                  <option>Sanitation / Hygiene Issue</option>
                  <option>Traffic / Parking Safety</option>
                  <option>Emergency Assistance</option>
                  <option>Other</option>
                </select>
              </label>

              <label>
                Campus location
                <input
                  required
                  minLength={2}
                  maxLength={120}
                  placeholder="e.g. Library walkway"
                  value={form.location}
                  onChange={(e) =>
                    setForm({ ...form, location: e.target.value })
                  }
                />
              </label>

              <label>
                Description
                <textarea
                  required
                  minLength={5}
                  maxLength={1000}
                  placeholder="Describe the concern"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                />
              </label>

              <label>
                Contact information (optional)
                <input
                  maxLength={120}
                  placeholder="Only if you want follow-up"
                  value={form.contact}
                  onChange={(e) =>
                    setForm({ ...form, contact: e.target.value })
                  }
                />
              </label>

              <button className="primary" disabled={loading}>
                {loading ? "Submitting..." : "Submit Report"}
              </button>
            </form>

            <p className="small-note">
              This prototype does not automatically notify security,
              police, or medical services.
            </p>
          </section>
        )}

{page === "admin" && (
  <section className="dashboard-page">

    {/* Dashboard Header */}
    <div className="dashboard-header">
      <div>
        <span className="dashboard-label">STAFF CONTROL CENTER</span>
        <h1>Incident Dashboard</h1>
        <p>
          Monitor campus safety reports, review incidents,
          and track their resolution status.
        </p>
      </div>

      <div className="dashboard-live">
        <span className="live-dot"></span>
        SYSTEM ACTIVE
      </div>
    </div>


    {/* Statistics */}
    <div className="dashboard-stats">

      <div className="stat-card total-stat">
        <div className="stat-icon">📋</div>
        <div>
          <span>Total Reports</span>
          <strong>{reports.length}</strong>
        </div>
      </div>

      <div className="stat-card review-stat">
        <div className="stat-icon">🔎</div>
        <div>
          <span>Under Review</span>
          <strong>
            {
              reports.filter(
                (r) => r.status === "Under Review"
              ).length
            }
          </strong>
        </div>
      </div>

      <div className="stat-card resolved-stat">
        <div className="stat-icon">✓</div>
        <div>
          <span>Resolved</span>
          <strong>
            {
              reports.filter(
                (r) => r.status === "Resolved"
              ).length
            }
          </strong>
        </div>
      </div>

    </div>


    {/* Reports */}
    <div className="reports-section">

      <div className="reports-heading">
        <div>
          <span className="dashboard-label">LIVE REPORT FEED</span>
          <h2>Campus Incidents</h2>
        </div>

        <span className="report-count">
          {reports.length} REPORTS
        </span>
      </div>


      {reports.length === 0 ? (

        <div className="dashboard-empty">
          <div className="empty-icon">📭</div>
          <h3>No reports yet</h3>
          <p>
            New campus safety reports will appear here.
          </p>
        </div>

      ) : (

        <div className="dashboard-report-grid">

          {reports.map((report) => (

            <article
              className="dashboard-report-card"
              key={report.id}
            >

              {/* Card top */}
              <div className="report-card-top">

                <span className="report-number">
                  REPORT #{report.id}
                </span>

                <span
                  className={`dashboard-status ${
                    report.status
                      .toLowerCase()
                      .replace(" ", "-")
                  }`}
                >
                  {report.status}
                </span>

              </div>


              {/* Category */}
              <h3>
                {report.category}
              </h3>


              {/* Location */}
              <div className="report-info">

                <div className="info-row">
                  <span className="info-icon">📍</span>

                  <div>
                    <small>LOCATION</small>
                    <p>{report.location}</p>
                  </div>
                </div>


                {/* Description */}
                <div className="info-row">
                  <span className="info-icon">📝</span>

                  <div>
                    <small>DESCRIPTION</small>
                    <p>{report.description}</p>
                  </div>
                </div>


                {/* Time */}
                <div className="info-row">
                  <span className="info-icon">🕒</span>

                  <div>
                    <small>REPORTED</small>
                    <p>
                      {new Date(
                        report.created_at
                      ).toLocaleString()}
                    </p>
                  </div>
                </div>

              </div>


              {/* Map */}
              {report.latitude != null &&
                report.longitude != null && (

                  <a
                    className="incident-map-link"
                    href={`https://www.google.com/maps/search/?api=1&query=${report.latitude},${report.longitude}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    📍 View incident on map →
                  </a>

                )}


              {/* Status */}
              <div className="status-control">

                <label>
                  UPDATE STATUS
                </label>

                <select
                  value={report.status}
                  onChange={(e) =>
                    updateStatus(
                      report.id,
                      e.target.value
                    )
                  }
                >
                  <option>Received</option>
                  <option>Under Review</option>
                  <option>Resolved</option>
                </select>

              </div>

            </article>

          ))}

        </div>

      )}

    </div>

  </section>
)}

        {message && (
          <div className="toast" role="status">
            {message}
          </div>
        )}
      </main>

      {sosWidget}

      <footer>
        ✳BIT Shield · Student safety through responsible innovation
      </footer>
    </div>
  );
}

export default App;
