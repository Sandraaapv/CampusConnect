import React, { useState } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import {
  Calendar,
  Sliders,
  Check,
  X,
  Info,
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [summary, setSummary] = useState(() => db.getAttendanceSummary());
  const subjects = db.getSubjects();
  const timetable = db.getTimetable().filter((t) => t.dayOfWeek === 'Monday');
  const user = db.getUser();
  const threshold = user.settings?.attendanceThreshold || 75;

  // What-If Simulator State
  const [selectedSubId, setSelectedSubId] = useState<string>(subjects[0]?.id || '');
  const [simAction, setSimAction] = useState<'skip' | 'attend'>('skip');
  const [simCount, setSimCount] = useState<number>(2);

  // Quick mark today confirmation
  const [markSuccess, setMarkSuccess] = useState<string | null>(null);

  const activeSubSummary = summary.find((s) => s.subject.id === selectedSubId) || summary[0];

  // Calculate simulated % with edge cases handled: t = 0, a > t, bounded [0, 100]
  const calculateSimulatedPercent = () => {
    if (!activeSubSummary) return 100;
    const a = activeSubSummary.attended;
    const t = activeSubSummary.total;

    let newA = a;
    let newT = t + simCount;

    if (simAction === 'attend') {
      newA = a + simCount;
    }

    if (newT <= 0) return 100;
    const result = (newA / newT) * 100;
    return Math.max(0, Math.min(100, Number(result.toFixed(1))));
  };

  const simulatedPercent = calculateSimulatedPercent();

  const handleMarkToday = (subjectId: string, status: 'present' | 'absent') => {
    const today = new Date().toISOString().split('T')[0];
    db.recordAttendance(subjectId, today, status);
    setSummary([...db.getAttendanceSummary()]);
    setMarkSuccess(`Marked ${status} for today!`);
    setTimeout(() => setMarkSuccess(null), 2500);
  };

  return (
    <PortalLayout currentPath="/attendance" title="Attendance Calculator">
      <div className="space-y-6">
        {/* Header Alert: Self-Reported Disclaimer & Threshold Info */}
        <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] flex items-start gap-3">
          <Info className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-[var(--app-text-muted)] leading-relaxed">
            <span className="font-bold text-[var(--app-text)]">Self-Reported Attendance Tracker:</span> All records and simulations reflect your personal inputs against the college's{' '}
            <b className="text-[var(--app-text)]">{threshold}% threshold policy</b>. Safe skips formula:{' '}
            <code className="px-1.5 py-0.5 rounded bg-[var(--app-surface)] border border-[var(--app-border)] font-mono text-[10.5px]">
              floor(a / {(threshold / 100).toFixed(2)} - t)
            </code>
            . Adjust threshold in Settings anytime.
          </div>
        </div>

        {/* =========================================================================
            1. QUICK "MARK TODAY" PER TIMETABLE CLASS
            ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-[var(--accent-yellow)]" />
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--app-text)]">
                Mark Today's Classes (Self-Report)
              </h2>
            </div>
            {markSuccess && (
              <span className="text-xs font-bold text-emerald-500 animate-fade-in">{markSuccess}</span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {timetable.map((t) => (
              <div
                key={t.id}
                className="p-3.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] flex flex-col justify-between gap-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[var(--app-text-muted)]">{t.startTime}</span>
                    <span className="text-[10px] text-[var(--app-text-muted)]">Room {t.room}</span>
                  </div>
                  <p className="text-xs font-extrabold text-[var(--app-text)] mt-1">{t.subjectName}</p>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => handleMarkToday(t.subjectId, 'present')}
                    className="flex-1 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <Check className="w-3 h-3" />
                    <span>Present</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => handleMarkToday(t.subjectId, 'absent')}
                    className="flex-1 py-1.5 rounded-lg border border-[var(--app-border)] hover:bg-red-500/10 text-red-500 font-extrabold text-[10px] flex items-center justify-center gap-1 transition cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                    <span>Absent</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            2. SUBJECT ATTENDANCE CARDS WITH PROGRESS RING & SAFE SKIPS / RECOVERY
            ========================================================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {summary.map((s) => {
            const isSafe = s.currentPercent >= threshold;
            return (
              <div
                key={s.subject.id}
                className={`p-5 rounded-2xl bg-[var(--app-surface)] border shadow-[var(--card-shadow)] flex flex-col justify-between gap-4 transition-all ${
                  selectedSubId === s.subject.id
                    ? 'border-[var(--btn-primary-bg)] ring-1 ring-[var(--btn-primary-bg)]'
                    : 'border-[var(--app-border)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-[var(--app-text-muted)] bg-[var(--app-surface-subtle)] px-2 py-0.5 rounded border border-[var(--app-border)]">
                      {s.subject.code}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                        isSafe ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'
                      }`}
                    >
                      {isSafe ? 'Safe' : 'Action Needed'}
                    </span>
                  </div>

                  <h3 className="text-sm font-extrabold text-[var(--app-text)] mt-2">
                    {s.subject.name}
                  </h3>
                  <p className="text-[11px] text-[var(--app-text-muted)]">
                    {s.subject.facultyName}
                  </p>
                </div>

                {/* Middle: Progress percent & Attended numbers */}
                <div className="flex items-center justify-between pt-2 border-t border-[var(--app-border)]">
                  <div>
                    <span
                      className={`text-2xl font-black ${
                        isSafe ? 'text-emerald-500' : 'text-red-500'
                      }`}
                    >
                      {s.currentPercent}%
                    </span>
                    <p className="text-[10px] text-[var(--app-text-muted)]">
                      {s.attended} of {s.total} classes attended
                    </p>
                  </div>

                  {/* Calculations breakdown */}
                  <div className="text-right">
                    {isSafe ? (
                      <div>
                        <span className="text-xs font-black text-emerald-500">
                          {s.safeSkips} Safe Skips
                        </span>
                        <p className="text-[10px] text-[var(--app-text-muted)]">Can miss safely</p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-xs font-black text-red-500">
                          +{s.classesNeeded} Needed
                        </span>
                        <p className="text-[10px] text-[var(--app-text-muted)]">Consecutive classes</p>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setSelectedSubId(s.subject.id)}
                  className="w-full py-2 rounded-xl border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-xs font-bold text-[var(--app-text)] transition cursor-pointer text-center"
                >
                  Simulate in What-If &rarr;
                </button>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            3. LIVE WHAT-IF SIMULATOR SLIDER
            ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--accent-yellow)]" />
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--app-text)]">
                Interactive What-If Scenario Forecaster
              </h2>
            </div>
            <span className="text-xs font-bold text-[var(--app-text-muted)]">
              Subject: <b>{activeSubSummary?.subject.name}</b>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
            {/* Control Inputs */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-bold text-[var(--app-text-muted)]">Mode:</span>
                <button
                  type="button"
                  onClick={() => setSimAction('skip')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    simAction === 'skip'
                      ? 'bg-red-500 text-white'
                      : 'border border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-subtle)]'
                  }`}
                >
                  If I skip more classes
                </button>
                <button
                  type="button"
                  onClick={() => setSimAction('attend')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                    simAction === 'attend'
                      ? 'bg-emerald-600 text-white'
                      : 'border border-[var(--app-border)] text-[var(--app-text-muted)] hover:bg-[var(--app-surface-subtle)]'
                  }`}
                >
                  If I attend more classes
                </button>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs font-bold mb-1.5">
                  <span className="text-[var(--app-text-muted)]">
                    Simulate {simAction === 'skip' ? 'skipping' : 'attending'} additional classes:
                  </span>
                  <span className="text-sm font-black text-[var(--app-text)] font-mono">
                    {simCount} {simCount === 1 ? 'class' : 'classes'}
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="15"
                  value={simCount}
                  onChange={(e) => setSimCount(Number(e.target.value))}
                  className="w-full h-2 rounded-lg cursor-pointer accent-[var(--app-text)] bg-[var(--app-surface-subtle)]"
                />
              </div>

              {/* Dynamic Sentence */}
              <p className="text-xs sm:text-sm font-bold text-[var(--app-text)] bg-[var(--app-surface-subtle)] p-3 rounded-xl border border-[var(--app-border)]">
                If I {simAction === 'skip' ? 'skip' : 'attend'}{' '}
                <span className="text-[var(--accent-yellow)] font-black">{simCount}</span> more{' '}
                {activeSubSummary?.subject.name} classes, my attendance becomes{' '}
                <span
                  className={`font-black ${
                    simulatedPercent >= threshold
                      ? 'text-emerald-500'
                      : simulatedPercent >= threshold - 5
                      ? 'text-amber-500'
                      : 'text-red-500'
                  }`}
                >
                  {simulatedPercent}%
                </span>{' '}
                (from {activeSubSummary?.currentPercent}%).
              </p>
            </div>

            {/* Projected Gauge Output */}
            <div className="p-5 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-center flex flex-col items-center justify-center">
              <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase tracking-wider">
                Projected Forecast
              </span>
              <span
                className={`text-4xl font-black mt-2 ${
                  simulatedPercent >= threshold
                    ? 'text-emerald-500'
                    : simulatedPercent >= threshold - 5
                    ? 'text-amber-500'
                    : 'text-red-500'
                }`}
              >
                {simulatedPercent}%
              </span>
              <span
                className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full mt-2 ${
                  simulatedPercent >= threshold
                    ? 'bg-emerald-500/10 text-emerald-500'
                    : 'bg-red-500/10 text-red-500'
                }`}
              >
                {simulatedPercent >= threshold ? 'Above Policy Threshold' : 'Below 75% Risk'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};
