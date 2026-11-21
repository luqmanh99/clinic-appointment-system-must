// Shared data & helpers for the Clinic Appointment System
const DOCTORS = [
  {
    id: "dr-aina",
    name: "Dr. Aina Yusuf",
    specialty: "General Medicine",
    experience: "9 years",
    fee: "RM 60",
    schedule: "Mon–Fri, 9:00 AM – 4:00 PM",
    image: "images/doctors/draina.jpg",
    bio: "Primary care physician focused on preventive health, acute illnesses, and chronic disease management."
  },
   {
    id: "dr-ahmad",
    name: "Dr. Ali Ahmad",
    specialty: "General Medicine",
    experience: "21 years",
    fee: "RM 60",
    schedule: "Tue–St, 1:00 PM – 6:00 PM",
    image: "images/doctors/drahmad.jpg",
    bio: "Expert in preventive care and focusing in medical checkup, health screening ad vaccinations."
  },
  {
    id: "dr-raj",
    name: "Dr. Kurubaran Raj",
    specialty: "Pediatrics",
    experience: "11 years",
    fee: "RM 75",
    schedule: "Mon–Sat, 10:00 AM – 5:00 PM",
    image: "images/doctors/drraj.jpg",
    bio: "Dedicated to infant, child, and adolescent wellness checkups, vaccinations, and family guidance."
  },
  {
    id: "dr-tan",
    name: "Dr. Sarah Tan",
    specialty: "Dermatology",
    experience: "7 years",
    fee: "RM 95",
    schedule: "Tue–Sat, 9:30 AM – 4:30 PM",
    image: "images/doctors/drtan.jpg",
    bio: "Specializes in skin conditions, allergy assessments, acne care, and routine dermatological screenings."
  },
  {
    id: "dr-farid",
    name: "Dr. Farid Hakim",
    specialty: "Orthopedics",
    experience: "12 years",
    fee: "RM 100",
    schedule: "Mon, Wed, Fri, 1:00 PM – 6:00 PM",
    image: "images/doctors/drfarid.jpg",
    bio: "Focuses on joint pain, sports injuries, posture rehabilitation, and musculoskeletal care."
  },
   {
    id: "dr-lim",
    name: "Dr. Melvin Lim",
    specialty: "Orthopedics",
    experience: "20 years",
    fee: "RM 100",
    schedule: "Tuesday, Thursday, Saturday, 9:00 PM – 4:00 PM",
    image: "images/doctors/drlim.jpg",
    bio: "Focuses on broken bone, bone tumors, posture joint and neck pain."
  },

];

const STORAGE_KEY = "EveryDay_appointments_v1";

function getAppointments() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

function saveAppointments(list) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
}

// For mobile navigation menu 
document.addEventListener("DOMContentLoaded", () => {
  const toggleBtn = document.getElementById("navToggle");
  const navLinks = document.getElementById("navLinks");

  if (toggleBtn && navLinks) {
    toggleBtn.addEventListener("click", () => {
      const isOpen = navLinks.classList.toggle("open");
      toggleBtn.setAttribute("aria-expanded", String(isOpen));
    });
  }

  initDoctorsPage();
  initAppointmentPage();
  initContactPage();
});

// For Doctors Directory (doctors.html)
function initDoctorsPage() {
  const listEl = document.getElementById("doctorsList");
  const searchInput = document.getElementById("doctorSearch");
  const specialtySelect = document.getElementById("specialtyFilter");
  const countEl = document.getElementById("resultCount");

  if (!listEl) return;

  function renderDoctors() {
    const query = (searchInput?.value || "").trim().toLowerCase();
    const specialty = specialtySelect?.value || "all";

    const filtered = DOCTORS.filter((doc) => {
      const matchesSpec = specialty === "all" || doc.specialty === specialty;
      const matchesText =
        doc.name.toLowerCase().includes(query) ||
        doc.specialty.toLowerCase().includes(query) ||
        doc.bio.toLowerCase().includes(query);
      return matchesSpec && matchesText;
    });

    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} of ${DOCTORS.length} specialists`;
    }

    if (filtered.length === 0) {
      listEl.innerHTML = `<div class="card"><p>No matching doctors found. Try clearing your search or filter.</p></div>`;
      return;
    }

      listEl.innerHTML = filtered
      .map(
        (doc) => `
        <article class="card">
          <div>
            <img
              class="doctor-img"
              src="${escapeHtml(doc.image)}"
              alt="Portrait of ${escapeHtml(doc.name)}, ${escapeHtml(doc.specialty)}"
              onerror="this.style.display='none'"
            />
            <span class="badge">${escapeHtml(doc.specialty)}</span>
            <h2 style="margin-top: 0.6rem; font-size: 1.25rem;">${escapeHtml(doc.name)}</h2>
            <p style="color: var(--muted); font-size: 0.92rem; margin: 0.4rem 0 0.75rem;">${escapeHtml(doc.bio)}</p>
            <p style="font-size: 0.88rem;"><strong>Hours:</strong> ${escapeHtml(doc.schedule)}</p>
            <p style="font-size: 0.88rem;"><strong>Consultation:</strong> ${escapeHtml(doc.fee)} (${escapeHtml(doc.experience)} exp.)</p>
          </div>
          <a class="btn btn-primary" href="appointment.html?doctor=${encodeURIComponent(doc.id)}">Book Appointment</a>
        </article>
      `
      )
      .join("");
  }

  searchInput?.addEventListener("input", renderDoctors);
  specialtySelect?.addEventListener("change", renderDoctors);
  renderDoctors();
}

// For Appointment Booking & LocalStorage Table (appointment.html)
function initAppointmentPage() {
  const form = document.getElementById("appointmentForm");
  const tableBody = document.getElementById("appointmentsBody");
  const doctorSelect = document.getElementById("doctorSelect");
  const dateInput = document.getElementById("apptDate");
  const feedbackEl = document.getElementById("bookingFeedback");

  if (!form) return;

  // dropdown
  if (doctorSelect) {
    doctorSelect.innerHTML =
      `<option value="">-- Select a Doctor --</option>` +
      DOCTORS.map(
        (d) => `<option value="${d.name} (${d.specialty})">${d.name} — ${d.specialty} (${d.fee})</option>`
      ).join("");

    // Pre-select doctor from URL query (?doctor=dr-lim)
    const params = new URLSearchParams(window.location.search);
    const docParam = params.get("doctor");
    if (docParam) {
      const matched = DOCTORS.find((d) => d.id === docParam);
      if (matched) {
        doctorSelect.value = `${matched.name} (${matched.specialty})`;
      }
    }
  }

  // Prevent selecting past dates
  if (dateInput) {
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;
  }

  function renderAppointments() {
    if (!tableBody) return;
    const list = getAppointments();
    if (list.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="6" style="text-align:center; color: var(--muted);">No appointments booked yet.</td></tr>`;
      return;
    }

    tableBody.innerHTML = list
      .map(
        (item, index) => `
        <tr>
          <td>${escapeHtml(item.patientName)}</td>
          <td>${escapeHtml(item.phone)}</td>
          <td>${escapeHtml(item.doctor)}</td>
          <td>${escapeHtml(item.date)} at ${escapeHtml(item.time)}</td>
          <td>${escapeHtml(item.reason || "General consultation")}</td>
          <td><button class="btn btn-danger" type="button" data-cancel="${index}">Cancel</button></td>
        </tr>
      `
      )
      .join("");

    tableBody.querySelectorAll("[data-cancel]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const idx = Number(btn.getAttribute("data-cancel"));
        const updated = getAppointments().filter((_, i) => i !== idx);
        saveAppointments(updated);
        renderAppointments();
      });
    });
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors(form);
    if (feedbackEl) feedbackEl.innerHTML = "";

    const patientName = document.getElementById("patientName").value.trim();
    const email = document.getElementById("patientEmail").value.trim();
    const phone = document.getElementById("patientPhone").value.trim();
    const doctor = doctorSelect.value;
    const date = dateInput.value;
    const time = document.getElementById("apptTime").value;
    const reason = document.getElementById("apptReason").value.trim();

    let valid = true;

    if (patientName.length < 2) {
      setError("nameError", "Please enter the patient's full name (at least 2 characters).");
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("emailError", "Please enter a valid email address.");
      valid = false;
    }
    if (!/^[0-9+\-\s()]{8,15}$/.test(phone)) {
      setError("phoneError", "Please enter a valid phone number (8–15 digits).");
      valid = false;
    }
    if (!doctor) {
      setError("doctorError", "Please choose a doctor.");
      valid = false;
    }
    if (!date) {
      setError("dateError", "Please select an appointment date.");
      valid = false;
    }
    if (!time) {
      setError("timeError", "Please select a preferred time slot.");
      valid = false;
    }

    if (!valid) return;

    const current = getAppointments();
    current.push({ patientName, email, phone, doctor, date, time, reason });
    saveAppointments(current);

    form.reset();
    if (feedbackEl) {
      feedbackEl.innerHTML = `<div class="alert-success">Appointment confirmed for <strong>${escapeHtml(patientName)}</strong> with <strong>${escapeHtml(doctor)}</strong> on <strong>${escapeHtml(date)}</strong> at <strong>${escapeHtml(time)}</strong>.</div>`;
    }
    renderAppointments();
  });

  renderAppointments();
}

// Contact Form Validation (contact.html)
function initContactPage() {
  const form = document.getElementById("contactForm");
  const feedbackEl = document.getElementById("contactFeedback");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    clearErrors(form);
    if (feedbackEl) feedbackEl.innerHTML = "";

    const name = document.getElementById("contactName").value.trim();
    const email = document.getElementById("contactEmail").value.trim();
    const message = document.getElementById("contactMessage").value.trim();

    let valid = true;
    if (name.length < 2) {
      setError("contactNameError", "Please enter your name.");
      valid = false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {  // regax implemenattion
      setError("contactEmailError", "Please enter a valid email address.");
      valid = false;
    }
    if (message.length < 10) {
      setError("contactMessageError", "Please write a message of at least 10 characters.");
      valid = false;
    }

    if (!valid) return;

    form.reset();
    if (feedbackEl) {
      feedbackEl.innerHTML = `<div class="alert-success">Thank you, <strong>${escapeHtml(name)}</strong>. Your inquiry has been received and our front desk will respond soon.</div>`;
    }
  });
}

function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function clearErrors(container) {
  container.querySelectorAll(".error-msg").forEach((el) => (el.textContent = ""));
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}