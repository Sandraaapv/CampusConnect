import React, { useState, useEffect } from 'react';
import { PortalLayout } from '../../components/portal/PortalLayout';
import { db } from '../../services/db';
import { paymentService, PAYMENT_CONFIG } from '../../services/paymentService';
import { navigate } from '../../utils/navigation';
import {
  ArrowLeft,
  ShieldCheck,
  AlertTriangle,
  Calendar,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const FeesPayPage: React.FC = () => {
  const user = db.getUser();
  const [feeData, setFeeData] = useState(() => db.getFeeStatusSummary(user.semester));
  const [amountMode, setAmountMode] = useState<'full' | 'custom'>('full');
  const [customAmount, setCustomAmount] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [creatingOrder, setCreatingOrder] = useState(false);

  useEffect(() => {
    const summary = db.getFeeStatusSummary(user.semester);
    setFeeData(summary);
    if (summary.balanceDue <= 0) {
      navigate('/fees');
    }
  }, [user.semester]);

  const minAmount = PAYMENT_CONFIG.MIN_CUSTOM_AMOUNT;
  const maxAmount = feeData.balanceDue;

  const handleProceed = async () => {
    setError(null);
    let amountToPay = feeData.balanceDue;

    if (amountMode === 'custom') {
      const parsed = Number(customAmount);
      if (isNaN(parsed) || parsed < minAmount || parsed > maxAmount) {
        setError(`Please enter an amount between ₹${minAmount.toLocaleString()} and ₹${maxAmount.toLocaleString()}.`);
        return;
      }
      amountToPay = parsed;
    }

    setCreatingOrder(true);
    try {
      const res = await paymentService.createOrder({
        semester: feeData.semester,
        amountType: amountMode,
        customAmount: amountToPay,
      });

      if (res.success && res.order) {
        navigate(`/fees/pay/${res.order.id}`);
      } else {
        setError(res.error || 'Failed to initiate payment order.');
      }
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setCreatingOrder(false);
    }
  };

  const selectedAmount =
    amountMode === 'full'
      ? feeData.balanceDue
      : Math.min(Math.max(Number(customAmount) || 0, 0), maxAmount);

  return (
    <PortalLayout currentPath="/fees" title="Fee Payment Checkout">
      <div className="space-y-6 max-w-3xl mx-auto">
        {/* Back navigation */}
        <button
          type="button"
          onClick={() => navigate('/fees')}
          className="inline-flex items-center gap-2 text-xs font-bold text-neutral-400 hover:text-[var(--app-text)] transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Fees & Receipts</span>
        </button>

        {/* Demo Mode Persistent Banner */}
        {PAYMENT_CONFIG.PAYMENT_MODE === 'mock' && (
          <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-700 dark:text-amber-300 flex items-center gap-3 text-xs font-extrabold shadow-xs">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-500" />
            <p>
              Demo mode: no real money is charged. Do not enter real card or bank details.
            </p>
          </div>
        )}

        {/* Header */}
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-neutral-400 uppercase">
            <Lock className="w-3.5 h-3.5 text-emerald-500" />
            <span>Secure Demo Checkout · Semester {feeData.semester}</span>
          </div>
          <h1 className="font-montserrat font-black text-2xl sm:text-3xl text-[var(--app-text)] tracking-tight">
            Pay Outstanding Semester Fee
          </h1>
        </div>

        {/* Payment Amount Choice */}
        <div className="p-6 rounded-3xl bg-[var(--app-surface)] border border-[var(--app-border)] shadow-[var(--card-shadow)] space-y-6">
          <div className="space-y-3">
            <label className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider block">
              1. Choose Payment Amount
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Option A: Full Balance */}
              <button
                type="button"
                onClick={() => {
                  setAmountMode('full');
                  setError(null);
                }}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  amountMode === 'full'
                    ? 'border-[var(--btn-primary-bg)] bg-[var(--btn-primary-bg)]/5 ring-2 ring-[var(--btn-primary-bg)]'
                    : 'border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400">Pay Full Balance</span>
                  {amountMode === 'full' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                <div className="mt-2 font-montserrat font-black text-xl text-[var(--app-text)]">
                  ₹{feeData.balanceDue.toLocaleString()}
                </div>
                <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold mt-1">
                  Clears all pending dues
                </span>
              </button>

              {/* Option B: Custom Partial Amount */}
              <button
                type="button"
                onClick={() => {
                  setAmountMode('custom');
                  if (!customAmount) setCustomAmount(String(Math.min(5000, feeData.balanceDue)));
                  setError(null);
                }}
                className={`p-4 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                  amountMode === 'custom'
                    ? 'border-[var(--btn-primary-bg)] bg-[var(--btn-primary-bg)]/5 ring-2 ring-[var(--btn-primary-bg)]'
                    : 'border-[var(--app-border)] hover:bg-[var(--app-surface-subtle)]'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-neutral-400">Pay Custom Amount</span>
                  {amountMode === 'custom' && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                </div>
                <div className="mt-2 font-montserrat font-black text-xl text-[var(--app-text)]">
                  Partial Payment
                </div>
                <span className="text-[11px] text-neutral-400 font-bold mt-1">
                  Min ₹{minAmount.toLocaleString()} · Max ₹{maxAmount.toLocaleString()}
                </span>
              </button>
            </div>

            {/* Custom Amount Input Box */}
            {amountMode === 'custom' && (
              <div className="p-4 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] space-y-2 animate-in fade-in">
                <label htmlFor="custom-amount-input" className="text-xs font-bold text-[var(--app-text)] block">
                  Enter Custom Amount (₹)
                </label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-bold text-neutral-400 text-sm">
                    ₹
                  </span>
                  <input
                    id="custom-amount-input"
                    type="number"
                    min={minAmount}
                    max={maxAmount}
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setError(null);
                    }}
                    placeholder={`e.g. ${minAmount}`}
                    className="w-full pl-8 pr-4 py-2.5 rounded-xl bg-[var(--app-surface)] border border-[var(--app-border)] text-[var(--app-text)] font-montserrat font-black text-base focus:outline-none focus:ring-2 focus:ring-[var(--btn-primary-bg)]"
                  />
                </div>
                <p className="text-[11px] text-neutral-400">
                  Remaining balance after this payment: ₹
                  {Math.max(0, feeData.balanceDue - (Number(customAmount) || 0)).toLocaleString()}
                </p>
              </div>
            )}
          </div>

          {/* Breakdown Summary */}
          <div className="pt-4 border-t border-[var(--app-border)] space-y-3">
            <span className="text-xs font-mono font-bold text-neutral-400 uppercase tracking-wider block">
              2. Semester Fee Components Summary
            </span>

            <div className="divide-y divide-[var(--app-border)] text-xs">
              {feeData.breakdown.map((item) => (
                <div key={item.id} className="py-2 flex items-center justify-between">
                  <span className="text-[var(--app-text)] font-semibold">{item.component}</span>
                  <span className="font-mono font-bold text-neutral-400">
                    ₹{item.amount.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="p-3.5 rounded-2xl bg-[var(--app-surface-subtle)] border border-[var(--app-border)] flex items-center justify-between text-xs font-bold">
              <div className="flex items-center gap-2 text-neutral-400">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>Due Date: {feeData.dueDate}</span>
              </div>
              <div className="text-right">
                <span className="text-neutral-400 block text-[10px]">PAYING NOW</span>
                <span className="font-montserrat font-black text-base text-emerald-600 dark:text-emerald-400">
                  ₹{selectedAmount.toLocaleString()}
                </span>
              </div>
            </div>
          </div>

          {error && (
            <div
              role="alert"
              aria-live="polite"
              className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-bold"
            >
              {error}
            </div>
          )}

          {/* Proceed Button */}
          <button
            type="button"
            onClick={handleProceed}
            disabled={creatingOrder || selectedAmount <= 0}
            className="w-full py-3.5 rounded-full bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] font-extrabold text-sm flex items-center justify-center gap-2 hover:opacity-95 disabled:opacity-50 transition cursor-pointer shadow-md"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>
              {creatingOrder
                ? 'Creating Secure Order...'
                : `Proceed to Pay ₹${selectedAmount.toLocaleString()}`}
            </span>
          </button>
        </div>
      </div>
    </PortalLayout>
  );
};
