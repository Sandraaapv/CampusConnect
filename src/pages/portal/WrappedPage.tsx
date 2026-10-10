import React, { useState, useEffect, useRef } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import {
  ChevronLeft,
  ChevronRight,
  Download,
  Trophy,
  Flame,
  Award,
  TrendingUp,
  GraduationCap,
  CalendarCheck,
} from 'lucide-react';

export const WrappedPage: React.FC = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const cardRef = useRef<HTMLDivElement>(null);
  const user = db.getUser();
  const badges = db.getBadges().filter((b) => b.unlocked);

  const slides = [
    {
      title: 'SEMESTER 6 WRAPPED',
      subtitle: `The Numbers Behind Aarav's Semester`,
      highlight: 'A semester of resilience and high performance.',
      icon: Trophy,
      mascot: '/mascots/10-Semester wrapped.png',
      statLabel: 'ACADEMIC HEALTH',
      statValue: 'Top 5%',
      statDesc: 'Among all CSE batchmates',
      accentColor: '#f5b800',
    },
    {
      title: 'STAR SUBJECT',
      subtitle: 'Database Management Systems (DBMS)',
      highlight: '94% attendance and 48/50 internal marks.',
      icon: GraduationCap,
      mascot: '/mascots/04-Marks predictor.png',
      statLabel: 'INTERNAL SCORE',
      statValue: '48 / 50',
      statDesc: 'Rank 1 in lab assessments',
      accentColor: '#00c98d',
    },
    {
      title: 'LONGEST STREAK',
      subtitle: 'Showing Up When It Counted',
      highlight: '18 consecutive lecture days with zero absences.',
      icon: Flame,
      mascot: '/mascots/08-Streaks and badges.png',
      statLabel: 'ATTENDANCE STREAK',
      statValue: '18 Days',
      statDesc: 'Unlocked Streak Master tier',
      accentColor: '#ff8fa3',
    },
    {
      title: 'CLASSROOM DEDICATION',
      subtitle: 'Total Lectures Attended',
      highlight: '248 total hours spent mastering engineering modules.',
      icon: CalendarCheck,
      mascot: '/mascots/03-Attendance calculator.png',
      statLabel: 'OVERALL ATTENDANCE',
      statValue: '88.5%',
      statDesc: 'Comfortably above the 75% bar',
      accentColor: '#38bdf8',
    },
    {
      title: 'BIGGEST IMPROVEMENT',
      subtitle: 'Design & Analysis of Algorithms',
      highlight: 'Surged from 28/50 in mid-term 1 to 44/50 in model exams.',
      icon: TrendingUp,
      mascot: '/mascots/02-Smart dashboard.png',
      statLabel: 'MARK SURGE',
      statValue: '+16 Marks',
      statDesc: 'Largest comeback this semester',
      accentColor: '#f5b800',
    },
    {
      title: 'BADGES EARNED',
      subtitle: `${badges.length} Official Milestone Badges`,
      highlight: badges.map((b) => b.title).join(' • '),
      icon: Award,
      mascot: '/mascots/01-welcome.png',
      statLabel: 'VERIFIED BADGES',
      statValue: `${badges.length} Badges`,
      statDesc: 'Perfect Week • Comeback Kid',
      accentColor: '#00c98d',
    },
  ];

  const handleNext = () => {
    setCurrentSlide((prev) => (prev < slides.length - 1 ? prev + 1 : 0));
  };

  const handlePrev = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : slides.length - 1));
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowRight' || e.key === ' ') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const current = slides[currentSlide];
  const CurrentIcon = current.icon;

  return (
    <PortalLayout currentPath="/wrapped" title="Semester Wrapped">
      <div className="max-w-xl mx-auto space-y-6">
        {/* Progress Bar (Instagram / Spotify story style) */}
        <div className="flex items-center gap-1.5 px-2">
          {slides.map((_, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className="flex-1 h-1.5 rounded-full overflow-hidden bg-neutral-300 dark:bg-neutral-800 transition cursor-pointer"
              aria-label={`Go to slide ${idx + 1}`}
            >
              <div
                className={`h-full transition-all duration-300 ${
                  idx === currentSlide
                    ? 'bg-amber-400 w-full'
                    : idx < currentSlide
                    ? 'bg-neutral-500 w-full'
                    : 'w-0'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Story Card Viewport — Always Dark Style as per spec */}
        <div
          ref={cardRef}
          className="relative w-full aspect-[9/14] sm:aspect-[4/5] rounded-3xl bg-neutral-950 text-white border border-neutral-800 p-6 sm:p-8 flex flex-col justify-between overflow-hidden shadow-2xl selection:bg-amber-400 selection:text-black transition-all"
          style={{
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
          }}
        >
          {/* Subtle Background Glow Accent */}
          <div
            className="absolute -top-24 -right-24 w-72 h-72 rounded-full opacity-20 blur-3xl pointer-events-none transition-colors duration-500"
            style={{ backgroundColor: current.accentColor }}
          />

          {/* Top Row: CC branding & Slide counter */}
          <div className="flex items-center justify-between z-10">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-amber-400 text-black font-black text-xs flex items-center justify-center">
                cc
              </div>
              <span className="font-montserrat font-black text-xs tracking-wider uppercase text-white/90">
                CAMPUSCONNECT WRAPPED
              </span>
            </div>

            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-neutral-400">
                {currentSlide + 1} / {slides.length}
              </span>
              <CurrentIcon className="w-4 h-4 text-amber-300" />
            </div>
          </div>

          {/* Center Mascot & Big Stat Display */}
          <div className="flex flex-col items-center text-center my-auto space-y-4 z-10">
            {/* Mascot Image */}
            <div className="w-28 h-28 sm:w-36 sm:h-36 relative animate-scale-in">
              <img
                src={current.mascot}
                alt={current.title}
                className="w-full h-full object-contain filter drop-shadow-xl"
              />
            </div>

            {/* Stat Box */}
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-neutral-400">
                {current.statLabel}
              </span>
              <div
                className="font-montserrat font-black text-4xl sm:text-5xl tracking-tight"
                style={{ color: current.accentColor }}
              >
                {current.statValue}
              </div>
              <p className="text-xs text-neutral-300 font-bold">
                {current.statDesc}
              </p>
            </div>

            {/* Title & Narrative */}
            <div className="space-y-1 max-w-sm">
              <h3 className="font-montserrat font-black text-lg sm:text-xl tracking-tight text-white uppercase">
                {current.title}
              </h3>
              <p className="text-xs text-neutral-400 font-medium">
                {current.subtitle}
              </p>
              <p className="text-xs text-neutral-200 font-bold pt-1">
                {current.highlight}
              </p>
            </div>
          </div>

          {/* Bottom Card Footer: Student Tag */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between z-10 text-[10px] text-neutral-400">
            <div>
              <span className="font-bold text-white block">{user.name}</span>
              <span className="font-mono">{user.registerNumber} • {user.department}</span>
            </div>
            <span className="font-bold text-amber-400 uppercase tracking-widest">
              SEM 6 EDITION
            </span>
          </div>
        </div>

        {/* Carousel Navigation Controls */}
        <div className="flex items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={handlePrev}
            className="p-3 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)] transition cursor-pointer"
            aria-label="Previous story"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => window.print()}
              className="px-5 py-2.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-xs flex items-center gap-2 cursor-pointer shadow-xs hover:opacity-90"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Save Story Card</span>
            </button>
          </div>

          <button
            type="button"
            onClick={handleNext}
            className="p-3 rounded-full border border-[var(--app-border)] bg-[var(--app-surface)] text-[var(--app-text)] hover:bg-[var(--app-surface-subtle)] transition cursor-pointer"
            aria-label="Next story"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </PortalLayout>
  );
};
