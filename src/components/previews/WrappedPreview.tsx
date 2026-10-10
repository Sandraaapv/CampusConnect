import React, { useState, useEffect } from 'react';
import { PhoneMockup } from '../mockups/PhoneMockup';
import { Sparkles, Trophy, Flame, TrendingUp, Share2, ChevronLeft, ChevronRight } from 'lucide-react';

export const WrappedPreview: React.FC = () => {
  const [slide, setSlide] = useState<number>(0);

  const slidesData = [
    {
      theme: 'from-purple-600 via-indigo-600 to-blue-700',
      badge: 'TOP SUBJECT',
      icon: Trophy,
      title: 'Distributed Systems',
      highlight: '96% Grade',
      detail: 'Top 1% of the entire department!',
      statLabel: 'Average',
      statVal: '72%',
    },
    {
      theme: 'from-amber-500 via-orange-600 to-rose-600',
      badge: 'ATTENDANCE HERO',
      icon: Flame,
      title: 'Longest Streak',
      highlight: '24 Days Straight',
      detail: 'Perfect attendance during midterms.',
      statLabel: 'Attended',
      statVal: '148 / 156',
    },
    {
      theme: 'from-emerald-600 via-teal-600 to-cyan-700',
      badge: 'MOST IMPROVED',
      icon: TrendingUp,
      title: 'Algorithms',
      highlight: '+14% Spike',
      detail: 'Jumped from B+ to A+ after midterms.',
      statLabel: 'Rank Shift',
      statVal: '#42 → #6',
    },
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setSlide((prev) => (prev + 1) % slidesData.length);
    }, 3200);
    return () => clearInterval(timer);
  }, [slidesData.length]);

  const current = slidesData[slide];
  const Icon = current.icon;

  return (
    <PhoneMockup notchTitle="Wrapped">
      <div className="h-full flex flex-col justify-between p-2.5 text-white font-sans relative overflow-hidden bg-neutral-900 text-[clamp(8px,3.2cqw,11px)]">
        <div className={`absolute inset-0 bg-gradient-to-br ${current.theme} transition-all duration-700 ease-out`} />

        {/* Progress Bars */}
        <div className="relative z-10 flex gap-1 pt-0.5">
          {slidesData.map((_, i) => (
            <div
              key={i}
              onClick={() => setSlide(i)}
              className="flex-1 h-0.5 rounded-full bg-white/30 cursor-pointer overflow-hidden"
            >
              <div
                className={`h-full bg-white transition-all duration-300 ${
                  i === slide ? 'w-full' : i < slide ? 'w-full' : 'w-0'
                }`}
              />
            </div>
          ))}
        </div>

        {/* Body */}
        <div className="relative z-10 my-auto py-2 space-y-1.5">
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-black/30 backdrop-blur-md text-[clamp(7px,2.6cqw,8.5px)] font-black tracking-wider text-white uppercase border border-white/20">
            <Icon className="w-2.5 h-2.5 text-amber-300" />
            <Sparkles className="w-2 h-2 text-amber-200" />
            {current.badge}
          </div>

          <div className="space-y-0.5">
            <span className="text-[clamp(8.5px,3.2cqw,10.5px)] text-white/80 font-bold block">{current.title}</span>
            <h5 className="text-[clamp(14px,5.5cqw,20px)] font-black tracking-tight leading-none text-white">
              {current.highlight}
            </h5>
          </div>

          <p className="text-[clamp(7.5px,2.8cqw,9.5px)] text-white/90 leading-tight bg-black/20 p-1.5 rounded-lg border border-white/10">
            {current.detail}
          </p>

          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white/15 border border-white/20">
            <span className="font-bold text-white/80 text-[clamp(7px,2.6cqw,8.5px)]">{current.statLabel}</span>
            <span className="font-black text-white text-[clamp(8px,3cqw,10px)] font-mono">{current.statVal}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="relative z-10 pt-1 border-t border-white/15 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSlide((prev) => (prev > 0 ? prev - 1 : slidesData.length - 1))}
              className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center cursor-pointer"
            >
              <ChevronLeft className="w-2.5 h-2.5" />
            </button>
            <button
              onClick={() => setSlide((prev) => (prev + 1) % slidesData.length)}
              className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center cursor-pointer"
            >
              <ChevronRight className="w-2.5 h-2.5" />
            </button>
          </div>

          <button className="px-2 py-0.5 bg-white text-neutral-900 rounded-full text-[clamp(7px,2.6cqw,8.5px)] font-black flex items-center gap-1 shadow-xs cursor-pointer">
            <Share2 className="w-2.5 h-2.5" /> Share
          </button>
        </div>
      </div>
    </PhoneMockup>
  );
};
