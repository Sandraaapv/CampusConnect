import React, { useState } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import type { Badge } from '../../services/db';
import {
  Flame,
  Award,
  Lock,
  CheckCircle2,
  Calendar,
  Sparkles,
  Trophy,
  Zap,
} from 'lucide-react';

export const BadgesPage: React.FC = () => {
  const [badges] = useState<Badge[]>(() => db.getBadges());
  const streak = db.getStreak();

  const unlockedBadges = badges.filter((b) => b.unlocked);
  const lockedBadges = badges.filter((b) => !b.unlocked);

  return (
    <PortalLayout currentPath="/badges" title="Streaks & Achievement Badges">
      <div className="space-y-8">
        {/* Streak Hero Banner with Mascot */}
        <div className="portal-card p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
          <div className="space-y-4 max-w-xl text-center md:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-black text-[var(--accent-yellow)]">
              <Flame className="w-4 h-4 fill-[var(--accent-yellow)]" />
              <span>Active Attendance Streak</span>
            </div>

            <div className="flex items-baseline justify-center md:justify-start gap-3">
              <span className="font-black text-5xl sm:text-6xl text-[var(--app-text)] font-sans tracking-tight">
                {streak.count}
              </span>
              <span className="font-extrabold text-lg text-[var(--app-text-muted)]">
                Days In A Row
              </span>
            </div>

            <p className="text-xs sm:text-sm text-[var(--app-text-muted)] leading-relaxed">
              Every consecutive day you attend all timetable classes extends your streak. Reaching milestone marks automatically grants verifiable digital badges!
            </p>

            {/* Streak Progress to Next Milestone */}
            <div className="p-3 rounded-xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-[var(--accent-yellow)] shrink-0" />
                <span className="font-bold text-[var(--app-text)]">Next Milestone:</span>
                <span className="text-[var(--app-text-muted)]">{streak.nextMilestone}</span>
              </div>
              <span className="font-mono font-black text-[var(--accent-yellow)]">
                2 days away
              </span>
            </div>
          </div>

          <div className="w-36 h-36 shrink-0 flex items-center justify-center">
            <img
              src="/mascots/08-Streaks and badges.png"
              alt="Streaks and badges mascot"
              className="w-full h-full object-contain filter drop-shadow-lg"
            />
          </div>
        </div>

        {/* =========================================================================
            UNLOCKED BADGES SECTION
            ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[var(--accent-yellow)]" />
              <h3 className="portal-heading text-lg text-[var(--app-text)]">
                Unlocked Badges ({unlockedBadges.length})
              </h3>
            </div>
            <span className="text-xs font-mono font-bold text-[var(--accent-green)]">
              Verified by Spring Scheduler
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {unlockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="portal-card p-5 space-y-4 relative overflow-hidden transition-all hover:scale-[1.01] border-amber-500/30"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[var(--accent-yellow)] shadow-xs">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-500/15 text-[var(--accent-green)] border border-emerald-500/30">
                    <CheckCircle2 className="w-3 h-3" />
                    <span>Unlocked</span>
                  </span>
                </div>

                <div>
                  <h4 className="font-black text-sm text-[var(--app-text)]">
                    {badge.title}
                  </h4>
                  <p className="text-xs text-[var(--app-text-muted)] mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-[var(--app-border)] flex items-center justify-between text-[10px] text-[var(--app-text-muted)]">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    <span>Earned {badge.unlockedAt || 'Recently'}</span>
                  </span>
                  <span className="font-bold text-[var(--accent-yellow)]">Verified</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* =========================================================================
            LOCKED BADGES & ROADMAP HINTS
            ========================================================================= */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Lock className="w-4 h-4 text-[var(--app-text-muted)]" />
              <h3 className="portal-heading text-lg text-[var(--app-text-muted)]">
                Locked Milestones ({lockedBadges.length})
              </h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {lockedBadges.map((badge) => (
              <div
                key={badge.id}
                className="portal-card p-5 space-y-4 bg-[var(--app-surface-subtle)]/50 opacity-80 border-dashed border-[var(--app-border)]"
              >
                <div className="flex items-start justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] flex items-center justify-center text-[var(--app-text-muted)]">
                    <Lock className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[var(--app-surface-subtle)] text-[var(--app-text-muted)] border border-[var(--app-border)]">
                    Locked
                  </span>
                </div>

                <div>
                  <h4 className="font-extrabold text-sm text-[var(--app-text)]">
                    {badge.title}
                  </h4>
                  <p className="text-xs text-[var(--app-text-muted)] mt-1 leading-relaxed">
                    {badge.description}
                  </p>
                </div>

                <div className="p-2.5 rounded-xl bg-[var(--app-bg)] border border-[var(--app-border)] text-[10px] text-[var(--accent-yellow)] font-bold flex items-start gap-1.5">
                  <Zap className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  <span>Unlock hint: {badge.hint}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </PortalLayout>
  );
};
