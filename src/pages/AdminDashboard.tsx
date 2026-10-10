import React, { useState } from 'react';
import {
  LogOut,
  UserPlus,
  Users,
  Database,
  Calendar,
} from 'lucide-react';
import bcrypt from 'bcryptjs';
import { authService, COLLEGE_EMAIL_DOMAIN } from '../services/auth';
import { db } from '../services/db';
import type { User, StudentEnrollment } from '../services/db';
import { navigate } from '../utils/navigation';

export const AdminDashboard: React.FC = () => {
  const currentUser = authService.getCurrentUser();
  const [users, setUsers] = useState<User[]>(() => db.getUsers());
  const [enrollments] = useState<StudentEnrollment[]>(() => db.getEnrollments());

  // Form states for creating Faculty or Admin account
  const [newRole, setNewRole] = useState<'faculty' | 'admin'>('faculty');
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newStaffId, setNewStaffId] = useState('');
  const [newDept, setNewDept] = useState('Computer Science & Engineering');
  const [newPassword, setNewPassword] = useState('Password@123');
  const [formMsg, setFormMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    setFormMsg(null);

    if (!newEmail.toLowerCase().endsWith(COLLEGE_EMAIL_DOMAIN.toLowerCase())) {
      setFormMsg({
        type: 'error',
        text: `Official email must belong to ${COLLEGE_EMAIL_DOMAIN}`,
      });
      return;
    }

    if (newPassword.length < 8) {
      setFormMsg({
        type: 'error',
        text: 'Password must be at least 8 characters long.',
      });
      return;
    }

    // Check existing
    const existing = db.findUserByEmailOrRegNo(newEmail) || db.findUserByEmailOrRegNo(newStaffId);
    if (existing) {
      setFormMsg({
        type: 'error',
        text: 'A user with this email or staff ID already exists.',
      });
      return;
    }

    // Hash password with bcrypt
    const passwordHash = bcrypt.hashSync(newPassword, 10);
    const newStaffUser: User = {
      id: `usr-${Date.now()}`,
      name: newName.trim(),
      email: newEmail.trim().toLowerCase(),
      registerNumber: newStaffId.trim().toUpperCase(),
      role: newRole,
      department: newDept,
      passwordHash,
      createdAt: new Date().toISOString(),
    };

    db.addUser(newStaffUser);
    setUsers([...db.getUsers()]);
    setFormMsg({
      type: 'success',
      text: `Successfully created ${newRole} account for ${newName}!`,
    });

    // Reset form
    setNewName('');
    setNewEmail('');
    setNewStaffId('');
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
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 border border-purple-200">
              Admin Console
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-xs font-bold text-neutral-900">{currentUser?.name || 'Administrator'}</p>
            <p className="text-[10px] text-neutral-500 font-mono">{currentUser?.registerNumber || 'ADM-REG-001'}</p>
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
                Academic Administration Console
              </h1>
              {currentUser?.isDemo && (
                <span className="text-[10px] font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  Demo Account
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-neutral-600 mt-1 font-medium">
              Manage system users, student enrollment whitelist, and department permissions
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
              Total Active Users
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-neutral-900">{users.length}</span>
              <span className="text-xs text-neutral-500">accounts</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              {users.filter((u) => u.role === 'student').length} Students &bull;{' '}
              {users.filter((u) => u.role === 'faculty').length} Faculty &bull;{' '}
              {users.filter((u) => u.role === 'admin').length} Admins
            </p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Student Records Whitelist
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-2xl font-black text-purple-700">{enrollments.length}</span>
              <span className="text-xs text-neutral-500">enrolled</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">Eligible for public student registration</p>
          </div>

          <div className="bg-white p-4 rounded-xl border border-neutral-200 shadow-2xs">
            <span className="text-[11px] font-bold text-neutral-500 uppercase tracking-wider">
              Security Policy
            </span>
            <div className="flex items-baseline gap-2 mt-1">
              <span className="text-sm font-black text-emerald-700">BCrypt + JWT</span>
            </div>
            <p className="text-[11px] text-neutral-500 mt-1">
              Faculty & Admin created strictly by admin
            </p>
          </div>
        </div>

        {/* Create Faculty / Admin Section */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <UserPlus className="w-5 h-5 text-neutral-800" />
              <div>
                <h2 className="text-base font-black text-neutral-900">
                  Provision Faculty or Admin Account
                </h2>
                <p className="text-xs text-neutral-500">
                  Public sign-up is strictly student-only. Administrators provision staff accounts here.
                </p>
              </div>
            </div>
          </div>

          {formMsg && (
            <div
              className={`p-3 rounded-xl text-xs font-medium flex items-center gap-2 border ${
                formMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                  : 'bg-red-50 text-red-700 border-red-200'
              }`}
            >
              <span className="font-bold">{formMsg.type === 'success' ? '✓' : '⚠'}</span>
              <span>{formMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleCreateStaff} className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Account Role
              </label>
              <select
                value={newRole}
                onChange={(e) => setNewRole(e.target.value as 'faculty' | 'admin')}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium bg-neutral-50/50 outline-none focus:ring-1 focus:ring-black"
              >
                <option value="faculty">Faculty</option>
                <option value="admin">Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Full Name
              </label>
              <input
                type="text"
                required
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Dr. Sunita Rao"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium bg-neutral-50/50 outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Staff ID / Reg No
              </label>
              <input
                type="text"
                required
                value={newStaffId}
                onChange={(e) => setNewStaffId(e.target.value)}
                placeholder="FAC-ECE-202"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium bg-neutral-50/50 outline-none focus:ring-1 focus:ring-black uppercase"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Official Email
              </label>
              <input
                type="email"
                required
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder={`sunita${COLLEGE_EMAIL_DOMAIN}`}
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium bg-neutral-50/50 outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Department
              </label>
              <input
                type="text"
                required
                value={newDept}
                onChange={(e) => setNewDept(e.target.value)}
                placeholder="Computer Science & Engineering"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium bg-neutral-50/50 outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-neutral-700 uppercase mb-1">
                Initial Password
              </label>
              <input
                type="text"
                required
                minLength={8}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Password@123"
                className="w-full px-3 py-2 rounded-xl border border-neutral-300 text-xs font-medium bg-neutral-50/50 outline-none focus:ring-1 focus:ring-black"
              />
            </div>

            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-black text-white text-xs font-extrabold hover:bg-neutral-800 transition flex items-center gap-1.5 cursor-pointer"
              >
                <UserPlus className="w-3.5 h-3.5 text-amber-300" />
                <span>Create {newRole === 'faculty' ? 'Faculty' : 'Admin'} Account</span>
              </button>
            </div>
          </form>
        </div>

        {/* Manage Users Table */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-neutral-800" />
              <h2 className="text-base font-black text-neutral-900">System Users</h2>
            </div>
            <span className="text-xs text-neutral-500 font-medium">{users.length} Total Registered</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-2.5 px-3">Role</th>
                  <th className="py-2.5 px-3">Name</th>
                  <th className="py-2.5 px-3">Identifier</th>
                  <th className="py-2.5 px-3">Email</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Type</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-neutral-50/60 transition">
                    <td className="py-2.5 px-3">
                      <span
                        className={`font-bold uppercase tracking-wider text-[10px] px-2 py-0.5 rounded-full border ${
                          u.role === 'admin'
                            ? 'bg-purple-100 text-purple-800 border-purple-200'
                            : u.role === 'faculty'
                            ? 'bg-blue-100 text-blue-800 border-blue-200'
                            : 'bg-emerald-100 text-emerald-800 border-emerald-200'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-bold text-neutral-900">{u.name}</td>
                    <td className="py-2.5 px-3 font-mono text-neutral-600">{u.registerNumber}</td>
                    <td className="py-2.5 px-3 text-neutral-600">{u.email}</td>
                    <td className="py-2.5 px-3 text-neutral-600">{u.department}</td>
                    <td className="py-2.5 px-3">
                      {u.isDemo ? (
                        <span className="text-[10px] font-bold text-amber-700 bg-amber-50 px-1.5 py-0.2 rounded border border-amber-200">
                          Demo Seed
                        </span>
                      ) : (
                        <span className="text-[10px] text-neutral-400">Standard</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Student Whitelist Registry */}
        <div className="bg-white p-5 sm:p-6 rounded-2xl border border-neutral-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-neutral-800" />
              <div>
                <h2 className="text-base font-black text-neutral-900">
                  Pre-Enrolled Student Records Whitelist
                </h2>
                <p className="text-xs text-neutral-500">
                  Students can only register on /register if their register number and email match these verified records.
                </p>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 uppercase tracking-wider font-bold">
                <tr>
                  <th className="py-2.5 px-3">Reg No</th>
                  <th className="py-2.5 px-3">Verified Student Name</th>
                  <th className="py-2.5 px-3">College Email</th>
                  <th className="py-2.5 px-3">Department</th>
                  <th className="py-2.5 px-3">Semester</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {enrollments.map((e) => (
                  <tr key={e.registerNumber} className="hover:bg-neutral-50/60 transition">
                    <td className="py-2.5 px-3 font-mono font-bold text-neutral-900">
                      {e.registerNumber}
                    </td>
                    <td className="py-2.5 px-3 font-semibold text-neutral-800">{e.name}</td>
                    <td className="py-2.5 px-3 text-neutral-600">{e.email}</td>
                    <td className="py-2.5 px-3 text-neutral-600">{e.department}</td>
                    <td className="py-2.5 px-3 text-neutral-600">Sem {e.semester}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
};
