import React, { useState } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { useTheme } from '../../context/ThemeContext';
import { db } from '../../services/db';
import {
  Moon,
  Sun,
  Percent,
  GraduationCap,
  Bell,
  Lock,
  Save,
  CheckCircle2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const user = db.getUser();

  // Settings State
  const [threshold, setThreshold] = useState(user.settings.attendanceThreshold);
  const [internalWeight, setInternalWeight] = useState(user.settings.internalWeight);
  const [endSemWeight, setEndSemWeight] = useState(user.settings.endSemWeight);
  const [gradingScheme, setGradingScheme] = useState(user.settings.gradingScheme);
  const [emailAlerts, setEmailAlerts] = useState(user.settings.emailAlerts);

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState<string | null>(null);

  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSaveSettings = () => {
    db.updateUserSettings({
      attendanceThreshold: threshold,
      internalWeight,
      endSemWeight,
      gradingScheme,
      emailAlerts,
    });
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.length < 8) {
      setPasswordStatus('New password must be at least 8 characters long.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus('Passwords do not match.');
      return;
    }
    setPasswordStatus('Password successfully updated!');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setTimeout(() => setPasswordStatus(null), 3000);
  };

  const handleToggleAlert = (key: keyof typeof emailAlerts) => {
    setEmailAlerts((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  return (
    <PortalLayout currentPath="/settings" title="Preferences & Configuration">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner */}
        <div className="portal-card p-6 sm:p-8 flex items-center justify-between gap-4">
          <div>
            <h2 className="portal-heading text-xl sm:text-2xl text-[var(--app-text)]">
              Personalize Your Experience
            </h2>
            <p className="text-xs text-[var(--app-text-muted)] mt-1">
              Configure attendance thresholds, grading formulas, notification channels, and portal appearance.
            </p>
          </div>

          {savedSuccess && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-extrabold text-xs animate-scale-in">
              <CheckCircle2 className="w-4 h-4" />
              <span>Saved!</span>
            </div>
          )}
        </div>

        {/* =========================================================================
            1. THEME PREFERENCE
            ========================================================================= */}
        <div className="portal-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Sun className="w-4 h-4 text-[var(--accent-yellow)]" />
            <h3 className="portal-heading text-base text-[var(--app-text)]">
              Theme & Appearance
            </h3>
          </div>
          <p className="text-xs text-[var(--app-text-muted)]">
            CampusConnect supports both an organic warm light theme and an ultra-deep OLED dark theme with zero contrast compromises.
          </p>

          <div className="grid grid-cols-2 gap-4 max-w-md pt-2">
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 cursor-pointer transition ${
                theme === 'light'
                  ? 'border-black bg-neutral-100 text-black font-extrabold shadow-xs'
                  : 'border-[var(--app-border)] text-[var(--app-text-muted)] hover:border-black/30'
              }`}
            >
              <Sun className="w-5 h-5 text-amber-500" />
              <span className="text-xs">Light Theme</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={`p-4 rounded-2xl border text-center flex flex-col items-center gap-2 cursor-pointer transition ${
                theme === 'dark'
                  ? 'border-white bg-neutral-900 text-white font-extrabold shadow-xs'
                  : 'border-[var(--app-border)] text-[var(--app-text-muted)] hover:border-white/30'
              }`}
            >
              <Moon className="w-5 h-5 text-amber-400" />
              <span className="text-xs">Dark Theme</span>
            </button>
          </div>
        </div>

        {/* =========================================================================
            2. ATTENDANCE THRESHOLD
            ========================================================================= */}
        <div className="portal-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Percent className="w-4 h-4 text-[var(--accent-green)]" />
              <h3 className="portal-heading text-base text-[var(--app-text)]">
                Attendance Safety Threshold
              </h3>
            </div>
            <span className="font-mono text-base font-black text-[var(--accent-yellow)]">
              {threshold}%
            </span>
          </div>

          <p className="text-xs text-[var(--app-text-muted)]">
            The minimum attendance percentage required by your university regulations (default 75%). Safe skips and recovery counts recalculate automatically based on this value.
          </p>

          <div className="space-y-2 pt-2">
            <input
              type="range"
              min={60}
              max={90}
              step={1}
              value={threshold}
              onChange={(e) => setThreshold(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] font-mono text-[var(--app-text-muted)]">
              <span>60% (Lenient)</span>
              <span>75% (Standard)</span>
              <span>85% (Strict)</span>
              <span>90% (Distinction)</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            3. GRADING SCHEME & WEIGHT SPLIT
            ========================================================================= */}
        <div className="portal-card p-6 sm:p-8 space-y-6">
          <div className="flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-[var(--accent-yellow)]" />
            <h3 className="portal-heading text-base text-[var(--app-text)]">
              Grading Scheme & Assessment Weights
            </h3>
          </div>

          {/* Weight split */}
          <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-3">
            <div className="flex items-center justify-between text-xs font-bold">
              <span>Assessment Weight Distribution</span>
              <span className="font-mono text-[var(--accent-yellow)]">
                {internalWeight}% Internal / {endSemWeight}% End-Semester
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] block mb-1">
                  Internal Weight (%)
                </label>
                <input
                  type="number"
                  min={20}
                  max={60}
                  value={internalWeight}
                  onChange={(e) => {
                    const val = parseInt(e.target.value) || 50;
                    setInternalWeight(val);
                    setEndSemWeight(100 - val);
                  }}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)]"
                />
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] block mb-1">
                  End-Semester Weight (%)
                </label>
                <input
                  type="number"
                  disabled
                  value={endSemWeight}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)] opacity-70"
                />
              </div>
            </div>
          </div>

          {/* Grade point scale */}
          <div className="space-y-3">
            <span className="text-xs font-extrabold text-[var(--app-text)] uppercase tracking-wider block">
              Grade Point Scale Table
            </span>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border border-[var(--app-border)] rounded-xl overflow-hidden">
                <thead className="bg-[var(--app-surface-subtle)] border-b border-[var(--app-border)] text-[10px] font-bold text-[var(--app-text-muted)] uppercase">
                  <tr>
                    <th className="p-3">Grade Letter</th>
                    <th className="p-3">Min Overall %</th>
                    <th className="p-3">Grade Points (10-Scale)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[var(--app-border)]">
                  {gradingScheme.map((item, idx) => (
                    <tr key={item.grade} className="hover:bg-[var(--app-surface-subtle)]">
                      <td className="p-3 font-bold text-[var(--app-text)]">{item.grade}</td>
                      <td className="p-3">
                        <input
                          type="number"
                          value={item.minPercent}
                          onChange={(e) => {
                            const newScheme = [...gradingScheme];
                            newScheme[idx].minPercent = parseInt(e.target.value) || 0;
                            setGradingScheme(newScheme);
                          }}
                          className="w-16 px-2 py-1 rounded-md border border-[var(--app-border)] bg-[var(--app-bg)] text-xs"
                        />
                        <span className="ml-1 text-[var(--app-text-muted)]">%</span>
                      </td>
                      <td className="p-3 font-mono font-bold text-[var(--accent-yellow)]">
                        {item.points}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* =========================================================================
            4. EMAIL ALERTS & NOTIFICATIONS
            ========================================================================= */}
        <div className="portal-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <Bell className="w-4 h-4 text-blue-500" />
            <h3 className="portal-heading text-base text-[var(--app-text)]">
              Notification & Email Alerts
            </h3>
          </div>
          <p className="text-xs text-[var(--app-text-muted)]">
            Configure which events trigger immediate notifications to your registered college email.
          </p>

          <div className="space-y-3 pt-2">
            {[
              { key: 'lowAttendance', label: 'Attendance Risk Alerts (Drops near 75%)' },
              { key: 'approachingDeadlines', label: 'Assignment & Quiz Deadlines within 48h' },
              { key: 'classChanged', label: 'Timetable & Class Changes (Cancelled, Rescheduled, Room Changes)' },
              { key: 'feeDue', label: 'Fee Due Reminders (Due in 7 days)' },
              { key: 'feeOverdue', label: 'Fee Overdue Warnings' },
              { key: 'feedbackClosing', label: 'Course Feedback Form Deadlines (Closing in 3 days)' },
              { key: 'helpdeskUpdate', label: 'Helpdesk Ticket Updates & Technician Notes' },
              { key: 'requestStatus', label: 'Approval Status Updates & Department Clearance Stamps' },
              { key: 'circulars', label: 'Official College Circulars for Your Department' },
              { key: 'newBadges', label: 'New Badges & Streak Milestones Earned' },
            ].map(({ key, label }) => {
              const typedKey = key as keyof typeof emailAlerts;
              const isChecked = emailAlerts[typedKey];
              return (
                <label
                  key={key}
                  className="flex items-center justify-between p-3 rounded-xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] cursor-pointer hover:bg-[var(--app-bg)] transition"
                >
                  <span className="text-xs font-bold text-[var(--app-text)]">{label}</span>
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleToggleAlert(typedKey)}
                    className="w-4 h-4 accent-amber-400 rounded cursor-pointer"
                  />
                </label>
              );
            })}
          </div>
        </div>

        {/* =========================================================================
            5. CHANGE PASSWORD
            ========================================================================= */}
        <form onSubmit={handleChangePassword} className="portal-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[var(--app-text-muted)]" />
              <h3 className="portal-heading text-base text-[var(--app-text)]">
                Security & Credentials
              </h3>
            </div>
            <a
              href="/settings/security"
              onClick={(e) => {
                e.preventDefault();
                import('../../utils/navigation').then((m) => m.navigate('/settings/security'));
              }}
              className="text-xs font-bold text-amber-500 hover:underline cursor-pointer"
            >
              Manage Active Sessions &rarr;
            </a>
          </div>

          {passwordStatus && (
            <div
              className={`p-3 rounded-xl text-xs font-bold ${
                passwordStatus.includes('success')
                  ? 'bg-emerald-500/15 text-[var(--accent-green)] border border-emerald-500/30'
                  : 'bg-red-500/15 text-[var(--accent-red)] border border-red-500/30'
              }`}
            >
              {passwordStatus}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] block mb-1">
                Current Password
              </label>
              <input
                type="password"
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)]"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] block mb-1">
                New Password
              </label>
              <input
                type="password"
                required
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)]"
              />
            </div>

            <div>
              <label className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] block mb-1">
                Confirm Password
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3 py-2 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)]"
              />
            </div>
          </div>

          <div className="pt-2 flex justify-end">
            <button
              type="submit"
              className="px-5 py-2 rounded-full border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)] transition cursor-pointer"
            >
              Update Password
            </button>
          </div>
        </form>

        {/* Global Save Button Bar */}
        <div className="sticky bottom-6 z-20 flex justify-end">
          <button
            type="button"
            onClick={handleSaveSettings}
            className="px-8 py-3 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black text-xs flex items-center gap-2 cursor-pointer shadow-lg hover:opacity-95"
          >
            <Save className="w-4 h-4" />
            <span>Save All Preferences</span>
          </button>
        </div>
      </div>
    </PortalLayout>
  );
};
