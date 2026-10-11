# CampusConnect — Scroll-Driven Landing Page

A scroll-driven landing page for **CampusConnect**, a unified college student portal. Built with **React 19**, **Vite**, **TypeScript**, **GSAP ScrollTrigger**, and **Tailwind CSS**.

---

## Features & Highlights

- **10 Full-Screen Scenes**: Smooth pinned stage scrubbed through GSAP ScrollTrigger (100vh per feature).
- **Hero Puppet Mascot**: High-impact bottom-anchored mascot (90vh on desktop, 36vh on mobile) with seamless `mix-blend-mode: multiply` against the `#f5f5f3` off-white background.
- **Alternating 50/50 Split**: Mascot faces inwards toward the text on desktop, and stacks gracefully on mobile with zero horizontal scroll.
- **Hand-Drawn Inline SVG Icons**: 10 custom inline SVGs featuring 2.8px black comic ink strokes and vibrant flat fills.
- **Nunito 900 Typography**: Ultra-thick rounded headings, styled taglines with emphasized italics, and muted `#4a4a4a` descriptions.
- **Realistic Device Previews**:
  - **Scene 2 (Laptop)**: Smart urgent feed ranked by priority (Red / Amber / Blue) with today's timetable.
  - **Scene 3 (Phone)**: Attendance "Bunk Bank" with interactive what-if slider and 75% policy recovery formulas.
  - **Scene 4 (Laptop)**: CGPA target slider computing required end-sem marks (`end-sem = 2 * (target * 10 - internal)`), flagging "Not reachable" above 100, plus exam countdown bars.
  - **Scene 5 (Laptop)**: Real-time searchable circulars with department filter chips (CSE, ECE, Exam Cell, Hostel) and upvoted study notes.
  - **Scene 6 (Laptop)**: 4-step approval timeline (`Submitted` → `Faculty Review` → `Admin Approval` → `Certificate Ready`) that turns green step-by-step with an animated **APPROVED** stamp.
  - **Scene 7 (Phone)**: 18-day streak flame counter, weekly attendance checkmarks, and badge grid (Perfect Week, Comeback Kid, Early Bird, Streak Master).
  - **Scene 8 (Phone)**: Holographic digital student ID card with QR code and mascot photo.
  - **Scene 9 (Phone)**: Auto-cycling story slides (Best Subject, Longest Streak, Most Improved).
  - **Scene 10 (Centered)**: Open-arms mascot with role login buttons for Students, Faculty, and Admin.
- **Accessibility & Motion Control**: Keyboard arrow navigation, `prefers-reduced-motion` detection, descriptive alt texts, and aria labels.

---

## Mascot Images Location

The puppet mascot images are located in the `public/mascots/` directory:

```
public/
└── mascots/
    ├── 01-welcome.png
    ├── 02-Smart_dashboard.png
    ├── 03-Attendance_calculator.png
    ├── 04-CGPA_predictor_and_exams.png
    ├── 05-Circulars_and_notes.png
    ├── 06-Request_tracker.png
    ├── 07-Streaks_and_badges.png
    ├── 08-Digital_ID_card.png
    ├── 09-Semester_Wrapped.png
    └── 10-Login_call_to_action.png
```

> If updating or replacing any mascots, save high-resolution PNGs with an off-white or transparent background into `public/mascots/` matching the filenames above.

---

## Getting Started

### 1. Prerequisites
- **Node.js** v18+ (tested on Node v22)
- **npm** v9+

### 2. Installation
Clone or navigate to the project directory and install dependencies:

```bash
npm install
```

### 3. Run Development Server
Start the Vite local development server:

```bash
npm run dev
```

Open your browser at `http://localhost:5173/`.

### 4. Build for Production
To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```

---

## Student Portal Architecture & College Records Layer

CampusConnect features a complete **Student Portal** (behind the "Sign in" flow) designed strictly for students with zero faculty or admin write access:

### 1. Official College Records Layer (`src/services/collegeRecords.ts`)
- **Single Source of Truth**: All subjects, timetable schedules, official historical attendance records, internal assessment scores, credits, grading schemes, and exam timetables originate from the college records layer (synced from the college ERP or Student Information System in production).
- **Read-Only Guarantee**: The student role and client UI have zero write path to official attendance, marks, credits, or exam timetables. Direct student write endpoints (such as `POST /attendance` or `POST /marks`) are rejected.
- **Attendance Discrepancy Reporting**: Students can report attendance discrepancies via "Report a mismatch" on each subject card, which creates an official "Attendance correction" application in the paperless Approvals tracker.
- **On-Duty (OD) Leave**: When an authorized OD letter is approved through the multi-stage administrative workflow, OD days are officially credited to the student's attendance records.

### 2. Configurable College Assessment Scheme & Totals Guarantee
- **Internal Assessment Scheme**:
  - Internal 1: Max 25
  - Internal 2: Max 25
  - Assignment / Quiz: Max 10
  - **College Formula**: `((Internal 1 + Internal 2) / 50 * 40) + Assignment` = **Max 50**.
  - **Guarantee**: Total internal score is strictly capped at its maximum of 50 (never displaying invalid totals like 56.5/50).
- **End-Semester Weighting**: Weighted 50% internals and 50% end-semester exam.
- **Needed End-Sem Marks**: Real-time calculation across all credits for the minimum marks (out of 100) needed to achieve the student's target CGPA. Subjects where required marks exceed 100 are flagged as impossible, offering one-click realignment to the best achievable CGPA.
- **What-If Simulation**: A dedicated per-subject simulation field (`What-if, not recorded`) allows hypothetical forecasting without altering official records.

### 3. Dynamic Syllabus-Weighted Study Planner (`/exams`)
- **College Syllabus Units**: Each official subject contains unit titles and estimated study hours from college records.
- **Student Progress**: Students tick units they have covered; progress is saved in local storage.
- **Automated Day-by-Day Plan**:
  - Dynamically builds a 7-day schedule allocating uncovered units across days before each exam.
  - Generates distinct units on different days (no repeating identical task blocks).
### 4. Five New Student Portal Sections

1. **Timetable (`/timetable`)**:
   - Official weekly grid (Monday–Saturday) with period rows and room/faculty allocations from college records.
   - Highlights today's column and current period with a "Now" marker.
   - Free slots show duration and link to study planner tasks.
   - View switch (Week | Day), with Day view default on mobile.
   - Class changes (Cancelled, Rescheduled, Room changed) highlighted with badges and synced to Dashboard Today card.
   - Download `.ics` calendar export for external device calendars.

2. **Fees (`/fees`)**:
   - Semester summary card (total fee, paid, balance due, due date, status chip: Paid, Due soon, Overdue).
   - Accounts clearance in the No-dues tracker automatically reflects fee status (blocked if balance > 0).
   - Payment history table with downloadable verified receipt PDFs featuring verification QR code pointing to `/receipts/verify/:token`.
   - **Payment Note**: No real payments are processed directly in CampusConnect. When a college portal URL is configured, students can click "Pay on the college portal" to complete transactions externally.

3. **Faculty Directory (`/faculty`)**:
   - Two tabs: "My faculty" (current teachers with subject chips) and "All faculty".
   - Debounced search (name, subject, specialization, cabin) and department filtering with clear-filter actions.
   - Real-time "Available now" indicator using local timezone based on weekly office hours.
   - Contact via official college email (`mailto:` and copy button) with zero personal phone numbers. Detail drawer displays full office hours schedules.

4. **Course Feedback (`/feedback`)**:
   - Structured 1-to-5 rating questions and optional comment with character limit.
   - **Anonymity by Design**: Responses are stored strictly without any `student_id`. A separate, non-joinable submission receipt (`student_id`, `form_id`, `submitted_at`) is maintained purely to prevent duplicate submissions and track portal completion tasks.
   - Pre-submission review dialog ensures deliberate, final feedback.

5. **Helpdesk (`/helpdesk`)**:
   - Student issue and query ticketing across categories (Wi-Fi/Network, Hostel Maintenance, Library, Transport, Admin) distinct from formal Approvals.
   - Supports up to 3 image attachments (validated for image types and 5MB size limits).
   - Real-time resolution timeline (`Open` → `Assigned` → `In progress` → `Resolved` → `Closed`) and comment thread.
   - Rate-limited to 5 ticket submissions per day per authenticated student.
   - **Simulated Support**: Automated background technician dispatch simulates assignment and progress updates with canned field remarks for realistic end-to-end demonstration.

---

## End-to-End Student Authentication (React + Spring Boot + MySQL)

CampusConnect features a complete, production-grade **Student-Only Authentication and Security Architecture** complying with institutional privacy standards:

### 1. Architecture & Security Highlights

- **Student-Only Role Enforcement**: Role parameters sent by the client are strictly ignored; every account is hardcoded as a student.
- **In-Memory JWT Access Tokens**: Access tokens (15-minute lifetime) are held strictly in memory and are never persisted in `localStorage` or `sessionStorage`.
- **Rotating Refresh Tokens & Reuse Detection**: Refresh tokens (7 days standard, or 30 days with "Keep me signed in") are stored in `httpOnly`, `SameSite=Lax` cookies. If an old token in a family is replayed, the entire token family is immediately revoked.
- **Captcha on Login Only**: Captcha verification is applied strictly to `/login` to thwart credential-stuffing attacks without adding unnecessary friction to registration or password recovery.
- **New 3-Step Registration Flow (`/register`)**:
  1. *Step 1: Find your record*:
     - Single input: **Register number** (e.g. `21CSC105`, trimmed and uppercased).
     - Looks up official `student_records` and delivers a 6-digit OTP to the college email on record. Students are never prompted to type their email or institutional domain.
     - Uniform response shape and timing (~200ms) for known and unknown register numbers: *"If this register number is eligible, we sent a code to the college email on record."* Account existence is not revealed at Step 1 to prevent enumeration.
  2. *Step 2: Verify*:
     - 6-digit OTP input with paste support, auto-advance, and `autocomplete="one-time-code"`.
     - 10-minute expiry, 5 attempts, single-use, 60-second resend cooldown, daily email cap, and SHA-256 hashed database storage.
     - If an account already exists, rejects after verification: *"An account already exists. Sign in instead."*
     - If eligible, displays read-only official details (**"Is this you?"**: Student Name, Register Number, Department, Semester) with *"Yes, continue"* and *"Not me"* buttons.
  3. *Step 3: Create your password*:
     - Password and confirmation inputs with live strength meter and password policy enforcement.
     - *"I accept the Terms of Service and Privacy Notice"* checkbox positioned immediately above the *"Create account"* button.
     - Provisions account with strictly student role (client-supplied roles ignored), marks email verified, sends welcome email, and signs student in.
- **Abuse Protection**: Rate limits code requests per register number (5/hr) and per IP (20/hr) with generic *"Too many requests, try again later."* Daily cap of 5 emails per address.
- **Login Field Flexibility**: Field label is *"Register number or college ID"*. An optional `VITE_LOGIN_ID_SUFFIX` configuration renders a non-editable suffix badge (e.g., NetID domain) and defaults to empty.

---

### 2. Demo & Test Data

The system is pre-seeded with realistic student records using the reserved `campus.test` domain:

| Student Register Number | Name | Email | Status / Purpose |
|---|---|---|---|
| **`21CS042`** | Arjun Verma | `student.demo@campus.test` | **Pre-registered Demo Account** (Password: `StudentDemo@2026!`). Use for instant demo sign in. |
| **`21CSC105`** | Ananya Sen | `ananya.sen@campus.test` | **Unregistered Eligible Record**. Use to test the 3-step registration flow. Code visible in Mailpit / server logs. |
| **`99XYZ999`** | — | — | **Non-existent Register Number**. Used to test neutral Step 1 response without email dispatch. |

---

### 3. Environment Variables

| Variable | Default | Purpose |
|---|---|---|
| `VITE_ENABLE_DEMO` | `true` | Enables 1-click demo sign in for registered student `21CS042` |
| `VITE_LOGIN_ID_SUFFIX` | `""` | Optional non-editable suffix pill shown inside the login input (default empty) |
| `VITE_COLLEGE_EMAIL_DOMAIN` | `campus.test` | Institutional reserved test domain |
| `VITE_BACKEND_URL` | `http://localhost:8080` | Spring Boot REST API base URL |
| `COLLEGE_EMAIL_DOMAIN` | `campus.test` | Backend institutional domain |
| `SPRING_DATASOURCE_URL` | `jdbc:mysql://localhost:3306/campusconnect...` | MySQL connection string (H2 used in test slice) |
| `SPRING_DATASOURCE_USERNAME` | `campusconnect` | MySQL database user |
| `SPRING_DATASOURCE_PASSWORD` | `campusconnect_secret` | MySQL database password |
| `SPRING_MAIL_HOST` | `localhost` | Mailpit / SMTP host (default: `1025`) |
| `SPRING_MAIL_PORT` | `1025` | Mailpit SMTP port |
| `JWT_SECRET` | *(256-bit key)* | HMAC-SHA256 signature key |

---

### 4. Running Locally & In Docker

To run MySQL, Mailpit, and the Spring Boot backend locally in Docker:

```bash
# 1. Start MySQL (port 3306), Mailpit (SMTP 1025, Web UI 8025), and Spring Boot (port 8080)
docker compose up -d

# 2. Inspect student OTP emails in Mailpit
# URL: http://localhost:8025/

# 3. Start the React frontend dev server
npm run dev
```

---

### 5. Running Tests

```bash
# Frontend Unit & Integration Tests (Vitest - 49 tests)
npm test

# Backend Spring Boot Integration Tests (Maven - 9 tests)
cd backend && ./mvnw test
```
