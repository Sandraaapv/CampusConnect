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

## Project Structure

```
CampusConnect/
├── public/
│   └── mascots/                     # 10 Puppet mascot PNG assets
├── src/
│   ├── components/
│   │   ├── icons/
│   │   │   └── FeatureIcons.tsx     # 10 Custom hand-drawn inline SVGs
│   │   ├── mockups/
│   │   │   ├── LaptopMockup.tsx     # Reusable laptop frame with glare & camera
│   │   │   └── PhoneMockup.tsx      # Reusable phone chassis with dynamic island
│   │   ├── previews/
│   │   │   ├── DashboardPreview.tsx # Scene 2: Urgent feed & timetable
│   │   │   ├── AttendancePreview.tsx# Scene 3: Bunk Bank what-if slider
│   │   │   ├── CgpaPreview.tsx      # Scene 4: CGPA predictor & countdowns
│   │   │   ├── CircularsPreview.tsx # Scene 5: Filtered circulars & notes
│   │   │   ├── RequestPreview.tsx   # Scene 6: Multi-step approval & stamp
│   │   │   ├── StreaksPreview.tsx   # Scene 7: 18-day streak & badge grid
│   │   │   ├── IdCardPreview.tsx    # Scene 8: Glossy ID card & QR code
│   │   │   └── WrappedPreview.tsx   # Scene 9: Semester Wrapped story slides
│   │   └── Scene.tsx                # Scene component with 50/50 split layout
│   ├── data/
│   │   └── scenes.ts                # Scene metadata, copy, and icons
│   ├── hooks/
│   │   └── useScrollScenes.ts       # GSAP ScrollTrigger timeline & scrub logic
│   ├── App.tsx                      # Top progress bar, fixed header & pinned stage
│   ├── index.css                    # Tailwind CSS v4 & custom typography rules
│   └── main.tsx                     # React application entry point
├── package.json
├── vite.config.ts
└── README.md
```
