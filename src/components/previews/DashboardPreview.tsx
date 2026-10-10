import React from 'react';
import { LaptopMockup } from '../mockups/LaptopMockup';
import { AlertCircle, Clock, BookOpen, Layers } from 'lucide-react';

export const DashboardPreview: React.FC = () => {
  return (
    <LaptopMockup>
      <div className="flex h-full text-[clamp(8px,2.5cqw,11px)] font-sans bg-[#fbfbfb]">
        {/* Slim Mini Sidebar */}
        <div className="w-[12cqw] min-w-[28px] max-w-[40px] bg-[#16171d] text-neutral-400 flex flex-col items-center py-2 space-y-2 shrink-0 border-r border-neutral-800">
          <div className="w-5 h-5 rounded bg-indigo-600 text-white font-black flex items-center justify-center text-[10px] shadow-xs">
            CC
          </div>
          <div className="w-5 h-5 rounded bg-neutral-800 text-white flex items-center justify-center">
            <Layers className="w-3 h-3 text-indigo-400" />
          </div>
          <div className="w-5 h-5 rounded hover:bg-neutral-800/60 flex items-center justify-center text-neutral-400">
            <BookOpen className="w-3 h-3" />
          </div>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-2 overflow-hidden flex flex-col justify-between">
          {/* Header */}
          <div className="flex items-center justify-between pb-1 border-b border-neutral-200 shrink-0">
            <div>
              <h4 className="font-extrabold text-[clamp(9px,2.8cqw,12px)] text-neutral-900 tracking-tight leading-tight">
                Smart Feed
              </h4>
              <p className="text-[clamp(7px,2cqw,9px)] text-neutral-500">Sorted by urgency algorithm</p>
            </div>
            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[clamp(6.5px,2cqw,8.5px)] font-bold uppercase tracking-wider bg-rose-50 text-rose-700 border border-rose-200">
              Critical
            </span>
          </div>

          {/* Urgent Items Stack */}
          <div className="space-y-1 my-1">
            {/* Urgent Red */}
            <div className="flex items-start gap-1.5 p-1.5 rounded-lg bg-red-50/90 border border-red-200 text-neutral-900 shadow-2xs">
              <span className="p-0.5 rounded bg-red-500 text-white shrink-0 mt-0.5">
                <AlertCircle className="w-2.5 h-2.5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[clamp(8px,2.4cqw,10.5px)] text-red-950 truncate">
                    Operating Systems &bull; 71.4%
                  </span>
                  <span className="text-[clamp(6.5px,2cqw,8.5px)] font-bold uppercase tracking-wider text-red-600 bg-red-100 px-1 rounded">
                    High Risk
                  </span>
                </div>
                <p className="text-[clamp(7px,2.1cqw,9px)] text-red-800 leading-tight mt-0.5 truncate">
                  Below 75%. Attend next 2 consecutive classes to recover safely.
                </p>
              </div>
            </div>

            {/* Warning Amber */}
            <div className="flex items-start gap-1.5 p-1.5 rounded-lg bg-amber-50/90 border border-amber-200 text-neutral-900 shadow-2xs">
              <span className="p-0.5 rounded bg-amber-500 text-white shrink-0 mt-0.5">
                <Clock className="w-2.5 h-2.5" />
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-[clamp(8px,2.4cqw,10.5px)] text-amber-950 truncate">
                    Compilers Lab 04 &bull; Due Tomorrow
                  </span>
                  <span className="text-[clamp(6.5px,2cqw,8.5px)] font-bold text-amber-700 bg-amber-100 px-1 rounded">
                    24h
                  </span>
                </div>
                <p className="text-[clamp(7px,2.1cqw,9px)] text-amber-800 leading-tight mt-0.5 truncate">
                  Closes Oct 11, 11:59 PM. Code + AST test report.
                </p>
              </div>
            </div>
          </div>

          {/* Today's Schedule Mini Bar */}
          <div className="pt-1 border-t border-neutral-200 shrink-0">
            <div className="flex items-center justify-between text-[clamp(7.5px,2.2cqw,9.5px)] font-bold text-neutral-700 mb-0.5">
              <span>Today's Classes</span>
              <span className="text-[clamp(6.5px,2cqw,8px)] text-neutral-400">Wednesday</span>
            </div>
            <div className="grid grid-cols-3 gap-1 text-[clamp(7px,2cqw,9px)]">
              <div className="p-1 rounded bg-white border-l-2 border-emerald-500 border border-neutral-200 shadow-2xs truncate">
                <span className="text-[7px] text-emerald-600 font-bold block">09:00</span>
                <span className="font-bold text-neutral-800 truncate block">DBMS</span>
              </div>
              <div className="p-1 rounded bg-white border-l-2 border-indigo-500 border border-neutral-200 shadow-2xs truncate">
                <span className="text-[7px] text-indigo-600 font-bold block">10:15</span>
                <span className="font-bold text-neutral-800 truncate block">Networks</span>
              </div>
              <div className="p-1 rounded bg-white border-l-2 border-neutral-400 border border-neutral-200 shadow-2xs truncate">
                <span className="text-[7px] text-neutral-500 font-bold block">11:30</span>
                <span className="font-bold text-neutral-800 truncate block">Software Eng</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LaptopMockup>
  );
};
