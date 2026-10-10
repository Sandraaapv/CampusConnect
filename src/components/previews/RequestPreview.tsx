import React, { useState, useRef } from 'react';
import { LaptopMockup } from '../mockups/LaptopMockup';
import {
  Check,
  Clock,
  UserCheck,
  ShieldCheck,
  RotateCcw,
  Download,
  BookOpen,
  Home,
  CreditCard,
  Cpu,
  FileText,
  CheckCircle2,
} from 'lucide-react';
import gsap from 'gsap';

export const RequestPreview: React.FC = () => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const tabs = [
    { id: 0, label: 'No-dues' },
    { id: 1, label: 'OD letter' },
    { id: 2, label: 'Scholarship' },
    { id: 3, label: 'Event' },
  ];

  // Animation for individual panel
  const playPanelAnimation = (tabIndex: number) => {
    if (!containerRef.current) return;
    const el = containerRef.current;

    if (tabIndex === 0) {
      const stamps = el.querySelectorAll('.nodues-stamp');
      const finalStamp = el.querySelector('.nodues-final-stamp');
      const dlBtn = el.querySelector('.nodues-download-btn');

      gsap.killTweensOf([stamps, finalStamp, dlBtn]);
      gsap.set(stamps, { opacity: 0, scale: 1.3 });
      gsap.set(finalStamp, { opacity: 0, scale: 1.3, rotate: -8 });
      gsap.set(dlBtn, { opacity: 0 });

      const tl = gsap.timeline();
      tl.to(stamps, {
        opacity: 1,
        scale: 1,
        duration: 0.25,
        stagger: 0.15,
        ease: 'back.out(1.4)',
      })
        .to(
          finalStamp,
          {
            opacity: 1,
            scale: 1,
            rotate: -8,
            duration: 0.35,
            ease: 'back.out(1.5)',
          },
          '+=0.1'
        )
        .to(dlBtn, { opacity: 1, duration: 0.25 }, '-=0.1');
    } else {
      const panel = el.querySelector(`.req-panel-${tabIndex}`);
      if (!panel) return;
      const stepNodes = panel.querySelectorAll('.step-circle');
      const line = panel.querySelector('.step-line-fill');
      const remark = panel.querySelector('.panel-remark');

      gsap.killTweensOf([stepNodes, line, remark]);
      gsap.set(stepNodes, { opacity: 0.4, scale: 0.9 });
      gsap.set(line, { width: '0%' });
      gsap.set(remark, { opacity: 0, y: 5 });

      const tl = gsap.timeline();
      tl.to(line, { width: '100%', duration: 0.6, ease: 'power1.inOut' })
        .to(stepNodes, { opacity: 1, scale: 1, duration: 0.2, stagger: 0.12 }, 0)
        .to(remark, { opacity: 1, y: 0, duration: 0.3 }, '-=0.1');
    }
  };

  const handleReplay = () => {
    playPanelAnimation(activeTab);
  };

  const handleTabClick = (tabIdx: number) => {
    setActiveTab(tabIdx);
    if (!containerRef.current) return;
    const el = containerRef.current;

    // Instantly show selected panel without breaking GSAP scrub
    const panels = el.querySelectorAll<HTMLElement>('.request-panel');
    panels.forEach((p, idx) => {
      if (idx === tabIdx) {
        gsap.to(p, { opacity: 1, duration: 0.25, overwrite: 'auto' });
        p.style.pointerEvents = 'auto';
      } else {
        gsap.to(p, { opacity: 0, duration: 0.25, overwrite: 'auto' });
        p.style.pointerEvents = 'none';
      }
    });

    // Update active tab buttons visual state
    const chips = el.querySelectorAll<HTMLElement>('.request-tab-chip');
    chips.forEach((c, idx) => {
      if (idx === tabIdx) {
        c.classList.add('bg-neutral-900', 'text-white', 'shadow-2xs');
        c.classList.remove('bg-neutral-100', 'text-neutral-600');
        c.style.backgroundColor = '#171717';
        c.style.color = '#ffffff';
      } else {
        c.classList.remove('bg-neutral-900', 'text-white', 'shadow-2xs');
        c.classList.add('bg-neutral-100', 'text-neutral-600');
        c.style.backgroundColor = '#f5f5f5';
        c.style.color = '#525252';
      }
    });

    playPanelAnimation(tabIdx);
  };

  return (
    <LaptopMockup>
      <div
        ref={containerRef}
        className="request-tracker-wrapper p-2 text-neutral-900 font-sans text-[clamp(8px,2.4cqw,11px)] bg-[#fdfdfd] flex flex-col justify-between h-full relative overflow-hidden select-none"
      >
        {/* Top Chips Row & Replay Button */}
        <div className="flex items-center justify-between gap-1 pb-1 border-b border-neutral-200 shrink-0">
          <div className="flex items-center gap-1 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                type="button"
                data-tab-index={tab.id}
                onClick={() => handleTabClick(tab.id)}
                className={`request-tab-chip px-1.5 py-0.5 rounded-full text-[clamp(7px,2cqw,8.5px)] font-bold transition-all cursor-pointer whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-neutral-900 text-white shadow-2xs'
                    : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleReplay}
            className="text-[clamp(7px,2cqw,8.5px)] font-bold text-neutral-500 hover:text-neutral-900 flex items-center gap-0.5 bg-neutral-100 hover:bg-neutral-200 px-1.5 py-0.5 rounded transition cursor-pointer shrink-0"
            title="Replay animation"
          >
            <RotateCcw className="w-2.5 h-2.5" /> Replay
          </button>
        </div>

        {/* Content Area containing the 4 Request Types */}
        <div className="relative flex-1 mt-1 overflow-hidden min-h-[92px]">
          {/* ========================================================
              PANEL 0: No-Dues Clearance (Hero Example)
             ======================================================== */}
          <div
            className="request-panel req-panel-0 absolute inset-0 flex flex-col justify-between"
            style={{
              opacity: activeTab === 0 ? 1 : 0,
              pointerEvents: activeTab === 0 ? 'auto' : 'none',
              willChange: 'transform, opacity',
            }}
          >
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[clamp(8.5px,2.6cqw,11.5px)] text-neutral-900 tracking-tight">
                  No-Dues Clearance
                </span>
                <span className="text-[clamp(6.5px,1.9cqw,8px)] font-mono text-neutral-500 bg-neutral-100 px-1 py-0.2 rounded border border-neutral-200">
                  #ND-8842
                </span>
              </div>
              <span className="text-[clamp(6.5px,1.9cqw,8px)] text-neutral-500 font-medium">
                Anonymous &bull; 21CS042
              </span>
            </div>

            {/* Parallel row of four department nodes */}
            <div className="grid grid-cols-4 gap-1 my-auto">
              {/* Library */}
              <div className="p-1 rounded-md bg-white border border-neutral-200/90 flex flex-col items-center justify-between shadow-2xs h-[46px]">
                <div className="flex items-center gap-0.5 text-neutral-600">
                  <BookOpen className="w-2.5 h-2.5 text-neutral-500" />
                  <span className="font-bold text-[clamp(7px,2cqw,8.5px)]">Library</span>
                </div>
                <span className="nodues-stamp nodues-stamp-0 border border-emerald-600 border-dashed rounded px-1 py-0.2 text-[clamp(6px,1.8cqw,7.5px)] font-black text-emerald-700 bg-emerald-50 tracking-wider uppercase inline-block">
                  CLEARED
                </span>
              </div>

              {/* Hostel */}
              <div className="p-1 rounded-md bg-white border border-neutral-200/90 flex flex-col items-center justify-between shadow-2xs h-[46px]">
                <div className="flex items-center gap-0.5 text-neutral-600">
                  <Home className="w-2.5 h-2.5 text-neutral-500" />
                  <span className="font-bold text-[clamp(7px,2cqw,8.5px)]">Hostel</span>
                </div>
                <span className="nodues-stamp nodues-stamp-1 border border-emerald-600 border-dashed rounded px-1 py-0.2 text-[clamp(6px,1.8cqw,7.5px)] font-black text-emerald-700 bg-emerald-50 tracking-wider uppercase inline-block">
                  CLEARED
                </span>
              </div>

              {/* Accounts */}
              <div className="p-1 rounded-md bg-white border border-neutral-200/90 flex flex-col items-center justify-between shadow-2xs h-[46px]">
                <div className="flex items-center gap-0.5 text-neutral-600">
                  <CreditCard className="w-2.5 h-2.5 text-neutral-500" />
                  <span className="font-bold text-[clamp(7px,2cqw,8.5px)]">Accounts</span>
                </div>
                <span className="nodues-stamp nodues-stamp-2 border border-emerald-600 border-dashed rounded px-1 py-0.2 text-[clamp(6px,1.8cqw,7.5px)] font-black text-emerald-700 bg-emerald-50 tracking-wider uppercase inline-block">
                  CLEARED
                </span>
              </div>

              {/* Labs */}
              <div className="p-1 rounded-md bg-white border border-neutral-200/90 flex flex-col items-center justify-between shadow-2xs h-[46px]">
                <div className="flex items-center gap-0.5 text-neutral-600">
                  <Cpu className="w-2.5 h-2.5 text-neutral-500" />
                  <span className="font-bold text-[clamp(7px,2cqw,8.5px)]">Labs</span>
                </div>
                <span className="nodues-stamp nodues-stamp-3 border border-emerald-600 border-dashed rounded px-1 py-0.2 text-[clamp(6px,1.8cqw,7.5px)] font-black text-emerald-700 bg-emerald-50 tracking-wider uppercase inline-block">
                  CLEARED
                </span>
              </div>
            </div>

            {/* Comment Line & Download Button */}
            <div className="p-1 rounded-md bg-neutral-50 border border-neutral-200/80 flex items-center justify-between shrink-0">
              <span className="text-[clamp(6.5px,1.9cqw,8px)] font-medium text-neutral-700 truncate flex items-center gap-1">
                <Check className="w-2.5 h-2.5 text-emerald-600" /> All departments cleared.
              </span>
              <button
                type="button"
                className="nodues-download-btn px-2 py-0.5 bg-neutral-900 text-white text-[clamp(6.5px,1.9cqw,8px)] font-bold rounded flex items-center gap-1 shadow-2xs cursor-pointer"
              >
                <Download className="w-2.5 h-2.5" /> Download PDF
              </button>
            </div>

            {/* Final Prominent Stamp Overlay */}
            <div className="nodues-final-stamp absolute right-2 top-[32%] pointer-events-none z-20">
              <div className="border-2 border-emerald-600 border-dashed rounded-md px-2 py-0.5 text-center bg-emerald-50/95 shadow-md">
                <span className="text-[clamp(9.5px,3cqw,12.5px)] font-black tracking-wider text-emerald-700 uppercase block leading-none">
                  NO-DUES APPROVED
                </span>
              </div>
            </div>
          </div>

          {/* ========================================================
              PANEL 1: OD Letter
             ======================================================== */}
          <div
            className="request-panel req-panel-1 absolute inset-0 flex flex-col justify-between"
            style={{
              opacity: activeTab === 1 ? 1 : 0,
              pointerEvents: activeTab === 1 ? 'auto' : 'none',
              willChange: 'transform, opacity',
            }}
          >
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[clamp(8.5px,2.6cqw,11.5px)] text-neutral-900 tracking-tight">
                  On-Duty Letter
                </span>
                <span className="text-[clamp(6.5px,1.9cqw,8px)] font-mono text-neutral-500 bg-neutral-100 px-1 py-0.2 rounded border border-neutral-200">
                  #OD-4019
                </span>
              </div>
              <span className="text-[clamp(6.5px,1.9cqw,8px)] text-indigo-700 bg-indigo-50 px-1 py-0.2 rounded border border-indigo-200 font-bold">
                Hackathon (2 Days)
              </span>
            </div>

            {/* Steps: Submitted -> Faculty -> HOD -> Approved */}
            <div className="py-1 px-2 relative my-auto">
              <div className="grid grid-cols-4 gap-1 relative">
                <div className="absolute top-2.5 left-3 right-3 h-0.5 bg-neutral-200 -z-0">
                  <div className="step-line-fill h-full bg-emerald-500 rounded-full w-full" />
                </div>

                {[
                  { label: 'Submitted', icon: Clock },
                  { label: 'Faculty', icon: UserCheck },
                  { label: 'HOD', icon: ShieldCheck },
                  { label: 'Approved', icon: Check },
                ].map((st) => {
                  const Icon = st.icon;
                  return (
                    <div key={st.label} className="flex flex-col items-center text-center relative z-10">
                      <div className="step-circle w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500 text-white shadow-2xs">
                        <Icon className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[clamp(7px,2cqw,8.5px)] mt-0.5 font-bold text-neutral-800 leading-tight">
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Attendance update remark */}
            <div className="panel-remark p-1 rounded-md bg-neutral-50 border border-neutral-200/80 flex items-center justify-between shrink-0">
              <span className="text-[clamp(6.5px,1.9cqw,8px)] font-medium text-neutral-700 truncate">
                Attendance updated: 2 days marked On-Duty.
              </span>
              <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200 font-mono text-[clamp(6.5px,1.9cqw,8px)] whitespace-nowrap">
                82.4% &rarr; 84.8% &uarr;
              </span>
            </div>
          </div>

          {/* ========================================================
              PANEL 2: Scholarship / Fee Concession
             ======================================================== */}
          <div
            className="request-panel req-panel-2 absolute inset-0 flex flex-col justify-between"
            style={{
              opacity: activeTab === 2 ? 1 : 0,
              pointerEvents: activeTab === 2 ? 'auto' : 'none',
              willChange: 'transform, opacity',
            }}
          >
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[clamp(8.5px,2.6cqw,11.5px)] text-neutral-900 tracking-tight">
                  Fee Concession
                </span>
                <span className="text-[clamp(6.5px,1.9cqw,8px)] font-mono text-neutral-500 bg-neutral-100 px-1 py-0.2 rounded border border-neutral-200">
                  #FC-2210
                </span>
              </div>
              <span className="text-[clamp(6.5px,1.9cqw,8px)] text-amber-700 bg-amber-50 px-1 py-0.2 rounded border border-amber-200 font-bold">
                Merit &amp; Need Concession
              </span>
            </div>

            {/* Steps: Submitted -> Doc Check -> Admin -> Decision (Approved) */}
            <div className="py-1 px-2 relative my-auto">
              <div className="grid grid-cols-4 gap-1 relative">
                <div className="absolute top-2.5 left-3 right-3 h-0.5 bg-neutral-200 -z-0">
                  <div className="step-line-fill h-full bg-emerald-500 rounded-full w-full" />
                </div>

                {[
                  { label: 'Submitted', icon: Clock },
                  { label: 'Doc Check', icon: FileText },
                  { label: 'Admin', icon: ShieldCheck },
                  { label: 'Approved', icon: CheckCircle2 },
                ].map((st) => {
                  const Icon = st.icon;
                  return (
                    <div key={st.label} className="flex flex-col items-center text-center relative z-10">
                      <div className="step-circle w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500 text-white shadow-2xs">
                        <Icon className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[clamp(7px,2cqw,8.5px)] mt-0.5 font-bold text-neutral-800 leading-tight">
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comment Line */}
            <div className="panel-remark p-1 rounded-md bg-neutral-50 border border-neutral-200/80 flex items-center justify-between shrink-0">
              <span className="text-[clamp(6.5px,1.9cqw,8px)] font-medium text-neutral-700 truncate">
                Income certificate verified. Concession approved.
              </span>
              <span className="px-1.5 py-0.2 bg-emerald-600 text-white font-bold text-[clamp(6.5px,1.9cqw,8px)] rounded whitespace-nowrap">
                Approved
              </span>
            </div>
          </div>

          {/* ========================================================
              PANEL 3: Event Permission
             ======================================================== */}
          <div
            className="request-panel req-panel-3 absolute inset-0 flex flex-col justify-between"
            style={{
              opacity: activeTab === 3 ? 1 : 0,
              pointerEvents: activeTab === 3 ? 'auto' : 'none',
              willChange: 'transform, opacity',
            }}
          >
            {/* Header info */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-[clamp(8.5px,2.6cqw,11.5px)] text-neutral-900 tracking-tight">
                  Event Permission
                </span>
                <span className="text-[clamp(6.5px,1.9cqw,8px)] font-mono text-neutral-500 bg-neutral-100 px-1 py-0.2 rounded border border-neutral-200">
                  #EV-9104
                </span>
              </div>
              <span className="text-[clamp(6.5px,1.9cqw,8px)] text-purple-700 bg-purple-50 px-1 py-0.2 rounded border border-purple-200 font-bold truncate max-w-[120px]">
                ACM Chapter &bull; HackFest
              </span>
            </div>

            {/* Steps: Submitted -> Faculty -> Admin -> Approved */}
            <div className="py-1 px-2 relative my-auto">
              <div className="grid grid-cols-4 gap-1 relative">
                <div className="absolute top-2.5 left-3 right-3 h-0.5 bg-neutral-200 -z-0">
                  <div className="step-line-fill h-full bg-emerald-500 rounded-full w-full" />
                </div>

                {[
                  { label: 'Submitted', icon: Clock },
                  { label: 'Faculty', icon: UserCheck },
                  { label: 'Admin', icon: ShieldCheck },
                  { label: 'Approved', icon: Check },
                ].map((st) => {
                  const Icon = st.icon;
                  return (
                    <div key={st.label} className="flex flex-col items-center text-center relative z-10">
                      <div className="step-circle w-5 h-5 rounded-full flex items-center justify-center bg-emerald-500 text-white shadow-2xs">
                        <Icon className="w-2.5 h-2.5" />
                      </div>
                      <span className="text-[clamp(7px,2cqw,8.5px)] mt-0.5 font-bold text-neutral-800 leading-tight">
                        {st.label}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Comment Line */}
            <div className="panel-remark p-1 rounded-md bg-neutral-50 border border-neutral-200/80 flex items-center justify-between shrink-0">
              <span className="text-[clamp(6.5px,1.9cqw,8px)] font-medium text-neutral-700 truncate">
                Venue and date confirmed.
              </span>
              <span className="px-1.5 py-0.2 bg-purple-50 text-purple-700 border border-purple-200 font-bold text-[clamp(6.5px,1.9cqw,8px)] rounded whitespace-nowrap">
                Auditorium Booked
              </span>
            </div>
          </div>
        </div>
      </div>
    </LaptopMockup>
  );
};
