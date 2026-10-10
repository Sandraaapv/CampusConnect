import React, { useState } from 'react';
import { LogIn, ArrowLeft, ShieldCheck, UserCheck, GraduationCap, Eye, EyeOff } from 'lucide-react';
import { authService, IS_DEMO_ENABLED } from '../services/auth';
import { navigate } from '../utils/navigation';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('registered') === 'true'
      ? 'Account created successfully! Please sign in with your credentials.'
      : null;
  });

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) {
      setError('Please enter your email or register number and password.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const { user } = await authService.login({ identifier, password });
      // Redirect to appropriate dashboard
      navigate(`/dashboard/${user.role}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = async (role: 'student' | 'faculty' | 'admin') => {
    try {
      setLoading(true);
      setError(null);
      const { user } = await authService.loginAsDemo(role);
      navigate(`/dashboard/${user.role}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f3] flex flex-col justify-between text-neutral-900 font-sans selection:bg-amber-300">
      {/* Top Header */}
      <header className="w-full h-16 px-6 lg:px-12 flex items-center justify-between border-b border-neutral-200/80 bg-white/70 backdrop-blur-xs">
        <button
          type="button"
          onClick={() => navigate('/')}
          className="flex items-center gap-2.5 text-neutral-800 hover:text-black font-extrabold text-sm transition-colors cursor-pointer group"
          aria-label="Back to home"
        >
          <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-black text-xs group-hover:scale-105 transition-transform">
            cc
          </div>
          <span className="flex items-center gap-1 text-xs sm:text-sm font-bold text-neutral-600 group-hover:text-black">
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Home
          </span>
        </button>

        <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
          Student & Staff Portal
        </span>
      </header>

      {/* Main Content Card */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md bg-white rounded-2xl border border-neutral-200 shadow-sm p-6 sm:p-8">
          <div className="text-center mb-6">
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-neutral-900">
              Welcome back
            </h1>
            <p className="text-sm text-neutral-600 mt-1.5 font-medium">
              Sign in to your official CampusConnect account
            </p>
          </div>

          {/* Success Banner */}
          {successMsg && (
            <div className="mb-4 p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs sm:text-sm font-medium flex items-center gap-2">
              <span className="font-bold">✓</span>
              <span>{successMsg}</span>
            </div>
          )}

          {/* Error Banner */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs sm:text-sm font-medium flex items-center gap-2">
              <span className="font-bold">⚠</span>
              <span>{error}</span>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label
                htmlFor="identifier"
                className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5"
              >
                Email or Register Number
              </label>
              <input
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="21CS042 or student.demo@college.edu"
                required
                className="w-full px-3.5 py-2.5 rounded-xl border border-neutral-300 text-sm font-medium focus:ring-2 focus:ring-black focus:border-black outline-none transition bg-neutral-50/50"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-bold text-neutral-700 uppercase tracking-wider"
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
                  className="w-full px-3.5 py-2.5 pr-10 rounded-xl border border-neutral-300 text-sm font-medium focus:ring-2 focus:ring-black focus:border-black outline-none transition bg-neutral-50/50"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 cursor-pointer"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-black text-white font-extrabold text-sm hover:bg-neutral-800 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-amber-300" />
                  <span>Sign in</span>
                </>
              )}
            </button>
          </form>

          {/* Secondary Line: New student? Register */}
          <div className="mt-4 text-center">
            <p className="text-xs sm:text-sm text-neutral-600">
              New student?{' '}
              <button
                type="button"
                onClick={() => navigate('/register')}
                className="font-bold text-neutral-900 hover:underline hover:text-black cursor-pointer"
              >
                Register
              </button>
            </p>
          </div>

          {/* Demo Section for Evaluators (Visible when VITE_ENABLE_DEMO=true) */}
          {IS_DEMO_ENABLED && (
            <div className="mt-8 pt-6 border-t border-neutral-200">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
                  Try the demo
                </span>
                <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full border border-amber-200">
                  For evaluators
                </span>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => handleDemoLogin('student')}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-neutral-300 hover:border-black hover:bg-neutral-50 transition text-center cursor-pointer flex flex-col items-center gap-1 group"
                >
                  <GraduationCap className="w-4 h-4 text-neutral-600 group-hover:text-black" />
                  <span className="text-xs font-bold text-neutral-800 group-hover:text-black">
                    Student
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('faculty')}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-neutral-300 hover:border-black hover:bg-neutral-50 transition text-center cursor-pointer flex flex-col items-center gap-1 group"
                >
                  <UserCheck className="w-4 h-4 text-neutral-600 group-hover:text-black" />
                  <span className="text-xs font-bold text-neutral-800 group-hover:text-black">
                    Faculty
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => handleDemoLogin('admin')}
                  disabled={loading}
                  className="p-2.5 rounded-xl border border-neutral-300 hover:border-black hover:bg-neutral-50 transition text-center cursor-pointer flex flex-col items-center gap-1 group"
                >
                  <ShieldCheck className="w-4 h-4 text-neutral-600 group-hover:text-black" />
                  <span className="text-xs font-bold text-neutral-800 group-hover:text-black">
                    Admin
                  </span>
                </button>
              </div>

              <p className="text-[11px] text-neutral-500 text-center mt-2.5">
                Instant one-click access with pre-seeded sample data
              </p>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-4 text-center text-xs text-neutral-500">
        &copy; {new Date().getFullYear()} CampusConnect. All rights reserved.
      </footer>
    </div>
  );
};
