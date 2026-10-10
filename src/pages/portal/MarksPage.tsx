import React, { useState, useMemo } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import { useTheme } from '../../context/ThemeContext';
import {
  Calculator,
  AlertTriangle,
  Award,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
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
      </div>
    </PortalLayout>
  );
};
