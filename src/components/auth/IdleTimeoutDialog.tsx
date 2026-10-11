import React, { useState, useEffect, useRef } from 'react';
import { AlertTriangle, LogOut, RefreshCw } from 'lucide-react';
import { authService } from '../../services/auth';

const IDLE_TIMEOUT_MS = 25 * 60 * 1000; // 25 minutes
const COUNTDOWN_SECONDS = 120; // 2 minutes warning countdown before auto-logout

export const IdleTimeoutDialog: React.FC = () => {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(COUNTDOWN_SECONDS);
  const lastActiveRef = useRef<number>(Date.now());
  const countdownIntervalRef = useRef<any>(null);

  const resetActivity = () => {
    lastActiveRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      clearInterval(countdownIntervalRef.current);
    }
  };

  useEffect(() => {
    if (!authService.isAuthenticated()) return;

    const activityEvents = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const onUserActivity = () => {
      if (!showWarning) {
        lastActiveRef.current = Date.now();
      }
    };

    activityEvents.forEach((ev) => window.addEventListener(ev, onUserActivity, { passive: true }));

    const checkInterval = setInterval(() => {
      if (!authService.isAuthenticated()) return;

      const idleDuration = Date.now() - lastActiveRef.current;
      if (idleDuration >= IDLE_TIMEOUT_MS && !showWarning) {
        setShowWarning(true);
        setSecondsRemaining(COUNTDOWN_SECONDS);

        countdownIntervalRef.current = setInterval(() => {
          setSecondsRemaining((prev) => {
            if (prev <= 1) {
              clearInterval(countdownIntervalRef.current);
              authService.logout();
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      }
    }, 15000); // Check every 15s

    return () => {
      activityEvents.forEach((ev) => window.removeEventListener(ev, onUserActivity));
      clearInterval(checkInterval);
      clearInterval(countdownIntervalRef.current);
    };
  }, [showWarning]);

  if (!showWarning) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="idle-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fade-in"
    >
      <div className="w-full max-w-md bg-[var(--app-surface)] rounded-3xl border border-[var(--app-border)] p-6 sm:p-8 shadow-2xl text-center space-y-4">
        <div className="w-14 h-14 rounded-full bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-500">
          <AlertTriangle className="w-7 h-7" />
        </div>

        <h2 id="idle-title" className="portal-heading text-xl font-black text-[var(--app-text)]">
          Inactivity Warning
        </h2>

        <p className="text-xs sm:text-sm text-[var(--app-text-muted)] leading-relaxed">
          You have been idle for 25 minutes. For your security on shared college computers, your session will automatically close in{' '}
          <span className="font-mono font-bold text-amber-500 text-base">
            {Math.floor(secondsRemaining / 60)}:
            {String(secondsRemaining % 60).padStart(2, '0')}
          </span>
          .
        </p>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={resetActivity}
            className="flex-1 py-3 px-4 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition min-h-[44px]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Stay Signed In</span>
          </button>

          <button
            type="button"
            onClick={() => authService.logout()}
            className="py-3 px-5 rounded-full border border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)] text-[var(--app-text)] font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition min-h-[44px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out Now</span>
          </button>
        </div>
      </div>
    </div>
  );
};
