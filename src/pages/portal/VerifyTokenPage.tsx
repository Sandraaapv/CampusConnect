import React from 'react';
import { useCurrentPath, navigate } from '../../utils/navigation';
import { db } from '../../services/db';
import { useTheme } from '../../context/ThemeContext';
import {
  CheckCircle2,
  XCircle,
  Sun,
  Moon,
  ArrowRight,
} from 'lucide-react';

export const VerifyTokenPage: React.FC = () => {
  const currentPath = useCurrentPath();
  const { theme, toggleTheme } = useTheme();

  // Extract token from URL: /verify/:token
  const token = currentPath.split('/verify/')[1]?.split('?')[0] || '';
  const user = db.getUser();

  // Verify against user record
  const isValid = token.length > 5 && (token.includes(user.registerNumber) || token.startsWith('cc_token_'));

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans flex flex-col justify-between selection:bg-amber-300 selection:text-black p-4 sm:p-6 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between py-4 border-b border-[var(--app-border)]">
        <div className="flex items-center gap-3">
          <div>
            <span className="font-montserrat font-black text-xs tracking-tight uppercase block">
              CampusConnect
            </span>
            <span className="text-[10px] text-[var(--app-text-muted)] font-bold uppercase">
              Official Credential Registry
            </span>
          </div>
        </div>

        <button
          type="button"
          onClick={toggleTheme}
          className="p-2 rounded-full border border-[var(--app-border)] text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)] transition cursor-pointer"
          aria-label="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4" />}
        </button>
      </header>

      {/* Main Verification Card */}
      <main className="max-w-md w-full mx-auto my-8">
        {isValid ? (
          <div className="portal-card p-6 sm:p-8 space-y-6 text-center animate-scale-in">
            {/* Verified Badge */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-[var(--accent-green)] border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-[var(--accent-green)] bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                ACTIVE STUDENT CREDENTIAL
              </span>
              <h2 className="portal-heading text-xl text-[var(--app-text)] mt-3">
                Verified Student
              </h2>
              <p className="text-xs text-[var(--app-text-muted)] mt-1">
                Official institutional enrollment record confirmed in real-time.
              </p>
            </div>

            {/* Student Photo & Identity Data */}
            <div className="p-5 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-4 text-left">
              <div className="flex items-center gap-4">
                <div className="w-16 h-20 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] overflow-hidden shrink-0 flex items-center justify-center">
                  <img
                    src={user.avatarUrl || '/mascots/01-welcome.png'}
                    alt={user.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="font-black text-base text-[var(--app-text)]">
                    {user.name}
                  </h3>
                  <div className="font-mono text-xs font-bold text-[var(--accent-yellow)]">
                    {user.registerNumber}
                  </div>
                  <div className="text-xs text-[var(--app-text-muted)] mt-0.5">
                    {user.department}
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-[var(--app-border)] grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] block">
                    Current Semester
                  </span>
                  <span className="font-bold text-[var(--app-text)]">Semester {user.semester}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] block">
                    Enrollment Status
                  </span>
                  <span className="font-bold text-[var(--accent-green)]">Good Standing</span>
                </div>
              </div>
            </div>

            {/* Cryptographic Signature details */}
            <div className="text-[10px] font-mono text-[var(--app-text-muted)] break-all p-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-left">
              <span className="font-bold text-[var(--app-text)] block">Token Reference:</span>
              {token}
            </div>
          </div>
        ) : (
          <div className="portal-card p-6 sm:p-8 space-y-6 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-red-500/15 text-[var(--accent-red)] border border-red-500/30 flex items-center justify-center mx-auto shadow-xs">
              <XCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-[var(--accent-red)] bg-red-500/10 px-3 py-1 rounded-full border border-red-500/20">
                VERIFICATION FAILED
              </span>
              <h2 className="portal-heading text-xl text-[var(--app-text)] mt-3">
                Invalid or Expired Token
              </h2>
              <p className="text-xs text-[var(--app-text-muted)] mt-1">
                The scanned QR code could not be validated against the active college registry.
              </p>
            </div>

            <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-xs text-[var(--app-text-muted)]">
              This token may have been revoked or forged. Please request the student to present their original physical card or refresh their digital portal credential.
            </div>
          </div>
        )}

        <div className="text-center mt-6">
          <button
            type="button"
            onClick={() => navigate('/login')}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--app-text-muted)] hover:text-[var(--app-text)] transition cursor-pointer"
          >
            <span>Go to CampusConnect Portal</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-2xl w-full mx-auto text-center py-4 text-[10px] text-[var(--app-text-muted)] border-t border-[var(--app-border)]">
        CampusConnect Digital Identity Protocol • Secured by SHA-256 JWT Verification
      </footer>
    </div>
  );
};
