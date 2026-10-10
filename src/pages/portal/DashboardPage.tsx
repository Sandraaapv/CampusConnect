import React, { useMemo } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { navigate } from '../../utils/navigation';
import { db } from '../../services/db';
import {
  ArrowRight,
  LifeBuoy,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const user = db.getUser();
  const data = useMemo(() => db.getDashboardData(), []);

  const todaySlots = data.todaySlots;
  const changedSlots = data.changedSlots;

  return (
    <PortalLayout currentPath="/dashboard">
      <div className="space-y-4 sm:space-y-5 max-w-5xl mx-auto">
        {/* =========================================================================
            TOP HEADER (GOOD MORNING, USER)
            ========================================================================= */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">
              MONDAY · SEMESTER {user.semester} · {user.department.toUpperCase()}
            </p>
            <h1 className="font-montserrat font-black text-xl sm:text-2xl lg:text-3xl tracking-tight text-[var(--app-text)] mt-0.5 flex items-baseline gap-2">
              <span>GOOD MORNING,</span>
              <span className="relative inline-block">
                {user.name.split(' ')[0].toUpperCase()}
                <svg
                  className="absolute left-0 -bottom-1 w-full h-1.5 text-[#f5b800]"
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
        </div>

        {/* =========================================================================
            HERO CARD: NEEDS YOU FIRST (STRICT URGENCY ORDER 1-6)
            Light mode: Light black bg (#222226), Ivory text (#f5f4f2), Light pink highlight (#ff8fa3)
            Dark mode: Ivory bg (#f5f4f2), Light black text (#222226), Darker pink highlight (#d6336c)
            ========================================================================= */}
        <div className="rounded-2xl bg-[#222226] dark:bg-[#f5f4f2] text-[#f5f4f2] dark:text-[#222226] p-5 sm:p-6 lg:p-7 border border-[#323238] dark:border-neutral-300 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 transition-colors duration-200">
          <div className="space-y-2.5 max-w-lg z-10 text-left">
            <div className="flex items-center gap-2 text-[10px] font-black tracking-widest uppercase text-neutral-400 dark:text-neutral-600">
              <span className="w-2 h-2 rounded-full bg-[#ff8fa3] dark:bg-[#d6336c]" />
              <span>NEEDS YOU FIRST</span>
            </div>

            <h2 className="font-montserrat font-black text-xl sm:text-2xl lg:text-3xl tracking-tight leading-[1.1] uppercase">
              {data.urgentHero.title}{' '}
              <span className="text-[#ff8fa3] dark:text-[#d6336c]">{data.urgentHero.highlight}</span>.
            </h2>

            <p className="text-xs text-neutral-300 dark:text-neutral-600 font-medium leading-relaxed max-w-md">
              {data.urgentHero.description}
            </p>

            <div className="flex flex-wrap items-center gap-2.5 pt-1">
              <button
                type="button"
                onClick={() => navigate(data.urgentHero.actionPath)}
                className="px-4 py-2 rounded-full bg-[#f5f4f2] dark:bg-[#222226] text-[#222226] dark:text-[#f5f4f2] font-extrabold text-xs flex items-center gap-1.5 cursor-pointer hover:bg-white dark:hover:bg-neutral-800 transition shadow-xs"
              >
                <span>{data.urgentHero.actionText}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Right Circular Gauge & Attendance stats */}
          <div className="flex items-center gap-5 sm:gap-6 shrink-0 z-10">
            {/* Progress Ring */}
            <div className="relative w-28 h-28 flex items-center justify-center">
              <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-[#333339] dark:stroke-neutral-300"
                  strokeWidth="8"
                  fill="transparent"
                />
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  className="stroke-[#ff8fa3] dark:stroke-[#d6336c]"
                  strokeWidth="8"
                  fill="transparent"
                  strokeDasharray={251.3}
                  strokeDashoffset={251.3 * (1 - 0.744)}
                  strokeLinecap="round"
                />
              </svg>

              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="font-montserrat font-black text-lg sm:text-xl tracking-tight text-[#f5f4f2] dark:text-[#222226] leading-none">
                  74.4%
                </span>
                <span className="text-[9px] font-mono text-neutral-400 dark:text-neutral-500 uppercase tracking-wider font-bold mt-1">
                  CN · 29 OF 39
                </span>
              </div>
            </div>

            {/* Skips list */}
            <div className="space-y-2 text-left">
              <div>
                <span className="font-montserrat font-black text-xl text-[#f5f4f2] dark:text-[#222226] block leading-none">
                  5
                </span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-600 font-medium">
                  safe skips in DSA
                </span>
              </div>
              <div>
                <span className="font-montserrat font-black text-xl text-[#f5f4f2] dark:text-[#222226] block leading-none">
                  3
                </span>
                <span className="text-[10px] text-neutral-400 dark:text-neutral-600 font-medium">
                  safe skips in OS
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SECTION 7: PENDING STRIP (FEEDBACK FORMS & OPEN HELPDESK TICKETS)
            ========================================================================= */}
        {(data.pendingFeedbackCount > 0 || data.openHelpdeskCount > 0) && (
          <div className="p-3 sm:p-4 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-xs flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex flex-wrap items-center gap-4">
              {data.pendingFeedbackCount > 0 && (
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#ff8fa3] animate-pulse" />
                  <span className="font-bold text-[var(--app-text)]">
                    {data.pendingFeedbackCount} course feedback {data.pendingFeedbackCount === 1 ? 'form' : 'forms'} pending
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono">closes in 48h</span>
                </div>
              )}
              {data.openHelpdeskCount > 0 && (
                <div className="flex items-center gap-2 border-l border-[var(--app-border)] pl-4">
                  <LifeBuoy className="w-3.5 h-3.5 text-blue-500" />
                  <span className="font-bold text-[var(--app-text)]">
                    {data.openHelpdeskCount} active support {data.openHelpdeskCount === 1 ? 'ticket' : 'tickets'}
                  </span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {data.pendingFeedbackCount > 0 && (
                <button
                  type="button"
                  onClick={() => navigate('/feedback')}
                  className="px-3 py-1.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-[11px] hover:opacity-90 transition"
                >
                  Fill feedback
                </button>
              )}
              {data.openHelpdeskCount > 0 && (
                <button
                  type="button"
                  onClick={() => navigate('/helpdesk')}
                  className="px-3 py-1.5 rounded-full border border-[var(--app-border)] text-[var(--app-text)] font-extrabold text-[11px] hover:bg-[var(--app-surface-subtle)] transition"
                >
                  Track tickets
                </button>
              )}
            </div>
          </div>
        )}

        {/* =========================================================================
            METRICS GRID (3 CARDS - COMPACT)
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
          {/* Card 1: Overall Attendance */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">
              OVERALL ATTENDANCE
            </span>
            <div className="font-montserrat font-black text-2xl sm:text-3xl text-[var(--app-text)] tracking-tight">
              86.2%
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              5 of 6 subjects above 75%
            </p>
          </div>

          {/* Card 2: Attendance Streak */}
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex flex-col justify-between space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">
                ATTENDANCE STREAK
              </span>
              <span className="text-[10px] font-bold text-neutral-400">
                3 days to Streak Master
              </span>
            </div>

            <div className="flex items-baseline gap-1.5">
              <span className="font-montserrat font-black text-2xl sm:text-3xl text-[var(--app-text)] tracking-tight">
                18
              </span>
              <span className="text-xs text-neutral-500 font-bold">days</span>
            </div>

            {/* Streak Pills */}
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
                <div key={idx} className="flex-1 flex flex-col items-center gap-0.5">
                  <div
                    className={`h-1.5 w-full rounded-full ${
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
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-1.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-neutral-400 font-mono">
              PROJECTED CGPA
            </span>
            <div className="font-montserrat font-black text-2xl sm:text-3xl text-[var(--app-text)] tracking-tight">
              8.42
            </div>
            <p className="text-[11px] text-neutral-500 font-medium">
              Target 8.5 · needs 74+ in DBMS end-sem
            </p>
          </div>
        </div>

        {/* =========================================================================
            BOTTOM GRID: TODAY (LEFT 2/3) + DUE SOON / EXAMS / CIRCULARS (RIGHT 1/3)
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
          {/* Left Column (2/3): TODAY TIMETABLE */}
          <div className="lg:col-span-2 p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-4">
            <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-3">
              <div className="flex items-center gap-2">
                <h3 className="font-montserrat font-black text-sm text-[var(--app-text)] tracking-tight uppercase">
                  TODAY'S SCHEDULE
                </h3>
                {changedSlots.length > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px] font-black">
                    {changedSlots.length} update
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => navigate('/timetable')}
                className="text-xs text-neutral-400 hover:text-[var(--app-text)] font-mono font-bold"
              >
                Full timetable →
              </button>
            </div>

            <div className="space-y-2.5">
              {todaySlots.map((slot) => {
                const isNow = slot.period === 2; // Period 2 is current demo period
                const isPast = slot.period < 2;

                return (
                  <div
                    key={slot.id}
                    className="flex items-center justify-between py-2 border-b border-[var(--app-border)] last:border-b-0"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-mono text-xs font-bold text-neutral-400 w-12 shrink-0">
                        {slot.startTime}
                      </span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-extrabold text-xs sm:text-sm text-[var(--app-text)]">
                            {slot.subjectName}
                          </h4>
                          {isNow && (
                            <span className="px-1.5 py-0.5 rounded bg-[#f5b800] text-black font-black text-[9px] uppercase tracking-wider">
                              NOW
                            </span>
                          )}
                          {slot.change && (
                            <span
                              className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider border ${
                                slot.change.type === 'Cancelled'
                                  ? 'bg-rose-500/15 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                  : slot.change.type === 'Rescheduled'
                                  ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                  : 'bg-blue-500/15 text-blue-600 dark:text-blue-400 border-blue-500/30'
                              }`}
                            >
                              {slot.change.type}
                              {slot.change.newRoom ? ` (${slot.change.newRoom})` : ''}
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-neutral-400 font-mono mt-0.5">
                          {slot.subjectCode} · {slot.change?.newRoom || slot.room} · {slot.facultyName}
                        </p>
                      </div>
                    </div>

                    <div>
                      {slot.change?.type === 'Cancelled' ? (
                        <span className="text-xs font-bold text-rose-500 font-mono">Cancelled</span>
                      ) : isPast ? (
                        <span className="text-xs font-bold text-[#00c98d]">Attended</span>
                      ) : isNow ? (
                        <span className="px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 font-extrabold text-[11px] border border-amber-500/20">
                          In session
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-[var(--app-surface-subtle)] text-[var(--app-text-muted)] font-bold text-[10.5px] border border-[var(--app-border)]">
                          Upcoming
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column (1/3): DUE SOON + EXAMS + CIRCULARS */}
          <div className="space-y-3.5">
            {/* 1. DUE SOON Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-3">
              <h3 className="font-montserrat font-black text-xs text-[var(--app-text)] tracking-tight uppercase">
                DUE SOON
              </h3>

              <div className="space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-extrabold text-xs text-[var(--app-text)] leading-snug">
                      B+ Tree Indexing & Query Optimization Quiz
                    </h4>
                    <p className="text-[10px] text-neutral-400">
                      DBMS
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#ff8fa3]/15 text-[#ff8fa3] font-black text-[10px] font-mono shrink-0">
                    28h
                  </span>
                </div>

                <div className="flex items-start justify-between gap-2 pt-2 border-t border-[var(--app-border)]">
                  <div>
                    <h4 className="font-extrabold text-xs text-[var(--app-text)] leading-snug">
                      Wireshark Packet Analysis Lab Report
                    </h4>
                    <p className="text-[10px] text-neutral-400">
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
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-montserrat font-black text-xs text-[var(--app-text)] tracking-tight uppercase">
                  EXAMS
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/exams')}
                  className="text-[11px] font-bold text-[var(--app-text)] hover:underline cursor-pointer"
                >
                  Study plan
                </button>
              </div>

              <div className="space-y-2.5">
                {/* OS */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-[var(--app-text)]">Operating Systems</span>
                    <span className="font-mono text-neutral-500 font-black">12d</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-black dark:bg-white w-[62%]" />
                  </div>
                  <p className="text-[9px] text-neutral-400 font-medium">
                    62% of syllabus covered
                  </p>
                </div>

                {/* DBMS */}
                <div className="space-y-1 pt-2 border-t border-[var(--app-border)]">
                  <div className="flex items-center justify-between text-xs font-extrabold">
                    <span className="text-[var(--app-text)]">Database Management</span>
                    <span className="font-mono text-neutral-500 font-black">15d</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-neutral-200 dark:bg-neutral-800 overflow-hidden">
                    <div className="h-full bg-black dark:bg-white w-[41%]" />
                  </div>
                  <p className="text-[9px] text-neutral-400 font-medium">
                    41% covered · weakest, gets more hours
                  </p>
                </div>
              </div>
            </div>

            {/* 3. CIRCULARS Card */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="font-montserrat font-black text-xs text-[var(--app-text)] tracking-tight uppercase">
                  CIRCULARS
                </h3>
                <button
                  type="button"
                  onClick={() => navigate('/circulars')}
                  className="text-[11px] font-bold text-[var(--app-text)] hover:underline cursor-pointer"
                >
                  View all
                </button>
              </div>

              <div className="space-y-2.5">
                <div className="flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#ff8fa3] mt-1 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-xs text-[var(--app-text)] leading-snug">
                      Mid-semester timetable released
                    </h4>
                    <p className="text-[9px] text-neutral-400 font-mono">
                      Exam cell · 2h ago
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2 pt-2 border-t border-[var(--app-border)]">
                  <span className="w-1.5 h-1.5 rounded-full bg-neutral-400 mt-1 shrink-0" />
                  <div>
                    <h4 className="font-extrabold text-xs text-[var(--app-text)] leading-snug">
                      Hackathon registrations close Friday
                    </h4>
                    <p className="text-[9px] text-neutral-400 font-mono">
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
