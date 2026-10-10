
import { useEffect, useState } from "react";
import EmergencyContacts from "./EmergencyContacts";
import EmergencyMap from "./EmergencyMap";
import "./App.css";

// const API = "http://127.0.0.1:8000";

// const API = import.meta.env.VITE_API_URL;

const API = "http://192.168.29.242:8000";

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

  async function loadReports() {
    try {
      const response = await fetch(`${API}/reports`);
      if (!response.ok) throw new Error("Could not load reports");
      setReports(await response.json());
    } catch {
      setMessage("Backend unavailable. Check the backend terminal.");
    }
  }

  useEffect(() => {
    loadReports();
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

    <button onClick={() => changePage("admin")}>
      Staff Dashboard →
    </button>

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

      <footer>
        ✳BIT Shield · Student safety through responsible innovation
      </footer>
    </div>
  );
}

export default App;