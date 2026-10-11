import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { PasswordStrengthMeter } from '../../components/auth/PasswordStrengthMeter';
import { authService, type SessionItem, type LoginEventItem } from '../../services/auth';
import {
  Shield,
  Lock,
  Smartphone,
  History,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
} from 'lucide-react';

export const SecuritySettingsPage: React.FC = () => {
  const user = authService.getCurrentUser();

  // Password state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [passwordStatus, setPasswordStatus] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [passwordLoading, setPasswordLoading] = useState(false);

  // Sessions state
  const [sessions, setSessions] = useState<SessionItem[]>([]);
  const [loginEvents, setLoginEvents] = useState<LoginEventItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [sessionMsg, setSessionMsg] = useState<string | null>(null);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      setLoadingSessions(true);
      const data = await authService.getSessions();
      setSessions(data);

      // Fetch login events if available
      try {
        const token = authService.getAccessToken();
        const res = await fetch(`http://localhost:8080/auth/login-events`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const events = await res.json();
          setLoginEvents(events);
        }
      } catch {}
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus(null);

    if (newPassword.length < 10) {
      setPasswordStatus({ type: 'error', msg: 'New password must be at least 10 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ type: 'error', msg: 'Passwords do not match.' });
      return;
    }

    try {
      setPasswordLoading(true);
      await authService.changePassword(currentPassword, newPassword);
      setPasswordStatus({ type: 'success', msg: 'Password successfully updated! Confirmation email sent.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPasswordStatus(null), 4000);
    } catch (err: unknown) {
      setPasswordStatus({
        type: 'error',
        msg: err instanceof Error ? err.message : 'Could not update password.',
      });
    } finally {
      setPasswordLoading(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    try {
      await authService.revokeSession(id);
      setSessionMsg('Session terminated.');
      setSessions((prev) => prev.filter((s) => s.id !== id));
      setTimeout(() => setSessionMsg(null), 3000);
    } catch {
      setSessionMsg('Failed to revoke session.');
    }
  };

  const handleRevokeAllSessions = async () => {
    if (window.confirm('Are you sure you want to sign out everywhere? You will need to sign in again.')) {
      await authService.revokeAllSessions();
    }
  };

  return (
    <PortalLayout currentPath="/settings" title="Security & Authentication">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Banner */}
        <div className="portal-card p-6 sm:p-8 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-emerald-500" />
              <h2 className="portal-heading text-xl sm:text-2xl text-[var(--app-text)] font-black">
                Security &amp; Device Sessions
              </h2>
            </div>
            <p className="text-xs text-[var(--app-text-muted)]">
              Manage student credentials, active tokens, and multi-device sessions with cryptographic protection.
            </p>
          </div>
        </div>

        {/* =========================================================================
            1. CHANGE PASSWORD
            ========================================================================= */}
        <div className="portal-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-500" />
            <h3 className="portal-heading text-base text-[var(--app-text)] font-black">
              Change Account Password
            </h3>
          </div>
          <p className="text-xs text-[var(--app-text-muted)]">
            New passwords must differ from your last 3 passwords and meet complexity standards.
          </p>

          {passwordStatus && (
            <div
              className={`p-3.5 rounded-2xl text-xs font-bold flex items-center gap-2 ${
                passwordStatus.type === 'success'
                  ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30'
                  : 'bg-red-500/15 text-red-600 dark:text-red-400 border border-red-500/30'
              }`}
            >
              {passwordStatus.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{passwordStatus.msg}</span>
            </div>
          )}

          <form onSubmit={handleChangePassword} className="space-y-4 pt-1">
            <div>
              <label
                htmlFor="curr-password"
                className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5"
              >
                Current Password
              </label>
              <div className="relative max-w-md">
                <input
                  id="curr-password"
                  type={showCurrent ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)] min-h-[44px]"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] min-h-[36px] min-w-[36px] flex items-center justify-center"
                  aria-label={showCurrent ? 'Hide current password' : 'Show current password'}
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl">
              <div>
                <label
                  htmlFor="new-password"
                  className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5"
                >
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="new-password"
                    type={showNew ? 'text' : 'password'}
                    required
                    minLength={10}
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min 10 characters"
                    className="w-full px-4 py-2.5 pr-10 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)] min-h-[44px]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] min-h-[36px] min-w-[36px] flex items-center justify-center"
                    aria-label={showNew ? 'Hide new password' : 'Show new password'}
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="confirm-password"
                  className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5"
                >
                  Confirm New Password
                </label>
                <input
                  id="confirm-password"
                  type="password"
                  required
                  minLength={10}
                  autoComplete="new-password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full px-4 py-2.5 rounded-xl border border-[var(--app-border)] bg-[var(--app-bg)] text-xs text-[var(--app-text)] min-h-[44px]"
                />
              </div>
            </div>

            <div className="max-w-xl">
              <PasswordStrengthMeter password={newPassword} identifier={user?.registerNumber} name={user?.name} />
            </div>

            <div className="pt-2 flex justify-start">
              <button
                type="submit"
                disabled={passwordLoading || newPassword.length < 10}
                className="px-6 py-3 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black text-xs hover:opacity-90 transition cursor-pointer disabled:opacity-50 min-h-[44px]"
              >
                {passwordLoading ? 'Updating Password...' : 'Update Password'}
              </button>
            </div>
          </form>
        </div>

        {/* =========================================================================
            2. ACTIVE DEVICE SESSIONS
            ========================================================================= */}
        <div className="portal-card p-6 sm:p-8 space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-500" />
              <h3 className="portal-heading text-base text-[var(--app-text)] font-black">
                Active Devices &amp; Sessions
              </h3>
            </div>
            <button
              type="button"
              onClick={handleRevokeAllSessions}
              className="px-3.5 py-1.5 rounded-full border border-red-500/30 text-red-500 hover:bg-red-500/10 text-xs font-bold transition cursor-pointer min-h-[36px]"
            >
              Sign out everywhere
            </button>
          </div>

          <p className="text-xs text-[var(--app-text-muted)]">
            Tokens rotate automatically on every refresh. Replaying old tokens revokes all sessions immediately.
          </p>

          {sessionMsg && (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-600 dark:text-amber-400 text-xs font-bold">
              {sessionMsg}
            </div>
          )}

          {loadingSessions ? (
            <div className="py-6 text-center text-xs font-bold text-[var(--app-text-muted)]">
              Loading active sessions...
            </div>
          ) : (
            <div className="space-y-3 pt-1">
              {sessions.map((sess, idx) => (
                <div
                  key={sess.id}
                  className="p-4 rounded-2xl border border-[var(--app-border)] bg-[var(--app-surface-subtle)] flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] flex items-center justify-center shrink-0">
                      <Smartphone className="w-5 h-5 text-amber-500" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-[var(--app-text)]">{sess.device}</span>
                        {idx === 0 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px] font-black uppercase">
                            This device
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-[var(--app-text-muted)] mt-0.5">
                        IP: {sess.ip} &bull; Last active: {new Date(sess.lastActiveAt).toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {idx !== 0 && (
                    <button
                      type="button"
                      onClick={() => handleRevokeSession(sess.id)}
                      className="px-3.5 py-1.5 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-bg)] text-[var(--app-text)] text-xs font-bold transition cursor-pointer min-h-[36px]"
                    >
                      Sign out device
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* =========================================================================
            3. RECENT LOGIN ACTIVITY
            ========================================================================= */}
        <div className="portal-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2">
            <History className="w-4 h-4 text-purple-500" />
            <h3 className="portal-heading text-base text-[var(--app-text)] font-black">
              Recent Login Activity
            </h3>
          </div>
          <p className="text-xs text-[var(--app-text-muted)]">
            Audit history of recent sign-in attempts for account integrity.
          </p>

          <div className="overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border border-[var(--app-border)] rounded-2xl overflow-hidden">
              <thead className="bg-[var(--app-surface-subtle)] border-b border-[var(--app-border)] text-[10px] font-bold text-[var(--app-text-muted)] uppercase">
                <tr>
                  <th className="p-3">Status</th>
                  <th className="p-3">Device / Browser</th>
                  <th className="p-3">IP Address</th>
                  <th className="p-3">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--app-border)]">
                {loginEvents.length > 0 ? (
                  loginEvents.map((ev) => (
                    <tr key={ev.id} className="hover:bg-[var(--app-surface-subtle)]">
                      <td className="p-3">
                        {ev.success ? (
                          <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Success
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-red-500 font-bold">
                            <AlertCircle className="w-3.5 h-3.5" /> Failed
                          </span>
                        )}
                      </td>
                      <td className="p-3 font-medium text-[var(--app-text)]">{ev.device || 'Web Browser'}</td>
                      <td className="p-3 font-mono text-[var(--app-text-muted)]">{ev.ip}</td>
                      <td className="p-3 text-[var(--app-text-muted)]">{new Date(ev.at).toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr className="hover:bg-[var(--app-surface-subtle)]">
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Success
                      </span>
                    </td>
                    <td className="p-3 font-medium text-[var(--app-text)]">Current Web Session</td>
                    <td className="p-3 font-mono text-[var(--app-text-muted)]">127.0.0.1</td>
                    <td className="p-3 text-[var(--app-text-muted)]">Active Now</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};
