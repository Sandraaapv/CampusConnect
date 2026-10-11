import React, { useState, useRef } from 'react';
import { Mail, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { authService } from '../services/auth';
import { navigate } from '../utils/navigation';

export const ForgotPasswordPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const identifierInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      setError('Please enter your register number or college ID.');
      identifierInputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      await authService.forgotPassword(cleanId);
      setSubmitted(true);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Request failed.';
      if (msg.toLowerCase().includes('requests') || msg.toLowerCase().includes('wait')) {
        setError(msg);
      } else {
        // Uniform behavior to prevent enumeration
        setSubmitted(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Reset Password"
      subtitle="Enter your student register number to receive a secure recovery code."
      mascotPose="thinking"
      mascotTagline="Don't worry, we'll help you get back into your account safely."
      backHref="/login"
      backLabel="Back to Sign in"
    >
      {submitted ? (
        <div className="text-center space-y-5 py-4">
          <div className="w-16 h-16 rounded-full bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-500">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <h3 className="portal-heading text-lg font-black text-[var(--app-text)]">
            Check Your College Email
          </h3>

          <p className="text-xs sm:text-sm text-[var(--app-text-muted)] leading-relaxed max-w-md mx-auto">
            If the account exists, we sent a code to the registered college email. The single-use code expires in 10 minutes.
          </p>

          <div className="pt-4 flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => navigate(`/reset-password?id=${encodeURIComponent(identifier.trim())}`)}
              className="py-3 px-6 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 min-h-[44px]"
            >
              <span>Enter Reset Code</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="py-3 px-5 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-xs font-bold text-[var(--app-text)] cursor-pointer min-h-[44px]"
            >
              Back to Sign in
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div
              className="p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs sm:text-sm font-bold flex items-start gap-2.5"
              aria-live="polite"
            >
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label
              htmlFor="forgot-id"
              className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5"
            >
              Register number or college ID
            </label>
            <input
              id="forgot-id"
              ref={identifierInputRef}
              type="text"
              required
              autoFocus
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 21CS042"
              className="w-full px-4 py-3 rounded-2xl border border-[var(--app-border)] text-sm font-medium focus:ring-2 focus:ring-[var(--app-text)] outline-none transition bg-[var(--app-surface-subtle)] text-[var(--app-text)] min-h-[44px]"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-3 py-3.5 px-6 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black text-sm hover:opacity-90 transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            {loading ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <Mail className="w-4 h-4 text-amber-400" />
                <span>Send Password Reset Code</span>
              </>
            )}
          </button>
        </form>
      )}
    </AuthLayout>
  );
};
