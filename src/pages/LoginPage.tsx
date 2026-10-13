import React, { useState, useEffect, useRef } from 'react';
import { LogIn, Eye, EyeOff, Sparkles, AlertCircle, Clock } from 'lucide-react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { CaptchaBox } from '../components/auth/CaptchaBox';
import { authService, IS_DEMO_ENABLED, LOGIN_ID_SUFFIX } from '../services/auth';
import { navigate } from '../utils/navigation';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [capsLockActive, setCapsLockActive] = useState(false);
  const [captchaId, setCaptchaId] = useState('');
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [keepSignedIn, setKeepSignedIn] = useState(false);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [captchaError, setCaptchaError] = useState<string | null>(null);
  const [lockoutSeconds, setLockoutSeconds] = useState<number | null>(null);

  const identifierInputRef = useRef<HTMLInputElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);
  const captchaInputRef = useRef<HTMLInputElement>(null);

  const rawRedirect = new URLSearchParams(window.location.search).get('redirect');
  const redirectTarget = rawRedirect && rawRedirect !== '/login' && !rawRedirect.includes('/login') ? rawRedirect : '/dashboard';

  // Check URL query params for registration success notice
  const [successMsg] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get('registered') === 'true') {
      return 'Account created! Please sign in with your credentials.';
    }
    if (params.get('reset') === 'true') {
      return 'Password successfully updated! Please sign in with your new password.';
    }
    return null;
  });

  // Countdown timer if locked out
  useEffect(() => {
    if (lockoutSeconds === null || lockoutSeconds <= 0) return;
    const interval = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          setError(null);
          return null;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [lockoutSeconds]);

  const handleKeyDownPassword = (e: React.KeyboardEvent<HTMLInputElement>) => {
    setCapsLockActive(e.getModifierState('CapsLock'));
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setCaptchaError(null);

    const cleanId = identifier.trim().toLowerCase();
    if (!cleanId) {
      setError('Please enter your register number or college ID.');
      identifierInputRef.current?.focus();
      return;
    }

    if (!password) {
      setError('Please enter your password.');
      passwordInputRef.current?.focus();
      return;
    }

    if (!captchaAnswer) {
      setCaptchaError('Please solve the captcha verification.');
      captchaInputRef.current?.focus();
      return;
    }

    try {
      setLoading(true);
      const res = await authService.login({
        identifier: cleanId,
        password,
        captchaId,
        captchaAnswer,
        keepSignedIn,
      });

      if (!res.emailVerified) {
        navigate(`/verify-email?id=${encodeURIComponent(cleanId)}`);
        return;
      }

      navigate(redirectTarget);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'ID or password is incorrect.';
      if (msg.toLowerCase().includes('captcha')) {
        setCaptchaError(msg);
        captchaInputRef.current?.focus();
      } else if (msg.toLowerCase().includes('lock')) {
        setError(msg);
        setLockoutSeconds(15 * 60); // 15 mins
      } else {
        setError('ID or password is incorrect.');
        passwordInputRef.current?.focus();
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setDemoLoading(true);
      setError(null);
      await authService.loginAsDemo();
      navigate(redirectTarget);
      // Fallback reload navigation if still on /login
      setTimeout(() => {
        if (window.location.pathname === '/login') {
          window.location.href = redirectTarget;
        }
      }, 100);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo sign in failed.');
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <AuthLayout
      title="Student Sign In"
      subtitle="Access your academic records, attendance, timetable, and study planner."
      mascotPose="waving"
      mascotTagline="Welcome back! Sign in with your registered college ID."
    >
      {/* Success Banner */}
      {successMsg && (
        <div className="mb-5 p-3.5 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-bold flex items-center gap-2">
          <span>✓</span>
          <span>{successMsg}</span>
        </div>
      )}

      {/* Error Banner */}
      {error && (
        <div
          className="mb-5 p-3.5 rounded-2xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs sm:text-sm font-bold flex items-start gap-2.5"
          aria-live="polite"
        >
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span>{error}</span>
            {lockoutSeconds !== null && lockoutSeconds > 0 && (
              <div className="mt-1 flex items-center gap-1.5 font-mono text-xs text-amber-500">
                <Clock className="w-3.5 h-3.5" />
                <span>
                  Lockout expires in {Math.floor(lockoutSeconds / 60)}:
                  {String(lockoutSeconds % 60).padStart(2, '0')}
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Login Form */}
      <form onSubmit={handleLogin} className="space-y-4">
        {/* Identifier Field */}
        <div>
          <label
            htmlFor="identifier"
            className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5"
          >
            Register number or college ID
          </label>
          <div className="relative flex items-center">
            <input
              id="identifier"
              ref={identifierInputRef}
              type="text"
              required
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="e.g. 21CS042"
              disabled={loading || (lockoutSeconds !== null && lockoutSeconds > 0)}
              className={`w-full px-4 py-3 rounded-2xl border border-[var(--app-border)] text-sm font-medium focus:ring-2 focus:ring-[var(--app-text)] outline-none transition bg-[var(--app-surface-subtle)] text-[var(--app-text)] placeholder-[var(--app-text-muted)]/50 min-h-[44px] ${
                LOGIN_ID_SUFFIX ? 'pr-24' : ''
              }`}
            />
            {LOGIN_ID_SUFFIX && (
              <span className="absolute right-3 px-2 py-1 text-xs font-mono font-bold text-[var(--app-text-muted)] bg-[var(--app-surface)] border border-[var(--app-border)] rounded-lg pointer-events-none select-none">
                {LOGIN_ID_SUFFIX}
              </span>
            )}
          </div>
        </div>

        {/* Password Field */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label
              htmlFor="password"
              className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider"
            >
              Password
            </label>
          </div>
          <div className="relative">
            <input
              id="password"
              ref={passwordInputRef}
              type={showPassword ? 'text' : 'password'}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={handleKeyDownPassword}
              onKeyUp={handleKeyDownPassword}
              placeholder="••••••••••••"
              disabled={loading || (lockoutSeconds !== null && lockoutSeconds > 0)}
              className="w-full px-4 py-3 pr-11 rounded-2xl border border-[var(--app-border)] text-sm font-medium focus:ring-2 focus:ring-[var(--app-text)] outline-none transition bg-[var(--app-surface-subtle)] text-[var(--app-text)] placeholder-[var(--app-text-muted)]/50 min-h-[44px]"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-1.5 text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer rounded-lg focus:ring-2 focus:ring-[var(--app-text)] min-h-[44px] min-w-[44px] flex items-center justify-center"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>

          {/* Caps Lock warning */}
          {capsLockActive && (
            <p className="mt-1 text-xs text-amber-500 font-bold flex items-center gap-1">
              <span>Caps Lock is on</span>
            </p>
          )}

          {/* Forgot password link aligned directly under password */}
          <div className="mt-1.5 flex justify-end">
            <button
              type="button"
              onClick={() => navigate('/forgot-password')}
              className="text-xs font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] hover:underline cursor-pointer min-h-[32px] inline-flex items-center"
            >
              Forgot password?
            </button>
          </div>
        </div>

        {/* Server Captcha Challenge */}
        <CaptchaBox
          captchaId={captchaId}
          onCaptchaChange={(newId, answer) => {
            setCaptchaId(newId);
            setCaptchaAnswer(answer);
            setCaptchaError(null);
          }}
          error={captchaError}
          inputRef={captchaInputRef}
        />

        {/* Keep me signed in checkbox */}
        <div className="pt-1">
          <label className="flex items-center gap-2.5 text-xs text-[var(--app-text)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={keepSignedIn}
              onChange={(e) => setKeepSignedIn(e.target.checked)}
              className="w-4 h-4 rounded accent-amber-500 cursor-pointer"
            />
            <span className="font-semibold">Keep me signed in on this device</span>
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading || (lockoutSeconds !== null && lockoutSeconds > 0)}
          className="w-full mt-3 py-3.5 px-6 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-black text-sm hover:opacity-90 transition shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 min-h-[44px]"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <LogIn className="w-4 h-4 text-amber-400" />
              <span>Login to Portal</span>
            </>
          )}
        </button>
      </form>

      {/* Below quiet register link */}
      <div className="mt-5 text-center">
        <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
          New student?{' '}
          <button
            type="button"
            onClick={() => navigate('/register')}
            className="font-black text-[var(--app-text)] hover:underline cursor-pointer"
          >
            Register
          </button>
        </p>
      </div>

      {/* Demo Student Login Button */}
      {IS_DEMO_ENABLED && (
        <div className="mt-6 pt-5 border-t border-[var(--app-border)] text-center">
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={loading || demoLoading}
            className="w-full py-2.5 px-4 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-xs font-bold text-[var(--app-text)] transition flex items-center justify-center gap-2 cursor-pointer min-h-[44px] disabled:opacity-50"
          >
            {demoLoading ? (
              <span className="inline-block w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            )}
            <span>{demoLoading ? 'Signing into demo...' : 'Try the demo'}</span>
          </button>
          <p className="text-[11px] text-[var(--app-text-muted)] mt-1.5 font-medium">
            Instant evaluation login as seeded student Aarav Sharma (21CS042)
          </p>
        </div>
      )}
    </AuthLayout>
  );
};
