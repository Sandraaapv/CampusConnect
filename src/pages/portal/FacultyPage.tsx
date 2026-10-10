import React, { useState, useEffect, useMemo } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import { isFacultyAvailableNow } from '../../services/collegeRecords';
import type { FacultyMember } from '../../services/collegeRecords';
import {
  Search,
  Mail,
  Copy,
  Check,
  MapPin,
  X,
  ChevronRight,
  Filter,
} from 'lucide-react';

export const FacultyPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'my' | 'all'>('my');
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [selectedDept, setSelectedDept] = useState('All');
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState<FacultyMember | null>(null);

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim().toLowerCase());
    }, 250);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const allFaculty = useMemo(() => db.getFacultyList(), []);
  const myFaculty = useMemo(() => db.getMyFaculty(), []);

  // Filter based on tab, search query, and department
  const facultyList = useMemo(() => {
    const source = activeTab === 'my' ? myFaculty : allFaculty;
    return source.filter((f) => {
      const matchesDept = selectedDept === 'All' || f.department === selectedDept;
      if (!matchesDept) return false;

      if (!debouncedQuery) return true;

      const nameMatch = f.name.toLowerCase().includes(debouncedQuery);
      const subMatch = f.subjects.some(
        (s) =>
          s.name.toLowerCase().includes(debouncedQuery) ||
          s.code.toLowerCase().includes(debouncedQuery)
      );
      const specMatch = f.specializations.some((spec) =>
        spec.toLowerCase().includes(debouncedQuery)
      );
      const cabinMatch = f.cabin.toLowerCase().includes(debouncedQuery);

      return nameMatch || subMatch || specMatch || cabinMatch;
    });
  }, [activeTab, myFaculty, allFaculty, debouncedQuery, selectedDept]);

  const departments = useMemo(() => {
    const set = new Set<string>();
    allFaculty.forEach((f) => set.add(f.department));
    return ['All', ...Array.from(set)];
  }, [allFaculty]);

  const handleCopyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedEmail(email);
    setTimeout(() => setCopiedEmail(null), 2000);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setDebouncedQuery('');
    setSelectedDept('All');
  };

  return (
    <PortalLayout currentPath="/faculty" title="Faculty Directory">
      <div className="space-y-6">
        {/* Top Control Bar */}
        <div className="p-4 sm:p-5 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono text-neutral-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span>COLLEGE RECORDS · ACADEMIC ROSTER · READ-ONLY</span>
            </div>
            <h1 className="font-montserrat font-black text-xl sm:text-2xl text-[var(--app-text)] tracking-tight uppercase mt-0.5">
              Faculty Directory
            </h1>
          </div>

          {/* Two Tabs: "My faculty" | "All faculty" */}
          <div className="h-9 bg-[var(--app-surface-subtle)] p-1 rounded-full border border-[var(--app-border)] flex items-center gap-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={() => setActiveTab('my')}
              className={`px-4 py-1 rounded-full text-xs font-extrabold transition cursor-pointer ${
                activeTab === 'my'
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs'
                  : 'text-neutral-400 hover:text-[var(--app-text)]'
              }`}
            >
              My Faculty ({myFaculty.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-4 py-1 rounded-full text-xs font-extrabold transition cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] shadow-xs'
                  : 'text-neutral-400 hover:text-[var(--app-text)]'
              }`}
            >
              All Faculty ({allFaculty.length})
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="p-4 rounded-2xl bg-[var(--app-surface)] border border-[var(--app-border)] flex flex-col md:flex-row items-stretch md:items-center gap-3">
          {/* Debounced Search */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by name, subject, specialization, or cabin..."
              className="w-full pl-10 pr-4 py-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs text-[var(--app-text)] focus:outline-none"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-[var(--app-text)] text-xs"
              >
                Clear
              </button>
            )}
          </div>

          {/* Department Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-neutral-400 shrink-0" />
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3.5 py-2 rounded-full border border-[var(--app-border)] bg-[var(--app-surface-subtle)] text-xs font-bold text-[var(--app-text)] cursor-pointer focus:outline-none"
            >
              {departments.map((dept) => (
                <option key={dept} value={dept}>
                  {dept === 'All' ? 'All Departments' : dept}
                </option>
              ))}
            </select>
          </div>

          {(debouncedQuery || selectedDept !== 'All') && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="text-xs font-bold text-neutral-400 hover:text-[var(--app-text)] underline px-2 py-1"
            >
              Reset filters
            </button>
          )}
        </div>

        {/* =========================================================================
            FACULTY CARDS GRID
            ========================================================================= */}
        {facultyList.length === 0 ? (
          <div className="p-12 text-center rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] space-y-4">
            <img
              src="/mascots/05-Circulars and notes.png"
              alt="No faculty found"
              className="w-40 h-40 object-contain mx-auto opacity-70"
            />
            <h3 className="font-montserrat font-black text-lg text-[var(--app-text)] uppercase">
              No Faculty Found
            </h3>
            <p className="text-xs text-neutral-400 max-w-sm mx-auto">
              No faculty members match your query "{debouncedQuery || selectedDept}".
            </p>
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-4 py-2 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs"
            >
              Clear Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
            {facultyList.map((faculty) => {
              const isAvailable = isFacultyAvailableNow(faculty);

              return (
                <div
                  key={faculty.id}
                  className="p-5 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] flex flex-col justify-between space-y-4 hover:border-neutral-400 transition"
                >
                  <div className="space-y-3">
                    {/* Header: Name, Designation, Available Now Chip */}
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h2 className="font-montserrat font-black text-sm text-[var(--app-text)] leading-snug">
                          {faculty.name}
                        </h2>
                        <p className="text-[11px] font-bold text-neutral-400 mt-0.5">
                          {faculty.designation} · {faculty.department}
                        </p>
                      </div>

                      {/* "Available Now" Indicator using user's timezone */}
                      {isAvailable ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          <span>In Cabin</span>
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-neutral-200 dark:bg-neutral-800 text-neutral-400 text-[9px] font-bold uppercase tracking-wider shrink-0">
                          Office Hours
                        </span>
                      )}
                    </div>

                    {/* Cabin / Room */}
                    <div className="flex items-center gap-1.5 text-xs text-neutral-500 font-medium">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{faculty.cabin}</span>
                    </div>

                    {/* Subjects taught chips */}
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono font-bold text-neutral-400 uppercase">
                        Current Subjects
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {faculty.subjects.map((sub) => (
                          <span
                            key={sub.code}
                            className="px-2 py-0.5 rounded-lg bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-[10px] font-mono font-bold text-[var(--app-text)]"
                          >
                            {sub.code}: {sub.name}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Specialization Tags */}
                    <div className="flex flex-wrap gap-1 pt-1">
                      {faculty.specializations.map((spec) => (
                        <span
                          key={spec}
                          className="px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[9px] font-extrabold"
                        >
                          #{spec}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions & Detail Drawer trigger */}
                  <div className="pt-3 border-t border-[var(--app-border)] flex items-center justify-between gap-2">
                    {/* Copy email / mailto (Official college email only, no personal phones) */}
                    <div className="flex items-center gap-1">
                      <a
                        href={`mailto:${faculty.email}`}
                        className="px-2.5 py-1.5 rounded-full border border-[var(--app-border)] text-neutral-600 dark:text-neutral-400 hover:text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)] text-[11px] font-bold inline-flex items-center gap-1.5 transition"
                        title={faculty.email}
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>Email</span>
                      </a>

                      <button
                        type="button"
                        onClick={() => handleCopyEmail(faculty.email)}
                        className="p-1.5 rounded-full border border-[var(--app-border)] text-neutral-400 hover:text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)] transition cursor-pointer"
                        title="Copy email to clipboard"
                      >
                        {copiedEmail === faculty.email ? (
                          <Check className="w-3.5 h-3.5 text-emerald-500" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedFaculty(faculty)}
                      className="px-3 py-1.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-[11px] flex items-center gap-1 cursor-pointer"
                    >
                      <span>Hours & Bio</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* =========================================================================
            FACULTY DETAIL DRAWER / MODAL
            Full office-hours schedule table & subjects list
            ========================================================================= */}
        {selectedFaculty && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div
              className="fixed inset-0 bg-black/60 backdrop-blur-xs"
              onClick={() => setSelectedFaculty(null)}
            />

            <div className="relative bg-[var(--app-surface)] border border-[var(--app-border)] rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl z-10 animate-in fade-in zoom-in-95">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-montserrat font-black text-lg text-[var(--app-text)]">
                    {selectedFaculty.name}
                  </h3>
                  <p className="text-xs text-neutral-400 font-bold">
                    {selectedFaculty.designation} · {selectedFaculty.department}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedFaculty(null)}
                  className="p-1 rounded-full text-neutral-400 hover:text-[var(--app-text)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Bio */}
              <p className="text-xs text-neutral-500 leading-relaxed">
                {selectedFaculty.bio}
              </p>

              {/* Cabin & Email Info */}
              <div className="p-3.5 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-mono text-[10px] uppercase font-bold">Office Cabin</span>
                  <span className="font-bold text-[var(--app-text)]">{selectedFaculty.cabin}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-400 font-mono text-[10px] uppercase font-bold">Official Email</span>
                  <span className="font-mono text-[var(--app-text)] font-bold">{selectedFaculty.email}</span>
                </div>
              </div>

              {/* Full Office Hours Schedule Table */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-montserrat font-black text-[var(--app-text)] uppercase">
                    Weekly Office Hours
                  </span>
                  {isFacultyAvailableNow(selectedFaculty) && (
                    <span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400">
                      ● Active Right Now
                    </span>
                  )}
                </div>

                <div className="rounded-2xl border border-[var(--app-border)] overflow-hidden">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-[var(--app-surface-subtle)] text-[10px] font-mono text-neutral-400 uppercase">
                      <tr>
                        <th className="p-2.5">Day</th>
                        <th className="p-2.5">Available Window</th>
                        <th className="p-2.5 text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--app-border)]">
                      {selectedFaculty.officeHours.map((oh, idx) => (
                        <tr key={idx} className="hover:bg-[var(--app-surface-subtle)]/30">
                          <td className="p-2.5 font-bold text-[var(--app-text)]">{oh.day}</td>
                          <td className="p-2.5 font-mono text-neutral-400">{oh.startTime || (oh as any).start} – {oh.endTime || (oh as any).end}</td>
                          <td className="p-2.5 text-right font-mono text-[10px] text-neutral-500">
                            Walk-in / Appt
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="button"
                  onClick={() => setSelectedFaculty(null)}
                  className="px-5 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs cursor-pointer"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </PortalLayout>
  );
};
