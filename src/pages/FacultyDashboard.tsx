import React, { useState } from 'react';
import {
  LogOut,
  Check,
  X,
  FileText,
  Calendar,
} from 'lucide-react';
import { authService } from '../services/auth';
import { db } from '../services/db';
import type { RequestRecord } from '../services/db';
import { navigate } from '../utils/navigation';

export const FacultyDashboard: React.FC = () => {
  const user = authService.getCurrentUser();
  const [requests, setRequests] = useState<RequestRecord[]>(() => db.getRequests());
  const [remarksInput, setRemarksInput] = useState<Record<string, string>>({});

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleAction = (reqId: string, newStatus: 'Approved' | 'Rejected') => {
    const defaultRemark =
      newStatus === 'Approved'
        ? 'Verified attendance record. OD approved by faculty.'
        : 'Attendance criteria not met for duty leave.';
    const customRemark = remarksInput[reqId] || defaultRemark;

    db.updateRequestStatus(reqId, newStatus, customRemark);
    setRequests([...db.getRequests()]);
  };

  const pendingRequests = requests.filter(
    (r) => r.status === 'Faculty Review' || r.status === 'Pending'
  );

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
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 border border-blue-200">
              Faculty Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-neutral-900">{user?.name || 'Dr. Rajesh Kumar'}</p>
            <p className="text-[10px] text-neutral-500 font-mono">{user?.registerNumber || 'FAC-CSE-104'}</p>
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
                Welcome, {user?.name || 'Dr. Rajesh Kumar'}
              </h1>
              {user?.isDemo && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  Demo Account
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">
              Associate Professor &bull; {user?.department || 'Computer Science & Engineering'}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="px-3.5 py-1.5 rounded-xl bg-neutral-50 border border-neutral-200 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-neutral-500" />
              <span className="text-xs font-bold text-neutral-700">Oct 10, 2026</span>
            </div>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Pending Approvals
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-amber-600">{pendingRequests.length}</span>
              <span className="text-xs text-neutral-500">requests</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Awaiting your department review</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Assigned Courses
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-neutral-900">2</span>
              <span className="text-xs text-neutral-500">CS3602 (OS) &bull; CS3603 (DBMS)</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">68 Students enrolled</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Avg Attendance Rate
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-emerald-700">85.8%</span>
              <span className="text-xs font-bold text-emerald-600">Optimal</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Last marked: Yesterday 4:00 PM</p>
          </div>
        </div>

        {/* Pending Requests Queue */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-neutral-800" />
              <h2 className="text-base font-black text-neutral-900">Student Approval Requests</h2>
            </div>
            <span className="text-xs font-bold text-neutral-500">
              {pendingRequests.length} Pending Actions
            </span>
          </div>

          {pendingRequests.length === 0 ? (
            <div className="py-8 text-center text-neutral-500 text-sm">
              All approval requests have been processed!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingRequests.map((req) => (
                <div
                  key={req.id}
                  className="p-4 sm:p-5 rounded-xl border border-neutral-200/90 bg-neutral-50/60 flex flex-col md:flex-row md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-extrabold text-sm text-neutral-900">{req.title}</span>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
                        {req.type}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-600">
                      Applicant: <span className="font-bold text-neutral-800">{req.studentName}</span> ({req.registerNumber}) &bull; {req.department}
                    </p>
                    <p className="text-xs text-neutral-500 italic mt-1">{req.details}</p>
                    <p className="text-[11px] text-neutral-500 mt-0.5">Applied: {req.date}</p>
                  </div>

                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                    <input
                      type="text"
                      placeholder="Optional remark..."
                      value={remarksInput[req.id] || ''}
                      onChange={(e) =>
                        setRemarksInput({ ...remarksInput, [req.id]: e.target.value })
                      }
                      className="px-3 py-1.5 rounded-xl border border-neutral-300 text-xs focus:ring-1 focus:ring-black outline-none bg-white"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleAction(req.id, 'Approved')}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <Check className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleAction(req.id, 'Rejected')}
                        className="flex-1 sm:flex-none px-3.5 py-2 rounded-xl bg-red-100 hover:bg-red-200 text-red-700 font-bold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
