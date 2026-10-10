import React, { useState, useEffect, useMemo } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import type { TimetableSlot, DayOfWeek, ClassChange } from '../../services/collegeRecords';
import {
  Clock,
  Download,
  AlertTriangle,
  Sparkles,
  MapPin,
  User,
} from 'lucide-react';

const DAYS: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

// Fixed accessible subject color palette with high contrast in both light & dark mode
const SUBJECT_COLORS: Record<string, { bg: string; text: string; border: string; label: string }> = {
  'CS3601': { bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', text: 'text-emerald-700 dark:text-emerald-300', border: 'border-emerald-500/30', label: 'Algorithms' },
  'CS3602': { bg: 'bg-amber-500/10 dark:bg-amber-500/20', text: 'text-amber-700 dark:text-amber-300', border: 'border-amber-500/30', label: 'OS' },
  'CS3603': { bg: 'bg-blue-500/10 dark:bg-blue-500/20', text: 'text-blue-700 dark:text-blue-300', border: 'border-blue-500/30', label: 'DBMS' },
  'CS3604': { bg: 'bg-rose-500/10 dark:bg-rose-500/20', text: 'text-rose-700 dark:text-rose-300', border: 'border-rose-500/30', label: 'Networks' },
  'CS3605': { bg: 'bg-purple-500/10 dark:bg-purple-500/20', text: 'text-purple-700 dark:text-purple-300', border: 'border-purple-500/30', label: 'Cloud' },
  'CS3606': { bg: 'bg-teal-500/10 dark:bg-teal-500/20', text: 'text-teal-700 dark:text-teal-300', border: 'border-teal-500/30', label: 'AI/ML' },
};

export const TimetablePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [slots, setSlots] = useState<TimetableSlot[]>([]);
  const [changes, setChanges] = useState<ClassChange[]>([]);
  const [viewMode, setViewMode] = useState<'Week' | 'Day'>(() => {
    // Default to 'Day' view on mobile phone screens (<768px)
    return typeof window !== 'undefined' && window.innerWidth < 768 ? 'Day' : 'Week';
  });

  // Today's day name in user's timezone
  const todayDayName = useMemo<DayOfWeek>(() => {
    const dayIndex = new Date().getDay();
    const map: Record<number, DayOfWeek> = {
      1: 'Monday',
      2: 'Tuesday',
      3: 'Wednesday',
      4: 'Thursday',
      5: 'Friday',
      6: 'Saturday',
    };
    return map[dayIndex] || 'Monday';
  }, []);

  const [selectedDay, setSelectedDay] = useState<DayOfWeek>(todayDayName);

  useEffect(() => {
    try {
      setLoading(true);
      const allSlots = db.getTimetableSlots();
      const allChanges = db.getClassChanges();
      setSlots(allSlots);
      setChanges(allChanges);
      setError(null);
    } catch {
      setError('Unable to load official timetable records from college server.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Download .ics export for calendar
  const handleDownloadIcs = () => {
    const icsContent = db.getTimetableIcs();
    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'CampusConnect_Timetable_Sem6.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const periods = [1, 2, 3, 4, 5, 6, 7];
  const periodTimes: Record<number, { start: string; end: string }> = {
    1: { start: '09:00', end: '09:50' },
    2: { start: '10:00', end: '10:50' },
    3: { start: '11:10', end: '12:00' },
    4: { start: '12:10', end: '13:00' },
    5: { start: '14:00', end: '14:50' },
    6: { start: '15:00', end: '15:50' },
    7: { start: '16:00', end: '16:50' },
  };

  // Planner tasks for today for smart suggestions
  const plannerTasks = useMemo(() => {
    return [
      { subjectCode: 'CS3604', task: 'Revise Unit 3 Wireshark protocols' },
      { subjectCode: 'CS3601', task: 'Practice Red-Black Tree deletions' },
      { subjectCode: 'CS3603', task: 'Review B+ Tree indexing problems' },
    ];
  }, []);

  // Loading state
  if (loading) {
    return (
      <PortalLayout currentPath="/timetable" title="Academic Timetable">
        <div className="space-y-6 animate-pulse">
          <div className="h-10 bg-neutral-200 dark:bg-neutral-800 rounded-2xl w-1/3" />
          <div className="h-96 bg-neutral-200 dark:bg-neutral-800 rounded-3xl" />
        </div>
      </PortalLayout>
    );
  }

  // Error state
  if (error) {
    return (
      <PortalLayout currentPath="/timetable" title="Academic Timetable">
        <div className="p-8 text-center rounded-3xl bg-[var(--app-surface)] border border-rose-500/30 space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <h2 className="font-montserrat font-black text-xl text-[var(--app-text)] uppercase">
            Records Offline
          </h2>
          <p className="text-sm text-neutral-400">{error}</p>
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="px-5 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs"
          >
            Retry Connection
          </button>
        </div>
      </PortalLayout>
    );
  }

  // Empty state with mascot
  if (slots.length === 0) {
    return (
      <PortalLayout currentPath="/timetable" title="Academic Timetable">
        <div className="p-8 text-center rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] space-y-4">
          <img
            src="/mascots/02-Smart dashboard.png"
            alt="No timetable records"
            className="w-48 h-48 object-contain mx-auto opacity-80"
          />
          <h2 className="font-montserrat font-black text-xl text-[var(--app-text)] uppercase">
            No Timetable Published
          </h2>
          <p className="text-sm text-neutral-400">
            The college dean's office has not released class schedules for this academic term yet.
          </p>
        </div>
      </PortalLayout>
    );
  }

  return (
    <PortalLayout currentPath="/timetable" title="Official Timetable">
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>COLLEGE RECORDS · SEMESTER 6 · READ-ONLY</span>
            </div>
            <h1 className="font-montserrat font-black text-xl sm:text-2xl text-[var(--app-text)] tracking-tight uppercase mt-0.5">
              Class Schedule
            </h1>
          </div>

          <div className="flex items-center gap-2.5">
            {/* View Switch: Week | Day */}
            <div className="h-9 bg-[var(--app-surface-subtle)] p-1 rounded-full border border-[var(--app-border)] flex items-center gap-1">
              <button
                type="button"
                onClick={() => setViewMode('Week')}
                className={`px-3 py-1 rounded-full text-xs font-extrabold transition cursor-pointer ${
                  viewMode === 'Week'
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs'
                    : 'text-neutral-400 hover:text-[var(--app-text)]'
                }`}
              >
                Week View
              </button>
              <button
                type="button"
                onClick={() => setViewMode('Day')}
                className={`px-3 py-1 rounded-full text-xs font-extrabold transition cursor-pointer ${
                  viewMode === 'Day'
                    ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs'
                    : 'text-neutral-400 hover:text-[var(--app-text)]'
                }`}
              >
                Day View
              </button>
            </div>

            {/* Add to Calendar (.ics) */}
            <button
              type="button"
              onClick={handleDownloadIcs}
              className="h-9 px-3.5 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-[var(--app-text)] hover:bg-[var(--app-surface)] font-extrabold text-xs flex items-center gap-1.5 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Add to calendar (.ics)</span>
              <span className="sm:hidden">.ics</span>
            </button>
          </div>
        </div>

        {/* Day Selector (Shown for Day View) */}
        {viewMode === 'Day' && (
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            {DAYS.map((day) => {
              const isToday = day === todayDayName;
              const isSelected = day === selectedDay;
              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => setSelectedDay(day)}
                  className={`px-4 py-2 rounded-full font-bold text-xs whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs font-black'
                      : 'bg-[var(--app-surface)] text-neutral-400 hover:text-[var(--app-text)] border border-[var(--app-border)]'
                  }`}
                >
                  <span>{day}</span>
                  {isToday && (
                    <span className="px-1.5 py-0.2 rounded-full bg-[#f5b800] text-black font-black text-[9px]">
                      TODAY
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            WEEK GRID VIEW (Accessible subject color badges + text labels, Now marker)
            ========================================================================= */}
        {viewMode === 'Week' ? (
          <div className="rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[800px]">
              <thead>
                <tr className="border-b border-[var(--app-border)] bg-[var(--app-surface-subtle)]">
                  <th className="p-3.5 text-xs font-mono font-bold text-neutral-400 w-24">TIME</th>
                  {DAYS.map((day) => {
                    const isToday = day === todayDayName;
                    return (
                      <th
                        key={day}
                        className={`p-3.5 text-xs font-montserrat font-black uppercase tracking-tight ${
                          isToday
                            ? 'bg-[#f5b800]/10 text-[#f5b800] border-x border-[#f5b800]/30'
                            : 'text-[var(--app-text)]'
                        }`}
                      >
                        <div className="flex items-center gap-1.5">
                          <span>{day.slice(0, 3)}</span>
                          {isToday && (
                            <span className="px-1.5 py-0.2 rounded bg-[#f5b800] text-black font-black text-[8px]">
                              TODAY
                            </span>
                          )}
                        </div>
                      </th>
                    );
                  })}
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)] text-xs">
                {periods.map((periodNum) => {
                  const pTime = periodTimes[periodNum];
                  const isCurrentTime = periodNum === 2; // Demo current period

                  return (
                    <tr key={periodNum} className="hover:bg-[var(--app-surface-subtle)]/40 transition">
                      <td className="p-3 font-mono font-bold text-neutral-400 bg-[var(--app-surface-subtle)]/30 border-r border-[var(--app-border)]">
                        <div className="text-[11px] font-extrabold text-[var(--app-text)]">P{periodNum}</div>
                        <div className="text-[10px] text-neutral-400">{pTime.start}</div>
                      </td>

                      {DAYS.map((day) => {
                        const isToday = day === todayDayName;
                        const slot = slots.find((s) => s.day === day && s.period === periodNum);
                        const change = changes.find((c) => c.slotId === slot?.id);
                        const color = slot ? SUBJECT_COLORS[slot.subjectCode] : null;

                        return (
                          <td
                            key={day}
                            className={`p-2.5 align-top border-r border-[var(--app-border)] last:border-r-0 ${
                              isToday ? 'bg-[#f5b800]/5 border-x border-[#f5b800]/20' : ''
                            }`}
                          >
                            {slot ? (
                              <div
                                className={`p-2.5 rounded-2xl border ${
                                  color?.border || 'border-[var(--app-border)]'
                                } ${color?.bg || 'bg-[var(--app-surface)]'} space-y-1.5 transition`}
                              >
                                <div className="flex items-center justify-between gap-1">
                                  <span className={`text-[10px] font-mono font-black ${color?.text}`}>
                                    {slot.subjectCode} · {color?.label}
                                  </span>
                                  {isToday && isCurrentTime && (
                                    <span className="px-1.5 py-0.2 rounded bg-[#f5b800] text-black font-black text-[8px] uppercase">
                                      NOW
                                    </span>
                                  )}
                                </div>

                                <div className="font-extrabold text-xs text-[var(--app-text)] line-clamp-1 leading-tight">
                                  {slot.subjectName}
                                </div>

                                <div className="text-[10px] text-neutral-400 font-mono flex items-center justify-between pt-0.5">
                                  <span>{change?.newRoom || slot.room}</span>
                                  <span className="truncate max-w-[80px]">{slot.facultyName.split(' ')[1] || slot.facultyName}</span>
                                </div>

                                {/* Class Changes Badge */}
                                {change && (
                                  <div
                                    className={`px-2 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-wider border ${
                                      change.type === 'Cancelled'
                                        ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                        : change.type === 'Rescheduled'
                                        ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                        : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                    }`}
                                  >
                                    {change.type}
                                    {change.note ? `: ${change.note}` : ''}
                                  </div>
                                )}
                              </div>
                            ) : (
                              /* Quiet Empty Slot with Duration & Smart Planner Suggestion */
                              <div className="p-2.5 rounded-2xl border border-dashed border-neutral-300 dark:border-neutral-800 text-neutral-400 dark:text-neutral-600 space-y-1">
                                <span className="text-[10px] font-mono font-medium block">
                                  Free 50 min
                                </span>
                                {isToday && plannerTasks.length > 0 && periodNum === 4 && (
                                  <div className="text-[9px] font-bold text-amber-500/90 dark:text-amber-400/90 flex items-center gap-1 bg-amber-500/10 p-1 rounded-lg">
                                    <Sparkles className="w-2.5 h-2.5 shrink-0" />
                                    <span className="truncate">{plannerTasks[0].task}</span>
                                  </div>
                                )}
                              </div>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          /* =========================================================================
             DAY VIEW (Optimized for Phones & Focused Daily Timeline)
             ========================================================================= */
          <div className="space-y-3">
            {periods.map((periodNum) => {
              const pTime = periodTimes[periodNum];
              const slot = slots.find((s) => s.day === selectedDay && s.period === periodNum);
              const change = changes.find((c) => c.slotId === slot?.id);
              const isToday = selectedDay === todayDayName;
              const isCurrent = isToday && periodNum === 2;
              const color = slot ? SUBJECT_COLORS[slot.subjectCode] : null;

              return (
                <div
                  key={periodNum}
                  className={`p-4 rounded-2xl border transition ${
                    slot
                      ? `${color?.border || 'border-[var(--app-border)]'} ${
                          color?.bg || 'bg-[var(--app-surface)]'
                        }`
                      : 'border-dashed border-neutral-300 dark:border-neutral-800 bg-[var(--app-surface-subtle)]/40 text-neutral-400'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2 font-mono text-xs font-bold text-neutral-400">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{pTime.start} – {pTime.end}</span>
                      <span className="text-[10px] font-black uppercase text-[var(--app-text)]">
                        · Period {periodNum}
                      </span>
                    </div>

                    {isCurrent && (
                      <span className="px-2 py-0.5 rounded-full bg-[#f5b800] text-black font-black text-[10px] uppercase">
                        NOW
                      </span>
                    )}
                  </div>

                  {slot ? (
                    <div className="space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h3 className="font-montserrat font-black text-base text-[var(--app-text)]">
                            {slot.subjectName}
                          </h3>
                          <p className="text-xs font-mono font-bold text-neutral-400">
                            {slot.subjectCode} · {color?.label}
                          </p>
                        </div>

                        {change && (
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                              change.type === 'Cancelled'
                                ? 'bg-rose-500/20 text-rose-600 dark:text-rose-400 border-rose-500/30'
                                : change.type === 'Rescheduled'
                                ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 border-amber-500/30'
                                : 'bg-blue-500/20 text-blue-600 dark:text-blue-400 border-blue-500/30'
                            }`}
                          >
                            {change.type} {change.newRoom ? `(${change.newRoom})` : ''}
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-neutral-400 font-medium pt-1">
                        <div className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5" />
                          <span>{change?.newRoom || slot.room}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5" />
                          <span>{slot.facultyName}</span>
                        </div>
                      </div>

                      {change?.note && (
                        <p className="text-xs text-amber-600 dark:text-amber-400 bg-amber-500/10 p-2 rounded-xl">
                          Note: {change.note}
                        </p>
                      )}
                    </div>
                  ) : (
                    /* Free Period Slot in Day View with Smart Suggestion */
                    <div className="space-y-1.5">
                      <div className="text-xs font-bold text-neutral-400">
                        Free period (50 minutes)
                      </div>
                      {isToday && plannerTasks.length > 0 && (
                        <div className="flex items-center gap-2 p-2.5 rounded-xl bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold">
                          <Sparkles className="w-4 h-4 shrink-0" />
                          <span>Suggestion: {plannerTasks[periodNum % plannerTasks.length].task}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
