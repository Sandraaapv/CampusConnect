import React, { useState } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import { navigate } from '../../utils/navigation';
import {
  Search,
  Bell,
  Sun,
  Moon,
  ArrowRight,
  Check,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const [markedOS, setMarkedOS] = useState(false);
  const notifications = db.getNotifications();
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <PortalLayout currentPath="/dashboard">
      <div className="space-y-6 max-w-6xl mx-auto">
        {/* =========================================================================
            TOP HEADER (GOOD MORNING, AARAV)
            ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-black uppercase tracking-wider text-neutral-500 dark:text-neutral-400 font-mono">
              MONDAY, 12 OCT · COMPUTER SCIENCE
            </p>
            <h1 className="font-montserrat font-black text-2xl sm:text-4xl tracking-tight text-[var(--app-text)] mt-1 flex items-baseline gap-2">
              <span>GOOD MORNING,</span>
              <span className="relative inline-block">
                AARAV
                <svg
                  className="absolute left-0 -bottom-1.5 w-full h-2 text-[#f5b800]"
                  viewBox="0 0 100 12"
                  preserveAspectRatio="none"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                >
                  <path d="M0,6 Q12.5,0 25,6 T50,6 T75,6 T100,6" />
                </svg>
              </span>
            </h1>
          </div>

          {/* Top Right Actions: Search, Bell, Theme Toggle */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => navigate('/circulars')}
              className="px-4 py-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-neutral-500 dark:text-neutral-400 hover:text-[var(--app-text)] text-xs font-bold flex items-center gap-2 cursor-pointer shadow-2xs"
            >
              <Search className="w-3.5 h-3.5" />
              <span>Search</span>
            </button>

            <button
              type="button"
              onClick={() => navigate('/notifications')}
              className="relative p-2.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)] transition cursor-pointer"
              aria-label="Notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#ff8fa3]" />
              )}
            </button>

            <button
              type="button"
              onClick={toggleTheme}
              className="p-2.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)] transition cursor-pointer"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* =========================================================================
            HERO CARD: NEEDS YOU FIRST (ATTEND 1 MORE CLASS)
            ========================================================================= */}
        <div className="rounded-[28px] bg-black text-white p-6 sm:p-10 border border-neutral-800 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-8">
          <div className="space-y-4 max-w-xl z-10 text-left">
            <div className="flex items-center gap-2 text-[11px] font-black tracking-widest uppercase text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-[#ff8fa3]" />
              <span>NEEDS YOU FIRST</span>
            </div>

            <h2 className="font-montserrat font-black text-2xl sm:text-4xl lg:text-5xl tracking-tight leading-[1.05] uppercase">
              ATTEND <span className="text-[#ff8fa3]">1 MORE CLASS</span> IN COMPUTER NETWORKS.
            </h2>

            <p className="text-xs sm:text-sm text-neutral-400 font-medium leading-relaxed max-w-lg">
              You're at 74.4%, just under the 75% line. Today's 2:00 PM lecture takes you back to exactly 75.0%.
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate('/attendance')}
                className="px-6 py-3 rounded-full bg-white text-black font-extrabold text-xs flex items-center gap-2 cursor-pointer hover:bg-neutral-200 transition shadow-xs"
              >
                <span>Open calculator</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                onClick={() => navigate('/attendance')}
                className="px-6 py-3 rounded-full border border-neutral-700 text-neutral-300 font-extrabold text-xs hover:border-neutral-500 hover:text-white transition cursor-pointer"
              >
                See recovery plan
              </button>
            </div>
          </div>

          {/* Right Circular Gauge & Safe Skips */}
          <div className="flex items-center gap-6 sm:gap-8 shrink-0 z-10">
            {/* Pink Progress Ring */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-neutral-800"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="42"
                  className="stroke-[#ff8fa3]"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={263.89}
                  strokeDashoffset={263.89 * (1 - 0.744)}
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-montserrat font-black text-2xl tracking-tight text-white">
                  74.4%
                </span>
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider font-bold">
                  CN · 29 OF 39
                </span>
              </div>
            </div>

            {/* Skips list */}
            <div className="space-y-3 text-left">
              <div>
                <span className="font-montserrat font-black text-2xl text-white block leading-none">
                  5
                </span>
                <span className="text-[11px] text-neutral-400 font-medium">
                  safe skips in DSA
                </span>
              </div>
              <div>
                <span className="font-montserrat font-black text-2xl text-white block leading-none">
                  3
                </span>
                <span className="text-[11px] text-neutral-400 font-medium">
                  safe skips in OS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            METRICS GRID (3 CARDS)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Overall Attendance */}
          <div className="p-6 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">
              OVERALL ATTENDANCE
            </span>
            <div className="font-montserrat font-black text-4xl text-[var(--app-text)] tracking-tight">
              86.2%
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              5 of 6 subjects above 75%
            </p>
          </div>

          {/* Card 2: Attendance Streak */}
          <div className="p-6 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex flex-col justify-between space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">
                ATTENDANCE STREAK
              </span>
              <span className="text-[10px] font-bold text-neutral-400">
                3 days to Streak Master
              </span>
            </div>

            <div className="flex items-baseline gap-2">
              <span className="font-montserrat font-black text-4xl text-[var(--app-text)] tracking-tight">
                18
              </span>
              <span className="text-xs text-neutral-500 font-bold">days</span>
            </div>

            {/* Streak Pills: T, W, T, F, S, S, M */}
            <div className="flex items-center gap-1.5 pt-1">
              {[
                { day: 'T', active: true },
                { day: 'W', active: true },
                { day: 'T', active: true },
                { day: 'F', active: true },
                { day: 'S', active: true },
                { day: 'S', active: true },
                { day: 'M', active: false },
              ].map((item, idx) => (
                <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                  <div
                    className={`h-2 w-full rounded-full ${
                      item.active
                        ? 'bg-[#f5b800]'
                        : 'border border-neutral-300 dark:border-neutral-700 bg-transparent'
                    }`}
                  />
                  <span className="text-[9px] font-bold text-neutral-400">{item.day}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Card 3: Projected CGPA */}
          <div className="p-6 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-2">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">
              PROJECTED CGPA
            </span>
            <div className="font-montserrat font-black text-4xl text-[var(--app-text)] tracking-tight">
              8.42
            </div>
            <p className="text-xs text-neutral-500 font-medium">
              Target 8.5 · needs 74+ in DBMS end-sem
            </p>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM GRID: TODAY (LEFT 2/3) + DUE SOON / EXAMS / CIRCULARS (RIGHT 1/3)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2/3): TODAY TIMETABLE */}
          <div className="lg:col-span-2 p-6 sm:p-7 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-6">
            <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-4">
              <h3 className="font-montserrat font-black text-base text-[var(--app-text)] tracking-tight uppercase">
                TODAY
              </h3>
              <span className="text-xs text-neutral-400 font-mono font-bold">
                4 periods · 1 done
              </span>
            </div>

            <div className="space-y-4">
              {/* Period 1: DSA */}
              <div className="flex items-center justify-between py-3 border-b border-[var(--app-border)]">
                <div className="flex items-center gap-6">
                  <span className="font-mono text-xs font-bold text-neutral-400 w-12">
                    09:00
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-[var(--app-text)]">
                      Data Structures & Algorithms
                    </h4>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      CS3601 · LH-201
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-[#00c98d]">
                  Attended
                </span>
              </div>

              {/* Period 2: OS (NOW) */}
              <div className="flex items-center justify-between py-3 border-b border-[var(--app-border)]">
                <div className="flex items-center gap-6">
                  <span className="font-mono text-xs font-bold text-neutral-400 w-12">
                    10:15
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-[var(--app-text)]">
                        Operating Systems
                      </h4>
                      <span className="px-1.5 py-0.5 rounded bg-[#f5b800] text-black font-black text-[9px] uppercase tracking-wider">
                        NOW
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      CS3602 · LH-201
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setMarkedOS(!markedOS)}
                  className={`px-4 py-2 rounded-full text-xs font-extrabold transition cursor-pointer shadow-xs ${
                    markedOS
                      ? 'bg-[#00c98d] text-black font-black flex items-center gap-1.5'
                      : 'bg-black text-white dark:bg-white dark:text-black hover:opacity-90'
                  }`}
                >
                  {markedOS ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Marked</span>
                    </>
                  ) : (
                    'Mark present'
                  )}
                </button>
              </div>

              {/* Period 3: DBMS */}
              <div className="flex items-center justify-between py-3 border-b border-[var(--app-border)]">
                <div className="flex items-center gap-6">
                  <span className="font-mono text-xs font-bold text-neutral-400 w-12">
                    11:30
                  </span>
                  <div>
                    <h4 className="font-extrabold text-sm text-[var(--app-text)]">
                      Database Management Systems
                    </h4>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      CS3603 · Lab-3
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-neutral-400">
                  Next
                </span>
              </div>

              {/* Period 4: CN (DON'T MISS) */}
              <div className="flex items-center justify-between py-3">
                <div className="flex items-center gap-6">
                  <span className="font-mono text-xs font-bold text-neutral-400 w-12">
                    14:00
                  </span>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-[var(--app-text)]">
                        Computer Networks
                      </h4>
                      <span className="px-2 py-0.5 rounded-full bg-[#ff8fa3]/20 text-[#ff8fa3] font-black text-[9px] uppercase tracking-wider border border-[#ff8fa3]/30">
                        DON'T MISS
                      </span>
                    </div>
                    <p className="text-xs text-neutral-400 font-mono mt-0.5">
                      CS3604 · LH-204
                    </p>
                  </div>
                </div>

                <span className="text-xs font-bold text-neutral-400">
                  Later
                </span>
              </div>
            </div>
          </div>

          {/* Right Column (1/3): DUE SOON + EXAMS + CIRCULARS */}
          <div className="space-y-4">
            {/* 1. DUE SOON Card */}
            <div className="p-6 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-4">
              <h3 className="font-montserrat font-black text-sm text-[var(--app-text)] tracking-tight uppercase">
                DUE SOON
              </h3>

              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="font-extrabold text-xs text-[var(--app-text)] leading-snug">
                      B+ Tree Indexing & Query Optimization Quiz
                    </h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      DBMS
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#ff8fa3]/15 text-[#ff8fa3] font-black text-[10px] font-mono shrink-0">
                    28h
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3 pt-2 border-t border-[var(--app-border)]">
                  <div>
                    <h4 className="font-extrabold text-xs text-[var(--app-text)] leading-snug">
                      Wireshark Packet Analysis Lab Report
                    </h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5">
                      Computer Networks
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#ff8fa3]/15 text-[#ff8fa3] font-black text-[10px] font-mono shrink-0">
                    28h
                  </span>
                </div>
              </div>
            </div>

            {/* 2. EXAMS Card */}
            <div className="p-6 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-montserrat font-black text-sm text-[var(--app-text)] tracking-tight uppercase">
                  EXAMS
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/exams')}
                  className="text-xs font-bold text-[var(--app-text)] hover:underline cursor-pointer"
                >
                  Study plan
                </button>
              </div>

              <div className="space-y-3">
                {/* OS */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-[var(--app-text)]">Operating Systems</span>
                    <span className="font-mono text-neutral-500 font-black">12d</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-black dark:bg-white w-[62%]" />
                  </div>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    62% of syllabus covered
                  </p>
                </div>

                {/* DBMS */}
                <div className="space-y-1.5 pt-2 border-t border-[var(--app-border)]">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-[var(--app-text)]">Database Management</span>
                    <span className="font-mono text-neutral-500 font-black">15d</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-black dark:bg-white w-[41%]" />
                  </div>
                  <p className="text-[10px] text-neutral-400 font-medium">
                    41% covered · weakest, gets more hours
                  </p>
                </div>
              </div>
            </div>

            {/* 3. CIRCULARS Card */}
            <div className="p-6 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-montserrat font-black text-sm text-[var(--app-text)] tracking-tight uppercase">
                  CIRCULARS
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/circulars')}
                  className="text-xs font-bold text-[var(--app-text)] hover:underline cursor-pointer"
                >
                  View all
                </button>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <span className="w-2 h-2 rounded-full bg-[#ff8fa3] mt-1.5 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-xs text-[var(--app-text)] leading-snug">
                      Mid-semester timetable released
                    </h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                      Exam cell · 2h ago
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 pt-2 border-t border-[var(--app-border)]">
                  <span className="w-2 h-2 rounded-full bg-neutral-400 mt-1.5 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-xs text-[var(--app-text)] leading-snug">
                      Hackathon registrations close Friday
                    </h4>
                    <p className="text-[10px] text-neutral-400 mt-0.5 font-mono">
                      Student council · Yesterday
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};
