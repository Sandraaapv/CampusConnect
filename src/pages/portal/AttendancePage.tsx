import React, { useState } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import type { Subject } from '../../services/db';
import {
  Sliders,
  AlertCircle,
  Clock,
  Send,
  X,
  CheckCircle,
} from 'lucide-react';

export const AttendancePage: React.FC = () => {
  const [summary] = useState(() => db.getAttendanceSummary());
  const subjects = db.getSubjects();
  const user = db.getUser();
  const threshold = user.settings?.attendanceThreshold || 75;

  // What-If Simulator State (Simulation, not recorded)
  const [selectedSubId, setSelectedSubId] = useState<string>(subjects[0]?.id || '');
  const [simAction, setSimAction] = useState<'skip' | 'attend'>('skip');
  const [simCount, setSimCount] = useState<number>(2);

  // Mismatch report modal state
  const [mismatchSubject, setMismatchSubject] = useState<Subject | null>(null);
  const [mismatchDate, setMismatchDate] = useState(new Date().toISOString().split('T')[0]);
  const [mismatchClass, setMismatchClass] = useState('Lecture 2 (10:15 AM)');
  const [mismatchExpected, setMismatchExpected] = useState<'Present' | 'On-Duty'>('Present');
  const [mismatchNote, setMismatchNote] = useState('');
  const [reportSuccess, setReportSuccess] = useState<string | null>(null);

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

  const handleReportMismatch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mismatchSubject) return;

    db.createRequest({
      type: 'Attendance correction',
      title: `Attendance Correction: ${mismatchSubject.code} (${mismatchDate})`,
      details: {
        subjectId: mismatchSubject.id,
        subjectCode: mismatchSubject.code,
        date: mismatchDate,
        className: mismatchClass,
        expectedStatus: mismatchExpected,
        note: mismatchNote,
        reason: `Discrepancy reported: marked absent for ${mismatchClass} on ${mismatchDate}. Record should reflect ${mismatchExpected}. ${mismatchNote ? `Note: ${mismatchNote}` : ''}`,
      },
    });

    setReportSuccess(`Correction request submitted to Approvals tracker for ${mismatchSubject.code}!`);
    setMismatchSubject(null);
    setMismatchNote('');
    setTimeout(() => setReportSuccess(null), 4000);
  };

  return (
    <PortalLayout currentPath="/attendance" title="Attendance Calculator">
      <div className="space-y-6">
        {/* Header Alert: Synced from College Records */}
        <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 text-xs text-[var(--app-text-muted)]">
            <Clock className="w-4 h-4 text-emerald-500 shrink-0" />
            <span>
              Synced from college records · last updated today, 08:30 AM
            </span>
          </div>

          <div className="text-xs text-[var(--app-text-muted)] flex items-center gap-3">
            <span>
              Policy threshold: <b className="text-[var(--app-text)]">{threshold}%</b>
            </span>
            <span className="hidden sm:inline text-neutral-400">·</span>
            <span className="hidden sm:inline">
              Safe skips formula: <code className="font-mono text-[11px] bg-[var(--app-surface)] px-1.5 py-0.5 rounded border border-[var(--app-border)]">floor(a / {(threshold / 100).toFixed(2)} - t)</code>
            </span>
          </div>
        </div>

        {reportSuccess && (
          <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <CheckCircle className="w-4 h-4 shrink-0" />
            <span>{reportSuccess}</span>
          </div>
        )}

        {/* =========================================================================
            SUBJECT ATTENDANCE CARDS FROM COLLEGE RECORDS
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

                {/* Progress Ring & Numbers */}
                <div className="flex items-center justify-between py-2 border-y border-[var(--app-border)]">
                  <div>
                    <span className="text-2xl font-black font-mono text-[var(--app-text)]">
                      {s.currentPercent}%
                    </span>
                    <p className="text-[11px] text-[var(--app-text-muted)] font-bold">
                      {s.attended} of {s.total} classes attended
                    </p>
                  </div>

                  <div className="text-right">
                    {isSafe ? (
                      <div>
                        <span className="text-sm font-black text-emerald-500 font-mono">
                          +{s.safeSkips}
                        </span>
                        <p className="text-[10px] text-[var(--app-text-muted)] font-medium">
                          safe skips remaining
                        </p>
                      </div>
                    ) : (
                      <div>
                        <span className="text-sm font-black text-red-500 font-mono">
                          {s.classesNeeded}
                        </span>
                        <p className="text-[10px] text-[var(--app-text-muted)] font-medium">
                          classes needed for {threshold}%
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSubId(s.subject.id)}
                    className="flex-1 py-2 rounded-xl border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-xs font-bold text-[var(--app-text)] transition cursor-pointer text-center"
                  >
                    Simulate &rarr;
                  </button>

                  <button
                    type="button"
                    onClick={() => setMismatchSubject(s.subject)}
                    className="py-2 px-3 rounded-xl border border-[var(--app-border)] hover:border-amber-500/50 hover:bg-amber-500/5 text-xs font-bold text-[var(--app-text-muted)] hover:text-amber-600 dark:hover:text-amber-400 transition cursor-pointer text-center"
                    title="Report mismatch in college records"
                  >
                    Report mismatch
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* =========================================================================
            WHAT-IF SIMULATOR SLIDER (SIMULATION, NOT RECORDED)
            ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Sliders className="w-4 h-4 text-[var(--accent-yellow)]" />
              <h2 className="text-sm font-black uppercase tracking-wider text-[var(--app-text)]">
                Attendance Calculator What-If Simulator
              </h2>
              <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-[var(--app-text)] text-[10px] font-extrabold uppercase tracking-wider">
                Simulation, not recorded
              </span>
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
                Hypothetical Forecast
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

        {/* =========================================================================
            REPORT MISMATCH MODAL
            ========================================================================= */}
        {mismatchSubject && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs animate-fade-in">
            <div className="bg-[var(--app-surface)] text-[var(--app-text)] max-w-lg w-full rounded-2xl p-6 border border-[var(--app-border)] shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-3">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-amber-500" />
                  <h3 className="font-montserrat font-black text-base text-[var(--app-text)]">
                    Report Attendance Mismatch
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setMismatchSubject(null)}
                  className="p-1 rounded-lg hover:bg-[var(--app-surface-subtle)] text-[var(--app-text-muted)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <p className="text-xs text-[var(--app-text-muted)]">
                Submit an official correction request to the academic office for <b>{mismatchSubject.code} · {mismatchSubject.name}</b>.
              </p>

              <form onSubmit={handleReportMismatch} className="space-y-3.5">
                <div>
                  <label className="text-xs font-bold text-[var(--app-text)] block mb-1">
                    Date of Class
                  </label>
                  <input
                    type="date"
                    required
                    value={mismatchDate}
                    onChange={(e) => setMismatchDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs font-mono text-[var(--app-text)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--app-text)] block mb-1">
                    Which Class / Period
                  </label>
                  <input
                    type="text"
                    required
                    value={mismatchClass}
                    onChange={(e) => setMismatchClass(e.target.value)}
                    placeholder="e.g. 10:15 AM Lecture / Lab session"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs text-[var(--app-text)]"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--app-text)] block mb-1">
                    What should the record say?
                  </label>
                  <select
                    value={mismatchExpected}
                    onChange={(e) => setMismatchExpected(e.target.value as 'Present' | 'On-Duty')}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs text-[var(--app-text)] font-bold"
                  >
                    <option value="Present">Present (Attended in person)</option>
                    <option value="On-Duty">On-Duty (Authorized event / college duty)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[var(--app-text)] block mb-1">
                    Optional Note / Clarification
                  </label>
                  <textarea
                    rows={2}
                    value={mismatchNote}
                    onChange={(e) => setMismatchNote(e.target.value)}
                    placeholder="Provide roll-call context or faculty verification details..."
                    className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs text-[var(--app-text)]"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--app-border)]">
                  <button
                    type="button"
                    onClick={() => setMismatchSubject(null)}
                    className="px-4 py-2 rounded-xl border border-[var(--app-border)] text-xs font-bold text-[var(--app-text-muted)] hover:bg-[var(--app-surface-subtle)] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] text-xs font-black flex items-center gap-1.5 hover:opacity-90 transition cursor-pointer shadow-xs"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit to Approvals</span>
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
