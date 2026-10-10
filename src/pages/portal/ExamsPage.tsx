import React, { useState, useMemo } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import {
  Clock,
  Sparkles,
  Calendar,
  AlertTriangle,
  BookOpen,
} from 'lucide-react';

export const ExamsPage: React.FC = () => {
  const user = db.getUser();
  const exams = db.getExams();
  const subjects = db.getSubjects();
  const syllabusUnits = db.getSyllabusUnits();

  // Student's editable unit progress (saved in db/localStorage)
  const [unitProgress, setUnitProgress] = useState<Record<string, boolean>>(() =>
    db.getUnitProgress()
  );

  // Daily study hours preference (from settings, default 4h)
  const [dailyHours, setDailyHours] = useState<number>(user.settings?.dailyStudyHours || 4);

  const handleToggleUnit = (unitId: string) => {
    const updated = db.toggleUnitProgress(unitId);
    setUnitProgress({ ...updated });
  };

  const handleHoursChange = (hours: number) => {
    setDailyHours(hours);
    db.updateUserSettings({ dailyStudyHours: hours });
  };

  // Exam countdowns
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

  // Dynamic day-by-day study plan generated via official algorithm
  const planResult = useMemo(() => {
    return db.getStudyPlan(dailyHours);
  }, [dailyHours, unitProgress]);

  // Per-subject unit progress stats
  const subjectProgressStats = useMemo(() => {
    return subjects.map((sub) => {
      const units = syllabusUnits.filter((u) => u.subjectId === sub.id);
      const coveredCount = units.filter((u) => unitProgress[u.id]).length;
      const totalCount = units.length;
      const pct = totalCount > 0 ? Math.round((coveredCount / totalCount) * 100) : 0;
      return {
        subject: sub,
        units,
        coveredCount,
        totalCount,
        percentage: pct,
      };
    });
  }, [subjects, syllabusUnits, unitProgress]);

  return (
    <PortalLayout currentPath="/exams" title="Exam Countdown & Study Planner">
      <div className="space-y-8">
        {/* Header Hero Banner with Mascot */}
        <div className="p-6 sm:p-8 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-3 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-black text-[var(--accent-yellow)]">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Dynamic Syllabus-Weighted Planner</span>
            </div>
            <h2 className="portal-heading text-2xl sm:text-3xl text-[var(--app-text)]">
              Syllabus Coverage & Day-by-Day Study Plan
            </h2>
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)] leading-relaxed">
              Official exam timetable synced from college records. Tick syllabus units as you study to automatically re-balance your daily schedule before exams.
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
            1. EXAM COUNTDOWN CARDS (FROM COLLEGE RECORDS)
            ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="portal-heading text-lg text-[var(--app-text)]">
              Official Semester Examination Timetable
            </h3>
            <span className="text-xs font-bold text-[var(--app-text-muted)]">
              {examWithCountdowns.length} Scheduled · Read-Only
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-3 sm:gap-4">
            {examWithCountdowns.map((exam) => {
              const isUrgent = exam.daysLeft <= 14;
              return (
                <div
                  key={exam.id}
                  className={`p-4 rounded-2xl bg-[var(--app-surface)] border shadow-[var(--card-shadow)] space-y-2 relative overflow-hidden transition-all ${
                    isUrgent ? 'border-amber-500/50' : 'border-[var(--app-border)]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-[var(--app-surface-subtle)] text-[var(--app-text)] border border-[var(--app-border)]">
                      {exam.subjectCode}
                    </span>
                    <span
                      className={`text-[10px] font-black px-2 py-0.5 rounded-full ${
                        isUrgent
                          ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border border-amber-500/30'
                          : 'bg-[var(--app-surface-subtle)] text-[var(--app-text-muted)]'
                      }`}
                    >
                      {exam.daysLeft === 0 ? 'Today!' : `${exam.daysLeft}d left`}
                    </span>
                  </div>

                  <div>
                    <h4 className="font-extrabold text-xs text-[var(--app-text)] truncate">
                      {exam.subjectName}
                    </h4>
                    <p className="text-[10px] text-[var(--app-text-muted)] flex items-center gap-1 mt-1 font-mono">
                      <Calendar className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span>{exam.examDate}</span>
                    </p>
                    <p className="text-[10px] text-[var(--app-text-muted)] flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-neutral-400 shrink-0" />
                      <span>{exam.startTime} ({exam.room})</span>
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            2. SYLLABUS UNIT PROGRESS TRACKER (STUDENT'S OWN STUDY PROGRESS)
            ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[var(--app-border)] pb-4">
            <div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-[var(--accent-yellow)]" />
                <h3 className="portal-heading text-base text-[var(--app-text)]">
                  Syllabus Units & Your Study Progress
                </h3>
              </div>
              <p className="text-xs text-[var(--app-text-muted)] mt-1">
                Tick the official syllabus units you have studied. Your study planner updates dynamically.
              </p>
            </div>

            {/* Daily Study Hours Slider */}
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold text-[var(--app-text-muted)]">Daily Study Quota:</span>
              <div className="flex items-center gap-1">
                {[3, 4, 5, 6].map((hrs) => (
                  <button
                    key={hrs}
                    type="button"
                    onClick={() => handleHoursChange(hrs)}
                    className={`px-2.5 py-1 rounded-full text-xs font-black transition cursor-pointer ${
                      dailyHours === hrs
                        ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs'
                        : 'border border-[var(--app-border)] text-[var(--app-text-muted)] hover:text-[var(--app-text)]'
                    }`}
                  >
                    {hrs}h
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Subject Progress Bars & Unit Checklists */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {subjectProgressStats.map((stat) => (
              <div
                key={stat.subject.id}
                className="p-4 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] space-y-3"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[10px] font-black text-[var(--app-text-muted)]">
                      {stat.subject.code}
                    </span>
                    <span className="text-xs font-mono font-black text-[var(--app-text)]">
                      {stat.percentage}% ({stat.coveredCount}/{stat.totalCount} units)
                    </span>
                  </div>
                  <h4 className="font-extrabold text-xs text-[var(--app-text)] mt-0.5 truncate">
                    {stat.subject.name}
                  </h4>

                  {/* Progress bar */}
                  <div className="w-full h-2 rounded-full bg-[var(--app-border)] mt-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full transition-all duration-300"
                      style={{ width: `${stat.percentage}%` }}
                    />
                  </div>
                </div>

                {/* Units Checklist */}
                <div className="space-y-1.5 pt-1">
                  {stat.units.map((u) => {
                    const isCovered = !!unitProgress[u.id];
                    return (
                      <label
                        key={u.id}
                        className="flex items-start gap-2.5 p-1.5 rounded-lg hover:bg-[var(--app-surface)] cursor-pointer transition select-none text-left"
                      >
                        <input
                          type="checkbox"
                          checked={isCovered}
                          onChange={() => handleToggleUnit(u.id)}
                          className="mt-0.5 rounded accent-emerald-500 cursor-pointer"
                        />
                        <div className="text-[11px] leading-tight">
                          <span
                            className={`font-bold ${
                              isCovered
                                ? 'line-through text-[var(--app-text-muted)]'
                                : 'text-[var(--app-text)]'
                            }`}
                          >
                            Unit {u.unitNo}: {u.title}
                          </span>
                          <span className="text-[10px] text-[var(--app-text-muted)] font-mono ml-1.5">
                            ({u.estHours}h)
                          </span>
                        </div>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Feasibility Alert if plan is constrained */}
        {planResult.isConstrained && (
          <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-700 dark:text-amber-400 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-extrabold">Schedule Feasibility Alert</p>
              <p className="mt-0.5">
                The remaining syllabus hours exceed comfortable spacing before your nearest exams for:{' '}
                <b>{planResult.atRiskSubjects.map((s) => `${s.code} (${s.uncoveredHours}h)`).join(', ')}</b>.
                Consider increasing your daily study quota or ticking completed units.
              </p>
            </div>
          </div>
        )}

        {/* =========================================================================
            3. DYNAMIC 7-DAY STUDY SCHEDULE (DIFFERENT UNITS PER DAY, NO REPETITION)
            ========================================================================= */}
        <div className="p-5 sm:p-6 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="portal-heading text-base text-[var(--app-text)]">
                Generated Day-by-Day Study Schedule
              </h3>
              <p className="text-xs text-[var(--app-text-muted)] mt-0.5">
                Weighted by nearest exam, internal mark weakness, and remaining syllabus. Max {dailyHours}h/day.
              </p>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--app-text-muted)]">
              {planResult.totalAllocatedHours} total hours planned this week
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
            {planResult.days.map((day) => (
              <div
                key={day.dayIndex}
                className={`p-3.5 rounded-xl border flex flex-col justify-between min-h-[220px] transition-all ${
                  day.isToday
                    ? 'border-[var(--btn-primary-bg)] bg-[var(--app-surface-subtle)] ring-1 ring-[var(--btn-primary-bg)]'
                    : 'border-[var(--app-border)] bg-[var(--app-surface)]'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`text-xs font-black ${
                        day.isToday ? 'text-[var(--accent-yellow)] underline' : 'text-[var(--app-text)]'
                      }`}
                    >
                      {day.dayName}
                    </span>
                    <span className="text-[10px] font-mono text-[var(--app-text-muted)]">
                      {day.dateString}
                    </span>
                  </div>

                  {/* Tasks List */}
                  {day.isRest ? (
                    <div className="py-8 text-center text-xs font-bold text-[var(--app-text-muted)]">
                      <p>✨ Rest &</p>
                      <p>Consolidation</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {day.tasks.map((task, tIdx) => (
                        <div
                          key={tIdx}
                          className={`p-2 rounded-lg border text-left space-y-1 ${
                            task.isRevision
                              ? 'bg-amber-500/10 border-amber-500/20 text-amber-600 dark:text-amber-400'
                              : 'bg-[var(--app-surface-subtle)] border-[var(--app-border)] text-[var(--app-text)]'
                          }`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono font-black">
                            <span>{task.subjectCode}</span>
                            <span>{task.hours}h</span>
                          </div>
                          <p className="text-[11px] font-bold leading-tight line-clamp-2">
                            {task.unitTitle}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="pt-2 border-t border-[var(--app-border)] flex items-center justify-between text-[10px] font-mono text-[var(--app-text-muted)]">
                  <span>Day total:</span>
                  <span className="font-bold text-[var(--app-text)]">{day.totalHours}h</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};
