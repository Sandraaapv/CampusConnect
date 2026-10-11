import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Lock } from 'lucide-react';

export const PrivacyPage: React.FC = () => {
  return (
    <AuthLayout
      title="Privacy Notice"
      subtitle="How CampusConnect safeguards your student data and identity."
      mascotPose="thinking"
      mascotTagline="Zero commercial trackers. Your academic data belongs strictly to you."
      backHref="/register"
      backLabel="Back to Registration"
    >
      <div className="space-y-6 text-xs sm:text-sm text-[var(--app-text)] leading-relaxed">
        <div className="p-4 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-500">
            <Lock className="w-4 h-4" />
            <span>Cryptographic Privacy Standard</span>
          </div>
          <p className="text-[var(--app-text-muted)]">
            All passwords are protected via BCrypt (cost factor 12). Tokens and verification OTPs are stored solely as salted cryptographic digests.
          </p>
        </div>

        <div>
          <h3 className="font-black text-sm uppercase tracking-wider mb-2">1. Data Collected</h3>
          <p className="text-[var(--app-text-muted)]">
            We store your verified college email, register number, department, semester, and audit logs of login events (timestamp, approximate IP, device type) to detect unauthorized account compromises.
          </p>
        </div>

        <div>
          <h3 className="font-black text-sm uppercase tracking-wider mb-2">2. Course Feedback Anonymity</h3>
          <p className="text-[var(--app-text-muted)]">
            Course feedback submissions are stored strictly unlinked from student identities. Submission receipts prevent double submissions without revealing faculty evaluation ratings.
          </p>
        </div>

        <div>
          <h3 className="font-black text-sm uppercase tracking-wider mb-2">3. Zero Third-Party Tracking</h3>
          <p className="text-[var(--app-text-muted)]">
            Captchas, audio synthesizers, and security features are built in-house with zero third-party telemetry, ad trackers, or analytics scripts.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};
