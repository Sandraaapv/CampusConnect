import React, { useState, useMemo } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import { calculateCumulativeCgpa } from '../../services/collegeRecords';
import { useTheme } from '../../context/ThemeContext';
import {
  Calculator,
  AlertTriangle,
  Award,
  Sparkles,
  TrendingUp,
  History,
  ChevronDown,
  ChevronUp,
  GraduationCap,
  CheckCircle2,
  ShieldCheck,
  BookOpen,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
  CartesianGrid,
} from 'recharts';

export const MarksPage: React.FC = () => {
  const { theme } = useTheme();
  const user = db.getUser();
  const marks = db.getMarks();
  const [targetCgpa, setTargetCgpa] = useState<number>(user.settings?.targetCgpa || 8.5);

  // Per-subject what-if end-sem marks field used purely for simulation
  const [whatIfMarks, setWhatIfMarks] = useState<Record<string, number>>({});

  const handleTargetChange = (newTarget: number) => {
    setTargetCgpa(newTarget);
    db.updateUserSettings({ targetCgpa: newTarget });
  };

  const handleWhatIfChange = (subjectId: string, val: number) => {
    const clamped = Math.max(0, Math.min(100, val));
    setWhatIfMarks((prev) => ({
      ...prev,
      [subjectId]: clamped,
    }));
  };

  const predictions = useMemo(() => {
    return db.predictEndSemMarks(targetCgpa);
  }, [targetCgpa]);

  // --- ACADEMIC HISTORY (COLLEGE RECORDS - READ ONLY) ---
  // Configurable college rule: whether arrears/fails are counted in credits denominator
  const [arrearsCountedInCredits, setArrearsCountedInCredits] = useState<boolean>(true);

  // Seeded complete academic history for earlier semesters (1 to currentSemester - 1)
  const academicHistory = useMemo(() => {
    return db.getAcademicHistory({ arrearsCountedInCredits });
  }, [arrearsCountedInCredits]);

  // Cumulative CGPA across all completed semesters
  const cumulativeCgpa = useMemo(() => {
    return calculateCumulativeCgpa(academicHistory, { arrearsCountedInCredits });
  }, [academicHistory, arrearsCountedInCredits]);

  // Total completed credits across all earlier semesters
  const totalCompletedCredits = useMemo(() => {
    return academicHistory.reduce((acc, sem) => acc + sem.totalCredits, 0);
  }, [academicHistory]);

  // Arrears / Failed subjects count across all completed semesters
  const totalArrearsCount = useMemo(() => {
    return academicHistory.reduce(
      (acc, sem) => acc + sem.subjects.filter((s) => s.isArrear).length,
      0
    );
  }, [academicHistory]);

  // State to track expanded semesters in the list (default: latest completed semester open)
  const [expandedSemesters, setExpandedSemesters] = useState<Record<number, boolean>>({
    [Math.max(1, user.semester - 1)]: true,
  });

  const toggleSemester = (semNo: number) => {
    setExpandedSemesters((prev) => ({
      ...prev,
      [semNo]: !prev[semNo],
    }));
  };

  // Progression chart data (SGPA and Cumulative CGPA per semester)
  const historyChartData = useMemo(() => {
    return academicHistory.map((sem) => ({
      name: `Sem ${sem.semester}`,
      semester: sem.semester,
      sgpa: sem.sgpa,
      cgpa: sem.cumulativeCgpa,
      credits: sem.totalCredits,
    }));
  }, [academicHistory]);

  // Overall standing calculations
  const totalCredits = predictions.reduce((acc, p) => acc + p.subject.credits, 0);
  const currentInternalGpa = Number(
    (
      predictions.reduce((acc, p) => {
        // Scaled to 10 points
        const points = (p.mark.totalInternal / 50) * 10;
        return acc + points * p.subject.credits;
      }, 0) / (totalCredits || 1)
    ).toFixed(2)
  );

  const impossibleCount = predictions.filter((p) => p.isImpossible).length;
  const bestOverallAchievableCgpa = Number(
    (
      predictions.reduce((acc, p) => acc + p.bestAchievableCgpa * p.subject.credits, 0) /
      (totalCredits || 1)
    ).toFixed(2)
  );

  // Subject needing the most work (highest needed end-sem or lowest internal score)
  const mostWorkSubject = useMemo(() => {
    const sorted = [...predictions].sort(
      (a, b) => b.neededMarksOutOf100 - a.neededMarksOutOf100
    );
    return sorted[0];
  }, [predictions]);

  // Recharts data
  const chartData = predictions.map((p) => ({
    name: p.subject.code,
    fullName: p.subject.name,
    internalMarks: p.mark.totalInternal,
    neededEndSem: p.isImpossible ? 100 : p.neededMarksOutOf100,
    whatIf: whatIfMarks[p.subject.id],
    isImpossible: p.isImpossible,
  }));

  return (
    <PortalLayout currentPath="/marks" title="Marks & CGPA Predictor">
      <div className="space-y-6">
        {/* =========================================================================
            1. SUMMARY CARDS: CURRENT STANDING, TARGET, ACHIEVABILITY & FOCUS
            ========================================================================= */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)] font-mono">
                Current Standing
              </span>
              <p className="text-2xl font-black text-[var(--app-text)] font-mono mt-1">
                {currentInternalGpa}
              </p>
              <p className="text-[10px] text-[var(--app-text-muted)] font-bold">
                Based on internals (50% wt)
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center font-bold">
              <Award className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)] font-mono">
                Target CGPA
              </span>
              <p className="text-2xl font-black text-[var(--app-text)] font-mono mt-1">
                {targetCgpa.toFixed(1)}
              </p>
              <p className="text-[10px] text-[var(--app-text-muted)] font-bold">
                Saved in student settings
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)] font-mono">
                Target Achievable?
              </span>
              <p className={`text-base font-black mt-1 ${impossibleCount === 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                {impossibleCount === 0 ? 'Yes, on track' : 'Target too high'}
              </p>
              <p className="text-[10px] text-[var(--app-text-muted)] font-bold">
                Max achievable: {bestOverallAchievableCgpa}
              </p>
            </div>
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${impossibleCount === 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
              <Sparkles className="w-5 h-5" />
            </div>
          </div>

          <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)] font-mono">
                Needs Most Work
              </span>
              <p className="text-sm font-black text-[var(--app-text)] truncate mt-1">
                {mostWorkSubject ? mostWorkSubject.subject.code : 'None'}
              </p>
              <p className="text-[10px] text-[var(--app-text-muted)] font-bold truncate">
                {mostWorkSubject ? `Needs ${mostWorkSubject.neededMarksOutOf100}/100` : ''}
              </p>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
              <Calculator className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* =========================================================================
            2. TARGET CGPA SLIDER CONTROL
            ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Calculator className="w-5 h-5 text-[var(--accent-yellow)]" />
              <div>
                <h2 className="text-sm font-black uppercase tracking-wider text-[var(--app-text)]">
                  CGPA Target Calculator
                </h2>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Calculates minimum required end-sem examination marks (out of 100) per subject across all credits
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[var(--app-text-muted)]">Target:</span>
              <span className="text-2xl font-black text-[var(--app-text)] font-mono">
                {targetCgpa.toFixed(1)}
              </span>
            </div>
          </div>

          <div>
            <input
              type="range"
              min="5.0"
              max="10.0"
              step="0.1"
              value={targetCgpa}
              onChange={(e) => handleTargetChange(Number(e.target.value))}
              className="w-full h-2 rounded-lg cursor-pointer accent-[var(--app-text)] bg-[var(--app-surface-subtle)]"
            />
            <div className="flex justify-between text-[10px] font-mono font-bold text-[var(--app-text-muted)] mt-1">
              <span>5.0 (Passing)</span>
              <span>7.5 (Distinction)</span>
              <span>8.5 (First Class)</span>
              <span>10.0 (Perfect)</span>
            </div>
          </div>

          {impossibleCount > 0 && (
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>
                  Target <b>{targetCgpa.toFixed(1)}</b> is mathematically impossible for {impossibleCount} subject(s) because required end-sem marks exceed 100/100 based on official internal marks.
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleTargetChange(bestOverallAchievableCgpa)}
                className="px-3 py-1 rounded-full bg-red-500 text-white font-black text-xs shrink-0 hover:bg-red-600 transition cursor-pointer"
              >
                Set to Best Achievable ({bestOverallAchievableCgpa})
              </button>
            </div>
          )}
        </div>

        {/* =========================================================================
            3. READ-ONLY INTERNAL ASSESSMENTS & NEEDED END-SEM MARKS TABLE
            ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-black uppercase tracking-wider text-[var(--app-text)]">
                Official Internal Assessments (College Records) & Needed End-Sem
              </h3>
              <p className="text-[11px] text-[var(--app-text-muted)] mt-0.5">
                Assessment Scheme: (Internal 1 + Internal 2) scaled to 40 + Quiz/Assignment 10 = Max 50. Weighted 50/50 with end-sem.
              </p>
            </div>
            <span className="text-[10px] font-mono font-bold text-neutral-400 bg-[var(--app-surface-subtle)] px-2.5 py-1 rounded-full border border-[var(--app-border)]">
              Read-Only Official Records
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--app-surface-subtle)] border-b border-[var(--app-border)] text-[var(--app-text-muted)] font-black uppercase tracking-wider">
                <tr>
                  <th className="py-2.5 px-3">Subject</th>
                  <th className="py-2.5 px-3">Credits</th>
                  <th className="py-2.5 px-3">Internal 1 (/25)</th>
                  <th className="py-2.5 px-3">Internal 2 (/25)</th>
                  <th className="py-2.5 px-3">Quiz/Asg (/10)</th>
                  <th className="py-2.5 px-3">Total Internal (/50)</th>
                  <th className="py-2.5 px-3">What-If End-Sem (/100)</th>
                  <th className="py-2.5 px-3 text-right">Needed for Target</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]">
                {predictions.map((p) => {
                  const currentMark = marks.find((m) => m.subjectId === p.subject.id) || p.mark;

                  return (
                    <tr key={p.subject.id} className="hover:bg-[var(--app-surface-subtle)]/50 transition">
                      <td className="py-2.5 px-3 font-bold text-[var(--app-text)]">
                        <div>{p.subject.name}</div>
                        <span className="text-[10px] font-mono text-[var(--app-text-muted)]">
                          {p.subject.code}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono font-bold">{p.subject.credits}</td>
                      <td className="py-2.5 px-3 font-mono text-[var(--app-text)]">
                        {currentMark.internal1} / 25
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[var(--app-text)]">
                        {currentMark.internal2} / 25
                      </td>
                      <td className="py-2.5 px-3 font-mono text-[var(--app-text)]">
                        {currentMark.assignment} / 10
                      </td>
                      <td className="py-2.5 px-3 font-mono font-black text-[var(--app-text)]">
                        {currentMark.totalInternal} / 50
                      </td>

                      {/* What-if End-Sem Simulator Input */}
                      <td className="py-2.5 px-3">
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            min="0"
                            max="100"
                            placeholder="Score"
                            value={whatIfMarks[p.subject.id] ?? ''}
                            onChange={(e) => handleWhatIfChange(p.subject.id, Number(e.target.value))}
                            className="w-16 px-2 py-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-subtle)] font-mono text-center text-xs"
                          />
                          <span className="text-[10px] text-[var(--app-text-muted)] whitespace-nowrap">
                            What-if, not recorded
                          </span>
                        </div>
                      </td>

                      <td className="py-2.5 px-3 text-right">
                        {p.isImpossible ? (
                          <div className="text-right">
                            <span className="text-xs font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                              Not Reachable (&gt;100)
                            </span>
                            <p className="text-[10px] text-[var(--app-text-muted)] mt-0.5">
                              Max: {p.bestAchievableGrade}
                            </p>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="text-sm font-black text-emerald-500 font-mono">
                              {p.neededMarksOutOf100} / 100
                            </span>
                            <p className="text-[10px] text-[var(--app-text-muted)]">
                              Needs grade {p.targetGrade.split(' ')[0]}
                            </p>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* =========================================================================
            4. RECHARTS VISUALIZATION: NEEDED END-SEM MARKS COMPARISON
            ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--app-text)]">
              Needed End-Sem Marks vs Subject Internals
            </h3>
            <span className="text-xs text-[var(--app-text-muted)]">Target: {targetCgpa.toFixed(1)} CGPA</span>
          </div>

          <div className="h-64 sm:h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
                <XAxis
                  dataKey="name"
                  tick={{ fill: 'var(--app-text-muted)', fontSize: 11, fontWeight: 'bold' }}
                  axisLine={{ stroke: 'var(--app-border)' }}
                />
                <YAxis
                  domain={[0, 100]}
                  tick={{ fill: 'var(--app-text-muted)', fontSize: 10 }}
                  axisLine={{ stroke: 'var(--app-border)' }}
                />
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="p-3 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-xl text-xs space-y-1">
                          <p className="font-extrabold text-[var(--app-text)]">{data.fullName}</p>
                          <p className="text-[var(--app-text-muted)]">Internal: {data.internalMarks} / 50</p>
                          <p className={data.isImpossible ? 'text-red-500 font-bold' : 'text-emerald-500 font-bold'}>
                            Needed End-Sem: {data.isImpossible ? 'Impossible (>100)' : `${data.neededEndSem} / 100`}
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                  <Bar dataKey="neededEndSem" radius={[6, 6, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={
                          entry.isImpossible
                            ? '#ef4444'
                            : entry.neededEndSem > 75
                            ? '#f59e0b'
                            : theme === 'dark'
                            ? '#ff8fa3'
                            : '#262629'
                        }
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

        {/* =========================================================================
            5. PAST SEMESTERS & ACADEMIC HISTORY (OFFICIAL COLLEGE RECORDS - READ ONLY)
            ========================================================================= */}
        <div className="space-y-6 pt-4 border-t border-[var(--app-border)]">
          {/* Section Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <History className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black text-[var(--app-text)]">
                    Past Semesters & Academic History
                  </h2>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                    <ShieldCheck className="w-3 h-3" /> Official Records
                  </span>
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[var(--app-surface-hover)] text-[var(--app-text-muted)] border border-[var(--app-border)]">
                    Read-Only
                  </span>
                </div>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Complete academic transcript for completed semesters (Sem 1 to {Math.max(1, user.semester - 1)}) from college examination records.
                </p>
              </div>
            </div>

            {/* Configurable College Arrears Rule Toggle */}
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-sm">
              <div className="text-right">
                <p className="text-[11px] font-bold text-[var(--app-text)]">College Arrear Rule</p>
                <p className="text-[9px] text-[var(--app-text-muted)]">
                  {arrearsCountedInCredits ? 'Included in credits denominator' : 'Excluded until cleared'}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setArrearsCountedInCredits(!arrearsCountedInCredits)}
                className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  arrearsCountedInCredits ? 'bg-[var(--app-primary)]' : 'bg-zinc-600'
                }`}
                title="Toggle whether arrear credits are included in the cumulative CGPA denominator according to college rule"
              >
                <span
                  className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    arrearsCountedInCredits ? 'translate-x-4' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Academic Overview Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-4 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)] font-mono">
                  Cumulative CGPA
                </span>
                <p className="text-2xl font-black text-[var(--app-text)] font-mono mt-0.5">
                  {cumulativeCgpa.toFixed(2)}
                </p>
                <p className="text-[10px] text-[var(--app-text-muted)] font-bold">
                  All {academicHistory.length} completed semesters
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center font-bold">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)] font-mono">
                  Total Completed Credits
                </span>
                <p className="text-2xl font-black text-[var(--app-text)] font-mono mt-0.5">
                  {totalCompletedCredits}
                </p>
                <p className="text-[10px] text-[var(--app-text-muted)] font-bold">
                  Across Sem 1 to {Math.max(1, user.semester - 1)}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center font-bold">
                <BookOpen className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)] font-mono">
                  Completed Semesters
                </span>
                <p className="text-2xl font-black text-[var(--app-text)] font-mono mt-0.5">
                  {academicHistory.length}
                </p>
                <p className="text-[10px] text-[var(--app-text-muted)] font-bold">
                  Current: Semester {user.semester}
                </p>
              </div>
              <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center font-bold">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex items-center justify-between">
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--app-text-muted)] font-mono">
                  Arrears / Backlogs
                </span>
                <p
                  className={`text-2xl font-black font-mono mt-0.5 ${
                    totalArrearsCount > 0 ? 'text-rose-500' : 'text-emerald-500'
                  }`}
                >
                  {totalArrearsCount === 0 ? '0 Clear' : `${totalArrearsCount} Active`}
                </p>
                <p className="text-[10px] text-[var(--app-text-muted)] font-bold">
                  {totalArrearsCount > 0 ? 'Counted per college rule' : 'No pending papers'}
                </p>
              </div>
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center font-bold ${
                  totalArrearsCount > 0
                    ? 'bg-rose-500/10 text-rose-500'
                    : 'bg-emerald-500/10 text-emerald-500'
                }`}
              >
                {totalArrearsCount > 0 ? (
                  <AlertTriangle className="w-5 h-5" />
                ) : (
                  <CheckCircle2 className="w-5 h-5" />
                )}
              </div>
            </div>
          </div>

          {/* SGPA & Cumulative CGPA Progression Chart */}
          <div className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-[var(--app-text)]">
                  SGPA by Semester vs Cumulative CGPA
                </h3>
                <p className="text-xs text-[var(--app-text-muted)]">
                  Bars represent individual semester performance (SGPA); line shows cumulative standing (CGPA).
                </p>
              </div>
              <div className="flex items-center gap-3 text-xs">
                <span className="inline-flex items-center gap-1.5 font-bold text-[var(--app-text-muted)]">
                  <span
                    className="w-3 h-3 rounded"
                    style={{ backgroundColor: theme === 'dark' ? '#ff8fa3' : '#e11d48' }}
                  />
                  Semester SGPA
                </span>
                <span className="inline-flex items-center gap-1.5 font-bold text-[var(--app-text-muted)]">
                  <span
                    className="w-3 h-1.5 rounded-full"
                    style={{ backgroundColor: theme === 'dark' ? '#38bdf8' : '#2563eb' }}
                  />
                  Cumulative CGPA
                </span>
              </div>
            </div>

            <div className="h-64 sm:h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart
                  data={historyChartData}
                  margin={{ top: 15, right: 15, left: -20, bottom: 15 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    stroke="var(--app-border)"
                    opacity={0.4}
                    vertical={false}
                  />
                  <XAxis
                    dataKey="name"
                    tick={{ fill: 'var(--app-text-muted)', fontSize: 11, fontWeight: 'bold' }}
                    axisLine={{ stroke: 'var(--app-border)' }}
                  />
                  <YAxis
                    domain={[6, 10]}
                    tick={{ fill: 'var(--app-text-muted)', fontSize: 10 }}
                    axisLine={{ stroke: 'var(--app-border)' }}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="p-3 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-xl text-xs space-y-1">
                            <p className="font-extrabold text-[var(--app-text)]">
                              Semester {data.semester}
                            </p>
                            <p className="text-[var(--app-text-muted)]">
                              Total Credits: <span className="font-bold text-[var(--app-text)]">{data.credits}</span>
                            </p>
                            <p className="font-bold text-rose-500">
                              Semester SGPA: {data.sgpa.toFixed(2)}
                            </p>
                            <p className="font-bold text-blue-500">
                              Cumulative CGPA: {data.cgpa.toFixed(2)}
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="sgpa"
                    name="Semester SGPA"
                    radius={[6, 6, 0, 0]}
                    maxBarSize={48}
                    fill={theme === 'dark' ? '#ff8fa3' : '#e11d48'}
                  />
                  <Line
                    type="monotone"
                    dataKey="cgpa"
                    name="Cumulative CGPA"
                    stroke={theme === 'dark' ? '#38bdf8' : '#2563eb'}
                    strokeWidth={3}
                    dot={{
                      r: 5,
                      fill: theme === 'dark' ? '#38bdf8' : '#2563eb',
                      stroke: 'var(--app-surface)',
                      strokeWidth: 2,
                    }}
                    activeDot={{ r: 7 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Expandable Semester List */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black uppercase tracking-wider text-[var(--app-text)]">
                Semester Breakdown & Subject Grades
              </h3>
              <span className="text-xs text-[var(--app-text-muted)]">
                Click any semester to view course-level credits & grades
              </span>
            </div>

            {academicHistory.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)]">
                <p className="text-sm text-[var(--app-text-muted)]">
                  Student is currently in Semester 1. Past completed semesters will appear here once official grades are published.
                </p>
              </div>
            ) : (
              [...academicHistory].reverse().map((sem) => {
                const isExpanded = Boolean(expandedSemesters[sem.semester]);
                const semArrears = sem.subjects.filter((s) => s.isArrear);
                const hasArrears = semArrears.length > 0;
                const totalPoints = sem.subjects.reduce(
                  (acc, s) => acc + s.credits * s.gradePoints,
                  0
                );

                return (
                  <div
                    key={`past-sem-${sem.semester}`}
                    className="rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] overflow-hidden transition-all"
                  >
                    {/* Expandable Accordion Header */}
                    <button
                      type="button"
                      onClick={() => toggleSemester(sem.semester)}
                      className="w-full p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left hover:bg-[var(--app-surface-hover)] transition-colors focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[var(--app-surface-hover)] border border-[var(--app-border)] flex items-center justify-center font-mono font-bold text-sm text-[var(--app-text)]">
                          S{sem.semester}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-sm sm:text-base text-[var(--app-text)]">
                              Semester {sem.semester}
                            </span>
                            <span className="text-xs text-[var(--app-text-muted)]">
                              • {sem.term}
                            </span>
                          </div>
                          <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                            {sem.subjects.length} subjects • {sem.totalCredits} credits
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 self-end sm:self-auto">
                        {hasArrears ? (
                          <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 flex items-center gap-1">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            {semArrears.length} Arrear
                          </span>
                        ) : (
                          <span className="text-[11px] font-black px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            All Passed
                          </span>
                        )}

                        <div className="text-right">
                          <span className="text-xs font-mono font-black text-[var(--app-text)] px-2.5 py-1 rounded-lg bg-[var(--app-surface-hover)] border border-[var(--app-border)]">
                            SGPA: {sem.sgpa.toFixed(2)}
                          </span>
                          <span className="text-[11px] font-mono text-[var(--app-text-muted)] ml-2 hidden md:inline">
                            CGPA: {sem.cumulativeCgpa.toFixed(2)}
                          </span>
                        </div>

                        <div className="text-[var(--app-text-muted)]">
                          {isExpanded ? (
                            <ChevronUp className="w-5 h-5" />
                          ) : (
                            <ChevronDown className="w-5 h-5" />
                          )}
                        </div>
                      </div>
                    </button>

                    {/* Expandable Subject Table Content */}
                    {isExpanded && (
                      <div className="px-4 pb-5 pt-1 border-t border-[var(--app-border)] bg-[var(--app-surface)]">
                        <div className="overflow-x-auto">
                          <table className="w-full text-left text-xs">
                            <thead>
                              <tr className="border-b border-[var(--app-border)] text-[var(--app-text-muted)] font-mono uppercase tracking-wider text-[10px]">
                                <th className="py-2.5 px-3">Course Code</th>
                                <th className="py-2.5 px-3">Course Title</th>
                                <th className="py-2.5 px-3 text-center">Credits</th>
                                <th className="py-2.5 px-3 text-center">Grade</th>
                                <th className="py-2.5 px-3 text-center">Grade Points</th>
                                <th className="py-2.5 px-3 text-right">Result</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--app-border)]">
                              {sem.subjects.map((sub) => {
                                const isArrear = Boolean(sub.isArrear);
                                return (
                                  <tr
                                    key={`sem-${sem.semester}-${sub.code}`}
                                    className={`hover:bg-[var(--app-surface-hover)] transition-colors ${
                                      isArrear ? 'bg-rose-500/5' : ''
                                    }`}
                                  >
                                    <td className="py-2.5 px-3 font-mono font-bold text-[var(--app-text)]">
                                      {sub.code}
                                    </td>
                                    <td className="py-2.5 px-3 font-medium text-[var(--app-text)]">
                                      {sub.name}
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-[var(--app-text)]">
                                      {sub.credits}
                                    </td>
                                    <td className="py-2.5 px-3 text-center">
                                      <span
                                        className={`inline-block font-mono font-black px-2 py-0.5 rounded text-xs ${
                                          isArrear
                                            ? 'bg-rose-500 text-white font-bold'
                                            : sub.grade === 'O' || sub.grade === 'A+'
                                            ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                                            : 'bg-blue-500/10 text-blue-500 border border-blue-500/20'
                                        }`}
                                      >
                                        {sub.grade}
                                      </span>
                                    </td>
                                    <td className="py-2.5 px-3 text-center font-mono font-bold text-[var(--app-text)]">
                                      {sub.gradePoints}
                                    </td>
                                    <td className="py-2.5 px-3 text-right">
                                      {isArrear ? (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-rose-500 bg-rose-500/10 px-2 py-0.5 rounded-full border border-rose-500/20">
                                          <AlertTriangle className="w-3 h-3" /> Arrear (RA)
                                        </span>
                                      ) : (
                                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                                          <CheckCircle2 className="w-3 h-3" /> Passed
                                        </span>
                                      )}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                          </table>
                        </div>

                        {/* Semester Calculation Summary */}
                        <div className="mt-3 p-3 rounded-xl bg-[var(--app-surface-hover)] border border-[var(--app-border)] flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-2">
                          <div className="text-[var(--app-text-muted)]">
                            <span className="font-bold text-[var(--app-text)]">Semester {sem.semester} Calculation: </span>
                            Total Grade Points: <span className="font-mono font-bold text-[var(--app-text)]">{totalPoints}</span> ÷ Total Credits: <span className="font-mono font-bold text-[var(--app-text)]">{sem.totalCredits}</span>
                          </div>
                          <div className="flex items-center gap-3 font-mono font-bold">
                            <span className="text-[var(--app-text)]">
                              SGPA: <span className="text-[var(--app-primary)]">{sem.sgpa.toFixed(2)}</span>
                            </span>
                            <span className="text-[var(--app-text-muted)]">•</span>
                            <span className="text-[var(--app-text)]">
                              Cumulative CGPA: <span className="text-blue-500">{sem.cumulativeCgpa.toFixed(2)}</span>
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          {/* Academic Regulations Note */}
          <div className="p-4 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] text-xs text-[var(--app-text-muted)] flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-purple-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <p className="font-bold text-[var(--app-text)]">
                College Grading Scheme & Cumulative CGPA Formula
              </p>
              <p>
                Cumulative Grade Point Average (CGPA) is calculated as the sum of credit-weighted grade points across all completed semesters divided by the cumulative credits attempted:
                <span className="font-mono font-bold text-[var(--app-text)] ml-1">
                  CGPA = Σ(Credits × Grade Points) / Σ(Total Completed Credits)
                </span>
                . In accordance with the college regulations, arrear subjects carry 0 grade points and remain factored into the cumulative denominator until cleared in a subsequent attempt.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};
