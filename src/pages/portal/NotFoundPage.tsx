import React from 'react';
import { navigate } from '../../utils/navigation';
import { useTheme } from '../../context/ThemeContext';
import { Sun, Moon, Home, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans flex flex-col justify-between p-4 sm:p-8 selection:bg-amber-300 selection:text-black transition-colors duration-200">
      {/* Header */}
      <header className="max-w-4xl w-full mx-auto flex items-center justify-between py-4 border-b border-[var(--app-border)]">
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="w-8 h-8 rounded-xl bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] flex items-center justify-center font-black text-xs">
            cc
          </div>
          <span className="font-montserrat font-black text-xs tracking-tight uppercase">
            CampusConnect
          </span>
        </button>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-full border border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)] transition cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Body */}
      <main className="max-w-md w-full mx-auto my-auto text-center space-y-6 py-12">
        {/* Mascot */}
        <div className="w-36 h-36 mx-auto relative animate-scale-in">
          <img
            src="/mascots/02-Smart dashboard.png"
            alt="Page not found mascot"
            className="w-full h-full object-contain filter drop-shadow-lg"
          />
        </div>

        <div className="space-y-2">
          <span className="font-mono text-xs font-black px-3 py-1 rounded-full bg-amber-500/10 text-[var(--accent-yellow)] border border-amber-500/20">
            ERROR 404
          </span>
          <h1 className="portal-heading text-3xl sm:text-4xl text-[var(--app-text)]">
            Lost on Campus?
          </h1>
          <p className="text-xs sm:text-sm text-[var(--app-text-muted)] max-w-sm mx-auto leading-relaxed">
            The lecture hall or page you are looking for has either been moved, rescheduled, or doesn't exist.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs hover:opacity-90"
          >
            <Home className="w-3.5 h-3.5" />
            <span>Back to Dashboard</span>
          </button>
          <button
            type="button"
            onClick={() => window.history.back()}
            className="w-full sm:w-auto px-6 py-2.5 rounded-full border border-[var(--app-border)] text-[var(--app-text)] font-extrabold text-xs inline-flex items-center justify-center gap-2 cursor-pointer hover:bg-[var(--app-surface-subtle)]"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Go Back</span>
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-4xl w-full mx-auto text-center py-4 text-[10px] text-[var(--app-text-muted)] border-t border-[var(--app-border)]">
        CampusConnect Student Portal • 404 Not Found
      </footer>
    </div>
  );
};
