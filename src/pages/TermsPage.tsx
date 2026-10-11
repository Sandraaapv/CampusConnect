import React from 'react';
import { AuthLayout } from '../components/auth/AuthLayout';
import { Shield } from 'lucide-react';

export const TermsPage: React.FC = () => {
  return (
    <AuthLayout
      title="Terms of Service"
      subtitle="Guidelines and student code of conduct for CampusConnect portal usage."
      mascotPose="thinking"
      mascotTagline="Transparent student guidelines protecting your academic portal."
      backHref="/register"
      backLabel="Back to Registration"
    >
      <div className="space-y-6 text-xs sm:text-sm text-[var(--app-text)] leading-relaxed">
        <div className="p-4 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-500">
            <Shield className="w-4 h-4" />
            <span>Student-Only Platform Guarantee</span>
          </div>
          <p className="text-[var(--app-text-muted)]">
            CampusConnect is strictly an academic portal for currently enrolled students. Accounts are provisioned solely based on official institutional registration numbers.
          </p>
        </div>

        <div>
          <h3 className="font-black text-sm uppercase tracking-wider mb-2">1. Authorized Access</h3>
          <p className="text-[var(--app-text-muted)]">
            You agree to access CampusConnect solely using your assigned college credentials. Sharing access tokens, OTPs, or passwords with third parties is strictly prohibited.
          </p>
        </div>

        <div>
          <h3 className="font-black text-sm uppercase tracking-wider mb-2">2. Academic Record Integrity</h3>
          <p className="text-[var(--app-text-muted)]">
            Official attendance records, marks, and internal assessment grades originate from the college information system and are read-only. Unauthorized manipulation or automated scraping is prohibited.
          </p>
        </div>

        <div>
          <h3 className="font-black text-sm uppercase tracking-wider mb-2">3. Session Security</h3>
          <p className="text-[var(--app-text-muted)]">
            Sessions on shared public library or computer laboratory terminals are subject to automated 25-minute idle timeouts. You are responsible for signing out after completing your session.
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};
