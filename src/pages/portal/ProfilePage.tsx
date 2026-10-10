import React, { useState } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import { navigate } from '../../utils/navigation';
import {
  Mail,
  Hash,
  Building,
  Calendar,
  Flame,
  Award,
  CreditCard,
  Camera,
  CheckCircle2,
  ExternalLink,
} from 'lucide-react';

export const ProfilePage: React.FC = () => {
  const [user, setUser] = useState(() => db.getUser());
  const badges = db.getBadges().filter((b) => b.unlocked);
  const streak = db.getStreak();

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (ev) => {
        const dataUrl = ev.target?.result as string;
        db.updateUserProfile({ avatarUrl: dataUrl });
        setUser({ ...db.getUser(), avatarUrl: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <PortalLayout currentPath="/profile" title="Student Profile">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Profile Header Card */}
        <div className="portal-card p-6 sm:p-8 flex flex-col sm:flex-row items-center sm:items-start gap-6">
          {/* Avatar with photo replacement */}
          <div className="relative group shrink-0">
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-[var(--app-surface-subtle)] border-2 border-[var(--app-border)] overflow-hidden flex items-center justify-center shadow-md">
              <img
                src={user.avatarUrl || '/mascots/01-welcome.png'}
                alt={user.name}
                className="w-full h-full object-cover"
              />
            </div>
            <label className="absolute -bottom-2 -right-2 p-2 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] cursor-pointer shadow-md hover:scale-105 transition-transform">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoUpload}
                className="hidden"
              />
            </label>
          </div>

          {/* Core Info */}
          <div className="space-y-2 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="portal-heading text-2xl text-[var(--app-text)]">
                  {user.name}
                </h2>
                <p className="font-mono text-xs font-bold text-[var(--accent-yellow)]">
                  {user.registerNumber}
                </p>
              </div>

              <button
                type="button"
                onClick={() => navigate('/id-card')}
                className="px-4 py-2 rounded-full border border-[var(--app-border)] text-xs font-bold text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)] transition inline-flex items-center gap-1.5 cursor-pointer mx-auto sm:mx-0"
              >
                <CreditCard className="w-3.5 h-3.5" />
                <span>View Digital ID</span>
              </button>
            </div>

            <p className="text-xs text-[var(--app-text-muted)]">
              Enrolled in {user.department} • Semester {user.semester}
            </p>

            {/* Quick Metrics */}
            <div className="pt-3 flex flex-wrap items-center justify-center sm:justify-start gap-4 text-xs font-bold">
              <span className="flex items-center gap-1.5 text-orange-500">
                <Flame className="w-4 h-4 fill-orange-500" />
                <span>{streak.count}-Day Streak</span>
              </span>
              <span className="flex items-center gap-1.5 text-[var(--accent-yellow)]">
                <Award className="w-4 h-4" />
                <span>{badges.length} Badges Unlocked</span>
              </span>
              <span className="flex items-center gap-1.5 text-[var(--accent-green)]">
                <CheckCircle2 className="w-4 h-4" />
                <span>Enrolled & Verified</span>
              </span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            ACADEMIC DETAILS & ENROLLMENT RECORDS
            ========================================================================= */}
        <div className="portal-card p-6 sm:p-8 space-y-6">
          <h3 className="portal-heading text-base text-[var(--app-text)]">
            Academic & Institutional Records
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5" /> College Institutional Email
              </span>
              <span className="font-bold text-[var(--app-text)] text-sm">{user.email}</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> Permanent Register Number
              </span>
              <span className="font-mono font-bold text-[var(--app-text)] text-sm">{user.registerNumber}</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] flex items-center gap-1.5">
                <Building className="w-3.5 h-3.5" /> Department
              </span>
              <span className="font-bold text-[var(--app-text)] text-sm">{user.department}</span>
            </div>

            <div className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-1">
              <span className="text-[10px] uppercase font-bold text-[var(--app-text-muted)] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" /> Current Academic Term
              </span>
              <span className="font-bold text-[var(--app-text)] text-sm">Semester {user.semester} (Academic Year 2025-2026)</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            BADGES GALLERY
            ========================================================================= */}
        <div className="portal-card p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="portal-heading text-base text-[var(--app-text)]">
              Earned Badges Showcase
            </h3>
            <button
              type="button"
              onClick={() => navigate('/badges')}
              className="text-xs font-bold text-[var(--accent-yellow)] hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <span>View All Badges</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className="p-4 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="font-black text-xs text-[var(--app-text)]">{b.title}</span>
                  <Award className="w-4 h-4 text-[var(--accent-yellow)]" />
                </div>
                <p className="text-[11px] text-[var(--app-text-muted)] leading-tight">
                  {b.description}
                </p>
                <div className="text-[9px] text-[var(--app-text-muted)] font-mono">
                  Earned: {b.unlockedAt || 'Sem 6'}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};
