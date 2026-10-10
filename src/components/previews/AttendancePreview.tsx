import React, { useState } from 'react';
import { PhoneMockup } from '../mockups/PhoneMockup';
import { ShieldCheck, AlertTriangle } from 'lucide-react';

export const AttendancePreview: React.FC = () => {
  // Interactive what-if slider state for selected subject DBMS
  const [extraAbsences, setExtraAbsences] = useState<number>(2);

  // Subject baseline
  const attended = 32;
  const initialTotal = 38;

  // With extra missed classes:
  const currentTotal = initialTotal + extraAbsences;
  const currentPct = Math.round((attended / currentTotal) * 1000) / 10;

  // Formulas from brief:
  // safe buffer = floor(attended / 0.75 - currentTotal)
  // recovery classes = ceil(3 * currentTotal - 4 * attended)
  const safeBuffer = Math.floor(attended / 0.75 - currentTotal);
  const recoveryClasses = Math.max(0, Math.ceil(3 * currentTotal - 4 * attended));
  const isSafe = currentPct >= 75.0;

  return (
    <PhoneMockup notchTitle="Attendance">
      <div className="p-2 text-neutral-900 font-sans space-y-1.5 text-[clamp(9px,3.8cqw,12px)] leading-tight">
        {/* Top Header */}
        <div className="flex items-center justify-between pb-1 border-b border-neutral-200">
          <div>
            <h5 className="font-extrabold text-[clamp(10px,4.2cqw,13px)] text-neutral-900 leading-tight">
              Attendance Calculator
            </h5>
            <p className="text-[clamp(7.5px,3cqw,10px)] text-neutral-500">Live 75% policy forecasting</p>
          </div>
          <span className="text-[clamp(7.5px,3.2cqw,9px)] font-black px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
            82.4%
          </span>
        </div>

        {/* What-if interactive card */}
        <div className="p-2 rounded-xl bg-white border border-neutral-300 shadow-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-neutral-800 text-[clamp(9px,3.6cqw,11px)]">DBMS &bull; CS302</span>
            <span
              className={`font-black px-1.5 py-0.2 rounded text-[clamp(9px,3.8cqw,11px)] ${
                isSafe ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'
              }`}
            >
              {currentPct.toFixed(1)}%
            </span>
          </div>

          {/* Progress bar */}
          <div className="space-y-0.5">
            <div className="w-full h-2 bg-neutral-200 rounded-full overflow-hidden relative">
              <div className="absolute left-[75%] top-0 bottom-0 w-[1.5px] bg-red-400 z-10" />
              <div
                className={`h-full transition-all duration-300 rounded-full ${
                  isSafe ? 'bg-emerald-500' : 'bg-rose-500'
                }`}
                style={{ width: `${Math.min(100, currentPct)}%` }}
              />
            </div>
            <div className="flex justify-between text-[clamp(7px,2.8cqw,9px)] text-neutral-600 font-semibold">
              <span>{attended} attended / {currentTotal} total</span>
              <span>75% target</span>
            </div>
          </div>

          {/* Slider input */}
          <div className="bg-neutral-50 p-1.5 rounded-lg border border-neutral-200/80 space-y-0.5">
            <div className="flex justify-between font-bold text-neutral-700 text-[clamp(8px,3.2cqw,10px)]">
              <label htmlFor="absence-slider" className="cursor-pointer">If classes missed:</label>
              <span className="font-black text-indigo-600 px-1 py-0.2 bg-indigo-50 rounded">
                +{extraAbsences} {extraAbsences === 1 ? 'class' : 'classes'}
              </span>
            </div>
            <input
              id="absence-slider"
              type="range"
              min="0"
              max="8"
              value={extraAbsences}
              onChange={(e) => setExtraAbsences(parseInt(e.target.value, 10))}
              aria-label="Attendance what-if simulator slider"
              className="w-full h-1 bg-neutral-200 rounded-lg cursor-pointer"
            />
          </div>

          {/* Verdict banner */}
          <div
            className={`p-1.5 rounded-lg flex items-center gap-1.5 font-bold text-[clamp(8px,3.2cqw,10px)] ${
              isSafe
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                : 'bg-rose-50 text-rose-800 border border-rose-200'
            }`}
          >
            {isSafe ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Safe buffer: <span className="underline font-black">{Math.max(0, safeBuffer)}</span> classes left</span>
              </>
            ) : (
              <>
                <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>Need <span className="underline font-black">{recoveryClasses}</span> in a row to recover</span>
              </>
            )}
          </div>
        </div>

        {/* Other subject quick list */}
        <div className="space-y-1">
          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-neutral-200">
            <div>
              <span className="font-bold block text-neutral-800 text-[clamp(8.5px,3.4cqw,10px)]">Computer Networks</span>
              <span className="text-[clamp(7px,2.8cqw,8.5px)] text-neutral-400">28 / 32 classes</span>
            </div>
            <div className="text-right">
              <span className="font-black text-emerald-600 text-[clamp(9px,3.6cqw,11px)]">87.5%</span>
              <span className="text-[clamp(7px,2.8cqw,8.5px)] text-emerald-600 block">5 classes buffer</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-1.5 rounded-lg bg-white border border-rose-200">
            <div>
              <span className="font-bold block text-neutral-800 text-[clamp(8.5px,3.4cqw,10px)]">Operating Systems</span>
              <span className="text-[clamp(7px,2.8cqw,8.5px)] text-neutral-400">25 / 35 classes</span>
            </div>
            <div className="text-right">
              <span className="font-black text-rose-600 text-[clamp(9px,3.6cqw,11px)]">71.4%</span>
              <span className="text-[clamp(7px,2.8cqw,8.5px)] text-rose-600 block">Attend 5 in a row</span>
            </div>
          </div>
        </div>
      </div>
    </PhoneMockup>
  );
};
