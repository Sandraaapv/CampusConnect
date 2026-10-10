import React, { useState, useMemo } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import type { Exam } from '../../services/db';
import {
  Clock,
  Sparkles,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

export const ExamsPage: React.FC = () => {
  const [exams] = useState<Exam[]>(() => db.getExams());
  const subjects = db.getSubjects();
  const marks = db.getMarks();

  // Study Planner States
  const [dailyHours, setDailyHours] = useState(5);
  const [coverageMap, setCoverageMap] = useState<Record<string, number>>(() => {
    const map: Record<string, number> = {};
    subjects.forEach((s) => {
      map[s.id] = s.syllabusCoveragePercent || 65;
    });
    return map;
  });

  const handleCoverageChange = (subjectId: string, val: number) => {
    setCoverageMap((prev) => ({
      ...prev,
      [subjectId]: val,
    }));
  };

  // Calculate days left for each exam
  const today = new Date();
  const examWithCountdowns = useMemo(() => {
    return exams.map((exam) => {
      const examDate = new Date(exam.examDate);
      const diffTime = examDate.getTime() - today.getTime();
      const diffDays = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
      return {
        ...exam,
        daysLeft: diffDays,
      };
    }).sort((a, b) => a.daysLeft - b.daysLeft);
  }, [exams, today]);

  // Generate weighted day-by-day study schedule
  const generatedPlan = useMemo(() => {
    // Determine priority score per subject:
    // Low internal marks + Low syllabus coverage = High priority!
    const subjectPriorities = subjects.map((sub) => {
      const markRecord = marks.find((m) => m.subjectId === sub.id);
      const internalScore = markRecord ? markRecord.totalInternal : 35; // out of 50
      const coverage = coverageMap[sub.id] ?? 65; // out of 100

      // Deficit score: max internal is 50, max coverage is 100
      const markDeficit = Math.max(0, 50 - internalScore);
      const coverageDeficit = Math.max(0, 100 - coverage);

      // Weighted score
      const priorityScore = markDeficit * 2 + coverageDeficit;

      return {
        subject: sub,
        internalScore,
        coverage,
        priorityScore: Math.max(1, priorityScore),
      };
    });

    const totalPriority = subjectPriorities.reduce((acc, curr) => acc + curr.priorityScore, 0);

    // Generate 7-day study breakdown
    const days: {
      dayName: string;
      dateString: string;
      allocations: {
        subjectCode: string;
        subjectName: string;
        hours: number;
        coverageFocus: string;
      }[];
    }[] = [];

    const dayNames = ['Today', 'Tomorrow', 'Day 3', 'Day 4', 'Day 5', 'Day 6', 'Day 7'];

    for (let i = 0; i < 7; i++) {
      const targetDate = new Date();
      targetDate.setDate(today.getDate() + i);
      const dateString = targetDate.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      });

      // Distribute dailyHours across top subjects based on weighting
      let allocatedToday = 0;
      const allocations: {
        subjectCode: string;
        subjectName: string;
        hours: number;
        coverageFocus: string;
      }[] = [];

      // Sort by priority for this day
      const sorted = [...subjectPriorities].sort((a, b) => b.priorityScore - a.priorityScore);

      sorted.slice(0, 3).forEach((item) => {
        let hrs = Math.round((item.priorityScore / totalPriority) * dailyHours * 1.5 * 10) / 10;
        if (hrs < 1) hrs = 1;
        if (allocatedToday + hrs > dailyHours) {
          hrs = Math.max(0.5, Math.round((dailyHours - allocatedToday) * 10) / 10);
        }
        if (hrs > 0 && allocatedToday < dailyHours) {
          allocations.push({
            subjectCode: item.subject.code,
            subjectName: item.subject.name,
            hours: hrs,
            coverageFocus:
              item.coverage < 60
                ? 'High-weight unit revisions & formulas'
                : 'PYQ problem solving & mock timed test',
          });
          allocatedToday += hrs;
        }
      });

      days.push({
        dayName: dayNames[i],
        dateString,
        allocations,
      });
    }

    return days;
  }, [subjects, marks, coverageMap, dailyHours, today]);

  return (
    <PortalLayout currentPath="/exams" title="Exam Countdown & Smart Planner">
      <div className="space-y-8">
        {/* Header Hero Banner with Mascot */}
        <div className="portal-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-black text-[var(--accent-yellow)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Smart Weakness-Weighted Planner</span>
            </div>
            <h2 className="portal-heading text-2xl sm:text-3xl text-[var(--app-text)]">
              Targeted Preparation. Zero Last-Minute Panic.
            </h2>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)] leading-relaxed">
              CampusConnect automatically distributes your study hours to give more time to subjects with lower internal marks and lower syllabus completion.
            </p>
          </div>

          <div className="w-32 h-32 shrink-0 flex items-center justify-center">
            <img
              src="/mascots/07-Exam countdown.png"
              alt="Exam countdown mascot"
              className="w-full h-full object-contain filter drop-shadow-md"
            />
          </div>
        </div>

        {/* =========================================================================
            1. EXAM COUNTDOWN CARDS
            ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="portal-heading text-lg text-[var(--app-text)]">
              Upcoming Semester Examinations
            </h3>
            <span className="text-xs font-bold text-[var(--app-text-muted)]">
              {examWithCountdowns.length} Scheduled
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {examWithCountdowns.map((exam) => {
              const isUrgent = exam.daysLeft <= 7;
              return (
                <div
                  key={exam.id}
                  className={`portal-card p-5 space-y-3 relative overflow-hidden transition-transform hover:-translate-y-0.5 ${
                    isUrgent ? 'border-amber-500/50' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[var(--app-surface-subtle)] text-[var(--app-text)] border border-[var(--app-border)]">
                      {exam.subjectCode}
                    </span>
                    <span
                      className={`text-xs font-black px-2.5 py-0.5 rounded-full ${
                        isUrgent
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-[var(--app-surface-subtle)] text-[var(--app-text-muted)]'
                      }`}
                    >
                      {exam.daysLeft === 0 ? 'Today!' : `${exam.daysLeft} days left`}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-sm text-[var(--app-text)] truncate">
                      {exam.subjectName}
                    </h4>
                    <p className="text-[11px] text-[var(--app-text-muted)] flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{exam.examDate} • {exam.startTime}</span>
                    </p>
                    <p className="text-[11px] text-[var(--app-text-muted)] flex items-center gap-1.5 mt-0.5">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Duration: {exam.duration} ({exam.room})</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            2. PLANNER CONTROLS (Study Hours & Syllabus Coverage)
            ========================================================================= */}
        <div className="portal-card p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--app-border)] pb-4">
            <div>
              <h3 className="portal-heading text-lg text-[var(--app-text)]">
                Tune Your Study Weights
              </h3>
              <p className="text-xs text-[var(--app-text-muted)]">
                Adjust daily available hours and mark your current syllabus coverage per subject.
              </p>
            </div>

            {/* Daily Hours Slider */}
            <div className="flex items-center gap-3 bg-[var(--app-surface-subtle)] px-4 py-2 rounded-xl border border-[var(--app-border)]">
              <Clock className="w-4 h-4 text-[var(--accent-yellow)]" />
              <div className="flex flex-col">
                <span className="text-[10px] font-bold text-[var(--app-text-muted)] uppercase">Daily Target</span>
                <span className="text-xs font-black text-[var(--app-text)]">{dailyHours} Hours / Day</span>
              </div>
              <input
                type="range"
                min={2}
                max={12}
                step={0.5}
                value={dailyHours}
                onChange={(e) => setDailyHours(parseFloat(e.target.value))}
                className="w-24 accent-amber-400 cursor-pointer ml-2"
              />
            </div>
          </div>

          {/* Syllabus Coverage Per Subject */}
          <div className="space-y-4">
            <label className="text-xs font-extrabold text-[var(--app-text)] uppercase tracking-wider block">
              Syllabus Coverage Progress
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {subjects.map((sub) => {
                const markRecord = marks.find((m) => m.subjectId === sub.id);
                const currentCov = coverageMap[sub.id] ?? 65;
                return (
                  <div
                    key={sub.id}
                    className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-2.5"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-extrabold text-xs text-[var(--app-text)] block">
                          {sub.code}
                        </span>
                        <span className="text-[11px] text-[var(--app-text-muted)] truncate block max-w-[160px]">
                          {sub.name}
                        </span>
                      </div>
                      <span className="font-mono text-xs font-bold text-[var(--accent-yellow)]">
                        {currentCov}%
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[10px] text-[var(--app-text-muted)]">
                      <span>Internal: {markRecord?.totalInternal ?? 35} / 50</span>
                      <span>Weight: {currentCov < 70 ? 'High' : 'Normal'}</span>
                    </div>

                    <input
                      type="range"
                      min={10}
                      max={100}
                      step={5}
                      value={currentCov}
                      onChange={(e) => handleCoverageChange(sub.id, parseInt(e.target.value))}
                      className="w-full accent-amber-400 cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. DAY-BY-DAY WEIGHTED STUDY SCHEDULE
            ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="portal-heading text-lg text-[var(--app-text)]">
              Generated 7-Day Weighted Schedule
            </h3>
            <span className="text-xs font-extrabold text-[var(--accent-green)] flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Dynamically Optimized</span>
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {generatedPlan.map((day, idx) => (
              <div
                key={day.dayName}
                className={`portal-card p-4 flex flex-col justify-between space-y-3 ${
                  idx === 0 ? 'border-amber-400/50 bg-amber-400/5' : ''
                }`}
              >
                <div>
                  <div className="flex items-center justify-between border-b border-[var(--app-border)] pb-2 mb-2">
                    <span className="font-extrabold text-xs text-[var(--app-text)]">
                      {day.dayName}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--app-text-muted)]">
                      {day.dateString}
                    </span>
                  </div>

                  <div className="space-y-2">
                    {day.allocations.map((alloc, i) => (
                      <div
                        key={i}
                        className="p-2 rounded-lg bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-left"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[10px] font-black text-[var(--app-text)]">
                            {alloc.subjectCode}
                          </span>
                          <span className="text-[10px] font-bold text-[var(--accent-yellow)]">
                            {alloc.hours}h
                          </span>
                        </div>
                        <p className="text-[9px] text-[var(--app-text-muted)] line-clamp-2 mt-1">
                          {alloc.coverageFocus}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-2 border-t border-[var(--app-border)] text-center text-[10px] font-bold text-[var(--app-text-muted)]">
                  Total: {day.allocations.reduce((sum, a) => sum + a.hours, 0)} hrs
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};
