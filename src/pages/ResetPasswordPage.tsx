import React, { useState, useRef } from 'react';
import { KeyRound, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { OtpInput } from '../components/auth/OtpInput';
import { PasswordStrengthMeter } from '../components/auth/PasswordStrengthMeter';
import { authService } from '../services/auth';
import { navigate } from '../utils/navigation';

export const ResetPasswordPage: React.FC = () => {
  const [identifier, setIdentifier] = useState(() => {
    return new URLSearchParams(window.location.search).get('id') || '';
  });
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const newPasswordInputRef = useRef<HTMLInputElement>(null);
  const confirmPasswordInputRef = useRef<HTMLInputElement>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      setError('Register number or college ID is required.');
      return;
    }

    if (otp.length !== 6) {
      setError('Please enter the 6-digit recovery code.');
      return;
    }

    if (newPassword.length < 10) {
      setError('Password must be at least 10 characters long.');
      newPasswordInputRef.current?.focus();
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match.');
      confirmPasswordInputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      await authService.resetPassword(cleanId, otp, newPassword);
      navigate('/login?reset=true');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Password reset failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Set New Password"
      subtitle="Enter the one-time code and create a new secure password."
      mascotPose="celebrating"
      mascotTagline="Choose a strong password that differs from your last 3 passwords."
      backHref="/login"
      backLabel="Back to Sign in"
    >
      {error && (
        <div
          className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs sm:text-sm font-bold flex items-start gap-2.5"
          aria-live="polite"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleReset} className="space-y-4">
        {/* Identifier Field if not in URL */}
        {!new URLSearchParams(window.location.search).get('id') && (
          <div>
            <label
              htmlFor="reset-id"
              className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5"
            >
              Register number or college ID
            </label>
            <input
              id="reset-id"
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 21CS042"
              className="w-full px-4 py-3 rounded-2xl border border-[var(--app-border)] text-sm font-medium focus:ring-2 focus:ring-[var(--app-text)] outline-none transition bg-[var(--app-surface-subtle)] text-[var(--app-text)] min-h-[44px]"
            />
          </div>
        )}

        {/* 6-Digit OTP */}
        <div>
          <label className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider mb-2 text-center">
            6-Digit Recovery Code
          </label>
          <OtpInput value={otp} onChange={setOtp} disabled={loading} error={Boolean(error)} />
        </div>

        {/* New Password */}
        <div>
          <label
            htmlFor="reset-newpassword"
            className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5"
          >
            New Password
          </label>
          <div className="relative">
            <input
              id="reset-newpassword"
              ref={newPasswordInputRef}
              type={showPassword ? 'text' : 'password'}
              required
              minLength={10}
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full px-4 py-3 pr-11 rounded-2xl border border-[var(--app-border)] text-sm font-medium focus:ring-2 focus:ring-[var(--app-text)] outline-none transition bg-[var(--app-surface-subtle)] text-[var(--app-text)] min-h-[44px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer rounded-lg min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label
            htmlFor="reset-confirmpass"
            className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5"
          >
            Confirm New Password
          </label>
          <input
            id="reset-confirmpass"
            ref={confirmPasswordInputRef}
            type="password"
            required
            minLength={10}
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="••••••••••••"
            className="w-full px-4 py-3 rounded-2xl border border-[var(--app-border)] text-sm font-medium focus:ring-2 focus:ring-[var(--app-text)] outline-none transition bg-[var(--app-surface-subtle)] text-[var(--app-text)] min-h-[44px]"
          />
        </div>

        {/* Live Password Strength Meter */}
        <PasswordStrengthMeter password={newPassword} identifier={identifier} />

        <button
          type="submit"
          disabled={loading || otp.length !== 6 || newPassword.length < 10}
          className="w-full mt-4 py-3.5 px-6 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black text-sm hover:opacity-90 transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Update Password & Sign In</span>
            </>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};
