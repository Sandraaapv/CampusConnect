import React, { useState } from 'react';
import { LogIn, ArrowLeft, Eye, EyeOff, Sparkles, Sun, Moon } from 'lucide-react';
import { authService, IS_DEMO_ENABLED } from '../services/auth';
import { navigate } from '../utils/navigation';
import { useTheme } from '../context/ThemeContext';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { theme, toggleTheme } = useTheme();

  const [successMsg] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('registered') === 'true'
      ? 'Account created successfully! Please sign in with your credentials.'
      : null;
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your register number or college email and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      await authService.login({ identifier, password });
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      await authService.loginAsDemo();
      navigate('/dashboard');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans flex flex-col justify-between selection:bg-amber-300 selection:text-black transition-colors duration-200">
      {/* Top Header */}
      <header className="w-full h-16 px-6 lg:px-12 flex items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-surface)]/70 backdrop-blur-md">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-1.5 text-[var(--app-text)] hover:opacity-80 font-extrabold text-sm transition-opacity cursor-pointer group"
          aria-label="Back to home"
        >
          <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-[var(--app-text-muted)] group-hover:text-[var(--app-text)]">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Home
          </span>
        </button>

        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[var(--app-text-muted)] uppercase tracking-wider hidden sm:inline">
            Student Portal
          </span>
          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-[var(--app-text)] transition cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md bg-[var(--app-surface)] rounded-2xl border border-[var(--app-border)] shadow-[var(--card-shadow)] p-6 sm:p-8">
          {/* Mascot (Waving) */}
          <div className="flex justify-center -mt-2 mb-4">
            <div className="w-20 h-20 rounded-full bg-amber-500/10 flex items-center justify-center overflow-hidden border border-amber-500/20">
              <img
                src="/mascots/01-welcome.png"
                alt="CampusConnect Mascot waving"
                className="w-full h-full object-contain scale-110 translate-y-1"
              />
            </div>
          </div>

          <div className="text-center mb-6">
            <h1 className="portal-heading text-2xl sm:text-3xl tracking-tight">
              Sign In
            </h1>
            <p className="text-sm text-[var(--app-text-muted)] mt-1.5 font-medium">
              Your whole college life, in one place.
            </p>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-xs sm:text-sm font-medium flex items-center gap-2">
              <span className="font-bold">✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium flex items-center gap-2">
              <span className="font-bold">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-bold text-[var(--app-text-muted)] uppercase tracking-wider mb-1.5"
              >
                Register Number or College Email
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="21CS042 or student.demo@college.edu"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-[var(--app-border)] text-sm font-medium focus:ring-2 focus:ring-[var(--app-text)] outline-none transition bg-[var(--app-surface-subtle)] text-[var(--app-text)] placeholder-[var(--app-text-muted)]/50"
              />
            </div>

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
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-[var(--app-border)] text-sm font-medium focus:ring-2 focus:ring-[var(--app-text)] outline-none transition bg-[var(--app-surface-subtle)] text-[var(--app-text)] placeholder-[var(--app-text-muted)]/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--app-text-muted)] hover:text-[var(--app-text)] cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-sm hover:opacity-90 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-amber-300" />
                  <span>Sign in</span>
                </>
              )}
            </button>
          </form>

          {/* Secondary Line: Quiet Register link */}
          <div className="mt-4 text-center">
            <p className="text-xs sm:text-sm text-[var(--app-text-muted)]">
              New student?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-bold text-[var(--app-text)] hover:underline cursor-pointer"
              >
                Register
              </button>
            </p>
          </div>

          {/* Try the demo button (shown only if VITE_ENABLE_DEMO=true) */}
          {IS_DEMO_ENABLED && (
            <div className="mt-6 pt-5 border-t border-[var(--app-border)] text-center">
              <button
                type="button"
                onClick={handleDemoLogin}
                disabled={loading}
                className="w-full py-2.5 px-4 rounded-full border border-[var(--app-border)] hover:border-[var(--app-border-strong)] hover:bg-[var(--app-surface-subtle)] text-xs font-bold text-[var(--app-text)] transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Try the demo</span>
              </button>
              <p className="text-[11px] text-[var(--app-text-muted)] mt-1.5">
                Instant login as student Aarav Sharma (21CS042)
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-[var(--app-text-muted)]">
        &copy; {new Date().getFullYear()} CampusConnect Student Portal. All rights reserved.
      </footer>
    </div>
  );
};
