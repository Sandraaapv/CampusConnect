import React from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import { navigate } from '../../utils/navigation';
import {
  AlertTriangle,
  Clock,
  Calendar,
  Flame,
  Award,
  ArrowRight,
  TrendingDown,
  Bell,
  Sparkles,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const data = db.getDashboardData();
  const user = db.getUser();
  const timetable = db.getTimetable().filter((t) => t.dayOfWeek === 'Monday'); // Today's schedule
  const isHighRisk = data.atRiskCount > 0;

  return (
    <PortalLayout currentPath="/dashboard" title="Smart Dashboard">
      <div className="space-y-6">
        {/* =========================================================================
            1. "TODAY" ASSISTANT CARD (With Dynamic Mascot Mood)
            ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex flex-col md:flex-row items-start md:items-center justify-between gap-5 relative overflow-hidden">
          <div className="flex items-start sm:items-center gap-4 z-10">
            {/* Mascot State: Worried (03/04) if risk > 0, Happy (01/02) if safe */}
            <div className={`w-16 h-16 sm:w-20 sm:h-20 rounded-2xl shrink-0 p-1 flex items-center justify-center border ${
              isHighRisk ? 'bg-amber-500/10 border-amber-500/20' : 'bg-emerald-500/10 border-emerald-500/20'
            }`}>
              <img
                src={isHighRisk ? '/mascots/03-Attendance calculator.png' : '/mascots/02-Smart dashboard.png'}
                alt="Assistant mascot mood"
                className="w-full h-full object-contain"
              />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider text-[var(--accent-yellow)] flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Today's Briefing
                </span>
                <span className="text-[10px] font-bold text-[var(--app-text-muted)] font-mono">
                  Semester {user.semester} &bull; {user.department}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-[var(--app-text)] mt-1">
                {data.assistantSentence}
              </h2>
              <p className="text-xs text-[var(--app-text-muted)] mt-1">
                Streak: <b className="text-[var(--app-text)]">{data.streak.count} consecutive days</b> full attendance &bull; Next: {data.streak.nextMilestone}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 self-end md:self-center shrink-0 z-10">
            <button
              type="button"
              onClick={() => navigate('/attendance')}
              className="px-4 py-2 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs hover:opacity-90 transition flex items-center gap-1.5 cursor-pointer shadow-2xs whitespace-nowrap"
            >
              <span>Calculate Skips</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. URGENT RISK STRIP (1st Priority: Low Attendance < 75%)
            ========================================================================= */}
        {isHighRisk && (
          <div className="p-4 sm:p-5 rounded-2xl bg-red-500/10 border border-red-500/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-red-500/20 text-red-500 shrink-0">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-wider text-red-600 dark:text-red-400">
                  Attendance Risk Alert ({data.atRiskCount} Subject Below 75%)
                </p>
                <div className="flex flex-wrap items-center gap-3 mt-0.5">
                  {data.urgentAttendance.map((s) => (
                    <span key={s.subject.id} className="text-xs text-[var(--app-text)] font-bold">
                      {s.subject.name} ({s.subject.code}): <b className="text-red-600">{s.currentPercent}%</b> &bull; Need {s.classesNeeded} classes to recover
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/attendance')}
              className="px-3.5 py-1.5 rounded-full bg-red-600 text-white font-black text-xs hover:bg-red-700 transition cursor-pointer shrink-0"
            >
              Recovery Plan
            </button>
          </div>
        )}

        {/* =========================================================================
            3. TWO-COLUMN GRID: Classes & Assignments / Exams
            ========================================================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column (2 Cols): Today's Schedule & Attendance Overview */}
          <div className="lg:col-span-2 space-y-6">
            {/* Today's Timetable Classes */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-[var(--accent-yellow)]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[var(--app-text)]">
                    Today's Schedule & Classes
                  </h3>
                </div>
                <span className="text-xs font-bold text-[var(--app-text-muted)]">Monday &bull; 3 Periods</span>
              </div>

              <div className="space-y-3">
                {timetable.map((t) => (
                  <div
                    key={t.id}
                    className="p-3.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 text-center py-1 rounded-lg bg-[var(--app-surface)] border border-[var(--app-border)] text-[10px] font-mono font-bold">
                        {t.startTime}
                      </div>
                      <div>
                        <p className="text-xs font-extrabold text-[var(--app-text)]">{t.subjectName}</p>
                        <p className="text-[10px] text-[var(--app-text-muted)] font-mono">
                          {t.subjectCode} &bull; Room {t.room}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => navigate('/attendance')}
                      className="px-3 py-1 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface)] text-[10px] font-bold text-[var(--app-text)] transition cursor-pointer"
                    >
                      Mark Today
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Attendance Status Snapshot */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-[var(--accent-green)]" />
                  <h3 className="text-sm font-black uppercase tracking-wider text-[var(--app-text)]">
                    All Course Attendance (75% Minimum Policy)
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/attendance')}
                  className="text-xs font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
                >
                  View Details &rarr;
                </button>
              </div>

              <div className="divide-y divide-[var(--app-border)]">
                {data.summary.map((s) => (
                  <div key={s.subject.id} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--app-text)]">{s.subject.name}</span>
                        <span className="text-[10px] font-mono text-[var(--app-text-muted)] bg-[var(--app-surface-subtle)] px-1.5 py-0.5 rounded border border-[var(--app-border)]">
                          {s.subject.code}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--app-text-muted)] mt-0.5">
                        {s.attended}/{s.total} attended &bull; Safe skips: <b className="text-[var(--app-text)]">{s.safeSkips} classes</b>
                      </p>
                    </div>

                    <div className="text-right">
                      <span
                        className={`text-sm font-black ${
                          s.isAtRisk ? 'text-red-500' : 'text-emerald-500'
                        }`}
                      >
                        {s.currentPercent}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column (1 Col): Deadlines, Exams, Circulars, Streak */}
          <div className="space-y-6">
            {/* Urgent Assignments (< 48h) */}
            <div className="p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)]">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-black uppercase tracking-wider text-[var(--app-text)]">
                  Approaching Deadlines
                </h3>
              </div>

              <div className="space-y-2.5">
                {data.pendingAssignments.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)]">
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-mono font-bold text-amber-600 dark:text-amber-400">
                        {a.subjectCode}
                      </span>
                      <span className="text-[10px] font-bold text-red-500">Due in 28h</span>
                    </div>
                    <p className="text-xs font-bold text-[var(--app-text)] mt-1">{a.title}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Exam Countdowns (< 7 Days) */}
            <div className="p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-[var(--accent-yellow)]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--app-text)]">
                    Exam Countdowns
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/exams')}
                  className="text-[10px] font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
                >
                  Planner &rarr;
                </button>
              </div>

              <div className="space-y-2.5">
                {data.upcomingExams.slice(0, 2).map((ex) => (
                  <div key={ex.id} className="p-3 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-[var(--app-text)]">{ex.subjectName}</p>
                      <p className="text-[10px] text-[var(--app-text-muted)] font-mono">{ex.examDate} &bull; {ex.room}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-black text-[var(--accent-yellow)]">6 Days Left</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Latest Circulars */}
            <div className="p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-[var(--app-text-muted)]" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-[var(--app-text)]">
                    Department Circulars
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => navigate('/circulars')}
                  className="text-[10px] font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
                >
                  All &rarr;
                </button>
              </div>

              <div className="space-y-2">
                {data.latestCirculars.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => navigate('/circulars')}
                    className="w-full text-left p-2 rounded-xl hover:bg-[var(--app-surface-subtle)] transition"
                  >
                    <p className="text-xs font-bold text-[var(--app-text)] truncate">{c.title}</p>
                    <p className="text-[10px] text-[var(--app-text-muted)] mt-0.5">{c.date}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Streak & Badges Spotlight */}
            <div className="p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-500 flex items-center justify-center font-black">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-black text-[var(--app-text)]">18-Day Streak Active</p>
                  <p className="text-[10px] text-[var(--app-text-muted)]">3 Badges Unlocked</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => navigate('/badges')}
                className="px-3 py-1 rounded-full border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)] transition cursor-pointer"
              >
                View
              </button>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};
