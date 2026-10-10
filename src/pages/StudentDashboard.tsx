import React from 'react';
import {
  LogOut,
  Calendar,
  Bell,
  TrendingUp,
  FileText,
} from 'lucide-react';
import { authService } from '../services/auth';
import { db } from '../services/db';
import { navigate } from '../utils/navigation';

export const StudentDashboard: React.FC = () => {
  const user = authService.getCurrentUser();
  const subjects = db.getSubjects();
  const requests = db.getRequests().filter((r) => r.registerNumber === (user?.registerNumber || '21CS042'));
  const circulars = db.getCirculars();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-[#f5f5f3] text-neutral-900 font-sans selection:bg-amber-300">
      {/* Top Navbar */}
      <header className="sticky top-0 z-30 h-16 px-4 sm:px-8 bg-white/80 backdrop-blur-md border-b border-neutral-200 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black text-xs">
            cc
          </div>
          <div>
            <span className="font-black text-sm tracking-tight text-neutral-900">
              CampusConnect
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
              Student Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-neutral-900">{user?.name || 'Aarav Sharma'}</p>
            <p className="text-[10px] text-neutral-500 font-mono">{user?.registerNumber || '21CS042'}</p>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-full bg-neutral-100 hover:bg-neutral-200 text-neutral-700 text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Welcome Header */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-neutral-900 tracking-tight">
                Welcome back, {user?.name || 'Aarav'}
              </h1>
              {user?.isDemo && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  Demo Account
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">
              {user?.department || 'Computer Science & Engineering'} &bull; Semester {user?.semester || 6}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <span className="text-xs font-bold text-neutral-700">Oct 10, 2026</span>
            </div>
          </div>
        </div>

        {/* 4 Metric Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Overall Attendance
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-neutral-900">84.8%</span>
              <span className="text-xs font-bold text-emerald-600">Above 75%</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Bunk Bank: <span className="font-bold text-emerald-700">2 safe skips</span>
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Current CGPA
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-neutral-900">8.65</span>
              <span className="text-xs font-bold text-neutral-500">/ 10.0</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Target: <span className="font-bold text-neutral-800">9.0</span> (Need 84 in end-sem)
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Active Approvals
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-600">1 Pending</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">HackFest OD Letter under review</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Attendance Streak
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-neutral-900">18 Days</span>
              <span className="text-xs font-bold text-amber-600">🔥 Active</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Next badge: 21-Day Master</p>
          </div>
        </div>

        {/* Content Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Course Attendance Grid */}
          <div className="lg:col-span-2 bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-neutral-700" />
                <h2 className="text-base font-black text-neutral-900">Subjects & Attendance</h2>
              </div>
              <span className="text-xs text-neutral-500 font-medium">75% Minimum Policy</span>
            </div>

            <div className="divide-y divide-neutral-100">
              {subjects.map((sub) => {
                const isSafe = sub.attendancePercent >= 75;
                const safeBunks = Math.max(
                  0,
                  Math.floor((sub.attendedClasses - 0.75 * sub.totalClasses) / 0.75)
                );
                return (
                  <div key={sub.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-neutral-900">{sub.name}</span>
                        <span className="text-[10px] font-mono text-neutral-500 bg-neutral-100 px-1.5 py-0.2 rounded">
                          {sub.code}
                        </span>
                      </div>
                      <p className="text-[11px] text-neutral-500 mt-0.5">
                        {sub.attendedClasses} / {sub.totalClasses} classes attended &bull; Internal: {sub.internalMarks}/50
                      </p>
                    </div>

                    <div className="flex items-center gap-3 sm:text-right">
                      <div className="text-right">
                        <span
                          className={`text-sm font-black ${
                            isSafe ? 'text-emerald-700' : 'text-red-600'
                          }`}
                        >
                          {sub.attendancePercent}%
                        </span>
                        <p className="text-[10px] text-neutral-500">
                          {safeBunks > 0 ? `${safeBunks} safe skips` : 'Attend next class'}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Col: Approval Tracker & Circulars */}
          <div className="space-y-6">
            {/* Approval Tracker Status */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-4 h-4 text-neutral-700" />
                  <h2 className="text-sm font-black text-neutral-900">Approval Tracker</h2>
                </div>
                <span className="text-[10px] font-bold text-neutral-500 uppercase">Live</span>
              </div>

              <div className="space-y-2.5">
                {requests.map((req) => (
                  <div
                    key={req.id}
                    className="p-3 rounded-xl bg-neutral-50 border border-neutral-200/80 space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-neutral-900">{req.title}</span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          req.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {req.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-600">{req.remarks}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Recent Circulars */}
            <div className="bg-white p-5 rounded-2xl border border-neutral-200 shadow-2xs space-y-3">
              <div className="flex items-center gap-2">
                <Bell className="w-4 h-4 text-neutral-700" />
                <h2 className="text-sm font-black text-neutral-900">Recent Circulars</h2>
              </div>

              <div className="space-y-2">
                {circulars.map((c) => (
                  <div key={c.id} className="p-2.5 rounded-xl hover:bg-neutral-50 transition border border-transparent hover:border-neutral-200">
                    <p className="text-xs font-bold text-neutral-800 line-clamp-1">{c.title}</p>
                    <p className="text-[10px] text-neutral-500 mt-0.5">{c.department} &bull; {c.date}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
