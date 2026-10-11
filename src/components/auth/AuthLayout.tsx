import React from 'react';
import { ArrowLeft, Sun, Moon, ShieldCheck, GraduationCap } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { navigate } from '../../utils/navigation';

export type MascotPose = 'waving' | 'thinking' | 'celebrating';

interface AuthLayoutProps {
  title: string;
  subtitle: string;
  mascotPose?: MascotPose;
  mascotTagline?: string;
  children: React.ReactNode;
  backHref?: string;
  backLabel?: string;
}

const MASCOT_IMAGES: Record<MascotPose, string> = {
  waving: '/mascots/01-welcome.png',
  thinking: '/mascots/05-Circulars_and_notes.png',
  celebrating: '/mascots/07-Streaks_and_badges.png',
};

const MASCOT_DESCRIPTIONS: Record<MascotPose, string> = {
  waving: 'CampusConnect mascot waving welcomingly',
  thinking: 'CampusConnect mascot thinking thoughtfully',
  celebrating: 'CampusConnect mascot celebrating successfully',
};

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  mascotPose = 'waving',
  mascotTagline = 'Your entire college life, organized in one place.',
  children,
  backHref = '/',
  backLabel = 'Back to Home',
}) => {
  const { theme, toggleTheme } = useTheme();

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans flex flex-col justify-between selection:bg-amber-300 selection:text-black transition-colors duration-200">
      {/* Top Header */}
      <header className="w-full h-16 px-4 sm:px-8 lg:px-12 flex items-center justify-between border-b border-[var(--app-border)] bg-[var(--app-surface)]/80 backdrop-blur-md sticky top-0 z-30">
        <a
          href={backHref}
          onClick={(e) => {
            e.preventDefault();
            navigate(backHref);
          }}
          className="flex items-center gap-2 text-xs sm:text-sm font-extrabold text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition group cursor-pointer"
          aria-label={backLabel}
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          <span>{backLabel}</span>
        </a>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-[11px] font-bold text-[var(--app-text-muted)] hidden sm:flex">
            <GraduationCap className="w-3.5 h-3.5 text-amber-500" />
            <span>Student Portal</span>
          </div>

          <button
            type="button"
            onClick={toggleTheme}
            className="p-2 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-[var(--app-text)] transition cursor-pointer"
            aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-300" />
            ) : (
              <Moon className="w-4 h-4" />
            )}
          </button>
        </div>
      </header>

      {/* Main Split Layout: Desktop 50/50, Mobile single column */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 flex items-center justify-center">
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Side: Mascot Stage (Desktop only, stacked gracefully on mobile) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col items-center justify-center text-center p-8 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] relative overflow-hidden">
            {/* Subtle organic background glow */}
            <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full bg-amber-400/10 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-16 -right-16 w-56 h-56 rounded-full bg-blue-400/10 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center">
              {/* College Branding Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-400/15 border border-amber-400/30 text-amber-700 dark:text-amber-300 text-xs font-black uppercase tracking-wider mb-6">
                <span>CampusConnect</span>
              </div>

              {/* Puppet Mascot Image */}
              <div className="w-56 h-56 sm:w-64 sm:h-64 flex items-center justify-center my-2 transition-transform duration-300 hover:scale-105">
                <img
                  src={MASCOT_IMAGES[mascotPose]}
                  alt={MASCOT_DESCRIPTIONS[mascotPose]}
                  className="w-full h-full object-contain drop-shadow-md select-none"
                  loading="eager"
                />
              </div>

              <h2 className="portal-heading text-xl sm:text-2xl mt-4 text-[var(--app-text)] font-black">
                Student Central
              </h2>
              <p className="text-xs sm:text-sm text-[var(--app-text-muted)] mt-2 max-w-xs leading-relaxed font-medium">
                {mascotTagline}
              </p>

              {/* Security Banner Badge */}
              <div className="mt-6 pt-5 border-t border-[var(--app-border)] w-full flex items-center justify-center gap-2 text-[11px] text-[var(--app-text-muted)]">
                <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                <span className="font-medium">Encrypted student access • Portal is student-only</span>
              </div>
            </div>
          </div>

          {/* Right Side: Form Card */}
          <div className="lg:col-span-7 flex justify-center w-full">
            <div className="w-full max-w-xl bg-[var(--app-surface)] rounded-3xl border border-[var(--app-border)] shadow-[var(--card-shadow)] p-6 sm:p-10 relative">
              {/* Mobile Mascot Header (Visible only on smaller viewports) */}
              <div className="flex lg:hidden items-center justify-center gap-3 mb-6 pb-4 border-b border-[var(--app-border)]">
                <div className="w-14 h-14 rounded-full bg-amber-400/10 border border-amber-400/20 overflow-hidden flex items-center justify-center shrink-0">
                  <img
                    src={MASCOT_IMAGES[mascotPose]}
                    alt={MASCOT_DESCRIPTIONS[mascotPose]}
                    className="w-full h-full object-contain scale-110"
                  />
                </div>
                <div>
                  <div className="text-xs font-black uppercase tracking-wider text-amber-500">
                    CampusConnect
                  </div>
                  <div className="text-xs text-[var(--app-text-muted)] font-medium">
                    Official Student Portal
                  </div>
                </div>
              </div>

              {/* Card Title & Subtitle */}
              <div className="mb-6">
                <h1 className="portal-heading text-2xl sm:text-3xl font-black text-[var(--app-text)] tracking-tight">
                  {title}
                </h1>
                <p className="text-xs sm:text-sm text-[var(--app-text-muted)] mt-1.5 font-medium">
                  {subtitle}
                </p>
              </div>

              {/* Card Form Children */}
              {children}
            </div>
          </div>
        </div>
      </main>

      {/* Global Security Footer Notice (Requirement 2: "Never share your password or OTP. CampusConnect will never ask for them.") */}
      <footer className="w-full py-4 px-4 text-center border-t border-[var(--app-border)] bg-[var(--app-surface)]/50 text-[11px] text-[var(--app-text-muted)]">
        <p className="font-semibold text-[var(--app-text)]">
          Security notice: Never share your password or OTP. CampusConnect will never ask for them.
        </p>
        <p className="mt-1 opacity-70">
          &copy; {new Date().getFullYear()} CampusConnect Student Portal. All rights reserved.
        </p>
      </footer>
    </div>
  );
};
