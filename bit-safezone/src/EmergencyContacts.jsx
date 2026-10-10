import React from "react";

const contacts = [
  {
    icon: "🛡️",
    title: "Campus Security",
    subtitle: "For immediate campus safety assistance",
    number: "",
    buttonText: "Call Security",
  },
  {
    icon: "👮",
    title: "Police",
    subtitle: "For police assistance",
    number: "",
    buttonText: "Call Police",
  },
  {
    icon: "🏥",
    title: "Nearest Hospital",
    subtitle: "For medical emergencies",
    number: "",
    buttonText: "Call Hospital",
  },
  {
    icon: "🚑",
    title: "Ambulance",
    subtitle: "For medical transport",
    number: "",
    buttonText: "Call Ambulance",
  },
  {
    icon: "🚨",
    title: "National Emergency",
    subtitle: "India emergency response number",
    number: "112",
    buttonText: "Call 112",
  },
];

const veterinaryContacts = [
  {
    icon: "🐕",
    title: "Animal Emergency — 1962",
    subtitle: "Mobile Veterinary Unit • Dhanbad",
    number: "1962",
    buttonText: "Call 1962",
  },
  {
    icon: "👨‍⚕️",
    title: "Veterinary Doctor — Sindri",
    subtitle: "Dr. A.K.S. Munda • Touring Veterinary Officer",
    number: "7544806853",
    buttonText: "Call Doctor",
  },
  {
    icon: "📞",
    title: "Veterinary Telemedicine",
    subtitle: "Jharkhand Animal Husbandry Department",
    number: "18003097711",
    buttonText: "Call Telemedicine",
  },
];

const campusContacts = [
  {
    icon: "🔥",
    title: "Fire Emergency",
    tag: "FIRE SAFETY",
    subtitle: "For fire-related emergencies on campus",
    number: "112",
    buttonText: "Call 112",
    type: "fire",
  },
  {
    icon: "🏥",
    title: "Campus Healthcare Centre",
    tag: "MEDICAL SUPPORT",
    subtitle: "BIT Sindri campus healthcare facility",
    number: "",
    buttonText: "Call Healthcare",
    type: "health",
  },
  {
    icon: "🛡️",
    title: "Main Gate Security Post",
    tag: "CAMPUS SECURITY",
    subtitle: "For immediate assistance at the main gate",
    number: "",
    buttonText: "Call Security",
    type: "security",
  },
  {
    icon: "🏠",
    title: "Hostel Security / Warden",
    tag: "HOSTEL SAFETY",
    subtitle: "General Warden — Prof. (Dr.) R. K. Verma",
    number: "9835594340",
    buttonText: "Call Warden",
    type: "hostel",
  },
  {
    icon: "👩‍💼",
    title: "Women's Safety / ICC",
    tag: "WOMEN'S SAFETY",
    subtitle: "Institute-level women's safety support",
    number: "",
    buttonText: "Call Safety Contact",
    type: "women",
  },
  {
    icon: "☎️",
    title: "BIT Sindri Main Office",
    tag: "INSTITUTE CONTACT",
    subtitle: "General institute contact",
    number: "03262350495",
    buttonText: "Call BIT Sindri",
    type: "office",
  },
];

function ContactCard({ contact }) {
  return (
    <div className="contact-card">

      <div className="contact-icon">
        {contact.icon}
      </div>

      <div className="contact-info">

        <h3>{contact.title}</h3>

        <p>{contact.subtitle}</p>

        {contact.number ? (
          <a
            className="contact-number"
            href={`tel:${contact.number}`}
          >
            📞 {contact.number}
          </a>
        ) : (
          <span className="contact-number unavailable">
            Number to be verified
          </span>
        )}

      </div>

      {contact.number && (
        <a
          className="call-button"
          href={`tel:${contact.number}`}
        >
          {contact.buttonText}
        </a>
      )}

    </div>
  );
}

function CampusContactCard({ contact }) {
  return (
    <div className={`campus-contact-card ${contact.type}`}>

      <div className="campus-contact-icon">
        {contact.icon}
      </div>

      <div className="campus-contact-content">

        <span className="campus-contact-tag">
          {contact.tag}
        </span>

        <h3>{contact.title}</h3>

        <p>{contact.subtitle}</p>

        {contact.number ? (
          <a
            href={`tel:${contact.number}`}
            className="campus-call-button"
          >
            📞 {contact.buttonText}
          </a>
        ) : (
          <span className="campus-number-warning">
            ⚠️ Number to be verified
          </span>
        )}

      </div>

    </div>
  );
}

export default function EmergencyContacts() {
  return (
    <section className="emergency-contacts">

      {/* ========================= */}
      {/* GENERAL EMERGENCY CONTACTS */}
      {/* ========================= */}

      <div className="contacts-section">

        <div className="section-heading">

          <span className="section-label">
            EMERGENCY SUPPORT
          </span>

          <h2>
            Emergency Contacts
          </h2>

          <p>
            Quickly access emergency services for campus incidents.
          </p>

        </div>

        <div className="contacts-grid">

          {contacts.map((contact, index) => (
            <ContactCard
              key={index}
              contact={contact}
            />
          ))}

        </div>

      </div>


      {/* ========================= */}
      {/* VETERINARY SECTION */}
      {/* ========================= */}

      <div className="contacts-section veterinary-section">

        <div className="section-heading">

          <span className="section-label">
            🐾 ANIMAL SAFETY
          </span>

          <h2>
            Veterinary & Animal Emergency
          </h2>

          <p>
            Quick assistance for injured or potentially dangerous
            animals around campus.
          </p>

        </div>

        <div className="rabies-alert">

          <strong>
            ⚠️ Suspected animal bite or scratch?
          </strong>

          <span>
            If a person has been bitten or scratched, seek human
            medical care promptly. Veterinary contacts are for
            animal-related assistance.
          </span>

        </div>

        <div className="contacts-grid">

          {veterinaryContacts.map((contact, index) => (
            <ContactCard
              key={index}
              contact={contact}
            />
          ))}

        </div>

      </div>


      {/* ========================= */}
      {/* NEW CAMPUS SAFETY SECTION */}
      {/* ========================= */}

      <div className="contacts-section campus-safety-section">

        <div className="section-heading">

          <span className="section-label">
            🏫 CAMPUS SAFETY
          </span>

          <h2>
            Quick Campus Assistance
          </h2>

          <p>
            Important safety and support contacts available
            for BIT Sindri students.
          </p>

        </div>

        <div className="campus-contact-grid">

          {campusContacts.map((contact, index) => (
            <CampusContactCard
              key={index}
              contact={contact}
            />
          ))}

        </div>

        <div className="campus-contact-note">

          <strong>
            📌 Contact Verification
          </strong>

          <p>
            Dedicated phone numbers for the campus healthcare centre,
            main-gate security and women's safety should be verified
            with BIT Sindri administration.
             {/* before real-world deployment. */}
          </p>

        </div>

      </div>


      {/* ========================= */}
      {/* SAFETY NOTICE */}
      {/* ========================= */}

      <div className="emergency-notice">

        {/* <strong>
          Important:
        </strong> */}

        {/* <p>
          BIT Shield is a hackathon prototype and does not
          automatically dispatch emergency services. In an
          immediate emergency, contact the appropriate verified
          emergency service directly.
        </p> */}

      </div>

    </section>
  );
}