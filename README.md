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
  - Weights study hours toward nearer exams, lower internal marks, and remaining syllabus volume.
  - Respects the daily study hours cap (default 4h, configurable in Settings).
  - Automatically reserves the final 1–2 days before each exam for revision and past-paper mock drills.

