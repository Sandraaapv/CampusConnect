import React, { useState } from 'react';
import { MailCheck, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { OtpInput } from '../components/auth/OtpInput';
import { authService } from '../services/auth';
import { navigate } from '../utils/navigation';

export const VerifyEmailPage: React.FC = () => {
  const [identifier, setIdentifier] = useState(() => {
    return new URLSearchParams(window.location.search).get('id') || '';
  });
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) {
      setError('Please provide your register number or college ID.');
      return;
    }
    if (otp.length !== 6) {
      setError('Please enter the 6-digit code sent to your email.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authService.verifyEmail(identifier.trim(), otp);
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Verification failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0 || !identifier.trim()) return;
    try {
      setError(null);
      await authService.resendOtp(identifier.trim(), 'EMAIL_VERIFICATION');
      setResendCooldown(60);
      const interval = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to resend code.');
    }
  };

  return (
    <AuthLayout
      title="Verify Your College Email"
      subtitle="Enter the 6-digit verification code sent to your official college mailbox."
      mascotPose="thinking"
      mascotTagline="Check your inbox or spam folder for your one-time verification code."
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

      <form onSubmit={handleVerify} className="space-y-6 text-center">
        {!new URLSearchParams(window.location.search).get('id') && (
          <div className="text-left">
            <label
              htmlFor="verify-id"
              className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5"
            >
              Register number or college ID
            </label>
            <input
              id="verify-id"
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 21CS042"
              className="w-full px-4 py-3 rounded-2xl border border-[var(--app-border)] text-sm font-medium focus:ring-2 focus:ring-[var(--app-text)] outline-none transition bg-[var(--app-surface-subtle)] text-[var(--app-text)] min-h-[44px]"
            />
          </div>
        )}

        <div className="w-16 h-16 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
          <MailCheck className="w-8 h-8" />
        </div>

        <p className="text-xs sm:text-sm text-[var(--app-text-muted)] max-w-sm mx-auto">
          Codes are valid for 10 minutes and have a 5-attempt security limit.
        </p>

        <div className="py-2">
          <OtpInput
            value={otp}
            onChange={setOtp}
            disabled={loading}
            error={Boolean(error)}
          />
        </div>

        <div className="text-xs text-[var(--app-text-muted)] flex items-center justify-center gap-2">
          <span>Didn't get the code?</span>
          <button
            type="button"
            onClick={handleResend}
            disabled={resendCooldown > 0 || loading || !identifier.trim()}
            className="font-bold text-[var(--app-text)] hover:underline cursor-pointer disabled:opacity-50 min-h-[44px] inline-flex items-center"
          >
            {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
          </button>
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full py-3.5 px-6 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black text-sm hover:opacity-90 transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <span>Verify & Continue</span>
          )}
        </button>
      </form>
    </AuthLayout>
  );
};
