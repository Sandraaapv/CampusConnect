import React, { useState } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import { useTheme } from '../../context/ThemeContext';
import {
  Calculator,
  AlertTriangle,
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
  const [marks, setMarks] = useState(() => db.getMarks());
  const [targetCgpa, setTargetCgpa] = useState<number>(8.5);

  const predictions = db.predictEndSemMarks(targetCgpa);

  const handleMarkChange = (
    subjectId: string,
    field: 'internal1' | 'internal2' | 'assignment',
    val: number
  ) => {
    const cleanVal = Math.max(0, Math.min(field === 'assignment' ? 10 : 25, val));
    db.updateMark(subjectId, { [field]: cleanVal });
    setMarks([...db.getMarks()]);
  };

  // Recharts data
  const chartData = predictions.map((p) => ({
    name: p.subject.code,
    fullName: p.subject.name,
    internalMarks: p.mark.totalInternal,
    neededEndSem: p.isImpossible ? 100 : p.neededMarksOutOf100,
    isImpossible: p.isImpossible,
  }));

  const impossibleCount = predictions.filter((p) => p.isImpossible).length;

  return (
    <PortalLayout currentPath="/marks" title="Marks & CGPA Predictor">
      <div className="space-y-6">
        {/* =========================================================================
            1. TARGET CGPA SLIDER & REAL-TIME PREDICTOR CONTROL
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
                  Compute required end-sem examination marks (out of 100) per subject
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[var(--app-text-muted)]">Target CGPA:</span>
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
              onChange={(e) => setTargetCgpa(Number(e.target.value))}
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
            <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>
                Target <b>{targetCgpa.toFixed(1)}</b> is mathematically impossible for {impossibleCount} subject(s) because required end-sem marks exceed 100/100 based on internal scores.
              </span>
            </div>
          )}
        </div>

        {/* =========================================================================
            2. EDITABLE INTERNAL MARKS & COMPUTED PREDICTIONS TABLE
            ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--app-text)]">
              Internal Assessments & Needed End-Sem
            </h3>
            <span className="text-xs text-[var(--app-text-muted)]">50% Internal / 50% End-Sem Weight</span>
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
                  <th className="py-2.5 px-3">Total (/50)</th>
                  <th className="py-2.5 px-3 text-right">Needed in End-Sem (/100)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]">
                {predictions.map((p) => {
                  const currentMark = marks.find((m) => m.subjectId === p.subject.id) || {
                    internal1: 20,
                    internal2: 20,
                    assignment: 8,
                    totalInternal: 40,
                  };

                  return (
                    <tr key={p.subject.id} className="hover:bg-[var(--app-surface-subtle)]/50 transition">
                      <td className="py-2.5 px-3 font-bold text-[var(--app-text)]">
                        <div>{p.subject.name}</div>
                        <span className="text-[10px] font-mono text-[var(--app-text-muted)]">
                          {p.subject.code}
                        </span>
                      </td>
                      <td className="py-2.5 px-3 font-mono">{p.subject.credits}</td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={currentMark.internal1}
                          onChange={(e) =>
                            handleMarkChange(p.subject.id, 'internal1', Number(e.target.value))
                          }
                          className="w-14 px-2 py-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-subtle)] font-mono text-center"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          max="25"
                          value={currentMark.internal2}
                          onChange={(e) =>
                            handleMarkChange(p.subject.id, 'internal2', Number(e.target.value))
                          }
                          className="w-14 px-2 py-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-subtle)] font-mono text-center"
                        />
                      </td>
                      <td className="py-2.5 px-3">
                        <input
                          type="number"
                          min="0"
                          max="10"
                          value={currentMark.assignment}
                          onChange={(e) =>
                            handleMarkChange(p.subject.id, 'assignment', Number(e.target.value))
                          }
                          className="w-14 px-2 py-1 rounded-lg border border-[var(--app-border)] bg-[var(--app-surface-subtle)] font-mono text-center"
                        />
                      </td>
                      <td className="py-2.5 px-3 font-mono font-black text-[var(--app-text)]">
                        {currentMark.totalInternal}/50
                      </td>
                      <td className="py-2.5 px-3 text-right">
                        {p.isImpossible ? (
                          <div className="text-right">
                            <span className="text-xs font-black text-red-500 bg-red-500/10 px-2 py-0.5 rounded-full">
                              Not Reachable (&gt;100)
                            </span>
                            <p className="text-[10px] text-[var(--app-text-muted)] mt-0.5">
                              Max CGPA: {p.bestAchievableCgpa} ({p.bestAchievableGrade})
                            </p>
                          </div>
                        ) : (
                          <div className="text-right">
                            <span className="text-sm font-black text-emerald-500 font-mono">
                              {p.neededMarksOutOf100}/100
                            </span>
                            <p className="text-[10px] text-[var(--app-text-muted)]">
                              For {p.targetGrade}
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
            3. RECHARTS VISUALIZATION: NEEDED END-SEM MARKS COMPARISON
            ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)]">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-black uppercase tracking-wider text-[var(--app-text)]">
              Needed End-Sem Marks vs Subject Internals
            </h3>
            <span className="text-xs text-[var(--app-text-muted)]">Passing threshold: 45 / 100</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis
                  dataKey="name"
                  stroke={theme === 'dark' ? '#a3a3a3' : '#5f5f5f'}
                  fontSize={11}
                  tickLine={false}
                />
                <YAxis
                  stroke={theme === 'dark' ? '#a3a3a3' : '#5f5f5f'}
                  fontSize={11}
                  domain={[0, 100]}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: theme === 'dark' ? '#0f0f0f' : '#ffffff',
                    border: `1px solid ${theme === 'dark' ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)'}`,
                    borderRadius: '12px',
                    color: theme === 'dark' ? '#ffffff' : '#000000',
                    fontSize: '12px',
                  }}
                />
                <Bar dataKey="neededEndSem" radius={[6, 6, 0, 0]}>
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.isImpossible ? '#ef4444' : '#f5b800'}
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
