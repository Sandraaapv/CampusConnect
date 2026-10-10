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

export const VerifyReceiptPage: React.FC = () => {
  const currentPath = useCurrentPath();
  const { theme, toggleTheme } = useTheme();

  // Extract token from URL: /receipts/verify/:token
  const token = currentPath.split('/receipts/verify/')[1]?.split('?')[0] || '';
  const receipt = db.getFeeReceiptByToken(token);
  const user = db.getUser();

  const isValid = Boolean(receipt);

  return (
    <div className="min-h-screen bg-[var(--app-bg)] text-[var(--app-text)] font-sans flex flex-col justify-between selection:bg-amber-300 selection:text-black p-4 sm:p-6 transition-colors duration-200">
      {/* Top Navbar */}
      <header className="max-w-2xl w-full mx-auto flex items-center justify-between py-4 border-b border-[var(--app-border)]">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-full bg-white text-black dark:bg-white dark:text-black border border-neutral-300 dark:border-transparent flex items-center justify-center font-black text-[11px] tracking-tight shrink-0 shadow-xs">
            cc
          </div>
          <div>
            <span className="font-montserrat font-black text-xs tracking-tight uppercase block">
              CampusConnect
            </span>
            <span className="text-[10px] text-neutral-400 font-bold uppercase">
              Accounts & Fee Verification Registry
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
        {isValid && receipt ? (
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-xl space-y-6 text-center animate-scale-in">
            {/* Verified Badge */}
            <div className="w-16 h-16 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                OFFICIAL COLLEGE RECORD VERIFIED
              </span>
              <h1 className="font-montserrat font-black text-xl text-[var(--app-text)] tracking-tight uppercase mt-2">
                Valid Fee Payment
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                Digitally authenticated by College Finance & Accounts Clearance
              </p>
            </div>

            {/* Receipt Details Box */}
            <div className="p-4 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] text-left space-y-3 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[var(--app-border)]">
                <span className="text-neutral-400 font-mono text-[10px] uppercase font-bold">Student Name</span>
                <span className="font-extrabold text-[var(--app-text)]">{user.name}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[var(--app-border)]">
                <span className="text-neutral-400 font-mono text-[10px] uppercase font-bold">Register Number</span>
                <span className="font-mono font-bold text-[var(--app-text)]">{user.registerNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[var(--app-border)]">
                <span className="text-neutral-400 font-mono text-[10px] uppercase font-bold">Amount Settled</span>
                <span className="font-montserrat font-black text-emerald-600 dark:text-emerald-400 text-sm">
                  ₹{receipt.amount.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[var(--app-border)]">
                <span className="text-neutral-400 font-mono text-[10px] uppercase font-bold">Reference</span>
                <span className="font-mono text-neutral-400">{receipt.paymentRef || receipt.referenceNumber}</span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-neutral-400 font-mono text-[10px] uppercase font-bold">Paid On</span>
                <span className="font-mono font-bold text-[var(--app-text)]">{receipt.paidDate || receipt.paidAt}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('/fees')}
              className="w-full py-3 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Back to Student Portal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="p-6 sm:p-8 rounded-3xl bg-[var(--app-surface)] border border-rose-500/30 shadow-xl space-y-6 text-center animate-scale-in">
            <div className="w-16 h-16 rounded-full bg-rose-500/15 text-rose-500 border border-rose-500/30 flex items-center justify-center mx-auto shadow-xs">
              <XCircle className="w-10 h-10" />
            </div>

            <div>
              <span className="text-[10px] font-black tracking-widest uppercase text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20">
                INVALID OR EXPIRED RECEIPT
              </span>
              <h1 className="font-montserrat font-black text-xl text-[var(--app-text)] tracking-tight uppercase mt-2">
                Verification Failed
              </h1>
              <p className="text-xs text-neutral-400 mt-1">
                This verification signature token does not match any official college payment ledger entry.
              </p>
            </div>

            <button
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-3 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs"
            >
              Go to CampusConnect Portal
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="text-center py-4 text-[10px] text-neutral-400 font-mono">
        Official College Accounts Records System · Cryptographically Signed
      </footer>
    </div>
  );
};
