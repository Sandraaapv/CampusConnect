import React from 'react';
import { PhoneMockup } from '../mockups/PhoneMockup';
import { Flame, Award, Check, Sparkles, Zap, Star, Clock } from 'lucide-react';

export const StreaksPreview: React.FC = () => {
  const daysOfWeek = [
    { day: 'M', checked: true },
    { day: 'T', checked: true },
    { day: 'W', checked: true },
    { day: 'T', checked: true },
    { day: 'F', checked: true },
  ];

  const badges = [
    {
      title: 'Perfect Week',
      desc: '100% attendance 5 days in row',
      icon: Award,
      color: 'bg-amber-100 text-amber-700 border-amber-300',
    },
    {
      title: 'Comeback Kid',
      desc: 'Recovered above 75%',
      icon: Zap,
      color: 'bg-emerald-100 text-emerald-700 border-emerald-300',
    },
    {
      title: 'Early Bird',
      desc: 'First-period attendance streak',
      icon: Clock,
      color: 'bg-indigo-100 text-indigo-700 border-indigo-300',
    },
    {
      title: 'Streak Master',
      desc: '20-day campus streak',
      icon: Star,
      color: 'bg-purple-100 text-purple-700 border-purple-300',
    },
  ];

  return (
    <PhoneMockup notchTitle="Streaks">
      <div className="p-2 text-neutral-900 font-sans space-y-1.5 text-[clamp(8px,3.2cqw,11px)]">
        {/* Streak Counter Hero Banner */}
        <div className="p-2 rounded-xl bg-gradient-to-br from-amber-500 via-orange-500 to-rose-500 text-white shadow-xs">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-1">
                <Flame className="w-3.5 h-3.5 text-amber-200 fill-amber-300" />
                <span className="text-[clamp(7.5px,3cqw,9.5px)] font-black uppercase tracking-wider text-amber-100">
                  Attendance Streak
                </span>
              </div>
              <div className="mt-0.5 flex items-baseline gap-1">
                <span className="text-[clamp(18px,7cqw,26px)] font-black tracking-tight leading-none">18</span>
                <span className="text-[clamp(8.5px,3.2cqw,11px)] font-semibold text-amber-100/90">Consecutive Days</span>
              </div>
            </div>
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center border border-white/20">
              <Sparkles className="w-3 h-3 text-white" />
            </div>
          </div>

          {/* Weekly Checkmarks */}
          <div className="mt-1.5 pt-1.5 border-t border-white/20">
            <div className="flex justify-between gap-1">
              {daysOfWeek.map((d, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-0.5">
                  <div className="w-5 h-5 rounded-md flex items-center justify-center bg-white text-orange-600 shadow-2xs">
                    <Check className="w-3 h-3 stroke-[3]" />
                  </div>
                  <span className="text-[clamp(6.5px,2.6cqw,8px)] text-white/90 font-bold">{d.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Badges Grid */}
        <div className="space-y-1">
          <span className="text-[clamp(7.5px,3cqw,9.5px)] font-extrabold text-neutral-500 uppercase tracking-wider block">
            Earned Badges
          </span>

          <div className="grid grid-cols-2 gap-1">
            {badges.map((b) => {
              const Icon = b.icon;
              return (
                <div
                  key={b.title}
                  className="p-1.5 rounded-lg border bg-white border-neutral-200 shadow-2xs"
                >
                  <div className="flex items-center gap-1 mb-0.5">
                    <div className={`w-4 h-4 rounded flex items-center justify-center border ${b.color}`}>
                      <Icon className="w-2.5 h-2.5" />
                    </div>
                    <span className="font-extrabold text-[clamp(7.5px,3cqw,9.5px)] text-neutral-900 leading-tight truncate">
                      {b.title}
                    </span>
                  </div>
                  <p className="text-[clamp(6.5px,2.6cqw,8px)] text-neutral-500 leading-tight truncate">{b.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
};
